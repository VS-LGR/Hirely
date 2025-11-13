# Correção do Erro de Deploy do Frontend

## Problema

Erro no deploy:
```
⨯ Invalid project directory provided, no such directory: /vercel/path0/frontend/run
Error: Command "next run build" exited with 1
```

## Causa

O **Root Directory** não está configurado corretamente no projeto da Vercel, fazendo com que a Vercel tente fazer build na raiz do repositório em vez da pasta `frontend`.

## Solução

### Opção 1: Configurar no Dashboard da Vercel (Recomendado)

1. Acesse o projeto do frontend no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** > **General**
3. Role até encontrar **Root Directory**
4. Clique em **Edit**
5. Digite: `frontend`
6. Clique em **Save**
7. Vá em **Deployments** e faça um novo deploy (ou aguarde o redeploy automático)

### Opção 2: Recriar o Projeto

Se a Opção 1 não funcionar:

1. No Vercel Dashboard, vá em **Settings** > **General**
2. Role até o final e clique em **Delete Project** (ou simplesmente crie um novo projeto)
3. Clique em **Add New** > **Project**
4. Importe o repositório
5. **ANTES de clicar em Deploy**, configure:
   - Clique em **"Configure Project"** ou **"Edit"**
   - Em **Root Directory**, selecione **"Edit"** e digite: `frontend`
   - Deixe os outros campos como padrão (Next.js será detectado automaticamente)
6. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL=https://seu-backend.vercel.app`
7. Clique em **Deploy**

## Verificação

Após o deploy, verifique:

1. O build deve mostrar: `Running "next build"` (não `next run build`)
2. O build deve completar com sucesso
3. O site deve estar acessível na URL fornecida

## Arquivos de Configuração

O arquivo `frontend/vercel.json` já está criado com a configuração correta:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

Mas o **Root Directory** ainda precisa ser configurado no dashboard da Vercel, pois ele não pode ser definido apenas no `vercel.json` quando o projeto está na raiz do repositório.

## Nota sobre NODE_ENV

Se você ver o aviso:
```
⚠ You are using a non-standard "NODE_ENV" value in your environment
```

Isso geralmente não é um problema crítico, mas você pode remover a variável `NODE_ENV` das configurações do projeto se não for necessária. A Vercel define automaticamente `NODE_ENV=production` durante o build.

