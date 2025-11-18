'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import Link from 'next/link'
import { Building2, MapPin, Globe, Users, Briefcase } from 'lucide-react'

interface RecruiterProfile {
  id: string
  name: string
  bio?: string
  company?: string
  industry?: string
  website?: string
  location?: string
  company_size?: string
  company_description?: string
  tags?: Array<{ id: number; name: string; category: string }>
  total_jobs: number
  created_at: string
}

interface Job {
  id: number
  title: string
  description: string
  location?: string
  remote: boolean
  type: string
  salary_min?: number
  salary_max?: number
  created_at: string
}

export default function RecruiterPublicProfilePage() {
  const params = useParams()
  const recruiterId = params.id as string

  const { data, isLoading, error } = useQuery<{
    recruiter: RecruiterProfile
    recent_jobs: Job[]
  }>({
    queryKey: ['recruiter-profile', recruiterId],
    queryFn: async () => {
      const response = await api.get(`/users/recruiter/${recruiterId}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <p className="text-brown-soft">Carregando...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-error">Perfil não encontrado</p>
            <Button asChild className="w-full mt-4">
              <Link href="/dashboard/jobs">Voltar para Vagas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { recruiter, recent_jobs } = data

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header do Perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{recruiter.name}</CardTitle>
                  {recruiter.company && (
                    <div className="flex items-center gap-2 text-brown-soft mb-2">
                      <Building2 className="h-4 w-4" />
                      <span className="text-lg font-medium">{recruiter.company}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-brown-soft">
                    {recruiter.industry && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{recruiter.industry}</span>
                      </div>
                    )}
                    {recruiter.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{recruiter.location}</span>
                      </div>
                    )}
                    {recruiter.company_size && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{recruiter.company_size}</span>
                      </div>
                    )}
                    {recruiter.website && (
                      <a
                        href={recruiter.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  {recruiter.total_jobs} {recruiter.total_jobs === 1 ? 'vaga ativa' : 'vagas ativas'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recruiter.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-brown-dark mb-2">Sobre</h3>
                  <p className="text-brown-soft whitespace-pre-line">{recruiter.bio}</p>
                </div>
              )}

              {recruiter.company_description && (
                <div>
                  <h3 className="text-sm font-semibold text-brown-dark mb-2">Sobre a Empresa</h3>
                  <p className="text-brown-soft whitespace-pre-line">{recruiter.company_description}</p>
                </div>
              )}

              {recruiter.tags && recruiter.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-brown-dark mb-2">Áreas de Atuação</h3>
                  <div className="flex flex-wrap gap-2">
                    {recruiter.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vagas Recentes */}
          {recent_jobs && recent_jobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vagas Publicadas</CardTitle>
                <CardDescription>
                  Confira as oportunidades disponíveis nesta empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border border-brown-light hover:bg-bege-medium transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/dashboard/jobs/${job.id}`}
                            className="text-lg font-semibold text-brown-dark hover:text-primary transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-brown-soft">
                            {job.location && <span>{job.location}</span>}
                            <span>•</span>
                            <span>{job.remote ? 'Remoto' : 'Presencial'}</span>
                            <span>•</span>
                            <span>{job.type}</span>
                            {job.salary_min && job.salary_max && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-brown-dark">
                                  R$ {job.salary_min.toLocaleString()} - R${' '}
                                  {job.salary_max.toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/jobs/${job.id}`}>Ver Vaga</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/jobs?recruiter=${recruiterId}`}>
                      Ver Todas as Vagas
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

