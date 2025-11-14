import dotenv from 'dotenv'
import AssistantV2 from 'ibm-watson/assistant/v2'
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1'
import { IamAuthenticator } from 'ibm-watson/auth'

dotenv.config()

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

export interface WatsonService {
  chatWithAssistant: (message: string, context?: { profile?: any; history?: any[] }) => Promise<string>
  analyzeResumeDetailed: (resumeText: string) => Promise<ResumeAnalysis>
  suggestTags: (profile: { bio?: string; skills?: string[]; experience?: any[] }) => Promise<Array<{ name: string; category: string }>>
}

class WatsonServiceImpl implements WatsonService {
  private assistant: AssistantV2 | null = null
  private nlu: NaturalLanguageUnderstandingV1 | null = null
  private assistantId: string | null = null
  private environmentId: string | null = null

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    // Inicializar Watson Assistant
    if (
      process.env.WATSON_ASSISTANT_API_KEY &&
      process.env.WATSON_ASSISTANT_URL &&
      process.env.WATSON_ASSISTANT_ID
    ) {
      try {
        this.assistant = new AssistantV2({
          version: '2021-11-27',
          authenticator: new IamAuthenticator({
            apikey: process.env.WATSON_ASSISTANT_API_KEY,
          }),
          serviceUrl: process.env.WATSON_ASSISTANT_URL,
        })
        this.assistantId = process.env.WATSON_ASSISTANT_ID
        // environmentId é obrigatório na API do Watson Assistant
        // Se não estiver configurado, usar assistantId como fallback
        // Em muitos casos, o environmentId pode ser o mesmo que o assistantId
        this.environmentId = process.env.WATSON_ENVIRONMENT_ID || process.env.WATSON_ASSISTANT_ID || null
        console.log('✅ Watson Assistant inicializado', {
          assistantId: this.assistantId,
          environmentId: this.environmentId || 'não configurado',
          hasEnvironmentId: !!process.env.WATSON_ENVIRONMENT_ID,
          usingFallback: !process.env.WATSON_ENVIRONMENT_ID && !!process.env.WATSON_ASSISTANT_ID,
          note: this.environmentId 
            ? (process.env.WATSON_ENVIRONMENT_ID ? 'Usando Environment ID configurado' : 'Usando Assistant ID como fallback')
            : '⚠️ ERRO: environmentId não configurado! Configure WATSON_ENVIRONMENT_ID no Vercel.',
        })
      } catch (error) {
        console.error('❌ Erro ao inicializar Watson Assistant:', error)
      }
    } else {
      console.warn('⚠️ Watson Assistant não configurado (variáveis de ambiente ausentes)')
    }

    // Inicializar Natural Language Understanding
    if (
      process.env.WATSON_NLU_API_KEY &&
      process.env.WATSON_NLU_URL
    ) {
      try {
        this.nlu = new NaturalLanguageUnderstandingV1({
          version: '2021-08-01',
          authenticator: new IamAuthenticator({
            apikey: process.env.WATSON_NLU_API_KEY,
          }),
          serviceUrl: process.env.WATSON_NLU_URL,
        })
        console.log('✅ Watson NLU inicializado')
      } catch (error) {
        console.error('❌ Erro ao inicializar Watson NLU:', error)
      }
    } else {
      console.warn('⚠️ Watson NLU não configurado (variáveis de ambiente ausentes)')
    }
  }

  /**
   * Chat com assistente usando Watson Assistant
   */
  async chatWithAssistant(
    message: string,
    context?: { profile?: any; history?: any[] }
  ): Promise<string> {
    try {
      if (!this.assistant || !this.assistantId) {
        return 'Desculpe, o assistente de IA não está disponível no momento. Por favor, configure as credenciais do IBM Watson Assistant.'
      }

      // Obter user_id do contexto ou usar um padrão
      const userId = context?.profile?.id || context?.profile?.name || 'default-user'

      // Criar ou recuperar sessão
      let sessionId = context?.profile?.sessionId
      if (!sessionId) {
        // environmentId é obrigatório na API do Watson Assistant
        if (!this.environmentId) {
          throw new Error('WATSON_ENVIRONMENT_ID não configurado. Configure no Vercel ou use o mesmo valor do WATSON_ASSISTANT_ID.')
        }
        const session = await this.assistant.createSession({
          assistantId: this.assistantId!,
          environmentId: this.environmentId!,
        })
        sessionId = session.result.session_id
      }

      // Preparar contexto do usuário se disponível
      const userContext: any = {}
      if (context?.profile) {
        userContext.profile = {
          name: context.profile.name || 'Candidato',
          bio: context.profile.bio || '',
          skills: context.profile.skills || [],
          experience: context.profile.experience || [],
          education: context.profile.education || [],
          tags: context.profile.tags || [],
        }
      }

      // Enviar mensagem
      // environmentId é obrigatório na API do Watson Assistant
      if (!this.environmentId) {
        throw new Error('WATSON_ENVIRONMENT_ID não configurado. Configure no Vercel ou use o mesmo valor do WATSON_ASSISTANT_ID.')
      }
      const response = await this.assistant.message({
        assistantId: this.assistantId!,
        environmentId: this.environmentId!,
        sessionId: sessionId,
        userId: String(userId),
        input: {
          message_type: 'text',
          text: message,
        },
        context: userContext,
      })

      const output = response.result.output

      if (output.generic && output.generic.length > 0) {
        const firstResponse = output.generic[0] as any
        // Verificar diferentes tipos de resposta
        if (firstResponse.response_type === 'text' && firstResponse.text) {
          return String(firstResponse.text) || 'Desculpe, não consegui processar sua mensagem.'
        }
        // Se for outro tipo de resposta, tentar extrair texto
        if (firstResponse.text) {
          return String(firstResponse.text) || 'Desculpe, não consegui processar sua mensagem.'
        }
        // Se não tiver texto, retornar uma mensagem padrão
        return 'Desculpe, não consegui processar sua mensagem.'
      }

      // Se não houver resposta genérica, verificar se há ações ou outros tipos de resposta
      if (output.actions && output.actions.length > 0) {
        return 'Recebi sua mensagem. Como posso ajudá-lo com seu perfil profissional?'
      }

      return 'Desculpe, não consegui processar sua mensagem.'
    } catch (error: any) {
      console.error('Error in Watson chatWithAssistant:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status || error.statusCode,
        code: error.code,
        assistantId: this.assistantId,
        environmentId: this.environmentId,
        response: error.response?.data || error.body,
      })
      
      // Tratar erro específico de "No valid skills found"
      if (error.message && error.message.includes('No valid skills found')) {
        throw new Error(
          'O Watson Assistant não possui skills configurados. ' +
          'Por favor, configure pelo menos uma skill/action no IBM Cloud. ' +
          'Acesse o Watson Assistant no IBM Cloud e crie uma skill básica.'
        )
      }
      
      // Tratar erro "Resource not found" (404)
      if (
        error.message?.includes('Resource not found') ||
        error.message?.includes('404') ||
        error.status === 404 ||
        error.statusCode === 404
      ) {
        console.error('❌ Resource not found - Verificando IDs:')
        console.error('   Assistant ID:', this.assistantId)
        console.error('   Environment ID:', this.environmentId)
        throw new Error(
          'Recurso não encontrado no Watson Assistant. ' +
          'Verifique se WATSON_ASSISTANT_ID e WATSON_ENVIRONMENT_ID estão corretos no Vercel. ' +
          `Assistant ID atual: ${this.assistantId || 'não configurado'}, ` +
          `Environment ID atual: ${this.environmentId || 'não configurado'}`
        )
      }
      
      if (error.message) {
        throw new Error(`Erro no Watson Assistant: ${error.message}`)
      }
      throw new Error('Erro ao processar mensagem')
    }
  }

  /**
   * Analisar currículo usando Watson NLU
   */
  async analyzeResumeDetailed(resumeText: string): Promise<ResumeAnalysis> {
    try {
      if (!this.nlu) {
        return {
          skills: [],
          experience: [],
          education: [],
          suggestedTags: [],
          strengths: [],
          suggestions: ['Configure o Watson NLU para análise completa do currículo'],
        }
      }

      console.log('Analisando currículo com Watson NLU...')

      // Análise de entidades (empresas, pessoas, locais, etc.)
      const entitiesResult = await this.nlu.analyze({
        text: resumeText,
        features: {
          entities: {
            limit: 50,
          },
          keywords: {
            limit: 50,
            sentiment: false,
          },
          concepts: {
            limit: 30,
          },
        },
      })

      // Extrair informações
      const entities = entitiesResult.result.entities || []
      const keywords = entitiesResult.result.keywords || []
      const concepts = entitiesResult.result.concepts || []

      // Processar entidades para extrair experiência e educação
      const experience: ResumeAnalysis['experience'] = []
      const education: ResumeAnalysis['education'] = []
      const skills: string[] = []

      // Identificar empresas (organizações)
      const companies = entities
        .filter((e) => e.type === 'Organization')
        .map((e) => e.text)

      // Identificar habilidades (keywords relacionados a tecnologia/competências)
      keywords.forEach((keyword: any) => {
        if (keyword.relevance && keyword.relevance > 0.5) {
          skills.push(keyword.text)
        }
      })

      // Identificar conceitos relacionados a educação
      concepts.forEach((concept: any) => {
        if (concept.relevance && concept.relevance > 0.5) {
          if (concept.text.toLowerCase().includes('education') || 
              concept.text.toLowerCase().includes('university') ||
              concept.text.toLowerCase().includes('degree')) {
            // Tentar extrair informações de educação do texto
            const eduMatch = resumeText.match(
              new RegExp(`(${concept.text}[^.]{0,200})`, 'i')
            )
            if (eduMatch) {
              education.push({
                institution: 'Instituição não identificada',
                degree: 'Grau não identificado',
                field: concept.text,
                startDate: '',
              })
            }
          }
        }
      })

      // Criar biografia mais completa e bem formatada
      const topKeywords = keywords
        .filter((k: any) => k.relevance && k.relevance > 0.5)
        .slice(0, 8)
        .map((k: any) => k.text)
      
      const topConcepts = concepts
        .filter((c: any) => c.relevance && c.relevance > 0.6)
        .slice(0, 5)
        .map((c: any) => c.text)
      
      // Construir biografia profissional
      let bio = ''
      if (topKeywords.length > 0) {
        bio = `Profissional com experiência sólida em ${topKeywords.slice(0, 3).join(', ')}`
        if (topKeywords.length > 3) {
          bio += ` e especialização em ${topKeywords.slice(3, 6).join(', ')}`
        }
        if (topConcepts.length > 0) {
          bio += `. Domínio em ${topConcepts.slice(0, 2).join(' e ')}`
        }
        bio += '. Perfil focado em resultados e desenvolvimento contínuo de habilidades técnicas e profissionais.'
      } else {
        bio = 'Profissional dedicado com experiência em diversas áreas. Comprometido com excelência e crescimento contínuo.'
      }

      // Sugerir tags baseadas em keywords e conceitos
      const suggestedTags: Array<{ name: string; category: string }> = []
      keywords.slice(0, 15).forEach((keyword: any) => {
        if (keyword.relevance && keyword.relevance > 0.5) {
          // Tentar determinar categoria baseada no texto
          const keywordText = keyword.text.toLowerCase()
          let category = 'Tecnologia'
          if (keywordText.includes('design') || keywordText.includes('ui') || keywordText.includes('ux')) {
            category = 'Design'
          } else if (keywordText.includes('gestão') || keywordText.includes('liderança') || keywordText.includes('gerenciamento')) {
            category = 'Gestão'
          } else if (keywordText.includes('comunicação') || keywordText.includes('marketing') || keywordText.includes('vendas')) {
            category = 'Comunicação'
          }
          
          suggestedTags.push({
            name: keyword.text,
            category,
          })
        }
      })

      // Pontos fortes baseados em conceitos relevantes
      const strengths = concepts
        .filter((c: any) => c.relevance && c.relevance > 0.7)
        .slice(0, 5)
        .map((c: any) => c.text)

      return {
        skills: skills.slice(0, 20),
        experience,
        education,
        bio: `Perfil profissional com experiência em: ${bio}`,
        suggestedTags,
        strengths,
        suggestions: [
          'Considere adicionar mais detalhes sobre suas experiências profissionais',
          'Inclua informações sobre projetos relevantes',
        ],
      }
    } catch (error: any) {
      console.error('Error analyzing resume with Watson:', error)
      if (error.message) {
        throw new Error(`Erro ao analisar currículo: ${error.message}`)
      }
      throw new Error('Erro ao analisar currículo')
    }
  }

  /**
   * Sugerir tags baseado no perfil
   * Retorna 3-4 tags diferentes, evitando duplicatas
   * IMPORTANTE: Filtra keywords inválidas que não são tags válidas
   */
  async suggestTags(profile: {
    bio?: string
    skills?: string[]
    experience?: any[]
  }): Promise<Array<{ name: string; category: string }>> {
    try {
      if (!this.nlu) {
        return []
      }

      const profileText = `
Bio: ${profile.bio || 'Não informado'}
Habilidades: ${profile.skills?.join(', ') || 'Não informado'}
Experiência: ${JSON.stringify(profile.experience || [])}
`

      const result = await this.nlu.analyze({
        text: profileText,
        features: {
          keywords: {
            limit: 30,
            sentiment: false,
          },
          concepts: {
            limit: 20,
          },
          entities: {
            limit: 20,
          },
        },
      })

      const tags: Array<{ name: string; category: string }> = []
      const seenNames = new Set<string>() // Para evitar duplicatas
      const seenCategories = new Set<string>() // Para garantir diversidade de categorias

      // Palavras/frases que devem ser ignoradas (não são tags válidas)
      const invalidKeywords = [
        'perfil profissional',
        'perfil',
        'profissional',
        'experiência',
        'experiência sólida',
        'sólida',
        'desenvolvimento',
        'desenvolvimento contínuo',
        'habilidades técnicas',
        'habilidades profissionais',
        'resultados',
        'focado',
        'domínio',
        'especialização',
        'contínuo',
        'técnicas',
        'profissionais',
      ]

      // Função para normalizar nome de tag
      const normalizeTagName = (name: string) => 
        name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()

      // Função para verificar se é keyword inválida
      const isInvalidKeyword = (text: string): boolean => {
        const normalized = normalizeTagName(text)
        return invalidKeywords.some(invalid => 
          normalized.includes(invalid) || invalid.includes(normalized)
        )
      }

      // Função para determinar categoria baseada no texto
      const determineCategory = (text: string): string => {
        const lowerText = text.toLowerCase()
        if (lowerText.includes('design') || lowerText.includes('ui') || lowerText.includes('ux') || 
            lowerText.includes('visual') || lowerText.includes('criativo') || lowerText.includes('motion')) {
          return 'Design'
        } else if (lowerText.includes('gestão') || lowerText.includes('liderança') || 
                   lowerText.includes('gerenciamento') || lowerText.includes('management')) {
          return 'Gestão'
        } else if (lowerText.includes('comunicação') || lowerText.includes('marketing') || 
                   lowerText.includes('vendas') || lowerText.includes('comercial')) {
          return 'Comunicação'
        } else if (lowerText.includes('front') || lowerText.includes('back') || 
                   lowerText.includes('desenvolvimento') || lowerText.includes('programação') ||
                   lowerText.includes('javascript') || lowerText.includes('python') ||
                   lowerText.includes('api') || lowerText.includes('web') ||
                   lowerText.includes('github') || lowerText.includes('interaction')) {
          return 'Tecnologia'
        } else if (lowerText.includes('educação') || lowerText.includes('ensino') || 
                   lowerText.includes('pedagogia')) {
          return 'Educação'
        } else if (lowerText.includes('saúde') || lowerText.includes('médico') || 
                   lowerText.includes('enfermagem')) {
          return 'Saúde'
        } else if (lowerText.includes('finanças') || lowerText.includes('contabilidade') || 
                   lowerText.includes('financeiro')) {
          return 'Finanças'
        }
        return 'Tecnologia' // Padrão
      }

      // Adicionar keywords como tags (prioridade alta)
      const keywords = result.result.keywords || []
      keywords
        .filter((keyword: any) => 
          keyword.relevance && 
          keyword.relevance > 0.5 &&
          !isInvalidKeyword(keyword.text) &&
          keyword.text.length > 2 && // Ignorar palavras muito curtas
          keyword.text.length < 50 // Ignorar frases muito longas
        )
        .sort((a: any, b: any) => (b.relevance || 0) - (a.relevance || 0))
        .forEach((keyword: any) => {
          const normalizedName = normalizeTagName(keyword.text)
          if (!seenNames.has(normalizedName) && tags.length < 6) {
            const category = determineCategory(keyword.text)
            // Priorizar diversidade de categorias
            if (tags.length < 2 || !seenCategories.has(category) || tags.length < 4) {
              tags.push({
                name: keyword.text,
                category,
              })
              seenNames.add(normalizedName)
              seenCategories.add(category)
            }
          }
        })

      // Se ainda não temos 3-4 tags, adicionar de concepts
      if (tags.length < 4) {
        const concepts = result.result.concepts || []
        concepts
          .filter((concept: any) => 
            concept.relevance && 
            concept.relevance > 0.6 &&
            !isInvalidKeyword(concept.text) &&
            concept.text.length > 2 &&
            concept.text.length < 50
          )
          .sort((a: any, b: any) => (b.relevance || 0) - (a.relevance || 0))
          .forEach((concept: any) => {
            const normalizedName = normalizeTagName(concept.text)
            if (!seenNames.has(normalizedName) && tags.length < 6) {
              const category = determineCategory(concept.text)
              // Priorizar diversidade de categorias
              if (!seenCategories.has(category) || tags.length < 4) {
                tags.push({
                  name: concept.text,
                  category,
                })
                seenNames.add(normalizedName)
                seenCategories.add(category)
              }
            }
          })
      }

      // Se ainda não temos 3-4 tags, adicionar de entities (tecnologias específicas)
      if (tags.length < 4) {
        const entities = result.result.entities || []
        entities
          .filter((entity: any) => 
            (entity.type === 'Technology' || entity.type === 'Software') &&
            entity.relevance && entity.relevance > 0.5 &&
            !isInvalidKeyword(entity.text) &&
            entity.text.length > 2 &&
            entity.text.length < 50
          )
          .sort((a: any, b: any) => (b.relevance || 0) - (a.relevance || 0))
          .forEach((entity: any) => {
            const normalizedName = normalizeTagName(entity.text)
            if (!seenNames.has(normalizedName) && tags.length < 6) {
              const category = determineCategory(entity.text)
              if (!seenCategories.has(category) || tags.length < 4) {
                tags.push({
                  name: entity.text,
                  category,
                })
                seenNames.add(normalizedName)
                seenCategories.add(category)
              }
            }
          })
      }

      // Garantir pelo menos 3 tags (se possível)
      // Se ainda não temos 3, pegar mais keywords mesmo que de mesma categoria
      if (tags.length < 3) {
        keywords
          .filter((keyword: any) => 
            keyword.relevance && 
            keyword.relevance > 0.4 &&
            !isInvalidKeyword(keyword.text) &&
            keyword.text.length > 2 &&
            keyword.text.length < 50
          )
          .sort((a: any, b: any) => (b.relevance || 0) - (a.relevance || 0))
          .forEach((keyword: any) => {
            const normalizedName = normalizeTagName(keyword.text)
            if (!seenNames.has(normalizedName) && tags.length < 4) {
              const category = determineCategory(keyword.text)
              tags.push({
                name: keyword.text,
                category,
              })
              seenNames.add(normalizedName)
            }
          })
      }

      // Retornar 3-4 tags (priorizar as mais relevantes)
      return tags.slice(0, 4)
    } catch (error: any) {
      console.error('Error suggesting tags with Watson:', error)
      return []
    }
  }
}

export const watsonService = new WatsonServiceImpl()

