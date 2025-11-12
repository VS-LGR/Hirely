import { Router } from 'express'
import {
  generateJobDescription,
  analyzeResume,
  suggestImprovements,
  uploadAndAnalyzeResume,
  suggestTagsForProfile,
  chatWithAssistant,
} from '../controllers/aiController'
import { authenticate, authorize } from '../middleware/auth'
import { uploadResume } from '../utils/fileUpload'

export const aiRoutes = Router()

// Rotas para recrutadores
aiRoutes.post('/generate-job-description', authenticate, authorize('recruiter', 'admin'), generateJobDescription)

// Rotas para candidatos
aiRoutes.post('/analyze-resume', authenticate, authorize('candidate'), analyzeResume)
aiRoutes.post('/suggest-improvements', authenticate, authorize('candidate'), suggestImprovements)
aiRoutes.post(
  '/upload-resume',
  authenticate,
  authorize('candidate'),
  uploadResume.single('resume'),
  uploadAndAnalyzeResume
)
aiRoutes.post('/suggest-tags', authenticate, authorize('candidate'), suggestTagsForProfile)
aiRoutes.post('/chat', authenticate, authorize('candidate'), chatWithAssistant)


