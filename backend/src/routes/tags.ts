import { Router } from 'express'
import { getTags, getTagsByCategory, searchTags, listAllTags } from '../controllers/tagController'

export const tagRoutes = Router()

tagRoutes.get('/', getTags)
tagRoutes.get('/list', listAllTags)
tagRoutes.get('/category/:category', getTagsByCategory)
tagRoutes.get('/search', searchTags)

