'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { Job, Tag, Application } from '@/types'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { User } from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const jobId = params.id as string
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await api.get(`/jobs/${jobId}`)
      return response.data.data.job
    },
  })

  // Verificar se o candidato já se candidatou
  const { data: myApplications } = useQuery<Application[]>({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const response = await api.get('/applications/my')
      return response.data.data.applications
    },
    enabled: user?.role === 'candidate',
  })

  const hasApplied = myApplications?.some((app) => app.job_id === Number(jobId))

  const applicationMutation = useMutation({
    mutationFn: async (data: { job_id: number; cover_letter?: string }) => {
      const response = await api.post('/applications', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setShowApplicationForm(false)
      setCoverLetter('')
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-brown-soft">Carregando...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-error">Vaga não encontrada</p>
            <Button
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/jobs')}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Voltar
        </Button>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-base">
                  {job.location && `${job.location} • `}
                  {job.remote ? 'Remoto' : 'Presencial'} • {job.type}
                </CardDescription>
              </div>
              {job.salary_min && job.salary_max && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-brown-dark">
                    R$ {job.salary_min.toLocaleString()} - R${' '}
                    {job.salary_max.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {job.match_score && user?.role === 'candidate' && (
              <div className="p-4 rounded-md bg-bege-medium border border-brown-light">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brown-dark">
                    Compatibilidade com seu perfil
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {job.match_score}%
                  </span>
                </div>
                <p className="text-xs text-brown-soft mt-1">
                  Baseado nas habilidades do seu perfil
                </p>
              </div>
            )}

            {job.tags && job.tags.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-brown-dark mb-3">
                  Habilidades e Competências
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag: Tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-md bg-bege-medium text-brown-dark text-sm border border-brown-light"
                    >
                      {tag.name}
                      {tag.category && (
                        <span className="ml-1 text-xs text-brown-soft">
                          ({tag.category})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-brown-dark mb-2">
                Descrição
              </h3>
              <p className="text-brown-soft whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div>
                <h3 className="text-xl font-semibold text-brown-dark mb-2">
                  Requisitos
                </h3>
                <p className="text-brown-soft whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}

            {user?.role === 'candidate' && job.recruiter_id && (
              <div className="p-4 rounded-md bg-bege-medium border border-brown-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-brown-dark mb-1">
                      Sobre o Recrutador
                    </h3>
                    <p className="text-sm text-brown-soft">
                      Conheça mais sobre a empresa e o recrutador desta vaga
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/recruiter/${job.recruiter_id}`}>
                      <User className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {user?.role === 'candidate' && (
              <div className="pt-4 border-t border-border space-y-4">
                {hasApplied ? (
                  <div className="p-4 rounded-md bg-bege-medium border border-brown-light">
                    <p className="text-sm font-medium text-brown-dark">
                      Você já se candidatou a esta vaga
                    </p>
                    <p className="text-xs text-brown-soft mt-1">
                      Status: {myApplications?.find((app) => app.job_id === Number(jobId))?.status || 'pending'}
                    </p>
                  </div>
                ) : showApplicationForm ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cover_letter">Carta de Apresentação (Opcional)</Label>
                      <Textarea
                        id="cover_letter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Conte-nos por que você é a pessoa ideal para esta vaga..."
                        rows={5}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          applicationMutation.mutate({
                            job_id: Number(jobId),
                            cover_letter: coverLetter || undefined,
                          })
                        }}
                        disabled={applicationMutation.isPending}
                        className="flex-1"
                      >
                        {applicationMutation.isPending ? 'Enviando...' : 'Enviar Candidatura'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowApplicationForm(false)
                          setCoverLetter('')
                        }}
                        disabled={applicationMutation.isPending}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full"
                  >
                    Candidatar-se
                  </Button>
                )}
              </div>
            )}

            {user?.role === 'recruiter' && user.id === job.recruiter_id.toString() && (
              <div className="pt-4 border-t border-border space-y-4">
                <Button
                  onClick={() => router.push(`/dashboard/jobs/${jobId}/applications`)}
                  className="w-full"
                >
                  Ver Candidatos
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">Editar</Button>
                  <Button variant="destructive" className="flex-1">Deletar</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


