#!/usr/bin/env node

/**
 * D&D Telegram Image System - Complete Diagnostic
 * Run: node diagnose-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);
const DND_DIR = __dirname;
const IMAGES_DIR = path.join(DND_DIR, 'images', 'generated');
const CACHE_FILE = path.join(DND_DIR, 'images', 'image-cache.json');

console.log('\n🔍 D&D IMAGE SYSTEM DIAGNOSTIC\n');
console.log('================================\n');

// 1. Check environment variables
console.log('1️⃣  ENVIRONMENT SETUP');
console.log('   OpenAI API:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ MISSING');
console.log('   Telegram Token:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Set (env)' : '⚠️  Using hardcoded');
console.log('   Telegram Chat ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Set' : '❌ Not set (see dnd-config.json)');
console.log('   Node version:', process.version);
console.log('   Node module type:', 'ES6 (type: module)');
console.log();

// 2. Check file system
console.log('2️⃣  FILE SYSTEM');
console.log('   DND directory:', DND_DIR);
console.log('   Images dir exists:', fs.existsSync(IMAGES_DIR) ? '✅ Yes' : '❌ No');
console.log('   Cache file exists:', fs.existsSync(CACHE_FILE) ? '✅ Yes' : '❌ No');

const requiredFiles = [
  'image-handler.js',
  'session-runner.js',
  'dnd-images-cli.js',
  'dnd-config.json',
  'package.json',
  'diagnose-images.js'
];

console.log('   Required files:');
requiredFiles.forEach(f => {
  const exists = fs.existsSync(path.join(DND_DIR, f));
  console.log(`     ${exists ? '✅' : '❌'} ${f}`);
});

if (fs.existsSync(IMAGES_DIR)) {
  const files = fs.readdirSync(IMAGES_DIR);
  console.log(`   Generated images: ${files.length}`);
  if (files.length > 0) {
    console.log('   Recent images:');
    const sorted = files.sort((a, b) => 
      fs.statSync(path.join(IMAGES_DIR, b)).mtime - 
      fs.statSync(path.join(IMAGES_DIR, a)).mtime
    );
    sorted.slice(0, 5).forEach(f => {
      const filepath = path.join(IMAGES_DIR, f);
      const stat = fs.statSync(filepath);
      const sizeKB = (stat.size / 1024).toFixed(1);
      const date = stat.mtime.toLocaleDateString();
      console.log(`     - ${f} (${sizeKB}KB, ${date})`);
    });
  }
}
console.log();

// 3. Check cache
console.log('3️⃣  CACHE STATUS');
if (fs.existsSync(CACHE_FILE)) {
  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const entries = Object.keys(cache);
    console.log(`   Cached prompts: ${entries.length}`);
    if (entries.length > 0) {
      console.log('   Recent:');
      entries.slice(0, 3).forEach(key => {
        const entry = cache[key];
        const prompt = entry.prompt.substring(0, 45);
        const date = new Date(entry.timestamp).toLocaleDateString();
        console.log(`     - "${prompt}..." (${date})`);
      });
    }
  } catch (e) {
    console.log('   ❌ Cache corrupted:', e.message);
  }
} else {
  console.log('   No cache yet (will be created on first generation)');
}
console.log();

// 4. Check npm dependencies
console.log('4️⃣  NPM DEPENDENCIES');
const packageFile = path.join(DND_DIR, 'package.json');
if (fs.existsSync(packageFile)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const deps = pkg.dependencies || {};
    console.log('   Required packages:');
    Object.entries(deps).forEach(([name, version]) => {
      const nodeModPath = path.join(DND_DIR, 'node_modules', name);
      const exists = fs.existsSync(nodeModPath);
      console.log(`     ${exists ? '✅' : '❌'} ${name}@${version}`);
    });
  } catch (e) {
    console.log('   ❌ Error reading package.json:', e.message);
  }
} else {
  console.log('   ❌ package.json not found');
}
console.log();

// 5. Check scripts
console.log('5️⃣  SCRIPT FILES');
const scripts = [
  'image-handler.js',
  'session-runner.js',
  'dnd-images-cli.js',
  'game-engine.js',
  'simple-dnd.js',
  'campaign-manager.js'
];

scripts.forEach(script => {
  const filepath = path.join(DND_DIR, script);
  const exists = fs.existsSync(filepath);
  if (exists) {
    const stat = fs.statSync(filepath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    console.log(`   ${exists ? '✅' : '❌'} ${script} (${sizeKB}KB)`);
  } else {
    console.log(`   ❌ ${script}`);
  }
});
console.log();

// 6. API Connectivity
console.log('6️⃣  API CONNECTIVITY');

const testHttps = (url, name) => {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      console.log(`   ${name}: ✅ ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.log(`   ${name}: ❌ ${err.message}`);
      resolve();
    });
  });
};

Promise.all([
  testHttps('https://api.openai.com/v1/models', 'OpenAI API'),
  testHttps('https://api.telegram.org', 'Telegram API'),
  testHttps('https://api.openai.com/v1/images/generations', 'DALLE-3 endpoint')
]).then(() => {
  console.log();
  
  // 7. Config verification
  console.log('7️⃣  CONFIGURATION');
  const configFile = path.join(DND_DIR, 'dnd-config.json');
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      console.log('   Telegram chat ID:', config.telegram.chatId || '❌ Not set');
      console.log('   Image generation:', config.imageGeneration.enabled ? '✅' : '❌');
      console.log('   Cache enabled:', config.imageGeneration.cacheEnabled ? '✅' : '❌');
      console.log('   Active campaigns:');
      Object.entries(config.campaigns).forEach(([name, camp]) => {
        if (camp.active) console.log(`     ✅ ${name}`);
      });
    } catch (e) {
      console.log('   ❌ Error reading config:', e.message);
    }
  }
  console.log();

  // Summary
  console.log('================================\n');
  console.log('📋 QUICK START COMMANDS:\n');
  console.log('Test image generation (no Telegram):');
  console.log('  node image-handler.js "A dragon in a cave"\n');
  console.log('Test with Telegram send:');
  console.log('  TELEGRAM_CHAT_ID=123456789 node image-handler.js "Your prompt"\n');
  console.log('Use CLI tool:');
  console.log('  node dnd-images-cli.js room "Throne room" "dusty" "candlelit"\n');
  console.log('Setup all dependencies:');
  console.log('  bash setup-images.sh\n');
});
