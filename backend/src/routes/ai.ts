import { Router, Request, Response, NextFunction } from 'express'
import {
  generateJobDescription,
  analyzeResume,
  suggestImprovements,
  uploadAndAnalyzeResume,
  suggestTagsForProfile,
  analyzeReintegration,
  chatWithAssistant,
} from '../controllers/aiController'
import { authenticate, authorize } from '../middleware/auth'
import { uploadResume } from '../utils/fileUpload'
import { createError } from '../middleware/errorHandler'

export const aiRoutes = Router()

// Middleware para tratar erros do multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Arquivo muito grande. Tamanho máximo: 5MB',
        },
      })
    }
    if (err.message.includes('Apenas arquivos PDF e DOCX')) {
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
        },
      })
    }
    return res.status(400).json({
      success: false,
      error: {
        message: err.message || 'Erro ao processar arquivo',
      },
    })
  }
  next()
}

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
  handleMulterError,
  uploadAndAnalyzeResume
)
aiRoutes.post('/suggest-tags', authenticate, authorize('candidate'), suggestTagsForProfile)
aiRoutes.post('/analyze-reintegration', authenticate, authorize('candidate'), analyzeReintegration)
aiRoutes.post('/chat', authenticate, authorize('candidate'), chatWithAssistant)


