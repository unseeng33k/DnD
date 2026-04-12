#!/bin/bash

##############################################################################
# D&D Image System - Installation & Setup Script
# 
# This script installs all dependencies and configures your system for
# image generation and Telegram integration
#
# Usage: bash setup-images.sh
##############################################################################

set -e

echo "🎮 D&D Image System Setup"
echo "=========================="
echo ""

# Check Node.js
echo "1️⃣  Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js $NODE_VERSION found"
else
    echo "   ❌ Node.js not found. Please install Node.js 16+ from nodejs.org"
    exit 1
fi

# Install dependencies
echo ""
echo "2️⃣  Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "   ✅ Dependencies installed"
else
    echo "   ✅ node_modules already exists"
fi

# Create directories
echo ""
echo "3️⃣  Creating required directories..."
mkdir -p images/generated
mkdir -p campaigns/Curse\ of\ Strahd/sessions
mkdir -p campaigns/Tamoachan\ Expedition/sessions
echo "   ✅ Directories created"

# Check environment variables
echo ""
echo "4️⃣  Checking environment configuration..."

if [ -z "$OPENAI_API_KEY" ]; then
    echo "   ⚠️  OPENAI_API_KEY not set"
    echo "   📝 Set it with: export OPENAI_API_KEY='your-key-here'"
    echo "   🔗 Get key from: https://platform.openai.com/api-keys"
else
    echo "   ✅ OPENAI_API_KEY is set"
fi

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "   ℹ️  TELEGRAM_BOT_TOKEN not set (using hardcoded PruskowskiBot)"
else
    echo "   ✅ TELEGRAM_BOT_TOKEN is set"
fi

# Test DALLE connectivity
echo ""
echo "5️⃣  Testing DALLE-3 API connectivity..."
if [ -n "$OPENAI_API_KEY" ]; then
    curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models | grep -q "dall-e-3"
    if [ $? -eq 0 ]; then
        echo "   ✅ OpenAI API is reachable and dall-e-3 available"
    else
        echo "   ⚠️  OpenAI API check failed. Verify your key is valid."
    fi
else
    echo "   ⏭️  Skipping (OPENAI_API_KEY not set)"
fi

# Test Telegram connectivity
echo ""
echo "6️⃣  Testing Telegram API connectivity..."
curl -s -o /dev/null -w "%{http_code}" https://api.telegram.org | grep -q "200\|301\|302"
if [ $? -eq 0 ]; then
    echo "   ✅ Telegram API is reachable"
else
    echo "   ⚠️  Telegram API may be unreachable"
fi

# Run diagnostic
echo ""
echo "7️⃣  Running diagnostic..."
node diagnose-images.js

# Summary
echo ""
echo "=========================="
echo "✅ Setup Complete!"
echo "=========================="
echo ""
echo "Next steps:"
echo ""
echo "1. Set your Telegram chat ID in dnd-config.json"
echo "   (Find your chat ID by sending /start to @userinfobot)"
echo ""
echo "2. Test image generation:"
echo "   node image-handler.js 'A dragon in a stone chamber'"
echo ""
echo "3. Test with Telegram send:"
echo "   CHAT_ID=123456789 node image-handler.js 'Your prompt'"
echo ""
echo "4. Or use the CLI tool:"
echo "   node dnd-images-cli.js room 'Throne room' 'dusty' 'candlelit'"
echo ""
echo "5. Integrate into your game engine (see session-runner.js)"
echo ""
