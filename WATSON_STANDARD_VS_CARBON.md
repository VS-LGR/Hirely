# 🔍 Standard vs Carbon for AI - Impacto no Conversational Search

## 📋 O Que São Essas Opções?

### Standard
- **Para:** Agentes virtuais e experiências de suporte ao cliente
- **Uso:** Aplicações públicas, chatbots de atendimento
- **Interface:** Tema padrão do Watson Assistant

### Carbon for AI
- **Para:** Uso em produtos internos da IBM
- **Uso:** Aplicações internas da IBM
- **Interface:** Tema Carbon Design System da IBM

## ❓ Isso Afeta o Conversational Search?

**Resposta curta: NÃO diretamente.**

Essas opções são sobre o **tema visual** e **estilo da interface do chat**, não sobre o funcionamento do Conversational Search.

### O Que Realmente Afeta o Conversational Search:

1. ✅ **Actions configuradas** (prioridade sobre Conversational Search)
2. ✅ **Conversational Search toggle** (deve estar On)
3. ✅ **Custom Service configurado** (URL correta)
4. ✅ **Formato da resposta** (search_results correto)

### O Que NÃO Afeta:

- ❌ Standard vs Carbon for AI (apenas tema visual)
- ❌ Cores do chat
- ❌ Nome do assistente
- ❌ Avatar

## 🎯 Recomendação

**Mantenha "Standard"** - é a opção correta para seu caso de uso (Hirely é uma aplicação pública de recrutamento).

## ✅ O Que Realmente Precisa Ser Feito

O problema do Conversational Search não funcionar **NÃO** está relacionado a Standard vs Carbon. O problema é:

1. **Actions interceptando** - Remova todas as Actions
2. **Conversational Search desabilitado** - Habilite o toggle
3. **Ordem de resolução** - Verifique se Default behavior vem antes de Actions

## 📋 Checklist Real

- [ ] Remover todas as Actions
- [ ] Habilitar Conversational Search (toggle On)
- [ ] Verificar Custom Service configurado
- [ ] Testar no Preview
- [ ] **NÃO** precisa mudar Standard/Carbon

## 🔍 Como Verificar se Está Funcionando

1. Vá em **Preview** (ou teste no chat)
2. Faça uma pergunta: "Gostaria de ajuda com minha biografia"
3. **Se funcionar:** Resposta dinâmica gerada pelo LLM
4. **Se não funcionar:** "Acho que não entendi. Reformule sua pergunta"

## ⚠️ Importante

A opção **Standard vs Carbon** é apenas sobre **aparência visual**. Não afeta:
- Funcionalidade do Conversational Search
- Chamadas ao Custom Service
- Geração de respostas pelo LLM

## 🎯 Foco no Que Importa

Em vez de mudar Standard/Carbon, foque em:

1. ✅ **Remover Actions** (isso é o mais importante!)
2. ✅ **Habilitar Conversational Search**
3. ✅ **Verificar Custom Service**

Essas são as causas reais do problema.

