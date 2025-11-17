'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel } from '@/components/ui/carousel'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { 
  GraduationCap, 
  ExternalLink, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Sparkles,
  ArrowRight,
  BookOpen,
  TrendingUp
} from 'lucide-react'

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
  const [showAnalysisResults, setShowAnalysisResults] = useState(false)

  // Buscar cursos por categoria
  const { data: coursesByCategory, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['courses-by-category'],
    queryFn: async () => {
      const response = await api.get('/courses')
      const courses = response.data.data.courses as Course[]
      
      // Agrupar por categoria
      const grouped: Record<string, Course[]> = {}
      courses.forEach(course => {
        if (course.category) {
          if (!grouped[course.category]) {
            grouped[course.category] = []
          }
          grouped[course.category].push(course)
        }
      })
      
      return grouped
    },
  })

  // Mutation para análise de reintegração
  const analyzeMutation = useMutation({
    mutationFn: async (area: string) => {
      const response = await api.post('/ai/analyze-reintegration', { currentArea: area })
      return response.data.data.analysis as ReintegrationAnalysis
    },
    onSuccess: (data) => {
      setAnalysis(data)
      setShowAnalysisResults(true)
      if (data.recommendedCategories.length > 0) {
        setSelectedCategory(data.recommendedCategories[0])
      }
    },
  })

  // Buscar cursos por categoria/provider
  const { data: searchResults, isLoading: isLoadingSearch, refetch: refetchSearch } = useQuery({
    queryKey: ['courses-search', selectedCategory, selectedProvider],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('area', selectedCategory)
      if (selectedProvider !== 'ALL') params.append('provider', selectedProvider)

      const response = await api.get(`/courses/search?${params.toString()}`)
      return response.data.data
    },
    enabled: false,
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
    setShowAnalysisResults(false)
  }

  return (
    <div className="min-h-screen bg-bege-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-bege-medium to-bege-light py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-brown-dark">
                Reintegração ao Mercado de Trabalho
              </h1>
            </div>
            <p className="text-lg text-brown-soft mb-8">
              Descubra novas áreas de atuação e cursos para se recolocar no mercado do futuro
            </p>

            {/* Formulário de Análise */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ex: Transporte de materiais, Atendimento ao cliente..."
                    value={currentArea}
                    onChange={(e) => setCurrentArea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!currentArea.trim() || analyzeMutation.isPending}
                    size="lg"
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
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-left">
                  Informe sua área atual de trabalho para receber sugestões personalizadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Resultados da Análise */}
        {analysis && showAnalysisResults && (
          <div className="mb-12">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Sugestões de Áreas de Transição</CardTitle>
                    <CardDescription className="mt-2">
                      Baseado na sua área atual: <strong className="text-brown-dark">{analysis.currentArea}</strong>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnalysisResults(false)}
                  >
                    Ver Cursos
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Transição Natural */}
                {analysis.suggestedAreas.natural.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-brown-dark">
                        Transição Natural (✔️)
                      </h3>
                    </div>
                    <p className="text-sm text-brown-soft mb-4 pl-9">
                      Mesma área, menos risco de obsolescência. Aproveita quase 100% das habilidades atuais.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 pl-9">
                      {analysis.suggestedAreas.natural.map((area, idx) => (
                        <Card key={idx} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                            <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                            <ul className="space-y-1.5">
                              {area.reasons.map((reason, rIdx) => (
                                <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
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
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-xl font-semibold text-brown-dark">
                        Transição Adjacente (🟨)
                      </h3>
                    </div>
                    <p className="text-sm text-brown-soft mb-4 pl-9">
                      Usa habilidades parecidas + skills novos. Requer upskilling moderado.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 pl-9">
                      {analysis.suggestedAreas.adjacent.map((area, idx) => (
                        <Card key={idx} className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                            <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                            <ul className="space-y-1.5">
                              {area.reasons.map((reason, rIdx) => (
                                <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                  <span className="text-yellow-600 mt-1 flex-shrink-0">→</span>
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
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-6 w-6 text-red-600" />
                      <h3 className="text-xl font-semibold text-brown-dark">
                        Transição Estratégica (🟥)
                      </h3>
                    </div>
                    <p className="text-sm text-brown-soft mb-4 pl-9">
                      Nova área com grande empregabilidade. Mobilidade social real.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 pl-9">
                      {analysis.suggestedAreas.strategic.map((area, idx) => (
                        <Card key={idx} className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <h4 className="font-semibold text-brown-dark mb-2">{area.title}</h4>
                            <p className="text-sm text-brown-soft mb-3">{area.description}</p>
                            <ul className="space-y-1.5">
                              {area.reasons.map((reason, rIdx) => (
                                <li key={rIdx} className="text-xs text-brown-soft flex items-start gap-2">
                                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
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

                {/* Categorias Recomendadas */}
                {analysis.recommendedCategories.length > 0 && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-brown-dark mb-4">
                      Categorias Recomendadas para Cursos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommendedCategories.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSelectCategory(cat)}
                          className="gap-2"
                        >
                          {cat}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cursos por Categoria - Carrosséis */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coursesByCategory && Object.keys(coursesByCategory).length > 0 ? (
          <div className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brown-dark mb-2">
                Cursos por Categoria
              </h2>
              <p className="text-brown-soft">
                Explore cursos da FIAP, Alura e IBM organizados por área de conhecimento
              </p>
            </div>

            {Object.entries(coursesByCategory)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, courses]) => (
                <div key={category} className="space-y-4">
                  <Carousel title={category} className="w-full">
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </Carousel>
                </div>
              ))}
          </div>
        ) : null}

        {/* Busca de Cursos */}
        {selectedCategory && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Buscar Cursos
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Categoria: <strong>{selectedCategory}</strong>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border border-brown-light rounded-md bg-bege-light text-brown-dark text-sm"
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as any)}
                    >
                      <option value="ALL">Todos os provedores</option>
                      <option value="FIAP">FIAP</option>
                      <option value="ALURA">Alura</option>
                      <option value="IBM">IBM</option>
                    </select>
                    <Button onClick={handleSearchCourses} disabled={isLoadingSearch}>
                      {isLoadingSearch ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {searchResults && (
                <CardContent>
                  {isLoadingSearch ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchResults.courses && searchResults.courses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              )}
            </Card>
          </div>
        )}

        {/* Estado Inicial - Só mostra se não há cursos carregados */}
        {!analysis && !isLoadingCategories && (!coursesByCategory || Object.keys(coursesByCategory).length === 0) && (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-primary/50" />
              <p className="text-lg text-brown-soft mb-2">
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
  )
}

function CourseCard({ course }: { course: Course }) {
  const providerColors = {
    FIAP: 'bg-blue-100 text-blue-800 border-blue-200',
    ALURA: 'bg-purple-100 text-purple-800 border-purple-200',
    IBM: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  }

  const providerIcon = {
    FIAP: '🎓',
    ALURA: '💜',
    IBM: '🔵',
  }

  return (
    <Card className="min-w-[320px] max-w-[380px] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${providerColors[course.provider] || 'bg-gray-100 text-gray-800'}`}>
              {providerIcon[course.provider]} {course.provider}
            </span>
            {course.level && (
              <span className="px-2 py-1 rounded text-xs bg-bege-medium text-brown-dark border border-brown-light">
                {course.level}
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-brown-dark mb-2 line-clamp-2 min-h-[3rem]">
          {course.title}
        </h3>
        
        {course.description && (
          <p className="text-sm text-brown-soft mb-4 line-clamp-3 flex-1">
            {course.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-brown-light">
          <div className="flex items-center gap-3 text-xs text-brown-soft">
            {course.duration && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {course.duration}
              </span>
            )}
            {course.category && (
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                {course.category}
              </span>
            )}
          </div>
          {course.url && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-shrink-0"
            >
              <a href={course.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
