# Guia Rápido - Configurar Watson Assistant para Respostas Dinâmicas

## 🎯 Objetivo

Habilitar o Watson Assistant para gerar respostas dinâmicas usando o LLM base, não apenas Actions predefinidas.

## ✅ Pré-requisitos

- Backend deployado na Vercel: `https://hirely-backend-gamma.vercel.app`
- Watson Assistant criado no IBM Cloud
- Prompt da Ellie configurado (~912 caracteres)

## 🚀 Passos Rápidos

### 1. Configurar Custom Service (5 minutos)

1. **IBM Cloud** > **Watson Assistant** > Seu Assistente
2. **Environments** > **Search** > **Custom service**
3. Clique em **"Set up a new search integration"** ou **"Add integration"**
4. Configure:
   - **Service URL**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - **Authentication**: None
   - **Default filter**: `{}` (ou deixe vazio)
5. **Save**

### 2. Habilitar Conversational Search (2 minutos)

1. **Environments** > **Base large language model (LLM)**
2. Na seção **"Answer behavior"** > **"Conversational search"**
3. **Toggle ON** (mudar de Off para On)
4. **Save** e **Publish** o assistente

### 3. Testar (1 minuto)

1. Clique em **"Preview"**
2. Pergunte: "Como posso melhorar meu perfil?"
3. Deve responder dinamicamente, não com Action predefinida

## 🔍 Verificar se Funcionou

**✅ Funcionando:**
- Respostas variam e são contextualizadas
- O assistente "pensa" antes de responder
- Respostas são personalizadas

**❌ Não funcionou:**
- Respostas sempre iguais
- Apenas Actions predefinidas
- Respostas genéricas

## 🐛 Problemas Comuns

### "No valid skills found"
- Crie uma Skill básica: **Actions** > **Create action**

### Custom Service não conecta
- Teste a URL: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- Deve retornar JSON, não erro

### Conversational Search não habilita
- Verifique se Custom Service foi salvo
- Tente desabilitar e reabilitar o toggle

## 📝 URLs Importantes

- **Custom Service**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- **Health Check**: `https://hirely-backend-gamma.vercel.app/health`
- **Teste Manual**: Use Postman/curl para testar o endpoint

## 📚 Documentação Completa

Para mais detalhes, veja: `backend/WATSON_PRODUCTION_SETUP.md`

