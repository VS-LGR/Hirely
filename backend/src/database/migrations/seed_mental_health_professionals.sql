-- Inserir profissionais de psicologia para testes
INSERT INTO mental_health_professionals (
  name, 
  email, 
  phone, 
  crp, 
  specialization, 
  bio, 
  experience_years, 
  price_per_session, 
  session_duration, 
  available_online, 
  available_presential, 
  location,
  website,
  is_active
) VALUES
(
  'Dra. Ana Paula Silva',
  'ana.silva@psicologia.com.br',
  '(11) 98765-4321',
  'CRP 06/123456',
  'Ansiedade, Depressão, Carreira, Transições Profissionais',
  'Psicóloga clínica com especialização em psicologia do trabalho e carreira. Atendo pessoas em transição profissional, ansiedade relacionada ao trabalho e desenvolvimento de carreira. Trabalho com abordagem cognitivo-comportamental e humanista.',
  8,
  120.00,
  50,
  true,
  true,
  'São Paulo, SP - Vila Mariana',
  'https://www.anapsicologia.com.br',
  true
),
(
  'Dr. Carlos Eduardo Santos',
  'carlos.santos@psicologia.com.br',
  '(11) 91234-5678',
  'CRP 06/234567',
  'Carreira, Orientação Profissional, Autoestima, Desenvolvimento Pessoal',
  'Psicólogo especializado em orientação profissional e desenvolvimento de carreira. Ajudo pessoas a encontrarem seu caminho profissional, aumentarem a autoconfiança e desenvolverem habilidades para o mercado de trabalho.',
  6,
  100.00,
  50,
  true,
  false,
  NULL,
  'https://www.carlospsicologia.com.br',
  true
),
(
  'Dra. Mariana Costa',
  'mariana.costa@psicologia.com.br',
  '(11) 99876-5432',
  'CRP 06/345678',
  'Ansiedade, Estresse, Burnout, Saúde Mental no Trabalho',
  'Psicóloga com foco em saúde mental no ambiente de trabalho. Especializada em ansiedade, estresse e burnout. Atendo profissionais que buscam equilíbrio entre vida pessoal e profissional, além de pessoas em busca de recolocação.',
  10,
  150.00,
  60,
  true,
  true,
  'São Paulo, SP - Centro',
  'https://www.marianapsicologia.com.br',
  true
)
ON CONFLICT (email) DO NOTHING;

