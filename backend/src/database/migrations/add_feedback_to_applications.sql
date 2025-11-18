-- Adicionar campo de feedback para candidaturas rejeitadas
ALTER TABLE applications ADD COLUMN IF NOT EXISTS feedback TEXT;

COMMENT ON COLUMN applications.feedback IS 'Feedback personalizado gerado pela IA para candidatos rejeitados. Obrigatório quando status = rejected';

