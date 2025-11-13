# 🔴 Troubleshooting Detalhado - Watson Assistant Custom Service

## ⚠️ Problema: Custom Service Configurado mas Não Funciona

Se você já configurou o Custom Service mas ainda vê o aviso "Conversational search isn't enabled", siga estes passos:

## 🔍 Passo 1: Verificar Ambiente (Draft vs Live)

**IMPORTANTE:** O Custom Service precisa estar configurado no ambiente que você está usando!

### Verificar Qual Ambiente Está Ativo

1. Vá em **Environments**
2. Veja qual aba está selecionada: **Draft** ou **Live**
3. **O Custom Service deve estar configurado no mesmo ambiente que você está usando**

### Configurar no Ambiente Correto

1. Se você está usando **Draft**:
   - Configure o Custom Service na aba **Draft**
   - Habilite Conversational Search na aba **Draft**

2. Se você está usando **Live**:
   - Configure o Custom Service na aba **Live**
   - Habilite Conversational Search na aba **Live**
   - **OU** publique o ambiente Draft para Live

## 🔍 Passo 2: Verificar se Custom Service Está Realmente Salvo

### Como Verificar

1. Vá em **Environments** > **Search** (não "Environment settings")
2. Você deve ver "Custom service" listado como ativo
3. Se não estiver listado, **não está salvo**

### Como Salvar Corretamente

1. Clique em **"Custom service"** (ou "Edit" se já existir)
2. Configure a URL: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
3. Authentication: **None**
4. **Clique em "Save"** (não apenas "Close")
5. Aguarde a confirmação de salvamento
6. Verifique se aparece como "Active" ou "Connected"

## 🔍 Passo 3: Testar o Endpoint Manualmente

Antes de configurar no Watson, teste se o endpoint está funcionando:

### Teste 1: No Navegador

Abra no navegador:
```
https://hirely-backend-gamma.vercel.app/api/watson-search/search
```

**Resultado esperado:** JSON com `matching_results` e `results` (não erro 404 ou 500)

### Teste 2: Com curl (PowerShell)

```powershell
# Teste POST
curl.exe -X POST https://hirely-backend-gamma.vercel.app/api/watson-search/search `
  -H "Content-Type: application/json" `
  -d '{"query": "React"}'
```

**Resultado esperado:** JSON com resultados sobre React

### Teste 3: Verificar Health Check

```
https://hirely-backend-gamma.vercel.app/api/watson-search/health
```

**Resultado esperado:** `{"status":"ok","service":"Hirely Watson Search","version":"1.0.0"}`

## 🔍 Passo 4: Verificar Formato da Resposta

O Watson Assistant espera este formato **exato**:

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

### Verificar se o Endpoint Retorna Este Formato

1. Teste o endpoint (Passo 3)
2. Verifique se a resposta tem:
   - ✅ `matching_results` (número)
   - ✅ `results` (array)
   - ✅ Cada item tem `id`, `title`, `text`, `metadata`, `score`

## 🔍 Passo 5: Verificar Logs do Vercel

### Como Ver os Logs

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **hirely-backend-gamma**
3. Vá em **Deployments** > Último deployment
4. Clique em **Functions** > `api/index.ts`
5. Veja os logs em tempo real

### O Que Procurar

- ✅ `Watson Search Request:` - Indica que o Watson está chamando o endpoint
- ❌ Erros 404, 500, ou timeouts
- ❌ Mensagens de erro do banco de dados

## 🔍 Passo 6: Verificar Configuração no Watson

### Checklist de Configuração

- [ ] **URL está correta**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- [ ] **Authentication está como "None"**
- [ ] **Custom Service está salvo** (aparece como "Active")
- [ ] **Ambiente correto** (Draft ou Live, conforme você está usando)
- [ ] **Conversational Search está On** (após salvar Custom Service)

### Como Verificar Cada Item

1. **URL Correta:**
   - Vá em **Environments** > **Search** > **Custom service**
   - Verifique se a URL está exatamente: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - ⚠️ **NÃO** deve ter `/api` duas vezes
   - ⚠️ **DEVE** começar com `https://`

2. **Authentication:**
   - Deve estar como **"None"** (nossa API não requer autenticação)

3. **Custom Service Salvo:**
   - Após clicar em "Save", você deve ver uma confirmação
   - O Custom Service deve aparecer como "Active" ou "Connected" na lista

4. **Ambiente Correto:**
   - Se você está testando no Preview, use **Draft**
   - Se você está usando o chat em produção, use **Live**

5. **Conversational Search:**
   - Vá em **Environments** > **Base large language model (LLM)**
   - Role até **"Answer behavior"** > **"Conversational search"**
   - O toggle deve estar **On** (verde)

## 🔍 Passo 7: Publicar o Ambiente

Se você configurou no **Draft** mas está usando **Live**:

1. Vá em **Environments**
2. Certifique-se de que o **Draft** está configurado corretamente
3. Clique em **"Publish"** ou **"Deploy"** para publicar o Draft no Live
4. Aguarde a publicação completar
5. Teste novamente

## 🔍 Passo 8: Verificar Banco de Dados

O endpoint precisa de tags no banco para funcionar:

### Verificar se Tags Existem

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute:

```sql
SELECT COUNT(*) as total_tags FROM tags;
```

**Resultado esperado:** Deve retornar 309 (se o seed foi executado)

### Se Retornar 0, Execute o Seed

1. No Supabase SQL Editor
2. Copie o conteúdo de `backend/src/database/seedTags.sql`
3. Cole e execute no SQL Editor

## 🔍 Passo 9: Problemas Comuns e Soluções

### Problema: "Conversational search isn't enabled"

**Causa:** Custom Service não está salvo ou não está no ambiente correto

**Solução:**
1. Verifique se está no ambiente correto (Draft ou Live)
2. Configure o Custom Service novamente
3. **Salve** (não apenas feche)
4. Aguarde confirmação
5. Habilite Conversational Search

### Problema: Endpoint retorna erro 404

**Causa:** URL incorreta ou rota não existe

**Solução:**
1. Teste a URL no navegador
2. Verifique se o deploy na Vercel foi bem-sucedido
3. Verifique se a rota está registrada em `backend/src/index.ts`

### Problema: Endpoint retorna erro 500

**Causa:** Erro no servidor (banco de dados, código, etc.)

**Solução:**
1. Verifique os logs do Vercel
2. Verifique se o banco de dados está acessível
3. Verifique se as variáveis de ambiente estão configuradas

### Problema: Watson não chama o endpoint

**Causa:** Custom Service não está configurado corretamente

**Solução:**
1. Verifique se o Custom Service está salvo
2. Verifique se está no ambiente correto
3. Verifique se Conversational Search está On
4. Verifique os logs do Vercel para ver se há requisições

## 🎯 Ordem Correta de Configuração

1. ✅ Testar endpoint manualmente (deve retornar JSON)
2. ✅ Configurar Custom Service no ambiente correto (Draft ou Live)
3. ✅ Salvar Custom Service (aguardar confirmação)
4. ✅ Verificar se aparece como "Active"
5. ✅ Habilitar Conversational Search
6. ✅ Publicar ambiente (se necessário)
7. ✅ Testar no Preview

## 📞 Próximos Passos se Ainda Não Funcionar

1. **Compartilhe os logs do Vercel** quando o Watson tentar chamar o endpoint
2. **Compartilhe a resposta do endpoint** quando testado manualmente
3. **Compartilhe uma captura de tela** da configuração do Custom Service
4. **Verifique se há erros** no console do navegador ao testar no Preview

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Watson Assistant Documentation](https://cloud.ibm.com/docs/watson-assistant)

