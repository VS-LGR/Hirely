import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { aiService } from '../services/aiService'
import { extractTextFromFile } from '../utils/resumeParser'
import fs from 'fs'
import path from 'path'

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

// Upload e análise de currículo
export const uploadAndAnalyzeResume = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem fazer upload de currículos', 403)
    }

    if (!req.file) {
      throw createError('Arquivo não fornecido', 400)
    }

    const filePath = req.file.path

    try {
      // Extrair texto do arquivo
      const resumeText = await extractTextFromFile(filePath)

      if (!resumeText || resumeText.trim().length === 0) {
        throw createError('Não foi possível extrair texto do arquivo. Certifique-se de que o arquivo é um PDF ou DOCX válido.', 400)
      }

      // Analisar com IA
      const analysis = await aiService.analyzeResumeDetailed(resumeText)

      // Deletar arquivo após análise
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      res.json({
        success: true,
        data: {
          analysis,
        },
      })
    } catch (parseError: any) {
      // Deletar arquivo em caso de erro
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError)
        }
      }
      
      if (parseError.message) {
        throw createError(parseError.message, parseError.statusCode || 500)
      }
      throw parseError
    }
  } catch (error) {
    next(error)
  }
}

// Sugerir tags baseado no perfil
export const suggestTagsForProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem solicitar sugestões de tags', 403)
    }

    const { bio, skills, experience } = req.body

    const suggestedTags = await aiService.suggestTags({
      bio,
      skills,
      experience,
    })

    res.json({
      success: true,
      data: {
        tags: suggestedTags,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Chat com assistente de IA
export const chatWithAssistant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem usar o assistente', 403)
    }

    const { message, history } = req.body

    if (!message) {
      throw createError('Mensagem é obrigatória', 400)
    }

    // Buscar perfil do usuário para contexto
    const { db } = await import('../database/connection')
    const userProfile = await db.query(
      `SELECT u.id, u.name, u.bio, u.skills, u.experience, u.education,
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name, 'category', t.category)
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'::json
       ) as tags
       FROM users u
       LEFT JOIN user_tags ut ON u.id = ut.user_id
       LEFT JOIN tags t ON ut.tag_id = t.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    )

    if (userProfile.rows.length === 0) {
      throw createError('Perfil do usuário não encontrado', 404)
    }

    const profile = userProfile.rows[0]
    let tags = []
    try {
      if (Array.isArray(profile.tags)) {
        tags = profile.tags
      } else if (profile.tags) {
        tags = typeof profile.tags === 'string' ? JSON.parse(profile.tags) : profile.tags
      }
    } catch (e) {
      tags = []
    }

    const context = {
      profile: {
        name: profile.name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
        tags,
      },
      history: history || [],
    }

    const response = await aiService.chatWithAssistant(message, context)

    res.json({
      success: true,
      data: {
        response,
      },
    })
  } catch (error) {
    next(error)
  }
}

