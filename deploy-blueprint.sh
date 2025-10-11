#!/usr/bin/env bash
set -euo pipefail

# CBDGold Blueprint Deploy via Render CLI
# This creates new services from render.yaml instead of using existing Docker services

REPO="queenofwands888/CBDGold"
BRANCH="main"
BLUEPRINT_NAME="cbdgold-blueprint-$(date +%s)"

echo "🚀 Deploying CBDGold via Render Blueprint..."
echo "Repository: $REPO"
echo "Branch: $BRANCH" 
echo "Blueprint Name: $BLUEPRINT_NAME"
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Install it first:"
    echo "npm install -g @render-com/cli"
    echo "or"
    echo "curl -fsSL https://cli.render.com/install | sh"
    exit 1
fi

# Check if authenticated
if ! render whoami &> /dev/null; then
    echo "❌ Not authenticated with Render CLI. Run:"
    echo "render login"
    exit 1
fi

echo "✅ Render CLI found and authenticated"
echo ""

# Deploy blueprint
echo "📦 Creating blueprint deployment..."
render blueprint deploy \
    --repository "$REPO" \
    --branch "$BRANCH" \
    --name "$BLUEPRINT_NAME" \
    --auto-approve

echo ""
echo "✅ Blueprint deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check the Render dashboard for deployment progress"
echo "2. Once services are live, update DNS/custom domains if needed"
echo "3. Disable or delete old Docker-based services to avoid confusion"
echo "4. Test frontend and backend URLs"
echo ""
echo "🔗 Services will build using:"
echo "  Backend: npm install (in projects/CBDGold/backend)"
echo "  Frontend: npm install && npm run build (in projects/CBDGold)"