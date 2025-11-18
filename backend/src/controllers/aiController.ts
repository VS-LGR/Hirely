import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { aiService } from '../services/aiService'
import { watsonService } from '../services/watsonService'
import { watsonXService } from '../services/watsonXService'
import { extractTextFromFile } from '../utils/resumeParser'
import { uploadFileToSupabase, downloadFileFromSupabase, deleteFileFromSupabase } from '../utils/supabaseStorage'
import { db } from '../database/connection'
import fs from 'fs'
import path from 'path'

// Escolher qual serviço usar (prioridade: WatsonX > Watson Assistant > OpenAI)
const getAIService = () => {
  // Prioridade 1: WatsonX (se configurado)
  const useWatsonX = 
    process.env.USE_WATSONX === 'true' ||
    (process.env.WATSONX_API_KEY && process.env.WATSONX_PROJECT_ID)
  
  if (useWatsonX) {
    console.log('✅ Usando WatsonX Service')
    return watsonXService
  }
  
  // Prioridade 2: Watson Assistant (se configurado)
  const useWatson = 
    process.env.USE_WATSON === 'true' ||
    (process.env.WATSON_ASSISTANT_API_KEY && process.env.WATSON_NLU_API_KEY)
  
  if (useWatson) {
    console.log('✅ Usando Watson Assistant Service')
    return watsonService
  }
  
  // Prioridade 3: OpenAI (fallback)
  console.log('✅ Usando OpenAI Service')
  return aiService
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
      
      // Tratar erros específicos de rate limit/quota
      const errorMessage = parseError.message || ''
      if (
        errorMessage.includes('Limite de requisições') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('429') ||
        parseError.statusCode === 429
      ) {
        throw createError(
          'Limite de requisições da API excedido. Por favor, aguarde alguns minutos antes de tentar novamente. Se o problema persistir, verifique seu plano da IBM Cloud WatsonX.',
          429
        )
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

// Analisar reintegração ao mercado de trabalho
export const analyzeReintegration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'candidate') {
      throw createError('Apenas candidatos podem solicitar análise de reintegração', 403)
    }

    const { currentArea } = req.body

    if (!currentArea || typeof currentArea !== 'string' || currentArea.trim().length === 0) {
      throw createError('Área atual de trabalho é obrigatória', 400)
    }

    // Buscar perfil do usuário para contexto
    const profileResult = await db.query(
      `SELECT u.bio, u.experience, u.education,
       COALESCE(
         json_agg(
           json_build_object('id', t.id, 'name', t.name, 'category', t.category)
         ) FILTER (WHERE t.id IS NOT NULL),
         '[]'
       ) as tags
       FROM users u
       LEFT JOIN user_tags ut ON u.id = ut.user_id
       LEFT JOIN tags t ON ut.tag_id = t.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    )

    const userProfile = profileResult.rows[0] || {}

    try {
      const service = getAIService()
      const analysis = await service.analyzeReintegration(currentArea.trim(), {
        bio: userProfile.bio,
        experience: userProfile.experience || [],
        tags: userProfile.tags || [],
      })

      res.json({
        success: true,
        data: {
          analysis,
        },
      })
    } catch (aiError: any) {
      console.error('Error in analyzeReintegration:', aiError)
      throw createError(
        aiError.message || 'Erro ao analisar reintegração',
        aiError.statusCode || 500
      )
    }
  } catch (error: any) {
    console.error('Error in analyzeReintegration controller:', error)
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

      console.log('Chat request:', {
        message: message.substring(0, 100),
        historyLength: context.history.length,
        history: context.history,
        profileName: context.profile.name,
      })

      const service = getAIService()
      const response = await service.chatWithAssistant(message, context)
      
      console.log('Chat response received:', response.substring(0, 100))

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

// Gerar vaga completa com IA baseado em requisições do recrutador
export const generateJobWithAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== 'recruiter') {
      throw createError('Apenas recrutadores podem gerar vagas com IA', 403)
    }

    const { requirements } = req.body

    if (!requirements || typeof requirements !== 'string' || requirements.trim().length === 0) {
      throw createError('Requisitos são obrigatórios', 400)
    }

    const service = getAIService()
    const jobData = await service.generateJobWithAI(requirements.trim())

    res.json({
      success: true,
      data: {
        job: jobData,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Gerar feedback personalizado para candidato rejeitado
export const generatePersonalizedFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) {
      throw createError('Acesso negado', 403)
    }

    const { job_id, candidate_id, bullet_points } = req.body

    if (!job_id || !candidate_id) {
      throw createError('ID da vaga e do candidato são obrigatórios', 400)
    }

    if (!bullet_points || !Array.isArray(bullet_points) || bullet_points.length === 0) {
      throw createError('Pelo menos um ponto de feedback é obrigatório', 400)
    }

    // Buscar informações da vaga
    const jobResult = await db.query(
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
      [job_id]
    )

    if (jobResult.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    const job = jobResult.rows[0]

    // Verificar se a vaga pertence ao recrutador
    if (Number(job.recruiter_id) !== Number(req.user.id) && req.user.role !== 'admin') {
      throw createError('Acesso negado', 403)
    }

    // Buscar informações do candidato
    const candidateResult = await db.query(
      `SELECT u.*,
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
      [candidate_id]
    )

    if (candidateResult.rows.length === 0) {
      throw createError('Candidato não encontrado', 404)
    }

    const candidate = candidateResult.rows[0]

    // Construir perfil do candidato
    const candidateProfile = `
Nome: ${candidate.name}
Bio: ${candidate.bio || 'Não informado'}
Habilidades: ${Array.isArray(candidate.skills) ? candidate.skills.join(', ') : 'Não informado'}
Experiência: ${JSON.stringify(candidate.experience || [])}
Educação: ${JSON.stringify(candidate.education || [])}
Tags: ${Array.isArray(candidate.tags) ? candidate.tags.map((t: any) => t.name).join(', ') : 'Nenhuma'}
`

    // Construir descrição da vaga
    const jobDescription = `
Título: ${job.title}
Descrição: ${job.description}
Requisitos: ${job.requirements || 'Não especificados'}
`

    const service = getAIService()
    const feedback = await service.generatePersonalizedFeedback(
      jobDescription,
      candidateProfile,
      bullet_points
    )

    res.json({
      success: true,
      data: {
        feedback,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Calcular score avançado de compatibilidade
export const calculateAdvancedMatchScore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || (req.user.role !== 'recruiter' && req.user.role !== 'admin')) {
      throw createError('Acesso negado', 403)
    }

    const { job_id, candidate_id } = req.body

    if (!job_id || !candidate_id) {
      throw createError('ID da vaga e do candidato são obrigatórios', 400)
    }

    // Buscar informações da vaga
    const jobResult = await db.query(
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
      [job_id]
    )

    if (jobResult.rows.length === 0) {
      throw createError('Vaga não encontrada', 404)
    }

    const job = jobResult.rows[0]

    // Buscar informações do candidato
    const candidateResult = await db.query(
      `SELECT u.*,
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
      [candidate_id]
    )

    if (candidateResult.rows.length === 0) {
      throw createError('Candidato não encontrado', 404)
    }

    const candidate = candidateResult.rows[0]

    // Processar tags
    let jobTags = []
    let candidateTags = []
    try {
      jobTags = Array.isArray(job.tags) ? job.tags : (job.tags ? JSON.parse(job.tags) : [])
      candidateTags = Array.isArray(candidate.tags) ? candidate.tags : (candidate.tags ? JSON.parse(candidate.tags) : [])
    } catch (e) {
      console.error('Error parsing tags:', e)
    }

    const service = getAIService()
    const result = await service.calculateAdvancedMatchScore(
      {
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        tags: jobTags,
      },
      {
        bio: candidate.bio || '',
        skills: Array.isArray(candidate.skills) ? candidate.skills : [],
        experience: Array.isArray(candidate.experience) ? candidate.experience : [],
        education: Array.isArray(candidate.education) ? candidate.education : [],
        tags: candidateTags,
      }
    )

    res.json({
      success: true,
      data: {
        matchScore: result.score,
        reasons: result.reasons,
      },
    })
  } catch (error) {
    next(error)
  }
}

