import { db } from './connection'

const testJobs = async () => {
  try {
    console.log('Testing jobs for recruiter_id = 3...')
    
    // Verificar todas as vagas
    const allJobs = await db.query('SELECT id, recruiter_id, title, status FROM jobs ORDER BY created_at DESC')
    console.log('\n=== All Jobs ===')
    console.log('Total jobs:', allJobs.rows.length)
    allJobs.rows.forEach((job: any) => {
      console.log(`ID: ${job.id}, Recruiter ID: ${job.recruiter_id} (type: ${typeof job.recruiter_id}), Title: ${job.title}, Status: ${job.status}`)
    })
    
    // Verificar vagas do recruiter 3 como número
    const jobsByNumber = await db.query('SELECT id, recruiter_id, title, status FROM jobs WHERE recruiter_id = $1', [3])
    console.log('\n=== Jobs for recruiter_id = 3 (as number) ===')
    console.log('Found:', jobsByNumber.rows.length)
    jobsByNumber.rows.forEach((job: any) => {
      console.log(`ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`)
    })
    
    // Verificar vagas do recruiter 3 como string
    const jobsByString = await db.query('SELECT id, recruiter_id, title, status FROM jobs WHERE recruiter_id::text = $1', ['3'])
    console.log('\n=== Jobs for recruiter_id = "3" (as string) ===')
    console.log('Found:', jobsByString.rows.length)
    jobsByString.rows.forEach((job: any) => {
      console.log(`ID: ${job.id}, Title: ${job.title}, Status: ${job.status}`)
    })
    
    // Verificar usuários
    const users = await db.query('SELECT id, email, name, role FROM users WHERE role = $1', ['recruiter'])
    console.log('\n=== Recruiters ===')
    users.rows.forEach((user: any) => {
      console.log(`ID: ${user.id} (type: ${typeof user.id}), Email: ${user.email}, Name: ${user.name}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testJobs()

