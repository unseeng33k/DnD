#!/usr/bin/env node

/**
 * MODULE CREATOR CLI
 * 
 * Easy command-line tool for creating new D&D modules
 * 
 * Usage:
 * node create-module.js tamoachan "Lost Shrine of Tamoachan"
 */

import { ModuleBuilder } from './module-builder.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createModuleInteractive() {
  console.log('\n🎲 D&D MODULE CREATOR');
  console.log('═══════════════════════════\n');

  // Get module info
  const moduleId = await question('Module ID (e.g., tamoachan): ');
  const moduleName = await question('Module Name (e.g., Lost Shrine of Tamoachan): ');
  const author = await question('Author name (default: DM): ') || 'DM';

  const builder = new ModuleBuilder(moduleId, moduleName, author);

  // Set metadata
  console.log('\n📋 MODULE METADATA');
  const description = await question('Description: ');
  const levelMin = parseInt(await question('Party Level Min (default 1): ') || '1');
  const levelMax = parseInt(await question('Party Level Max (default 5): ') || '5');
  const length = await question('Campaign Length (short/medium/long): ') || 'medium';
  const setting = await question('Setting (e.g., Jungle Temple): ');
  const themes = (await question('Themes (comma-separated): ')).split(',').map(t => t.trim());

  builder.setMetadata({
    description,
    level: [levelMin, levelMax],
    length,
    setting,
    themes
  });

  console.log('\n✅ Module metadata configured');

  // Add locations
  let addMoreLocations = true;
  while (addMoreLocations) {
    const locationId = await question('\nLocation ID (or "done"): ');
    if (locationId === 'done') {
      addMoreLocations = false;
    } else {
      const locationName = await question('Location Name: ');
      const description = await question('Description: ');
      const type = await question('Type (dungeon/town/wilderness/npc-lair): ');

      builder.addLocation({
        id: locationId,
        name: locationName,
        description,
        type
      });

      console.log(`✅ Location added: ${locationName}`);
    }
  }

  // Build the module
  console.log('\n🔨 Building module...');
  const result = await builder.build();

  if (result.success) {
    console.log('\n✅ MODULE CREATED SUCCESSFULLY!');
    console.log(`📁 Path: ${result.path}`);
    console.log(`📍 Locations: ${result.stats.locations}`);
    console.log(`⚔️  Encounters: ${result.stats.encounters}`);
    console.log(`🧙 NPCs: ${result.stats.npcs}`);
  } else {
    console.log(`\n❌ Error: ${result.error}`);
  }

  rl.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createModuleInteractive().catch(console.error);
}

export { createModuleInteractive };
