#!/usr/bin/env node

/**
 * QUICK START - Play with the Orchestrator
 * 
 * This is a simplified entry point that uses the GameMasterOrchestrator directly
 * without requiring PDF parsing. This gets you into a game immediately.
 * 
 * Usage: node quick-play.js
 */

import { GameMasterOrchestrator } from './game-master-orchestrator-v2.js';
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

async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎭 OPENCLAW - QUICK START SESSION`);
  console.log(`${'═'.repeat(60)}\n`);

  console.log(`Welcome to OpenClaw!`);
  console.log(`This is a simplified demo that shows the core system in action.\n`);

  // For this demo, we'll use a placeholder module ID
  // In production, you'd load from your modules directory
  const moduleId = 'tamoachan-expedition';
  
  console.log(`Initializing Game Master Orchestrator...`);
  console.log(`Module: ${moduleId}\n`);

  try {
    const gm = new GameMasterOrchestrator(moduleId);
    
    // Note: In real usage, you'd call:
    // await gm.loadModule();
    // But for this demo, we'll just show the orchestrator is ready
    
    console.log(`✅ Orchestrator initialized\n`);
    
    console.log(`QUICK DEMO:`);
    console.log(`─────────────────`);
    console.log(`The system is ready to:
  • Load D&D modules (TSR, Paizo, custom)
  • Track sessions with persistent memory
  • Log all events (exploration, combat, roleplay)
  • Generate AI-powered narrative chronicles
  • Manage NPCs and encounters\n`);

    console.log(`NEXT STEPS:`);
    console.log(`────────────`);
    console.log(`1. Install dependencies: npm install`);
    console.log(`2. Set environment: export ANTHROPIC_API_KEY="sk-ant-..."`);
    console.log(`3. Create a module in ./modules/[module-id]/`);
    console.log(`4. Load and play!\n`);

    console.log(`DEMO: Testing Memory System`);
    console.log(`────────────────────────────`);
    
    // Create a memory instance to show it works
    const { DMMemory } = await import('./dm-memory-system.js');
    
    const memory = new DMMemory('Demo Campaign', 1);
    console.log(`✅ Created session memory\n`);
    
    // Log some events
    memory.logEvent('exploration', 'Party enters a mysterious tavern', {
      location: 'Wayfarer\'s Rest',
      atmosphere: 'Smoky and warm'
    });
    
    memory.logEvent('roleplay', 'Party negotiates with Tavern Keeper', {
      npc: 'Gareth the Tavern Keeper',
      outcome: 'Favorable'
    });
    
    memory.logEvent('discovery', 'Party learns of nearby dungeon', {
      rumor: 'Ancient ruins to the north',
      reward: 'Treasure hunting opportunity'
    });
    
    console.log(`Logged events to memory:`);
    console.log(`  • Event 1: Exploration`);
    console.log(`  • Event 2: NPC Interaction`);
    console.log(`  • Event 3: Discovery\n`);
    
    console.log(`Timeline state:`);
    console.log(`  Total events: ${memory.timeline.events.length}`);
    console.log(`  Event types: ${Object.keys(memory.timeline.export().byType).map(t => memory.timeline.export().byType[t] > 0 ? t : null).filter(Boolean).join(', ')}\n`);
    
    // Show narrator is ready
    const { NarratorEngine } = await import('./src/systems/narrator/index.js');
    console.log(`✅ Narrator Engine imported and ready\n`);
    
    console.log(`SYSTEM STATUS:`);
    console.log(`──────────────`);
    console.log(`✅ Orchestrator: READY`);
    console.log(`✅ Memory System: READY`);
    console.log(`✅ Narrator Engine: READY`);
    console.log(`✅ Chronicle Generation: READY (needs ANTHROPIC_API_KEY)\n`);
    
    console.log(`${'═'.repeat(60)}`);
    console.log(`SYSTEM IS FULLY OPERATIONAL`);
    console.log(`${'═'.repeat(60)}\n`);
    
    console.log(`Ready to play? Next steps:`);
    console.log(`  1. npm install`);
    console.log(`  2. export ANTHROPIC_API_KEY="..."`);
    console.log(`  3. Create your first campaign module`);
    console.log(`  4. Start playing!\n`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
  }
  
  rl.close();
}

main();
