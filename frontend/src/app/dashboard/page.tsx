'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import api from '@/lib/api'
import { TrendingUp, Heart } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [mounted, setMounted] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: async () => {
      const response = await api.get('/stats/recruiter')
      return response.data.data
    },
    enabled: mounted && user?.role === 'recruiter',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brown-dark">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brown-dark mb-2">
            Olá, {user.name}!
          </h1>
          <p className="text-brown-soft">
            Bem-vindo ao seu painel {user.role === 'recruiter' ? 'de recrutamento' : 'de candidato'}
          </p>
        </div>

        {user.role === 'recruiter' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Link href="/dashboard/jobs">
                <CardHeader>
                  <CardTitle>Minhas Vagas</CardTitle>
                  <CardDescription>Gerencie suas vagas publicadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                    Ver Vagas
                  </Button>
                </CardContent>
              </Link>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Link href="/dashboard/jobs/new">
                <CardHeader>
                  <CardTitle>Criar Nova Vaga</CardTitle>
                  <CardDescription>Publique uma nova oportunidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                    Criar Vaga
                  </Button>
                </CardContent>
              </Link>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Link href="/dashboard/recruiter-profile">
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>Complete seu perfil de recrutador</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                    Editar Perfil
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Link href="/dashboard/jobs">
                  <CardHeader>
                    <CardTitle>Buscar Vagas</CardTitle>
                    <CardDescription>Encontre oportunidades ideais para você</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                      Buscar Vagas
                    </Button>
                  </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Link href="/dashboard/profile">
                  <CardHeader>
                    <CardTitle>Meu Perfil</CardTitle>
                    <CardDescription>Complete seu perfil profissional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-brown-soft text-brown-dark hover:bg-brown-light transition-all duration-300">
                      Editar Perfil
                    </Button>
                  </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <Link href="/dashboard/reintegration">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Reintegração ao Mercado
                    </CardTitle>
                    <CardDescription>
                      Descubra novas áreas e cursos para se recolocar no mercado do futuro
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                      Explorar
                    </Button>
                  </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/8 to-primary/3 border-primary/20">
                <Link href="/dashboard/mental-health">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Saúde Mental
                    </CardTitle>
                    <CardDescription>
                      Dicas para organizar suas ideias e profissionais afiliados com preços acessíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                      Acessar
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
            <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-brown-dark mb-2">Dica Profissional</h3>
                    <p className="text-brown-soft">
                      Complete seu perfil para aumentar suas chances de ser encontrado por recrutadores! Adicione suas habilidades, experiências e formação acadêmica.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Stats Section (for recruiters) */}
        {user.role === 'recruiter' && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-brown-dark mb-4">Estatísticas</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-bege-medium">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-brown-dark">
                    {stats?.activeJobs ?? 0}
                  </div>
                  <div className="text-sm text-brown-soft mt-1">Vagas Ativas</div>
                </CardContent>
              </Card>
              <Card className="bg-bege-medium">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-brown-dark">
                    {stats?.candidates ?? 0}
                  </div>
                  <div className="text-sm text-brown-soft mt-1">Candidatos</div>
                </CardContent>
              </Card>
              <Card className="bg-bege-medium border-warning">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-warning">
                    {stats?.pendingApplications ?? 0}
                  </div>
                  <div className="text-sm text-brown-soft mt-1">Candidaturas Pendentes</div>
                </CardContent>
              </Card>
              <Card className="bg-bege-medium">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-brown-dark">
                    {stats?.views ?? 0}
                  </div>
                  <div className="text-sm text-brown-soft mt-1">Visualizações</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

