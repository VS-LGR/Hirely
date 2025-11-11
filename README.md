# Hirely ATS

Plataforma de recrutamento e seleção com inteligência artificial que funciona como copiloto para recrutadores e mentor para candidatos.

## 🚀 Tecnologias

### Frontend
- Next.js 14+ (App Router)
- React 18+ com TypeScript
- Tailwind CSS (paleta pastel marrom/bege)
- Shadcn/ui
- React Query
- Zustand

### Backend
- Node.js com TypeScript
- Express.js
- PostgreSQL
- JWT Authentication
- OpenAI API

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd Hirely
```

2. Instale as dependências:
```bash
npm run install:all
```

3. Configure o banco de dados:
- Crie um banco PostgreSQL chamado `hirely`
- Configure as variáveis de ambiente no `backend/.env` (veja `backend/.env.example`)

4. Execute as migrações:
```bash
cd backend
npm run db:migrate
```

5. Inicie os servidores:
```bash
# Na raiz do projeto
npm run dev
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:3001`.

## 🎨 Design System

A aplicação utiliza uma paleta de cores pastel em tons de marrom e bege, criando uma experiência visual confortável e acolhedora.

### Cores Principais
- Bege Claro: `#F5F1E8`
- Bege Médio: `#E8DDD4`
- Marrom Claro: `#D4C4B0`
- Marrom Pastel: `#C9B8A5`
- Marrom Suave: `#B8A082`
- Marrom Escuro: `#8B7355`
- Acentos: `#A68B6F`

## 📁 Estrutura do Projeto

```
Hirely/
├── frontend/          # Aplicação Next.js
│   ├── src/
│   │   ├── app/      # Rotas e páginas
│   │   ├── components/ # Componentes React
│   │   ├── lib/       # Utilitários
│   │   └── types/    # TypeScript types
│   └── package.json
├── backend/           # API Express
│   ├── src/
│   │   ├── routes/   # Rotas da API
│   │   ├── controllers/ # Lógica de negócio
│   │   ├── middleware/ # Middlewares
│   │   ├── services/  # Serviços (IA, etc)
│   │   └── database/ # Configuração do banco
│   └── package.json
└── package.json       # Workspace root
```

## 🔐 Autenticação

A API utiliza JWT para autenticação. Após o login/registro, inclua o token no header:

```
Authorization: Bearer <token>
```

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil do usuário autenticado

### Vagas
- `GET /api/jobs` - Listar vagas
- `GET /api/jobs/:id` - Obter vaga específica
- `POST /api/jobs` - Criar vaga (recrutador)
- `PUT /api/jobs/:id` - Atualizar vaga (recrutador)
- `DELETE /api/jobs/:id` - Deletar vaga (recrutador)

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil

## 🤖 Funcionalidades de IA

- Geração de descrições de vagas
- Análise de currículos
- Recomendações personalizadas
- Chatbot para recrutadores e candidatos
- Match inteligente

## 📄 Licença

Este projeto é privado e proprietário.


