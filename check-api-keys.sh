#!/bin/bash

# D&D API Key Setup Script
# Run this to set your API keys as environment variables

echo "🎲 D&D API Key Setup"
echo "===================="
echo ""

# Check if already set
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY is already set"
else
    echo "⚠️  OPENAI_API_KEY is not set"
    echo ""
    echo "To set it temporarily (current session only):"
    echo "  export OPENAI_API_KEY='your-key-here'"
    echo ""
    echo "To set it permanently, add to your ~/.zshrc or ~/.bashrc:"
    echo "  export OPENAI_API_KEY='your-key-here'"
    echo ""
fi

if [ -n "$GEMINI_API_KEY" ]; then
    echo "✅ GEMINI_API_KEY is already set"
else
    echo "⚠️  GEMINI_API_KEY is not set (optional - only needed for Gemini image generation)"
fi

echo ""
echo "Current values:"
echo "  OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}... (length: ${#OPENAI_API_KEY})"
echo "  GEMINI_API_KEY: ${GEMINI_API_KEY:0:20}... (length: ${#GEMINI_API_KEY})"
