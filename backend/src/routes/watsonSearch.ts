import { Router } from 'express'
import { watsonSearch, watsonSearchHealth } from '../controllers/watsonSearchController'

export const watsonSearchRoutes = Router()

// Health check
watsonSearchRoutes.get('/health', watsonSearchHealth)

// Endpoint de busca para Watson Assistant
// O Watson pode fazer POST ou GET com a query
watsonSearchRoutes.post('/search', watsonSearch)
watsonSearchRoutes.get('/search', watsonSearch)

// Endpoint alternativo (caso o Watson use outro path)
watsonSearchRoutes.post('/', watsonSearch)
watsonSearchRoutes.get('/', watsonSearch)

