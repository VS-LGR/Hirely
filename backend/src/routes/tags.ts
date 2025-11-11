import { Router } from 'express'
import { getTags, getTagsByCategory, searchTags } from '../controllers/tagController'

export const tagRoutes = Router()

tagRoutes.get('/', getTags)
tagRoutes.get('/category/:category', getTagsByCategory)
tagRoutes.get('/search', searchTags)

