import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIService {
  generateJobDescription: (title: string, requirements: string[]) => Promise<string>
  analyzeResume: (resume: string) => Promise<any>
  suggestImprovements: (text: string, type: 'resume' | 'cover_letter') => Promise<string>
  generateMatchScore: (jobDescription: string, candidateProfile: string) => Promise<number>
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
}

export const aiService = new AIServiceImpl()


