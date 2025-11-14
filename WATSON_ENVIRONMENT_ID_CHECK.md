# 🔍 Verificação: WATSON_ENVIRONMENT_ID

## ⚠️ Problema Potencial

O `WATSON_ENVIRONMENT_ID` pode estar **incorreto**. Ele é **diferente** do `WATSON_ASSISTANT_ID`.

### Diferença Importante

- **WATSON_ASSISTANT_ID**: ID do assistente (GUID único do assistente)
- **WATSON_ENVIRONMENT_ID**: ID do ambiente (Draft ou Live) onde o assistente está configurado

## 🔍 Como Obter o Environment ID Correto

### Opção 1: Via API (Recomendado)

1. Acesse o Watson Assistant no IBM Cloud
2. Vá em **Environments** > **Draft** (ou **Live**)
3. O Environment ID geralmente está na URL ou pode ser obtido via API

### Opção 2: Deixar Vazio (Usar Assistant ID)

Se você **não** configurar `WATSON_ENVIRONMENT_ID`, o código usará `WATSON_ASSISTANT_ID` como fallback:

```typescript
this.environmentId = process.env.WATSON_ENVIRONMENT_ID || process.env.WATSON_ASSISTANT_ID
```

**Isso pode funcionar**, mas o ideal é usar o Environment ID correto.

## ✅ Verificar Configuração Atual

### No Vercel, verifique:

1. **WATSON_ASSISTANT_ID**: Deve ser o GUID do assistente
2. **WATSON_ENVIRONMENT_ID**: 
   - Se estiver configurado, deve ser o ID do ambiente (Draft ou Live)
   - Se estiver vazio ou igual ao Assistant ID, pode estar errado

## 🔧 Solução

### Opção 1: Usar Assistant ID (Mais Simples)

**Remova ou deixe vazio** `WATSON_ENVIRONMENT_ID` no Vercel. O código usará `WATSON_ASSISTANT_ID` automaticamente.

### Opção 2: Obter Environment ID Correto

1. No Watson Assistant Dashboard, vá em **Environments**
2. Selecione **Draft** ou **Live**
3. O Environment ID pode estar:
   - Na URL (procure por `environment_id` ou `env_id`)
   - Ou pode ser o mesmo que o Assistant ID (depende da versão)

**Para Watson Assistant v2, geralmente:**
- O `environmentId` pode ser o mesmo que `assistantId` para ambientes simples
- Ou pode ser um ID específico do ambiente

## 🎯 Teste Rápido

### Verificar se está funcionando:

1. Remova `WATSON_ENVIRONMENT_ID` temporariamente
2. Deixe apenas `WATSON_ASSISTANT_ID`
3. Faça deploy
4. Teste o chat

Se funcionar, o problema era o `WATSON_ENVIRONMENT_ID` incorreto.

## 📋 Checklist de Variáveis

Verifique se todas estão corretas:

- [ ] `WATSON_ASSISTANT_API_KEY` - API Key do Watson Assistant
- [ ] `WATSON_ASSISTANT_URL` - URL do serviço (ex: `https://api.us-east.assistant.watson.cloud.ibm.com`)
- [ ] `WATSON_ASSISTANT_ID` - GUID do assistente
- [ ] `WATSON_ENVIRONMENT_ID` - ID do ambiente (ou deixe vazio para usar Assistant ID)
- [ ] `WATSON_NLU_API_KEY` - API Key do Watson NLU
- [ ] `WATSON_NLU_URL` - URL do Watson NLU

## ⚠️ Importante

O problema do Conversational Search **não funcionar** provavelmente **NÃO** é causado por essas variáveis. O problema real é:

1. **Custom Service não configurado no Draft**
2. **Conversational Search não habilitado no Draft**
3. **Actions interceptando mensagens**

Mas verificar essas variáveis é importante para garantir que o Watson Assistant está sendo chamado corretamente.

## 🔍 Como Verificar se as Variáveis Estão Corretas

### Verificar Logs do Vercel:

1. Acesse Vercel Dashboard > Deployments > Functions
2. Veja os logs quando o chat é usado
3. Procure por:
   - `✅ Watson Assistant inicializado` - Indica que as variáveis estão corretas
   - `❌ Erro ao inicializar Watson Assistant` - Indica problema nas variáveis
   - `⚠️ Watson Assistant não configurado` - Indica variáveis faltando

## 🎯 Recomendação

1. **Deixe `WATSON_ENVIRONMENT_ID` vazio** (ou remova)
2. O código usará `WATSON_ASSISTANT_ID` automaticamente
3. Isso deve funcionar para a maioria dos casos
4. Se ainda não funcionar, o problema é a configuração do Conversational Search no Watson Dashboard

