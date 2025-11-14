'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIAssistant } from '@/components/ai/AIAssistant'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { GraduationCap, ExternalLink, Filter, Search, Loader2 } from 'lucide-react'

interface Course {
  id: number
  title: string
  provider: 'FIAP' | 'ALURA'
  category: string
  description: string
  duration?: string
  level?: string
  url?: string
  tags?: number[]
}

export default function ReintegrationPage() {
  const user = useAuthStore((state) => state.user)
  const [searchArea, setSearchArea] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<'FIAP' | 'ALURA' | 'ALL'>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Buscar tags do usuário para recomendações
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile')
      return response.data.data.user
    },
    enabled: !!user,
  })

  // Buscar cursos recomendados baseado nas tags do usuário
  const { data: recommendedCourses, isLoading: isLoadingRecommended } = useQuery({
    queryKey: ['recommended-courses', userProfile?.tags],
    queryFn: async () => {
      if (!userProfile?.tags || userProfile.tags.length === 0) {
        return { courses: [], count: 0 }
      }
      const tagIds = userProfile.tags.map((tag: any) => tag.id).join(',')
      const response = await api.get(`/courses/recommended?userTags=${tagIds}`)
      return response.data.data
    },
    enabled: !!userProfile?.tags && userProfile.tags.length > 0,
  })

  // Buscar cursos por área/provider
  const { data: searchResults, isLoading: isLoadingSearch, refetch: refetchSearch } = useQuery({
    queryKey: ['courses-search', searchArea, selectedProvider, selectedLevel],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchArea) params.append('area', searchArea)
      if (selectedProvider !== 'ALL') params.append('provider', selectedProvider)
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel)

      const response = await api.get(`/courses/search?${params.toString()}`)
      return response.data.data
    },
    enabled: false, // Só busca quando o usuário clicar em buscar
  })

  const handleSearch = () => {
    refetchSearch()
  }

  const coursesToShow = searchResults?.courses || recommendedCourses?.courses || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brown-dark mb-2">
          Reintegração ao Mercado de Trabalho
        </h1>
        <p className="text-brown-soft">
          Encontre cursos na FIAP e Alura para se recolocar no mercado, especialmente se sua área
          está em risco devido ao avanço da IA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros e Busca */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Cursos
              </CardTitle>
              <CardDescription>
                Encontre cursos que combinam com sua área de atuação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area">Área de Interesse</Label>
                <Input
                  id="area"
                  placeholder="Ex: Desenvolvimento, Marketing, Gestão..."
                  value={searchArea}
                  onChange={(e) => setSearchArea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <select
                  id="provider"
                  className="w-full px-3 py-2 border border-brown-light rounded-md bg-bege-light text-brown-dark"
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as 'FIAP' | 'ALURA' | 'ALL')}
                >
                  <option value="ALL">Todos</option>
                  <option value="FIAP">FIAP</option>
                  <option value="ALURA">Alura</option>
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

              <Button onClick={handleSearch} className="w-full" disabled={isLoadingSearch}>
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

          {/* Assistente Ellie */}
          <Card>
            <CardHeader>
              <CardTitle>Fale com a Ellie</CardTitle>
              <CardDescription>
                Peça ajuda à Ellie para encontrar os melhores cursos para você
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

        {/* Lista de Cursos */}
        <div className="lg:col-span-2 space-y-4">
          {!searchResults && !isLoadingRecommended && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Cursos Recomendados para Você
                </CardTitle>
                <CardDescription>
                  Baseado nas suas tags e áreas de interesse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommended ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recommendedCourses?.courses && recommendedCourses.courses.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedCourses.courses.map((course: Course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <p className="text-brown-soft text-center py-8">
                    Nenhum curso recomendado encontrado. Use a busca para encontrar cursos.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Resultados da Busca
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
                    Nenhum curso encontrado com os filtros selecionados. Tente outros termos.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!searchResults && !recommendedCourses && !isLoadingRecommended && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-brown-soft mb-4">
                  Use a busca ao lado para encontrar cursos ou fale com a Ellie para receber
                  recomendações personalizadas.
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
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  course.provider === 'FIAP'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
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

