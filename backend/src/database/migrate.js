// Migration script - run with: node dist/database/migrate.js
const { Pool } = require('pg')
require('dotenv').config()

// Configuração para Supabase ou PostgreSQL local
const getDbConfig = () => {
  // Se tiver DATABASE_URL (Supabase), usar ela
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  }

  // Fallback para configuração local
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'hirely',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  }
}

const db = new Pool(getDbConfig())

async function createTables() {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'candidate' CHECK (role IN ('recruiter', 'candidate', 'admin')),
        bio TEXT,
        skills JSONB,
        experience JSONB,
        education JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Jobs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        salary_min DECIMAL(10, 2),
        salary_max DECIMAL(10, 2),
        location VARCHAR(255),
        type VARCHAR(50) DEFAULT 'full-time',
        remote BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
        cover_letter TEXT,
        match_score DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(job_id, candidate_id)
      )
    `)

    // Tags table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        parent_id INTEGER REFERENCES tags(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // User tags junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_tags (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, tag_id)
      )
    `)

    // Job tags junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS job_tags (
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (job_id, tag_id)
      )
    `)

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_tags_parent ON tags(parent_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_user_tags_user ON user_tags(user_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_user_tags_tag ON user_tags(tag_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_job_tags_job ON job_tags(job_id)')
    await db.query('CREATE INDEX IF NOT EXISTS idx_job_tags_tag ON job_tags(tag_id)')

    console.log('✅ Database tables created successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating tables:', error)
    process.exit(1)
  }
}

createTables()


