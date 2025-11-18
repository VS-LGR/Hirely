import { Router } from 'express'
import {
  getUserProfile,
  updateUserProfile,
  getRecruiterPublicProfile,
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'

export const userRoutes = Router()

userRoutes.get('/profile', authenticate, getUserProfile)
userRoutes.put('/profile', authenticate, updateUserProfile)
// Rota pública para visualizar perfil de recrutador
userRoutes.get('/recruiter/:id', getRecruiterPublicProfile)


