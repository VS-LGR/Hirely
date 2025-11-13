# Checklist de Deploy - Hirely

Use este checklist para garantir que todos os passos foram concluídos antes e durante o deploy.

## ✅ Pré-Deploy

### Supabase
- [ ] Projeto criado no Supabase
- [ ] Credenciais anotadas (URL, Service Role Key, Database URL)
- [ ] Bucket `resumes` criado no Storage
- [ ] Políticas de acesso configuradas para o bucket
- [ ] Migrações executadas (via SQL Editor ou CLI)
- [ ] Tags populadas (seedTags executado)

### Código
- [ ] Todas as alterações commitadas
- [ ] Build do backend passa sem erros (`npm run build`)
- [ ] Build do frontend passa sem erros (`npm run build`)
- [ ] Testes locais funcionando

### Variáveis de Ambiente
- [ ] Backend `.env` configurado localmente (para testes)
- [ ] Frontend `.env.local` configurado localmente (para testes)
- [ ] Lista de variáveis necessárias documentada

## 🚀 Deploy Backend (Vercel)

- [ ] Projeto criado no Vercel Dashboard
- [ ] Repositório GitHub conectado
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: (vazio)
- [ ] Variáveis de ambiente configuradas:
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRES_IN`
  - [ ] `CORS_ORIGIN` (será atualizado após deploy do frontend)
  - [ ] `OPENAI_API_KEY` (se usar OpenAI)
  - [ ] Variáveis do Watson (se usar Watson)
- [ ] Deploy executado
- [ ] URL do backend anotada: `https://________.vercel.app`
- [ ] Health check funcionando: `/health` retorna `{"status":"ok"}`
- [ ] Logs verificados (sem erros críticos)

## 🎨 Deploy Frontend (Vercel)

- [ ] Projeto criado no Vercel Dashboard
- [ ] Repositório GitHub conectado
- [ ] Root Directory: `frontend`
- [ ] Framework Preset: Next.js (detectado automaticamente)
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NEXT_PUBLIC_API_URL` (URL do backend)
- [ ] Deploy executado
- [ ] URL do frontend anotada: `https://________.vercel.app`
- [ ] Site carrega sem erros no console

## 🔗 Pós-Deploy

- [ ] `CORS_ORIGIN` atualizado no backend com URL do frontend
- [ ] Redeploy do backend executado (ou aguardado automático)
- [ ] Teste de login no frontend
- [ ] Teste de registro de usuário
- [ ] Teste de criação de vaga (recrutador)
- [ ] Teste de upload de currículo (candidato)
- [ ] Teste de busca de vagas
- [ ] Teste de aplicação a vaga

## 🤖 Watson Assistant (Opcional)

- [ ] Custom Service configurado no Watson
- [ ] Service URL: `https://seu-backend.vercel.app/api/watson-search/search`
- [ ] Conversational search habilitado
- [ ] Teste de chat com assistente

## 📊 Verificação Final

- [ ] Logs do Vercel sem erros
- [ ] Logs do Supabase sem erros
- [ ] Performance aceitável
- [ ] Todas as funcionalidades principais testadas
- [ ] Domínio customizado configurado (opcional)

## 🐛 Troubleshooting

Se algo não funcionar:

1. **Backend não inicia**
   - Verifique logs no Vercel
   - Verifique variáveis de ambiente
   - Teste build local: `npm run build`

2. **Erro de conexão com banco**
   - Verifique `DATABASE_URL` (senha codificada corretamente)
   - Teste conexão localmente
   - Verifique se Supabase está acessível

3. **Erro de CORS**
   - Verifique `CORS_ORIGIN` no backend
   - Certifique-se de que não tem `/api` no final
   - Verifique se frontend e backend estão no mesmo domínio ou CORS configurado

4. **Upload de arquivo falha**
   - Verifique se bucket `resumes` existe
   - Verifique `SUPABASE_SERVICE_ROLE_KEY`
   - Verifique políticas de acesso do bucket

5. **Frontend não carrega**
   - Verifique console do navegador
   - Verifique `NEXT_PUBLIC_API_URL`
   - Verifique logs do Vercel

## 📝 Notas

- URLs de produção:
  - Frontend: `https://________.vercel.app`
  - Backend: `https://________.vercel.app`
  - Supabase: `https://________.supabase.co`

- Limites do plano gratuito:
  - Vercel: 100GB bandwidth/mês, 100 execuções serverless/dia
  - Supabase: 500MB database, 1GB storage, 2GB bandwidth/mês

