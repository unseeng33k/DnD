#!/usr/bin/env node

/**
 * D&D Image CLI Tool
 * Quick image generation from command line
 * 
 * Usage:
 *   node dnd-images-cli.js room "Grand throne room" "dusty, candlelit" "dim torchlight"
 *   node dnd-images-cli.js monster "Beholder" "floating orb with eye stalks" "ancient ruins"
 *   node dnd-images-cli.js battle "4 adventurers" "ancient frost dragon" "frozen temple" "casting spells"
 *   node dnd-images-cli.js custom "A wizard casting fireball" --chat 123456789 --caption "Magic incoming"
 */

import { program } from 'commander';
import { generateRoomImage, generateMonsterImage, generateBattleImage, generateAndSendImage } from './image-handler.js';

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || null;

program
  .name('dnd-images')
  .description('Generate and send D&D scene images to Telegram')
  .version('1.0.0');

program
  .command('room <description> [environment] [lighting]')
  .description('Generate a room/location image')
  .option('--chat <id>', 'Telegram chat ID', TELEGRAM_CHAT_ID)
  .action(async (description, environment = '', lighting = 'torchlight', options) => {
    console.log('🏛️  Generating room image...');
    const result = await generateRoomImage(description, options.chat, environment, lighting);
    handleResult(result);
  });

program
  .command('monster <name> [description] [habitat]')
  .description('Generate a monster/creature image')
  .option('--chat <id>', 'Telegram chat ID', TELEGRAM_CHAT_ID)
  .action(async (name, description = '', habitat = '', options) => {
    console.log('👹 Generating monster image...');
    const result = await generateMonsterImage(name, options.chat, description, habitat);
    handleResult(result);
  });

program
  .command('battle <party> <enemies> <environment> <action>')
  .description('Generate a combat/battle image')
  .option('--chat <id>', 'Telegram chat ID', TELEGRAM_CHAT_ID)
  .action(async (party, enemies, environment, action, options) => {
    console.log('⚔️  Generating battle image...');
    const result = await generateBattleImage(party, options.chat, enemies, environment, action);
    handleResult(result);
  });

program
  .command('custom <prompt>')
  .description('Generate a custom image from any prompt')
  .option('--chat <id>', 'Telegram chat ID', TELEGRAM_CHAT_ID)
  .option('--caption <text>', 'Caption for the image', '')
  .action(async (prompt, options) => {
    console.log('🎨 Generating custom image...');
    const result = await generateAndSendImage(prompt, options.chat, options.caption || prompt);
    handleResult(result);
  });

program
  .command('test')
  .description('Test with a default prompt')
  .action(async () => {
    console.log('🧪 Running test...');
    const result = await generateAndSendImage(
      'Ancient Olman temple entrance overgrown by jungle, weathered stone doorway with geometric carvings, thick vines, torchlight, stairs descending into darkness',
      null,
      '🏛️ Test Scene'
    );
    handleResult(result);
  });

function handleResult(result) {
  if (result.success) {
    console.log('\n✅ SUCCESS');
    console.log(`📄 File: ${result.filepath}`);
    if (result.telegram?.success) {
      console.log(`💬 Telegram Message ID: ${result.telegram.message_id}`);
    } else if (result.telegram?.error) {
      console.log(`⚠️  Telegram send failed: ${result.telegram.error}`);
    }
    process.exit(0);
  } else {
    console.log(`\n❌ FAILED: ${result.error}`);
    process.exit(1);
  }
}

program.parse();
