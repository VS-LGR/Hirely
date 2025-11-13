# Configuração Final - Watson Assistant Conversational Search

## ✅ Status Atual

- ✅ Endpoint funcionando: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- ✅ Retorna resultados corretamente
- ✅ Custom Service configurado
- ⚠️ Conversational Search ainda não habilitado (por isso só responde com Actions)

## 🔧 Passo a Passo Completo

### Passo 1: Configurar Custom Service (Você já fez isso!)

**URL no Custom Service:**
```
https://hirely-backend-gamma.vercel.app/api/watson-search/search
```

**Campos na aba "Settings":**

1. **Default filter:**
   - Pode deixar **VAZIO** ou colocar: `{}`
   - Este campo é opcional

2. **Metadata:**
   - Pode deixar **VAZIO**
   - Ou colocar (opcional):
   ```json
   {
     "source": "hirely",
     "version": "1.0"
   }
   ```

3. **Search display text:**
   - **"No results found"**: "Pesquisei minha base de conhecimento, mas não encontrei nada relacionado à sua consulta. Como posso ajudá-lo de outra forma?"
   - **"Connectivity issue"**: "Não consegui acessar minha base de conhecimento no momento. Tente novamente em instantes."

**Campos na aba "Instance":**

1. **Service type:**
   - Selecione: **"By providing credentials"** (já está selecionado)

2. **URL:**
   - `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - ✅ Esta é a URL correta!

3. **Authentication type:**
   - Selecione: **"None"** (já está selecionado)

### Passo 2: Salvar o Custom Service

**IMPORTANTE:** O botão "Save" pode estar desabilitado se:
- A URL não está preenchida (mas você já preencheu)
- Há algum erro de validação

**Para habilitar o Save:**

1. Verifique se a URL está correta (com `https://`)
2. Clique fora do campo URL e depois dentro novamente
3. Tente recarregar a página (F5)
4. Se ainda não funcionar, tente:
   - Limpar o campo URL
   - Colar novamente: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - Pressionar Enter no campo
   - Verificar se o botão "Save" fica habilitado

**Após salvar:**
- Você deve ver uma mensagem de sucesso
- O Custom Service deve aparecer como "Active" ou "Connected"

### Passo 3: Habilitar Conversational Search

**Este é o passo CRUCIAL que está faltando!**

1. **Feche** a janela do Custom Service (botão "Close")

2. No menu lateral esquerdo, clique no ícone do **diamante** (ou vá em **Environments**)

3. Clique em **"Base large language model (LLM)"**

4. Role até a seção **"Answer behavior"**

5. Encontre **"Conversational search"**

6. **Clique no toggle** para mudar de **Off** para **On**

7. Se aparecer um aviso:
   - Agora que o Custom Service está salvo, deve permitir habilitar
   - Se ainda pedir para configurar, volte e verifique se o Custom Service foi salvo

8. **Salve** todas as alterações

9. **Publique** o assistente (Deploy/Publish)

### Passo 4: Testar

1. Clique em **"Preview"** no Watson Assistant
2. Faça perguntas como:
   - "Como posso melhorar meu perfil?"
   - "Quais tags devo adicionar?"
   - "Me ajude com minha biografia"

**✅ Funcionando corretamente:**
- Respostas variam e são contextualizadas
- Não repete sempre a mesma coisa
- Respostas são geradas dinamicamente

**❌ Ainda não funciona:**
- Respostas sempre iguais
- Apenas Actions predefinidas
- Repete infinitamente

## 🐛 Se o Botão "Save" Não Habilitar

### Solução 1: Verificar URL
- Certifique-se de que começa com `https://`
- Certifique-se de que não tem espaços no início/fim
- Tente copiar e colar novamente

### Solução 2: Verificar Campos Obrigatórios
- URL é obrigatória ✅ (você já tem)
- Authentication pode ser "None" ✅ (já está)
- Default filter e Metadata são opcionais ✅ (podem ficar vazios)

### Solução 3: Recarregar e Tentar Novamente
1. Recarregue a página (F5)
2. Configure novamente
3. Tente salvar

### Solução 4: Verificar no Console do Navegador
1. Pressione F12 para abrir DevTools
2. Vá na aba "Console"
3. Tente salvar e veja se há erros

## 📋 Checklist Final

- [ ] Custom Service URL configurada: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
- [ ] Authentication: None
- [ ] Botão "Save" habilitado e clicado
- [ ] Custom Service salvo com sucesso
- [ ] Conversational Search toggle mudado para **On**
- [ ] Assistente publicado (Deploy)
- [ ] Testado no Preview

## 🔍 Verificar se Está Funcionando

### Teste 1: Endpoint
Acesse: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`

Deve retornar JSON (você já confirmou que funciona ✅)

### Teste 2: Conversational Search Habilitado
No Watson Assistant:
- Vá em **Base LLM** > **Answer behavior**
- O toggle "Conversational search" deve estar **On** (verde/azul)

### Teste 3: Preview
- Faça perguntas variadas
- Respostas devem variar e ser contextualizadas
- Não deve repetir sempre a mesma coisa

## ⚠️ Problema Principal

O Watson está repetindo Actions predefinidas porque:
- ❌ Conversational Search está **Off**
- ✅ Custom Service está configurado (mas não é suficiente sozinho)

**Solução:** Habilitar o Conversational Search toggle!

## 📝 Notas Importantes

1. **Custom Service é opcional** mas ajuda a melhorar respostas
2. **Conversational Search é obrigatório** para usar o LLM base
3. **Ambos precisam estar configurados** para funcionar completamente
4. **O assistente precisa ser publicado** após as mudanças

## 🎯 Resumo Rápido

1. ✅ URL está correta
2. ✅ Campos podem ficar vazios (Default filter e Metadata)
3. ⚠️ **Salve o Custom Service** (botão Save deve estar habilitado)
4. ⚠️ **Habilite Conversational Search** (toggle On)
5. ⚠️ **Publique o assistente**

O problema principal é que o Conversational Search ainda não foi habilitado!

