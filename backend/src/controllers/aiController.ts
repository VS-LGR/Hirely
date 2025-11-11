import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { aiService } from '../services/aiService'

export const generateJobDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, requirements } = req.body

    if (!title) {
      throw createError('Título da vaga é obrigatório', 400)
    }

    const description = await aiService.generateJobDescription(
      title,
      requirements || []
    )

    res.json({
      success: true,
      data: {
        description,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const analyzeResume = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resume } = req.body

    if (!resume) {
      throw createError('Currículo é obrigatório', 400)
    }

    const analysis = await aiService.analyzeResume(resume)

    res.json({
      success: true,
      data: {
        analysis,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const suggestImprovements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text, type } = req.body

    if (!text || !type) {
      throw createError('Texto e tipo são obrigatórios', 400)
    }

    if (!['resume', 'cover_letter'].includes(type)) {
      throw createError('Tipo deve ser "resume" ou "cover_letter"', 400)
    }

    const suggestions = await aiService.suggestImprovements(text, type)

    res.json({
      success: true,
      data: {
        suggestions,
      },
    })
  } catch (error) {
    next(error)
  }
}


