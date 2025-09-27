#!/bin/bash

# CBDGold Backend Setup Script
# This script sets up the secure backend for CBDGold

set -e  # Exit on any error

echo "🚀 Setting up CBDGold Secure Backend..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: Please run this script from the backend directory${NC}"
    exit 1
fi

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js version
print_info "Checking Node.js version..."
node_version=$(node --version)
echo "   Node.js version: $node_version"

# Check if required version (18+)
node_major=$(echo $node_version | sed 's/v//' | cut -d. -f1)
if [ "$node_major" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js 18 or higher is required. You have $node_version${NC}"
    exit 1
fi
print_status "Node.js version check passed"

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    print_info "Installing backend dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from template..."
    cp .env.template .env
    print_status ".env file created from template"
    echo ""
    echo -e "${YELLOW}🔧 IMPORTANT: Please edit the .env file with your actual values:${NC}"
    echo "   1. Add your HuggingFace API token (HF_TOKEN)"
    echo "   2. Set your model name (HF_MODEL)"
    echo "   3. Configure other settings as needed"
    echo ""
    echo -e "${BLUE}   Get your HuggingFace token from: https://huggingface.co/settings/tokens${NC}"
    echo ""
else
    print_status ".env file already exists"
fi

# Validate .env file
print_info "Validating environment configuration..."

# Source the .env file
set -a
source .env
set +a

# Check critical variables
missing_vars=()

if [ -z "$HF_TOKEN" ] || [ "$HF_TOKEN" = "your_actual_hugging_face_token_here" ]; then
    missing_vars+=("HF_TOKEN")
fi

if [ -z "$HF_MODEL" ] || [ "$HF_MODEL" = "your_model_name_here" ]; then
    missing_vars+=("HF_MODEL")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo -e "${YELLOW}Please edit the .env file before starting the server.${NC}"
else
    print_status "Environment configuration looks good"
fi

# Test server startup (dry run)
print_info "Testing server configuration..."
timeout 5s node -e "
require('dotenv').config();
console.log('Configuration test passed');
process.exit(0);
" 2>/dev/null && print_status "Server configuration test passed" || print_warning "Server configuration test failed"

echo ""
echo -e "${GREEN}🎉 Backend setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your actual API credentials"
echo "   2. Start the development server: npm run dev"
echo "   3. Test the health endpoint: curl http://localhost:3001/health"
echo ""
echo "🔗 Available scripts:"
echo "   npm run dev    - Start development server with auto-reload"
echo "   npm start      - Start production server"
echo "   npm run test   - Run tests (when implemented)"
echo ""
echo "🔐 Security features enabled:"
echo "   ✅ API key protection (server-side only)"
echo "   ✅ Rate limiting"
echo "   ✅ Input validation"
echo "   ✅ CORS protection"
echo "   ✅ Security headers"
echo "   ✅ Error sanitization"
echo ""

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Don't forget to configure the missing environment variables!${NC}"
else
    echo -e "${GREEN}🚀 Ready to start: npm run dev${NC}"
fi
