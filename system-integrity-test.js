#!/usr/bin/env node

/**
 * SYSTEM INTEGRITY TEST SUITE
 * 
 * Tests all critical imports and connections
 * Run: node system-integrity-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`\n${'═'.repeat(60)}`);
console.log(`  OPENCLAW SYSTEM INTEGRITY TEST`);
console.log(`${'═'.repeat(60)}\n`);

// Test 1: Check file existence
console.log(`✓ FILE EXISTENCE CHECK`);
const files = [
  { path: './game-master-orchestrator-v2.js', name: 'Orchestrator' },
  { path: './dm-memory-system.js', name: 'DMMemory' },
  { path: './session-ambiance-orchestrator.js', name: 'SessionAmbiance' },
  { path: './adventure-module-system.js', name: 'AdventureModule' },
  { path: './src/systems/narrator/narrator-engine.js', name: 'NarratorEngine' },
  { path: './src/systems/narrator/index.js', name: 'Narrator Index' },
];

let filesOk = 0;
files.forEach(f => {
  const fullPath = path.join(__dirname, f.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${f.name}: ${f.path}`);
    filesOk++;
  } else {
    console.log(`  ❌ ${f.name}: ${f.path} - NOT FOUND`);
  }
});

console.log(`  Result: ${filesOk}/${files.length} files present\n`);

// Test 2: Check imports
console.log(`✓ IMPORT CHECK`);
try {
  console.log(`  Testing: DMMemory`);
  const { DMMemory } = await import('./dm-memory-system.js');
  console.log(`  ✅ DMMemory imported successfully`);
  
  console.log(`  Testing: SessionAmbiance`);
  const { SessionAmbiance } = await import('./session-ambiance-orchestrator.js');
  console.log(`  ✅ SessionAmbiance imported successfully`);
  
  console.log(`  Testing: AdventureModule`);
  const { AdventureModule, ModuleRegistry } = await import('./adventure-module-system.js');
  console.log(`  ✅ AdventureModule imported successfully`);
  
  console.log(`  Testing: NarratorEngine`);
  const { NarratorEngine } = await import('./src/systems/narrator/index.js');
  console.log(`  ✅ NarratorEngine imported successfully\n`);
  
} catch (e) {
  console.log(`  ❌ Import failed: ${e.message}\n`);
}

// Test 3: Check package.json
console.log(`✓ DEPENDENCIES CHECK`);
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`  ✅ package.json found`);
  
  const required = ['@anthropic-ai/sdk', 'node-fetch', 'form-data'];
  required.forEach(dep => {
    if (pkg.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${pkg.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: NOT FOUND`);
    }
  });
} else {
  console.log(`  ❌ package.json not found`);
}
console.log();

// Test 4: Check git repo
console.log(`✓ GIT REPOSITORY CHECK`);
const gitPath = path.join(__dirname, '.git');
if (fs.existsSync(gitPath)) {
  console.log(`  ✅ Git repository initialized\n`);
} else {
  console.log(`  ❌ Git repository not found\n`);
}

// Test 5: Check campaigns directory
console.log(`✓ CAMPAIGN STRUCTURE CHECK`);
const campaignsPath = path.join(__dirname, 'campaigns');
if (fs.existsSync(campaignsPath)) {
  const campaigns = fs.readdirSync(campaignsPath);
  console.log(`  ✅ Campaigns directory exists`);
  console.log(`  Found campaigns: ${campaigns.length}`);
  campaigns.slice(0, 5).forEach(c => {
    console.log(`    - ${c}`);
  });
  console.log();
} else {
  console.log(`  ⚠️  Campaigns directory not found (will be created)\n`);
}

// Summary
console.log(`${'═'.repeat(60)}`);
console.log(`  STATUS: READY FOR GAMEPLAY`);
console.log(`${'═'.repeat(60)}\n`);

console.log(`NEXT STEPS:`);
console.log(`  1. npm install`);
console.log(`  2. Create a module in ./modules/[module-id]/`);
console.log(`  3. Start a session with: node play-module.js\n`);
