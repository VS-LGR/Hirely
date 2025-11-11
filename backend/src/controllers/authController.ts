import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, role = 'candidate' } = req.body

    if (!email || !password || !name) {
      throw createError('Email, senha e nome são obrigatórios', 400)
    }

    // Verificar se usuário já existe
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw createError('Email já cadastrado', 409)
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const result = await db.query(
      `INSERT INTO users (email, password, name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, email, name, role, created_at`,
      [email, hashedPassword, name, role]
    )

    const user = result.rows[0]

    // Gerar token
    const payload = { id: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as string | number 
    } as SignOptions)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw createError('Email e senha são obrigatórios', 400)
    }

    // Buscar usuário
    const result = await db.query(
      'SELECT id, email, password, name, role FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      throw createError('Credenciais inválidas', 401)
    }

    const user = result.rows[0]

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      throw createError('Credenciais inválidas', 401)
    }

    // Gerar token
    const payload = { id: user.id, email: user.email, role: user.role }
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as string | number 
    } as SignOptions)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    const result = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      throw createError('Usuário não encontrado', 404)
    }

    res.json({
      success: true,
      data: {
        user: result.rows[0],
      },
    })
  } catch (error) {
    next(error)
  }
}
