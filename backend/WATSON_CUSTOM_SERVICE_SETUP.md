# Configuração do Custom Service para Watson Assistant

## O que é o Custom Service?

O Custom Service é uma API que o Watson Assistant consulta para buscar informações relevantes durante as conversas. Ele funciona como um "banco de conhecimento" que o assistente pode consultar para fornecer respostas mais precisas e contextualizadas.

## O que foi criado

Criamos um endpoint `/api/watson-search/search` que:
- Retorna informações sobre tags do sistema
- Fornece dicas de carreira baseadas na query
- Retorna documentos formatados para o Watson Assistant

## Como Configurar no Watson Assistant

### Passo 1: Obter a URL da sua API

Sua API estará disponível em:
```
http://localhost:3001/api/watson-search/search
```

**Para produção**, você precisará de uma URL pública. Opções:
- Deploy no Heroku, Railway, Render, etc.
- Usar ngrok para criar um túnel temporário (para testes)
- Configurar um domínio próprio

### Passo 2: Configurar no Watson Assistant

Na tela do "Custom service" que você está vendo:

1. **Aba "Settings":**

   a. **Default filter:**
   - Deixe vazio ou coloque: `{}`
   - Este campo é opcional

   b. **Metadata:**
   - Este campo é opcional
   - Pode deixar vazio ou usar o exemplo JSON fornecido

   c. **Search display text:**
   - **"No results found"**: "Pesquisei minha base de conhecimento, mas não encontrei nada relacionado à sua consulta"
   - **"Connectivity issue"**: "Não consegui acessar minha base de conhecimento no momento. Tente novamente."

2. **Aba "Instance":**
   - **Service URL**: `http://localhost:3001/api/watson-search/search` (para desenvolvimento)
   - **Authentication**: 
     - Se sua API não requer autenticação: Deixe em branco ou "None"
     - Se requer: Configure conforme necessário

3. **Salvar:**
   - Clique em "Save"
   - O botão "Save" deve ficar habilitado após preencher os campos obrigatórios

### Passo 3: Habilitar Conversational Search

Após configurar o Custom Service:

1. Volte para a tela "Base large language model (LLM)"
2. Na seção "Answer behavior" > "Conversational search"
3. Habilite o toggle (mude para On)
4. Agora deve funcionar sem erros!

## Testando o Endpoint

Você pode testar o endpoint diretamente:

```bash
# Teste com curl
curl -X POST http://localhost:3001/api/watson-search/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React", "limit": 5}'
```

Ou use o Postman/Insomnia para testar.

## Formato da Resposta

O endpoint retorna no formato esperado pelo Watson:

```json
{
  "matching_results": 2,
  "results": [
    {
      "id": "tag-1",
      "title": "Tag: React",
      "text": "React é uma habilidade na categoria Tecnologia...",
      "metadata": {
        "type": "tag",
        "category": "Tecnologia",
        "tag_id": 1
      },
      "score": 1.0
    }
  ]
}
```

## Para Produção

Quando for para produção, você precisará:

1. **Deploy da API** em um servidor público
2. **URL pública** (ex: `https://api.hirely.com/api/watson-search/search`)
3. **HTTPS** (obrigatório para produção)
4. **Autenticação** (opcional, mas recomendado)

## O que o Custom Service faz

Quando o usuário faz uma pergunta:
1. O Watson envia a query para seu endpoint
2. Seu endpoint busca informações relevantes (tags, dicas, etc.)
3. Retorna documentos formatados
4. O Watson usa essas informações + o LLM para gerar uma resposta contextualizada

## Exemplo de Uso

**Usuário pergunta:** "Quais tags devo adicionar se trabalho com React?"

**Fluxo:**
1. Watson envia query: `{"query": "tags React trabalho"}`
2. Seu endpoint busca tags relacionadas a React
3. Retorna documentos sobre React, JavaScript, Frontend, etc.
4. Watson usa essas informações + o prompt da Ellie para responder:
   "Vejo que você trabalha com React! Sugiro adicionar tags como: React, JavaScript, TypeScript, Frontend, HTML, CSS..."

## Troubleshooting

- **Erro de conexão**: Verifique se o backend está rodando na porta 3001
- **Timeout**: O Watson tem um limite de tempo para respostas (geralmente 5-10 segundos)
- **Formato incorreto**: Certifique-se de que a resposta está no formato JSON esperado
- **Para produção**: Use ngrok temporariamente ou faça deploy da API

## Usando ngrok para Testes (Desenvolvimento)

Se quiser testar com uma URL pública sem fazer deploy:

```bash
# Instalar ngrok
# Windows: choco install ngrok
# Ou baixe de https://ngrok.com/

# Criar túnel
ngrok http 3001

# Use a URL fornecida (ex: https://abc123.ngrok.io/api/watson-search/search)
```

