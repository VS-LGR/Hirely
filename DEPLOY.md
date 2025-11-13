# Guia de Deploy - Hirely

Este guia explica como fazer deploy do Hirely na Vercel (frontend + backend serverless) e configurar o Supabase.

## Pré-requisitos

- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [GitHub](https://github.com) (para deploy automático)
- Projeto configurado no Supabase (veja `SUPABASE_SETUP.md`)

## Estrutura de Deploy

- **Frontend**: Deploy na Vercel como projeto Next.js
- **Backend**: Deploy na Vercel como Serverless Functions
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage

## Passo 1: Preparar o Repositório

1. Certifique-se de que seu código está no GitHub
2. Verifique se os arquivos `.env` estão no `.gitignore`
3. Commit e push de todas as alterações

## Passo 2: Configurar Supabase

Siga o guia em `SUPABASE_SETUP.md` para:
- Criar projeto no Supabase
- Obter credenciais
- Criar bucket de storage
- Executar migrações

## Passo 3: Deploy do Backend na Vercel

### 3.1. Criar Projeto Backend

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **Add New** > **Project**
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: (deixe vazio)
   - **Install Command**: `npm install`

### 3.2. Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro
JWT_EXPIRES_IN=7d

# CORS (será configurado após deploy do frontend)
CORS_ORIGIN=https://seu-frontend.vercel.app

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Watson (opcional)
USE_WATSON=false
WATSON_ASSISTANT_API_KEY=...
WATSON_ASSISTANT_URL=...
WATSON_ASSISTANT_ID=...
WATSON_ENVIRONMENT_ID=...
WATSON_NLU_API_KEY=...
WATSON_NLU_URL=...
```

### 3.3. Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Anote a URL do backend (ex: `https://hirely-backend.vercel.app`)

### 3.4. Testar Backend

Acesse: `https://seu-backend.vercel.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "message": "Hirely API is running",
  "timestamp": "..."
}
```

## Passo 4: Deploy do Frontend na Vercel

### 4.1. Criar Projeto Frontend

1. No Vercel Dashboard, clique em **Add New** > **Project**
2. Importe o mesmo repositório
3. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install`

### 4.2. Configurar Variáveis de Ambiente

Adicione:

```env
NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app
```

**Importante**: Use a URL do backend que você anotou no passo 3.3.

### 4.3. Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Anote a URL do frontend (ex: `https://hirely.vercel.app`)

### 4.4. Atualizar CORS no Backend

1. Volte ao projeto do backend no Vercel
2. Vá em **Settings** > **Environment Variables**
3. Atualize `CORS_ORIGIN` com a URL do frontend:
   ```
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```
4. Faça um novo deploy do backend (ou aguarde o redeploy automático)

## Passo 5: Executar Migrações no Supabase

As migrações precisam ser executadas uma vez no banco de dados do Supabase:

### Opção 1: Via SQL Editor (Recomendado)

1. No Supabase Dashboard, vá em **SQL Editor**
2. Copie o conteúdo de `backend/src/database/migrate.ts`
3. Execute o SQL no editor
4. Execute também o seed de tags: `backend/src/database/seedTags.ts`

### Opção 2: Via CLI Local

```bash
# Configure DATABASE_URL no .env
cd backend
npm run build
npm run db:migrate
npm run db:seed:tags
```

## Passo 6: Configurar Watson Assistant (Opcional)

Se estiver usando Watson Assistant:

1. No Watson Assistant Dashboard, vá em **Search** > **Custom service**
2. Configure:
   - **Service URL**: `https://seu-backend.vercel.app/api/watson-search/search`
   - **Authentication**: None (ou configure se necessário)
3. Salve e teste

## Passo 7: Verificar Deploy

### Testes

1. **Frontend**: Acesse `https://seu-frontend.vercel.app`
2. **Backend Health**: `https://seu-backend.vercel.app/health`
3. **Login**: Teste fazer login no frontend
4. **Upload de Currículo**: Teste fazer upload de um PDF/DOCX

### Logs

- **Vercel**: Acesse o projeto > **Deployments** > clique em um deployment > **Functions** para ver logs
- **Supabase**: Vá em **Logs** no dashboard para ver queries e erros

## Troubleshooting

### Erro: "Cannot find module"
- Verifique se todas as dependências estão no `package.json`
- Verifique se o `package-lock.json` está commitado

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correta
- Verifique se a senha está correta (sem caracteres especiais codificados)
- Teste a conexão localmente primeiro

### Erro: "Bucket not found"
- Crie o bucket `resumes` no Supabase (veja `SUPABASE_SETUP.md`)
- Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada

### Erro de CORS
- Verifique se `CORS_ORIGIN` no backend aponta para a URL correta do frontend
- Certifique-se de que não há `/api` no final da URL

### Build falha no frontend
- Verifique se `NEXT_PUBLIC_API_URL` está configurada
- Verifique se não há erros de TypeScript: `npm run build` localmente

## Deploy Automático

Após configurar, cada push para o branch `main` (ou `master`) fará deploy automático:
- Frontend: Deploy automático
- Backend: Deploy automático

## Domínios Customizados

Você pode configurar domínios customizados:
1. Vercel Dashboard > Projeto > **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

## Monitoramento

- **Vercel Analytics**: Ative no dashboard para ver métricas
- **Supabase Dashboard**: Monitore uso de database e storage
- **Logs**: Acesse logs em tempo real no Vercel

## Limites do Plano Gratuito

### Vercel
- 100GB bandwidth/mês
- 100 execuções serverless/dia (Hobby plan)
- Deploys ilimitados

### Supabase
- 500MB database
- 1GB storage
- 2GB bandwidth/mês
- 50.000 API requests/mês

## Próximos Passos

1. Configure domínio customizado (opcional)
2. Configure monitoramento e alertas
3. Configure backup automático do Supabase
4. Otimize performance (cache, CDN, etc.)

