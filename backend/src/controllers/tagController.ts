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

    // Normalizar a busca (remover acentos, espaços extras)
    const normalizedQuery = q.toLowerCase().trim()
    const searchQuery = `%${normalizedQuery}%`
    
    // Buscar correspondências exatas primeiro, depois parciais
    // Também busca por palavras individuais (palavras com mais de 2 caracteres)
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
    
    // Construir query dinâmica para palavras-chave
    let whereClause = `LOWER(name) LIKE $1 OR LOWER(category) LIKE $1`
    const params: any[] = [searchQuery]
    
    if (words.length > 0) {
      const wordParams: string[] = []
      words.forEach((word, index) => {
        const paramIndex = params.length + 1
        params.push(`%${word}%`)
        wordParams.push(`LOWER(name) LIKE $${paramIndex}`)
      })
      whereClause += ` OR (${wordParams.join(' OR ')})`
    }
    
    const query = `
      SELECT * FROM tags 
      WHERE ${whereClause}
      ORDER BY 
        CASE 
          WHEN LOWER(name) = $${params.length + 1} THEN 1
          WHEN LOWER(name) LIKE $${params.length + 2} THEN 2
          ELSE 3
        END,
        category, name
      LIMIT 50
    `
    
    params.push(normalizedQuery, searchQuery)

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

