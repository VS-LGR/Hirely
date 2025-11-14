'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Tag } from '@/types'

interface Application {
  id: number
  job_id: number
  candidate_id: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  cover_letter?: string
  match_score?: number
  created_at: string
  updated_at: string
  candidate: {
    id: number
    name: string
    email: string
    bio?: string
    tags?: Tag[]
  }
}

export default function JobApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const jobId = params.id as string

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const response = await api.get(`/applications/job/${jobId}`)
      return response.data.data.applications
    },
    enabled: user?.role === 'recruiter',
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const response = await api.put(`/applications/${applicationId}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-success text-success-foreground'
      case 'rejected':
        return 'bg-error text-error-foreground'
      case 'reviewed':
        return 'bg-info text-info-foreground'
      default:
        return 'bg-warning text-warning-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Aceito'
      case 'rejected':
        return 'Rejeitado'
      case 'reviewed':
        return 'Em Análise'
      default:
        return 'Pendente'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bege-light flex items-center justify-center">
        <p className="text-brown-soft">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bege-light">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              ← Voltar
            </Button>
            <h1 className="text-4xl font-bold text-brown-dark">Candidatos</h1>
            <p className="text-brown-soft mt-2">
              {applications?.length || 0} candidato(s) encontrado(s)
            </p>
          </div>
        </div>

        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{application.candidate.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {application.candidate.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      {application.match_score && (
                        <div className="text-right">
                          <p className="text-xs text-brown-soft">Compatibilidade</p>
                          <p className="text-lg font-bold text-primary">
                            {application.match_score}%
                          </p>
                        </div>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.candidate.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-brown-dark mb-1">Sobre</h3>
                      <div className="text-sm text-brown-soft whitespace-pre-line" style={{ lineHeight: '1.6' }}>
                        {application.candidate.bio.split('\n\n').map((paragraph, index) => (
                          <p key={index} className={index > 0 ? 'mt-3' : ''}>
                            {paragraph.trim()}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.candidate.tags && application.candidate.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-brown-dark mb-2">Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.candidate.tags.map((tag: Tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 rounded-md bg-bege-medium text-brown-dark text-xs border border-brown-light"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.cover_letter && (
                    <div>
                      <h3 className="text-sm font-semibold text-brown-dark mb-1">
                        Carta de Apresentação
                      </h3>
                      <p className="text-sm text-brown-soft whitespace-pre-line">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-border">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'reviewed',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Marcar como Em Análise
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'accepted',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Aceitar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'rejected',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {application.status === 'reviewed' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'accepted',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Aceitar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              applicationId: application.id,
                              status: 'rejected',
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {(application.status === 'accepted' || application.status === 'rejected') && (
                      <p className="text-sm text-brown-soft">
                        Candidatura {getStatusLabel(application.status).toLowerCase()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-brown-soft">
                Nenhum candidato se candidatou a esta vaga ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

