# Migration: Tabela de Mensagens

## ⚠️ IMPORTANTE: Execute esta migration no Supabase

A tabela `messages` precisa ser criada no banco de dados para que o sistema de chat funcione.

## Como executar:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `backend/src/database/migrations/create_messages_table.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Opção 2: Via psql (linha de comando)

```bash
psql $DATABASE_URL -f backend/src/database/migrations/create_messages_table.sql
```

## Verificar se a tabela foi criada:

No SQL Editor do Supabase, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'messages';
```

Se retornar uma linha com `messages`, a tabela foi criada com sucesso!

## Estrutura da tabela:

- `id`: ID único da mensagem
- `application_id`: ID da aplicação relacionada
- `sender_id`: ID do usuário que enviou
- `receiver_id`: ID do usuário que recebeu
- `content`: Conteúdo da mensagem
- `is_read`: Se a mensagem foi lida
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Após executar a migration:

1. Reinicie o backend na Vercel (ou aguarde o redeploy automático)
2. Teste o sistema de mensagens novamente

