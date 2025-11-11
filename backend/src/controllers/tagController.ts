import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { db } from '../database/connection'

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.query

    let query = 'SELECT * FROM tags'
    const params: any[] = []

    if (category) {
      query += ' WHERE category = $1'
      params.push(category)
    }

    query += ' ORDER BY category, name'

    const result = await db.query(query, params)

    res.json({
      success: true,
      data: {
        tags: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getTagsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params

    if (!category) {
      throw createError('Categoria é obrigatória', 400)
    }

    const result = await db.query(
      'SELECT * FROM tags WHERE category = $1 ORDER BY name',
      [category]
    )

    res.json({
      success: true,
      data: {
        tags: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const searchTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      throw createError('Query de busca é obrigatória', 400)
    }

    const searchQuery = `%${q.toLowerCase()}%`
    const result = await db.query(
      `SELECT * FROM tags 
       WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1 
       ORDER BY 
         CASE WHEN LOWER(name) LIKE $2 THEN 1 ELSE 2 END,
         category, name
       LIMIT 50`,
      [searchQuery, `%${q.toLowerCase()}%`]
    )

    res.json({
      success: true,
      data: {
        tags: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

