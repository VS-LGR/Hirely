# Guia de Configuração - Hirely

## Pré-requisitos

1. **Node.js 18+** instalado
2. **PostgreSQL 14+** instalado e rodando
3. **npm** ou **yarn**

## Passo a Passo

### 1. Instalar Dependências

```bash
# Na raiz do projeto
npm run install:all
```

Ou manualmente:

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configurar Banco de Dados

1. Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE hirely;
```

2. Configure as variáveis de ambiente no arquivo `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hirely
DB_USER=postgres
DB_PASSWORD=sua_senha
```

3. Execute as migrações:
```bash
cd backend
npm run build
node dist/database/migrate.js
```

### 3. Configurar Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hirely
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sua-openai-api-key
CORS_ORIGIN=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_OPENAI_API_KEY=sua-openai-api-key
```

### 4. Iniciar os Servidores

**Opção 1: Ambos simultaneamente (raiz do projeto)**
```bash
npm run dev
```

**Opção 2: Separadamente**

Terminal 1 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 2 (Backend):
```bash
cd backend
npm run dev
```

### 5. Acessar a Aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Estrutura de Pastas

```
Hirely/
├── frontend/              # Next.js App
│   ├── src/
│   │   ├── app/          # Páginas e rotas
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Utilitários
│   │   ├── store/        # Estado global (Zustand)
│   │   └── types/        # TypeScript types
│   └── package.json
├── backend/               # Express API
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── middleware/   # Middlewares
│   │   ├── services/     # Serviços (IA, etc)
│   │   └── database/     # Configuração DB
│   └── package.json
└── package.json           # Workspace root
```

## Próximos Passos

1. Criar uma conta de recrutador ou candidato
2. Explorar as funcionalidades disponíveis
3. Configurar a API key da OpenAI para funcionalidades de IA
4. Personalizar conforme necessário

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Teste a conexão: `psql -U postgres -d hirely`

### Erro ao iniciar o frontend
- Verifique se a porta 3000 está livre
- Execute `npm install` novamente no diretório frontend

### Erro ao iniciar o backend
- Verifique se a porta 3001 está livre
- Confirme que as migrações foram executadas
- Verifique as variáveis de ambiente

## Notas Importantes

- A API key da OpenAI é opcional para começar, mas necessária para funcionalidades de IA
- O JWT_SECRET deve ser alterado em produção
- As senhas são hasheadas com bcrypt antes de serem armazenadas


