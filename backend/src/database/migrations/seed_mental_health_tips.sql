-- Inserir textos motivacionais/organizacionais iniciais
INSERT INTO mental_health_tips (title, content, category, display_order) VALUES
('Organize seus pensamentos', 'Escreva suas preocupações em um papel. Ver suas ideias organizadas pode ajudar a reduzir a ansiedade e clarear sua mente.', 'organizacao', 1),
('Respire fundo', 'Quando se sentir sobrecarregado, pare por 5 minutos. Inspire profundamente pelo nariz, segure por 3 segundos e expire devagar pela boca. Repita 5 vezes.', 'ansiedade', 2),
('Celebre pequenas vitórias', 'Cada passo dado, por menor que seja, é uma conquista. Reconheça seu progresso e celebre suas pequenas vitórias diárias.', 'motivacao', 3),
('Estabeleça metas realistas', 'Divida grandes objetivos em tarefas menores e alcançáveis. Isso torna o caminho menos intimidador e mais gerenciável.', 'organizacao', 4),
('Você não está sozinho', 'Muitas pessoas passam por momentos difíceis na busca por emprego. Compartilhar suas experiências pode ajudar a aliviar o peso.', 'motivacao', 5),
('Cuide do seu sono', 'Um sono de qualidade é fundamental para sua saúde mental. Tente manter uma rotina de sono regular, mesmo durante períodos difíceis.', 'saude', 6),
('Pratique a autocompaixão', 'Seja gentil consigo mesmo. Você está fazendo o melhor que pode neste momento. Trate-se com a mesma compaixão que ofereceria a um amigo.', 'motivacao', 7),
('Faça pausas regulares', 'Trabalhar na busca por emprego pode ser exaustivo. Faça pausas regulares para descansar, se exercitar ou fazer algo que você goste.', 'saude', 8),
('Foque no que você pode controlar', 'Você não pode controlar quando receberá uma resposta, mas pode controlar a qualidade do seu currículo, sua preparação para entrevistas e sua persistência.', 'carreira', 9),
('Busque apoio profissional', 'Não hesite em buscar ajuda de um psicólogo. Cuidar da sua saúde mental é tão importante quanto cuidar da sua saúde física.', 'saude', 10)
ON CONFLICT DO NOTHING;

