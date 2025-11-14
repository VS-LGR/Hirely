# 🔧 Fix: WATSON_ENVIRONMENT_ID Incorreto

## ❌ Problema

Erro: `Recurso não encontrado no Watson Assistant. Assistant ID atual: 9137a6e8-6cdd-4e83-a0ff-74bbfae87b54, Environment ID atual: 9137a6e8-6cdd-4e83-a0ff-74bbfae87b54`

**Causa**: O `WATSON_ENVIRONMENT_ID` está usando o mesmo valor do `WATSON_ASSISTANT_ID`, o que está **incorreto**.

## ✅ Solução

### Opção 1: Configurar o Draft Environment ID (Recomendado)

1. Acesse o **Watson Assistant Dashboard**
2. Vá em **Environments** > **Draft**
3. Copie o **Draft Environment ID** (exemplo: `6e5b65af-8047-49a6-a810-38981d420bbd`)
4. No **Vercel**, atualize a variável `WATSON_ENVIRONMENT_ID` com esse valor

### Opção 2: Deixar Vazio (Mais Simples)

1. No **Vercel**, **remova** a variável `WATSON_ENVIRONMENT_ID` ou deixe-a **vazia**
2. O código agora usa `null` quando não configurado
3. O Watson Assistant usará automaticamente o Environment padrão do Assistant

## 🔧 Mudanças no Código

O código foi atualizado para:

1. **Não usar `WATSON_ASSISTANT_ID` como fallback** para `WATSON_ENVIRONMENT_ID`
2. **Usar `null` quando `WATSON_ENVIRONMENT_ID` não estiver configurado**
3. **Passar `environmentId` apenas se estiver configurado** nas chamadas da API

## 📋 Checklist

- [ ] Verificar `WATSON_ENVIRONMENT_ID` no Vercel
- [ ] Se estiver usando o mesmo valor do `WATSON_ASSISTANT_ID`, **remover ou atualizar**
- [ ] Opção A: Configurar com o Draft Environment ID correto
- [ ] Opção B: Deixar vazio (recomendado se não souber o ID)
- [ ] Fazer redeploy do backend
- [ ] Testar o chat novamente

## 🎯 Recomendação

**Deixe `WATSON_ENVIRONMENT_ID` vazio** se você não souber o ID correto. O Watson Assistant usará automaticamente o Environment padrão, que geralmente funciona perfeitamente.

## 📝 Nota

O `WATSON_ENVIRONMENT_ID` é opcional. Se não estiver configurado, o Watson Assistant usa o Environment padrão do Assistant, que geralmente é o Draft ou Live dependendo da configuração.

