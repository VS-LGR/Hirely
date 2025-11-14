-- Adicionar colunas strengths e suggestions à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS suggestions JSONB DEFAULT '[]'::jsonb;

-- Criar índices para melhor performance em queries
CREATE INDEX IF NOT EXISTS idx_users_strengths ON users USING GIN (strengths);
CREATE INDEX IF NOT EXISTS idx_users_suggestions ON users USING GIN (suggestions);

