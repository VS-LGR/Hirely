import { Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

// Candidato se candidata a uma vaga
export const createApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem se candidatar a vagas', 403)
    }

    const { job_id, cover_letter } = req.body

    if (!job_id) {
      throw createError('ID da vaga é obrigatório', 400)
    }

    // Verificar se a vaga existe e está ativa
    const jobCheck = await db.query(
      'SELECT id, recruiter_id, status FROM jobs WHERE id = $1',
      [job_id]
    )

    if (jobCheck.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    if (jobCheck.rows[0].status !== 'active') {
      throw createError('Esta vaga não está mais disponível', 400)
    }

    // Verificar se o candidato já se candidatou
    const existingApplication = await db.query(
      'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
      [job_id, req.user.id]
    )

    if (existingApplication.rows.length > 0) {
      throw createError('Você já se candidatou a esta vaga', 400)
    }

    // Calcular match_score baseado nas tags
    let matchScore = 0
    try {
      // Buscar tags do candidato
      const candidateTags = await db.query(
        'SELECT tag_id FROM user_tags WHERE user_id = $1',
        [req.user.id]
      )
      const candidateTagIds = candidateTags.rows.map((r: any) => Number(r.tag_id))

      // Buscar tags da vaga
      const jobTags = await db.query(
        'SELECT tag_id FROM job_tags WHERE job_id = $1',
        [job_id]
      )
      const jobTagIds = jobTags.rows.map((r: any) => Number(r.tag_id))

      // Calcular match score
      if (jobTagIds.length > 0 && candidateTagIds.length > 0) {
        const matchingTags = candidateTagIds.filter((id) => jobTagIds.includes(id))
        matchScore = Math.round((matchingTags.length / jobTagIds.length) * 100 * 100) / 100
      }
    } catch (scoreError) {
      console.error('Error calculating match score:', scoreError)
      // Continuar sem match_score se houver erro
    }

    // Criar candidatura
    const result = await db.query(
      `INSERT INTO applications (job_id, candidate_id, cover_letter, match_score, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [job_id, req.user.id, cover_letter || null, matchScore || null, 'pending']
    )

    res.status(201).json({
      success: true,
      data: {
        application: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// Recrutador vê candidatos de uma vaga específica
export const getApplicationsByJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
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

    if (
      Number(jobCheck.rows[0].recruiter_id) !== Number(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      throw createError('Acesso negado', 403)
    }

    // Buscar candidaturas com informações do candidato
    const result = await db.query(
      `SELECT 
        a.*,
        u.id as candidate_user_id,
        u.name as candidate_name,
        u.email as candidate_email,
        u.bio as candidate_bio,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'category', t.category)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as candidate_tags
      FROM applications a
      INNER JOIN users u ON a.candidate_id = u.id
      LEFT JOIN user_tags ut ON u.id = ut.user_id
      LEFT JOIN tags t ON ut.tag_id = t.id
      WHERE a.job_id = $1
      GROUP BY a.id, u.id
      ORDER BY a.match_score DESC NULLS LAST, a.created_at DESC`,
      [id]
    )

    // Processar tags e remover duplicatas
    const applications = result.rows.map((row: any) => {
      let tags = []
      try {
        if (Array.isArray(row.candidate_tags)) {
          tags = row.candidate_tags
        } else if (row.candidate_tags) {
          tags = typeof row.candidate_tags === 'string' 
            ? JSON.parse(row.candidate_tags) 
            : row.candidate_tags
        }
        // Remover duplicatas
        const seenIds = new Set()
        tags = tags.filter((tag: any) => {
          if (seenIds.has(tag.id)) return false
          seenIds.add(tag.id)
          return true
        })
      } catch (e) {
        tags = []
      }

      return {
        id: row.id,
        job_id: row.job_id,
        candidate_id: row.candidate_id,
        status: row.status,
        cover_letter: row.cover_letter,
        match_score: row.match_score,
        created_at: row.created_at,
        updated_at: row.updated_at,
        candidate: {
          id: row.candidate_user_id,
          name: row.candidate_name,
          email: row.candidate_email,
          bio: row.candidate_bio,
          tags,
        },
      }
    })

    res.json({
      success: true,
      data: {
        applications,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Recrutador vê todas as candidaturas de suas vagas
export const getApplicationsByRecruiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
    }

    const { status, job_id } = req.query

    // Construir query
    let whereClause = 'j.recruiter_id = $1'
    const params: any[] = [req.user.id]
    let paramCount = 2

    if (status) {
      whereClause += ` AND a.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    if (job_id) {
      whereClause += ` AND a.job_id = $${paramCount}`
      params.push(job_id)
      paramCount++
    }

    const result = await db.query(
      `SELECT 
        a.*,
        j.id as job_id,
        j.title as job_title,
        u.id as candidate_user_id,
        u.name as candidate_name,
        u.email as candidate_email,
        u.bio as candidate_bio
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.candidate_id = u.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC`,
      params
    )

    res.json({
      success: true,
      data: {
        applications: result.rows.map((row: any) => ({
          id: row.id,
          job_id: row.job_id,
          job_title: row.job_title,
          candidate_id: row.candidate_id,
          status: row.status,
          cover_letter: row.cover_letter,
          match_score: row.match_score,
          created_at: row.created_at,
          updated_at: row.updated_at,
          candidate: {
            id: row.candidate_user_id,
            name: row.candidate_name,
            email: row.candidate_email,
            bio: row.candidate_bio,
          },
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Recrutador atualiza status da candidatura
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
    }

    const { id } = req.params
    const { status, feedback } = req.body

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      throw createError('Status inválido', 400)
    }

    // Se for rejeitar, feedback é obrigatório
    if (status === 'rejected' && (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0)) {
      throw createError('Feedback é obrigatório ao rejeitar um candidato', 400)
    }

    // Verificar se a candidatura existe e se a vaga pertence ao recrutador
    const applicationCheck = await db.query(
      `SELECT a.id, j.recruiter_id 
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    )

    if (applicationCheck.rows.length === 0) {
      throw createError('Candidatura não encontrada', 404)
    }

    if (
      Number(applicationCheck.rows[0].recruiter_id) !== Number(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      throw createError('Acesso negado', 403)
    }

    // Atualizar status e feedback (se fornecido)
    const result = await db.query(
      `UPDATE applications 
       SET status = $1, 
           feedback = CASE WHEN $2 IS NOT NULL THEN $2 ELSE feedback END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, status === 'rejected' ? feedback.trim() : null, id]
    )

    res.json({
      success: true,
      data: {
        application: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// Candidato vê suas próprias candidaturas
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Acesso negado', 403)
    }

    const { status } = req.query

    let whereClause = 'a.candidate_id = $1'
    const params: any[] = [req.user.id]

    if (status) {
      whereClause += ' AND a.status = $2'
      params.push(status)
    }

    const result = await db.query(
      `SELECT 
        a.*,
        j.id as job_id,
        j.title as job_title,
        j.description as job_description,
        j.location as job_location,
        j.type as job_type,
        j.remote as job_remote,
        j.salary_min,
        j.salary_max,
        COALESCE(
          json_agg(
            json_build_object('id', t.id, 'name', t.name, 'category', t.category)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as job_tags
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      LEFT JOIN job_tags jt ON j.id = jt.job_id
      LEFT JOIN tags t ON jt.tag_id = t.id
      WHERE ${whereClause}
      GROUP BY a.id, j.id
      ORDER BY a.created_at DESC`,
      params
    )

    // Processar tags
    const applications = result.rows.map((row: any) => {
      let tags = []
      try {
        if (Array.isArray(row.job_tags)) {
          tags = row.job_tags
        } else if (row.job_tags) {
          tags = typeof row.job_tags === 'string' 
            ? JSON.parse(row.job_tags) 
            : row.job_tags
        }
        const seenIds = new Set()
        tags = tags.filter((tag: any) => {
          if (seenIds.has(tag.id)) return false
          seenIds.add(tag.id)
          return true
        })
      } catch (e) {
        tags = []
      }

      return {
        id: row.id,
        job_id: row.job_id,
        status: row.status,
        cover_letter: row.cover_letter,
        match_score: row.match_score,
        created_at: row.created_at,
        updated_at: row.updated_at,
        job: {
          id: row.job_id,
          title: row.job_title,
          description: row.job_description,
          location: row.job_location,
          type: row.job_type,
          remote: row.job_remote,
          salary_min: row.salary_min,
          salary_max: row.salary_max,
          tags,
        },
      }
    })

    res.json({
      success: true,
      data: {
        applications,
      },
    })
  } catch (error) {
    next(error)
  }
}

