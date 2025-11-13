import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Para produção (Supabase), usar memory storage
// Para desenvolvimento local, usar disk storage como fallback
const useSupabase = !!process.env.SUPABASE_URL

let storage: multer.StorageEngine

if (useSupabase) {
  // Memory storage para serverless (arquivo será enviado ao Supabase depois)
  storage = multer.memoryStorage()
} else {
  // Disk storage para desenvolvimento local
  const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      cb(null, `resume-${uniqueSuffix}${ext}`)
    },
  })
}

// Filtro de arquivos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Apenas arquivos PDF e DOCX são permitidos'))
  }
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

