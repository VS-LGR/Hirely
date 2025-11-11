'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagsInput } from '@/components/ui/tags-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: '',
    tags: [] as Tag[],
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
        tags: profile.tags || [],
      })
    }
  }, [profile])

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
    })
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Meu Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e profissionais
            </CardDescription>
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
                <Label htmlFor="tags">Habilidades e Competências</Label>
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
      </div>
    </div>
  )
}

