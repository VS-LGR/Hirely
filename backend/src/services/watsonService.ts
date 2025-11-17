import dotenv from 'dotenv'
import AssistantV2 from 'ibm-watson/assistant/v2'
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1'
import { IamAuthenticator } from 'ibm-watson/auth'
import { db } from '../database/connection'
import { AIService, ReintegrationAnalysis } from './aiService'

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

class WatsonServiceImpl implements WatsonService, AIService {
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
            // Fazer requisição HTTP para buscar cursos usando axios
            const axios = (await import('axios')).default
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
        
        // Adicionar informações sobre cursos no contexto se relevante
        if (mentionsReintegration && coursesInfo) {
          userContext.courses_info = coursesInfo
        }
      }
      
      // Adicionar informações de cursos à mensagem se mencionar reintegração
      let enhancedMessage = message
      if (mentionsReintegration && coursesInfo) {
        enhancedMessage = `${message}\n\n${coursesInfo}`
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
          text: enhancedMessage,
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

      // Criar biografia mais completa e bem formatada (2-4 parágrafos)
      const topKeywords = keywords
        .filter((k: any) => k.relevance && k.relevance > 0.5)
        .slice(0, 12)
        .map((k: any) => k.text)
      
      const topConcepts = concepts
        .filter((c: any) => c.relevance && c.relevance > 0.6)
        .slice(0, 6)
        .map((c: any) => c.text)
      
      // Construir biografia profissional estruturada
      let bio = ''
      
      if (topKeywords.length > 0 || topConcepts.length > 0) {
        // Primeiro parágrafo: Apresentação e principais competências
        const mainSkills = topKeywords.slice(0, 4).join(', ')
        bio = `Profissional com experiência sólida em ${mainSkills}`
        
        if (topKeywords.length > 4) {
          const secondarySkills = topKeywords.slice(4, 7).join(', ')
          bio += `, com conhecimento adicional em ${secondarySkills}`
        }
        
        if (topConcepts.length > 0) {
          const mainConcepts = topConcepts.slice(0, 2).join(' e ')
          bio += `. Possui domínio em ${mainConcepts}`
        }
        
        bio += '.\n\n'
        
        // Segundo parágrafo: Experiência e resultados
        if (companies.length > 0) {
          const mainCompanies = companies.slice(0, 2).join(' e ')
          bio += `Experiência profissional desenvolvida em empresas como ${mainCompanies}`
          if (companies.length > 2) {
            bio += `, entre outras organizações de destaque`
          }
          bio += '. '
        }
        
        bio += 'Focado em resultados e na entrega de soluções de alta qualidade, com histórico comprovado de contribuições significativas em projetos desafiadores.\n\n'
        
        // Terceiro parágrafo: Diferenciais e objetivos
        if (topConcepts.length > 2) {
          const additionalConcepts = topConcepts.slice(2, 4).join(' e ')
          bio += `Especialização em ${additionalConcepts}, demonstrando capacidade de adaptação e aprendizado contínuo. `
        }
        
        bio += 'Comprometido com a excelência profissional e o desenvolvimento constante de habilidades técnicas e comportamentais, sempre buscando agregar valor e inovação aos projetos e equipes.'
        
        // Quarto parágrafo (opcional): Pontos fortes adicionais
        if (topKeywords.length > 7) {
          const additionalSkills = topKeywords.slice(7, 10).join(', ')
          bio += `\n\nAlém disso, possui conhecimento em ${additionalSkills}, ampliando sua versatilidade e capacidade de atuação em diferentes contextos profissionais.`
        }
      } else {
        // Bio genérica se não houver keywords/conceitos suficientes
        bio = 'Profissional dedicado com experiência em diversas áreas, comprometido com excelência e crescimento contínuo. Perfil versátil com capacidade de adaptação e aprendizado rápido, sempre focado em resultados e na entrega de qualidade.'
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
   * IMPORTANTE: Filtra keywords inválidas e apenas sugere tags que existem no banco
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

      // Buscar todas as tags disponíveis do banco
      let availableTags: Array<{ id: number; name: string; category: string }> = []
      try {
        const tagsResult = await db.query(
          'SELECT id, name, category FROM tags ORDER BY category, name'
        )
        availableTags = tagsResult.rows
        console.log(`📋 Tags disponíveis no banco: ${availableTags.length}`)
      } catch (dbError) {
        console.error('Erro ao buscar tags do banco:', dbError)
        // Continuar mesmo sem tags do banco (fallback)
      }

      // Criar mapas para busca rápida
      const tagsByName = new Map<string, { id: number; name: string; category: string }>()
      const tagsByNormalizedName = new Map<string, { id: number; name: string; category: string }>()
      
      availableTags.forEach(tag => {
        tagsByName.set(tag.name.toLowerCase(), tag)
        const normalized = tag.name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
        tagsByNormalizedName.set(normalized, tag)
      })

      const profileText = `
Bio: ${profile.bio || 'Não informado'}
Habilidades: ${profile.skills?.join(', ') || 'Não informado'}
Experiência: ${JSON.stringify(profile.experience || [])}

Tags disponíveis no sistema (use apenas estas tags):
${availableTags.length > 0 
  ? availableTags.map(t => `- ${t.name} (${t.category})`).join('\n')
  : 'Nenhuma tag disponível'}
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

      // Função para encontrar tag correspondente no banco
      const findMatchingTag = (text: string): { name: string; category: string } | null => {
        const normalizedText = normalizeTagName(text)
        
        // Tentar match exato primeiro
        const exactMatch = tagsByName.get(text.toLowerCase())
        if (exactMatch) {
          return { name: exactMatch.name, category: exactMatch.category }
        }
        
        // Tentar match normalizado
        const normalizedMatch = tagsByNormalizedName.get(normalizedText)
        if (normalizedMatch) {
          return { name: normalizedMatch.name, category: normalizedMatch.category }
        }
        
        // Tentar match parcial (palavras-chave)
        for (const tag of availableTags) {
          const tagNormalized = normalizeTagName(tag.name)
          // Match se o texto contém o nome da tag ou vice-versa
          if (normalizedText.includes(tagNormalized) || tagNormalized.includes(normalizedText)) {
            // Verificar se não é muito genérico (mínimo 3 caracteres)
            if (tagNormalized.length >= 3 && normalizedText.length >= 3) {
              return { name: tag.name, category: tag.category }
            }
          }
        }
        
        // Tentar match por categoria (se o texto menciona uma categoria)
        const categoryKeywords: Record<string, string[]> = {
          'Tecnologia': ['react', 'javascript', 'python', 'node', 'java', 'sql', 'html', 'css', 'typescript', 'vue', 'angular'],
          'Design': ['design', 'ui', 'ux', 'figma', 'photoshop', 'illustrator'],
          'Administração': ['gestão', 'rh', 'recursos humanos', 'administração'],
          'Vendas': ['vendas', 'comercial', 'atendimento'],
          'Marketing': ['marketing', 'digital', 'social media', 'seo'],
        }
        
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(kw => normalizedText.includes(kw) || normalizedText === kw)) {
            // Buscar primeira tag dessa categoria
            const categoryTag = availableTags.find(t => t.category === category)
            if (categoryTag) {
              return { name: categoryTag.name, category: categoryTag.category }
            }
          }
        }
        
        return null
      }

      // Função para determinar categoria baseada no texto (fallback)
      const determineCategory = (text: string): string => {
        const lowerText = text.toLowerCase()
        if (lowerText.includes('design') || lowerText.includes('ui') || lowerText.includes('ux') || 
            lowerText.includes('visual') || lowerText.includes('criativo') || lowerText.includes('motion')) {
          return 'Design'
        } else if (lowerText.includes('gestão') || lowerText.includes('liderança') || 
                   lowerText.includes('gerenciamento') || lowerText.includes('management')) {
          return 'Administração'
        } else if (lowerText.includes('comunicação') || lowerText.includes('marketing') || 
                   lowerText.includes('vendas') || lowerText.includes('comercial')) {
          return 'Vendas'
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
          return 'Administração'
        }
        return 'Tecnologia' // Padrão
      }

      // Adicionar keywords como tags (prioridade alta) - apenas se existirem no banco
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
          const matchingTag = findMatchingTag(keyword.text)
          if (matchingTag) {
            const normalizedName = normalizeTagName(matchingTag.name)
            if (!seenNames.has(normalizedName) && tags.length < 6) {
              // Priorizar diversidade de categorias
              if (tags.length < 2 || !seenCategories.has(matchingTag.category) || tags.length < 4) {
                tags.push({
                  name: matchingTag.name,
                  category: matchingTag.category,
                })
                seenNames.add(normalizedName)
                seenCategories.add(matchingTag.category)
              }
            }
          }
        })

      // Se ainda não temos 3-4 tags, adicionar de concepts - apenas se existirem no banco
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
            const matchingTag = findMatchingTag(concept.text)
            if (matchingTag) {
              const normalizedName = normalizeTagName(matchingTag.name)
              if (!seenNames.has(normalizedName) && tags.length < 6) {
                // Priorizar diversidade de categorias
                if (!seenCategories.has(matchingTag.category) || tags.length < 4) {
                  tags.push({
                    name: matchingTag.name,
                    category: matchingTag.category,
                  })
                  seenNames.add(normalizedName)
                  seenCategories.add(matchingTag.category)
                }
              }
            }
          })
      }

      // Se ainda não temos 3-4 tags, adicionar de entities (tecnologias específicas) - apenas se existirem no banco
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
            const matchingTag = findMatchingTag(entity.text)
            if (matchingTag) {
              const normalizedName = normalizeTagName(matchingTag.name)
              if (!seenNames.has(normalizedName) && tags.length < 6) {
                if (!seenCategories.has(matchingTag.category) || tags.length < 4) {
                  tags.push({
                    name: matchingTag.name,
                    category: matchingTag.category,
                  })
                  seenNames.add(normalizedName)
                  seenCategories.add(matchingTag.category)
                }
              }
            }
          })
      }

      // Garantir pelo menos 3 tags (se possível)
      // Se ainda não temos 3, pegar mais keywords mesmo que de mesma categoria - apenas se existirem no banco
      if (tags.length < 3 && availableTags.length > 0) {
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
            const matchingTag = findMatchingTag(keyword.text)
            if (matchingTag) {
              const normalizedName = normalizeTagName(matchingTag.name)
              if (!seenNames.has(normalizedName) && tags.length < 4) {
                tags.push({
                  name: matchingTag.name,
                  category: matchingTag.category,
                })
                seenNames.add(normalizedName)
              }
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

  /**
   * Analisar reintegração ao mercado de trabalho
   * Implementação básica - Watson Assistant não suporta análise estruturada como WatsonX
   */
  async analyzeReintegration(
    currentArea: string,
    profile?: { bio?: string; experience?: any[]; tags?: any[] }
  ): Promise<ReintegrationAnalysis> {
    // Watson Assistant não tem capacidade de análise estruturada como WatsonX
    // Retornar estrutura vazia - recomendar usar WatsonX para esta funcionalidade
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

  // Métodos da interface AIService que não são suportados pelo Watson Assistant
  async generateJobDescription(title: string, requirements: string[]): Promise<string> {
    throw new Error('generateJobDescription não é suportado pelo Watson Assistant. Use WatsonX ou OpenAI.')
  }

  async analyzeResume(resume: string): Promise<any> {
    // Usar analyzeResumeDetailed como fallback
    return this.analyzeResumeDetailed(resume)
  }

  async suggestImprovements(text: string, type: 'resume' | 'cover_letter'): Promise<string> {
    throw new Error('suggestImprovements não é suportado pelo Watson Assistant. Use WatsonX ou OpenAI.')
  }

  async generateMatchScore(jobDescription: string, candidateProfile: string): Promise<number> {
    throw new Error('generateMatchScore não é suportado pelo Watson Assistant. Use WatsonX ou OpenAI.')
  }
}

export const watsonService = new WatsonServiceImpl()

