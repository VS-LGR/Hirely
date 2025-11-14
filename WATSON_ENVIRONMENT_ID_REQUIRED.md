# 🔧 Fix: environmentId é Obrigatório no Watson Assistant

## ❌ Problema

Erro: `Parameter validation errors: Missing required parameters: environmentId`

**Causa**: A API do Watson Assistant v2 **requer** o parâmetro `environmentId` em todas as chamadas. Não é opcional.

## ✅ Solução

O código foi atualizado para **sempre passar o `environmentId`**. Se `WATSON_ENVIRONMENT_ID` não estiver configurado, o código usa `WATSON_ASSISTANT_ID` como fallback.

### Configuração no Vercel

Você tem **duas opções**:

#### Opção 1: Configurar WATSON_ENVIRONMENT_ID (Recomendado)

1. Acesse o **Watson Assistant Dashboard**
2. Vá em **Environments** > **Draft**
3. Copie o **Draft Environment ID** (exemplo: `6e5b65af-8047-49a6-a810-38981d420bbd`)
4. No **Vercel**, configure a variável:
   - **Nome**: `WATSON_ENVIRONMENT_ID`
   - **Valor**: `6e5b65af-8047-49a6-a810-38981d420bbd` (seu Draft Environment ID)

#### Opção 2: Deixar Vazio (Usa Assistant ID como Fallback)

1. No **Vercel**, **remova** a variável `WATSON_ENVIRONMENT_ID` ou deixe-a **vazia**
2. O código automaticamente usará `` como `environmentId`
3. **Isso funciona na maioria dos casos**, especialmente se você está usando o ambiente padrão

## 🔧 Mudanças no Código

O código foi atualizado para:

1. **Sempre passar `environmentId`** nas chamadas da API
2. **Usar `WATSON_ASSISTANT_ID` como fallback** se `WATSON_ENVIRONMENT_ID` não estiver configurado
3. **Lancar erro claro** se nenhum dos dois estiver configurado

## 📋 Checklist

- [ ] Verificar se `WATSON_ASSISTANT_ID` está configurado no Vercel
- [ ] Opção A: Configurar `WATSON_ENVIRONMENT_ID` com o Draft Environment ID
- [ ] Opção B: Deixar `WATSON_ENVIRONMENT_ID` vazio (usa Assistant ID como fallback)
- [ ] Fazer redeploy do backend
- [ ] Testar o chat novamente

## 🎯 Recomendação

**Para desenvolvimento/teste**: Use o **Draft Environment ID** (`6e5b65af-8047-49a6-a810-38981d420bbd`)

**Para produção**: Use o **Live Environment ID** ou deixe vazio para usar o padrão.

## 📝 Nota Importante

A API do Watson Assistant v2 **sempre requer** o `environmentId`. Não é possível omitir esse parâmetro. O código agora garante que ele sempre seja passado, usando o `assistantId` como fallback se necessário.

