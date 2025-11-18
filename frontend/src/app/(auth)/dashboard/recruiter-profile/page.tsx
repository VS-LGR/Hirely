'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function RecruiterProfilePage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    company: '',
    industry: '',
    website: '',
    location: '',
    company_size: '',
    company_description: '',
  })

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
        company: profile.company || '',
        industry: profile.industry || '',
        website: profile.website || '',
        location: profile.location || '',
        company_size: profile.company_size || '',
        company_description: profile.company_description || '',
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.put('/users/profile', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-brown-soft">
              Esta página é apenas para recrutadores.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Perfil do Recrutador</CardTitle>
            <CardDescription>
              Complete seu perfil para que candidatos conheçam sua empresa
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {updateMutation.isSuccess && (
                <div className="p-3 rounded-md bg-success/10 text-success text-sm">
                  Perfil atualizado com sucesso!
                </div>
              )}

              {updateMutation.isError && (
                <div className="p-3 rounded-md bg-error/10 text-error text-sm">
                  Erro ao atualizar perfil. Tente novamente.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Sobre Você</Label>
                <Textarea
                  id="bio"
                  className="min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você e sua experiência em recrutamento..."
                />
              </div>

              <div className="border-t pt-6 space-y-6">
                <h3 className="text-xl font-semibold text-brown-dark">Informações da Empresa</h3>

                <div className="space-y-2">
                  <Label htmlFor="company">Nome da Empresa *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Ex: Tech Solutions Ltda"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Ramo/Setor *</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Ex: Tecnologia, Saúde, Educação"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Tamanho da Empresa</Label>
                    <select
                      id="company_size"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      <option value="Pequena (1-50 funcionários)">Pequena (1-50 funcionários)</option>
                      <option value="Média (51-200 funcionários)">Média (51-200 funcionários)</option>
                      <option value="Grande (201-1000 funcionários)">Grande (201-1000 funcionários)</option>
                      <option value="Multinacional (1000+ funcionários)">Multinacional (1000+ funcionários)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website da Empresa</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.empresa.com.br"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_description">Descrição da Empresa</Label>
                  <Textarea
                    id="company_description"
                    className="min-h-[120px]"
                    value={formData.company_description}
                    onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                    placeholder="Descreva a empresa, sua missão, valores, cultura organizacional e o que torna sua empresa um ótimo lugar para trabalhar..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta informação será visível para candidatos que visualizarem seu perfil
                  </p>
                </div>
              </div>
            </CardContent>
            <CardContent className="flex gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}

