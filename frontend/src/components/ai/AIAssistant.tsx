'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2, Sparkles } from 'lucide-react'
import api from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  className?: string
}

// Quick replies sugeridas
const QUICK_REPLIES = [
  'Como melhorar minha biografia?',
  'Sugerir tags para meu perfil',
  'Preciso de ajuda com reintegração ao mercado',
  'Dicas para entrevistas',
]

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a Ellie, sua assistente de carreira. Como posso ajudá-lo a construir um perfil profissional completo hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post('/ai/chat', {
        message,
        history: messages.slice(1), // Remove mensagem inicial
      })
      return response.data.data.response as string
    },
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response },
      ])
      setInput('')
      setShowQuickReplies(false) // Ocultar quick replies após primeira mensagem
    },
    onError: (error: any) => {
      let errorMessage = 'Erro ao processar mensagem'
      
      // Melhor tratamento de erros
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.status === 401) {
        errorMessage = 'Não autenticado. Por favor, faça login novamente.'
      } else if (error.response?.status === 403) {
        errorMessage = 'Apenas candidatos podem usar o assistente.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Por favor, tente novamente mais tarde.'
      }
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `❌ **Erro:** ${errorMessage}\n\nPor favor, tente novamente. Se o problema persistir, verifique sua conexão ou entre em contato com o suporte.` 
        },
      ])
      setInput('')
    },
  })

  const handleSend = (message?: string) => {
    const messageToSend = message || input.trim()
    if (!messageToSend || chatMutation.isPending) return

    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }])
    setInput('')
    setShowQuickReplies(false)
    chatMutation.mutate(messageToSend)
  }

  const handleQuickReply = (reply: string) => {
    handleSend(reply)
  }
  
  // Função para formatar markdown básico
  const formatMessage = (text: string) => {
    // Converter **texto** para negrito
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Converter *texto* para itálico
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Converter quebras de linha
    formatted = formatted.replace(/\n/g, '<br />')
    // Converter links básicos
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>')
    return formatted
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Ellie - Assistente de Carreira
        </CardTitle>
        <CardDescription>
          Pergunte-me sobre como melhorar seu perfil, sugerir tags, reintegração ao mercado ou qualquer dúvida sobre sua carreira
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 overflow-y-auto space-y-4 p-4 bg-bege-light rounded-md border border-brown-light">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-bege-medium text-brown-dark border border-brown-light'
                }`}
              >
                <div 
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-bege-medium rounded-lg p-3 border border-brown-light">
                <Loader2 className="h-4 w-4 animate-spin text-brown-soft" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {showQuickReplies && messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-brown-soft">Sugestões rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={chatMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

