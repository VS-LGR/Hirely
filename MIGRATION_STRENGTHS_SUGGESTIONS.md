# Migration: Adicionar Strengths e Suggestions ao Perfil

Esta migration adiciona suporte para armazenar pontos fortes e sugestões de desenvolvimento identificados pela análise de currículo.

## 📋 O que esta migration faz

Adiciona duas novas colunas JSONB à tabela `users`:
- `strengths`: Array de pontos fortes identificados pela IA
- `suggestions`: Array de sugestões de desenvolvimento profissional

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `backend/src/database/migrations/add_strengths_suggestions.sql`
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via CLI (psql)

```bash
psql $DATABASE_URL -f backend/src/database/migrations/add_strengths_suggestions.sql
```

## ✅ Verificação

Após executar a migration, verifique se as colunas foram criadas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('strengths', 'suggestions');
```

Deve retornar:
- `strengths` | `jsonb`
- `suggestions` | `jsonb`

## 📝 Notas

- As colunas são opcionais e têm valor padrão `[]` (array vazio)
- Os índices GIN foram criados para melhorar performance em queries que filtram por esses campos
- Os dados são armazenados como JSONB, permitindo queries eficientes

