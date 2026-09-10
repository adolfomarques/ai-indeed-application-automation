# 🚀 Guia Oficial de Deploy — JobPilot AI / JobSpy

Este documento contém o fluxo completo, organizado e padronizado para manter a aplicação atualizada, segura e publicada na **Vercel** através do **GitHub**.

---

## 📌 Informações do Projeto

* **URL de Produção:** [https://jobspy-automation.vercel.app](https://jobspy-automation.vercel.app)
* **Repositório Oficial (origin):** `https://github.com/adolfomarques/ai-indeed-application-automation.git`
* **Repositório Base (upstream):** `https://github.com/alpharomercoma/ai-indeed-application-automation.git`
* **Branch de Produção:** `main`
* **Provedor de Hospedagem:** Vercel (Next.js 16 + Serverless Functions + Crons)

---

## ⚡ Comandos Rápidos

Adicionamos atalhos prontos no `package.json` para facilitar o fluxo:

| Comando | O que faz |
| :--- | :--- |
| `npm run deploy` | **(Recomendado)** Valida o build local, comita pendências e faz `git push origin main` disparando o deploy automático na Vercel. |
| `npm run deploy:tag` | Executa o deploy e cria automaticamente uma tag Git com data/hora para backup e versionamento. |
| `npm run deploy:prod` | Executa deploy direto em produção usando a CLI da Vercel (`npx vercel --prod`). |
| `npm run deploy:link` | Vincula esta pasta local ao projeto existente na Vercel (`jobspy-automation`). |

---

## 🔄 Como Funciona o Deploy Automático

1. Você faz alterações no código localmente.
2. Ao rodar `npm run deploy`, o script valida se `npm run build` passa sem erros (evitando quebrar a produção).
3. O script envia o commit para a branch `main` do seu repositório no GitHub (`adolfomarques/ai-indeed-application-automation`).
4. A **Vercel detecta o push e inicia a compilação e deploy em menos de 1 minuto**.

---

## 🔑 Variáveis de Ambiente na Vercel

Para que todas as funções funcionem 100% no ar, as variáveis abaixo devem estar cadastradas no painel da Vercel:
👉 **Acesse:** [Vercel Dashboard](https://vercel.com/dashboard) → Selecione `jobspy-automation` → **Settings** → **Environment Variables**

| Variável | Obrigatória? | Descrição |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **SIM** | Chave da Google Gemini API. **Sem ela, o cron diário das 9h falha com erro 500**. |
| `NEXTAUTH_SECRET` | **SIM** | Chave secreta para criptografia de sessões de login (gere com `openssl rand -base64 32`). |
| `NEXTAUTH_URL` | **SIM** | `https://jobspy-automation.vercel.app` |
| `GOOGLE_CLIENT_ID` | Recomendada | Client ID do Google Cloud Console para login com conta Google. |
| `GOOGLE_CLIENT_SECRET` | Recomendada | Client Secret do Google Cloud Console. |
| `KV_REST_API_URL` | Recomendada | URL do Vercel KV / Upstash Redis para salvar vagas e agendamentos na nuvem. |
| `KV_REST_API_TOKEN` | Recomendada | Token do Vercel KV / Upstash Redis. |
| `QSTASH_TOKEN` | Opcional | Token do Upstash QStash (para disparos de agendamentos complexos). |
| `GROQ_API_KEY` | Opcional | Chave da Groq para filtragem ultrarrápida usando o modelo `openai/gpt-oss-20b`. |
| `BROWSER_USE_API_KEY` | Opcional | Chave da plataforma Browser-Use para submissão automatizada de formulários. |
| `BROWSER_PROFILE_ID` | Opcional | ID do perfil no Browser-Use com cookies salvos do Indeed/LinkedIn. |
| `CRON_SECRET` | Opcional | Token secreto para proteger o endpoint `/api/cron` contra chamadas anônimas. |

> [!IMPORTANT]
> **Correção do Erro 500 no Cron:**
> Se o endpoint `https://jobspy-automation.vercel.app/api/cron` estiver retornando `GEMINI_API_KEY environment variable is not set`, basta adicionar a variável `GEMINI_API_KEY` nas configurações da Vercel e disparar um **Redeploy**.

---

## 💻 Vinculando a CLI da Vercel Localmente

Se quiser gerenciar o deploy ou ver logs diretamente pelo terminal local:

1. **Autentique seu usuário no terminal:**
   ```bash
   npx vercel login
   ```
   *(Abra o link gerado no navegador e confirme a autorização)*

2. **Vincule o projeto da pasta:**
   ```bash
   npm run deploy:link
   ```
   * Responda:
     * *Set up “~/Downloads/JobSpy”?* → `y`
     * *Which scope?* → Seu usuário Vercel
     * *Link to existing project?* → `y`
     * *What’s the name of the existing project?* → `jobspy-automation`

3. Pronto! Agora você pode ver logs ao vivo com:
   ```bash
   npx vercel logs jobspy-automation.vercel.app
   ```

---

## ⏪ Como Fazer Rollback (Reverter uma Versão)

Se um deploy introduzir um bug em produção, você pode voltar rapidamente para a versão anterior:

### Método 1: Pelo Painel da Vercel (Instantâneo - 1 clique)
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard).
2. Clique no projeto `jobspy-automation` → Aba **Deployments**.
3. Localize o deployment anterior que estava estável.
4. Clique nos três pontinhos `...` e selecione **Promote to Production**.

### Método 2: Pelo Git (Reversão de Commit)
```bash
git revert HEAD
git push origin main
```
A Vercel fará o deploy automático do estado anterior.

---

## 📋 Checklist Pré-Deploy

Antes de subir grandes alterações:
- [ ] Rodou `npm run build` localmente para confirmar ausência de erros de build.
- [ ] Configurou novas variáveis de ambiente necessárias no painel da Vercel.
- [ ] Testou se as rotas críticas respondem localmente em `http://localhost:3000`.
- [ ] Executou `npm run deploy`.
