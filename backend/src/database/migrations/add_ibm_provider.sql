-- Migration: Adicionar IBM como provider de cursos
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover constraint antiga
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_provider_check;

-- Adicionar nova constraint incluindo IBM
ALTER TABLE courses ADD CONSTRAINT courses_provider_check CHECK (provider IN ('FIAP', 'ALURA', 'IBM'));

-- Atualizar comentário
COMMENT ON COLUMN courses.provider IS 'Provedor do curso: FIAP, ALURA ou IBM';

