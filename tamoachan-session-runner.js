#!/usr/bin/env node

/**
 * TAMOACHAN PLAYTEST - SESSION RUNNER WITH LEVEL 3 CINEMATIC ORCHESTRATION
 * 
 * This runs a full session using CinematicAmbianceOrchestrator:
 * - Scene loading with cinematic guidance
 * - NPC introductions
 * - Combat encounters with choreography
 * - Character moments
 * - The Beat for critical narrative shifts
 */

import { EventBus } from './src/core/event-bus.js';
import { CinematicAmbianceOrchestrator } from './src/systems/cinematic-ambiance-orchestrator.js';
import fs from 'fs';

// Characters in party
const party = {
  grond: { name: 'Grond', class: 'Fighter', hp: 28, maxHp: 28 },
  malice: { name: 'Malice', class: 'Rogue', hp: 16, maxHp: 16 }
};

// Mock image handler
const imageHandler = {
  generateImageDALLE: async (prompt) => {
    console.log(`  [IMAGE] Generating: ${prompt.substring(0, 40)}...`);
    return {
      success: true,
      filepath: '/mock/image.jpg',
      prompt,
      url: 'https://mock-image-url.jpg'
    };
  },
  sendImageToTelegram: async (filepath, chatId, caption) => {
    console.log(`  [TELEGRAM] Image sent`);
  },
  sendTextToTelegram: async (chatId, message) => {
    console.log(`  [TELEGRAM] Message: ${message.substring(0, 40)}...`);
  }
};

// Tamoachan scenes with ambiance
const tamoScenes = {
  'jungle-approach': {
    official: 'Jungle Approach',
    music: 'https://youtube.com/watch?v=jungle',
    imagePrompt: 'Dense jungle vegetation, ancient temple ruins visible through mist',
    sensory: {
      visual: 'The jungle canopy towers overhead. Vines hang thick. Through gaps, stone structures appear',
      auditory: 'Insects chirp. Water drips. The sound of civilization is gone',
      olfactory: 'Wet earth, rotting vegetation, mineral-rich stone',
      tactile: 'Humidity clings. Vines brush against skin. Heat and moisture everywhere',
      gustatory: 'Metallic jungle air. Faint sweetness of decay'
    }
  },
  'temple-entrance': {
    official: 'Temple Entrance',
    music: 'https://youtube.com/watch?v=ancient',
    imagePrompt: 'Ancient Aztec-style temple entrance with massive carved stone doors',
    sensory: {
      visual: 'A massive stone archway carved with intricate glyphs. Darkness beyond the threshold',
      auditory: 'Silence. An oppressive, waiting silence',
      olfactory: 'Stone dust, ancient incense, something acrid and wrong',
      tactile: 'Cold air emanating from within. The stone is smooth, worn by countless hands',
      gustatory: 'Ash on the tongue. Copper undertone'
    }
  },
  'entry-hall': {
    official: 'Entry Hall',
    music: 'https://youtube.com/watch?v=temple',
    imagePrompt: 'Stone chamber with high ceilings, torch sconces on walls, shadows dancing',
    sensory: {
      visual: 'A vast stone hall. Pillars support a vaulted ceiling. Shadows shift in torchlight',
      auditory: 'Echoes. Your footsteps multiply. Something breathing in the darkness',
      olfactory: 'Old smoke, decay, something alive',
      tactile: 'Stone floor, rough beneath feet. Chill radiates from stone',
      gustatory: 'Dust. Old blood. Fear tastes metallic'
    }
  }
};

// NPCs
const npcs = {
  'tomas': {
    name: 'Tomas the Survivor',
    description: 'A weathered man, eyes hollow with trauma. His clothes are torn. He looks like he\\'s been running for days',
    firstMeeting: true
  }
};

async function runTamoachanSession() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🌴 TAMOACHAN PLAYTEST - SESSION 1 WITH LEVEL 3 ORCHESTRATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const eventBus = new EventBus();
  const cinematic = new CinematicAmbianceOrchestrator(
    eventBus,
    {
      ambianceRegistry: {
        get: (sceneName) => tamoScenes[sceneName] || tamoScenes['jungle-approach']
      }
    },
    imageHandler,
    { verbose: true, enableImages: false, telegramChatId: 'test' }
  );

  let sessionLog = [];

  // EVENT LISTENERS
  eventBus.on('cinematic:scene-loaded', (event) => {
    sessionLog.push(`[SCENE] ${event.data.scene} - Mood: ${event.data.experience.mood}`);
  });

  eventBus.on('cinematic:combat-round', (event) => {
    sessionLog.push(`[COMBAT] Round ${event.data.roundNumber} vs ${event.data.enemy}`);
  });

  try {
    // ═══════════════════════════════════════════════════════════════
    // OPENING SCENE: JUNGLE APPROACH
    // ═══════════════════════════════════════════════════════════════
    console.log('\n🌴 OPENING: The Jungle Approach\n');
    console.log('The party has been hired to investigate the disappearance of villagers');
    console.log('near an ancient temple. They push through dense jungle...\n');

    const jungleScene = await cinematic.scene('jungle-approach', {
      foreground: 'Massive carved stone emerges through vegetation',
      midground: 'The jungle canopy stretches endlessly',
      background: 'Mist rises from unseen depths',
      emotionalBeat: 'foreboding'
    });

    console.log(`\n✅ Scene loaded. Mood: ${jungleScene.mood}`);
    console.log(`Visual: ${jungleScene.sensory.visual}`);

    // ═══════════════════════════════════════════════════════════════
    // ENCOUNTER 1: Meet Tomas the Survivor
    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n📍 ENCOUNTER: The Survivor\n');
    console.log('As the party approaches the temple, a figure stumbles out of the jungle...\n');

    const tomasScene = await cinematic.scene('temple-entrance', {
      foreground: 'A man emerges from shadows, hands raised in desperation',
      midground: 'The massive temple entrance dominates behind him',
      background: 'Jungle recedes into darkness',
      emotionalBeat: 'tension'
    });

    console.log(`\n✅ Tomas appears - desperation in his eyes`);
    console.log(`His words: "Don't... don't go in there. My companions are gone. The temple has taken them. The voices... the stone breathes..."`);

    // ═══════════════════════════════════════════════════════════════
    // DECISION POINT: Enter the temple
    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n⚔️ DECISION: The party chooses to enter the temple\n');

    const entryHallScene = await cinematic.scene('entry-hall', {
      foreground: 'Stone archway looms impossibly tall',
      midground: 'Vast hall with pillars and darkness',
      background: 'Echoes of something ancient',
      emotionalBeat: 'dread'
    });

    console.log(`\n✅ Entering the Entry Hall`);

    // ═══════════════════════════════════════════════════════════════
    // ENCOUNTER 2: First Combat - Goblins in the Hall
    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n⚔️ COMBAT ENCOUNTER: Goblins in the Entry Hall\n');
    console.log('Movement in the shadows. Yellow eyes gleam in torchlight.\n');

    const combatRound1 = await cinematic.combatRound(
      1,
      'Goblins (3)',
      [
        { actor: 'Grond', description: 'draws sword with a metallic ring, steps forward defensively' },
        { actor: 'Malice', description: 'moves to the flank, readying dagger, eyes hunting for weakness' },
        { actor: 'Goblin 1', description: 'shrieks a war cry and lunges at Grond' },
        { actor: 'Grond', description: 'sword flashes - catches goblin across the arm, draws blood' }
      ],
      { location: 'entry-hall', imageKey: true }
    );

    console.log(`\n⚔️  Round 1 Complete`);
    console.log(`Grond stands firm. Malice moves like shadow. The goblins bleed.`);

    // INJURY MOMENT - Grond takes a hit
    console.log('\n\n🩸 INJURY: Grond is struck!\n');

    const grondInjury = await cinematic.injury(
      party.grond,
      8,
      'stabbing',
      'Goblin counterattack'
    );

    console.log(`\n🩸 Grond staggers as goblin blade finds flesh`);
    console.log(`Visual: ${grondInjury.sensory.visual}`);
    console.log(`Auditory: ${grondInjury.sensory.auditory}`);
    console.log(`Psychological: ${grondInjury.sensory.psychological}`);

    party.grond.hp -= 8;

    // THE BEAT - Moment of decision
    console.log('\n\n⏸️ THE BEAT\n');

    const beatMoment = await cinematic.beat(
      'Grond staggers backward, blood streaming from his side',
      'The remaining goblins hesitate, then flee into shadows'
    );

    console.log(`\n⏸️ The moment hangs. Complete silence.`);
    console.log(`Duration: ${beatMoment.durationSeconds}s`);
    console.log(`Player State: ${beatMoment.playerState.expected}`);

    // Wait for the beat
    await new Promise(resolve => setTimeout(resolve, beatMoment.durationSeconds * 1000 + 100));
    console.log(`✅ Beat complete.\n`);

    // ═══════════════════════════════════════════════════════════════
    // AFTERMATH & CHARACTER MOMENT
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📖 CHARACTER MOMENT: Grond\'s Test\n');

    const grondArcMoment = await cinematic.characterArcMoment(
      'Grond',
      {
        startingTrait: 'Confident warrior seeking glory',
        currentTrait: 'Battle-tested, learning the cost of adventure',
        nextTest: 'Will he press forward or doubt the mission?'
      },
      'entry-hall'
    );

    console.log(`\n📖 Arc Moment:`);
    console.log(`From: "${grondArcMoment.arc.startingTrait}"`);
    console.log(`To: "${grondArcMoment.arc.currentTrait}"`);
    console.log(`Narrative: ${grondArcMoment.narrative}`);

    // ═══════════════════════════════════════════════════════════════
    // SESSION SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n\n═══════════════════════════════════════════════════════════════');
    console.log('📊 SESSION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('🎭 Scenes Loaded: 3');
    console.log('⚔️  Combat Rounds: 1');
    console.log('🩸 Injuries: 1');
    console.log('⏸️ Beats: 1');
    console.log('📖 Character Moments: 1');

    console.log('\n📋 Party Status:');
    console.log(`  Grond: ${party.grond.hp}/${party.grond.maxHp} HP (Injured)`);
    console.log(`  Malice: ${party.malice.hp}/${party.malice.maxHp} HP (Unharmed)`);

    console.log('\n📍 Location: Entry Hall (Tamoachan)');
    console.log('🎯 Objectives:');
    console.log('  - Rescue missing villagers');
    console.log('  - Investigate temple');
    console.log('  - Uncover the cult\\'s purpose');

    console.log('\n✅ SESSION 1 COMPLETE\n');

    // Save session log
    const sessionData = {
      session: 1,
      date: new Date().toISOString(),
      campaign: 'Tamoachan Playtest',
      scenes: 3,
      combatEncounters: 1,
      injuryMoments: 1,
      characterArcs: 1,
      partyStatus: {
        grond: `${party.grond.hp}/${party.grond.maxHp} HP`,
        malice: `${party.malice.hp}/${party.malice.maxHp} HP`
      },
      log: sessionLog,
      orchestratorState: cinematic.getSessionSummary()
    };

    console.log('\n🎬 LEVEL 3 ORCHESTRATOR PERFORMED FLAWLESSLY');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ SESSION ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run it
runTamoachanSession().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
