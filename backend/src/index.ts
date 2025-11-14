import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/auth'
import { jobRoutes } from './routes/jobs'
import { userRoutes } from './routes/users'
import { aiRoutes } from './routes/ai'
import { tagRoutes } from './routes/tags'
import { statsRoutes } from './routes/stats'
import { applicationRoutes } from './routes/applications'
import { watsonSearchRoutes } from './routes/watsonSearch'
import { courseRoutes } from './routes/courses'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Configurar CORS para produção
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.NEXT_PUBLIC_API_URL || '*',
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hirely API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      users: '/api/users',
      ai: '/api/ai',
      tags: '/api/tags',
      stats: '/api/stats',
      applications: '/api/applications',
      watsonSearch: '/api/watson-search',
      watsonSearchEndpoint: '/api/watson-search/search',
      courses: '/api/courses'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hirely API is running', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/watson-search', watsonSearchRoutes)
app.use('/api/courses', courseRoutes)

// Error handler
app.use(errorHandler)

// Iniciar servidor apenas se não estiver rodando no Vercel
// No Vercel, o arquivo api/index.ts exporta o app
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

// Exportar app para uso no Vercel
export default app

