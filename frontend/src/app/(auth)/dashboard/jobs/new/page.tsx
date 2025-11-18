'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagsInput } from '@/components/ui/tags-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tag } from '@/types'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sparkles } from 'lucide-react'

export default function NewJobPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiRequirements, setAiRequirements] = useState('')
  const [generatingAI, setGeneratingAI] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    remote: false,
    tags: [] as Tag[],
  })

  const handleGenerateWithAI = async () => {
    if (!aiRequirements.trim()) {
      setError('Descreva os requisitos da vaga para gerar com IA')
      return
    }

    setGeneratingAI(true)
    setError('')

    try {
      const response = await api.post('/ai/generate-job', {
        requirements: aiRequirements.trim(),
      })

      const jobData = response.data.data.job
      setFormData({
        ...formData,
        title: jobData.title || formData.title,
        description: jobData.description || formData.description,
        requirements: jobData.requirements || formData.requirements,
      })
      setShowAIDialog(false)
      setAiRequirements('')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao gerar vaga com IA')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/jobs', {
        ...formData,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        tag_ids: formData.tags.map((tag) => tag.id),
      })
      console.log('Job created successfully:', response.data)
      
      // Invalidar todas as queries relacionadas a jobs e estatísticas
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] })
      
      // Forçar refetch das queries ativas
      await queryClient.refetchQueries({ queryKey: ['jobs'] })
      await queryClient.refetchQueries({ queryKey: ['recruiter-stats'] })
      
      router.push('/dashboard/jobs')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao criar vaga')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-brown-soft">
              Apenas recrutadores podem criar vagas.
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">Criar Nova Vaga</CardTitle>
                <CardDescription>
                  Preencha os dados da vaga para publicar
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAIDialog(true)}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </Button>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 rounded-md bg-error/10 text-error text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a vaga, responsabilidades e requisitos..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  className="min-h-[100px]"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Liste os requisitos técnicos e comportamentais..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Salário Mínimo (R$)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Salário Máximo (R$)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="8000"
                  />
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
                <Label htmlFor="tags">Habilidades e Competências Requeridas</Label>
                <TagsInput
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Digite para buscar habilidades (ex: React, Python, Design)"
                />
                <p className="text-xs text-muted-foreground">
                  Selecione as habilidades e competências necessárias para esta vaga
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Contrato</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="full-time">Tempo Integral</option>
                    <option value="part-time">Meio Período</option>
                    <option value="contract">Contrato</option>
                    <option value="internship">Estágio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote">Modalidade</Label>
                  <select
                    id="remote"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.remote ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, remote: e.target.value === 'true' })}
                  >
                    <option value="false">Presencial</option>
                    <option value="true">Remoto</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardContent className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Vaga'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </CardContent>
          </form>
        </Card>

        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Gerar Vaga com IA
              </DialogTitle>
              <DialogDescription>
                Descreva os requisitos da vaga e a IA irá gerar título, descrição e requisitos completos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-error/10 text-error text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="ai-requirements">Requisitos da Vaga</Label>
                <Textarea
                  id="ai-requirements"
                  value={aiRequirements}
                  onChange={(e) => setAiRequirements(e.target.value)}
                  placeholder="Ex: Precisamos de um desenvolvedor Full Stack com experiência em React e Node.js. A vaga é remota, oferece benefícios como plano de saúde e vale refeição. Buscamos alguém com pelo menos 3 anos de experiência..."
                  className="min-h-[200px] mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Seja específico sobre tecnologias, experiência necessária, modalidade de trabalho e benefícios.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateWithAI}
                disabled={generatingAI || !aiRequirements.trim()}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generatingAI ? 'Gerando...' : 'Gerar Vaga'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

