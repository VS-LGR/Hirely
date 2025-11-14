-- Migration: Adicionar tabela de cursos (FIAP/Alura)
-- Execute este script no SQL Editor do Supabase Dashboard
-- Ou use: psql $DATABASE_URL -f migrations/add_courses_table.sql

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL CHECK (provider IN ('FIAP', 'ALURA')),
  category VARCHAR(100),
  description TEXT,
  duration VARCHAR(50),
  level VARCHAR(50) CHECK (level IN ('Iniciante', 'Intermediário', 'Avançado')),
  url VARCHAR(500),
  tags INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_courses_provider ON courses(provider);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);

-- Comentários para documentação
COMMENT ON TABLE courses IS 'Tabela de cursos disponíveis para reintegração ao mercado de trabalho';
COMMENT ON COLUMN courses.provider IS 'Provedor do curso: FIAP ou ALURA';
COMMENT ON COLUMN courses.tags IS 'Array de IDs de tags relacionadas ao curso';
COMMENT ON COLUMN courses.level IS 'Nível do curso: Iniciante, Intermediário ou Avançado';

