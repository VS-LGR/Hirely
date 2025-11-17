import dotenv from 'dotenv'
import axios from 'axios'
import { AIService, ResumeAnalysis } from './aiService'
import { db } from '../database/connection'

dotenv.config()

class WatsonXServiceImpl implements AIService {
  private apiKey: string | null = null
  private projectId: string | null = null
  private apiUrl: string | null = null
  private modelId: string | null = null
  private deploymentId: string | null = null
  private apiVersion: string = '2021-05-01'
  private iamToken: string | null = null
  private tokenExpiry: number = 0
  private useDeployment: boolean = false

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    this.apiKey = process.env.WATSONX_API_KEY || null
    this.projectId = process.env.WATSONX_PROJECT_ID || null
    this.apiUrl = process.env.WATSONX_API_URL || 'https://us-south.ml.cloud.ibm.com'
    this.modelId = process.env.WATSONX_MODEL_ID || 'meta-llama/llama-3-3-70b-instruct'
    this.deploymentId = process.env.WATSONX_DEPLOYMENT_ID || null
    this.apiVersion = process.env.WATSONX_API_VERSION || '2021-05-01'
    
    // Se tiver deployment ID, usar endpoint de deployment (já tem prompt model configurado)
    this.useDeployment = !!this.deploymentId

    if (this.apiKey && this.projectId) {
      console.log('✅ WatsonX Service inicializado', {
        apiUrl: this.apiUrl,
        modelId: this.modelId,
        projectId: this.projectId?.substring(0, 8) + '...',
        deploymentId: this.deploymentId ? this.deploymentId.substring(0, 8) + '...' : 'não configurado',
        useDeployment: this.useDeployment,
      })
    } else {
      console.warn('⚠️ WatsonX não configurado (variáveis de ambiente ausentes)')
    }
  }

  /**
   * Obter token IAM para autenticação
   * Cacheia o token até expirar (normalmente 1 hora)
   */
  private async getIamToken(): Promise<string> {
    if (!this.apiKey) {
      throw new Error('WATSONX_API_KEY não configurado')
    }

    // Se temos um token válido, retornar
    if (this.iamToken && Date.now() < this.tokenExpiry) {
      return this.iamToken
    }

    try {
      // Obter novo token IAM
      const response = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apiKey,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      )

      const accessToken = response.data.access_token
      if (!accessToken) {
        throw new Error('Token IAM não retornado na resposta')
      }

      this.iamToken = accessToken
      // Token expira em 1 hora, mas vamos renovar 5 minutos antes
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000

      return accessToken
    } catch (error: any) {
      console.error('Erro ao obter token IAM:', error.response?.data || error.message)
      throw new Error('Falha ao autenticar com IBM Cloud IAM')
    }
  }

  /**
   * Chamar API de geração de texto do WatsonX
   * Suporta tanto deployment (com prompt model) quanto text/generation direto
   * @param forceDirectGeneration Se true, força uso de text/generation mesmo com deployment configurado
   */
  private async callTextGeneration(
    prompt: string,
    parameters?: {
      max_new_tokens?: number
      temperature?: number
      decoding_method?: string
    },
    forceDirectGeneration: boolean = false
  ): Promise<string> {
    if (!this.apiKey || !this.projectId || !this.apiUrl) {
      throw new Error('WatsonX não está configurado. Configure WATSONX_API_KEY, WATSONX_PROJECT_ID e WATSONX_API_URL')
    }

    const token = await this.getIamToken()

    // Se usar deployment E não forçar geração direta, usar chat deployment
    if (this.useDeployment && this.deploymentId && !forceDirectGeneration) {
      return await this.callDeploymentChat(prompt, parameters)
    }

    // Formato padrão: text/generation
    if (!this.modelId) {
      throw new Error('WATSONX_MODEL_ID não configurado. Configure WATSONX_MODEL_ID para usar text/generation direto.')
    }

    const requestBody = {
      model_id: this.modelId,
      project_id: this.projectId,
      parameters: {
        decoding_method: parameters?.decoding_method || 'greedy',
        max_new_tokens: parameters?.max_new_tokens || 500,
        temperature: parameters?.temperature || 0.7,
      },
      input: prompt,
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/ml/v1/text/generation?version=${this.apiVersion}`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      // A resposta do WatsonX pode ter diferentes formatos
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0]
        // Pode ser 'generated_text' ou 'text' dependendo do modelo
        return result.generated_text || result.text || ''
      }
      
      // Fallback: tentar outros campos possíveis
      if (response.data.generated_text) {
        return response.data.generated_text
      }
      
      if (response.data.text) {
        return response.data.text
      }

      throw new Error('Resposta vazia do WatsonX')
    } catch (error: any) {
      const status = error.response?.status
      const headers = error.response?.headers || {}
      const retryAfter = headers['retry-after'] || headers['Retry-After']
      
      console.error('❌ Erro ao chamar WatsonX API:', {
        status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        retryAfter: retryAfter ? `${retryAfter} segundos` : 'não especificado',
        rateLimitRemaining: headers['x-ratelimit-remaining'] || headers['X-RateLimit-Remaining'],
        rateLimitReset: headers['x-ratelimit-reset'] || headers['X-RateLimit-Reset'],
        fullHeaders: process.env.NODE_ENV === 'development' ? headers : undefined,
      })

      if (status === 401) {
        // Token pode ter expirado, tentar renovar
        this.iamToken = null
        this.tokenExpiry = 0
        throw new Error('Token IAM expirado ou inválido. Tente novamente.')
      }

      if (status === 400) {
        const errorMsg = error.response.data?.errors?.[0]?.message || 'Requisição inválida'
        throw new Error(`Erro na requisição: ${errorMsg}`)
      }

      if (status === 429) {
        // Rate limit excedido - pode ser por tempo (req/min) ou tokens
        const errorData = error.response?.data
        const errorMsg = errorData?.errors?.[0]?.message || errorData?.message || ''
        
        let message = 'Limite de requisições excedido.'
        
        // Verificar se há informação sobre quando tentar novamente
        if (retryAfter) {
          const seconds = parseInt(retryAfter)
          const minutes = Math.ceil(seconds / 60)
          message += ` Aguarde ${minutes} minuto(s) antes de tentar novamente.`
        } else {
          message += ' Tente novamente em alguns minutos.'
        }
        
        // Adicionar informação sobre tipo de limite se disponível
        if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
          message += ' (Limite de requisições por período de tempo excedido - não relacionado ao limite de tokens mensais)'
        } else if (errorMsg.includes('quota') || errorMsg.includes('token')) {
          message += ' (Limite de tokens pode ter sido excedido)'
        }
        
        console.error('⚠️ Rate Limit Detalhes:', {
          retryAfter,
          errorMessage: errorMsg,
          suggestion: 'Verifique se há limites de requisições por minuto/hora no seu plano WatsonX',
        })
        
        throw new Error(message)
      }

      throw new Error(`Erro ao processar requisição: ${error.response?.data?.errors?.[0]?.message || error.message}`)
    }
  }

  /**
   * Chamar API de chat usando deployment (com prompt model configurado)
   */
  private async callDeploymentChat(
    prompt: string,
    parameters?: {
      max_new_tokens?: number
      temperature?: number
      decoding_method?: string
    }
  ): Promise<string> {
    if (!this.deploymentId) {
      throw new Error('WATSONX_DEPLOYMENT_ID não configurado')
    }

    const token = await this.getIamToken()

    // Formato de mensagens para chat
    const requestBody = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      parameters: {
        max_new_tokens: parameters?.max_new_tokens || 500,
        temperature: parameters?.temperature || 0.7,
      },
    }

    try {
      // Usar endpoint privado ou público dependendo da configuração
      const endpointUrl = process.env.WATSONX_USE_PRIVATE === 'true'
        ? `https://private.us-south.ml.cloud.ibm.com`
        : this.apiUrl

      const response = await axios.post(
        `${endpointUrl}/ml/v1/deployments/${this.deploymentId}/text/chat?version=${this.apiVersion}`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )

      // Log completo da resposta para debug
      console.log('WatsonX Deployment Response:', JSON.stringify(response.data, null, 2))

      // Formato 1: Array direto (formato mais comum do WatsonX chat)
      // [{ index: 0, message: { role: "assistant", content: "..." }, finish_reason: "stop" }]
      if (Array.isArray(response.data) && response.data.length > 0) {
        const firstItem = response.data[0]
        if (firstItem.message && firstItem.message.content) {
          return firstItem.message.content.trim()
        }
        if (firstItem.message && firstItem.message.text) {
          return firstItem.message.text.trim()
        }
      }

      // Formato 2: response.data.results (formato alternativo)
      if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
        const result = response.data.results[0]
        
        // result.message.content
        if (result.message) {
          const content = result.message.content || result.message.text
          if (content) return content.trim()
        }
        
        // result.content
        if (result.content) {
          return result.content.trim()
        }
        
        // result.text
        if (result.text) {
          return result.text.trim()
        }
        
        // result.generated_text
        if (result.generated_text) {
          return result.generated_text.trim()
        }
      }

      // Formato 3: Nível raiz direto
      if (response.data.message) {
        const content = response.data.message.content || response.data.message.text
        if (content) return content.trim()
      }

      if (response.data.content) {
        return response.data.content.trim()
      }

      if (response.data.text) {
        return response.data.text.trim()
      }

      if (response.data.generated_text) {
        return response.data.generated_text.trim()
      }

      // Se chegou aqui, a resposta está vazia ou em formato desconhecido
      console.error('Formato de resposta desconhecido:', response.data)
      throw new Error('Resposta vazia do WatsonX Deployment')
    } catch (error: any) {
      const status = error.response?.status
      const headers = error.response?.headers || {}
      const retryAfter = headers['retry-after'] || headers['Retry-After']
      
      console.error('❌ Erro ao chamar WatsonX Deployment API:', {
        status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        retryAfter: retryAfter ? `${retryAfter} segundos` : 'não especificado',
        rateLimitRemaining: headers['x-ratelimit-remaining'] || headers['X-RateLimit-Remaining'],
        rateLimitReset: headers['x-ratelimit-reset'] || headers['X-RateLimit-Reset'],
        deploymentId: this.deploymentId?.substring(0, 8) + '...',
      })

      if (status === 401) {
        this.iamToken = null
        this.tokenExpiry = 0
        throw new Error('Token IAM expirado ou inválido. Tente novamente.')
      }

      if (status === 400) {
        const errorMsg = error.response.data?.errors?.[0]?.message || 'Requisição inválida'
        throw new Error(`Erro na requisição: ${errorMsg}`)
      }

      if (status === 429) {
        const errorData = error.response?.data
        const errorMsg = errorData?.errors?.[0]?.message || errorData?.message || ''
        
        let message = 'Limite de requisições excedido.'
        
        if (retryAfter) {
          const seconds = parseInt(retryAfter)
          const minutes = Math.ceil(seconds / 60)
          message += ` Aguarde ${minutes} minuto(s) antes de tentar novamente.`
        } else {
          message += ' Tente novamente em alguns minutos.'
        }
        
        if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
          message += ' (Limite de requisições por período de tempo excedido - não relacionado ao limite de tokens mensais)'
        } else if (errorMsg.includes('quota') || errorMsg.includes('token')) {
          message += ' (Limite de tokens pode ter sido excedido)'
        }
        
        console.error('⚠️ Rate Limit Detalhes (Deployment API):', {
          retryAfter,
          errorMessage: errorMsg,
          suggestion: 'Verifique se há limites de requisições por minuto/hora no seu plano WatsonX. Isso é diferente do limite de tokens mensais.',
        })
        
        throw new Error(message)
      }

      throw new Error(`Erro ao processar requisição: ${error.response?.data?.errors?.[0]?.message || error.message}`)
    }
  }

  /**
   * Construir system prompt com contexto do usuário
   */
  private buildSystemPrompt(context?: { profile?: any; system?: any }): string {
    const profile = context?.profile
    const system = context?.system

    let prompt = `Você é a Ellie, uma assistente de carreira especializada em ajudar candidatos a desenvolverem seus perfis profissionais e encontrarem oportunidades no mercado de trabalho.

Você é amigável, profissional e focada em resultados. Sempre forneça conselhos práticos e acionáveis.

`

    if (profile) {
      prompt += `Contexto do candidato:
- Nome: ${profile.name || 'Candidato'}
- Biografia: ${profile.bio || 'Não informado'}
- Tags/Habilidades: ${profile.tags?.map((t: any) => t.name || t).join(', ') || 'Nenhuma'}
- Experiência: ${profile.experience?.length || 0} posição(ões)
- Educação: ${profile.education?.length || 0} formação(ões)

`
    }

    prompt += `Você pode ajudar com:
1. Melhorar biografias e perfis profissionais
2. Sugerir tags baseadas no perfil do candidato
3. Orientar sobre reintegração ao mercado de trabalho
4. Buscar e recomendar cursos na FIAP e Alura
5. Dar dicas de carreira, entrevistas e networking
6. Analisar currículos e sugerir melhorias

Sempre seja específica, prática e encorajadora. Use português brasileiro.`

    return prompt
  }

  /**
   * Construir mensagens para o modelo (formato chat)
   * Se usar deployment, retorna array de mensagens; senão, retorna string de prompt
   */
  private buildMessages(
    systemPrompt: string,
    userMessage: string,
    history?: any[]
  ): string | Array<{ role: string; content: string }> {
    // Se usar deployment, retornar formato de mensagens
    if (this.useDeployment) {
      const messages: Array<{ role: string; content: string }> = []
      
      // Adicionar system prompt como primeira mensagem (se suportado)
      // Nota: Alguns deployments podem não suportar system message
      
      // Adicionar histórico se disponível
      if (history && history.length > 0) {
        history.forEach((msg) => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })
        })
      }
      
      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: userMessage,
      })
      
      return messages
    }

    // Formato padrão: string de prompt
    let fullPrompt = systemPrompt + '\n\n'

    // Adicionar histórico se disponível
    if (history && history.length > 0) {
      fullPrompt += 'Histórico da conversa:\n'
      history.forEach((msg, index) => {
        const role = msg.role === 'user' ? 'Usuário' : 'Ellie'
        fullPrompt += `${role}: ${msg.content}\n`
      })
      fullPrompt += '\n'
    }

    // Adicionar mensagem atual
    fullPrompt += `Usuário: ${userMessage}\n\nEllie:`

    return fullPrompt
  }

  async generateJobDescription(title: string, requirements: string[]): Promise<string> {
    const prompt = `Crie uma descrição de vaga profissional e atrativa para a posição de ${title}.

Requisitos: ${requirements.join(', ')}

A descrição deve ser:
- Clara e objetiva
- Atrativa para candidatos qualificados
- Incluir responsabilidades principais
- Mencionar benefícios e oportunidades de crescimento
- Estar em português brasileiro`

    return await this.callTextGeneration(prompt, {
      max_new_tokens: 1000,
      temperature: 0.7,
    })
  }

  async analyzeResume(resume: string): Promise<any> {
    // Implementação básica - pode ser melhorada
    return this.analyzeResumeDetailed(resume)
  }

  async analyzeResumeDetailed(resumeText: string): Promise<ResumeAnalysis> {
    const prompt = `Analise o seguinte currículo e extraia informações estruturadas:

${resumeText}

Extraia e retorne em formato JSON:
{
  "skills": ["habilidade1", "habilidade2"],
  "experience": [
    {
      "company": "Nome da Empresa",
      "position": "Cargo",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM ou null",
      "description": "Descrição breve"
    }
  ],
  "education": [
    {
      "institution": "Nome da Instituição",
      "degree": "Grau",
      "field": "Área",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM ou null"
    }
  ],
  "bio": "Biografia profissional gerada baseada no currículo. Use 2-4 parágrafos bem estruturados, separados por quebras de linha duplas (\\n\\n). Cada parágrafo deve ter 3-5 frases. Seja específico sobre habilidades, experiência e objetivos profissionais.",
  "suggestedTags": [
    {"name": "Tag1", "category": "Categoria1"}
  ],
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "suggestions": ["sugestão 1", "sugestão 2"]
}

Seja preciso e extraia apenas informações claramente presentes no currículo.`

    try {
      // Forçar uso de text/generation direto para análise de currículo (não usar deployment)
      const response = await this.callTextGeneration(prompt, {
        max_new_tokens: 1500,
        temperature: 0.3, // Menor temperatura para análise mais precisa
      }, true) // forceDirectGeneration = true

      // Tentar extrair JSON da resposta - melhorar parsing para lidar com JSON mal formatado
      let parsed: any = null
      
      // Tentar encontrar JSON válido na resposta
      // Procurar pelo primeiro { e encontrar o último } válido (balanceado)
      const firstBrace = response.indexOf('{')
      if (firstBrace >= 0) {
        let braceCount = 0
        let validEnd = -1
        
        // Encontrar o último } que fecha o objeto JSON principal
        for (let i = firstBrace; i < response.length; i++) {
          if (response[i] === '{') braceCount++
          if (response[i] === '}') {
            braceCount--
            if (braceCount === 0) {
              validEnd = i
              break
            }
          }
        }
        
        if (validEnd > firstBrace) {
          const jsonCandidate = response.substring(firstBrace, validEnd + 1)
          
          try {
            // Tentar parse direto
            parsed = JSON.parse(jsonCandidate)
          } catch (parseError: any) {
            console.error('Erro ao parsear JSON da análise de currículo:', {
              error: parseError.message,
              position: parseError.message.match(/position (\d+)/)?.[1],
              jsonPreview: jsonCandidate.substring(0, 500),
              jsonLength: jsonCandidate.length,
            })
          }
        }
      }
      
      if (parsed) {
        return {
          skills: parsed.skills || [],
          experience: parsed.experience || [],
          education: parsed.education || [],
          bio: parsed.bio || '',
          suggestedTags: parsed.suggestedTags || [],
          strengths: parsed.strengths || [],
          suggestions: parsed.suggestions || [],
        }
      }

      // Se não conseguir extrair JSON, retornar estrutura básica
      return {
        skills: [],
        experience: [],
        education: [],
        bio: response,
        suggestedTags: [],
        strengths: [],
        suggestions: ['Análise completa do currículo'],
      }
    } catch (error: any) {
      console.error('Erro ao analisar currículo com WatsonX:', error)
      throw new Error(`Erro ao analisar currículo: ${error.message}`)
    }
  }

  async suggestImprovements(text: string, type: 'resume' | 'cover_letter'): Promise<string> {
    const typeName = type === 'resume' ? 'currículo' : 'carta de apresentação'
    const prompt = `Analise o seguinte ${typeName} e forneça sugestões de melhoria específicas e acionáveis:

${text}

Forneça sugestões práticas e específicas para melhorar o ${typeName}. Seja construtivo e focado em resultados.`

    return await this.callTextGeneration(prompt, {
      max_new_tokens: 800,
      temperature: 0.7,
    })
  }

  async generateMatchScore(jobDescription: string, candidateProfile: string): Promise<number> {
    const prompt = `Analise a correspondência entre a vaga e o perfil do candidato:

DESCRIÇÃO DA VAGA:
${jobDescription}

PERFIL DO CANDIDATO:
${candidateProfile}

Retorne APENAS um número de 0 a 100 representando o percentual de correspondência. Não inclua texto adicional, apenas o número.`

    try {
      const response = await this.callTextGeneration(prompt, {
        max_new_tokens: 10,
        temperature: 0.1, // Muito baixa para resultado consistente
      })

      const score = parseInt(response.trim())
      if (!isNaN(score) && score >= 0 && score <= 100) {
        return score
      }

      return 50 // Fallback
    } catch (error) {
      console.error('Erro ao gerar match score:', error)
      return 50
    }
  }

  async suggestTags(profile: { bio?: string; skills?: string[]; experience?: any[] }): Promise<Array<{ name: string; category: string }>> {
    // Buscar tags disponíveis do banco
    let availableTags: Array<{ id: number; name: string; category: string }> = []
    try {
      const tagsResult = await db.query(
        'SELECT id, name, category FROM tags ORDER BY category, name'
      )
      availableTags = tagsResult.rows
    } catch (dbError) {
      console.error('Erro ao buscar tags do banco:', dbError)
    }

    const tagsList = availableTags.length > 0
      ? availableTags.map(t => `- ${t.name} (${t.category})`).join('\n')
      : 'Nenhuma tag disponível'

    const prompt = `Analise o perfil do candidato e sugira 3-4 tags que melhor o descrevem.

PERFIL:
Bio: ${profile.bio || 'Não informado'}
Habilidades: ${profile.skills?.join(', ') || 'Não informado'}
Experiência: ${JSON.stringify(profile.experience || [])}

TAGS DISPONÍVEIS (use APENAS estas tags):
${tagsList}

Retorne APENAS um array JSON com as tags sugeridas no formato:
[
  {"name": "Nome da Tag", "category": "Categoria"},
  {"name": "Nome da Tag", "category": "Categoria"}
]

Seja preciso e sugira apenas tags que existem na lista acima.`

    try {
      const response = await this.callTextGeneration(prompt, {
        max_new_tokens: 200,
        temperature: 0.5,
      })

      // Tentar extrair JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Validar que as tags existem no banco
        const validTags: Array<{ name: string; category: string }> = []
        parsed.forEach((tag: any) => {
          const found = availableTags.find(
            t => t.name.toLowerCase() === tag.name?.toLowerCase() &&
                 t.category.toLowerCase() === tag.category?.toLowerCase()
          )
          if (found) {
            validTags.push({ name: found.name, category: found.category })
          }
        })
        return validTags.slice(0, 4) // Máximo 4 tags
      }

      return []
    } catch (error: any) {
      console.error('Erro ao sugerir tags com WatsonX:', error)
      return []
    }
  }

  async chatWithAssistant(
    message: string,
    context?: { profile?: any; history?: any[] }
  ): Promise<string> {
    try {
      if (!this.apiKey || !this.projectId) {
        return 'Desculpe, o assistente de IA não está disponível no momento. Por favor, configure as credenciais do IBM WatsonX.'
      }

      // Detectar se a mensagem menciona reintegração ou cursos
      const messageLower = message.toLowerCase()
      const mentionsReintegration =
        messageLower.includes('reintegração') ||
        messageLower.includes('reintegrar') ||
        messageLower.includes('recolocar') ||
        messageLower.includes('curso') ||
        messageLower.includes('cursos') ||
        messageLower.includes('fiap') ||
        messageLower.includes('alura') ||
        messageLower.includes('capacitação') ||
        messageLower.includes('treinamento')

      // Buscar cursos relevantes se mencionar reintegração
      let coursesInfo = ''
      if (mentionsReintegration && context?.profile?.tags) {
        try {
          const tagIds = context.profile.tags.map((tag: any) => tag.id || tag).filter(Boolean)
          if (tagIds.length > 0) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001'
            const coursesUrl = `${baseUrl}/api/courses/recommended?userTags=${tagIds.join(',')}`

            const coursesResponse = await axios.get(coursesUrl)
            if (coursesResponse.data?.success) {
              const courses = coursesResponse.data.data?.courses || []

              if (courses.length > 0) {
                coursesInfo = `\n\nCursos disponíveis para reintegração (baseado nas suas tags):\n`
                courses.slice(0, 5).forEach((course: any) => {
                  coursesInfo += `- ${course.title} (${course.provider})`
                  if (course.category) coursesInfo += ` - ${course.category}`
                  if (course.url) coursesInfo += ` - ${course.url}`
                  coursesInfo += '\n'
                })
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar cursos:', error)
          // Continuar mesmo se a busca de cursos falhar
        }
      }

      // Construir prompt completo
      const systemPrompt = this.buildSystemPrompt({
        profile: context?.profile,
        system: {
          name: 'Hirely',
          assistantName: 'Ellie',
        },
      })

      // Adicionar informações de cursos ao contexto se relevante
      let enhancedMessage = message
      if (mentionsReintegration && coursesInfo) {
        enhancedMessage = `${message}\n\n${coursesInfo}`
      }

      // Se usar deployment, construir mensagens no formato correto
      if (this.useDeployment) {
        // Para deployment, o system prompt já está configurado no prompt model
        // Construir array de mensagens com histórico intercalado
        const allMessages: Array<{ role: string; content: string }> = []
        
        // Adicionar histórico se disponível (já vem no formato correto)
        // Remover duplicatas baseado no conteúdo
        const seenMessages = new Set<string>()
        if (context?.history && context.history.length > 0) {
          context.history.forEach((msg: any) => {
            const messageKey = `${msg.role}:${msg.content}`
            if (!seenMessages.has(messageKey)) {
              seenMessages.add(messageKey)
              allMessages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })
            }
          })
        }
        
        // Adicionar mensagem atual (verificar se não é duplicada)
        const currentMessageKey = `user:${enhancedMessage}`
        if (!seenMessages.has(currentMessageKey)) {
          allMessages.push({
            role: 'user',
            content: enhancedMessage,
          })
        }
        
        const token = await this.getIamToken()
        const endpointUrl = process.env.WATSONX_USE_PRIVATE === 'true'
          ? `https://private.us-south.ml.cloud.ibm.com`
          : this.apiUrl

        const response = await axios.post(
          `${endpointUrl}/ml/v1/deployments/${this.deploymentId}/text/chat?version=${this.apiVersion}`,
          {
            messages: allMessages,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.7,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        )

        // Log completo da resposta para debug
        console.log('WatsonX Chat Response (raw):', JSON.stringify(response.data, null, 2))
        console.log('WatsonX Chat Response type:', typeof response.data, Array.isArray(response.data))
        console.log('WatsonX Chat Messages sent:', JSON.stringify(allMessages, null, 2))

        // Formato 1: response.data.choices (formato do WatsonX deployment chat)
        // { choices: [{ index: 0, message: { role: "assistant", content: "..." }, finish_reason: "stop" }] }
        if (response.data.choices && Array.isArray(response.data.choices) && response.data.choices.length > 0) {
          console.log('Detectado formato: response.data.choices')
          const choice = response.data.choices[0]
          console.log('First choice:', JSON.stringify(choice, null, 2))
          
          if (choice.message) {
            const content = choice.message.content || choice.message.text
            if (content) {
              console.log('✅ Extraído conteúdo de choices[0].message.content:', content.substring(0, 100))
              return content.trim()
            }
          }
        }

        // Formato 2: Array direto (formato alternativo)
        // [{ index: 0, message: { role: "assistant", content: "..." }, finish_reason: "stop" }]
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('Detectado formato: Array direto (chat)')
          const firstItem = response.data[0]
          console.log('First item:', JSON.stringify(firstItem, null, 2))
          
          if (firstItem.message) {
            const content = firstItem.message.content || firstItem.message.text
            if (content) {
              console.log('✅ Extraído conteúdo do array direto (chat):', content.substring(0, 100))
              return content.trim()
            }
          }
        }

        // Formato 3: response.data.results (formato alternativo)
        if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          console.log('Detectado formato: response.data.results')
          const result = response.data.results[0]
          
          // result.message.content
          if (result.message) {
            const content = result.message.content || result.message.text
            if (content) {
              console.log('✅ Extraído conteúdo de results[0].message:', content.substring(0, 100))
              return content.trim()
            }
          }
          
          // result.content
          if (result.content) {
            console.log('✅ Extraído conteúdo de results[0].content')
            return result.content.trim()
          }
          
          // result.text
          if (result.text) {
            console.log('✅ Extraído conteúdo de results[0].text')
            return result.text.trim()
          }
          
          // result.generated_text
          if (result.generated_text) {
            console.log('✅ Extraído conteúdo de results[0].generated_text')
            return result.generated_text.trim()
          }
        }

        // Formato 4: Nível raiz direto
        if (response.data.message) {
          console.log('Detectado formato: response.data.message')
          const content = response.data.message.content || response.data.message.text
          if (content) {
            console.log('✅ Extraído conteúdo de data.message')
            return content.trim()
          }
        }

        if (response.data.content) {
          console.log('✅ Extraído conteúdo de data.content')
          return response.data.content.trim()
        }

        if (response.data.text) {
          console.log('✅ Extraído conteúdo de data.text')
          return response.data.text.trim()
        }

        if (response.data.generated_text) {
          console.log('✅ Extraído conteúdo de data.generated_text')
          return response.data.generated_text.trim()
        }

        console.error('❌ Formato de resposta desconhecido no chat. Estrutura completa:', {
          isArray: Array.isArray(response.data),
          hasChoices: !!response.data.choices,
          hasResults: !!response.data.results,
          keys: Object.keys(response.data || {}),
          dataType: typeof response.data,
          dataPreview: JSON.stringify(response.data).substring(0, 500),
        })
        return 'Desculpe, não consegui processar sua mensagem.'
      }

      // Formato padrão: prompt string
      const fullPrompt = this.buildMessages(systemPrompt, enhancedMessage, context?.history) as string

      // Chamar WatsonX
      const response = await this.callTextGeneration(fullPrompt, {
        max_new_tokens: 800,
        temperature: 0.7,
      })

      return response.trim() || 'Desculpe, não consegui processar sua mensagem.'
    } catch (error: any) {
      console.error('Error in WatsonX chatWithAssistant:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })

      if (error.message) {
        throw new Error(`Erro no WatsonX: ${error.message}`)
      }
      throw new Error('Erro ao processar mensagem')
    }
  }
}

export const watsonXService = new WatsonXServiceImpl()

