import api from '@/lib/api'

export interface AIService {
  generateJobDescription: (title: string, requirements: string[]) => Promise<string>
  analyzeResume: (resume: string) => Promise<any>
  suggestImprovements: (text: string, type: 'resume' | 'cover_letter') => Promise<string>
  generateMatchScore: (jobDescription: string, candidateProfile: string) => Promise<number>
}

class AIServiceImpl implements AIService {
  async generateJobDescription(title: string, requirements: string[]): Promise<string> {
    try {
      const response = await api.post('/ai/generate-job-description', {
        title,
        requirements,
      })
      return response.data.data.description
    } catch (error) {
      console.error('Error generating job description:', error)
      throw new Error('Erro ao gerar descrição da vaga')
    }
  }

  async analyzeResume(resume: string): Promise<any> {
    try {
      const response = await api.post('/ai/analyze-resume', { resume })
      return response.data.data.analysis
    } catch (error) {
      console.error('Error analyzing resume:', error)
      throw new Error('Erro ao analisar currículo')
    }
  }

  async suggestImprovements(text: string, type: 'resume' | 'cover_letter'): Promise<string> {
    try {
      const response = await api.post('/ai/suggest-improvements', { text, type })
      return response.data.data.suggestions
    } catch (error) {
      console.error('Error suggesting improvements:', error)
      throw new Error('Erro ao gerar sugestões')
    }
  }

  async generateMatchScore(jobDescription: string, candidateProfile: string): Promise<number> {
    try {
      // Esta funcionalidade será implementada no backend
      // Por enquanto retorna um score simulado
      return Math.floor(Math.random() * 40) + 60 // Score entre 60-100
    } catch (error) {
      console.error('Error generating match score:', error)
      return 0
    }
  }
}

export const aiService = new AIServiceImpl()

