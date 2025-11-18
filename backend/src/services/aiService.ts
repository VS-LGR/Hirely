import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ResumeAnalysis {
  skills: string[]
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    description?: string
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
  }>
  bio?: string
  suggestedTags: Array<{ name: string; category: string }>
  strengths: string[]
  suggestions: string[]
}

export interface ReintegrationAnalysis {
  currentArea: string
  suggestedAreas: {
    natural: Array<{
      title: string
      description: string
      reasons: string[]
    }>
    adjacent: Array<{
      title: string
      description: string
      reasons: string[]
    }>
    strategic: Array<{
      title: string
      description: string
      reasons: string[]
    }>
  }
  recommendedCategories: string[]
}

export interface AIService {
  generateJobDescription: (title: string, requirements: string[]) => Promise<string>
  generateJobWithAI: (requirements: string) => Promise<{ title: string; description: string; requirements: string }>
  analyzeResume: (resume: string) => Promise<any>
  analyzeResumeDetailed: (resumeText: string) => Promise<ResumeAnalysis>
  suggestImprovements: (text: string, type: 'resume' | 'cover_letter') => Promise<string>
  generateMatchScore: (jobDescription: string, candidateProfile: string) => Promise<number>
  generatePersonalizedFeedback: (jobDescription: string, candidateProfile: string, bulletPoints: string[]) => Promise<string>
  calculateAdvancedMatchScore: (job: { title: string; description: string; requirements?: string; tags?: any[] }, candidate: { bio?: string; skills?: string[]; experience?: any[]; education?: any[]; tags?: any[] }) => Promise<{ score: number; reasons: string[] }>
  suggestTags: (profile: { bio?: string; skills?: string[]; experience?: any[] }) => Promise<Array<{ name: string; category: string }>>
  chatWithAssistant: (message: string, context?: { profile?: any; history?: any[] }) => Promise<string>
  analyzeReintegration: (currentArea: string, profile?: { bio?: string; experience?: any[]; tags?: any[] }) => Promise<ReintegrationAnalysis>
}

class AIServiceImpl implements AIService {
  async generateJobDescription(title: string, requirements: string[]): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Crie uma descrição de vaga profissional e atrativa para a posição de ${title}.
      
Requisitos: ${requirements.join(', ')}

A descrição deve ser:
- Clara e objetiva
- Atrativa para candidatos qualificados
- Incluir responsabilidades principais
- Mencionar benefícios e oportunidades de crescimento
- Estar em português brasileiro`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recrutamento e seleção. Crie descrições de vagas profissionais e atrativas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error generating job description:', error)
      throw new Error('Erro ao gerar descrição da vaga')
    }
  }

  async analyzeResume(resume: string): Promise<any> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Analise o seguinte currículo e extraia informações estruturadas:
${resume}

Retorne um JSON com:
- skills: array de habilidades
- experience_years: anos de experiência
- education_level: nível de educação
- strengths: pontos fortes
- suggestions: sugestões de melhoria`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de currículos. Retorne sempre JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      })

      const content = completion.choices[0]?.message?.content || '{}'
      return JSON.parse(content)
    } catch (error) {
      console.error('Error analyzing resume:', error)
      throw new Error('Erro ao analisar currículo')
    }
  }

  async suggestImprovements(text: string, type: 'resume' | 'cover_letter'): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Analise o seguinte ${type === 'resume' ? 'currículo' : 'carta de apresentação'} e sugira melhorias:

${text}

Forneça sugestões específicas e práticas para melhorar o ${type === 'resume' ? 'currículo' : 'texto'}.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em ${type === 'resume' ? 'currículos' : 'cartas de apresentação'}.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 600,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error suggesting improvements:', error)
      throw new Error('Erro ao gerar sugestões')
    }
  }

  async generateMatchScore(jobDescription: string, candidateProfile: string): Promise<number> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Analise a compatibilidade entre esta vaga e este candidato:

VAGA:
${jobDescription}

CANDIDATO:
${candidateProfile}

Retorne APENAS um número de 0 a 100 representando o score de compatibilidade.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em matching de candidatos. Retorne apenas um número de 0 a 100.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      })

      const score = parseInt(completion.choices[0]?.message?.content || '0')
      return Math.min(100, Math.max(0, score))
    } catch (error) {
      console.error('Error generating match score:', error)
      return 0
    }
  }

  async analyzeResumeDetailed(resumeText: string): Promise<ResumeAnalysis> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Se não houver API key, retornar estrutura vazia
        return {
          skills: [],
          experience: [],
          education: [],
          suggestedTags: [],
          strengths: [],
          suggestions: ['Configure a chave da API OpenAI para análise completa do currículo'],
        }
      }

      const prompt = `Analise o seguinte currículo e extraia informações estruturadas em formato JSON:

${resumeText}

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "skills": ["habilidade1", "habilidade2", ...],
  "experience": [
    {
      "company": "Nome da Empresa",
      "position": "Cargo",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM" ou null,
      "description": "Descrição das responsabilidades"
    }
  ],
  "education": [
    {
      "institution": "Nome da Instituição",
      "degree": "Grau (ex: Bacharelado, Mestrado)",
      "field": "Área de estudo",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM" ou null
    }
  ],
  "bio": "Resumo profissional em 2-3 frases",
  "suggestedTags": [
    {"name": "Nome da Tag", "category": "Categoria"}
  ],
  "strengths": ["ponto forte 1", "ponto forte 2", ...],
  "suggestions": ["sugestão 1", "sugestão 2", ...]
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de currículos. Sempre retorne APENAS JSON válido, sem texto adicional antes ou depois.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      let content = completion.choices[0]?.message?.content || '{}'
      // Tentar extrair JSON se houver texto adicional
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }
      
      const parsed = JSON.parse(content)
      
      return {
        skills: parsed.skills || [],
        experience: parsed.experience || [],
        education: parsed.education || [],
        bio: parsed.bio,
        suggestedTags: parsed.suggestedTags || [],
        strengths: parsed.strengths || [],
        suggestions: parsed.suggestions || [],
      }
    } catch (error: any) {
      console.error('Error analyzing resume:', error)
      console.error('Error details:', {
        status: error.status,
        statusCode: error.statusCode,
        response: error.response,
        message: error.message,
      })
      
      // Tratar erro de quota excedida (pode vir em diferentes formatos)
      const status = error.status || error.statusCode || error.response?.status
      if (status === 429) {
        throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança na OpenAI.')
      }
      
      // Verificar se a mensagem de erro menciona quota
      if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
        throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança na OpenAI.')
      }
      
      if (error.response) {
        console.error('OpenAI API Error:', error.response.status, error.response.data)
        const errorMessage = error.response.data?.error?.message || error.message
        
        // Mensagens mais amigáveis para erros comuns
        if (error.response.status === 401) {
          throw new Error('Chave da API OpenAI inválida. Verifique a configuração.')
        }
        if (error.response.status === 429) {
          throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança.')
        }
        if (error.response.status === 500 || error.response.status === 503) {
          throw new Error('Serviço da OpenAI temporariamente indisponível. Tente novamente mais tarde.')
        }
        
        throw new Error(`Erro na API OpenAI: ${errorMessage}`)
      }
      
      if (error.message) {
        throw error
      }
      throw new Error('Erro ao analisar currículo')
    }
  }

  async suggestTags(profile: { bio?: string; skills?: string[]; experience?: any[] }): Promise<Array<{ name: string; category: string }>> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Se não houver API key, retornar array vazio
        return []
      }

      const profileText = `
Bio: ${profile.bio || 'Não informado'}
Habilidades: ${profile.skills?.join(', ') || 'Não informado'}
Experiência: ${JSON.stringify(profile.experience || [])}
`

      const prompt = `Com base no perfil do candidato abaixo, sugira tags (habilidades e competências) relevantes:

${profileText}

Retorne APENAS um JSON com array de tags:
{
  "tags": [
    {"name": "Nome da Tag", "category": "Categoria (ex: Tecnologia, Design, Administração)"}
  ]
}

Use categorias como: Tecnologia, Design, Produção, Agricultura, Limpeza, Saúde, Educação, Vendas, Administração, Finanças, Atendimento, Comercial.`

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recrutamento. Sugira tags relevantes baseadas no perfil do candidato. Retorne APENAS JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      })

      let content = completion.choices[0]?.message?.content || '{"tags": []}'
      // Tentar extrair JSON se houver texto adicional
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }
      
      const parsed = JSON.parse(content)
      return parsed.tags || []
    } catch (error: any) {
      console.error('Error suggesting tags:', error)
      
      // Tratar erro de quota excedida - retornar array vazio silenciosamente
      if (error.status === 429 || (error.response && error.response.status === 429)) {
        console.warn('OpenAI quota exceeded for tag suggestions, returning empty array')
        return []
      }
      
      if (error.response) {
        console.error('OpenAI API Error:', error.response.status, error.response.data)
      }
      // Retornar array vazio em caso de erro para não quebrar o fluxo
      return []
    }
  }

  async chatWithAssistant(message: string, context?: { profile?: any; history?: any[] }): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
        console.warn('OPENAI_API_KEY not configured')
        // Se não houver API key, retornar mensagem informativa
        return 'Desculpe, o assistente de IA não está disponível no momento. Por favor, configure a chave da API OpenAI (OPENAI_API_KEY) no arquivo .env do backend para usar esta funcionalidade.'
      }

      console.log('Calling OpenAI API for chat...')

      const systemPrompt = `Você é um assistente de carreira especializado em ajudar candidatos a:
- Construir um perfil profissional completo
- Identificar e destacar suas habilidades
- Melhorar seu currículo e perfil
- Sugerir tags e competências relevantes
- Dar conselhos sobre como se destacar no mercado de trabalho

Seja empático, encorajador e prático. Responda sempre em português brasileiro.`

      const messages: any[] = [
        { role: 'system', content: systemPrompt },
      ]

      // Adicionar contexto do perfil se disponível
      if (context?.profile) {
        messages.push({
          role: 'system',
          content: `Contexto do perfil do candidato:
Nome: ${context.profile.name || 'Não informado'}
Bio: ${context.profile.bio || 'Não informado'}
Habilidades: ${context.profile.skills?.join(', ') || 'Nenhuma'}
Experiência: ${JSON.stringify(context.profile.experience || [])}
Educação: ${JSON.stringify(context.profile.education || [])}`,
        })
      }

      // Adicionar histórico de conversa
      if (context?.history && context.history.length > 0) {
        context.history.forEach((msg: any) => {
          messages.push({ role: msg.role, content: msg.content })
        })
      }

      messages.push({ role: 'user', content: message })

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      })

      console.log('OpenAI API response received')
      return completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
    } catch (error: any) {
      console.error('Error in chatWithAssistant:', error)
      console.error('Error details:', {
        status: error.status,
        statusCode: error.statusCode,
        response: error.response,
        message: error.message,
      })
      
      // Tratar erro de quota excedida (pode vir em diferentes formatos)
      const status = error.status || error.statusCode || error.response?.status
      if (status === 429) {
        throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança na OpenAI.')
      }
      
      // Verificar se a mensagem de erro menciona quota
      if (error.message && (error.message.includes('quota') || error.message.includes('429'))) {
        throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança na OpenAI.')
      }
      
      if (error.response) {
        console.error('OpenAI API Error:', error.response.status, error.response.data)
        const errorMessage = error.response.data?.error?.message || error.message
        
        // Mensagens mais amigáveis para erros comuns
        if (error.response.status === 401) {
          throw new Error('Chave da API OpenAI inválida. Verifique a configuração.')
        }
        if (error.response.status === 429) {
          throw new Error('Cota da API OpenAI excedida. Por favor, verifique seu plano e detalhes de cobrança.')
        }
        if (error.response.status === 500 || error.response.status === 503) {
          throw new Error('Serviço da OpenAI temporariamente indisponível. Tente novamente mais tarde.')
        }
        
        throw new Error(`Erro na API OpenAI: ${errorMessage}`)
      }
      
      if (error.message) {
        throw error
      }
      throw new Error('Erro ao processar mensagem')
    }
  }

  async analyzeReintegration(
    currentArea: string,
    profile?: { bio?: string; experience?: any[]; tags?: any[] }
  ): Promise<ReintegrationAnalysis> {
    // Implementação básica - pode ser melhorada
    // Por enquanto, retorna estrutura vazia se não usar WatsonX
    return {
      currentArea,
      suggestedAreas: {
        natural: [],
        adjacent: [],
        strategic: [],
      },
      recommendedCategories: [],
    }
  }

  async generateJobWithAI(requirements: string): Promise<{ title: string; description: string; requirements: string }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Com base nas seguintes requisições do recrutador, crie uma vaga de trabalho completa e profissional:

REQUISIÇÕES:
${requirements}

Crie:
1. Um título de vaga profissional e atrativo
2. Uma descrição completa e detalhada da vaga (incluindo responsabilidades, contexto da empresa, benefícios)
3. Uma lista de requisitos técnicos e comportamentais

Retorne APENAS um JSON válido no formato:
{
  "title": "Título da Vaga",
  "description": "Descrição completa da vaga...",
  "requirements": "Lista de requisitos formatada..."
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional.`

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em recrutamento. Crie vagas profissionais e atrativas. Sempre retorne APENAS JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      let content = completion.choices[0]?.message?.content || '{}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }

      const parsed = JSON.parse(content)
      return {
        title: parsed.title || '',
        description: parsed.description || '',
        requirements: parsed.requirements || '',
      }
    } catch (error: any) {
      console.error('Error generating job with AI:', error)
      throw new Error('Erro ao gerar vaga com IA')
    }
  }

  async generatePersonalizedFeedback(
    jobDescription: string,
    candidateProfile: string,
    bulletPoints: string[]
  ): Promise<string> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key não configurada')
      }

      const prompt = `Você é um recrutador experiente. Crie um feedback construtivo e personalizado para um candidato que não foi selecionado.

DESCRIÇÃO DA VAGA:
${jobDescription}

PERFIL DO CANDIDATO:
${candidateProfile}

PONTOS ESPECÍFICOS DO RECRUTADOR:
${bulletPoints.map((bp, i) => `${i + 1}. ${bp}`).join('\n')}

Crie um feedback que:
- Seja empático e respeitoso
- Destaque os pontos positivos do candidato
- Explique de forma construtiva as áreas de melhoria
- Inclua os pontos específicos mencionados pelo recrutador
- Seja específico e acionável
- Termine de forma encorajadora

O feedback deve ter entre 3-5 parágrafos e estar em português brasileiro.`

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um recrutador experiente e empático. Crie feedbacks construtivos e personalizados.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      })

      return completion.choices[0]?.message?.content || 'Feedback não disponível.'
    } catch (error: any) {
      console.error('Error generating personalized feedback:', error)
      throw new Error('Erro ao gerar feedback personalizado')
    }
  }

  async calculateAdvancedMatchScore(
    job: { title: string; description: string; requirements?: string; tags?: any[] },
    candidate: { bio?: string; skills?: string[]; experience?: any[]; education?: any[]; tags?: any[] }
  ): Promise<{ score: number; reasons: string[] }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        // Fallback básico sem IA
        return { score: 50, reasons: ['Análise de compatibilidade não disponível'] }
      }

      const jobTags = job.tags?.map((t: any) => t.name).join(', ') || ''
      const candidateTags = candidate.tags?.map((t: any) => t.name).join(', ') || ''
      const candidateSkills = candidate.skills?.join(', ') || ''

      const prompt = `Analise a compatibilidade entre esta vaga e este candidato:

VAGA:
Título: ${job.title}
Descrição: ${job.description}
Requisitos: ${job.requirements || 'Não especificados'}
Tags/Habilidades: ${jobTags}

CANDIDATO:
Bio: ${candidate.bio || 'Não informado'}
Habilidades: ${candidateSkills}
Tags: ${candidateTags}
Experiência: ${JSON.stringify(candidate.experience || [])}
Educação: ${JSON.stringify(candidate.education || [])}

Retorne APENAS um JSON válido:
{
  "score": 85,
  "reasons": [
    "Razão 1 da compatibilidade",
    "Razão 2 da compatibilidade",
    "Área de melhoria 1",
    "Área de melhoria 2"
  ]
}

O score deve ser de 0 a 100. Inclua 2-3 razões positivas e 1-2 áreas de melhoria.`

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em matching de candidatos. Retorne APENAS JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      })

      let content = completion.choices[0]?.message?.content || '{"score": 50, "reasons": []}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        content = jsonMatch[0]
      }

      const parsed = JSON.parse(content)
      return {
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        reasons: parsed.reasons || [],
      }
    } catch (error: any) {
      console.error('Error calculating advanced match score:', error)
      return { score: 50, reasons: ['Erro ao calcular compatibilidade'] }
    }
  }
}

export const aiService = new AIServiceImpl()

// Exportar também o watsonService para uso alternativo
export { watsonService } from './watsonService'


