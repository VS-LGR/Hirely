# 🔧 Fix: Erro "Resource not found" no Watson Assistant

## ❌ Problema

Erro ao usar o chat: `❌ Erro no Watson Assistant: Resource not found`

Este erro indica que o `WATSON_ASSISTANT_ID` ou `WATSON_ENVIRONMENT_ID` está incorreto ou não existe no Watson Assistant.

## ✅ Solução

### 1. Verificar IDs no Vercel

Acesse o Vercel Dashboard > Seu Projeto > Settings > Environment Variables e verifique:

- **`WATSON_ASSISTANT_ID`**: Deve ser o **Assistant ID** (não o Instance ID)
  - ✅ Correto: `9137a6e8-6cdd-4e83-a0ff-74bbfae87b54`
  - ❌ Incorreto: `3b2bff8b-111f-4419-b229-8b0d9c3b89b2` (Instance ID)

- **`WATSON_ENVIRONMENT_ID`**: Deve ser o **Environment ID** (Draft ou Live)
  - ✅ Draft: `6e5b65af-8047-49a6-a810-38981d420bbd`
  - ✅ Ou deixe vazio (o código usa `WATSON_ASSISTANT_ID` como fallback)

### 2. Como Obter os IDs Corretos

#### Assistant ID:
1. Acesse o Watson Assistant Dashboard
2. Clique no seu Assistant
3. Vá em **Settings** > **Assistant IDs and API details**
4. Copie o **Assistant ID** (não o Instance ID)

#### Environment ID (Opcional):
1. No mesmo lugar, role até **Environments**
2. Copie o **Draft Environment ID** ou **Live Environment ID**
3. Ou deixe vazio (o código usa o Assistant ID como fallback)

### 3. Atualizar no Vercel

1. Vá em **Vercel Dashboard** > Seu Projeto > **Settings** > **Environment Variables**
2. Edite `WATSON_ASSISTANT_ID` com o valor correto
3. Edite `WATSON_ENVIRONMENT_ID` (ou deixe vazio)
4. **Salve**
5. **Faça redeploy** do backend

### 4. Verificar Logs

Após o redeploy, verifique os logs do Vercel. Você deve ver:

```
✅ Watson Assistant inicializado {
  assistantId: '9137a6e8-6cdd-4e83-a0ff-74bbfae87b54',
  environmentId: '6e5b65af-8047-49a6-a810-38981d420bbd',
  hasEnvironmentId: true
}
```

Se aparecer `assistantId: null` ou `environmentId: null`, as variáveis não estão configuradas corretamente.

## 🔍 Melhorias Implementadas

### 1. Tratamento de Erro Melhorado

O código agora detecta especificamente o erro "Resource not found" e fornece uma mensagem mais clara:

```typescript
if (
  error.message?.includes('Resource not found') ||
  error.status === 404 ||
  error.statusCode === 404
) {
  throw new Error(
    'Recurso não encontrado no Watson Assistant. ' +
    'Verifique se WATSON_ASSISTANT_ID e WATSON_ENVIRONMENT_ID estão corretos no Vercel. ' +
    `Assistant ID atual: ${this.assistantId || 'não configurado'}, ` +
    `Environment ID atual: ${this.environmentId || 'não configurado'}`
  )
}
```

### 2. Logs Detalhados

O código agora loga os IDs usados na inicialização e em caso de erro:

```typescript
console.log('✅ Watson Assistant inicializado', {
  assistantId: this.assistantId,
  environmentId: this.environmentId,
  hasEnvironmentId: !!process.env.WATSON_ENVIRONMENT_ID,
})
```

## 📋 Checklist

- [ ] Verificar `WATSON_ASSISTANT_ID` no Vercel (deve ser o Assistant ID, não Instance ID)
- [ ] Verificar `WATSON_ENVIRONMENT_ID` no Vercel (ou deixar vazio)
- [ ] Fazer redeploy do backend no Vercel
- [ ] Verificar logs do Vercel para confirmar inicialização
- [ ] Testar o chat no frontend

## 🐛 Outros Problemas Relacionados

### Tags Não Sendo Aplicadas

**Problema:** Tags sugeridas não estão sendo encontradas no banco de dados.

**Solução:** Melhorei a busca de tags para:
- Normalizar strings (remover acentos, espaços extras)
- Buscar correspondências parciais (palavras-chave)
- Buscar por categoria como fallback

### Erro 500 no Chat

**Problema:** Endpoint `/api/ai/chat` retorna 500.

**Solução:** O erro agora é tratado e retorna uma mensagem mais clara. Verifique os logs do Vercel para ver o erro específico.

## 📝 Próximos Passos

1. Atualize os IDs no Vercel
2. Faça redeploy
3. Teste o chat
4. Se ainda houver erro, verifique os logs do Vercel para mais detalhes

