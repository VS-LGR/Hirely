# Troubleshooting - Watson Assistant Custom Service

## Problemas Identificados e Soluções

### 1. Endpoint Retorna Resultados Vazios

**Sintoma:** `{"matching_results": 0, "results":[]}`

**Possíveis Causas:**
- Query não está sendo enviada corretamente pelo Watson
- Banco de dados não tem tags populadas
- Formato da query não está sendo reconhecido

**Soluções Aplicadas:**
- ✅ Endpoint agora aceita query em múltiplos formatos (body, query params, string, objeto)
- ✅ Endpoint retorna dicas gerais mesmo sem query
- ✅ Logs detalhados adicionados para debug
- ✅ Tratamento de erros melhorado

### 2. Como Verificar se Está Funcionando

#### Teste 1: Endpoint sem Query (deve retornar dicas gerais)
```bash
curl -X POST https://hirely-backend-gamma.vercel.app/api/watson-search/search \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Resultado esperado:** Deve retornar pelo menos 2 resultados (dicas gerais)

#### Teste 2: Endpoint com Query
```bash
curl -X POST https://hirely-backend-gamma.vercel.app/api/watson-search/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React"}'
```

**Resultado esperado:** Deve retornar tags relacionadas a React + dicas

#### Teste 3: Verificar se Tags Existem no Banco
```bash
# Acesse o Supabase Dashboard > SQL Editor
SELECT COUNT(*) FROM tags;
```

**Resultado esperado:** Deve retornar 309 (se o seed foi executado)

### 3. Verificar Logs do Vercel

1. Acesse o Vercel Dashboard
2. Vá em **Deployments** > Último deployment
3. Clique em **Functions** > `api/index.ts`
4. Veja os logs quando o Watson fizer uma requisição
5. Procure por: `Watson Search Request:` para ver o que está sendo enviado

### 4. Configuração no Watson Assistant

#### Verificar URL Configurada
- Deve ser: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- ⚠️ **NÃO** coloque `/api` duas vezes
- ⚠️ **NÃO** esqueça do `https://`

#### Verificar Authentication
- Deve estar como **"None"** (nossa API não requer autenticação)

#### Salvar e Testar
1. Clique em **"Save"** no Custom Service
2. O botão deve ficar habilitado após salvar
3. Volte para **Base LLM** > **Conversational search**
4. Agora deve permitir habilitar o toggle

### 5. Habilitar Conversational Search

**Após configurar o Custom Service:**

1. Vá em **Environments** > **Base large language model (LLM)**
2. Na seção **"Answer behavior"** > **"Conversational search"**
3. O toggle deve estar habilitado agora
4. Mude para **On**
5. **Save** e **Publish**

### 6. Se Ainda Não Funcionar

#### Verificar se o Endpoint Está Acessível
```bash
# Teste direto no navegador
https://hirely-backend-gamma.vercel.app/api/watson-search/search
```

**Resultado esperado:** JSON com dicas gerais (não erro 404)

#### Verificar CORS
O endpoint não deve ter problemas de CORS, mas se tiver:
- Verifique se `CORS_ORIGIN` está configurada no Vercel
- O endpoint do Custom Service não precisa de CORS (é server-to-server)

#### Verificar Banco de Dados
```sql
-- No Supabase SQL Editor
SELECT COUNT(*) as total_tags FROM tags;
SELECT name, category FROM tags LIMIT 10;
```

Se retornar 0, execute o seed:
```sql
-- Copie e execute o conteúdo de backend/src/database/seedTags.sql
```

### 7. Formato Esperado pelo Watson

O Watson Assistant espera este formato de resposta:

```json
{
  "matching_results": 2,
  "results": [
    {
      "id": "tag-1",
      "title": "Tag: React",
      "text": "React é uma habilidade...",
      "metadata": {
        "type": "tag",
        "category": "Tecnologia"
      },
      "score": 1.0
    }
  ]
}
```

Nosso endpoint já retorna neste formato.

### 8. Próximos Passos Após Correções

1. ✅ Fazer commit e push das alterações
2. ✅ Aguardar deploy automático na Vercel
3. ✅ Testar o endpoint novamente
4. ✅ Verificar logs do Vercel
5. ✅ Configurar no Watson Assistant
6. ✅ Habilitar Conversational Search
7. ✅ Testar no Preview

## Checklist de Verificação

- [ ] Endpoint retorna resultados (mesmo que gerais)
- [ ] Logs do Vercel mostram requisições do Watson
- [ ] Custom Service salvo no Watson Assistant
- [ ] Conversational Search habilitado
- [ ] Assistente publicado
- [ ] Teste no Preview funciona

