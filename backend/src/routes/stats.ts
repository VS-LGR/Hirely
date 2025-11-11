import { Router } from 'express'
import { getRecruiterStats } from '../controllers/statsController'
import { authenticate } from '../middleware/auth'

export const statsRoutes = Router()

statsRoutes.get('/recruiter', authenticate, getRecruiterStats)

