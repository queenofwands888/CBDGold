#!/bin/bash

# CBD Gold ShopFi AlgoKit Deployment Script
# This script helps you set up and deploy your CBD Gold application

echo "🌿 CBD Gold ShopFi - AlgoKit Setup 🌿"
echo "====================================="

# Check if AlgoKit is installed
if ! command -v algokit &> /dev/null; then
    echo "❌ AlgoKit not found. Installing..."
    pip install algokit
else
    echo "✅ AlgoKit found"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
else
    echo "✅ Docker is running"
fi

# Create project directory
PROJECT_NAME="cbdgold-shopfi"
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  Project directory already exists. Remove it? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
    else
        echo "Exiting..."
        exit 1
    fi
fi

echo "📁 Creating project structure..."
mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"


# Initialize AlgoKit project
echo "🚀 Initializing AlgoKit project..."
algokit init --name cbdgold-shopfi --template-url https://github.com/algorandfoundation/algokit-fullstack-template

# Navigate to project (the template creates the project in the current directory)
# No need to cd again

echo "📦 Installing dependencies..."
# Install project dependencies
algokit project bootstrap all

echo "🔧 Setting up smart contracts..."
# Create smart contract files
mkdir -p projects/cbdgold-contracts/smart_contracts/cbdgold
mkdir -p projects/cbdgold-contracts/smart_contracts/staking
mkdir -p projects/cbdgold-contracts/smart_contracts/shop
mkdir -p projects/cbdgold-contracts/smart_contracts/governance

# Create basic contract structure files
cat > projects/cbdgold-contracts/smart_contracts/staking/contract.py << 'EOF'
# Paste the staking contract code here
from algopy import ARC4Contract, GlobalState, LocalState
# ... (copy from the staking contract artifact)
EOF

echo "🌐 Setup complete!"
