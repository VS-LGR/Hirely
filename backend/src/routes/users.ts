import { Router } from 'express'
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'

export const userRoutes = Router()

userRoutes.get('/profile', authenticate, getUserProfile)
userRoutes.put('/profile', authenticate, updateUserProfile)


