import { Router } from 'express'
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecommendedJobs,
} from '../controllers/jobController'
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth'

export const jobRoutes = Router()

jobRoutes.get('/', optionalAuthenticate, getJobs)
jobRoutes.get('/recommended', authenticate, getRecommendedJobs)
jobRoutes.get('/:id', getJobById)
jobRoutes.post('/', authenticate, authorize('recruiter', 'admin'), createJob)
jobRoutes.put('/:id', authenticate, authorize('recruiter', 'admin'), updateJob)
jobRoutes.delete('/:id', authenticate, authorize('recruiter', 'admin'), deleteJob)


