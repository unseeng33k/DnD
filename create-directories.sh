#!/bin/bash

# PHASE 1 DIRECTORY CREATION SCRIPT
# This script creates the exact directory structure needed

cd /Users/mpruskowski/.openclaw/workspace/dnd

echo "🏗️  Creating src/ directory structure..."

# Create main src/ directory
mkdir -p src

# Create organized subdirectories
mkdir -p src/core
mkdir -p src/registries
mkdir -p src/effects
mkdir -p src/systems

# Create legacy subdirectories
mkdir -p src/legacy
mkdir -p src/legacy/engines
mkdir -p src/legacy/systems
mkdir -p src/legacy/utilities
mkdir -p src/legacy/modules
mkdir -p src/legacy/cli
mkdir -p src/legacy/documentation

echo "✅ Directory structure created successfully!"
echo ""
echo "Verifying directories..."
ls -la src/
echo ""
ls -la src/legacy/

echo "✅ All directories confirmed"
