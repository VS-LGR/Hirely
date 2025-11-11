import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      location,
      type,
      remote,
      tag_ids,
    } = req.body

    if (!title || !description) {
      throw createError('Título e descrição são obrigatórios', 400)
    }

    // Iniciar transação
    await db.query('BEGIN')

    try {
      const result = await db.query(
        `INSERT INTO jobs (
          recruiter_id, title, description, requirements,
          salary_min, salary_max, location, type, remote, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING *`,
        [
          Number(req.user.id),
          title,
          description,
          requirements || null,
          salary_min || null,
          salary_max || null,
          location || null,
          type || 'full-time',
          remote || false,
          'active', // Status padrão: ativa
        ]
      )

      const jobId = result.rows[0].id
      console.log('Job created with ID:', jobId, 'Status:', result.rows[0].status, 'Recruiter ID:', result.rows[0].recruiter_id)

      // Inserir tags se fornecidas
      if (tag_ids && Array.isArray(tag_ids) && tag_ids.length > 0) {
        for (const tagId of tag_ids) {
          await db.query(
            'INSERT INTO job_tags (job_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [jobId, tagId]
          )
        }
      }

      await db.query('COMMIT')

      // Buscar job com tags
      const jobWithTags = await db.query(
        `SELECT j.*, 
         COALESCE(
           json_agg(
             json_build_object('id', t.id, 'name', t.name, 'category', t.category)
           ) FILTER (WHERE t.id IS NOT NULL),
           '[]'::json
         ) as tags
         FROM jobs j
         LEFT JOIN job_tags jt ON j.id = jt.job_id
         LEFT JOIN tags t ON jt.tag_id = t.id
         WHERE j.id = $1
         GROUP BY j.id`,
        [jobId]
      )

      res.status(201).json({
        success: true,
        data: {
          job: {
            ...jobWithTags.rows[0],
            tags: Array.isArray(jobWithTags.rows[0].tags) 
              ? jobWithTags.rows[0].tags 
              : (jobWithTags.rows[0].tags ? JSON.parse(jobWithTags.rows[0].tags) : []),
          },
        },
      })
    } catch (error) {
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    next(error)
  }
}

export const getJobs = async (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search, location, type, remote, tag_ids } = req.query
    const authReq = req as AuthRequest

    console.log('getJobs called - User:', authReq.user ? { id: authReq.user.id, role: authReq.user.role } : 'not authenticated')

    // Construir condições WHERE
    // Recrutadores veem suas próprias vagas (todas), outros veem apenas ativas
    const whereConditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (authReq.user && authReq.user.role === 'recruiter') {
      // Recrutador vê apenas suas próprias vagas (todas, independente do status)
      const recruiterId = Number(authReq.user.id)
      console.log('=== RECRUITER FETCHING JOBS ===')
      console.log('Recruiter ID (number):', recruiterId, 'Type:', typeof recruiterId)
      console.log('Recruiter ID (original string):', authReq.user.id, 'Type:', typeof authReq.user.id)
      
      // Query de teste para verificar se há vagas e ver os valores reais no banco
      try {
        const testQuery = await db.query('SELECT COUNT(*) as count, recruiter_id FROM jobs GROUP BY recruiter_id', [])
        console.log('All recruiter_ids in DB:', testQuery.rows.map((r: any) => ({ 
          recruiter_id: r.recruiter_id, 
          count: r.count, 
          recruiter_id_type: typeof r.recruiter_id 
        })))
        
        const countQuery = await db.query('SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = $1', [recruiterId])
        console.log('Total jobs in DB for recruiter ID', recruiterId, '(as number):', countQuery.rows[0].count)
        
        // Verificar também com string para ver se há diferença
        const countQueryString = await db.query('SELECT COUNT(*) as count FROM jobs WHERE recruiter_id::text = $1', [authReq.user.id])
        console.log('Total jobs in DB for recruiter ID', authReq.user.id, '(as string):', countQueryString.rows[0].count)
        
        // Verificar todas as vagas com seus recruiter_ids
        const allJobsCheck = await db.query('SELECT id, recruiter_id, title, status FROM jobs ORDER BY created_at DESC LIMIT 10', [])
        console.log('Sample jobs in DB (last 10):', allJobsCheck.rows.map((r: any) => ({ 
          id: r.id, 
          recruiter_id: r.recruiter_id, 
          recruiter_id_type: typeof r.recruiter_id,
          title: r.title, 
          status: r.status 
        })))
      } catch (testError: any) {
        console.error('Error in test queries:', testError.message)
      }
      
      whereConditions.push(`j.recruiter_id = $${paramCount}`)
      params.push(recruiterId)
      paramCount++
      console.log('=== END RECRUITER INFO ===')
    } else {
      // Outros veem apenas vagas ativas
      console.log('Non-recruiter or not authenticated - showing only active jobs')
      whereConditions.push(`j.status = $${paramCount}`)
      params.push('active')
      paramCount++
    }

    if (search) {
      whereConditions.push(`(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount})`)
      params.push(`%${search}%`)
      paramCount++
    }

    if (location) {
      whereConditions.push(`j.location ILIKE $${paramCount}`)
      params.push(`%${location}%`)
      paramCount++
    }

    if (type) {
      whereConditions.push(`j.type = $${paramCount}`)
      params.push(type)
      paramCount++
    }

    if (remote !== undefined) {
      whereConditions.push(`j.remote = $${paramCount}`)
      params.push(remote === 'true')
      paramCount++
    }

    // Filtro por tags
    if (tag_ids) {
      const tagIdsArray = Array.isArray(tag_ids) ? tag_ids.map(Number) : [Number(tag_ids)]
      whereConditions.push(`j.id IN (
        SELECT DISTINCT job_id FROM job_tags WHERE tag_id = ANY($${paramCount}::int[])
      )`)
      params.push(tagIdsArray)
      paramCount++
    }

    const whereClause = whereConditions.join(' AND ')

    // Primeiro, buscar os IDs das vagas que correspondem aos critérios
    const limitParam = paramCount
    const offsetParam = paramCount + 1
    params.push(Number(limit), (Number(page) - 1) * Number(limit))

    // Query simplificada primeiro para encontrar os IDs
    const idsQuery = `
      SELECT j.id
      FROM jobs j
      WHERE ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `
    
    console.log('=== getJobs Debug Info ===')
    console.log('Where clause:', whereClause)
    console.log('Params:', JSON.stringify(params, null, 2))
    console.log('IDs query:', idsQuery.replace(/\s+/g, ' '))
    
    let idsResult
    try {
      idsResult = await db.query(idsQuery, params)
      console.log('IDs query executed successfully')
    } catch (queryError: any) {
      console.error('Error executing IDs query:', queryError.message)
      console.error('Query:', idsQuery)
      console.error('Params:', params)
      throw queryError
    }
    
    const jobIds = idsResult.rows.map((row: any) => row.id)
    console.log('Found job IDs:', jobIds.length, jobIds)

    if (jobIds.length === 0) {
      console.log('No job IDs found, returning empty array')
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    }

    // Agora buscar os detalhes completos com tags
    // Usar DISTINCT no SELECT de tags em vez de no json_agg
    const query = `
      SELECT j.*, 
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name, 'category', t.category)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
      ) as tags
      FROM jobs j
      LEFT JOIN job_tags jt ON j.id = jt.job_id
      LEFT JOIN tags t ON jt.tag_id = t.id
      WHERE j.id = ANY($1::int[])
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `
    
    console.log('Executing getJobs full query for IDs:', jobIds)
    let result
    try {
      result = await db.query(query, [jobIds])
      console.log('Full query executed successfully')
    } catch (fullQueryError: any) {
      console.error('Error executing full query:', fullQueryError.message)
      console.error('Query:', query)
      console.error('Job IDs:', jobIds)
      throw fullQueryError
    }
    
    console.log('Found jobs with details:', result.rows.length)
    if (result.rows.length > 0) {
      console.log('First job:', {
        id: result.rows[0].id,
        recruiter_id: result.rows[0].recruiter_id,
        title: result.rows[0].title,
        status: result.rows[0].status
      })
    }
    console.log('=== End Debug Info ===')

    res.json({
      success: true,
      data: {
        jobs: result.rows.map((row: any) => {
          let tags = []
          try {
            if (Array.isArray(row.tags)) {
              tags = row.tags
            } else if (row.tags) {
              tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
            }
            // Remover tags duplicadas baseado no ID
            const seenIds = new Set()
            tags = tags.filter((tag: any) => {
              if (seenIds.has(tag.id)) {
                return false
              }
              seenIds.add(tag.id)
              return true
            })
          } catch (e) {
            console.error('Error parsing tags:', e)
            tags = []
          }

          return {
            ...row,
            tags,
          }
        }),
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      },
    })
  } catch (error) {
    console.error('Error in getJobs:', error)
    // Retornar lista vazia em caso de erro para não quebrar o frontend
    res.json({
      success: true,
      data: {
        jobs: [],
        pagination: {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
        },
      },
    })
  }
}

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `SELECT j.*, 
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name, 'category', t.category)
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'::json
       ) as tags
       FROM jobs j
       LEFT JOIN job_tags jt ON j.id = jt.job_id
       LEFT JOIN tags t ON jt.tag_id = t.id
       WHERE j.id = $1
       GROUP BY j.id`,
      [id]
    )

    if (result.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    res.json({
      success: true,
      data: {
        job: {
          ...result.rows[0],
          tags: Array.isArray(result.rows[0].tags) 
            ? result.rows[0].tags 
            : (result.rows[0].tags ? JSON.parse(result.rows[0].tags) : []),
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { id } = req.params
    const {
      title,
      description,
      requirements,
      salary_min,
      salary_max,
      location,
      type,
      remote,
    } = req.body

    // Verificar se a vaga pertence ao recrutador
    const jobCheck = await db.query(
      'SELECT recruiter_id FROM jobs WHERE id = $1',
      [id]
    )

    if (jobCheck.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    if (Number(jobCheck.rows[0].recruiter_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
    }

    const result = await db.query(
      `UPDATE jobs SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        requirements = COALESCE($3, requirements),
        salary_min = COALESCE($4, salary_min),
        salary_max = COALESCE($5, salary_max),
        location = COALESCE($6, location),
        type = COALESCE($7, type),
        remote = COALESCE($8, remote),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        title,
        description,
        requirements,
        salary_min,
        salary_max,
        location,
        type,
        remote,
        id,
      ]
    )

    res.json({
      success: true,
      data: {
        job: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { id } = req.params

    // Verificar se a vaga pertence ao recrutador
    const jobCheck = await db.query(
      'SELECT recruiter_id FROM jobs WHERE id = $1',
      [id]
    )

    if (jobCheck.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    if (Number(jobCheck.rows[0].recruiter_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
    }

    await db.query('DELETE FROM jobs WHERE id = $1', [id])

    res.json({
      success: true,
      message: 'Vaga deletada com sucesso',
    })
  } catch (error) {
    next(error)
  }
}

export const getRecommendedJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem ver vagas recomendadas', 403)
    }

    const { page = 1, limit = 10 } = req.query

    // Buscar tags do candidato
    const userTagsResult = await db.query(
      'SELECT tag_id FROM user_tags WHERE user_id = $1',
      [req.user.id]
    )

    if (userTagsResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    }

    const userTagIds = userTagsResult.rows.map((row) => Number(row.tag_id))

    if (userTagIds.length === 0) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    }

    // Buscar vagas com tags correspondentes e calcular score de match
    // Primeiro, buscar IDs de jobs que têm pelo menos uma tag correspondente
    console.log('Searching for jobs with tags:', userTagIds)
    const matchingJobsResult = await db.query(
      `SELECT DISTINCT jt.job_id, 
       COUNT(DISTINCT jt.tag_id) as match_count
       FROM job_tags jt
       INNER JOIN jobs j ON jt.job_id = j.id
       WHERE j.status = 'active' AND jt.tag_id = ANY($1::int[])
       GROUP BY jt.job_id
       ORDER BY match_count DESC
       LIMIT $2 OFFSET $3`,
      [userTagIds, Number(limit), (Number(page) - 1) * Number(limit)]
    )
    console.log('Found matching jobs:', matchingJobsResult.rows.length)

    if (matchingJobsResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    }

    const jobIds = matchingJobsResult.rows.map((row) => Number(row.job_id))

    // Agora buscar os detalhes completos das vagas com suas tags
    try {
      console.log('Fetching job details for IDs:', jobIds)
      const result = await db.query(
        `SELECT 
          j.*,
          COALESCE(
            json_agg(
              json_build_object('id', t.id, 'name', t.name, 'category', t.category)
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
          ) as tags,
          (
            SELECT COUNT(DISTINCT jt2.tag_id)
            FROM job_tags jt2
            WHERE jt2.job_id = j.id AND jt2.tag_id = ANY($1::int[])
          )::integer as match_count,
          (
            SELECT COUNT(DISTINCT jt3.tag_id)
            FROM job_tags jt3
            WHERE jt3.job_id = j.id
          )::integer as total_tags
        FROM jobs j
        LEFT JOIN job_tags jt ON j.id = jt.job_id
        LEFT JOIN tags t ON jt.tag_id = t.id
        WHERE j.id = ANY($2::int[])
        GROUP BY j.id
        ORDER BY match_count DESC, j.created_at DESC`,
        [userTagIds, jobIds]
      )

      // Calcular match_score para cada job
      const jobsWithScore = result.rows.map((row: any) => {
        const matchCount = row.match_count || 0
        const totalTags = row.total_tags || 1
        const matchScore = totalTags > 0 ? Math.round((matchCount / totalTags) * 100 * 100) / 100 : 0

        // Processar tags e remover duplicatas
        let tags = []
        try {
          if (Array.isArray(row.tags)) {
            tags = row.tags
          } else if (row.tags) {
            tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
          }
          // Remover tags duplicadas baseado no ID
          const seenIds = new Set()
          tags = tags.filter((tag: any) => {
            if (seenIds.has(tag.id)) {
              return false
            }
            seenIds.add(tag.id)
            return true
          })
        } catch (e) {
          console.error('Error parsing tags:', e)
          tags = []
        }

        return {
          ...row,
          tags,
          match_score: matchScore,
        }
      })

      res.json({
        success: true,
        data: {
          jobs: jobsWithScore,
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    } catch (queryError: any) {
      console.error('Query error in getRecommendedJobs:', queryError)
      // Se a query falhar, retornar lista vazia em vez de erro
      return res.json({
        success: true,
        data: {
          jobs: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
          },
        },
      })
    }
  } catch (error) {
    console.error('Error in getRecommendedJobs:', error)
    next(error)
  }
}
