# Guia de Migração - Supabase

## ⚠️ IMPORTANTE

**NÃO** copie o conteúdo de `migrate.ts` para o SQL Editor. Esse arquivo é TypeScript/JavaScript e não funciona no SQL Editor.

Use o arquivo **`migration.sql`** que contém apenas SQL puro.

## Opção 1: SQL Editor do Supabase (Recomendado)

### Passo a Passo:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `backend/src/database/migration.sql` no seu editor de código
6. **Copie TODO o conteúdo** do arquivo `migration.sql`
7. Cole no SQL Editor do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)

### O que o script faz:

- Cria todas as tabelas: `users`, `jobs`, `applications`, `tags`, `user_tags`, `job_tags`
- Cria todos os índices necessários
- Configura relacionamentos e constraints

## Opção 2: Via CLI Local

Se você tem acesso ao terminal e PostgreSQL CLI:

```bash
# Configure DATABASE_URL no .env do backend
cd backend

# Execute a migração
npm run build
npm run db:migrate
```

**Nota**: Isso requer que você tenha `DATABASE_URL` configurada no `.env` do backend.

## Opção 3: Via Node.js Script

Se você quer executar o script TypeScript localmente:

```bash
cd backend

# Configure DATABASE_URL no .env
# DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres

# Execute
npm run build
node dist/database/migrate.js
```

## Verificar se as Tabelas Foram Criadas

Após executar a migração, verifique no Supabase:

1. Vá em **Table Editor** no dashboard
2. Você deve ver as seguintes tabelas:
   - `users`
   - `jobs`
   - `applications`
   - `tags`
   - `user_tags`
   - `job_tags`

## Popular Tags (Opcional)

Após criar as tabelas, você pode popular as tags:

### Opção 1: Via SQL Editor (Recomendado)

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Clique em **New Query**
3. Abra o arquivo `backend/src/database/seedTags.sql` no seu editor de código
4. **Copie TODO o conteúdo** do arquivo `seedTags.sql`
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. O script irá inserir todas as tags e mostrar o total inserido

**Nota**: O script usa `ON CONFLICT DO NOTHING`, então é seguro executar múltiplas vezes.

### Opção 2: Via Node.js

```bash
cd backend

# Configure DATABASE_URL no .env
# DATABASE_URL=postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres

# Execute
npm run build
npm run db:seed:tags
```

**Nota**: Isso requer `DATABASE_URL` configurada no `.env`.

## Troubleshooting

### Erro: "relation already exists"
- As tabelas já foram criadas. Isso é normal se você executar o script novamente.
- O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar múltiplas vezes.

### Erro: "permission denied"
- Verifique se você está usando a connection string correta
- Certifique-se de que a senha está correta na `DATABASE_URL`

### Erro: "syntax error"
- Certifique-se de estar usando o arquivo `migration.sql` (não `migrate.ts`)
- Verifique se copiou TODO o conteúdo do arquivo
- Certifique-se de que não há caracteres especiais ou encoding incorreto

## Arquivos de Migração

- **`migration.sql`**: SQL puro para executar no SQL Editor ✅
- **`migrate.ts`**: Script TypeScript para executar via Node.js
- **`migrate.js`**: Versão compilada do script TypeScript

## Próximos Passos

Após executar a migração:

1. ✅ Verificar se as tabelas foram criadas
2. ✅ Popular tags (opcional): `npm run db:seed:tags`
3. ✅ Testar conexão do backend com o Supabase
4. ✅ Testar criação de usuário via API

