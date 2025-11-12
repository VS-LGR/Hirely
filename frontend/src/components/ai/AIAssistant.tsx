'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIAssistantProps {
  className?: string
}

export function AIAssistant({ className }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente de carreira. Como posso ajudá-lo a construir um perfil profissional completo hoje?',
    },
  ])
  const [input, setInput] = useState('')
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
    },
  })

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    chatMutation.mutate(userMessage)
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
          <MessageCircle className="h-5 w-5" />
          Assistente de Carreira
        </CardTitle>
        <CardDescription>
          Pergunte-me sobre como melhorar seu perfil, sugerir tags ou qualquer dúvida sobre sua carreira
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
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

