#!/usr/bin/env node

/**
 * PLAY MODULE FROM CLI
 * 
 * Usage:
 * node play-module.js "I6 Ravenloft"
 * node play-module.js "S1 Tomb Of Horrors"
 * node play-module.js "C1 Hidden Shrine Of Tamoachan"
 * 
 * Reads TSR PDF modules and walks you through them interactively
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { PDFModuleReader } from './pdf-module-reader.js';
import { UnifiedDndEngine } from './unified-dnd-engine.js';
import { ADnDRuleEngine } from './adnd-rule-engine.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function findModuleFile(moduleName) {
  const modulesDir = '/Users/mpruskowski/.openclaw/workspace/dnd/resources/modules';
  
  if (!fs.existsSync(modulesDir)) {
    console.error(`Modules directory not found: ${modulesDir}`);
    return null;
  }

  const files = fs.readdirSync(modulesDir);
  
  // Exact match
  let match = files.find(f => f.toLowerCase().includes(moduleName.toLowerCase()));
  
  // Partial match by code (I6, S1, C1, etc)
  if (!match) {
    const code = moduleName.match(/^[A-Z]+\d+/)?.[0];
    if (code) {
      match = files.find(f => f.includes(code));
    }
  }

  if (!match) {
    console.error(`Module not found: ${moduleName}`);
    console.log(`Available modules in ${modulesDir}:`);
    files.forEach(f => console.log(`  - ${f.replace('.pdf', '')}`));
    return null;
  }

  return path.join(modulesDir, match);
}

async function playModule(modulePath) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           🎭 AD&D 1E MODULE READER & PLAYER 🎭            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Initialize systems
  const reader = new PDFModuleReader(modulePath);
  const engine = new ADnDRuleEngine();

  console.log(`📖 Reading module: ${path.basename(modulePath)}`);
  console.log(`⏳ Extracting structure...\n`);

  // Read and extract module
  const moduleStructure = await reader.getModuleStructure();
  const metadata = moduleStructure.metadata;

  console.log(`✅ Module loaded!\n`);

  // Display metadata
  console.log('📋 MODULE INFORMATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Name: ${metadata.name}`);
  console.log(`Code: ${metadata.code || 'Unknown'}`);
  console.log(`Recommended Level: ${Array.isArray(metadata.authoredLevel) ? metadata.authoredLevel.join('-') : metadata.authoredLevel}`);
  console.log(`Estimated Duration: ${metadata.estimatedDuration || 'Unknown'}`);
  console.log(`\nOverview:`);
  console.log(metadata.description || 'No description available');
  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Display areas
  if (moduleStructure.areas && moduleStructure.areas.length > 0) {
    console.log(`📍 LOCATIONS (${moduleStructure.areas.length} areas found)`);
    console.log('═══════════════════════════════════════════════════════════');
    moduleStructure.areas.slice(0, 10).forEach((area, index) => {
      console.log(`\n${index + 1}. Area ${area.id}: ${area.name}`);
      console.log(`   ${area.description}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
  }

  // Display encounters
  if (moduleStructure.encounters && moduleStructure.encounters.length > 0) {
    console.log(`⚔️  ENCOUNTERS (${moduleStructure.encounters.length} found)`);
    console.log('═══════════════════════════════════════════════════════════');
    moduleStructure.encounters.slice(0, 8).forEach((encounter, index) => {
      console.log(`\n${index + 1}. [${encounter.difficulty.toUpperCase()}] ${encounter.description}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
  }

  // Display NPCs
  if (moduleStructure.npcs && moduleStructure.npcs.length > 0) {
    console.log(`🧙 KEY NPCs (${moduleStructure.npcs.length} found)`);
    console.log('═══════════════════════════════════════════════════════════');
    moduleStructure.npcs.slice(0, 6).forEach((npc, index) => {
      console.log(`\n${index + 1}. ${npc.name} (${npc.description})`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
  }

  // Display treasures
  if (moduleStructure.treasures && moduleStructure.treasures.length > 0) {
    console.log(`💎 TREASURES (${moduleStructure.treasures.length} found)`);
    console.log('═══════════════════════════════════════════════════════════');
    moduleStructure.treasures.slice(0, 8).forEach((treasure, index) => {
      console.log(`${index + 1}. ${treasure}`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');
  }

  // Interactive play loop
  let playing = true;
  let currentArea = null;
  let sessionLog = [];

  while (playing) {
    console.log('\n🎮 OPTIONS:');
    console.log('  [1] View module content');
    console.log('  [2] Start playing');
    console.log('  [3] Roll dice');
    console.log('  [4] Make attack');
    console.log('  [5] Saving throw');
    console.log('  [6] Random event');
    console.log('  [7] Morale check');
    console.log('  [8] Save session');
    console.log('  [9] Exit');

    const choice = await question('\nChoose option (1-9): ');

    switch (choice) {
      case '1':
        await viewModuleContent(moduleStructure);
        break;
      case '2':
        await startPlaying(moduleStructure, engine, sessionLog);
        break;
      case '3':
        await rollDice();
        break;
      case '4':
        await makeAttack(engine);
        break;
      case '5':
        await savingThrow(engine);
        break;
      case '6':
        await randomEvent(engine);
        break;
      case '7':
        await moraleCheck(engine);
        break;
      case '8':
        await saveSession(moduleStructure, sessionLog);
        break;
      case '9':
        playing = false;
        console.log('\n👋 Thanks for playing!');
        break;
      default:
        console.log('Invalid option');
    }
  }

  rl.close();
}

async function viewModuleContent(moduleStructure) {
  const content = moduleStructure.content;
  console.log('\n📖 FULL MODULE TEXT:');
  console.log('═══════════════════════════════════════════════════════════');
  // Show first 2000 characters
  console.log(content.substring(0, 2000));
  console.log('\n... (truncated)');
  console.log('═══════════════════════════════════════════════════════════');
}

async function startPlaying(moduleStructure, engine, sessionLog) {
  console.log('\n🎲 Starting adventure...\n');
  
  const partyName = await question('Party name: ');
  const partySize = parseInt(await question('Party size: '));
  const partyLevel = parseInt(await question('Average party level: '));

  console.log(`\n✅ Party: ${partyName} (${partySize} members, level ${partyLevel})`);
  console.log('\nThe adventure begins!');

  // Log session start
  sessionLog.push({
    type: 'SESSION_START',
    partyName,
    partySize,
    partyLevel,
    timestamp: new Date().toISOString()
  });
}

async function rollDice() {
  const formula = await question('\nDice formula (e.g., 2d6, 1d20+5): ');
  const engine = new ADnDRuleEngine();
  const result = engine.roll(formula);
  
  if (result) {
    console.log(`\n🎲 Rolled: ${result.rolls.join(', ')}`);
    console.log(`Total: ${result.total}`);
  }
}

async function makeAttack(engine) {
  const bonus = parseInt(await question('\nAttack bonus: '));
  const ac = parseInt(await question('Target AC: '));
  
  const result = engine.attackRoll(bonus, ac);
  console.log(`\n${result.message}`);
}

async function savingThrow(engine) {
  const throwType = await question('\nSave type (paralysis/poison/death/rod/staff/wand/breathweapon/spell): ');
  const level = parseInt(await question('Character level: '));
  
  const result = engine.savingThrow({ level }, throwType);
  console.log(`\n${result.message}`);
}

async function randomEvent(engine) {
  const level = parseInt(await question('\nParty level: '));
  const event = engine.randomEvent(level);
  
  if (event) {
    console.log(`\n🌟 ${event.name}`);
    console.log(`Description: ${event.description}`);
    console.log(`Effect: ${event.effect}`);
  } else {
    console.log('\nNo random event triggered');
  }
}

async function moraleCheck(engine) {
  const morale = parseInt(await question('\nMonster morale: '));
  const result = engine.moraleCheck(morale);
  console.log(`\n${result.message}`);
}

async function saveSession(moduleStructure, sessionLog) {
  const filename = `session-${Date.now()}.json`;
  const sessionData = {
    module: moduleStructure.metadata.name,
    log: sessionLog,
    savedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(filename, JSON.stringify(sessionData, null, 2));
  console.log(`\n✅ Session saved to ${filename}`);
}

// Main
const moduleName = process.argv[2] || 'I6';

const modulePath = await findModuleFile(moduleName);
if (modulePath) {
  await playModule(modulePath);
}
