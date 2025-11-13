# 🔴 PROBLEMA IDENTIFICADO - Watson Assistant

## ⚠️ Confusão Entre Webhook e Custom Service

Nas imagens, vejo que você configurou um **"Pre-message webhook"** com a URL do endpoint. Isso está **ERRADO**!

**Webhook ≠ Custom Service**

- **Webhook**: Usado para interceptar mensagens antes/depois do processamento
- **Custom Service**: Usado para busca de conhecimento durante o Conversational Search

## ✅ Solução Correta

### Passo 1: Remover/Desabilitar o Webhook (Se Configurado)

1. Vá em **Environments** > **Environment settings** > **Webhooks**
2. Se o "Pre-message webhook" estiver habilitado com a URL do endpoint:
   - **Desabilite o toggle** "Enabled"
   - Ou remova a URL
   - **Salve**

### Passo 2: Configurar Custom Service Corretamente

1. Vá em **Environments** > **Search** > **Custom service**
2. Se aparecer o modal "Edit an existing search integration":
   - **Selecione "Custom service"** (ícone de chave inglesa)
   - Clique para configurar

3. **Aba "Instance":**
   - **URL**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - **Authentication**: None
   - **Clique em "Save"**

4. **Aba "Settings":**
   - **Default filter**: Deixe vazio ou `{}`
   - **Metadata**: Deixe vazio
   - **Search display text**: Configure as mensagens (opcional)

### Passo 3: Verificar se Custom Service Está Ativo

Após salvar, você deve ver:
- Custom Service listado como "Active" ou "Connected"
- Não deve aparecer mais o aviso sobre configuração

### Passo 4: Habilitar Conversational Search

**AGORA SIM, você pode habilitar:**

1. Vá em **Environments** > **Base large language model (LLM)**
2. Role até **"Answer behavior"** > **"Conversational search"**
3. O toggle deve estar **habilitado** agora (não mais cinza)
4. **Mude para On**
5. **Salve** e **Publique** o assistente

## 🔍 Diferença Entre Webhook e Custom Service

### Webhook (❌ NÃO USE PARA ISSO)
- **Onde**: Environments > Environment settings > Webhooks
- **Quando é chamado**: Antes/depois de processar mensagens
- **Propósito**: Interceptar e modificar o fluxo da conversa
- **Formato**: Recebe dados da conversa, não query de busca

### Custom Service (✅ USE ESTE)
- **Onde**: Environments > Search > Custom service
- **Quando é chamado**: Durante o Conversational Search
- **Propósito**: Buscar conhecimento/documentos relevantes
- **Formato**: Recebe query de busca, retorna documentos

## 📋 Checklist de Verificação

- [ ] Webhook **NÃO** está configurado com a URL do endpoint
- [ ] Custom Service está configurado em **Search** > **Custom service**
- [ ] Custom Service está **salvo** e **ativo**
- [ ] Conversational Search toggle está **On**
- [ ] Assistente foi **publicado** após as mudanças

## 🎯 Ordem Correta de Configuração

1. ✅ Configurar Custom Service (Search > Custom service)
2. ✅ Salvar Custom Service
3. ✅ Habilitar Conversational Search (Base LLM > Answer behavior)
4. ✅ Publicar assistente
5. ✅ Testar no Preview

## 🐛 Se o Toggle Ainda Não Habilitar

### Verificar se Custom Service Está Salvo

1. Vá em **Environments** > **Search**
2. Você deve ver "Custom service" listado como ativo
3. Se não estiver, configure novamente e salve

### Verificar Logs do Vercel

1. Acesse Vercel Dashboard
2. Vá em **Deployments** > Último deployment
3. Clique em **Functions** > `api/index.ts`
4. Veja se há requisições do Watson
5. Procure por erros ou logs

### Testar Endpoint Manualmente

```bash
# Teste POST
curl -X POST https://hirely-backend-gamma.vercel.app/api/watson-search/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React"}'

# Deve retornar JSON com resultados
```

## ⚠️ Erro Comum

**NÃO configure a URL do endpoint em:**
- ❌ Pre-message webhook
- ❌ Post-message webhook
- ❌ Log webhook

**Configure APENAS em:**
- ✅ Search > Custom service > Instance > URL

## 🎯 Resumo

O problema é que você configurou um **Webhook** em vez de **Custom Service**. São coisas diferentes:

- **Webhook**: Para interceptar mensagens
- **Custom Service**: Para busca de conhecimento

**Solução:**
1. Desabilite/remova o webhook
2. Configure o Custom Service corretamente
3. Salve o Custom Service
4. Habilite Conversational Search
5. Publique

