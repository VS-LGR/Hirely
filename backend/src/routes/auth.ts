import { Router } from 'express'
import { register, login, getProfile } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.get('/me', authenticate, getProfile)


