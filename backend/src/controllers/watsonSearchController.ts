import { Request, Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { db } from '../database/connection'

/**
 * Endpoint para o Watson Assistant Custom Service
 * Retorna informações sobre tags, dicas de carreira, etc.
 * Formato compatível com Watson Assistant Search API
 */
export const watsonSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Log para debug
    console.log('Watson Search Request:', {
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers['content-type'],
    })

    // O Watson pode enviar a query no body (POST) ou query params (GET)
    // Também pode enviar como string ou objeto
    let query: string | undefined
    
    if (req.method === 'POST') {
      // POST: query pode estar em req.body.query ou req.body
      if (typeof req.body === 'string') {
        try {
          const parsed = JSON.parse(req.body)
          query = parsed.query || parsed.text || parsed
        } catch {
          query = req.body
        }
      } else if (req.body) {
        query = req.body.query || req.body.text || req.body.search || req.body
      }
    } else {
      // GET: query pode estar em query params
      query = req.query.query as string || req.query.text as string || req.query.search as string
    }

    // Se query for objeto, tentar extrair string
    if (query && typeof query === 'object') {
      const queryObj = query as any
      query = queryObj.query || queryObj.text || queryObj.search || JSON.stringify(query)
    }

    // Se ainda não tiver query, retornar dicas gerais
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.log('No query provided, returning general tips')
      const generalTips = getCareerTips('geral')
      return res.json({
        search_results: generalTips.map((tip, index) => ({
          result_metadata: {
            score: 0.8,
          },
          title: tip.title,
          body: tip.content,
          highlight: {
            body: [tip.content],
          },
        })),
      })
    }

    const searchTerm = query.toLowerCase().trim()
    console.log('Search term:', searchTerm)

    // Extrair limit do body ou usar padrão
    const limit = (req.body?.limit || req.query?.limit || 10) as number

    // Processar filter e metadata se fornecidos pelo Watson
    const filter = req.body?.filter || req.query?.filter
    const metadata = req.body?.metadata || req.query?.metadata
    
    if (filter) {
      console.log('Filter recebido:', filter)
    }
    
    if (metadata) {
      console.log('Metadata recebido:', metadata)
    }

    // Buscar tags relacionadas
    let tagsResult
    try {
      tagsResult = await db.query(
        `SELECT id, name, category 
         FROM tags 
         WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
         ORDER BY 
           CASE WHEN LOWER(name) = $2 THEN 1 
                WHEN LOWER(name) LIKE $3 THEN 2 
                ELSE 3 END,
           category, name
         LIMIT $4`,
        [`%${searchTerm}%`, searchTerm, `${searchTerm}%`, limit]
      )
      console.log('Tags found:', tagsResult.rows.length)
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continuar mesmo com erro no banco, retornar dicas
      tagsResult = { rows: [] }
    }

    // Criar documentos de conhecimento baseados nas tags
    const knowledgeBase: Array<{
      id: string
      title: string
      text: string
      metadata?: any
    }> = []

    // Adicionar informações sobre tags encontradas
    tagsResult.rows.forEach((tag) => {
      knowledgeBase.push({
        id: `tag-${tag.id}`,
        title: `Tag: ${tag.name}`,
        text: `${tag.name} é uma habilidade na categoria ${tag.category}. ${
          tag.category === 'Tecnologia'
            ? 'Esta é uma hard skill técnica que pode ser demonstrada através de projetos e experiência prática.'
            : 'Esta é uma competência importante para o desenvolvimento profissional.'
        }`,
        metadata: {
          type: 'tag',
          category: tag.category,
          tag_id: tag.id,
        },
      })
    })

    // Adicionar documentos de conhecimento sobre carreira
    const careerTips = getCareerTips(searchTerm)
    careerTips.forEach((tip, index) => {
      knowledgeBase.push({
        id: `tip-${knowledgeBase.length + index}`,
        title: tip.title,
        text: tip.content,
        metadata: {
          type: 'career_tip',
          category: tip.category,
        },
      })
    })

    // Se não encontrou nada, adicionar dicas gerais
    if (knowledgeBase.length === 0) {
      const generalTips = getCareerTips('geral')
      generalTips.forEach((tip, index) => {
        knowledgeBase.push({
          id: `general-tip-${index}`,
          title: tip.title,
          text: tip.content,
          metadata: {
            type: 'career_tip',
            category: tip.category,
          },
        })
      })
    }

    console.log('Returning results:', knowledgeBase.length)

    // Formato de resposta compatível com Watson Assistant Custom Service
    // Documentação: https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-search-custom-service
    res.json({
      search_results: knowledgeBase.map((doc) => ({
        result_metadata: {
          score: 1.0, // Relevância (pode ser calculada)
        },
        title: doc.title,
        body: doc.text,
        url: doc.metadata?.url || undefined, // Opcional
        // highlight é opcional e será usado em vez de body para Conversational Search
        highlight: {
          body: [doc.text], // Usar o texto como highlight
        },
      })),
    })
  } catch (error) {
    console.error('Error in watsonSearch:', error)
    // Retornar dicas gerais em caso de erro, não vazio
    const generalTips = getCareerTips('geral')
    res.json({
      search_results: generalTips.map((tip, index) => ({
        result_metadata: {
          score: 0.5,
        },
        title: tip.title,
        body: tip.content,
        highlight: {
          body: [tip.content],
        },
      })),
    })
  }
}

/**
 * Retorna dicas de carreira baseadas na query
 */
function getCareerTips(query: string): Array<{ title: string; content: string; category: string }> {
  const tips: Array<{ title: string; content: string; category: string }> = []

  // Dicas sobre tags/habilidades
  if (query.includes('tag') || query.includes('habilidade') || query.includes('skill')) {
    tips.push({
      title: 'Sobre Tags e Habilidades',
      content: 'Hard skills são competências técnicas mensuráveis (React, Python, SQL). Soft skills são comportamentais (Liderança, Comunicação). Selecione tags relevantes do sistema baseadas em sua experiência.',
      category: 'tags',
    })
  }

  // Dicas sobre biografia
  if (query.includes('biografia') || query.includes('bio') || query.includes('perfil')) {
    tips.push({
      title: 'Como Escrever uma Boa Biografia',
      content: 'Seja concisa (2-4 parágrafos), destaque seu valor único, mencione conquistas com números, seja específica e evite clichês. Estrutura: Apresentação + Expertise, Experiências + Conquistas, Objetivos profissionais.',
      category: 'biography',
    })
  }

  // Dicas sobre experiência
  if (query.includes('experiência') || query.includes('currículo') || query.includes('cv')) {
    tips.push({
      title: 'Como Descrever Experiências',
      content: 'Use verbos de ação (Desenvolveu, Implementou, Liderou), quantifique resultados, destaque tecnologias utilizadas e foque em impactos e conquistas, não apenas tarefas.',
      category: 'experience',
    })
  }

  // Dicas sobre educação
  if (query.includes('educação') || query.includes('formação') || query.includes('curso')) {
    tips.push({
      title: 'Informações sobre Educação',
      content: 'Inclua instituição, curso/grau, área de estudo, período e destaques relevantes como menções honrosas, projetos ou TCC destacado.',
      category: 'education',
    })
  }

  // Dicas gerais de carreira
  if (query.includes('carreira') || query.includes('desenvolvimento') || query.includes('profissional')) {
    tips.push({
      title: 'Desenvolvimento Profissional',
      content: 'Mantenha suas habilidades atualizadas, busque certificações relevantes, participe de projetos pessoais, construa um portfólio e esteja atento às tendências do mercado.',
      category: 'career',
    })
  }

  // Se não encontrou nenhuma dica específica, retornar dicas gerais
  if (tips.length === 0 || query === 'geral') {
    tips.push({
      title: 'Bem-vindo à Hirely',
      content: 'Eu sou a Ellie, sua assistente de carreira. Posso ajudá-lo a melhorar seu perfil profissional, sugerir tags relevantes, melhorar sua biografia e experiência, e muito mais. Como posso ajudá-lo hoje?',
      category: 'general',
    })
    tips.push({
      title: 'Dicas Gerais de Perfil',
      content: 'Um perfil completo inclui: biografia concisa destacando seu valor único, experiência profissional com verbos de ação e resultados quantificados, educação e formação, e tags relevantes (hard e soft skills).',
      category: 'general',
    })
  }

  return tips
}

/**
 * Health check para o Custom Service
 */
export const watsonSearchHealth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      status: 'ok',
      service: 'Hirely Watson Search',
      version: '1.0.0',
    })
  } catch (error) {
    next(error)
  }
}

