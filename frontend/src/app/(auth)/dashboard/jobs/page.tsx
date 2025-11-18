'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import api from '@/lib/api'
import { Job, Tag } from '@/types'
import { useAuthStore } from '@/store/authStore'

export default function JobsPage() {
  const user = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', search, selectedTagIds, user?.role, user?.id],
    queryFn: async () => {
      const params: any = {}
      if (search) params.search = search
      if (selectedTagIds.length > 0) params.tag_ids = selectedTagIds
      
      // Candidatos usam vagas recomendadas apenas se não houver busca/filtros
      // Se houver busca, usa o endpoint normal para permitir busca livre
      const useRecommended = user?.role === 'candidate' && !search && selectedTagIds.length === 0
      
      console.log('Fetching jobs - User:', user?.role, 'ID:', user?.id, 'Use recommended:', useRecommended)
      const response = useRecommended
        ? await api.get('/jobs/recommended', { params: { page: 1, limit: 50 } })
        : await api.get('/jobs', { params })
      
      console.log('Jobs response:', response.data.data.jobs?.length || 0, 'jobs')
      return response.data.data.jobs as Job[]
    },
    enabled: !!user && mounted,
  })

  const jobs = data || []

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <div className="text-brown-dark">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brown-dark mb-2">
              {user?.role === 'recruiter' ? 'Minhas Vagas' : 'Vagas Disponíveis'}
            </h1>
            <p className="text-brown-soft">
              {user?.role === 'recruiter'
                ? 'Gerencie suas oportunidades'
                : 'Encontre sua próxima oportunidade'}
            </p>
          </div>
          {user?.role === 'recruiter' && (
            <Link href="/dashboard/jobs/new">
              <Button>Nova Vaga</Button>
            </Link>
          )}
        </div>

        <div className="mb-6 space-y-4">
          <Input
            placeholder="Buscar vagas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          {user?.role === 'candidate' && (
            <div className="text-sm text-brown-soft">
              Mostrando vagas recomendadas baseadas no seu perfil
            </div>
          )}
        </div>

        {isLoading && <p className="text-brown-soft">Carregando...</p>}
        {error && (
          <p className="text-error">Erro ao carregar vagas. Tente novamente.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription>
                  {job.location && `${job.location} • `}
                  {job.remote ? 'Remoto' : 'Presencial'} • {job.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.match_score != null && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-primary">
                      {Math.round(typeof job.match_score === 'number' ? job.match_score : Number(job.match_score))}% de compatibilidade
                    </span>
                  </div>
                )}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.tags.slice(0, 5).map((tag: Tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-1 rounded-md bg-bege-medium text-brown-dark border border-brown-light"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {job.tags.length > 5 && (
                      <span className="text-xs px-2 py-1 text-brown-soft">
                        +{job.tags.length - 5}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm text-brown-soft line-clamp-3 mb-4">
                  {job.description}
                </p>
                {job.salary_min && job.salary_max && (
                  <p className="text-sm font-medium text-brown-dark mb-4">
                    R$ {job.salary_min.toLocaleString()} - R${' '}
                    {job.salary_max.toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <Link href={`/dashboard/jobs/${job.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                  {user?.role === 'recruiter' && (
                    <Link href={`/dashboard/jobs/${job.id}/applications`} className="flex-1">
                      <Button className="w-full">Candidatos</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {jobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-brown-soft text-lg">
              {search ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga disponível no momento'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


