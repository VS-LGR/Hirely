# 🔍 Diferença Entre SUPABASE_URL e DATABASE_URL

## ⚠️ Problema Identificado

Na sua configuração, `SUPABASE_URL` está com o mesmo valor de `DATABASE_URL` (connection string do PostgreSQL). Isso está **ERRADO**!

## 📋 Diferença Entre as Duas

### `DATABASE_URL` (Connection String do PostgreSQL)

**O que é:**
- String de conexão direta com o banco de dados PostgreSQL
- Usada pela biblioteca `pg` (PostgreSQL client)

**Formato:**
```
postgresql://postgres:[SENHA]@db.xxxxx.supabase.co:5432/postgres
```

**Onde encontrar:**
1. Supabase Dashboard > **Settings** > **Database**
2. Role até **Connection string**
3. Selecione **URI**
4. Copie a string completa

**Exemplo:**
```
postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

**Usado para:**
- ✅ Queries SQL diretas
- ✅ Migrations
- ✅ Pool de conexões do PostgreSQL

---

### `SUPABASE_URL` (URL da API do Projeto)

**O que é:**
- URL base da API do seu projeto Supabase
- Usada pela biblioteca `@supabase/supabase-js` (cliente Supabase)

**Formato:**
```
https://xxxxx.supabase.co
```

**⚠️ IMPORTANTE:**
- **NÃO** deve ter barra final (`/`)
- **NÃO** deve ser a connection string do PostgreSQL
- Deve começar com `https://`

**Onde encontrar:**
1. Supabase Dashboard > **Settings** > **API**
2. Procure por **Project URL**
3. Copie a URL (sem barra final)

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

**Usado para:**
- ✅ Supabase Storage (upload/download de arquivos)
- ✅ Supabase Auth
- ✅ Supabase Realtime
- ✅ Cliente Supabase JavaScript

---

## 🔧 Como Configurar Corretamente

### Passo 1: Obter `DATABASE_URL`

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **Database**
4. Role até **Connection string**
5. Selecione **URI**
6. Copie a string completa
7. **Substitua** `[YOUR-PASSWORD]` pela senha que você criou ao criar o projeto

**Exemplo:**
```
postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Passo 2: Obter `SUPABASE_URL`

1. No mesmo projeto, vá em **Settings** > **API**
2. Procure por **Project URL**
3. Copie a URL (deve ser algo como `https://xxxxx.supabase.co`)

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

### Passo 3: Obter `SUPABASE_SERVICE_ROLE_KEY`

1. Ainda em **Settings** > **API**
2. Procure por **service_role key** (não a anon key!)
3. Copie a chave completa

**Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Passo 4: Configurar no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **hirely-backend-gamma**
3. Vá em **Settings** > **Environment Variables**
4. Configure:

**`DATABASE_URL`:**
```
postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres
```

**`SUPABASE_URL`:**
```
https://xxxxx.supabase.co
```
⚠️ **NÃO** coloque a connection string aqui!

**`SUPABASE_SERVICE_ROLE_KEY`:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Clique em **Save**
6. **Redeploy** o projeto

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  DATABASE_URL                                           │
│  ────────────────────────────────────────────────────  │
│  postgresql://postgres:senha@db.xxxxx.supabase.co:5432  │
│                                                          │
│  Usado por: pg (PostgreSQL client)                     │
│  Para: Queries SQL, migrations                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  SUPABASE_URL                                           │
│  ────────────────────────────────────────────────────  │
│  https://xxxxx.supabase.co                              │
│                                                          │
│  Usado por: @supabase/supabase-js                      │
│  Para: Storage, Auth, Realtime                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Configuração

- [ ] `DATABASE_URL` = Connection string do PostgreSQL (com senha)
- [ ] `SUPABASE_URL` = URL da API (https://xxxxx.supabase.co, sem barra final)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Service role key (não anon key)
- [ ] Todas as variáveis configuradas no Vercel
- [ ] Deploy realizado após configurar

---

## 🐛 Erro Comum

**❌ ERRADO:**
```
SUPABASE_URL=postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres
```

**✅ CORRETO:**
```
SUPABASE_URL=https://xxxxx.supabase.co
DATABASE_URL=postgresql://postgres:senha@db.xxxxx.supabase.co:5432/postgres
```

---

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

