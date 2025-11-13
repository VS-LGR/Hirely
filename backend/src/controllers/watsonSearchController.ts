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
    // O Watson envia a query no body
    const { query, filter, limit = 10 } = req.body

    if (!query || typeof query !== 'string') {
      // Retornar resultados vazios se não houver query
      return res.json({
        matching_results: 0,
        results: [],
      })
    }

    const searchTerm = query.toLowerCase().trim()

    // Buscar tags relacionadas
    const tagsResult = await db.query(
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
        id: `tip-${index}`,
        title: tip.title,
        text: tip.content,
        metadata: {
          type: 'career_tip',
          category: tip.category,
        },
      })
    })

    // Formato de resposta compatível com Watson Assistant
    res.json({
      matching_results: knowledgeBase.length,
      results: knowledgeBase.map((doc) => ({
        id: doc.id,
        title: doc.title,
        text: doc.text,
        metadata: doc.metadata,
        score: 1.0, // Relevância (pode ser calculada)
      })),
    })
  } catch (error) {
    console.error('Error in watsonSearch:', error)
    // Retornar resposta vazia em caso de erro
    res.json({
      matching_results: 0,
      results: [],
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

