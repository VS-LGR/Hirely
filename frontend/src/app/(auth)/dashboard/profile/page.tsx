'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagsInput } from '@/components/ui/tags-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResumeUpload } from '@/components/ai/ResumeUpload'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { ResumeAnalysisPreview } from '@/components/ai/ResumeAnalysisPreview'
import { Tag } from '@/types'
import { Experience, Education } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sparkles } from 'lucide-react'

interface ResumeAnalysis {
  skills: string[]
  experience: Array<{
    company: string
    position: string | null
    startDate: string
    endDate?: string | null
    description?: string
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string | null
  }>
  bio?: string
  suggestedTags: Array<{ name: string; category: string }>
  strengths: string[]
  suggestions: string[]
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    tags: [] as Tag[],
    experience: [] as Experience[],
    education: [] as Education[],
    strengths: [] as string[],
    suggestions: [] as string[],
  })
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [previewAnalysis, setPreviewAnalysis] = useState<ResumeAnalysis | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile')
      return response.data.data.user
    },
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        tags: profile.tags || [],
        experience: profile.experience || [],
        education: profile.education || [],
        strengths: profile.strengths || [],
        suggestions: profile.suggestions || [],
      })
    }
  }, [profile])

  const handleResumeAnalysis = async (analysis: ResumeAnalysis) => {
    // Formatar bio: limpar e validar
    const formattedBio = analysis.bio
      ? analysis.bio
          .trim()
          .replace(/\n{3,}/g, '\n\n') // Remover múltiplas quebras de linha
          .replace(/[ \t]+/g, ' ') // Normalizar espaços
      : ''

    // Criar análise formatada
    const formattedAnalysis: ResumeAnalysis = {
      ...analysis,
      bio: formattedBio,
      experience: analysis.experience
        .filter((exp) => exp.company && (exp.position || exp.description)) // Aceitar se tiver company e (position ou description)
        .map((exp) => ({
          company: exp.company.trim(),
          position: exp.position?.trim() || null,
          startDate: exp.startDate || '',
          endDate: exp.endDate || null,
          description: exp.description?.trim() || undefined,
        })),
      education: analysis.education
        .filter((edu) => edu.institution && edu.degree) // Filtrar educação inválida
        .map((edu) => ({
          institution: edu.institution.trim(),
          degree: edu.degree.trim(),
          field: edu.field.trim(),
          startDate: edu.startDate || '',
          endDate: edu.endDate || undefined,
        })),
    }

    // Mostrar preview antes de aplicar
    setPreviewAnalysis(formattedAnalysis)
    setShowPreview(true)
  }

  const handleApplyAnalysis = async (analysis: ResumeAnalysis) => {
    // Buscar tags sugeridas no banco usando a mesma lógica robusta do suggestTagsMutation
    const newTags: Tag[] = []
    for (const suggestedTag of analysis.suggestedTags) {
      try {
        const response = await api.get(`/tags/search?q=${encodeURIComponent(suggestedTag.name)}`)
        const tags = response.data.data.tags as Tag[]
        
        // Normalizar strings para comparação (remover acentos, espaços extras, etc.)
        const normalize = (str: string) => 
          str.toLowerCase()
             .normalize('NFD')
             .replace(/[\u0300-\u036f]/g, '') // Remove acentos
             .replace(/\s+/g, ' ') // Normaliza espaços
             .trim()
        
        const normalizedSuggested = normalize(suggestedTag.name)
        
        // Tentar encontrar correspondência exata primeiro
        let matchingTag = tags.find(
          (t) => normalize(t.name) === normalizedSuggested
        )
        
        // Se não encontrar exato, tentar correspondência parcial (palavras-chave)
        if (!matchingTag) {
          const suggestedWords = normalizedSuggested.split(/\s+/).filter(w => w.length > 2)
          const normalizedSuggestedClean = normalizedSuggested.replace(/[-_]/g, ' ')
          
          matchingTag = tags.find((t) => {
            const tagName = normalize(t.name)
            const tagNameClean = tagName.replace(/[-_]/g, ' ')
            
            return suggestedWords.some(word => tagName.includes(word) || tagNameClean.includes(word)) ||
                   tagName.split(/\s+/).some(word => normalizedSuggested.includes(word) || normalizedSuggestedClean.includes(word)) ||
                   tagNameClean === normalizedSuggestedClean ||
                   tagNameClean.includes(normalizedSuggestedClean) ||
                   normalizedSuggestedClean.includes(tagNameClean)
          })
        }
        
        // Se ainda não encontrar, tentar correspondência por categoria e palavras-chave
        if (!matchingTag && tags.length > 0) {
          const suggestedWords = normalizedSuggested.split(/\s+/).filter(w => w.length > 2)
          matchingTag = tags.find((t) => {
            const tagName = normalize(t.name)
            return t.category === suggestedTag.category && 
                   suggestedWords.some(word => tagName.includes(word))
          })
        }
        
        // Se ainda não encontrar, usar primeira tag da categoria
        if (!matchingTag && tags.length > 0) {
          matchingTag = tags.find(t => t.category === suggestedTag.category) || tags[0]
        }
        
        if (matchingTag && !formData.tags.some((t) => t.id === matchingTag.id)) {
          newTags.push(matchingTag)
        }
      } catch (error) {
        console.error('Error finding tag:', error)
      }
    }

    // Filtrar e formatar experiências (aceitar mesmo sem position se tiver company e description)
    const validExperiences = analysis.experience
      .filter((exp) => exp.company && (exp.position || exp.description))
      .map((exp) => ({
        company: exp.company.trim(),
        position: exp.position?.trim() || 'Cargo não especificado',
        startDate: exp.startDate || '',
        endDate: exp.endDate || undefined,
        description: exp.description?.trim() || undefined,
      })) as Experience[]

    // Filtrar e formatar educação
    const validEducation = analysis.education
      .filter((edu) => edu.institution && edu.degree)
      .map((edu) => ({
        institution: edu.institution.trim(),
        degree: edu.degree.trim(),
        field: edu.field?.trim() || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || undefined,
      })) as Education[]

    // Atualizar formData com dados extraídos e formatados
    setFormData((prev) => ({
      ...prev,
      bio: analysis.bio || prev.bio,
      experience: validExperiences.length > 0 ? validExperiences : prev.experience,
      education: validEducation.length > 0 ? validEducation : prev.education,
      tags: [...prev.tags, ...newTags],
      strengths: analysis.strengths && analysis.strengths.length > 0 ? analysis.strengths : prev.strengths,
      suggestions: analysis.suggestions && analysis.suggestions.length > 0 ? analysis.suggestions : prev.suggestions,
    }))

    // Fechar preview
    setShowPreview(false)
    setPreviewAnalysis(null)
  }

  const suggestTagsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/ai/suggest-tags', {
        bio: formData.bio,
        skills: formData.tags.map((t) => t.name),
        experience: formData.experience,
      })
      return response.data.data.tags as Array<{ name: string; category: string }>
    },
    onSuccess: async (suggestedTags) => {
      console.log('Tags sugeridas recebidas:', suggestedTags)
      // Buscar tags no banco e adicionar ao formData
      const newTags: Tag[] = []
      for (const suggestedTag of suggestedTags) {
        try {
          // Buscar tags que correspondam ao nome sugerido
          const response = await api.get(`/tags/search?q=${encodeURIComponent(suggestedTag.name)}`)
          const tags = response.data.data.tags as Tag[]
          
          // Normalizar strings para comparação (remover acentos, espaços extras, etc.)
          const normalize = (str: string) => 
            str.toLowerCase()
               .normalize('NFD')
               .replace(/[\u0300-\u036f]/g, '') // Remove acentos
               .replace(/\s+/g, ' ') // Normaliza espaços
               .trim()
          
          const normalizedSuggested = normalize(suggestedTag.name)
          
          // Tentar encontrar correspondência exata primeiro
          let matchingTag = tags.find(
            (t) => normalize(t.name) === normalizedSuggested
          )
          
          // Se não encontrar exato, tentar correspondência parcial (palavras-chave)
          if (!matchingTag) {
            const suggestedWords = normalizedSuggested.split(/\s+/).filter(w => w.length > 2)
            // Remover hífens e caracteres especiais para melhor matching
            const normalizedSuggestedClean = normalizedSuggested.replace(/[-_]/g, ' ')
            
            matchingTag = tags.find((t) => {
              const tagName = normalize(t.name)
              const tagNameClean = tagName.replace(/[-_]/g, ' ')
              
              // Verificar se alguma palavra-chave está presente
              return suggestedWords.some(word => tagName.includes(word) || tagNameClean.includes(word)) ||
                     tagName.split(/\s+/).some(word => normalizedSuggested.includes(word) || normalizedSuggestedClean.includes(word)) ||
                     // Verificar correspondência sem hífens (ex: "Front-End" vs "Frontend")
                     tagNameClean === normalizedSuggestedClean ||
                     tagNameClean.includes(normalizedSuggestedClean) ||
                     normalizedSuggestedClean.includes(tagNameClean)
            })
          }
          
          // Se ainda não encontrar, tentar correspondência por categoria e palavras-chave
          if (!matchingTag && tags.length > 0) {
            const suggestedWords = normalizedSuggested.split(/\s+/).filter(w => w.length > 2)
            matchingTag = tags.find((t) => {
              const tagName = normalize(t.name)
              return t.category === suggestedTag.category && 
                     suggestedWords.some(word => tagName.includes(word))
            })
          }
          
          // Se ainda não encontrar, usar primeira tag da categoria
          if (!matchingTag && tags.length > 0) {
            matchingTag = tags.find(t => t.category === suggestedTag.category) || tags[0]
          }
          
          if (matchingTag && !formData.tags.some((t) => t.id === matchingTag.id)) {
            newTags.push(matchingTag)
            console.log('Tag adicionada:', matchingTag.name)
          } else if (matchingTag) {
            console.log('Tag já existe:', matchingTag.name)
          } else {
            console.log('Tag não encontrada no banco:', suggestedTag.name)
          }
        } catch (error) {
          console.error('Error finding tag:', error)
        }
      }
      
      if (newTags.length > 0) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, ...newTags],
        }))
        console.log(`${newTags.length} tags adicionadas ao perfil`)
      } else {
        console.log('Nenhuma tag nova foi adicionada')
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/profile', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      name: formData.name,
      bio: formData.bio,
      tag_ids: formData.tags.map((tag) => tag.id),
      experience: formData.experience,
      education: formData.education,
      strengths: formData.strengths,
      suggestions: formData.suggestions,
    })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <div className="text-brown-dark">Carregando...</div>
      </div>
    )
  }

  if (user?.role !== 'candidate') {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-brown-soft">
              Esta página é apenas para candidatos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">Meu Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais e profissionais
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Assistente IA
                  </Button>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[120px]"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tags">Habilidades e Competências</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => suggestTagsMutation.mutate()}
                        disabled={suggestTagsMutation.isPending}
                        className="text-xs"
                      >
                        {suggestTagsMutation.isPending ? (
                          'Sugerindo...'
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Sugerir Tags com IA
                          </>
                        )}
                      </Button>
                    </div>
                    <TagsInput
                      value={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      placeholder="Digite para buscar habilidades (ex: React, Python, Design)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Selecione suas habilidades e competências para melhorar suas recomendações de vagas
                    </p>
                  </div>

                  {/* Experiência de Trabalho */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Experiência de Trabalho</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            experience: [
                              ...prev.experience,
                              {
                                company: '',
                                position: '',
                                startDate: '',
                                endDate: '',
                                description: '',
                              },
                            ],
                          }))
                        }}
                      >
                        + Adicionar Experiência
                      </Button>
                    </div>
                    {formData.experience.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma experiência cadastrada. Adicione suas experiências profissionais.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {formData.experience.map((exp, index) => (
                          <Card key={index} className="bg-bege-medium">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-brown-dark">
                                  Experiência {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      experience: prev.experience.filter((_, i) => i !== index),
                                    }))
                                  }}
                                  className="text-error hover:text-error"
                                >
                                  Remover
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Empresa *</Label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) => {
                                      const newExp = [...formData.experience]
                                      newExp[index].company = e.target.value
                                      setFormData({ ...formData, experience: newExp })
                                    }}
                                    placeholder="Nome da empresa"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Cargo *</Label>
                                  <Input
                                    value={exp.position}
                                    onChange={(e) => {
                                      const newExp = [...formData.experience]
                                      newExp[index].position = e.target.value
                                      setFormData({ ...formData, experience: newExp })
                                    }}
                                    placeholder="Cargo/Posição"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Data de Início *</Label>
                                  <Input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => {
                                      const newExp = [...formData.experience]
                                      newExp[index].startDate = e.target.value
                                      setFormData({ ...formData, experience: newExp })
                                    }}
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Data de Término</Label>
                                  <Input
                                    type="month"
                                    value={exp.endDate || ''}
                                    onChange={(e) => {
                                      const newExp = [...formData.experience]
                                      newExp[index].endDate = e.target.value || undefined
                                      setFormData({ ...formData, experience: newExp })
                                    }}
                                    placeholder="Em andamento se vazio"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Descrição</Label>
                                <Textarea
                                  value={exp.description || ''}
                                  onChange={(e) => {
                                    const newExp = [...formData.experience]
                                    newExp[index].description = e.target.value || undefined
                                    setFormData({ ...formData, experience: newExp })
                                  }}
                                  placeholder="Descreva suas responsabilidades e conquistas..."
                                  rows={3}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Escolaridade */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Escolaridade</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            education: [
                              ...prev.education,
                              {
                                institution: '',
                                degree: '',
                                field: '',
                                startDate: '',
                                endDate: '',
                              },
                            ],
                          }))
                        }}
                      >
                        + Adicionar Formação
                      </Button>
                    </div>
                    {formData.education.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhuma formação cadastrada. Adicione sua escolaridade.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {formData.education.map((edu, index) => (
                          <Card key={index} className="bg-bege-medium">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-brown-dark">
                                  Formação {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      education: prev.education.filter((_, i) => i !== index),
                                    }))
                                  }}
                                  className="text-error hover:text-error"
                                >
                                  Remover
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Instituição *</Label>
                                  <Input
                                    value={edu.institution}
                                    onChange={(e) => {
                                      const newEdu = [...formData.education]
                                      newEdu[index].institution = e.target.value
                                      setFormData({ ...formData, education: newEdu })
                                    }}
                                    placeholder="Nome da instituição"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Grau *</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const newEdu = [...formData.education]
                                      newEdu[index].degree = e.target.value
                                      setFormData({ ...formData, education: newEdu })
                                    }}
                                    placeholder="Ex: Bacharelado, Mestrado, Técnico"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Área de Estudo</Label>
                                  <Input
                                    value={edu.field}
                                    onChange={(e) => {
                                      const newEdu = [...formData.education]
                                      newEdu[index].field = e.target.value
                                      setFormData({ ...formData, education: newEdu })
                                    }}
                                    placeholder="Ex: Ciência da Computação, Design"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Data de Início *</Label>
                                  <Input
                                    type="month"
                                    value={edu.startDate}
                                    onChange={(e) => {
                                      const newEdu = [...formData.education]
                                      newEdu[index].startDate = e.target.value
                                      setFormData({ ...formData, education: newEdu })
                                    }}
                                    required
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <Label className="text-xs">Data de Conclusão</Label>
                                  <Input
                                    type="month"
                                    value={edu.endDate || ''}
                                    onChange={(e) => {
                                      const newEdu = [...formData.education]
                                      newEdu[index].endDate = e.target.value || undefined
                                      setFormData({ ...formData, education: newEdu })
                                    }}
                                    placeholder="Em andamento se vazio"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outras Informações da Análise */}
                  {(formData.strengths.length > 0 || formData.suggestions.length > 0) && (
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Outras Informações</Label>
                      
                      {formData.strengths.length > 0 && (
                        <Card className="bg-bege-medium">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-brown-dark">
                              Pontos Fortes Identificados
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {formData.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-brown-soft">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {formData.suggestions.length > 0 && (
                        <Card className="bg-bege-medium">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-brown-dark">
                              Sugestões de Desenvolvimento
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {formData.suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-brown-soft">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>

                  {updateMutation.isSuccess && (
                    <div className="p-3 rounded-md bg-success/10 text-success text-sm">
                      Perfil atualizado com sucesso!
                    </div>
                  )}

                  {updateMutation.isError && (
                    <div className="p-3 rounded-md bg-error/10 text-error text-sm">
                      Erro ao atualizar perfil
                    </div>
                  )}
                </CardContent>
              </form>
            </Card>

            <ResumeUpload onAnalysisComplete={handleResumeAnalysis} />
          </div>

          {showAIAssistant && (
            <div className="lg:col-span-1">
              <AIAssistant />
            </div>
          )}
        </div>
      </div>

      <ResumeAnalysisPreview
        open={showPreview}
        analysis={previewAnalysis}
        onApply={handleApplyAnalysis}
        onCancel={() => {
          setShowPreview(false)
          setPreviewAnalysis(null)
        }}
      />
    </div>
  )
}

