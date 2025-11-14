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
import { Tag } from '@/types'
import { Experience, Education } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sparkles } from 'lucide-react'

interface ResumeAnalysis {
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
  })
  const [showAIAssistant, setShowAIAssistant] = useState(false)

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
      })
    }
  }, [profile])

  const handleResumeAnalysis = async (analysis: ResumeAnalysis) => {
    // Buscar tags sugeridas no banco
    const newTags: Tag[] = []
    for (const suggestedTag of analysis.suggestedTags) {
      try {
        const response = await api.get(`/tags/search?q=${encodeURIComponent(suggestedTag.name)}`)
        const tags = response.data.data.tags as Tag[]
        const matchingTag = tags.find(
          (t) => t.name.toLowerCase() === suggestedTag.name.toLowerCase()
        )
        if (matchingTag && !formData.tags.some((t) => t.id === matchingTag.id)) {
          newTags.push(matchingTag)
        }
      } catch (error) {
        console.error('Error finding tag:', error)
      }
    }

    // Atualizar formData com dados extraídos
    setFormData((prev) => ({
      ...prev,
      bio: analysis.bio || prev.bio,
      experience: analysis.experience.map((exp) => ({
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      })) as Experience[],
      education: analysis.education.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })) as Education[],
      tags: [...prev.tags, ...newTags],
    }))
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
            matchingTag = tags.find((t) => {
              const tagName = normalize(t.name)
              // Verificar se alguma palavra-chave está presente
              return suggestedWords.some(word => tagName.includes(word)) ||
                     tagName.split(/\s+/).some(word => normalizedSuggested.includes(word))
            })
          }
          
          // Se ainda não encontrar, tentar correspondência por categoria
          if (!matchingTag && tags.length > 0) {
            matchingTag = tags.find(t => t.category === suggestedTag.category)
          }
          
          // Última tentativa: usar a primeira tag retornada pela busca
          if (!matchingTag && tags.length > 0) {
            matchingTag = tags[0]
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
    </div>
  )
}

