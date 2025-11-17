import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { db } from '../database/connection'

/**
 * Buscar cursos por área/tags
 * GET /api/courses/search?area=...&provider=...&tags=...
 */
export const searchCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { area, provider, tags, level } = req.query

    let query = 'SELECT * FROM courses WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    // Filtrar por provider (FIAP, ALURA ou IBM)
    if (provider && (provider === 'FIAP' || provider === 'ALURA' || provider === 'IBM')) {
      query += ` AND provider = $${paramIndex}`
      params.push(provider)
      paramIndex++
    }

    // Filtrar por categoria/área
    if (area && typeof area === 'string') {
      query += ` AND (category ILIKE $${paramIndex} OR title ILIKE $${paramIndex})`
      params.push(`%${area}%`)
      paramIndex++
    }

    // Filtrar por nível
    if (level && typeof level === 'string') {
      query += ` AND level = $${paramIndex}`
      params.push(level)
      paramIndex++
    }

    // Filtrar por tags (array de tag IDs)
    if (tags) {
      let tagIds: number[] = []
      if (typeof tags === 'string') {
        // Se for string, pode ser JSON array ou valores separados por vírgula
        try {
          tagIds = JSON.parse(tags)
        } catch {
          tagIds = tags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        }
      } else if (Array.isArray(tags)) {
        tagIds = tags.map(id => parseInt(String(id))).filter(id => !isNaN(id))
      }

      if (tagIds.length > 0) {
        query += ` AND tags && $${paramIndex}::INTEGER[]`
        params.push(tagIds)
        paramIndex++
      }
    }

    query += ' ORDER BY provider, category, title LIMIT 50'

    const result = await db.query(query, params)

    res.json({
      success: true,
      data: {
        courses: result.rows,
        count: result.rows.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Listar todos os cursos
 * GET /api/courses
 */
export const listCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { provider, category } = req.query

    let query = 'SELECT * FROM courses WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (provider && (provider === 'FIAP' || provider === 'ALURA' || provider === 'IBM')) {
      query += ` AND provider = $${paramIndex}`
      params.push(provider)
      paramIndex++
    }

    if (category && typeof category === 'string') {
      query += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    query += ' ORDER BY provider, category, title'

    const result = await db.query(query, params)

    res.json({
      success: true,
      data: {
        courses: result.rows,
        count: result.rows.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Buscar cursos recomendados baseado nas tags do usuário
 * GET /api/courses/recommended?userTags=...
 */
export const getRecommendedCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userTags } = req.query

    if (!userTags) {
      throw createError('userTags é obrigatório', 400)
    }

    let tagIds: number[] = []
    if (typeof userTags === 'string') {
      try {
        tagIds = JSON.parse(userTags)
      } catch {
        tagIds = userTags.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      }
    } else if (Array.isArray(userTags)) {
      tagIds = userTags.map(id => parseInt(String(id))).filter(id => !isNaN(id))
    }

    if (tagIds.length === 0) {
      return res.json({
        success: true,
        data: {
          courses: [],
          count: 0,
        },
      })
    }

    // Buscar cursos que tenham pelo menos uma tag em comum
    const result = await db.query(
      `SELECT * FROM courses 
       WHERE tags && $1::INTEGER[]
       ORDER BY 
         (SELECT COUNT(*) FROM unnest(tags) AS tag WHERE tag = ANY($1::INTEGER[])) DESC,
         provider, category, title
       LIMIT 20`,
      [tagIds]
    )

    res.json({
      success: true,
      data: {
        courses: result.rows,
        count: result.rows.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

