# 🎯 Como Obter o WATSON_ASSISTANT_ID

## 📋 O Que Você Precisa

Você já tem:
- ✅ `WATSON_ASSISTANT_API_KEY` = `mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re`
- ✅ `WATSON_ASSISTANT_URL` = `https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2`

**Falta:**
- ⚠️ `WATSON_ASSISTANT_ID` = **GUID do assistente** (precisa obter)

## 🔍 Como Obter o Assistant ID

### Método 1: Via Dashboard (Mais Fácil)

1. **Acesse o Watson Assistant Dashboard:**
   ```
   https://us-east.assistant.watson.cloud.ibm.com/
   ```
   (ou use o link direto do IBM Cloud)

2. **Vá em "Assistants"** (menu lateral)

3. **Clique no seu assistente** (provavelmente "Hirely")

4. **O Assistant ID está na URL:**
   - A URL ficará algo como:
   ```
   https://us-east.assistant.watson.cloud.ibm.com/.../assistant/9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx/...
   ```
   - O GUID após `/assistant/` é o **Assistant ID**
   - Formato: `9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx`

5. **Copie esse GUID** e cole em `WATSON_ASSISTANT_ID` no Vercel

### Método 2: Via API

Execute este comando (substitua `{apikey}` pela sua API key):

```bash
curl -X GET \
  "https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2/v2/assistants" \
  -u "apikey:mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re" \
  -H "Content-Type: application/json"
```

Isso retornará uma lista de assistentes com seus IDs.

### Método 3: Na Página do Assistente

1. No Watson Assistant Dashboard, vá em **Assistants**
2. Clique no assistente
3. Vá em **Settings** (ou **Configurações**)
4. Procure por **"Assistant ID"** ou **"ID"**
5. Copie o GUID

## 📝 Configuração Final no Vercel

### Variáveis Necessárias:

```env
# Watson Assistant
WATSON_ASSISTANT_API_KEY=mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re
WATSON_ASSISTANT_URL=https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2
WATSON_ASSISTANT_ID=9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx  # ⚠️ OBTER DO DASHBOARD
WATSON_ENVIRONMENT_ID=  # ⚠️ DEIXE VAZIO (opcional)

# Watson NLU
WATSON_NLU_API_KEY=yhNNT51_4VzipS9AwjY5RhbMxnMyVWJuq...
WATSON_NLU_URL=https://api.us-east.natural-language-understanding.watson.cloud.ibm.com
```

## ⚠️ Sobre WATSON_ENVIRONMENT_ID

**Você pode deixar vazio!**

O código já tem um fallback:
```typescript
this.environmentId = process.env.WATSON_ENVIRONMENT_ID || process.env.WATSON_ASSISTANT_ID
```

Se `WATSON_ENVIRONMENT_ID` estiver vazio, o código usará `WATSON_ASSISTANT_ID` automaticamente.

## 🎯 Resumo

1. **Acesse:** `https://us-east.assistant.watson.cloud.ibm.com/`
2. **Vá em:** Assistants > Seu Assistente
3. **Copie o GUID** da URL (após `/assistant/`)
4. **Cole em:** `WATSON_ASSISTANT_ID` no Vercel
5. **Deixe:** `WATSON_ENVIRONMENT_ID` vazio

## ✅ Checklist

- [ ] Acessou o Watson Assistant Dashboard
- [ ] Encontrou o assistente "Hirely"
- [ ] Copiou o GUID da URL (Assistant ID)
- [ ] Configurou `WATSON_ASSISTANT_ID` no Vercel
- [ ] Deixou `WATSON_ENVIRONMENT_ID` vazio (ou removeu)
- [ ] Fez redeploy

## 🔗 Links Diretos

- [Watson Assistant Dashboard](https://us-east.assistant.watson.cloud.ibm.com/)
- [IBM Cloud Dashboard](https://cloud.ibm.com/)

