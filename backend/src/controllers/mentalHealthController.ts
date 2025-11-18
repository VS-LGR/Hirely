import { Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

// Buscar todos os profissionais ativos
export const getMentalHealthProfessionals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { specialization, online_only, max_price } = req.query

    let query = `
      SELECT * FROM mental_health_professionals
      WHERE is_active = true
    `
    const params: any[] = []
    let paramCount = 1

    if (specialization) {
      query += ` AND specialization ILIKE $${paramCount}`
      params.push(`%${specialization}%`)
      paramCount++
    }

    if (online_only === 'true') {
      query += ` AND available_online = true`
    }

    if (max_price) {
      query += ` AND price_per_session <= $${paramCount}`
      params.push(parseFloat(max_price as string))
      paramCount++
    }

    query += ` ORDER BY experience_years DESC, name ASC`

    const result = await db.query(query, params)

    res.json({
      success: true,
      data: {
        professionals: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Buscar um profissional específico
export const getMentalHealthProfessional = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const result = await db.query(
      'SELECT * FROM mental_health_professionals WHERE id = $1 AND is_active = true',
      [id]
    )

    if (result.rows.length === 0) {
      throw createError('Profissional não encontrado', 404)
    }

    res.json({
      success: true,
      data: {
        professional: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// Buscar dicas/tips de saúde mental
export const getMentalHealthTips = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query

    let query = `
      SELECT * FROM mental_health_tips
      WHERE is_active = true
    `
    const params: any[] = []
    let paramCount = 1

    if (category) {
      query += ` AND category = $${paramCount}`
      params.push(category)
      paramCount++
    }

    query += ` ORDER BY display_order ASC, created_at DESC`

    const result = await db.query(query, params)

    res.json({
      success: true,
      data: {
        tips: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Buscar categorias disponíveis de tips
export const getMentalHealthCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM mental_health_tips
       WHERE is_active = true
       GROUP BY category
       ORDER BY category ASC`
    )

    res.json({
      success: true,
      data: {
        categories: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

