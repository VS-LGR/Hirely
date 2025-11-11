export type UserRole = 'recruiter' | 'candidate' | 'admin'

export interface Tag {
  id: number
  name: string
  category: string
  parent_id?: number
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  bio?: string
  skills?: string[]
  tags?: Tag[]
  experience?: Experience[]
  education?: Education[]
  created_at: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
}

export interface Job {
  id: number
  recruiter_id: number
  title: string
  description: string
  requirements?: string
  salary_min?: number
  salary_max?: number
  location?: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  remote: boolean
  status: 'active' | 'closed' | 'draft'
  tags?: Tag[]
  match_score?: number
  created_at: string
  updated_at: string
}

export interface Application {
  id: number
  job_id: number
  candidate_id: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  cover_letter?: string
  match_score?: number
  created_at: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}


