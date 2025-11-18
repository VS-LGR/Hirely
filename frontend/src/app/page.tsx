import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold text-brown-dark mb-6">
              Hirely
            </h1>
            <p className="text-2xl text-brown-soft mb-8">
              ATS Inteligente com IA para recrutadores e candidatos
            </p>
            <p className="text-lg text-brown-soft mb-12">
              Conecte talentos às oportunidades certas com inteligência artificial
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Começar Agora</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-brown-dark text-center mb-12">
            Funcionalidades
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Copiloto para Recrutadores</CardTitle>
                <CardDescription>
                  IA que ajuda a criar descrições de vagas, sugerir salários e triar candidatos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mentor para Candidatos</CardTitle>
                <CardDescription>
                  Assistente de carreira que otimiza currículos e recomenda vagas ideais
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Match Inteligente</CardTitle>
                <CardDescription>
                  Algoritmo que encontra a compatibilidade perfeita entre candidatos e vagas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>
    </>
  )
}
