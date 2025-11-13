import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { aiService } from '../services/aiService'
import { watsonService } from '../services/watsonService'
import { extractTextFromFile } from '../utils/resumeParser'
import { uploadFileToSupabase, downloadFileFromSupabase, deleteFileFromSupabase } from '../utils/supabaseStorage'
import fs from 'fs'
import path from 'path'

// Escolher qual serviço usar (Watson se configurado, senão OpenAI)
const getAIService = () => {
  const useWatson = 
    process.env.USE_WATSON === 'true' ||
    (process.env.WATSON_ASSISTANT_API_KEY && process.env.WATSON_NLU_API_KEY)
  
  return useWatson ? watsonService : aiService
}

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
  let filePath: string | null = null
  let supabaseFilePath: string | null = null
  const useSupabase = !!process.env.SUPABASE_URL

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

    try {
      let fileBuffer: Buffer
      let fileName: string

      if (useSupabase && req.file.buffer) {
        // Modo Supabase: arquivo está em memória (multer memory storage)
        fileBuffer = req.file.buffer
        fileName = req.file.originalname

        // Upload para Supabase Storage
        console.log('Uploading file to Supabase...')
        const uploadResult = await uploadFileToSupabase(
          fileBuffer,
          fileName,
          req.file.mimetype
        )
        supabaseFilePath = uploadResult.path
        console.log('File uploaded to Supabase:', supabaseFilePath)

        // Baixar arquivo do Supabase para processar
        fileBuffer = await downloadFileFromSupabase(supabaseFilePath)
      } else {
        // Modo local: arquivo está em disco
        filePath = req.file.path
        fileName = req.file.originalname
        console.log('Processing local file:', filePath)
        fileBuffer = fs.readFileSync(filePath)
      }

      // Extrair texto do arquivo
      console.log('Extracting text from file...')
      const resumeText = await extractTextFromFile(fileBuffer, fileName)

      if (!resumeText || resumeText.trim().length === 0) {
        throw createError('Não foi possível extrair texto do arquivo. Certifique-se de que o arquivo é um PDF ou DOCX válido.', 400)
      }

      console.log('Text extracted, length:', resumeText.length)

      // Analisar com IA
      console.log('Analyzing with AI...')
      const service = getAIService()
      const analysis = await service.analyzeResumeDetailed(resumeText)
      console.log('Analysis complete')

      // Deletar arquivo após análise
      if (useSupabase && supabaseFilePath) {
        try {
          await deleteFileFromSupabase(supabaseFilePath)
          console.log('File deleted from Supabase successfully')
        } catch (deleteError) {
          console.error('Error deleting file from Supabase:', deleteError)
        }
      } else if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
          console.log('Local file deleted successfully')
        } catch (unlinkError) {
          console.error('Error deleting local file:', unlinkError)
        }
      }

      res.json({
        success: true,
        data: {
          analysis,
        },
      })
    } catch (parseError: any) {
      console.error('Error processing file:', parseError)
      
      // Deletar arquivo em caso de erro
      if (useSupabase && supabaseFilePath) {
        try {
          await deleteFileFromSupabase(supabaseFilePath)
        } catch (deleteError) {
          console.error('Error deleting file from Supabase:', deleteError)
        }
      } else if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (unlinkError) {
          console.error('Error deleting local file:', unlinkError)
        }
      }
      
      if (parseError.message) {
        throw createError(parseError.message, parseError.statusCode || 500)
      }
      throw parseError
    }
  } catch (error: any) {
    console.error('Error in uploadAndAnalyzeResume:', error)
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

    console.log('Suggesting tags for profile:', { bio, skills, experience })

    try {
      const service = getAIService()
      const suggestedTags = await service.suggestTags({
        bio,
        skills,
        experience,
      })

      console.log('Tags suggested:', suggestedTags)

      res.json({
        success: true,
        data: {
          tags: suggestedTags,
        },
      })
    } catch (aiError: any) {
      console.error('Error in suggestTags:', aiError)
      throw createError(
        aiError.message || 'Erro ao sugerir tags',
        aiError.statusCode || 500
      )
    }
  } catch (error: any) {
    console.error('Error in suggestTagsForProfile:', error)
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

    try {
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
        console.error('Error parsing tags:', e)
        tags = []
      }

      const context = {
        profile: {
          id: profile.id || req.user.id, // Incluir ID do usuário para o Watson
          name: profile.name || '',
          bio: profile.bio || '',
          skills: profile.skills || [],
          experience: profile.experience || [],
          education: profile.education || [],
          tags,
        },
        history: history || [],
      }

      const service = getAIService()
      const response = await service.chatWithAssistant(message, context)

      res.json({
        success: true,
        data: {
          response,
        },
      })
    } catch (dbError: any) {
      console.error('Error in chatWithAssistant:', dbError)
      throw createError(
        dbError.message || 'Erro ao processar mensagem',
        dbError.statusCode || 500
      )
    }
  } catch (error) {
    console.error('Error in chatWithAssistant controller:', error)
    next(error)
  }
}

