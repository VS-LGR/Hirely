# Migration: Adicionar IBM como Provider de Cursos

## Objetivo
Adicionar suporte para cursos da IBM na tabela `courses`, além dos já existentes (FIAP e ALURA).

## Como Executar

### Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo `backend/src/database/migrations/add_ibm_provider.sql`

### Via CLI
```bash
psql $DATABASE_URL -f backend/src/database/migrations/add_ibm_provider.sql
```

## O que a Migration Faz
- Remove a constraint antiga que permitia apenas 'FIAP' e 'ALURA'
- Adiciona nova constraint que inclui 'IBM'
- Atualiza o comentário da coluna para refletir os três providers

## Após a Migration
O sistema agora aceita cursos com `provider = 'IBM'` na tabela `courses`.

