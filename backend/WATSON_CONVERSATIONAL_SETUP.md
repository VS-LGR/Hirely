# Como Habilitar Conversas com LLM no Watson Assistant

## Problema
O Watson Assistant está respondendo apenas com Actions predefinidas, não está "pensando" e gerando respostas usando o LLM base.

## Solução: Habilitar Conversational Search

### Opção 1: Usar LLM Base SEM Integração de Busca (Recomendado para Começar)

O Watson Assistant pode usar o LLM base para conversas sem precisar de uma integração de busca completa. Siga estes passos:

1. **Na tela atual (Base large language model):**
   - Você já inseriu o prompt (912/1000 caracteres) ✅
   - Agora precisa habilitar o **Conversational search**

2. **Habilitar Conversational Search:**
   - Na seção "Answer behavior" > "Conversational search"
   - Clique no **toggle** para ligar (mudar de Off para On)
   - Se aparecer um aviso sobre integração de busca, você pode ignorá-lo inicialmente
   - O LLM base pode funcionar sem integração de busca para conversas gerais

3. **Se pedir para configurar integração:**
   - Clique em "Set up" se aparecer
   - No modal que abrir, você pode:
     - **Opção A**: Fechar o modal (X) e tentar habilitar o toggle diretamente
     - **Opção B**: Configurar uma integração mínima (veja Opção 2 abaixo)

4. **Salvar e Publicar:**
   - Salve todas as alterações
   - Publique o assistente (Deploy)
   - Teste no Preview

### Opção 2: Configurar Integração de Busca Mínima (Se Necessário)

Se o sistema exigir uma integração de busca para habilitar o Conversational search:

1. **No modal "Set up a new search integration":**
   - Você tem 4 opções:
     - Elasticsearch (RECOMMENDED)
     - Milvus
     - Watson Discovery
     - Custom service

2. **Para uso básico (sem busca real):**
   - Você pode configurar uma integração mínima ou usar "Custom service"
   - Ou simplesmente fechar o modal e habilitar o toggle diretamente

3. **Importante:**
   - O Conversational search pode funcionar com o LLM base mesmo sem uma busca real configurada
   - A busca é opcional para melhorar respostas com documentos específicos
   - Para conversas gerais sobre carreira, o LLM base é suficiente

## Como Funciona

### Com Conversational Search DESLIGADO (Situação Atual):
- Assistente usa apenas Actions predefinidas
- Respostas são fixas e limitadas
- Não "pensa" ou gera respostas dinâmicas

### Com Conversational Search LIGADO:
- Assistente usa o LLM base (granite-3-8b-instruct)
- Gera respostas dinâmicas baseadas no prompt
- Usa o contexto do perfil do candidato
- Pode ter conversas naturais e personalizadas

## Configuração Recomendada

1. ✅ Prompt inserido (912/1000 caracteres)
2. ✅ Modelo selecionado (granite-3-8b-instruct)
3. ⚠️ **Habilitar Conversational search toggle** (mudar para On)
4. ✅ Salvar e publicar

## Testando

Após habilitar:

1. Use o "Preview" no Watson Assistant
2. Teste perguntas como:
   - "Como posso melhorar meu perfil?"
   - "Quais tags devo adicionar?"
   - "Me ajude a escrever uma biografia melhor"
3. Verifique se as respostas são geradas dinamicamente, não apenas Actions predefinidas

## Troubleshooting

- **Ainda responde apenas com Actions**: Verifique se o toggle está realmente ligado e se o assistente foi publicado
- **Erro ao habilitar**: Tente fechar o modal de busca e habilitar o toggle diretamente
- **Respostas genéricas**: Ajuste o prompt para ser mais específico sobre o contexto da Hirely

## Nota Importante

O Conversational search permite que o LLM base seja usado para gerar respostas. Mesmo sem uma integração de busca real, o LLM pode funcionar para conversas gerais. A busca é útil quando você quer que o assistente consulte documentos específicos, mas não é obrigatória para conversas básicas.

