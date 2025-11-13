# Configuração do IBM Watson

Este guia explica como configurar o IBM Watson para usar como alternativa à OpenAI.

## Serviços Necessários

1. **Watson Assistant** - Para o chat/conversação
2. **Watson Natural Language Understanding (NLU)** - Para análise de currículos

## Passo a Passo

### 1. Criar Conta no IBM Cloud

1. Acesse https://cloud.ibm.com/
2. Crie uma conta gratuita (tem plano gratuito com créditos)

### 2. Criar Instância do Watson Assistant

1. No IBM Cloud, vá em "Catalog"
2. Busque por "Watson Assistant"
3. Clique em "Create" (pode usar o plano Lite que é gratuito)
4. Após criar, vá em "Manage" > "API Keys"
5. Copie a **API Key** e a **URL** do serviço
6. Vá em "Assistants" e crie um novo assistente
7. Copie o **Assistant ID** (é um GUID, não o nome)
8. **IMPORTANTE**: Configure pelo menos uma Skill/Action no assistente:
   - Clique no assistente criado
   - Vá em "Actions" > "Create Action"
   - Crie uma action básica (ex: "Saudação" que responde "Olá! Como posso ajudar?")
   - Ou use o "Try it" para testar
   - Publique o assistente (deploy)

### 3. Criar Instância do Watson NLU

1. No IBM Cloud, vá em "Catalog"
2. Busque por "Natural Language Understanding"
3. Clique em "Create" (pode usar o plano Lite que é gratuito)
4. Após criar, vá em "Manage" > "API Keys"
5. Copie a **API Key** e a **URL** do serviço

### 4. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env` do backend:

```env
# Escolher qual serviço usar (true para Watson, false ou não definido para OpenAI)
USE_WATSON=true

# Watson Assistant
WATSON_ASSISTANT_API_KEY=sua-api-key-aqui
WATSON_ASSISTANT_URL=https://api.us-south.assistant.watson.cloud.ibm.com
WATSON_ASSISTANT_ID=seu-assistant-id-aqui
# Opcional: Se o environmentId for diferente do assistantId, defina aqui
# Caso contrário, o sistema usará o WATSON_ASSISTANT_ID como environmentId
WATSON_ENVIRONMENT_ID=seu-environment-id-aqui

# Watson NLU
WATSON_NLU_API_KEY=sua-api-key-aqui
WATSON_NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com
```

**Nota:** As URLs podem variar dependendo da região. Exemplos:
- `us-south` (Dallas)
- `us-east` (Washington)
- `eu-gb` (Londres)
- `eu-de` (Frankfurt)
- `jp-tok` (Tóquio)

### 5. Instalar Dependências

```bash
cd backend
npm install ibm-watson
```

### 6. Reiniciar o Servidor

```bash
npm run dev
```

## Vantagens do IBM Watson

1. **Plano Gratuito**: Oferece créditos gratuitos mensais
2. **Sem Limites de Cota**: Diferente da OpenAI, não tem limite rígido de requisições
3. **Mais Controle**: Você pode treinar o assistente com dados específicos
4. **Análise de Texto Avançada**: NLU oferece análise de entidades, sentimentos, conceitos, etc.

## Alternando Entre Serviços

Para alternar entre OpenAI e Watson, basta mudar a variável `USE_WATSON` no `.env`:

- `USE_WATSON=true` → Usa IBM Watson
- `USE_WATSON=false` ou não definido → Usa OpenAI

## Personalizando o Watson Assistant

Você pode personalizar o assistente no dashboard do IBM Cloud:

1. Vá em "Assistants" > Seu Assistente
2. Clique em "Actions" > "Create Action"
3. Configure intenções e respostas personalizadas
4. Adicione contexto sobre carreira, recrutamento, etc.

**⚠️ IMPORTANTE**: O assistente DEVE ter pelo menos uma Skill/Action configurada antes de usar. 
Caso contrário, você receberá o erro "No valid skills found".

### Criar uma Action Básica

1. No assistente, clique em "Actions"
2. Clique em "Create Action"
3. Configure:
   - **Name**: "Saudação" ou "Ajuda com Perfil"
   - **Customer says**: "Olá" ou "Preciso de ajuda"
   - **Assistant responds**: "Olá! Sou seu assistente de carreira. Como posso ajudá-lo?"
4. Salve e publique o assistente

## Troubleshooting

- **Erro de autenticação**: Verifique se as API keys estão corretas
- **Erro de URL**: Certifique-se de usar a URL correta da sua região
- **Erro de Assistant ID**: Verifique se o ID do assistente está correto (deve ser um GUID, não o nome)
- **Erro de Environment ID**: Na maioria dos casos, o `environmentId` é o mesmo que o `assistantId`. Se você receber erros sobre `environmentId`, defina `WATSON_ENVIRONMENT_ID` explicitamente no `.env`
- **"No valid skills found"**: O assistente não tem skills/actions configurados. Crie pelo menos uma Action no assistente e publique (deploy) antes de usar
- **Assistente só responde com Actions predefinidas**: Você precisa habilitar o "Conversational search" toggle na seção "Answer behavior" para usar o LLM base. Veja `WATSON_CONVERSATIONAL_SETUP.md` para instruções detalhadas

