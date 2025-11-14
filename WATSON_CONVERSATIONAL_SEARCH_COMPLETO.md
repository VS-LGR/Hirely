# 🚀 Guia Completo: Conversational Search (watsonx.ai) - Baseado na Documentação Oficial

## 📋 O Que É Conversational Search?

O **Conversational Search** usa o **watsonx.ai** (LLM da IBM) para gerar respostas inteligentes e conversacionais baseadas nos resultados da sua integração de pesquisa (Custom Service).

**Vantagens:**
- ✅ Respostas rápidas, precisas e inteligentes
- ✅ Reconhece o contexto da conversa
- ✅ Respostas claras e concisas
- ✅ Evita perguntas repetitivas

## ⚠️ Requisitos Importantes

1. **Plano**: Enterprise ou Plus (com complemento a partir de 1º de junho de 2024)
2. **Região**: Modelo watsonx.ai disponível apenas em **Dallas** e **Frankfurt**
3. **Idioma**: Suporta português do Brasil ✅
4. **Custom Service**: Deve estar configurado ANTES de ativar Conversational Search

## 🎯 Passo a Passo Completo

### **PASSO 1: Configurar Custom Service (OBRIGATÓRIO PRIMEIRO)**

#### 1.1 Acessar Configuração
1. Acesse **Watson Assistant Dashboard**
2. Vá em **Environments** > **Draft** (ou **Live**)
3. Role até **Search** > **Custom service**

#### 1.2 Configurar
- **URL**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- **Authentication**: **None**
- **Clique em "Save"** ⚠️ MUITO IMPORTANTE!

#### 1.3 Verificar
- Deve aparecer como **"Active"** ou **"Connected"**
- Se não aparecer, **não está salvo** - tente novamente

---

### **PASSO 2: Ativar Conversational Search**

#### 2.1 Acessar Configuração
1. Ainda em **Environments** > **Draft** > **Search**
2. Role até **"Base large language model (LLM)"**
3. Encontre **"Answer behavior"**
4. Localize o toggle **"Conversational search"**

#### 2.2 Ativar o Toggle
1. **Mude para "On"** ✅
2. Configure as opções abaixo:

---

### **PASSO 3: Configurar Opções do Conversational Search**

#### 3.1 Tipo de Pesquisa Conversacional

**Opções:**
- **Single-turn**: Usa apenas a mensagem atual (não considera histórico)
- **Entire conversation**: Usa toda a conversa (considera contexto anterior)

**Recomendação**: ⭐ **"Entire conversation"** para melhor experiência

**Como configurar:**
1. Selecione **"Entire conversation"** (ou "Conversa inteira")
2. Isso permite que o assistente entenda perguntas como "E sobre isso?" referindo-se a algo mencionado antes

---

#### 3.2 Título de Citação (Opcional)

**O que é**: Texto que aparece antes das fontes/citações

**Configuração:**
- **Texto**: "Como sabemos?" ou "Fontes:" ou deixe em branco
- **Nota**: ⚠️ Não funciona no chat web, apenas em integrações customizadas

**Como configurar:**
1. Em **"Definir o texto para o título de citação"**, digite: `Como sabemos?`
2. Ou deixe em branco se não quiser mostrar citações

---

#### 3.3 Tendência para Dizer "Não Sei"

**O que é**: Controla quando o assistente admite que não sabe a resposta

**Opções (da menos para a mais frequente):**

| Opção | Comportamento | Quando Usar |
|-------|--------------|-------------|
| **Rarely** | Raramente diz "não sei" | Quando quer respostas mesmo que imprecisas |
| **Less often** ⭐ | Diz "não sei" ocasionalmente | **Recomendado** - Equilíbrio |
| **More often** | Diz "não sei" com frequência | Quando precisa de alta precisão |
| **Most often** | Diz "não sei" frequentemente | Quando precisa máxima precisão |

**Recomendação**: ⭐ **"Less often"** para equilíbrio entre respostas e precisão

**Como funciona:**
- O assistente calcula uma **pontuação de confiança**
- Se a pontuação for **baixa** (comparada ao limite escolhido):
  - Diz "Não sei"
  - OU retorna para a ação "Sem correspondências"

---

#### 3.4 Comprimento da Resposta Gerada

**O que é**: Controla o tamanho das respostas geradas

**Opções:**

| Opção | Descrição | Quando Usar |
|-------|-----------|-------------|
| **Concise** | Respostas curtas e diretas | Consultas simples, mobile |
| **Moderate** ⭐ | Equilíbrio entre detalhes e concisão | **Recomendado** - Maioria dos casos |
| **Verbose** | Respostas detalhadas e abrangentes | Consultas complexas, explicações completas |

**Recomendação**: ⭐ **"Moderate"** para a maioria dos casos

**Nota**: O comprimento real pode variar devido à complexidade da pergunta e limitações do LLM.

---

### **PASSO 4: Salvar Configurações**

⚠️ **MUITO IMPORTANTE**: Após configurar tudo:

1. **Clique em "Save"** (não apenas feche a janela)
2. **Aguarde a confirmação** de salvamento
3. **Verifique** se o toggle ainda está "On" após salvar

---

### **PASSO 5: Configurar Search Routing**

#### 5.1 Acessar Configurações
1. Vá em **Settings** > **Search routing** (ou **Roteamento de pesquisa**)
2. Configure o comportamento quando nenhuma ação corresponde

#### 5.2 Configurar Fallback
1. Selecione **"Try conversational search"** (ou **"Tentar pesquisa conversacional"**)
2. Isso garante que perguntas sem ações correspondentes sejam direcionadas para o Conversational Search

**Alternativa**: Você também pode adicionar "Search" como uma etapa em Actions específicas.

---

### **PASSO 6: Remover/Desabilitar Actions que Interferem**

#### 6.1 Verificar Actions
1. Vá em **Actions**
2. Procure por Actions genéricas que podem interceptar mensagens

#### 6.2 Desabilitar Temporariamente
1. **Desabilite** Actions genéricas como "Não entendi" ou "Reformule sua pergunta"
2. Ou configure-as para **não interceptar todas as mensagens**
3. **Salve** as alterações

**Por quê?** Actions têm prioridade sobre Conversational Search. Se uma Action corresponder, o Conversational Search não será usado.

---

### **PASSO 7: Publicar (Opcional)**

#### 7.1 Testar no Draft Primeiro
1. Use o **Preview** do Draft para testar
2. Faça perguntas variadas
3. Verifique se as respostas são geradas dinamicamente

#### 7.2 Publicar no Live (Opcional)
1. Se quiser usar em produção, publique o Draft para Live
2. Ou configure diretamente no Live (repetindo os passos acima)

---

## 🧪 Como Testar

### Teste 1: No Preview do Watson Assistant

1. Vá em **Preview** no Watson Assistant Dashboard
2. Faça perguntas como:
   - "Gostaria de ajuda com minha biografia"
   - "Como posso melhorar meu perfil profissional?"
   - "Quais tags devo adicionar ao meu perfil?"
   - "E sobre soft skills?" (testando contexto)
3. **Verifique**:
   - ✅ Respostas são geradas dinamicamente (não apenas Actions)
   - ✅ Respostas são relevantes e conversacionais
   - ✅ Respostas consideram o contexto (se "Entire conversation" estiver ativo)

### Teste 2: No Frontend do Hirely

1. Acesse o Hirely
2. Vá em **Perfil** > **Assistente de IA**
3. Faça perguntas similares
4. **Verifique** se as respostas são conversacionais e relevantes

---

## ⚠️ Problemas Comuns e Soluções

### ❌ Problema 1: Toggle "Conversational search" não aparece

**Causa**: Custom Service não configurado ou não salvo.

**Solução**:
1. Configure o Custom Service primeiro (Passo 1)
2. **Salve** o Custom Service
3. Recarregue a página
4. Tente ativar o toggle novamente

---

### ❌ Problema 2: Toggle está "On" mas não funciona

**Causa**: Configurações não foram salvas ou Actions estão interceptando.

**Solução**:
1. Verifique se clicou em **"Save"** após ativar o toggle
2. Verifique se o toggle ainda está "On" após salvar
3. Desabilite Actions genéricas temporariamente
4. Verifique o Search Routing está configurado

---

### ❌ Problema 3: Assistente ainda responde apenas com Actions

**Causa**: Actions têm prioridade sobre Conversational Search.

**Solução**:
1. **Desabilite** Actions genéricas temporariamente
2. Ou configure o Search Routing para priorizar Conversational Search
3. Verifique se há Actions que correspondem a todas as mensagens

---

### ❌ Problema 4: "Resource not found" ou erro 404

**Causa**: IDs incorretos ou Custom Service não configurado.

**Solução**:
1. Verifique `WATSON_ASSISTANT_ID` e `WATSON_ENVIRONMENT_ID` no Vercel
2. Verifique se o Custom Service está configurado no **Draft** (não apenas Live)
3. Verifique se a URL do Custom Service está correta e acessível

---

### ❌ Problema 5: Respostas muito curtas ou genéricas

**Causa**: "Response length" muito baixo ou "Tendency to say I don't know" muito alta.

**Solução**:
1. Aumente o **"Response length"** para **"Verbose"**
2. Diminua a **"Tendency to say I don't know"** para **"Less often"** ou **"Rarely"**

---

### ❌ Problema 6: Assistente sempre diz "Não sei"

**Causa**: "Tendency to say I don't know" muito alta ou Custom Service não retornando resultados relevantes.

**Solução**:
1. Diminua para **"Less often"** ou **"Rarely"**
2. Verifique se o endpoint `/api/watson-search/search` está retornando resultados relevantes
3. Verifique os logs do Vercel para ver o que está sendo retornado
4. Teste o endpoint manualmente: `https://hirely-backend-gamma.vercel.app/api/watson-search/search?q=biografia`

---

### ❌ Problema 7: Aviso "Conversational search isn't enabled"

**Causa**: Toggle não está realmente "On" ou não foi salvo.

**Solução**:
1. Verifique se o toggle está **"On"** no **Draft** (não apenas Live)
2. **Clique em "Save"** novamente
3. Aguarde a confirmação
4. Recarregue a página e verifique novamente

---

## 📋 Checklist Final

Antes de considerar que está funcionando, verifique:

- [ ] Custom Service configurado no **Draft** (não apenas Live)
- [ ] URL do Custom Service está correta: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- [ ] Custom Service aparece como **"Active"** ou **"Connected"**
- [ ] Toggle "Conversational search" está **On** no **Draft**
- [ ] Tipo de pesquisa configurado (recomendado: "Entire conversation")
- [ ] "Tendency to say I don't know" configurado (recomendado: "Less often")
- [ ] "Response length" configurado (recomendado: "Moderate")
- [ ] **Configurações salvas** (verificar mensagem de confirmação)
- [ ] Search Routing configurado para usar Conversational Search
- [ ] Actions genéricas desabilitadas ou configuradas corretamente
- [ ] Testado no Preview do Watson Assistant
- [ ] Testado no frontend do Hirely

---

## 🎯 Configuração Recomendada (Resumo)

Para melhor experiência, use:

| Configuração | Valor Recomendado |
|--------------|-------------------|
| **Tipo de Pesquisa** | Entire conversation |
| **Tendência para dizer "Não sei"** | Less often |
| **Comprimento da Resposta** | Moderate |
| **Search Routing** | Try conversational search quando nenhuma ação corresponder |
| **Actions Genéricas** | Desabilitadas ou configuradas para não interceptar tudo |

---

## 📝 Notas Importantes

1. **Draft vs Live**: Configure primeiro no **Draft**, teste, e depois publique no **Live** se necessário.

2. **Região**: O modelo watsonx.ai está disponível apenas em **Dallas** e **Frankfurt**. Por padrão, assistentes em outras regiões usam o modelo de Dallas.

3. **Idioma**: Suporta português do Brasil ✅

4. **Custo**: A partir de 1º de junho de 2024, há encargos de complemento para usar Conversational Search além dos planos Plus ou Enterprise.

5. **Streaming**: Para ativar respostas em tempo real (streaming), configure em **Preview** > **Customize web chat** > **Styles** > **Streaming** > **On**.

6. **Salvar é Crucial**: Sempre clique em **"Save"** após fazer alterações. Se não salvar, as configurações não serão aplicadas.

---

## 🔍 Debugging

### Verificar Logs do Vercel

1. Acesse **Vercel Dashboard** > Seu Projeto > **Logs**
2. Procure por requisições para `/api/watson-search/search`
3. Verifique se o endpoint está retornando resultados

### Testar Endpoint Manualmente

```bash
# Teste 1: GET request
curl "https://hirely-backend-gamma.vercel.app/api/watson-search/search?q=biografia"

# Teste 2: POST request
curl -X POST "https://hirely-backend-gamma.vercel.app/api/watson-search/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "biografia"}'
```

Ambos devem retornar JSON no formato:
```json
{
  "search_results": [
    {
      "result_metadata": {"score": 0.8},
      "title": "...",
      "body": "...",
      "highlight": {"body": ["..."]}
    }
  ]
}
```

---

## 📚 Referências

- [Documentação IBM: Conversational Search](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-search-conversational)
- [Documentação IBM: watsonx.ai](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-search-generative)

---

## ✅ Próximos Passos

1. Siga o **Passo a Passo Completo** acima
2. Use a **Configuração Recomendada**
3. Teste no **Preview** do Watson Assistant
4. Teste no **Frontend** do Hirely
5. Se ainda não funcionar, verifique a seção **Problemas Comuns**

**Lembre-se**: O mais importante é **salvar** as configurações após cada alteração!

