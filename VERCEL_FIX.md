# Correção de Erros no Deploy - Vercel

## Problemas Identificados

1. **Erro 405 (Method Not Allowed)**: O backend não está aceitando requisições POST
2. **URL sem protocolo**: A variável de ambiente `NEXT_PUBLIC_API_URL` não tem `https://`

## Soluções Aplicadas

### 1. Correção da URL da API (Frontend)

O arquivo `frontend/src/lib/api.ts` foi atualizado para garantir que a URL sempre tenha protocolo (`https://` ou `http://`).

### 2. Configuração da Variável de Ambiente

**IMPORTANTE**: No dashboard da Vercel (projeto do frontend), configure:

```
NEXT_PUBLIC_API_URL=https://hirely-backend-gamma.vercel.app
```

**NÃO** coloque `/api` no final, o código já adiciona isso automaticamente.

**NÃO** esqueça do `https://` no início!

### 3. Verificar Configuração do Backend

No projeto do backend na Vercel, verifique:

1. **Settings** > **General** > **Root Directory**: Deve estar vazio ou `backend`
2. **Settings** > **Environment Variables**:
   - `DATABASE_URL` configurada
   - `SUPABASE_URL` configurada
   - `SUPABASE_SERVICE_ROLE_KEY` configurada
   - `JWT_SECRET` configurada
   - `CORS_ORIGIN` deve ser: `https://hirely-frontend-seven.vercel.app` (URL do seu frontend)

### 4. Testar o Backend

Acesse: `https://hirely-backend-gamma.vercel.app/health`

Deve retornar:
```json
{
  "status": "ok",
  "message": "Hirely API is running",
  "timestamp": "..."
}
```

### 5. Testar Endpoint de Registro

Teste diretamente no navegador ou com curl:

```bash
curl -X POST https://hirely-backend-gamma.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User",
    "role": "candidate"
  }'
```

Se retornar erro 405, o problema está no roteamento do Vercel.

## Se o Erro 405 Persistir

### Opção 1: Recriar o Projeto Backend

1. Delete o projeto atual do backend na Vercel
2. Crie um novo projeto
3. Importe o repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: (vazio)
5. Configure todas as variáveis de ambiente
6. Faça deploy

### Opção 2: Verificar Logs

1. No Vercel Dashboard, vá em **Deployments**
2. Clique no deployment mais recente
3. Vá em **Functions**
4. Clique em `api/index.ts`
5. Veja os logs para identificar erros

### Opção 3: Testar Localmente com DATABASE_URL do Supabase

```bash
cd backend

# Configure .env com DATABASE_URL do Supabase
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres

npm run dev
```

Teste localmente: `http://localhost:3001/api/auth/register`

Se funcionar localmente, o problema é na configuração do Vercel.

## Checklist Final

- [ ] `NEXT_PUBLIC_API_URL` configurada com `https://` no frontend
- [ ] `CORS_ORIGIN` configurada com URL do frontend no backend
- [ ] Backend responde em `/health`
- [ ] Backend aceita POST em `/api/auth/register`
- [ ] Variáveis de ambiente do backend estão todas configuradas
- [ ] Database URL está correta e acessível

