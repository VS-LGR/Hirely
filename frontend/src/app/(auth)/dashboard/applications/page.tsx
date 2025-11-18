'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageDialog } from '@/components/recruiter/MessageDialog'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { MessageSquare, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  job?: {
    id: number
    title: string
    company?: string
    location?: string
    recruiter_id: number
  }
}

export default function MyApplicationsPage() {
  const user = useAuthStore((state) => state.user)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const response = await api.get('/applications/my')
      return response.data.data.applications
    },
    enabled: user?.role === 'candidate',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'reviewed':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-brown-soft">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-brown-dark">Minhas Candidaturas</h1>
          <p className="text-brown-soft mt-2">
            {applications?.length || 0} candidatura(s) encontrada(s)
          </p>
        </div>

        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {application.job?.title || 'Vaga não encontrada'}
                      </CardTitle>
                      <CardDescription>
                        {application.job?.company && `${application.job.company} • `}
                        {application.job?.location && application.job.location}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                        {getStatusIcon(application.status)}
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-brown-soft">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Candidatura enviada em{' '}
                      {format(new Date(application.created_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {application.match_score != null && (
                    <div className="p-3 rounded-md bg-bege-medium border border-brown-light">
                      <p className="text-sm font-medium text-brown-dark">
                        Compatibilidade: {Math.round(typeof application.match_score === 'number' ? application.match_score : Number(application.match_score))}%
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && application.feedback && (
                    <div className="p-3 rounded-md bg-error/10 border border-error/20">
                      <p className="text-xs font-semibold text-error mb-1">Feedback:</p>
                      <p className="text-sm text-brown-soft whitespace-pre-line">
                        {application.feedback}
                      </p>
                    </div>
                  )}

                  {application.status === 'accepted' && (
                    <div className="p-4 rounded-md bg-success/10 border border-success/20">
                      <p className="text-sm font-semibold text-success mb-2">
                        🎉 Parabéns! Sua candidatura foi aceita!
                      </p>
                      <p className="text-sm text-brown-soft mb-3">
                        O recrutador enviou uma mensagem com os detalhes da entrevista. Abra a conversa para ver mais informações e confirmar sua disponibilidade.
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedApplication(application)
                          setMessageDialogOpen(true)
                        }}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Abrir Conversa
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Link href={`/dashboard/jobs/${application.job_id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Vaga
                      </Button>
                    </Link>
                    {application.status === 'accepted' && (
                      <Button
                        variant="default"
                        onClick={() => {
                          setSelectedApplication(application)
                          setMessageDialogOpen(true)
                        }}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Conversar
                      </Button>
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
                Você ainda não se candidatou a nenhuma vaga.
              </p>
              <div className="mt-4 text-center">
                <Link href="/dashboard/jobs">
                  <Button>Buscar Vagas</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedApplication && (
          <MessageDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            applicationId={selectedApplication.id}
            recruiterName={selectedApplication.job?.title}
          />
        )}
      </div>
    </div>
  )
}

