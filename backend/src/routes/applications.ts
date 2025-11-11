import { Router } from 'express'
import {
  createApplication,
  getApplicationsByJob,
  getApplicationsByRecruiter,
  updateApplicationStatus,
  getMyApplications,
} from '../controllers/applicationController'
import { authenticate, authorize } from '../middleware/auth'

export const applicationRoutes = Router()

// Candidato se candidata a uma vaga
applicationRoutes.post('/', authenticate, authorize('candidate'), createApplication)

// Candidato vê suas próprias candidaturas
applicationRoutes.get('/my', authenticate, authorize('candidate'), getMyApplications)

// Recrutador vê candidatos de uma vaga específica
applicationRoutes.get(
  '/job/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  getApplicationsByJob
)

// Recrutador vê todas as candidaturas de suas vagas
applicationRoutes.get(
  '/recruiter',
  authenticate,
  authorize('recruiter', 'admin'),
  getApplicationsByRecruiter
)

// Recrutador atualiza status da candidatura
applicationRoutes.put(
  '/:id/status',
  authenticate,
  authorize('recruiter', 'admin'),
  updateApplicationStatus
)

