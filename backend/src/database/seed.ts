import { db } from './connection'
import bcrypt from 'bcryptjs'

const seed = async () => {
  try {
    // Criar usuário admin de exemplo
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await db.query(`
      INSERT INTO users (email, password, name, role)
      VALUES ('admin@hirely.com', $1, 'Admin Hirely', 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword])

    // Criar recrutador de exemplo
    const recruiterPassword = await bcrypt.hash('recruiter123', 10)
    const recruiterResult = await db.query(`
      INSERT INTO users (email, password, name, role)
      VALUES ('recruiter@hirely.com', $1, 'Recrutador Exemplo', 'recruiter')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [recruiterPassword])

    if (recruiterResult.rows.length > 0) {
      const recruiterId = recruiterResult.rows[0].id

      // Criar vagas de exemplo
      await db.query(`
        INSERT INTO jobs (recruiter_id, title, description, requirements, salary_min, salary_max, location, type, remote)
        VALUES
        ($1, 'Desenvolvedor Full Stack', 'Buscamos um desenvolvedor full stack para nossa equipe...', 'React, Node.js, PostgreSQL', 5000, 8000, 'São Paulo, SP', 'full-time', true),
        ($1, 'Designer UX/UI', 'Procuramos um designer criativo e experiente...', 'Figma, Design Thinking', 4000, 7000, 'Rio de Janeiro, RJ', 'full-time', false)
        ON CONFLICT DO NOTHING
      `, [recruiterId])
    }

    console.log('✅ Seed data created successfully')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

export { seed }


