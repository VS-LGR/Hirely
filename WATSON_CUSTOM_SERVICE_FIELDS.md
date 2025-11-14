# 📝 Como Preencher os Campos do Custom Service

## Campos na Aba "Settings"

### 1. Default Filter

**O que é:**
- Campo opcional usado para filtrar resultados da busca
- Pode ser texto simples ou JSON
- Será enviado junto com cada requisição de busca

**Como preencher:**

**Opção 1: Deixar vazio (Recomendado)**
- Deixe o campo vazio se não precisar de filtros específicos
- O endpoint funcionará normalmente sem filtros

**Opção 2: JSON simples (Opcional)**
```json
{
  "category": "Tecnologia",
  "min_relevance": 0.5
}
```

**Opção 3: Texto simples (Opcional)**
```
Tecnologia
```

**Recomendação:** Deixe vazio por enquanto. Você pode adicionar filtros depois se necessário.

---

### 2. Metadata

**O que é:**
- Objeto JSON opcional para passar informações adicionais ao serviço
- Útil para configurações específicas ou contexto adicional
- Será enviado junto com cada requisição

**Como preencher:**

**Opção 1: Deixar vazio (Recomendado)**
- Deixe o campo vazio se não precisar de metadados adicionais
- O endpoint funcionará normalmente

**Opção 2: JSON com informações úteis (Opcional)**
```json
{
  "service": "hirely",
  "version": "1.0",
  "language": "pt-BR",
  "context": "career_assistant"
}
```

**Opção 3: JSON mínimo (Opcional)**
```json
{
  "language": "pt-BR"
}
```

**Recomendação:** Use este JSON mínimo:
```json
{
  "language": "pt-BR",
  "context": "career_assistant"
}
```

---

## 📋 Passo a Passo para Preencher

### Passo 1: Aba "Settings"

1. Na tela do Custom Service, clique na aba **"Settings"**
2. Você verá três seções:
   - **Default filter**
   - **Metadata**
   - **Search display text**

### Passo 2: Preencher "Default filter"

**Recomendação:** Deixe vazio ou use:
```
{}
```

### Passo 3: Preencher "Metadata"

Cole este JSON:
```json
{
  "language": "pt-BR",
  "context": "career_assistant"
}
```

### Passo 4: Configurar "Search display text"

**Aba "No results found":**
```
Pesquisei minha base de conhecimento, mas não encontrei nada relacionado à sua consulta. Tente reformular sua pergunta ou pergunte sobre tags, biografia, experiência ou desenvolvimento profissional.
```

**Aba "Connectivity issue":**
```
Desculpe, não consegui acessar minha base de conhecimento no momento. Por favor, tente novamente em alguns instantes.
```

### Passo 5: Salvar

1. Após preencher os campos, o botão **"Save"** deve ficar ativo
2. Clique em **"Save"**
3. Aguarde a confirmação de salvamento
4. Clique em **"Close"**

---

## ⚠️ Importante

### Esses Campos NÃO Resolvem o Problema do Assistente

Os campos "Default filter" e "Metadata" são **opcionais** e não são a causa do problema do assistente responder apenas com ações predefinidas.

**O problema real é:**
- O **Conversational Search** não está habilitado
- O toggle "Conversational search" precisa estar **On** na seção "Base large language model (LLM)"

### O Que Realmente Precisa Ser Feito

1. ✅ Configurar Custom Service (já feito)
2. ✅ Preencher campos opcionais (você está fazendo agora)
3. ❌ **Habilitar Conversational Search** (ainda precisa fazer)

---

## 🔍 Como Habilitar Conversational Search

Após salvar o Custom Service:

1. Feche a janela do Custom Service
2. No menu lateral, clique no ícone do **diamante** (Environments)
3. Clique em **"Base large language model (LLM)"**
4. Role até **"Answer behavior"**
5. Encontre **"Conversational search"**
6. **Clique no toggle** para mudar de **Off** para **On**
7. **Salve** as alterações
8. **Publique** o assistente (se estiver no ambiente Live)

---

## 📝 Resumo dos Campos

| Campo | Obrigatório? | Recomendação |
|-------|--------------|--------------|
| Default filter | Não | Deixe vazio ou `{}` |
| Metadata | Não | `{"language": "pt-BR", "context": "career_assistant"}` |
| Search display text | Não | Configure mensagens em português |

---

## ✅ Checklist

- [ ] Preencheu "Default filter" (ou deixou vazio)
- [ ] Preencheu "Metadata" com JSON
- [ ] Configurou "Search display text"
- [ ] Clicou em "Save"
- [ ] Aguardou confirmação
- [ ] Habilitou "Conversational search" (próximo passo)

---

## 🎯 Próximos Passos

Após preencher e salvar:

1. ✅ Verificar se o Custom Service está salvo
2. ✅ Ir para "Base large language model (LLM)"
3. ✅ Habilitar "Conversational search"
4. ✅ Salvar e publicar
5. ✅ Testar no Preview

