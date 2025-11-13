import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// Configuração para Supabase ou PostgreSQL local
const getDbConfig = () => {
  // Se tiver DATABASE_URL (Supabase), usar ela
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Para serverless, usar menos conexões
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  }

  // Fallback para configuração local
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'hirely',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}

export const db = new Pool(getDbConfig())

// Test connection
db.on('connect', () => {
  console.log('✅ Database connected')
})

db.on('error', (err) => {
  console.error('❌ Database connection error:', err)
})


