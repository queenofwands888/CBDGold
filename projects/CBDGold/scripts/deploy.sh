#!/bin/bash

# CBD Gold Smart Contract Deployment Script
# This script sets up the environment and deploys contracts to Algorand TestNet

set -e  # Exit on any error

echo "🌟 CBD Gold Smart Contract Deployment"
echo "====================================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "contracts" ]]; then
    echo "❌ Error: Not in CBD Gold project root directory"
    echo "   Expected to find package.json and contracts/ directory"
    exit 1
fi

echo "✅ Found CBD Gold project files"

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    echo "   Please install Python 3.8 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "🐍 Python version: $PYTHON_VERSION"

# Check if virtual environment exists, create if not
if [[ ! -d ".venv" ]]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source .venv/bin/activate

# Check and install required Python packages
echo "📋 Checking Python dependencies..."

# Required packages for deployment
REQUIRED_PACKAGES=(
    "algosdk>=2.4.0"
    "pyteal>=0.24.0"
)

for package in "${REQUIRED_PACKAGES[@]}"; do
    package_name=$(echo "$package" | cut -d'>' -f1 | cut -d'=' -f1)
    if ! python3 -c "import $package_name" 2>/dev/null; then
        echo "📦 Installing $package..."
        pip install "$package"
    else
        echo "✅ $package_name is installed"
    fi
done

# Install additional requirements if file exists
if [[ -f "contracts/requirements.txt" ]]; then
    echo "📦 Installing additional requirements..."
    pip install -r contracts/requirements.txt
fi

# Check if deployment script exists
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy_contracts.py"
if [[ ! -f "$DEPLOY_SCRIPT" ]]; then
    echo "❌ Error: Deployment script not found at $DEPLOY_SCRIPT"
    echo "   Please ensure deploy_contracts.py exists in the scripts directory"
    exit 1
fi

echo "✅ Deployment script found"

# Make sure the script is executable
chmod +x "$DEPLOY_SCRIPT"

# Set Python path to include contracts directory
export PYTHONPATH="$PROJECT_ROOT/contracts:$PYTHONPATH"

echo ""
echo "🚀 Starting contract deployment..."
echo "================================="
echo ""

# Run the Python deployment script
python3 "$DEPLOY_SCRIPT"

# Check deployment success
if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "====================================="
    echo ""
    echo "📄 Check deployment.json for contract details"
    echo "🔗 Update your frontend with the new contract IDs"
    echo ""
    
    # Show deployment.json if it exists
    if [[ -f "deployment.json" ]]; then
        echo "📋 Deployment Summary:"
        echo "--------------------"
        if command -v jq &> /dev/null; then
            jq '.contracts | to_entries[] | "\(.key): \(.value.app_id)"' -r deployment.json
        else
            grep -o '"app_id": [0-9]*' deployment.json || echo "Contract IDs available in deployment.json"
        fi
    fi
    
else
    echo ""
    echo "💥 DEPLOYMENT FAILED!"
    echo "===================="
    echo ""
    echo "Please check the error messages above and try again."
    echo "Common issues:"
    echo "• Insufficient ALGO balance in deployer account"
    echo "• Network connectivity issues"
    echo "• Contract compilation errors"
    echo ""
    exit 1
fi

echo ""
echo "✨ Deployment script completed"
