# 🚀 Configuração Completa: Conversational Search (watsonx.ai)

## 📋 Pré-requisitos

- ✅ Watson Assistant criado
- ✅ Custom Service configurado e funcionando
- ✅ Endpoint `/api/watson-search/search` retornando JSON correto
- ✅ Plano Enterprise ou Plus (com complemento)

## 🎯 Passo a Passo Completo

### 1. Configurar Custom Service (Integração de Pesquisa)

#### 1.1 Acessar a Configuração
1. Acesse o **Watson Assistant Dashboard**
2. Vá em **Environments** > **Draft** (ou **Live** se quiser configurar produção)
3. Role até a seção **Search** > **Custom service**

#### 1.2 Configurar URL e Autenticação
1. **URL**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
2. **Authentication**: Selecione **None** (ou configure se necessário)
3. **Clique em "Save"**

### 2. Ativar Conversational Search (Procura de Conversação)

#### 2.1 Acessar a Configuração
1. Ainda em **Environments** > **Draft** > **Search**
2. Role até **"Base large language model (LLM)"**
3. Encontre a seção **"Answer behavior"**
4. Localize o toggle **"Conversational search"**

#### 2.2 Ativar o Toggle
1. **Mude o toggle para "On"** ✅
2. Configure as opções abaixo:

#### 2.3 Configurar Opções de Conversational Search

**a) Tipo de Pesquisa:**
- **Single-turn**: Para perguntas simples que não dependem de contexto anterior
- **Entire conversation**: Para perguntas que podem depender de mensagens anteriores
- **Recomendação**: Use **"Entire conversation"** para melhor experiência

**b) Título de Citação (Opcional):**
- **Texto**: "Como sabemos?" ou "Fontes:" ou deixe em branco
- **Nota**: Não funciona no chat web, apenas em integrações customizadas

**c) Tendência para dizer "Não sei":**
- **Rarely**: Assistente raramente diz "não sei" (pode dar respostas imprecisas)
- **Less often**: ⭐ **Recomendado** - Equilíbrio entre precisão e respostas
- **More often**: Assistente diz "não sei" com mais frequência
- **Most often**: Assistente diz "não sei" frequentemente (mais preciso, menos respostas)

**d) Comprimento da Resposta:**
- **Concise**: Respostas curtas e diretas
- **Moderate**: ⭐ **Recomendado** - Equilíbrio entre detalhes e concisão
- **Verbose**: Respostas detalhadas e abrangentes

#### 2.4 Salvar
1. **Clique em "Save"** (muito importante!)
2. Aguarde a confirmação de salvamento

### 3. Configurar Roteamento de Pesquisa

#### 3.1 Acessar Configurações de Roteamento
1. Vá em **Settings** > **Search routing** (ou **Roteamento de pesquisa**)
2. Configure o que acontece quando nenhuma ação corresponde

#### 3.2 Configurar Fallback
1. Selecione **"Try conversational search"** ou **"Tentar pesquisa conversacional"**
2. Isso garante que perguntas sem ações correspondentes sejam direcionadas para o Conversational Search

### 4. Remover ou Desabilitar Actions que Interferem

#### 4.1 Verificar Actions
1. Vá em **Actions**
2. Verifique se há Actions que podem interceptar mensagens antes do Conversational Search

#### 4.2 Desabilitar Actions Problemáticas
1. Se houver Actions genéricas (ex: "Não entendi"), **desabilite-as temporariamente**
2. Ou configure-as para não interceptar todas as mensagens
3. **Salve as alterações**

### 5. Publicar no Ambiente Draft

#### 5.1 Verificar Configuração
1. Certifique-se de que todas as configurações foram salvas
2. Verifique se o toggle "Conversational search" está **On**

#### 5.2 Publicar (Opcional)
1. Se quiser testar em produção, publique no ambiente **Live**
2. Ou teste diretamente no **Preview** do Draft

### 6. Testar

#### 6.1 Testar no Preview
1. Vá em **Preview** no Watson Assistant Dashboard
2. Faça perguntas como:
   - "Gostaria de ajuda com minha biografia"
   - "Como posso melhorar meu perfil profissional?"
   - "Quais tags devo adicionar ao meu perfil?"
3. **Verifique se as respostas são geradas dinamicamente** (não apenas Actions predefinidas)

#### 6.2 Testar no Frontend
1. Acesse o Hirely
2. Vá em **Perfil** > **Assistente de IA**
3. Faça perguntas similares
4. Verifique se as respostas são conversacionais e relevantes

## ⚠️ Problemas Comuns

### Problema 1: Toggle "Conversational search" não aparece ou está desabilitado

**Causa**: Pode ser necessário configurar primeiro o Custom Service.

**Solução**:
1. Configure o Custom Service primeiro (Passo 1)
2. Salve
3. Recarregue a página
4. Tente ativar o toggle novamente

### Problema 2: Assistente ainda responde apenas com Actions

**Causa**: Actions estão interceptando mensagens antes do Conversational Search.

**Solução**:
1. Desabilite Actions genéricas temporariamente
2. Ou configure o Search Routing para priorizar Conversational Search
3. Verifique se o toggle está realmente "On" e salvo

### Problema 3: "Resource not found" ou erro 404

**Causa**: IDs incorretos ou Custom Service não configurado.

**Solução**:
1. Verifique `WATSON_ASSISTANT_ID` e `WATSON_ENVIRONMENT_ID` no Vercel
2. Verifique se o Custom Service está configurado no Draft
3. Verifique se a URL do Custom Service está correta

### Problema 4: Respostas muito curtas ou genéricas

**Causa**: Configuração de "Response length" ou "Tendency to say I don't know".

**Solução**:
1. Aumente o "Response length" para **"Verbose"**
2. Diminua a "Tendency to say I don't know" para **"Less often"** ou **"Rarely"**

### Problema 5: Assistente sempre diz "Não sei"

**Causa**: "Tendency to say I don't know" muito alta ou Custom Service não retornando resultados relevantes.

**Solução**:
1. Diminua para **"Less often"** ou **"Rarely"**
2. Verifique se o endpoint `/api/watson-search/search` está retornando resultados relevantes
3. Verifique os logs do Vercel para ver o que está sendo retornado

## 🔍 Verificação Final

### Checklist

- [ ] Custom Service configurado no **Draft** (não apenas Live)
- [ ] URL do Custom Service está correta e acessível
- [ ] Toggle "Conversational search" está **On** no **Draft**
- [ ] Configurações salvas (verificar mensagem de confirmação)
- [ ] Search Routing configurado para usar Conversational Search
- [ ] Actions genéricas desabilitadas ou configuradas corretamente
- [ ] Testado no Preview do Watson Assistant
- [ ] Testado no frontend do Hirely

## 📝 Notas Importantes

1. **Draft vs Live**: Configure primeiro no **Draft**, teste, e depois publique no **Live** se necessário.

2. **Região**: O modelo watsonx.ai está disponível apenas em **Dallas** e **Frankfurt**. Por padrão, assistentes em outras regiões usam o modelo de Dallas.

3. **Idioma**: Suporta inglês, francês, alemão, espanhol, português do Brasil e japonês.

4. **Custo**: A partir de 1º de junho de 2024, há encargos de complemento para usar Conversational Search além dos planos Plus ou Enterprise.

5. **Streaming**: Para ativar respostas em tempo real (streaming), configure em **Preview** > **Customize web chat** > **Styles** > **Streaming** > **On**.

## 🎯 Configuração Recomendada

Para melhor experiência, use:

- **Tipo de Pesquisa**: Entire conversation
- **Tendência para dizer "Não sei"**: Less often
- **Comprimento da Resposta**: Moderate
- **Search Routing**: Try conversational search quando nenhuma ação corresponder

## 📚 Referências

- [Documentação IBM: Conversational Search](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-search-conversational)
- [Documentação IBM: watsonx.ai](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-search-generative)

