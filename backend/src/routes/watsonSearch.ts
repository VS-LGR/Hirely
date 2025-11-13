import { Router } from 'express'
import { watsonSearch, watsonSearchHealth } from '../controllers/watsonSearchController'

export const watsonSearchRoutes = Router()

// Health check
watsonSearchRoutes.get('/health', watsonSearchHealth)

// Endpoint de busca para Watson Assistant
// O Watson faz POST com a query
watsonSearchRoutes.post('/search', watsonSearch)

// Também aceita GET para testes
watsonSearchRoutes.get('/search', watsonSearch)

