# 🔴 Problema: Toggle Conversational Search Desabilitado

## ⚠️ Problema Identificado

O toggle "Conversational search" está **cinza/desabilitado** porque:

1. **Custom Service precisa estar configurado no ambiente Draft primeiro**
2. **Conversational Search precisa ser habilitado no Draft antes do Live**
3. O Watson não permite habilitar Conversational Search no Live sem antes configurar no Draft

## ✅ Solução: Configurar no Draft Primeiro

### Passo 1: Ir para o Ambiente Draft

1. No Watson Assistant, vá em **Environments**
2. Clique na aba **"Draft"** (não "Live")
3. Certifique-se de que está no ambiente Draft

### Passo 2: Configurar Custom Service no Draft

1. No ambiente Draft, vá em **Search** (ou **Extensions** > **Search**)
2. Clique em **"Add"** ou **"Custom service"**
3. Configure:
   - **URL**: `https://hirely-backend-gamma.vercel.app/api/watson-search/search`
   - **Authentication**: None
4. Clique em **"Save"**
5. Aguarde confirmação

### Passo 3: Habilitar Conversational Search no Draft

1. Ainda no ambiente **Draft**, vá em **Base large language model (LLM)**
2. Role até **"Answer behavior"** > **"Conversational search"**
3. **Agora o toggle deve estar habilitado** (não mais cinza)
4. **Mude para On**
5. **Salve**

### Passo 4: Testar no Preview (Draft)

1. Vá em **Preview** (ou teste no chat)
2. Faça uma pergunta: "Gostaria de ajuda com minha biografia"
3. Deve funcionar agora!

### Passo 5: Publicar para Live (Opcional)

Se quiser usar no ambiente Live:

1. Após testar no Draft e confirmar que funciona
2. Vá em **Environments** > **Live**
3. Configure o Custom Service no Live também
4. Habilite Conversational Search no Live
5. Ou publique o Draft para Live

## 🔍 Por Que Precisa Ser no Draft Primeiro?

O Watson Assistant requer que:
- Custom Service seja configurado no **Draft** primeiro
- Conversational Search seja habilitado no **Draft** primeiro
- Depois você pode configurar no **Live** ou publicar do Draft

## 📋 Checklist

- [ ] Está no ambiente **Draft** (não Live)
- [ ] Custom Service configurado no **Draft**
- [ ] Custom Service salvo e ativo no **Draft**
- [ ] Conversational Search habilitado no **Draft** (toggle On)
- [ ] Testado no Preview (funcionando)
- [ ] (Opcional) Configurado no Live ou publicado

## 🎯 Resumo

O problema é que você está tentando configurar no **Live**, mas precisa configurar no **Draft** primeiro.

**Solução:**
1. Vá para o ambiente **Draft**
2. Configure Custom Service no **Draft**
3. Habilite Conversational Search no **Draft**
4. Teste no Preview
5. Depois configure no Live (se necessário)

## ⚠️ Importante

- **Draft** = Ambiente de desenvolvimento/teste
- **Live** = Ambiente de produção
- Você **deve** configurar no Draft primeiro
- O toggle só fica habilitado após configurar Custom Service no Draft

