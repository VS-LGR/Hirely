'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIAssistant } from '@/components/ai/AIAssistant'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { GraduationCap, ExternalLink, Filter, Search, Loader2, CheckCircle2, AlertCircle, Target, Sparkles } from 'lucide-react'

interface Course {
  id: number
  title: string
  provider: 'FIAP' | 'ALURA' | 'IBM'
  category: string
  description: string
  duration?: string
  level?: string
  url?: string
  tags?: number[]
}

interface ReintegrationAnalysis {
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

export default function ReintegrationPage() {
  const user = useAuthStore((state) => state.user)
  const [currentArea, setCurrentArea] = useState('')
  const [analysis, setAnalysis] = useState<ReintegrationAnalysis | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<'FIAP' | 'ALURA' | 'IBM' | 'ALL'>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showFreeSearch, setShowFreeSearch] = useState(false)

  // Mutation para análise de reintegração
  const analyzeMutation = useMutation({
    mutationFn: async (area: string) => {
      const response = await api.post('/ai/analyze-reintegration', { currentArea: area })
      return response.data.data.analysis as ReintegrationAnalysis
    },
    onSuccess: (data) => {
      setAnalysis(data)
      if (data.recommendedCategories.length > 0) {
        setSelectedCategory(data.recommendedCategories[0])
      }
    },
  })

  // Buscar cursos por categoria/provider
  const { data: searchResults, isLoading: isLoadingSearch, refetch: refetchSearch } = useQuery({
    queryKey: ['courses-search', selectedCategory, selectedProvider, selectedLevel],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('area', selectedCategory)
      if (selectedProvider !== 'ALL') params.append('provider', selectedProvider)
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel)

      const response = await api.get(`/courses/search?${params.toString()}`)
      return response.data.data
    },
    enabled: false, // Só busca quando o usuário clicar
  })

  const handleAnalyze = () => {
    if (currentArea.trim()) {
      analyzeMutation.mutate(currentArea.trim())
    }
  }

  const handleSearchCourses = () => {
    refetchSearch()
  }

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
    setShowFreeSearch(false)
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown-dark mb-2">
            Reintegração ao Mercado de Trabalho
          </h1>
          <p className="text-brown-soft">
            Informe sua área atual de trabalho e receba sugestões personalizadas de áreas de transição para o mercado do futuro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário e Filtros */}
          <div className="lg:col-span-1 space-y-6">
            {/* Formulário de Análise */}
            {!analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Análise de Reintegração
                  </CardTitle>
                  <CardDescription>
                    Informe sua área atual para receber sugestões da Ellie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentArea">Área Atual de Trabalho</Label>
                    <Input
                      id="currentArea"
                      placeholder="Ex: Transporte de materiais, Atendimento ao cliente..."
                      value={currentArea}
                      onChange={(e) => setCurrentArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Descreva brevemente sua área ou função atual
                    </p>
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    className="w-full" 
                    disabled={!currentArea.trim() || analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analisar com Ellie
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Busca Livre de Cursos */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Buscar Cursos
                  </CardTitle>
                  <CardDescription>
                    {showFreeSearch 
                      ? 'Busque cursos livremente por categoria'
                      : 'Busque cursos nas categorias sugeridas ou livremente'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showFreeSearch && analysis.recommendedCategories.length > 0 && (
                    <div className="space-y-2">
                      <Label>Categorias Sugeridas</Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.recommendedCategories.map((cat) => (
                          <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSelectCategory(cat)}
                          >
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setShowFreeSearch(!showFreeSearch)
                      setSelectedCategory('')
                    }}
                  >
                    {showFreeSearch ? 'Usar categorias sugeridas' : 'Buscar livremente'}
                  </Button>

                  {showFreeSearch && (
                    <div className="space-y-2">
                      <Label htmlFor="freeCategory">Categoria</Label>
                      <Input
                        id="freeCategory"
                        placeholder="Ex: Desenvolvimento, Marketing, Gestão..."
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCourses()}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="provider">Provedor</Label>
                    <select
                      id="provider"
                      className="w-full px-3 py-2 border border-brown-light rounded-md bg-bege-light text-brown-dark"
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as any)}
                    >
                      <option value="ALL">Todos</option>
                      <option value="FIAP">FIAP</option>
                      <option value="ALURA">Alura</option>
                      <option value="IBM">IBM</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Nível</Label>
                    <select
                      id="level"
                      className="w-full px-3 py-2 border border-brown-light rounded-md bg-bege-light text-brown-dark"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      <option value="ALL">Todos</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>

                  <Button 
                    onClick={handleSearchCourses} 
                    className="w-full" 
                    disabled={!selectedCategory || isLoadingSearch}
                  >
                    {isLoadingSearch ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Buscar Cursos
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Assistente Ellie */}
            <Card>
              <CardHeader>
                <CardTitle>Fale com a Ellie</CardTitle>
                <CardDescription>
                  Peça ajuda adicional à Ellie sobre reintegração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  {showAIAssistant ? 'Fechar Assistente' : 'Abrir Assistente'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {/* Análise de Reintegração */}
            {analysis && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sugestões de Áreas de Transição</CardTitle>
                    <CardDescription>
                      Baseado na sua área atual: <strong>{analysis.currentArea}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Transição Natural */}
                    {analysis.suggestedAreas.natural.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-brown-dark">
                            Transição Natural (✔️)
                          </h3>
                        </div>
                        <p className="text-sm text-brown-soft mb-4">
                          Mesma área, menos risco de obsolescência. Aproveita quase 100% das habilidades atuais.
                        </p>
                        <div className="space-y-4">
                          {analysis.suggestedAreas.natural.map((area, idx) => (
                            <Card key={idx} className="bg-green-50 border-green-200">
                              <CardContent className="pt-4">
                                <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                                <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                                <ul className="space-y-1">
                                  {area.reasons.map((reason, rIdx) => (
                                    <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                      <span className="text-green-600 mt-1">✓</span>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transição Adjacente */}
                    {analysis.suggestedAreas.adjacent.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <h3 className="text-lg font-semibold text-brown-dark">
                            Transição Adjacente (🟨)
                          </h3>
                        </div>
                        <p className="text-sm text-brown-soft mb-4">
                          Usa habilidades parecidas + skills novos. Requer upskilling moderado.
                        </p>
                        <div className="space-y-4">
                          {analysis.suggestedAreas.adjacent.map((area, idx) => (
                            <Card key={idx} className="bg-yellow-50 border-yellow-200">
                              <CardContent className="pt-4">
                                <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                                <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                                <ul className="space-y-1">
                                  {area.reasons.map((reason, rIdx) => (
                                    <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                      <span className="text-yellow-600 mt-1">→</span>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transição Estratégica */}
                    {analysis.suggestedAreas.strategic.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Target className="h-5 w-5 text-red-600" />
                          <h3 className="text-lg font-semibold text-brown-dark">
                            Transição Estratégica (🟥)
                          </h3>
                        </div>
                        <p className="text-sm text-brown-soft mb-4">
                          Nova área com grande empregabilidade. Mobilidade social real.
                        </p>
                        <div className="space-y-4">
                          {analysis.suggestedAreas.strategic.map((area, idx) => (
                            <Card key={idx} className="bg-red-50 border-red-200">
                              <CardContent className="pt-4">
                                <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                                <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                                <ul className="space-y-1">
                                  {area.reasons.map((reason, rIdx) => (
                                    <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                      <span className="text-red-600 mt-1">•</span>
                                      <span>{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cursos */}
            {searchResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Cursos Encontrados
                  </CardTitle>
                  <CardDescription>
                    {searchResults.count} curso(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSearch ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchResults.courses && searchResults.courses.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.courses.map((course: Course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-brown-soft text-center py-8">
                      Nenhum curso encontrado. Tente outros filtros.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!analysis && !searchResults && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-brown-soft mb-2">
                    Informe sua área atual de trabalho para receber sugestões personalizadas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A Ellie analisará seu perfil e sugerirá áreas de transição para o mercado do futuro
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Assistente IA */}
        {showAIAssistant && (
          <div className="mt-6">
            <AIAssistant />
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  const providerColors = {
    FIAP: 'bg-blue-100 text-blue-800',
    ALURA: 'bg-purple-100 text-purple-800',
    IBM: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${providerColors[course.provider] || 'bg-gray-100 text-gray-800'}`}>
                {course.provider}
              </span>
              {course.level && (
                <span className="px-2 py-1 rounded text-xs bg-bege-medium text-brown-dark">
                  {course.level}
                </span>
              )}
              {course.category && (
                <span className="px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                  {course.category}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-brown-dark mb-2">{course.title}</h3>
            {course.description && (
              <p className="text-sm text-brown-soft mb-3 line-clamp-2">{course.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-brown-soft">
              {course.duration && <span>⏱️ {course.duration}</span>}
            </div>
          </div>
          {course.url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-shrink-0"
            >
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Ver Curso
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
