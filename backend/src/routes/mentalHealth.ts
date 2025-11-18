import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getMentalHealthProfessionals,
  getMentalHealthProfessional,
  getMentalHealthTips,
  getMentalHealthCategories,
} from '../controllers/mentalHealthController'

const router = Router()

// Rotas públicas (não precisam de autenticação)
router.get('/professionals', getMentalHealthProfessionals)
router.get('/professionals/:id', getMentalHealthProfessional)
router.get('/tips', getMentalHealthTips)
router.get('/categories', getMentalHealthCategories)

export default router

