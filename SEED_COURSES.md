# Seed de Cursos - FIAP e Alura

## Objetivo
Popular o banco de dados com cursos da FIAP e Alura para a funcionalidade de reintegração ao mercado de trabalho.

## Como Executar

### Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo `backend/src/database/migrations/seed_courses.sql`

### Via CLI
```bash
psql $DATABASE_URL -f backend/src/database/migrations/seed_courses.sql
```

## Cursos Incluídos

### FIAP (16 cursos)
**Tecnólogos de 2 anos:**
- Análise e Desenvolvimento de Sistemas
- Computação em Nuvem
- Data Science
- Design Digital
- Game Development
- Gestão da Tecnologia da Informação
- Inteligência Artificial
- Marketing
- Segurança Cibernética
- Web Design

**Bacharelados de 4 ou 5 anos:**
- Administração
- Ciência da Computação
- Engenharia de Computação
- Engenharia de Software
- Engenharia Mecatrônica
- Sistemas de Informação

### Alura (50+ formações)
Categorias incluídas:
- **Programação**: Python, Java, JavaScript, C#, PHP, Ruby, Go, Rust, C++, Kotlin, Swift, Elixir
- **Front-end**: React, Angular, Vue.js, HTML/CSS, TypeScript
- **Backend**: Node.js, .NET, PHP, Go, Rust, Ruby, Elixir, C#
- **Mobile**: React Native, Flutter, Android, iOS, Kotlin, Swift
- **Data Science**: Data Science, Machine Learning, Inteligência Artificial
- **Cloud Computing**: AWS, Azure, Google Cloud
- **DevOps**: DevOps, Docker, Kubernetes, Git/GitHub, Linux, Redes
- **Segurança**: Segurança da Informação
- **Design**: UX Design, UI Design, Product Design
- **Gestão**: Gestão Ágil, Product Management, Inovação e Gestão
- **Marketing**: Marketing Digital
- **QA/Testes**: QA e Testes
- **Arquitetura**: Arquitetura de Software
- **Banco de Dados**: SQL, MongoDB, PostgreSQL
- **Blockchain**: Blockchain

## Estrutura dos Dados

Cada curso contém:
- `title`: Nome do curso
- `provider`: 'FIAP' ou 'ALURA'
- `category`: Categoria do curso (ex: 'Desenvolvimento', 'Data Science', 'Design')
- `description`: Descrição breve do curso
- `duration`: Duração estimada (ex: '2 anos', '80 horas')
- `level`: Nível do curso ('Iniciante', 'Intermediário', 'Avançado')
- `url`: Link direto para a página do curso na instituição

## URLs

Todos os cursos têm URLs diretas para:
- **FIAP**: `https://www.fiap.com.br/graduacao/[nome-do-curso]`
- **Alura**: `https://www.alura.com.br/formacao-[nome-do-curso]`

## Notas

- Os cursos são inseridos com `ON CONFLICT DO NOTHING`, então executar o script múltiplas vezes é seguro
- As URLs da Alura são baseadas no padrão de formação da plataforma
- Se algum curso não existir na URL especificada, você pode ajustar manualmente no banco de dados

