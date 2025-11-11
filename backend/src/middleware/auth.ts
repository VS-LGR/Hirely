import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: 'recruiter' | 'candidate' | 'admin'
  }
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw createError('Token não fornecido', 401)
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: 'recruiter' | 'candidate' | 'admin'
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Token inválido', 401))
    }
    next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Não autenticado', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Acesso negado', 403))
    }

    next()
  }
}

// Middleware opcional de autenticação - não retorna erro se não houver token
export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    console.log('optionalAuthenticate: Authorization header:', authHeader ? 'present' : 'missing')
    
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Sem token, continua sem erro
      console.log('optionalAuthenticate: No token provided, continuing without auth')
      return next()
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: 'recruiter' | 'candidate' | 'admin'
    }

    console.log('optionalAuthenticate: User authenticated successfully', { 
      id: decoded.id, 
      role: decoded.role,
      email: decoded.email 
    })
    req.user = decoded
    next()
  } catch (error: any) {
    // Se o token for inválido, continua sem erro (tratado como não autenticado)
    console.log('optionalAuthenticate: Token invalid or error', error?.message || error)
    next()
  }
}


