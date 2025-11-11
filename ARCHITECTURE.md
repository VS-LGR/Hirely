# Arquitetura do Hirely

## Visão Geral

O Hirely é uma aplicação full-stack construída com Next.js (frontend) e Express.js (backend), utilizando PostgreSQL como banco de dados principal e integração com OpenAI para funcionalidades de IA.

## Estrutura do Projeto

```
Hirely/
├── frontend/                 # Next.js 14+ App Router
│   ├── src/
│   │   ├── app/             # Rotas e páginas
│   │   │   ├── (auth)/      # Rotas autenticadas
│   │   │   ├── dashboard/   # Dashboard principal
│   │   │   ├── login/       # Página de login
│   │   │   └── register/    # Página de registro
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/          # Componentes Shadcn/ui
│   │   │   └── layout/      # Componentes de layout
│   │   ├── lib/             # Utilitários e configurações
│   │   ├── store/           # Estado global (Zustand)
│   │   ├── services/        # Serviços (API, IA)
│   │   ├── hooks/           # Custom hooks
│   │   └── types/           # TypeScript types
│   └── tailwind.config.ts   # Configuração Tailwind
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/          # Definição de rotas
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Middlewares (auth, errors)
│   │   ├── services/        # Serviços (IA, etc)
│   │   ├── database/        # Configuração e migrações
│   │   └── utils/           # Utilitários
│   └── .env.example         # Exemplo de variáveis
│
└── package.json             # Workspace root
```

## Fluxo de Dados

### Autenticação
1. Usuário faz login/registro
2. Backend valida credenciais e gera JWT
3. Token é armazenado no localStorage
4. Token é incluído em todas as requisições via interceptor Axios

### Criação de Vaga (Recrutador)
1. Recrutador preenche formulário
2. Frontend envia dados para `/api/jobs` (POST)
3. Backend valida e salva no PostgreSQL
4. Resposta retorna vaga criada

### Busca de Vagas (Candidato)
1. Candidato busca vagas
2. Frontend faz requisição para `/api/jobs` (GET)
3. Backend consulta PostgreSQL com filtros
4. Resposta retorna lista de vagas

### Funcionalidades de IA
1. Usuário solicita ação de IA (ex: gerar descrição)
2. Frontend chama `/api/ai/*`
3. Backend processa com OpenAI API
4. Resposta retorna resultado processado

## Banco de Dados

### Tabelas Principais

**users**
- Armazena informações de usuários (recrutadores, candidatos, admins)
- Campos: id, email, password (hashed), name, role, bio, skills (JSONB), etc.

**jobs**
- Armazena vagas publicadas
- Campos: id, recruiter_id, title, description, requirements, salary_min/max, location, type, remote, status

**applications**
- Armazena candidaturas
- Campos: id, job_id, candidate_id, status, cover_letter, match_score

## Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- JWT para autenticação
- Validação de inputs com Zod
- Sanitização de dados
- CORS configurado
- Rate limiting (a implementar)

## Design System

### Paleta de Cores
- Bege claro (#F5F1E8) - backgrounds
- Marrom pastel (#C9B8A5) - elementos interativos
- Marrom escuro (#8B7355) - textos principais
- Acentos (#A68B6F) - botões e links

### Componentes
- Baseados em Shadcn/ui
- Customizados com tema pastel
- Responsivos e acessíveis

## Próximas Melhorias

1. Sistema de notificações em tempo real (Socket.io)
2. Upload de arquivos (currículos, documentos)
3. Sistema de planos e pagamentos completo
4. Analytics e relatórios
5. Chatbot conversacional completo
6. Match scoring avançado com IA
7. Testes automatizados
8. CI/CD pipeline


