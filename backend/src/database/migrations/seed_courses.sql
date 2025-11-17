-- Seed Courses: FIAP e Alura
-- Execute este script no SQL Editor do Supabase Dashboard
-- Após executar as migrations: add_courses_table.sql e add_ibm_provider.sql

-- Limpar cursos existentes (opcional - descomente se quiser limpar antes)
-- DELETE FROM courses;

-- Cursos FIAP (Graduações)
INSERT INTO courses (title, provider, category, description, duration, level, url) VALUES
-- Tecnólogos de 2 anos
('Análise e Desenvolvimento de Sistemas', 'FIAP', 'Desenvolvimento', 'Full Stack, Apps & Artificial Intelligence. Prepare-se para ser o profissional full-stack do futuro.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/analise-e-desenvolvimento-de-sistemas'),
('Computação em Nuvem', 'FIAP', 'Cloud Computing', 'Cloud Solutions Architect, DevOps & Machine Learning. Um curso com apoio técnico dos principais players tech do mercado.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/computacao-em-nuvem'),
('Data Science', 'FIAP', 'Data Science', 'Artificial Intelligence, Analytics, Cloud & Data Platforms. Explore o mundo dos dados e tome decisões impactantes.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/data-science'),
('Design Digital', 'FIAP', 'Design', 'Design Gráfico, Motion Design & Product Design. Crie conteúdos para plataformas, redes sociais e experiências digitais.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/design-digital'),
('Game Development', 'FIAP', 'Desenvolvimento', 'Game Design, Modeling, Development & XR Solutions. Torne-se o game developer que o mercado procura.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/game-development'),
('Gestão da Tecnologia da Informação', 'FIAP', 'Gestão', 'Digital Management Enterprise. Lidere equipes e projetos na área de TI de grandes empresas.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/gestao-da-tecnologia-da-informacao'),
('Inteligência Artificial', 'FIAP', 'Inteligência Artificial', 'Machine Learning, IA Generativa & Natural Language Processing. Domine IA e lidere a transformação digital das empresas.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/inteligencia-artificial'),
('Marketing', 'FIAP', 'Marketing', 'Digital, Social Media & Data Science. Pense o novo e crie estratégias que geram valor.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/marketing'),
('Segurança Cibernética', 'FIAP', 'Segurança', 'Ethical Hacking, Forensics & Devsecops. Proteja sistemas e dados no mundo digital.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/seguranca-cibernetica'),
('Web Design', 'FIAP', 'Design', 'User Experience, Social Media Marketing, Low/No Code & Front-End Development. Do design ao front-end: domine o digital e crie experiências memoráveis.', '2 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/web-design'),

-- Bacharelados de 4 ou 5 anos
('Administração', 'FIAP', 'Gestão', 'Innovation & Digital Transformation. Lidere a transformação dos negócios com tecnologia e inovação.', '4 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/administracao'),
('Ciência da Computação', 'FIAP', 'Desenvolvimento', 'Data Science, IA & Platform Engineering. Domine IA, Ciência de Dados e desenvolvimento de aplicações.', '4 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/ciencia-da-computacao'),
('Engenharia de Computação', 'FIAP', 'Engenharia', 'High Performance System, Advanced Computing & Smart Society. Programe em múltiplas linguagens e crie soluções para dispositivos mobile.', '5 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/engenharia-de-computacao'),
('Engenharia de Software', 'FIAP', 'Desenvolvimento', 'Full Stack & DevSecOps. Desenvolva softwares e aplicativos dominando linguagens de programação.', '4 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/engenharia-de-software'),
('Engenharia Mecatrônica', 'FIAP', 'Engenharia', 'Robotics Systems & Machine Learning. Crie e implemente produtos e processos inéditos em Engenharia.', '5 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/engenharia-mecatronica'),
('Sistemas de Informação', 'FIAP', 'Desenvolvimento', 'Software Engineering & DevOps. Conecte estratégia e tecnologia para atuar na área de TI.', '4 anos', 'Iniciante', 'https://www.fiap.com.br/graduacao/sistemas-de-informacao'),

-- Cursos Alura (Cursos Online de Tecnologia)
-- URLs redirecionam para a página de cursos da Alura onde o usuário pode buscar o curso específico
('Formação Python', 'ALURA', 'Programação', 'Aprenda Python do zero ao avançado. Desenvolva aplicações web, análise de dados e automação.', '80 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/python'),
('Formação Java', 'ALURA', 'Programação', 'Domine Java e Spring. Desenvolva aplicações enterprise com as melhores práticas do mercado.', '100 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/java'),
('Formação JavaScript', 'ALURA', 'Front-end', 'JavaScript moderno, Node.js, React e muito mais. Torne-se um desenvolvedor full stack.', '120 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-tecnologia/javascript'),
('Formação React', 'ALURA', 'Front-end', 'Aprenda React do zero. Crie interfaces modernas e interativas com hooks, context e muito mais.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-front-end/react'),
('Formação Angular', 'ALURA', 'Front-end', 'Desenvolva aplicações SPA com Angular. TypeScript, RxJS, testes e muito mais.', '70 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-front-end/angular'),
('Formação Vue.js', 'ALURA', 'Front-end', 'Aprenda Vue.js e crie interfaces reativas. Vuex, Nuxt.js e composição API.', '50 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-front-end/vue'),
('Formação Node.js', 'ALURA', 'Backend', 'Desenvolva APIs RESTful e GraphQL com Node.js. Express, MongoDB, testes e deploy.', '80 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/nodejs'),
('Formação .NET', 'ALURA', 'Backend', 'Desenvolva com C# e .NET. ASP.NET Core, Entity Framework e arquitetura de software.', '90 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/c-sharp'),
('Formação PHP', 'ALURA', 'Backend', 'PHP moderno com Laravel. Desenvolva aplicações web robustas e escaláveis.', '70 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/php'),
('Formação Data Science', 'ALURA', 'Data Science', 'Python para análise de dados, Machine Learning, estatística e visualização de dados.', '100 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-data-science'),
('Formação Machine Learning', 'ALURA', 'Inteligência Artificial', 'Aprenda Machine Learning com Python. Scikit-learn, TensorFlow e Deep Learning.', '80 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-inteligencia-artificial'),
('Formação Inteligência Artificial', 'ALURA', 'Inteligência Artificial', 'IA Generativa, LLMs, ChatGPT e muito mais. Domine as tecnologias do futuro.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-inteligencia-artificial'),
('Formação DevOps', 'ALURA', 'DevOps', 'Docker, Kubernetes, CI/CD, AWS e muito mais. Torne-se um especialista em DevOps.', '90 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-devops'),
('Formação AWS', 'ALURA', 'Cloud Computing', 'Domine a AWS. EC2, S3, Lambda, CloudFormation e arquitetura na nuvem.', '70 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-cloud-computing/aws'),
('Formação Azure', 'ALURA', 'Cloud Computing', 'Microsoft Azure do zero. Compute, Storage, Networking e muito mais.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-cloud-computing/azure'),
('Formação Google Cloud', 'ALURA', 'Cloud Computing', 'Aprenda Google Cloud Platform. Compute Engine, App Engine, BigQuery e muito mais.', '65 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-cloud-computing/google-cloud'),
('Formação Segurança da Informação', 'ALURA', 'Segurança', 'Ethical Hacking, Pentest, Criptografia e muito mais. Torne-se um especialista em segurança.', '80 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-seguranca'),
('Formação UX Design', 'ALURA', 'Design', 'Design de experiência do usuário. Pesquisa, prototipação, testes e muito mais.', '60 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-ux'),
('Formação UI Design', 'ALURA', 'Design', 'Design de interfaces. Figma, design systems, acessibilidade e muito mais.', '50 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-design'),
('Formação Product Design', 'ALURA', 'Design', 'Design de produtos digitais. Estratégia, pesquisa, prototipação e validação.', '70 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-design'),
('Formação React Native', 'ALURA', 'Mobile', 'Desenvolva apps mobile com React Native. iOS, Android, navegação e muito mais.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile'),
('Formação Flutter', 'ALURA', 'Mobile', 'Desenvolva apps multiplataforma com Flutter. Dart, widgets, state management e muito mais.', '55 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile'),
('Formação Android', 'ALURA', 'Mobile', 'Desenvolva apps Android nativos. Kotlin, Jetpack, Material Design e muito mais.', '70 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile/android'),
('Formação iOS', 'ALURA', 'Mobile', 'Desenvolva apps iOS com Swift. SwiftUI, UIKit, Core Data e muito mais.', '65 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile/ios'),
('Formação QA e Testes', 'ALURA', 'QA/Testes', 'Testes automatizados, Selenium, Cypress, Jest e muito mais. Torne-se um QA especialista.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-testes'),
('Formação Arquitetura de Software', 'ALURA', 'Arquitetura de Software', 'Padrões de projeto, arquitetura limpa, DDD, microserviços e muito mais.', '80 horas', 'Avançado', 'https://www.alura.com.br/cursos-online-arquitetura-software'),
('Formação Gestão Ágil', 'ALURA', 'Gestão', 'Scrum, Kanban, Lean, OKRs e muito mais. Torne-se um especialista em gestão ágil.', '50 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-negocios'),
('Formação Product Management', 'ALURA', 'Gestão', 'Product Management do zero. Roadmap, métricas, discovery e muito mais.', '60 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-negocios'),
('Formação Marketing Digital', 'ALURA', 'Marketing', 'SEO, Google Ads, Facebook Ads, Analytics e muito mais. Domine o marketing digital.', '70 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-marketing'),
('Formação Inovação e Gestão', 'ALURA', 'Gestão', 'Design Thinking, Lean Startup, Inovação e muito mais. Transforme ideias em negócios.', '55 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-negocios'),
('Formação HTML e CSS', 'ALURA', 'Front-end', 'HTML5, CSS3, Flexbox, Grid e muito mais. Aprenda a criar layouts responsivos.', '40 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-front-end'),
('Formação TypeScript', 'ALURA', 'Front-end', 'TypeScript do zero. Tipos, interfaces, generics e muito mais.', '30 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-front-end/typescript'),
('Formação SQL', 'ALURA', 'Backend', 'SQL do zero ao avançado. Queries, joins, subqueries, performance e muito mais.', '35 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/sql'),
('Formação MongoDB', 'ALURA', 'Backend', 'MongoDB do zero. NoSQL, agregações, índices e muito mais.', '25 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/mongodb'),
('Formação PostgreSQL', 'ALURA', 'Backend', 'PostgreSQL avançado. Performance, índices, transações e muito mais.', '30 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/postgresql'),
('Formação Docker', 'ALURA', 'DevOps', 'Docker do zero. Containers, imagens, volumes, networks e muito mais.', '20 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-devops/docker'),
('Formação Kubernetes', 'ALURA', 'DevOps', 'Kubernetes do zero. Pods, Services, Deployments, Helm e muito mais.', '35 horas', 'Avançado', 'https://www.alura.com.br/cursos-online-devops/kubernetes'),
('Formação Git e GitHub', 'ALURA', 'DevOps', 'Git e GitHub do zero. Versionamento, branches, pull requests e muito mais.', '15 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-ferramentas/git'),
('Formação Linux', 'ALURA', 'DevOps', 'Linux do zero. Comandos, shell script, administração e muito mais.', '30 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-devops/linux'),
('Formação Redes', 'ALURA', 'DevOps', 'Redes de computadores. TCP/IP, DNS, HTTP, segurança e muito mais.', '25 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-infraestrutura'),
('Formação Blockchain', 'ALURA', 'Desenvolvimento', 'Blockchain e criptomoedas. Ethereum, Smart Contracts, Solidity e muito mais.', '40 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/blockchain'),
('Formação Go', 'ALURA', 'Backend', 'Go do zero. Concorrência, channels, goroutines e muito mais.', '35 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/go'),
('Formação Rust', 'ALURA', 'Backend', 'Rust do zero. Ownership, borrowing, lifetimes e muito mais.', '40 horas', 'Avançado', 'https://www.alura.com.br/cursos-online-programacao/rust'),
('Formação Ruby', 'ALURA', 'Backend', 'Ruby e Rails do zero. MVC, ActiveRecord, testes e muito mais.', '50 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/ruby'),
('Formação Elixir', 'ALURA', 'Backend', 'Elixir e Phoenix do zero. Concorrência, OTP, WebSockets e muito mais.', '45 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/elixir'),
('Formação C++', 'ALURA', 'Programação', 'C++ do zero. POO, STL, templates e muito mais.', '50 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-programacao/c-plus-plus'),
('Formação C#', 'ALURA', 'Backend', 'C# e .NET do zero. POO, LINQ, async/await e muito mais.', '60 horas', 'Iniciante', 'https://www.alura.com.br/cursos-online-programacao/c-sharp'),
('Formação Kotlin', 'ALURA', 'Mobile', 'Kotlin do zero. Coroutines, Flow, Ktor e muito mais.', '40 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile/kotlin'),
('Formação Swift', 'ALURA', 'Mobile', 'Swift do zero. Optionals, closures, protocols e muito mais.', '35 horas', 'Intermediário', 'https://www.alura.com.br/cursos-online-mobile/swift')
ON CONFLICT DO NOTHING;

-- Verificar quantos cursos foram inseridos
SELECT 
  provider,
  COUNT(*) as total_cursos,
  COUNT(DISTINCT category) as total_categorias
FROM courses
GROUP BY provider;

-- Listar todas as categorias disponíveis
SELECT DISTINCT category FROM courses ORDER BY category;

