import { Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

// Enviar mensagem
export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { application_id, content } = req.body

    if (!application_id || !content || !content.trim()) {
      throw createError('ID da aplicação e conteúdo da mensagem são obrigatórios', 400)
    }

    // Verificar se a aplicação existe e se o usuário tem permissão
    const applicationCheck = await db.query(
      `SELECT a.id, a.candidate_id, a.job_id, j.recruiter_id
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [application_id]
    )

    if (applicationCheck.rows.length === 0) {
      throw createError('Aplicação não encontrada', 404)
    }

    const application = applicationCheck.rows[0]
    const candidateId = Number(application.candidate_id)
    const recruiterId = Number(application.recruiter_id)
    const userId = Number(req.user.id)

    // Verificar se o usuário é o candidato ou o recrutador
    if (userId !== candidateId && userId !== recruiterId) {
      throw createError('Você não tem permissão para enviar mensagens nesta conversa', 403)
    }

    // Determinar o destinatário
    const receiverId = userId === candidateId ? recruiterId : candidateId

    // Inserir mensagem
    const result = await db.query(
      `INSERT INTO messages (application_id, sender_id, receiver_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [application_id, userId, receiverId, content.trim()]
    )

    res.json({
      success: true,
      data: {
        message: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

// Obter mensagens de uma aplicação
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { application_id } = req.params

    if (!application_id) {
      throw createError('ID da aplicação é obrigatório', 400)
    }

    // Verificar se a aplicação existe e se o usuário tem permissão
    const applicationCheck = await db.query(
      `SELECT a.id, a.candidate_id, a.job_id, j.recruiter_id
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [application_id]
    )

    if (applicationCheck.rows.length === 0) {
      throw createError('Aplicação não encontrada', 404)
    }

    const application = applicationCheck.rows[0]
    const candidateId = Number(application.candidate_id)
    const recruiterId = Number(application.recruiter_id)
    const userId = Number(req.user.id)

    // Verificar se o usuário é o candidato ou o recrutador
    if (userId !== candidateId && userId !== recruiterId) {
      throw createError('Você não tem permissão para ver mensagens desta conversa', 403)
    }

    // Buscar mensagens
    const result = await db.query(
      `SELECT m.*, 
              u_sender.name as sender_name,
              u_receiver.name as receiver_name
       FROM messages m
       INNER JOIN users u_sender ON m.sender_id = u_sender.id
       INNER JOIN users u_receiver ON m.receiver_id = u_receiver.id
       WHERE m.application_id = $1
       ORDER BY m.created_at ASC`,
      [application_id]
    )

    res.json({
      success: true,
      data: {
        messages: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Marcar mensagens como lidas
export const markMessagesAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const { application_id } = req.params

    if (!application_id) {
      throw createError('ID da aplicação é obrigatório', 400)
    }

    // Verificar se a aplicação existe e se o usuário tem permissão
    const applicationCheck = await db.query(
      `SELECT a.id, a.candidate_id, a.job_id, j.recruiter_id
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [application_id]
    )

    if (applicationCheck.rows.length === 0) {
      throw createError('Aplicação não encontrada', 404)
    }

    const application = applicationCheck.rows[0]
    const candidateId = Number(application.candidate_id)
    const recruiterId = Number(application.recruiter_id)
    const userId = Number(req.user.id)

    // Verificar se o usuário é o candidato ou o recrutador
    if (userId !== candidateId && userId !== recruiterId) {
      throw createError('Você não tem permissão para marcar mensagens desta conversa', 403)
    }

    // Marcar mensagens não lidas como lidas
    await db.query(
      `UPDATE messages 
       SET is_read = true
       WHERE application_id = $1 AND receiver_id = $2 AND is_read = false`,
      [application_id, userId]
    )

    res.json({
      success: true,
      message: 'Mensagens marcadas como lidas',
    })
  } catch (error) {
    next(error)
  }
}

// Obter contagem de mensagens não lidas
export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const userId = Number(req.user.id)

    // Buscar aplicações do usuário (como candidato ou recrutador)
    const applicationsResult = await db.query(
      `SELECT a.id
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.candidate_id = $1 OR j.recruiter_id = $1`,
      [userId]
    )

    const applicationIds = applicationsResult.rows.map((row: any) => row.id)

    if (applicationIds.length === 0) {
      return res.json({
        success: true,
        data: {
          unreadCount: 0,
        },
      })
    }

    // Contar mensagens não lidas
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM messages
       WHERE application_id = ANY($1::int[]) AND receiver_id = $2 AND is_read = false`,
      [applicationIds, userId]
    )

    res.json({
      success: true,
      data: {
        unreadCount: parseInt(result.rows[0].count) || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

