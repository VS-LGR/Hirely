import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { 
  Sparkles, 
  Users, 
  Brain, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Target, 
  Heart,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2
} from 'lucide-react'

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
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Copiloto para Recrutadores</CardTitle>
                <CardDescription>
                  IA que ajuda a criar descrições de vagas, sugerir salários e triar candidatos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Mentor para Candidatos</CardTitle>
                <CardDescription>
                  Assistente de carreira que otimiza currículos e recomenda vagas ideais
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Match Inteligente</CardTitle>
                <CardDescription>
                  Algoritmo que encontra a compatibilidade perfeita entre candidatos e vagas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Solutions for Recruiters */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold text-brown-dark">
                Soluções para Recrutadores
              </h2>
            </div>
            <p className="text-lg text-brown-soft max-w-2xl mx-auto">
              Transforme seu processo de recrutamento com inteligência artificial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-bege-light to-bege-medium border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Geração de Vagas com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brown-soft">
                  Crie descrições profissionais e atrativas de vagas em segundos, apenas descrevendo suas necessidades
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bege-light to-bege-medium border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Score de Compatibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brown-soft">
                  Sistema avançado que calcula a compatibilidade entre candidatos e vagas usando IA
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bege-light to-bege-medium border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Feedback Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brown-soft">
                  Gere feedbacks construtivos e personalizados para cada candidato com ajuda da IA
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-bege-light to-bege-medium border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Gestão de Entrevistas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brown-soft">
                  Organize e marque entrevistas preliminares diretamente na plataforma
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Solutions for Candidates */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h2 className="text-4xl font-bold text-brown-dark">
                Soluções para Candidatos
              </h2>
            </div>
            <p className="text-lg text-brown-soft max-w-2xl mx-auto">
              Desenvolva sua carreira com suporte inteligente e personalizado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Análise Inteligente de Currículo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  Faça upload do seu currículo e receba uma análise completa com sugestões de melhorias, tags recomendadas e pontos fortes identificados pela IA
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Extração automática de informações
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Sugestões de tags e habilidades
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Identificação de pontos fortes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Ellie - Assistente de Carreira</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  Converse com a Ellie, sua assistente de carreira pessoal. Ela ajuda a melhorar seu perfil, sugerir vagas ideais e responder dúvidas sobre sua trajetória profissional
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Otimização de biografia e perfil
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Recomendações de vagas personalizadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Dicas de carreira e entrevistas
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Reintegração ao Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  Descubra novas áreas de atuação baseadas na sua experiência anterior. Receba sugestões de transição natural, adjacente ou estratégica, com cursos recomendados
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Análise de transição de carreira
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Cursos da FIAP, Alura e IBM
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Busca por categoria
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Match Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  Encontre vagas que realmente combinam com seu perfil. Nosso algoritmo analisa suas habilidades, experiência e objetivos para sugerir as melhores oportunidades
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Score de compatibilidade em tempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Recomendações personalizadas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Filtros inteligentes
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Cuidados com Saúde Mental</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  A busca por emprego pode ser desafiadora. Acesse dicas para organizar suas ideias e profissionais de psicologia afiliados com preços acessíveis
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Textos organizacionais e motivacionais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Profissionais afiliados
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Atendimento online e presencial
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Perfil de Recrutadores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brown-soft mb-4">
                  Conheça melhor as empresas e recrutadores antes de se candidatar. Veja informações sobre a empresa, setor de atuação e outras vagas disponíveis
                </p>
                <ul className="space-y-2 text-sm text-brown-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Informações da empresa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Setor e porte da empresa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Histórico de vagas
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-primary/30 shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-brown-dark mb-4">
                Pronto para transformar sua jornada profissional?
              </h2>
              <p className="text-xl text-brown-soft mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais e empresas que já estão usando o Hirely para encontrar as melhores oportunidades e talentos
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Começar Agora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  )
}
