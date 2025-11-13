# 🔍 Troubleshooting: Erro "Token inválido"

## ⚠️ Problema

Erro ao fazer requisições autenticadas:
```
Error: Token inválido
statusCode: 401
path: '/api/users/profile'
```

## 🔍 Análise

O erro **NÃO** está relacionado à migração do JWT do Supabase. O backend usa seu próprio sistema de JWT com `JWT_SECRET`.

### Diferença Importante

- **JWT do Supabase**: Usado para autenticação do Supabase (Auth, Storage, etc.)
- **JWT do Backend**: Usado para autenticação da API Hirely (gerado pelo backend)

São sistemas **independentes**!

## 🔧 Possíveis Causas

### 1. `JWT_SECRET` Não Configurado ou Diferente

**Problema:** O `JWT_SECRET` usado para gerar o token é diferente do usado para verificar.

**Solução:**
1. Verifique se `JWT_SECRET` está configurado no Vercel
2. Certifique-se de que é o **mesmo valor** usado para gerar e verificar tokens
3. Se mudou o `JWT_SECRET`, todos os tokens antigos ficam inválidos (usuários precisam fazer login novamente)

### 2. Token Expirado

**Problema:** O token expirou (padrão: 7 dias).

**Solução:**
- Faça login novamente para obter um novo token

### 3. Token Malformado

**Problema:** O token não está sendo enviado corretamente.

**Verificar:**
- Header `Authorization: Bearer <token>` está presente?
- Token não está truncado ou corrompido?

### 4. Variável de Ambiente Não Carregada

**Problema:** `JWT_SECRET` não está disponível no ambiente de produção.

**Solução:**
1. Verifique no Vercel Dashboard > Settings > Environment Variables
2. Certifique-se de que `JWT_SECRET` está configurado
3. Faça redeploy após adicionar/alterar variáveis

## ✅ Solução Passo a Passo

### Passo 1: Verificar `JWT_SECRET` no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto **hirely-backend-gamma**
3. Vá em **Settings** > **Environment Variables**
4. Verifique se `JWT_SECRET` existe e tem um valor

**Se não existir:**
- Adicione `JWT_SECRET` com um valor seguro (ex: string aleatória longa)
- Exemplo: `JWT_SECRET=minha-chave-super-secreta-aleatoria-123456789`

**Se existir mas estiver vazio ou incorreto:**
- Atualize o valor
- ⚠️ **ATENÇÃO**: Ao mudar `JWT_SECRET`, todos os tokens existentes ficam inválidos!

### Passo 2: Verificar `JWT_EXPIRES_IN` (Opcional)

1. Verifique se `JWT_EXPIRES_IN` está configurado
2. Padrão: `7d` (7 dias)
3. Pode ser: `1h`, `24h`, `7d`, `30d`, etc.

### Passo 3: Fazer Redeploy

Após configurar/atualizar variáveis:

1. No Vercel, vá em **Deployments**
2. Clique nos três pontos (`...`) do último deployment
3. Selecione **Redeploy**
4. Aguarde o deploy completar

### Passo 4: Testar

1. Faça **logout** no frontend
2. Faça **login** novamente (isso gera um novo token)
3. Teste uma requisição autenticada

## 🐛 Debug

### Verificar Logs do Vercel

1. Acesse Vercel Dashboard > **Deployments** > Último deployment
2. Clique em **Functions** > `api/index.ts`
3. Veja os logs quando uma requisição autenticada é feita
4. Procure por:
   - `JWT_SECRET` está definido?
   - Erros de verificação de token?

### Adicionar Logs Temporários

Se quiser adicionar logs para debug (remover depois):

```typescript
// Em backend/src/middleware/auth.ts
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw createError('Token não fornecido', 401)
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    
    // Log temporário para debug
    console.log('JWT_SECRET exists:', !!JWT_SECRET)
    console.log('Token length:', token.length)
    console.log('Token preview:', token.substring(0, 20) + '...')
    
    const decoded = jwt.verify(token, JWT_SECRET)
    // ...
  }
}
```

## 📋 Checklist

- [ ] `JWT_SECRET` configurado no Vercel
- [ ] `JWT_SECRET` tem um valor válido (não vazio)
- [ ] `JWT_EXPIRES_IN` configurado (opcional, padrão: `7d`)
- [ ] Redeploy realizado após configurar variáveis
- [ ] Usuário fez login novamente após mudanças
- [ ] Token está sendo enviado no header `Authorization: Bearer <token>`

## ⚠️ Importante

### Sobre a Migração do JWT do Supabase

A migração do JWT do Supabase **NÃO afeta** os tokens JWT do backend Hirely. São sistemas independentes:

- **Supabase JWT**: Para autenticação do Supabase (Auth, Storage)
- **Hirely JWT**: Para autenticação da API Hirely (backend)

Você **não precisa** migrar o JWT do Supabase para resolver este erro.

### Quando Migrar o JWT do Supabase?

Migre apenas se:
- Você estiver usando Supabase Auth diretamente no frontend
- Você precisar de recursos avançados de JWT do Supabase
- O Supabase recomendar a migração

Para o backend Hirely, continue usando `JWT_SECRET` próprio.

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)

