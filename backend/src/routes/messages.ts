import { Router } from 'express'
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadCount,
} from '../controllers/messageController'
import { authenticate } from '../middleware/auth'

export const messageRoutes = Router()

// Enviar mensagem
messageRoutes.post('/', authenticate, sendMessage)

// Obter contagem de mensagens não lidas (deve vir antes da rota genérica)
messageRoutes.get('/unread-count', authenticate, getUnreadCount)

// Obter mensagens de uma aplicação
messageRoutes.get('/application/:application_id', authenticate, getMessages)

// Marcar mensagens como lidas
messageRoutes.put('/application/:application_id/read', authenticate, markMessagesAsRead)

