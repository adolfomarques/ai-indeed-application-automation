#!/bin/bash
# =============================================================================
# JobPilot AI / JobSpy — Script de Deploy Automatizado
# =============================================================================
# Uso:
#   npm run deploy               -> Valida build local, comita e sobe para GitHub (Vercel auto-deploy)
#   npm run deploy -- --tag      -> Cria e sobe também uma git tag de versão
#   npm run deploy -- --cli      -> Executa deploy direto via CLI da Vercel (npx vercel --prod)
# =============================================================================

set -e

REPO_URL="https://github.com/adolfomarques/ai-indeed-application-automation"
VERCEL_URL="https://jobspy-automation.vercel.app"

echo ""
echo "🚀 ========================================================="
echo "    JobPilot AI — Pipeline de Deploy para Vercel"
echo "========================================================="
echo "📅 Data: $(date)"
echo "🌐 URL Produção: $VERCEL_URL"
echo "📦 Repositório:  $REPO_URL"
echo ""

# 1. Verificar branch atual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Você está na branch '$CURRENT_BRANCH'. Recomendamos fazer deploy a partir da 'main'."
    read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Deploy cancelado."
        exit 1
    fi
fi

# 2. Verificar se há alterações não comitadas
if ! git diff-index --quiet HEAD --; then
    echo "📝 Alterações pendentes detectadas no Git."
    echo ""
    git status -s
    echo ""
    read -p "Deseja comitar todas as alterações agora? (S/n): " COMMIT_CONFIRM
    if [[ ! $COMMIT_CONFIRM =~ ^[Nn]$ ]]; then
        read -p "Mensagem do commit (pressione ENTER para mensagem padrão): " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="chore: release updates $(date +'%Y-%m-%d %H:%M')"
        fi
        git add -A
        git commit -m "$COMMIT_MSG"
        echo "✅ Alterações comitadas com sucesso!"
    else
        echo "⚠️  Continuando sem comitar alterações locais..."
    fi
fi

# 3. Teste de compilação local (evita quebrar produção)
echo ""
echo "🔍 Validando compilação de produção localmente (npm run build)..."
if npm run build; then
    echo "✅ Build local passou com sucesso!"
else
    echo "❌ O build falhou localmente. Corrija os erros acima antes de fazer o deploy."
    exit 1
fi

# 4. Enviar código para o GitHub (Dispara o Deploy Automático na Vercel)
echo ""
echo "📤 Enviando commits para o GitHub (origin $CURRENT_BRANCH)..."
git push origin "$CURRENT_BRANCH"
echo "✅ Código enviado para o GitHub!"
echo "⚡ A Vercel iniciou o build e deploy automaticamente."

# 5. Criar Tag de Versão (opcional via argumento --tag)
if [[ "$*" == *"--tag"* ]]; then
    TAG_NAME="v$(date +'%Y.%m.%d-%H%M')"
    echo ""
    echo "🏷️  Criando tag de versão: $TAG_NAME"
    git tag -a "$TAG_NAME" -m "Deploy automático: $TAG_NAME"
    git push origin "$TAG_NAME"
    echo "✅ Tag $TAG_NAME enviada para o GitHub!"
fi

# 6. Deploy via Vercel CLI (se solicitado via --cli ou --prod)
if [[ "$*" == *"--cli"* ]] || [[ "$*" == *"--prod"* ]]; then
    echo ""
    echo "⚡ Executando deploy direto via Vercel CLI..."
    npx vercel --prod --yes
    echo "✅ Deploy via Vercel CLI finalizado!"
fi

# 7. Verificação de Saúde (Health Check)
echo ""
echo "🩺 Verificando resposta da URL de produção em $VERCEL_URL..."
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Aplicação respondendo com sucesso (HTTP $HTTP_STATUS)!"
else
    echo "ℹ️  Status retornado: HTTP $HTTP_STATUS (o deploy na Vercel pode levar 30-60s para concluir)."
fi

echo ""
echo "========================================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "👉 Acesse sua aplicação em: $VERCEL_URL"
echo "📊 Acompanhe os logs na Vercel: https://vercel.com/dashboard"
echo "========================================================="
echo ""
