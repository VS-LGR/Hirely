'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { Heart, Brain, Users, Phone, Mail, Globe, MapPin, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MentalHealthTip {
  id: number
  title: string
  content: string
  category: string
  author?: string
}

interface MentalHealthProfessional {
  id: number
  name: string
  email: string
  phone?: string
  crp: string
  specialization?: string
  bio?: string
  experience_years: number
  price_per_session: number
  session_duration: number
  available_online: boolean
  available_presential: boolean
  location?: string
  website?: string
  photo_url?: string
}

export default function MentalHealthPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState<string>('')

  const { data: tips, isLoading: tipsLoading } = useQuery<MentalHealthTip[]>({
    queryKey: ['mental-health-tips', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {}
      const response = await api.get('/mental-health/tips', { params })
      return response.data.data.tips
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['mental-health-categories'],
    queryFn: async () => {
      const response = await api.get('/mental-health/categories')
      return response.data.data.categories
    },
  })

  const { data: professionals, isLoading: professionalsLoading } = useQuery<MentalHealthProfessional[]>({
    queryKey: ['mental-health-professionals', onlineOnly, maxPrice],
    queryFn: async () => {
      const params: any = {}
      if (onlineOnly) params.online_only = 'true'
      if (maxPrice) params.max_price = maxPrice
      const response = await api.get('/mental-health/professionals', { params })
      return response.data.data.professionals
    },
  })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      organizacao: 'Organização',
      motivacao: 'Motivação',
      ansiedade: 'Ansiedade',
      carreira: 'Carreira',
      saude: 'Saúde',
    }
    return labels[category] || category
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-brown-dark">Cuidados com a Saúde Mental</h1>
          </div>
          <p className="text-brown-soft text-lg">
            Sua jornada profissional é importante, mas sua saúde mental também é. Aqui você encontra dicas para organizar suas ideias e profissionais afiliados que oferecem atendimento a preços acessíveis.
          </p>
        </div>

        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Dicas e Textos
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profissionais Afiliados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Todas
              </Button>
              {categories?.map((cat: any) => (
                <Button
                  key={cat.category}
                  variant={selectedCategory === cat.category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {getCategoryLabel(cat.category)} ({cat.count})
                </Button>
              ))}
            </div>

            {tipsLoading ? (
              <div className="text-center py-12">
                <p className="text-brown-soft">Carregando dicas...</p>
              </div>
            ) : tips && tips.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tips.map((tip) => (
                  <Card key={tip.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {getCategoryLabel(tip.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-brown-soft text-sm leading-relaxed">{tip.content}</p>
                      {tip.author && (
                        <p className="text-xs text-brown-soft mt-3 italic">— {tip.author}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-brown-soft">
                    Nenhuma dica encontrada nesta categoria.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="professionals" className="space-y-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="online-only"
                        checked={onlineOnly}
                        onChange={(e) => setOnlineOnly(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brown-light bg-bege-light transition-all checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      />
                      <svg
                        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <Label htmlFor="online-only" className="cursor-pointer text-sm font-medium text-brown-dark">
                      Apenas atendimento online
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="max-price">Preço máximo por sessão</Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Ex: 150"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {professionalsLoading ? (
              <div className="text-center py-12">
                <p className="text-brown-soft">Carregando profissionais...</p>
              </div>
            ) : professionals && professionals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {professionals.map((professional) => (
                  <Card key={professional.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        {professional.photo_url ? (
                          <img
                            src={professional.photo_url}
                            alt={professional.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="h-8 w-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{professional.name}</CardTitle>
                          <CardDescription className="mt-1">
                            CRP: {professional.crp}
                          </CardDescription>
                          {professional.experience_years > 0 && (
                            <Badge variant="outline" className="mt-2">
                              {professional.experience_years} anos de experiência
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {professional.bio && (
                        <p className="text-sm text-brown-soft">{professional.bio}</p>
                      )}
                      {professional.specialization && (
                        <div>
                          <p className="text-xs font-semibold text-brown-dark mb-1">Especialidades:</p>
                          <p className="text-sm text-brown-soft">{professional.specialization}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(professional.price_per_session)}
                          </p>
                          <p className="text-xs text-brown-soft">
                            por sessão ({professional.session_duration} min)
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {professional.available_online && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        )}
                        {professional.available_presential && professional.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {professional.location}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        {professional.email && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={`mailto:${professional.email}`}>
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </a>
                          </Button>
                        )}
                        {professional.phone && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={`tel:${professional.phone}`}>
                              <Phone className="h-4 w-4 mr-1" />
                              Ligar
                            </a>
                          </Button>
                        )}
                        {professional.website && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={professional.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 mr-1" />
                              Site
                            </a>
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
                    Nenhum profissional encontrado com os filtros selecionados.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

