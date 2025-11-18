'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FeedbackDialog } from '@/components/recruiter/FeedbackDialog'
import { InterviewDialog } from '@/components/recruiter/InterviewDialog'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Tag } from '@/types'
import { TrendingUp, BarChart3, RefreshCw, Calendar } from 'lucide-react'

interface Application {
  id: number
  job_id: number
  candidate_id: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  cover_letter?: string
  match_score?: number
  feedback?: string
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
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [calculatingScore, setCalculatingScore] = useState<number | null>(null)

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const response = await api.get(`/applications/job/${jobId}`)
      return response.data.data.applications
    },
    enabled: user?.role === 'recruiter',
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, feedback }: { applicationId: number; status: string; feedback?: string }) => {
      const response = await api.put(`/applications/${applicationId}/status`, { status, feedback })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    },
  })

  const handleRejectClick = (application: Application) => {
    setSelectedApplication(application)
    setFeedbackDialogOpen(true)
  }

  const handleFeedbackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    setFeedbackDialogOpen(false)
    setSelectedApplication(null)
  }

  const handleInterviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    setInterviewDialogOpen(false)
    setSelectedApplication(null)
  }

  const handleCalculateScore = async (application: Application) => {
    setCalculatingScore(application.id)
    try {
      const response = await api.post('/ai/calculate-match-score', {
        job_id: Number(jobId),
        candidate_id: application.candidate_id,
      })

      const newScore = response.data.data.matchScore

      // Atualizar o score na aplicação
      await api.put(`/applications/${application.id}/status`, {
        status: application.status,
        match_score: newScore,
      })

      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    } catch (error: any) {
      console.error('Erro ao calcular score:', error)
      alert(error.response?.data?.error?.message || 'Erro ao calcular score de compatibilidade')
    } finally {
      setCalculatingScore(null)
    }
  }

  const handleAcceptClick = (application: Application) => {
    setSelectedApplication(application)
    setInterviewDialogOpen(true)
  }

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
            {applications.map((application) => {
              const score = application.match_score ?? 0
              const getScoreColor = () => {
                if (score >= 80) return 'bg-success text-success-foreground'
                if (score >= 60) return 'bg-info text-info-foreground'
                if (score >= 40) return 'bg-warning text-warning-foreground'
                return 'bg-error/20 text-error'
              }

              return (
                <Card key={application.id} className="relative">
                  {score >= 80 && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Top Match
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{application.candidate.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {application.candidate.email}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <BarChart3 className="h-3 w-3 text-brown-soft" />
                            <p className="text-xs text-brown-soft">Compatibilidade</p>
                          </div>
                          {application.match_score != null ? (
                            <Badge className={`${getScoreColor()} text-base font-bold px-3 py-1`}>
                              {score.toFixed(0)}%
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCalculateScore(application)}
                              disabled={calculatingScore === application.id}
                              className="h-7 text-xs"
                            >
                              {calculatingScore === application.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Calculando...
                                </>
                              ) : (
                                <>
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Calcular Score
                                </>
                              )}
                            </Button>
                          )}
                        </div>
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
                          onClick={() => handleAcceptClick(application)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Aceitar e Marcar Entrevista
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(application)}
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
                          onClick={() => handleAcceptClick(application)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Aceitar e Marcar Entrevista
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(application)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {(application.status === 'accepted' || application.status === 'rejected') && (
                      <div className="space-y-2">
                        <p className="text-sm text-brown-soft">
                          Candidatura {getStatusLabel(application.status).toLowerCase()}
                        </p>
                        {application.status === 'rejected' && application.feedback && (
                          <div className="p-3 rounded-md bg-bege-medium border border-brown-light">
                            <p className="text-xs font-semibold text-brown-dark mb-1">Feedback:</p>
                            <p className="text-sm text-brown-soft whitespace-pre-line">
                              {application.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
            })}
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

        {selectedApplication && (
          <>
            <FeedbackDialog
              open={feedbackDialogOpen}
              onOpenChange={setFeedbackDialogOpen}
              applicationId={selectedApplication.id}
              jobId={Number(jobId)}
              candidateId={selectedApplication.candidate_id}
              candidateName={selectedApplication.candidate.name}
              onSuccess={handleFeedbackSuccess}
            />
            <InterviewDialog
              open={interviewDialogOpen}
              onOpenChange={setInterviewDialogOpen}
              applicationId={selectedApplication.id}
              candidateName={selectedApplication.candidate.name}
              onSuccess={handleInterviewSuccess}
            />
          </>
        )}
      </div>
    </div>
  )
}

