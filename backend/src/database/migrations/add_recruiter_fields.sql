-- Adicionar campos específicos para recrutadores
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_description TEXT;

COMMENT ON COLUMN users.company IS 'Nome da empresa do recrutador';
COMMENT ON COLUMN users.industry IS 'Ramo/Setor de atuação da empresa';
COMMENT ON COLUMN users.website IS 'Website da empresa';
COMMENT ON COLUMN users.location IS 'Localização da empresa';
COMMENT ON COLUMN users.company_size IS 'Tamanho da empresa (ex: Pequena, Média, Grande)';
COMMENT ON COLUMN users.company_description IS 'Descrição da empresa e cultura organizacional';

