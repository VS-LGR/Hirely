-- Tabela para profissionais de psicologia afiliados
CREATE TABLE IF NOT EXISTS mental_health_professionals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  crp VARCHAR(50) NOT NULL, -- Conselho Regional de Psicologia
  specialization TEXT, -- Especialidades (ex: "Ansiedade, Depressão, Carreira")
  bio TEXT, -- Breve descrição do profissional
  experience_years INTEGER DEFAULT 0,
  price_per_session DECIMAL(10, 2) NOT NULL, -- Preço por sessão
  session_duration INTEGER DEFAULT 50, -- Duração em minutos
  available_online BOOLEAN DEFAULT true,
  available_presential BOOLEAN DEFAULT false,
  location VARCHAR(255), -- Localização para atendimento presencial
  website VARCHAR(255),
  photo_url VARCHAR(500), -- URL da foto do profissional
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE mental_health_professionals IS 'Profissionais de psicologia afiliados ao programa de saúde mental';
COMMENT ON COLUMN mental_health_professionals.crp IS 'Número de registro no Conselho Regional de Psicologia';
COMMENT ON COLUMN mental_health_professionals.price_per_session IS 'Preço por sessão em reais (preço acessível para usuários da plataforma)';

-- Tabela para textos motivacionais/organizacionais
CREATE TABLE IF NOT EXISTS mental_health_tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- Ex: "organizacao", "motivacao", "ansiedade", "carreira"
  author VARCHAR(255), -- Opcional: autor do texto
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- Ordem de exibição
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE mental_health_tips IS 'Textos curtos para ajudar usuários a organizar ideias e cuidar da saúde mental';
COMMENT ON COLUMN mental_health_tips.category IS 'Categoria do texto: organizacao, motivacao, ansiedade, carreira, etc.';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mental_health_professionals_active ON mental_health_professionals(is_active);
CREATE INDEX IF NOT EXISTS idx_mental_health_tips_category ON mental_health_tips(category);
CREATE INDEX IF NOT EXISTS idx_mental_health_tips_active ON mental_health_tips(is_active);

