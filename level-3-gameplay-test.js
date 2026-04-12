#!/usr/bin/env node

/**
 * LEVEL 3 CINEMATIC AMBIANCE ORCHESTRATOR - GAMEPLAY TEST
 * 
 * This test fires up the full orchestrator and runs through:
 * 1. Scene loading with cinematic guidance
 * 2. Combat round choreography
 * 3. Injury moment with full 5-sense cascade
 * 4. The Beat (narrative silence)
 * 5. Character arc moment
 */

import { EventBus } from './src/core/event-bus.js';
import { CinematicAmbianceOrchestrator } from './src/systems/cinematic-ambiance-orchestrator.js';

// Mock image handler (since we might not have real images)
const imageHandler = {
  generateImageDALLE: async (prompt) => {
    console.log(`  [IMAGE GENERATED] ${prompt}`);
    return {
      success: true,
      filepath: '/mock/image.jpg',
      prompt,
      url: 'https://mock-image-url.jpg'
    };
  },
  sendImageToTelegram: async (filepath, chatId, caption) => {
    console.log(`  [TELEGRAM] Sent image: ${caption.substring(0, 50)}...`);
  },
  sendTextToTelegram: async (chatId, message) => {
    console.log(`  [TELEGRAM] Sent text: ${message.substring(0, 50)}...`);
  }
};

// Mock systems
const systems = {
  ambianceRegistry: {
    get: (sceneName) => {
      const ambiances = {
        'castle-ravenloft': {
          music: 'https://youtube.com/watch?v=DREAD',
          imagePrompt: 'Ravenloft castle looming in fog, Gothic architecture, storm clouds',
          sensory: {
            visual: 'The castle dominates the skyline, impossibly tall towers pierce storm clouds',
            auditory: 'Wind howls through stone corridors, distant thunder rumbles',
            olfactory: 'Cold stone, decay, ancient magic in the air',
            tactile: 'Chill wind cuts through clothing, cobblestones slick with moisture',
            gustatory: 'Copper taste of fear and old blood'
          }
        },
        'throne-room': {
          music: 'https://youtube.com/watch?v=EVIL',
          imagePrompt: 'Dark throne room with crimson drapes, Count Strahd seated',
          sensory: {
            visual: 'A crimson throne dominates the chamber. Strahd watches from shadow.',
            auditory: 'Silence. Oppressive. Your heartbeat sounds like a war drum.',
            olfactory: 'Incense and something older. Animal? Human? Both?',
            tactile: 'The air feels alive. Watching. Judging.',
            gustatory: 'Ash on your tongue'
          }
        }
      };
      return ambiances[sceneName];
    }
  }
};

async function runGameplayTest() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎬 LEVEL 3 CINEMATIC AMBIANCE ORCHESTRATOR - GAMEPLAY TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create event bus and orchestrator
  const eventBus = new EventBus();
  const cinematic = new CinematicAmbianceOrchestrator(
    eventBus,
    systems,
    imageHandler,
    {
      verbose: true,
      enableImages: true,
      telegramChatId: 'test-chat-id'
    }
  );

  // Listen to all cinematic events
  eventBus.on('cinematic:scene-loaded', (event) => {
    console.log('\n✅ EVENT: cinematic:scene-loaded');
    console.log(`   Mood: ${event.data.experience.mood}`);
  });

  eventBus.on('cinematic:combat-round', (event) => {
    console.log('\n✅ EVENT: cinematic:combat-round');
    console.log(`   Round ${event.data.roundNumber} vs ${event.data.enemy}`);
  });

  eventBus.on('cinematic:injury-moment', (event) => {
    console.log('\n✅ EVENT: cinematic:injury-moment');
    console.log(`   ${event.data.character} takes ${event.data.damage} ${event.data.damageType}`);
  });

  eventBus.on('cinematic:the-beat', (event) => {
    console.log('\n✅ EVENT: cinematic:the-beat');
    console.log(`   ${event.data.durationSeconds}s of complete silence`);
  });

  eventBus.on('cinematic:character-arc-moment', (event) => {
    console.log('\n✅ EVENT: cinematic:character-arc-moment');
    console.log(`   ${event.data.character} grows from "${event.data.arc.startingTrait}" to "${event.data.arc.currentTrait}"`);
  });

  try {
    // TEST 1: SCENE LOADING
    console.log('\n\n📍 TEST 1: SCENE LOADING');
    console.log('─────────────────────────────────────────────────────────\n');
    
    const sceneExperience = await cinematic.scene('castle-ravenloft', {
      foreground: 'Castle Ravenloft dominates the vista',
      midground: 'Misty courtyard with ancient stone',
      background: 'Thunderstorm rages beyond',
      emotionalBeat: 'dread'
    });

    console.log('\n🎬 Scene Experience:');
    console.log(`   Scene: ${sceneExperience.scene}`);
    console.log(`   Mood: ${sceneExperience.mood}`);
    console.log(`   Visual: ${sceneExperience.sensory.visual.substring(0, 50)}...`);
    console.log(`   Music: ${sceneExperience.music}`);

    // TEST 2: COMBAT ROUND
    console.log('\n\n⚔️  TEST 2: COMBAT ROUND CHOREOGRAPHY');
    console.log('─────────────────────────────────────────────────────────\n');

    const combatMoment = await cinematic.combatRound(
      1,
      'Count Strahd',
      [
        { actor: 'Malice', description: 'lunges with sword, screaming defiance' },
        { actor: 'Strahd', description: 'parries effortlessly, eyes gleaming red' },
        { actor: 'Malice', description: 'sword catches on armor, sparks fly' },
        { actor: 'Strahd', description: 'counterattack - wound opens across Malice\'s shoulder' }
      ],
      { location: 'throne-room', imageKey: true }
    );

    console.log('\n⚔️  Combat Experience:');
    console.log(`   Round: ${combatMoment.roundNumber}`);
    console.log(`   Enemy: ${combatMoment.enemy}`);
    console.log(`   Pace: ${combatMoment.choreography.pace}`);
    console.log(`   Actions: ${combatMoment.actions.length}`);
    console.log(`   Sensory - Visual: ${combatMoment.sensory.visual}`);
    console.log(`   Sensory - Auditory: ${combatMoment.sensory.auditory}`);

    // TEST 3: INJURY MOMENT
    console.log('\n\n🩸 TEST 3: INJURY MOMENT (5-SENSE CASCADE)');
    console.log('─────────────────────────────────────────────────────────\n');

    const maliceCharacter = { name: 'Malice' };
    const injuryMoment = await cinematic.injury(
      maliceCharacter,
      14,
      'slashing',
      'Strahd\'s counterattack'
    );

    console.log('\n🩸 Injury Experience:');
    console.log(`   Character: ${injuryMoment.character}`);
    console.log(`   Damage: ${injuryMoment.damage} ${injuryMoment.damageType}`);
    console.log(`   Narrative: ${injuryMoment.narrative}`);
    console.log(`\n   FIVE SENSES:`);
    console.log(`   👁️  Visual: ${injuryMoment.sensory.visual}`);
    console.log(`   🔊 Auditory: ${injuryMoment.sensory.auditory}`);
    console.log(`   👃 Olfactory: ${injuryMoment.sensory.olfactory}`);
    console.log(`   👆 Tactile: ${injuryMoment.sensory.tactile}`);
    console.log(`   👅 Gustatory: ${injuryMoment.sensory.gustatory}`);
    console.log(`   🧠 Psychological: ${injuryMoment.sensory.psychological}`);
    console.log(`\n   Impact: Severe=${injuryMoment.impact.isSevere}, Meaningful=${injuryMoment.impact.isMeaningful}`);

    // TEST 4: THE BEAT
    console.log('\n\n⏸️  TEST 4: THE BEAT (NARRATIVE SILENCE)');
    console.log('─────────────────────────────────────────────────────────\n');

    const beatMoment = await cinematic.beat(
      'Malice staggers backward, blood flowing',
      'Strahd smiles, savoring the moment'
    );

    console.log('\n⏸️  The Beat:');
    console.log(`   Duration: ${beatMoment.durationSeconds} seconds`);
    console.log(`   Sensory - Sound: ${beatMoment.sensory.sound}`);
    console.log(`   Instruction: ${beatMoment.instruction}`);
    console.log(`   Player State: ${beatMoment.playerState.expected}`);
    console.log(`   Emotional Impact: ${beatMoment.playerState.emotional}`);

    // Wait for beat to complete
    await new Promise(resolve => setTimeout(resolve, beatMoment.durationSeconds * 1000 + 100));
    console.log('\n   ✅ Beat completed.');

    // TEST 5: CHARACTER ARC MOMENT
    console.log('\n\n📖 TEST 5: CHARACTER ARC MOMENT');
    console.log('─────────────────────────────────────────────────────────\n');

    const arcMoment = await cinematic.characterArcMoment(
      'Malice',
      {
        startingTrait: 'Reckless rebel seeking glory',
        currentTrait: 'Bloodied warrior facing mortality',
        nextTest: 'Will she surrender or stand and fight?'
      },
      'throne-room'
    );

    console.log('\n📖 Character Arc Moment:');
    console.log(`   Character: ${arcMoment.character}`);
    console.log(`   Arc Narrative: ${arcMoment.narrative}`);
    console.log(`   Significance: ${arcMoment.significance}`);
    console.log(`   Guidance: ${arcMoment.guidance}`);
    console.log(`   Sensory Visual: ${arcMoment.sensory.sensory?.visual || 'N/A'}`);
    console.log(`   Delivery Timing: ${arcMoment.deliveryTiming}`);

    // SESSION SUMMARY
    console.log('\n\n📊 SESSION SUMMARY');
    console.log('═════════════════════════════════════════════════════════');
    const summary = cinematic.getSessionSummary();
    console.log(`\nScenes Loaded: ${summary.scenes}`);
    console.log(`Total Moments Logged: ${summary.moments}`);
    console.log(`Current Scene: ${summary.currentScene}`);
    console.log(`Current Mood: ${summary.currentMood}`);
    console.log(`\nScenes:`);
    summary.sceneHistory.forEach((scene, i) => {
      console.log(`  ${i + 1}. ${scene.name} (${scene.mood})`);
    });

    console.log('\n\n✅ ALL TESTS PASSED!');
    console.log('═════════════════════════════════════════════════════════\n');
    console.log('🎬 GAMEPLAY TEST COMPLETE\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runGameplayTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
