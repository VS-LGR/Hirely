import { Router } from 'express'
import { generateJobDescription, analyzeResume, suggestImprovements } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'

export const aiRoutes = Router()

aiRoutes.post('/generate-job-description', authenticate, generateJobDescription)
aiRoutes.post('/analyze-resume', authenticate, analyzeResume)
aiRoutes.post('/suggest-improvements', authenticate, suggestImprovements)


