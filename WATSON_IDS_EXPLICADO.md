# 🔍 Guia Completo: IDs do Watson Assistant

## 📋 IDs Necessários

Você precisa de **3 IDs principais**:

1. **WATSON_ASSISTANT_ID** - ID do assistente (GUID único)
2. **WATSON_ENVIRONMENT_ID** - ID do ambiente (Draft ou Live)
3. **Assistant ID** (para Custom Service) - Mesmo que WATSON_ASSISTANT_ID

## 🔍 Como Obter Cada ID

### 1. WATSON_ASSISTANT_ID (ID do Assistente)

**Valor correto:** `9137a6e8-6cdd-4e83-a0ff-74bbfae87b54`

**O que é:**
- GUID único do seu assistente
- Usado para identificar qual assistente usar
- **NÃO** é o nome do assistente (ex: "Hirely")

**Como obter:**

**Método 1: Via Dashboard**
1. Acesse [IBM Cloud Dashboard](https://cloud.ibm.com/)
2. Vá em **Resource List** > **Watson Assistant**
3. Clique no serviço do Watson Assistant
4. Vá em **Assistants** (ou **Skills** em versões antigas)
5. Clique no assistente (ex: "Hirely")
6. O **Assistant ID** está:
   - Na URL: `.../assistant/{ASSISTANT_ID}/...`
   - Ou em **Settings** > **Assistant details**
   - Formato: GUID como `9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx`



**Método 2: Via API**
```bash
curl -X GET \
  "https://api.us-east.assistant.watson.cloud.ibm.com/v2/assistants" \
  -u "apikey:mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re" \
  -H "Content-Type: application/json"
```

**Método 3: Na URL do Watson Assistant Dashboard**
- Quando você está editando o assistente, a URL contém o ID
- Exemplo: `.../assistant/9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx/...`

---

### 2. WATSON_ENVIRONMENT_ID (ID do Ambiente)

**Valores disponíveis:**
- **Draft:** `6e5b65af-8047-49a6-a810-38981d420bbd`
- **Live:** `b6339e63-dbf3-4d82-b888-14fa461e99bb`

**Recomendação:** Use o **Draft Environment ID** para desenvolvimento/teste.

**O que é:**
- ID do ambiente onde o assistente está configurado
- Pode ser **Draft** (desenvolvimento) ou **Live** (produção)
- **Pode ser o mesmo** que o Assistant ID em alguns casos

**Como obter:**

**Método 1: Via Dashboard**
1. No Watson Assistant Dashboard, vá em **Environments**
2. Clique na aba **Draft** ou **Live**
3. O Environment ID pode estar:
   - Na URL: `.../environment/{ENVIRONMENT_ID}/...`
   - Ou em **Settings** > **Environment details**
   - Formato: GUID como `b6339e63-dbf3-4d82-b888-14fa461e9xxx`

**Método 2: Via API**
```bash
curl -X GET \
  "https://api.us-east.assistant.watson.cloud.ibm.com/v2/assistants/{ASSISTANT_ID}/environments" \
  -u "apikey:mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re" \
  -H "Content-Type: application/json"
```

**Método 3: Pode ser o mesmo que Assistant ID**
- Para ambientes simples, o Environment ID pode ser o mesmo que o Assistant ID
- O código já tem fallback: `WATSON_ENVIRONMENT_ID || WATSON_ASSISTANT_ID`

---

### 3. Para Custom Service (URL do Endpoint)

**O que é:**
- URL do seu endpoint Custom Service
- **NÃO** é um ID, é uma URL completa

**Valor:**
```
https://hirely-backend-gamma.vercel.app/api/watson-search/search
```

---

## 📝 Configuração no Vercel

### Variáveis Necessárias:

```env
# Watson Assistant
WATSON_ASSISTANT_API_KEY=mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re
WATSON_ASSISTANT_URL=https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2
WATSON_ASSISTANT_ID=9137a6e8-6cdd-4e83-a0ff-74bbfae87b54  # ✅ Assistant ID correto
WATSON_ENVIRONMENT_ID=6e5b65af-8047-49a6-a810-38981d420bbd  # ✅ Draft Environment ID (ou deixe vazio)

# Watson NLU
WATSON_NLU_API_KEY=yhNNT51_4VzipS9AwjY5RhbMxnMyVWJuq...
WATSON_NLU_URL=https://api.us-east.natural-language-understanding.watson.cloud.ibm.com
```

---

## 🔍 Como Encontrar o Assistant ID no Dashboard

### Passo a Passo Visual:

1. **Acesse o Watson Assistant Dashboard**
   - URL: `https://cloud.ibm.com/` > **Resource List** > **Watson Assistant**

2. **Vá em Assistants**
   - No menu lateral, clique em **Assistants**
   - Ou vá direto para: `https://us-east.assistant.watson.cloud.ibm.com/`

3. **Selecione seu Assistente**
   - Clique no assistente (ex: "Hirely")

4. **O ID está na URL**
   - A URL ficará algo como:
   ```
   https://us-east.assistant.watson.cloud.ibm.com/.../assistant/9137a6e8-6cdd-4e83-a0ff-74bbfae87xxx/...
   ```
   - O GUID após `/assistant/` é o **Assistant ID**

5. **Ou em Settings**
   - Vá em **Settings** > **Assistant details**
   - Procure por **"Assistant ID"** ou **"ID"**

---

## 🔍 Como Encontrar o Environment ID

### Passo a Passo:

1. **No Watson Assistant Dashboard, vá em Environments**
2. **Clique na aba Draft** (ou Live)
3. **O ID pode estar:**
   - Na URL: `.../environment/{ENVIRONMENT_ID}/...`
   - Ou pode ser o mesmo que o Assistant ID

### ⚠️ Importante:

- Para a maioria dos casos, você pode **deixar `WATSON_ENVIRONMENT_ID` vazio**
- O código usará `WATSON_ASSISTANT_ID` automaticamente
- Isso funciona na maioria das configurações

---

## ✅ Checklist de Configuração

### No Vercel, configure:

- [ ] `WATSON_ASSISTANT_API_KEY` = `mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re` ✅
- [ ] `WATSON_ASSISTANT_URL` = `https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2` ✅
- [ ] `WATSON_ASSISTANT_ID` = **OBTER DO DASHBOARD** ⚠️
- [ ] `WATSON_ENVIRONMENT_ID` = **OPCIONAL** (pode deixar vazio) ⚠️
- [ ] `WATSON_NLU_API_KEY` = ✅
- [ ] `WATSON_NLU_URL` = ✅

---

## 🎯 Solução Rápida

### Se não conseguir encontrar os IDs:

1. **Deixe `WATSON_ENVIRONMENT_ID` vazio** no Vercel
2. **Configure apenas `WATSON_ASSISTANT_ID`**
3. O código usará o Assistant ID como fallback

### Para obter o Assistant ID:

1. Acesse: `https://us-east.assistant.watson.cloud.ibm.com/`
2. Clique no assistente "Hirely"
3. **Copie o GUID da URL** (após `/assistant/`)
4. Cole em `WATSON_ASSISTANT_ID` no Vercel

---

## 🔗 Links Úteis

- [IBM Cloud Dashboard](https://cloud.ibm.com/)
- [Watson Assistant Dashboard](https://us-east.assistant.watson.cloud.ibm.com/)
- [Watson Assistant API Docs](https://cloud.ibm.com/apis/watson-assistant)

---

## ⚠️ Importante

O problema do Conversational Search **não funcionar** provavelmente **NÃO** é causado por IDs incorretos. O problema real é:

1. **Custom Service não configurado no Draft**
2. **Conversational Search não habilitado no Draft**
3. **Actions interceptando mensagens**

Mas ter os IDs corretos é importante para garantir que o Watson está sendo chamado corretamente.

