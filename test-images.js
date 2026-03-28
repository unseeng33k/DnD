#!/usr/bin/env node

/**
 * Quick Test Script - Run to verify everything works
 * 
 * Usage: node test-images.js [chatId]
 * 
 * Examples:
 *   node test-images.js                    # Test local image generation
 *   node test-images.js 123456789          # Test with Telegram send
 *   TELEGRAM_CHAT_ID=123456789 node test-images.js
 */

import { generateAndSendImage, generateRoomImage, generateMonsterImage, generateBattleImage, ImageCache } from './image-handler.js';
import fs from 'fs';
import path from 'path';

const CHAT_ID = process.argv[2] || process.env.TELEGRAM_CHAT_ID;

console.log('\n🧪 D&D IMAGE SYSTEM TEST\n');
console.log('======================\n');

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Cache system
  console.log('Test 1: Cache System');
  try {
    const cache = new ImageCache();
    const testPrompt = 'Test prompt for caching';
    const testPath = '/tmp/test-image.png';
    
    cache.set(testPrompt, testPath);
    const cached = cache.get(testPrompt);
    
    if (cached && cached.filepath === testPath) {
      console.log('   ✅ Cache working\n');
      results.passed++;
    } else {
      console.log('   ❌ Cache failed\n');
      results.failed++;
    }
    results.tests.push({ name: 'Cache System', passed: cached ? true : false });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Cache System', passed: false });
  }

  // Test 2: Image directory exists
  console.log('Test 2: Image Directory');
  try {
    const imagesDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'images', 'generated');
    if (fs.existsSync(imagesDir)) {
      console.log(`   ✅ Directory exists: ${imagesDir}\n`);
      results.passed++;
    } else {
      console.log(`   ❌ Directory missing: ${imagesDir}\n`);
      results.failed++;
    }
    results.tests.push({ name: 'Image Directory', passed: fs.existsSync(imagesDir) });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    results.failed++;
    results.tests.push({ name: 'Image Directory', passed: false });
  }

  // Test 3: Environment variables
  console.log('Test 3: Environment Variables');
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const hasChatId = !!CHAT_ID;
  
  if (hasApiKey) {
    console.log('   ✅ OPENAI_API_KEY is set');
    results.passed++;
  } else {
    console.log('   ⚠️  OPENAI_API_KEY not set (needed for image generation)');
    results.failed++;
  }
  
  if (hasChatId) {
    console.log(`   ✅ Telegram Chat ID: ${CHAT_ID}`);
  } else {
    console.log('   ℹ️  No Telegram Chat ID (will skip Telegram tests)');
  }
  console.log();
  
  results.tests.push({ name: 'API Key', passed: hasApiKey });
  results.tests.push({ name: 'Chat ID', passed: hasChatId });

  // Test 4: Room image generation (if API key present)
  if (hasApiKey) {
    console.log('Test 4: Room Image Generation');
    try {
      const result = await generateRoomImage(
        'Ancient library with dusty tomes',
        null,  // No Telegram send for this test
        'candlelit, stone columns',
        'soft torchlight'
      );
      
      if (result.success && fs.existsSync(result.filepath)) {
        console.log(`   ✅ Image generated: ${path.basename(result.filepath)}`);
        results.passed++;
        results.tests.push({ name: 'Room Image', passed: true });
      } else {
        console.log(`   ❌ Generation failed: ${result.error}\n`);
        results.failed++;
        results.tests.push({ name: 'Room Image', passed: false });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
      results.failed++;
      results.tests.push({ name: 'Room Image', passed: false });
    }
    console.log();
  }

  // Test 5: Telegram send (if chat ID provided)
  if (hasChatId && hasApiKey) {
    console.log('Test 5: Telegram Send');
    try {
      const result = await generateAndSendImage(
        'A wizard casting spells in a grand hall',
        CHAT_ID,
        '✨ Test Image'
      );
      
      if (result.success && result.telegram?.success) {
        console.log(`   ✅ Image sent to Telegram (message ID: ${result.telegram.message_id})`);
        results.passed++;
        results.tests.push({ name: 'Telegram Send', passed: true });
      } else if (result.success) {
        console.log(`   ⚠️  Image generated but Telegram send failed: ${result.telegram?.error}`);
        results.tests.push({ name: 'Telegram Send', passed: false });
      } else {
        console.log(`   ❌ Generation failed: ${result.error}`);
        results.tests.push({ name: 'Telegram Send', passed: false });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      results.tests.push({ name: 'Telegram Send', passed: false });
    }
    console.log();
  }

  // Summary
  console.log('======================');
  console.log('📊 TEST SUMMARY\n');
  
  results.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
  });
  
  console.log();
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log();

  if (results.failed === 0) {
    console.log('🎉 All tests passed! System is ready.\n');
    console.log('Next steps:');
    console.log('  - Try: node dnd-images-cli.js room "Throne room" "dusty" "candlelit"');
    console.log('  - Or: node image-handler.js "Your scene description"\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Run: node diagnose-images.js\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
