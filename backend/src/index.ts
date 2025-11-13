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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
      applications: '/api/applications'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hirely API is running' })
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

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

