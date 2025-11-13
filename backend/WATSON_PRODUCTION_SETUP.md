# Configuração do Watson Assistant para Produção

Agora que o backend está deployado na Vercel, vamos configurar o Watson Assistant para usar o LLM base e gerar respostas dinâmicas.

## Status Atual

- ✅ Backend deployado na Vercel: `https://hirely-backend-gamma.vercel.app`
- ✅ Endpoint Custom Service criado: `/api/watson-search/search`
- ✅ Prompt da Ellie configurado no Watson Assistant
- ⚠️ Conversational Search precisa ser habilitado
- ⚠️ Custom Service precisa ser configurado com URL de produção

## Passo 1: Configurar Custom Service no Watson Assistant

### 1.1. Acessar a Configuração

1. Acesse o [IBM Cloud Console](https://cloud.ibm.com)
2. Vá em **Watson Assistant** > Seu Assistente
3. Vá em **Environments** > **Search** > **Custom service**
4. Clique em **"Set up a new search integration"** ou **"Add integration"**

### 1.2. Configurar o Custom Service

Na tela de configuração:

**Aba "Settings":**

1. **Default filter:**
   - Deixe vazio ou coloque: `{}`
   - Este campo é opcional

2. **Metadata:**
   - Deixe vazio (opcional)
   - Ou use:
   ```json
   {
     "source": "hirely",
     "version": "1.0"
   }
   ```

3. **Search display text:**
   - **"No results found"**: "Pesquisei minha base de conhecimento, mas não encontrei nada relacionado à sua consulta. Como posso ajudá-lo de outra forma?"
   - **"Connectivity issue"**: "Não consegui acessar minha base de conhecimento no momento. Tente novamente em instantes."

**Aba "Instance":**

1. **Service URL:**
   ```
   https://hirely-backend-gamma.vercel.app/api/watson-search/search
   ```
   ⚠️ **IMPORTANTE**: Use a URL completa com `https://` e inclua `/api/watson-search/search`

2. **Authentication:**
   - Selecione **"None"** (nossa API não requer autenticação para o Custom Service)
   - Ou configure se você adicionar autenticação depois

3. **Clique em "Save"**

### 1.3. Testar o Endpoint

Antes de continuar, teste se o endpoint está funcionando:

```bash
curl -X POST https://hirely-backend-gamma.vercel.app/api/watson-search/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React", "limit": 5}'
```

Deve retornar JSON com resultados de tags.

## Passo 2: Habilitar Conversational Search

### 2.1. Acessar a Configuração do LLM

1. No Watson Assistant, vá em **Environments** > **Base large language model (LLM)**
2. Verifique se o prompt da Ellie está configurado (deve estar com ~912/1000 caracteres)
3. Verifique se o modelo está selecionado: `granite-3-8b-instruct`

### 2.2. Habilitar Conversational Search

1. Na seção **"Answer behavior"**, encontre **"Conversational search"**
2. **Clique no toggle** para mudar de **Off** para **On**
3. Se aparecer um aviso sobre integração de busca:
   - Agora você já configurou o Custom Service, então deve funcionar
   - Se ainda pedir, verifique se o Custom Service foi salvo corretamente

### 2.3. Salvar e Publicar

1. **Salve** todas as alterações
2. **Publique** o assistente (Deploy)
3. Aguarde alguns segundos para as mudanças serem aplicadas

## Passo 3: Testar

### 3.1. Teste no Preview

1. No Watson Assistant, clique em **"Preview"**
2. Teste perguntas como:
   - "Como posso melhorar meu perfil?"
   - "Quais tags devo adicionar se trabalho com React?"
   - "Me ajude a escrever uma biografia melhor"
   - "O que são hard skills e soft skills?"

### 3.2. Verificar se está Funcionando

**✅ Funcionando corretamente:**
- Respostas são geradas dinamicamente
- Respostas são personalizadas e contextualizadas
- O assistente "pensa" antes de responder
- Respostas variam mesmo para perguntas similares

**❌ Ainda não funciona:**
- Respostas são sempre iguais (Actions predefinidas)
- Respostas genéricas sem contexto
- Erro ao fazer perguntas

## Passo 4: Testar via API (Opcional)

Você pode testar diretamente via API do backend:

```bash
# Teste de chat
curl -X POST https://hirely-backend-gamma.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "message": "Como posso melhorar meu perfil?",
    "history": []
  }'
```

## Troubleshooting

### Erro: "No valid skills found"
- **Solução**: Crie pelo menos uma Skill/Action básica no Watson Assistant
- Vá em **Actions** > **Create action** > Crie uma ação simples

### Erro: "Custom service connection failed"
- Verifique se a URL está correta: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- Teste a URL diretamente no navegador (deve retornar JSON)
- Verifique se o backend está online: `https://hirely-backend-gamma.vercel.app/health`

### Conversational Search não habilita
- Certifique-se de que o Custom Service foi salvo e está ativo
- Tente desabilitar e reabilitar o toggle
- Verifique se o assistente foi publicado

### Respostas ainda são predefinidas
- Verifique se o toggle "Conversational search" está realmente **On**
- Certifique-se de que o assistente foi **publicado** após as mudanças
- Aguarde alguns minutos para as mudanças serem propagadas
- Limpe o cache do Preview e teste novamente

### Endpoint retorna erro 404
- Verifique se a rota está correta: `/api/watson-search/search`
- Verifique os logs do Vercel para ver se há erros
- Certifique-se de que o backend foi deployado corretamente

## Variáveis de Ambiente Necessárias

No Vercel (projeto do backend), certifique-se de ter:

```env
WATSON_ASSISTANT_API_KEY=...
WATSON_ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com
WATSON_ASSISTANT_ID=...
WATSON_ENVIRONMENT_ID=... (ou use o mesmo que ASSISTANT_ID)
WATSON_NLU_API_KEY=...
WATSON_NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com
USE_WATSON=true
```

## Próximos Passos

Após configurar:

1. ✅ Teste no Preview do Watson Assistant
2. ✅ Teste via frontend da Hirely
3. ✅ Monitore os logs do Vercel para ver se há erros
4. ✅ Ajuste o prompt da Ellie se necessário
5. ✅ Adicione mais conteúdo ao Custom Service se quiser

## Notas Importantes

- O Custom Service é **opcional** mas **recomendado** para respostas mais precisas
- O Conversational Search pode funcionar sem Custom Service, mas será menos preciso
- O LLM base (`granite-3-8b-instruct`) é suficiente para conversas gerais
- O Custom Service melhora as respostas ao fornecer contexto específico (tags, dicas, etc.)

## URL de Produção

**Custom Service URL:**
```
https://hirely-backend-gamma.vercel.app/api/watson-search/search
```

**Health Check:**
```
https://hirely-backend-gamma.vercel.app/health
```

**API Base:**
```
https://hirely-backend-gamma.vercel.app/api
```

