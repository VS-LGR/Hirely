# ✅ IDs Corretos do Watson Assistant

## 📋 IDs da Imagem

Baseado na imagem "Assistant IDs and API details", aqui estão os IDs corretos:

## ✅ IDs Corretos

### 1. WATSON_ASSISTANT_ID
```
9137a6e8-6cdd-4e83-a0ff-74bbfae87b54
```
**⚠️ IMPORTANTE:** Este é o **Assistant ID**, NÃO o Instance ID!

### 2. WATSON_ENVIRONMENT_ID (Draft)
```
6e5b65af-8047-49a6-a810-38981d420bbd
```
**Para desenvolvimento/teste** - Use este ID do Draft.

### 3. WATSON_ENVIRONMENT_ID (Live)
```
b6339e63-dbf3-4d82-b888-14fa461e99bb
```
**Para produção** - Use este ID do Live.

### 4. Action Skill ID
```
132c34b0-4ab4-4038-92e7-f0a8d4f6bb1a
```
**Não é necessário** para o código atual.

## 📝 Configuração no Vercel

### Para Desenvolvimento (Draft):

```env
# Watson Assistant
WATSON_ASSISTANT_API_KEY=mc9HlrygQ-HaSy6QCrHfa5OtgBFQujgAoSqzTAWCu7re
WATSON_ASSISTANT_URL=https://api.us-east.assistant.watson.cloud.ibm.com/instances/3b2bff8b-111f-4419-b229-8b0d9c3b89b2
WATSON_ASSISTANT_ID=9137a6e8-6cdd-4e83-a0ff-74bbfae87b54
WATSON_ENVIRONMENT_ID=6e5b65af-8047-49a6-a810-38981d420bbd

# Watson NLU
WATSON_NLU_API_KEY=yhNNT51_4VzipS9AwjY5RhbMxnMyVWJuq...
WATSON_NLU_URL=https://api.us-east.natural-language-understanding.watson.cloud.ibm.com
```

### Para Produção (Live):

```env
WATSON_ENVIRONMENT_ID=b6339e63-dbf3-4d82-b888-14fa461e99bb
```

## ⚠️ Erro Comum

**❌ ERRADO:**
```
WATSON_ASSISTANT_ID=3b2bff8b-111f-4419-b229-8b0d9c3b89b2
```
Isso é o **Instance ID** (parte da URL), não o Assistant ID!

**✅ CORRETO:**
```
WATSON_ASSISTANT_ID=9137a6e8-6cdd-4e83-a0ff-74bbfae87b54
```
Este é o **Assistant ID** correto!

## 🔍 Diferença Importante

- **Instance ID** (`3b2bff8b-111f-4419-b229-8b0d9c3b89b2`): Parte da URL do serviço
- **Assistant ID** (`9137a6e8-6cdd-4e83-a0ff-74bbfae87b54`): ID do assistente específico
- **Environment ID** (`6e5b65af-8047-49a6-a810-38981d420bbd`): ID do ambiente (Draft ou Live)

## ✅ Checklist

- [ ] `WATSON_ASSISTANT_ID` = `9137a6e8-6cdd-4e83-a0ff-74bbfae87b54` ✅
- [ ] `WATSON_ENVIRONMENT_ID` = `6e5b65af-8047-49a6-a810-38981d420bbd` (Draft) ✅
- [ ] Ou deixe `WATSON_ENVIRONMENT_ID` vazio (código usará Assistant ID) ✅

## 🎯 Próximos Passos

1. **Atualize `WATSON_ASSISTANT_ID` no Vercel** com o valor correto
2. **Configure `WATSON_ENVIRONMENT_ID`** com o Draft Environment ID (ou deixe vazio)
3. **Faça redeploy**
4. **Teste o chat**

## ⚠️ Lembrete

O problema do Conversational Search **ainda precisa** ser resolvido configurando:
1. Custom Service no **Draft**
2. Conversational Search habilitado no **Draft**
3. Remover Actions que interceptam mensagens

Mas ter os IDs corretos é essencial!

