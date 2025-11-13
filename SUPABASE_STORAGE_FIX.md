# 🔧 Correção: Erro de Upload no Supabase Storage

## 🔴 Problema

Erro ao fazer upload de arquivo:
```
Error uploading file to Supabase: StorageUnknownError: Unexpected token '<', "<?xml vers"... is not valid JSON
```

## 🔍 Causa

O Supabase está retornando XML/HTML em vez de JSON, o que indica:

1. **URL incorreta** - `SUPABASE_URL` pode estar mal formatada
2. **Credenciais inválidas** - `SUPABASE_SERVICE_ROLE_KEY` pode estar incorreta
3. **Bucket não existe** - O bucket `resumes` não foi criado
4. **Variáveis de ambiente não configuradas** - No Vercel

## ✅ Solução

### Passo 1: Verificar Variáveis de Ambiente no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **hirely-backend-gamma**
3. Vá em **Settings** > **Environment Variables**
4. Verifique se existem:
   - ✅ `SUPABASE_URL` - Deve ser `https://xxxxx.supabase.co` (sem barra final)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` - Chave de service role (não anon key)

### Passo 2: Obter Credenciais Corretas

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL**: `https://xxxxx.supabase.co` (sem barra final)
   - **service_role key**: A chave secreta (não a anon key!)

### Passo 3: Configurar no Vercel

1. No Vercel, adicione/atualize as variáveis:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. ⚠️ **IMPORTANTE**: 
   - Use `SUPABASE_SERVICE_ROLE_KEY` (não `SUPABASE_ANON_KEY`)
   - A URL não deve ter barra final (`/`)
   - A URL deve começar com `https://`

3. Clique em **Save**
4. **Redeploy** o projeto (ou aguarde o próximo deploy)

### Passo 4: Criar o Bucket no Supabase

1. No Supabase Dashboard, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `resumes` (exatamente este nome)
   - **Public bucket**: ❌ **Desmarcado** (privado)
4. Clique em **Create bucket**

### Passo 5: Configurar Políticas do Bucket

1. No Supabase, vá em **Storage** > **resumes**
2. Clique em **Policies**
3. Adicione uma política para permitir uploads:

**Policy Name**: `Allow authenticated uploads`

**Policy Definition**:
```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');
```

**OU** use a interface visual:
- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'resumes'`
- **WITH CHECK expression**: `bucket_id = 'resumes'`

### Passo 6: Testar

Após configurar tudo:

1. Faça um novo deploy no Vercel (ou aguarde o próximo)
2. Tente fazer upload de um currículo novamente
3. Verifique os logs do Vercel se ainda houver erro

## 🐛 Troubleshooting

### Erro: "Bucket not found"

**Solução**: Crie o bucket `resumes` no Supabase Dashboard > Storage

### Erro: "new row violates row-level security"

**Solução**: Configure as políticas do bucket (Passo 5)

### Erro: "Unexpected token '<', "<?xml vers"..."

**Solução**: 
1. Verifique se `SUPABASE_URL` está correto (sem barra final)
2. Verifique se `SUPABASE_SERVICE_ROLE_KEY` é a service_role key (não anon key)
3. Verifique se as variáveis estão configuradas no Vercel

### Verificar se Está Configurado Corretamente

Execute no terminal (após deploy):

```powershell
# Verificar se as variáveis estão configuradas
# (Isso só funciona se você tiver acesso ao código do Vercel)
# Ou verifique diretamente no dashboard do Vercel
```

## 📋 Checklist

- [ ] `SUPABASE_URL` configurado no Vercel (sem barra final)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado no Vercel (service_role, não anon)
- [ ] Bucket `resumes` criado no Supabase
- [ ] Políticas do bucket configuradas
- [ ] Deploy realizado no Vercel
- [ ] Teste de upload realizado

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

