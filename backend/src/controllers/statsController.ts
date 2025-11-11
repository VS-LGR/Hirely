import { Response, NextFunction } from 'express'
import { createError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { db } from '../database/connection'

export const getRecruiterStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw createError('Não autenticado', 401)
    }

    if (req.user.role !== 'recruiter') {
      throw createError('Apenas recrutadores podem ver estatísticas', 403)
    }

    const recruiterId = Number(req.user.id)

    // Contar vagas ativas
    const activeJobsResult = await db.query(
      `SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = $1 AND status = 'active'`,
      [recruiterId]
    )
    const activeJobs = parseInt(activeJobsResult.rows[0].count) || 0

    // Contar total de candidatos (aplicações únicas)
    const candidatesResult = await db.query(
      `SELECT COUNT(DISTINCT candidate_id) as count 
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = $1`,
      [recruiterId]
    )
    const candidates = parseInt(candidatesResult.rows[0].count) || 0

    // Contar candidaturas pendentes
    const pendingApplicationsResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE j.recruiter_id = $1 AND a.status = 'pending'`,
      [recruiterId]
    )
    const pendingApplications = parseInt(pendingApplicationsResult.rows[0].count) || 0

    // Visualizações (por enquanto retornar 0, pode ser implementado depois)
    const views = 0

    res.json({
      success: true,
      data: {
        activeJobs,
        candidates,
        pendingApplications,
        views,
      },
    })
  } catch (error) {
    next(error)
  }
}

