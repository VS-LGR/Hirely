'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Send, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  id: number
  application_id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: boolean
  created_at: string
  sender_name: string
  receiver_name: string
}

interface MessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  candidateName?: string
  recruiterName?: string
}

export function MessageDialog({
  open,
  onOpenChange,
  applicationId,
  candidateName,
  recruiterName,
}: MessageDialogProps) {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [messageContent, setMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['messages', applicationId],
    queryFn: async () => {
      const response = await api.get(`/messages/application/${applicationId}`)
      return response.data.data.messages
    },
    enabled: open && !!applicationId,
    refetchInterval: open ? 3000 : false, // Atualizar a cada 3 segundos quando aberto
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('/messages', {
        application_id: applicationId,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      setMessageContent('')
      queryClient.invalidateQueries({ queryKey: ['messages', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['messages-unread'] })
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/messages/application/${applicationId}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['messages-unread'] })
    },
  })

  useEffect(() => {
    if (open && messages && messages.length > 0) {
      // Marcar mensagens como lidas quando o diálogo é aberto
      markAsReadMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, messages])

  useEffect(() => {
    // Scroll para a última mensagem
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!messageContent.trim()) return

    sendMessageMutation.mutate(messageContent.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isMyMessage = (message: Message) => {
    // Converter ambos para number para comparação correta
    // user.id é string, message.sender_id é number
    return Number(message.sender_id) === Number(user?.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Conversa {candidateName ? `com ${candidateName}` : recruiterName ? `com ${recruiterName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Discuta detalhes da entrevista e confirme disponibilidade
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[400px] p-4 bg-bege-light rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-brown-soft" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMyMessage(message)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-bege-medium text-brown-dark'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {isMyMessage(message) ? 'Você' : message.sender_name}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isMyMessage(message) ? 'text-primary-foreground/70' : 'text-brown-soft'
                    }`}
                  >
                    {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-brown-soft">
              <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            className="min-h-[80px] resize-none"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!messageContent.trim() || sendMessageMutation.isPending}
            className="self-end"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

