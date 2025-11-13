# Configuração do Supabase para Hirely

Este guia explica como configurar o Supabase (banco de dados PostgreSQL e storage) para o projeto Hirely.

## 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: `hirely` (ou outro nome de sua escolha)
   - **Database Password**: Crie uma senha forte e **anote-a** (você precisará dela)
   - **Region**: Escolha a região mais próxima
   - **Pricing Plan**: Free (plano gratuito)

5. Aguarde alguns minutos enquanto o projeto é criado

## 2. Obter Credenciais

Após o projeto ser criado:

1. Vá em **Settings** > **API**
2. Anote as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Chave pública (pode ser exposta no frontend)
   - **service_role key**: Chave privada (NUNCA exponha no frontend, use apenas no backend)

3. Vá em **Settings** > **Database**
4. Role até encontrar **Connection string**
5. Selecione **URI** e copie a connection string
   - Formato: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - **Importante**: Substitua `[YOUR-PASSWORD]` pela senha que você criou

## 3. Configurar Variáveis de Ambiente

### Backend (`backend/.env`)

```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### Frontend (opcional, se precisar acessar Supabase diretamente)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

## 4. Criar Bucket de Storage

1. No dashboard do Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `resumes`
   - **Public bucket**: **Desligado** (não público)
   - Clique em **Create bucket**

4. Configure políticas de acesso:
   - Vá em **Storage** > **Policies**
   - Clique em **New Policy** para o bucket `resumes`
   - Crie uma política que permita apenas uploads autenticados:

```sql
-- Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Política para permitir leitura apenas para o próprio usuário
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Política para permitir deleção apenas para o próprio usuário
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');
```

**Nota**: Para desenvolvimento, você pode criar políticas mais permissivas usando a chave `service_role` no backend.

## 5. Executar Migrações

Após configurar as variáveis de ambiente:

```bash
cd backend
npm run build
npm run db:migrate
```

Isso criará todas as tabelas necessárias no banco de dados do Supabase.

## 6. Popular Tags (Opcional)

Para popular o banco com as tags pré-definidas:

```bash
cd backend
npm run db:seed:tags
```

## 7. Verificar Conexão

Teste a conexão executando o backend:

```bash
cd backend
npm run dev
```

Você deve ver a mensagem: `✅ Database connected`

## Limites do Plano Gratuito

- **Database**: 500MB
- **Storage**: 1GB
- **Bandwidth**: 2GB/mês
- **API Requests**: 50.000/mês

## Troubleshooting

### Erro: "relation does not exist"
- Execute as migrações: `npm run db:migrate`

### Erro: "bucket does not exist"
- Crie o bucket `resumes` no dashboard do Supabase (veja passo 4)

### Erro: "permission denied"
- Verifique as políticas de acesso do bucket
- Certifique-se de estar usando a `SERVICE_ROLE_KEY` no backend (não a `ANON_KEY`)

### Erro de conexão SSL
- O Supabase requer SSL em produção
- A configuração em `connection.ts` já está preparada para isso

## Próximos Passos

Após configurar o Supabase:
1. Configure o deploy na Vercel (veja `DEPLOY.md`)
2. Adicione as variáveis de ambiente na Vercel Dashboard
3. Teste o upload de arquivos

