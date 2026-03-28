#!/bin/bash

# Set OpenAI API Key and run pre-session prep
# Usage: ./set-api-key.sh "your-api-key" "Campaign Name"

if [ -z "$1" ]; then
    echo "Usage: ./set-api-key.sh 'your-openai-api-key' 'Campaign Name'"
    echo ""
    echo "Get your API key from: https://platform.openai.com/api-keys"
    exit 1
fi

API_KEY="$1"
CAMPAIGN="${2:-Tamoachan Playtest}"

# Export the key
export OPENAI_API_KEY="$API_KEY"

echo "✅ API Key set"
echo "🎲 Running pre-session prep for: $CAMPAIGN"
echo ""

# Run the prep
cd "$(dirname "$0")"
node pre-session-prep.js "$CAMPAIGN"
