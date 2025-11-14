import { Router } from 'express'
import { searchCourses, listCourses, getRecommendedCourses } from '../controllers/courseController'

export const courseRoutes = Router()

courseRoutes.get('/', listCourses)
courseRoutes.get('/search', searchCourses)
courseRoutes.get('/recommended', getRecommendedCourses)

