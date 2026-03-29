#!/usr/bin/env node

/**
 * TAMOACHAN SESSION 2 - DESCENT INTO DARKNESS
 * 
 * The goblins have fled. The beat is over. Now the party descends deeper.
 * More combat. Mysteries emerge. Character arcs deepen. The cult's purpose revealed.
 */

import { EventBus } from './src/core/event-bus.js';
import { CinematicAmbianceOrchestrator } from './src/systems/cinematic-ambiance-orchestrator.js';

// Party state (continuing from Session 1)
const party = {
  grond: { name: 'Grond', class: 'Fighter', hp: 20, maxHp: 28, injured: true, morale: 'cautious' },
  malice: { name: 'Malice', class: 'Rogue', hp: 16, maxHp: 16, injured: false, morale: 'hunting' }
};

const imageHandler = {
  generateImageDALLE: async (prompt) => {
    console.log(`  [IMAGE] ${prompt.substring(0, 50)}...`);
    return { success: true, filepath: '/mock/image.jpg', prompt, url: 'https://mock-image.jpg' };
  },
  sendImageToTelegram: async (filepath, chatId, caption) => { console.log(`  [TELEGRAM] Image`); },
  sendTextToTelegram: async (chatId, message) => { console.log(`  [TELEGRAM] Text`); }
};

const tamoScenes = {
  'chamber-three-archways': {
    official: 'Chamber of Three Archways',
    music: 'https://youtube.com/watch?v=mystery',
    imagePrompt: 'Three massive stone archways in darkness, each leading to unknown depths',
    sensory: {
      visual: 'Three archways carved from living stone. Each glows faintly with strange markings',
      auditory: 'Wind echoes through the archways. Distant chanting maybe? Or just wind?',
      olfactory: 'Incense mixed with something organic. Ancient and wrong',
      tactile: 'Cold stone. But one archway radiates heat',
      gustatory: 'Taste of ash. Copper underneath'
    }
  },
  'hall-glyphs': {
    official: 'Hall of the Glyphs',
    music: 'https://youtube.com/watch?v=knowledge',
    imagePrompt: 'Ancient chamber with walls covered in glowing Aztec glyphs and symbols',
    sensory: {
      visual: 'Walls covered in glyphs. Some glow faintly. The symbols seem to shift in torchlight',
      auditory: 'A low hum. Is it the stones? Or something beneath?',
      olfactory: 'Mineral dust. Ground limestone. Something ceremonial',
      tactile: 'The air vibrates. The hum is felt more than heard',
      gustatory: 'Stone dust coats the tongue. Ancient magic tastes like decay'
    }
  },
  'pool-chamber': {
    official: 'Pool Chamber',
    music: 'https://youtube.com/watch?v=water',
    imagePrompt: 'Massive underground pool, perfectly still, black as oil, stars reflected in surface',
    sensory: {
      visual: 'A pool of perfect darkness. The water is still. Impossibly still. Too still',
      auditory: 'Silence from the water. But breathing behind you in the dark',
      olfactory: 'Mineral-rich water. Something dead beneath the surface',
      tactile: 'Moisture in the air. Cold radiates from the pool',
      gustatory: 'Salt. Iron. Fear'
    }
  }
};

async function runSession2() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🌴 TAMOACHAN SESSION 2 - DEEPER INTO DARKNESS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const eventBus = new EventBus();
  const cinematic = new CinematicAmbianceOrchestrator(
    eventBus,
    { ambianceRegistry: { get: (s) => tamoScenes[s] || tamoScenes['chamber-three-archways'] } },
    imageHandler,
    { verbose: true, enableImages: false, telegramChatId: 'test' }
  );

  let sessionLog = [];

  // ═══════════════════════════════════════════════════════════════
  // OPENING: Reflection on the fight
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📍 OPENING: The Silence After\n');
  console.log('The goblins have fled into darkness. Grond breathes heavily, hand pressed to wound.');
  console.log('Malice stands alert, dagger ready, eyes scanning shadows.\n');

  // Decision point
  console.log('The party decides to press deeper. The villagers must be found.\n');

  // ═══════════════════════════════════════════════════════════════
  // SCENE 1: Chamber of Three Archways
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🌀 SCENE: Chamber of Three Archways\n');

  const archwayScene = await cinematic.scene('chamber-three-archways', {
    foreground: 'Three massive archways carved with intricate glyphs',
    midground: 'Darkness beyond each arch. Unknowable depths',
    background: 'The temple stretches into legend',
    emotionalBeat: 'mystery'
  });

  console.log(`\n✅ Chamber revealed. Mood: ${archwayScene.mood}`);
  console.log(`Visual: ${archwayScene.sensory.visual}`);
  console.log('Malice traces a glyph with her finger. "Magic," she whispers. "Old magic."');

  sessionLog.push('[SCENE] Chamber of Three Archways - party must choose a path');

  // ═══════════════════════════════════════════════════════════════
  // CHOICE: Which archway?
  // ═══════════════════════════════════════════════════════════════
  console.log('\n\n🔮 DECISION: The Center Archway glows faintly');
  console.log('It radiates heat. The choice feels ominous.\n');

  // ═══════════════════════════════════════════════════════════════
  // SCENE 2: Hall of the Glyphs
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📜 SCENE: Hall of the Glyphs\n');

  const glyphScene = await cinematic.scene('hall-glyphs', {
    foreground: 'Walls alive with glyphs, pulsing with faint light',
    midground: 'The hum grows louder',
    background: 'Something watches from the stone',
    emotionalBeat: 'revelation'
  });

  console.log(`\n✅ The glyphs tell a story. Language: Olman. The ritual text speaks of...`);
  console.log('...summoning. Sacrifice. "Something ancient stirs beneath the city."');

  sessionLog.push('[SCENE] Hall of the Glyphs - cult ritual revealed');

  // ═══════════════════════════════════════════════════════════════
  // ENCOUNTER 2: Lizard Men in the Pool Chamber
  // ═══════════════════════════════════════════════════════════════
  console.log('\n\n🌊 SCENE: Pool Chamber\n');
  console.log('The party enters. The pool is vast. Black. Still.\n');
  console.log('Something moves beneath.\n');

  const poolScene = await cinematic.scene('pool-chamber', {
    foreground: 'The pool surface begins to ripple',
    midground: 'Shapes rise from darkness',
    background: 'Ancient eyes open beneath',
    emotionalBeat: 'terror'
  });

  console.log(`\n✅ The pool erupts. Lizard men. Scaled. Hungry.\n`);

  // COMBAT: Lizard Men
  console.log('\n⚔️ COMBAT: Round 1 - Pool Chamber Battle\n');

  const combat2 = await cinematic.combatRound(
    1,
    'Lizard Men (4)',
    [
      { actor: 'Grond', description: 'draws sword despite fresh wound, stands between party and water' },
      { actor: 'Malice', description: 'moves to high ground on rocks, positioning for strikes' },
      { actor: 'Lizard Man 1', description: 'crawls from water, hisses a warning to others' },
      { actor: 'Lizard Man 2', description: 'charges Grond with claws extended' },
      { actor: 'Grond', description: 'meets the charge, sword whistles through air' }
    ],
    { location: 'pool-chamber', imageKey: true }
  );

  console.log(`\n⚔️  Round 1: Steel meets claws. The water churns red.\n`);

  sessionLog.push('[COMBAT] Lizard men in Pool Chamber - brutal melee');

  // ═══════════════════════════════════════════════════════════════
  // INJURY: Malice takes a hit
  // ═══════════════════════════════════════════════════════════════
  console.log('\n🩸 INJURY: Malice is caught!\n');

  const maliceInjury = await cinematic.injury(
    party.malice,
    6,
    'clawing',
    'Lizard man slashes across her arm'
  );

  console.log(`\n🩸 Malice's arm erupts in pain. Blood clouds the water.`);
  console.log(`Psychological: ${maliceInjury.sensory.psychological}`);

  party.malice.hp -= 6;
  party.malice.injured = true;

  // ═══════════════════════════════════════════════════════════════
  // CRITICAL BEAT: The Lizard Men Retreat
  // ═══════════════════════════════════════════════════════════════
  console.log('\n\n⏸️ THE BEAT: Something Emerges\n');

  const beat2 = await cinematic.beat(
    'The lizard men suddenly cease their attack, hissing in unison',
    'They back toward the water. Something vast moves beneath the surface'
  );

  console.log(`\n⏸️ Complete silence. The moment stretches.`);
  console.log(`A shadow passes beneath the pool. Something ANCIENT.`);
  console.log(`${beat2.durationSeconds}s of absolute silence.\n`);

  await new Promise(resolve => setTimeout(resolve, beat2.durationSeconds * 1000 + 100));
  console.log(`✅ The moment breaks. The lizard men vanish into the water.\n`);

  sessionLog.push('[BEAT] Something ancient beneath the pool - full party freeze moment');

  // ═══════════════════════════════════════════════════════════════
  // CHARACTER ARCS: Both characters evolve
  // ═══════════════════════════════════════════════════════════════
  console.log('\n📖 CHARACTER ARC: Malice\'s Test\n');

  const maliceArc = await cinematic.characterArcMoment(
    'Malice',
    {
      startingTrait: 'Shadow dancer, untouched by consequences',
      currentTrait: 'Warrior learning that water runs red with her own blood',
      nextTest: 'Does she run or stay and fight?'
    },
    'pool-chamber'
  );

  console.log(`\n📖 Malice Arc: From untouchable to vulnerable.`);
  console.log(`Her hand presses to the wound. First real scar of this adventure.`);

  sessionLog.push('[ARC] Malice wounded - becomes human');

  console.log('\n\n📖 CHARACTER ARC: Grond\'s Resolve\n');

  const grondArc2 = await cinematic.characterArcMoment(
    'Grond',
    {
      startingTrait: 'Confident fighter seeking glory',
      currentTrait: 'Protector willing to stand before darkness',
      nextTest: 'The cost of protection'
    },
    'pool-chamber'
  );

  console.log(`\n📖 Grond Arc: From warrior to shield.`);
  console.log(`He steps in front of Malice without hesitation. The cost is written in blood.`);

  sessionLog.push('[ARC] Grond becomes protector - defines self through sacrifice');

  // ═══════════════════════════════════════════════════════════════
  // REVELATION: What was that?
  // ═══════════════════════════════════════════════════════════════
  console.log('\n\n💀 REVELATION\n');
  console.log('Tomas\' warnings make new sense.');
  console.log('"The stone breathes." He was right.');
  console.log('Something is being KEPT in this temple.');
  console.log('Something that commands even the lizard men.\n');

  sessionLog.push('[REVELATION] Ancient thing beneath temple - lizard men serve it');

  // ═══════════════════════════════════════════════════════════════
  // SESSION SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 SESSION 2 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('🎭 Scenes Loaded: 3 (archways, glyphs, pool)');
  console.log('⚔️  Combat Rounds: 1 (lizard men)');
  console.log('🩸 Injuries: 1 (Malice clawed)');
  console.log('⏸️ Beats: 1 (ancient thing beneath pool)');
  console.log('📖 Character Moments: 2 (Malice vulnerability, Grond protection)');

  console.log('\n📋 Party Status:');
  console.log(`  Grond: ${party.grond.hp}/${party.grond.maxHp} HP (Wounded - from Session 1)`);
  console.log(`  Malice: ${party.malice.hp}/${party.malice.maxHp} HP (Newly wounded)`);
  console.log('  Morale: Cautious but determined');

  console.log('\n🔍 Information Gathered:');
  console.log('  ✓ Cult is conducting ancient ritual');
  console.log('  ✓ Ritual involves summoning/binding');
  console.log('  ✓ Something vast dwells beneath the temple');
  console.log('  ✓ Lizard men serve this thing');
  console.log('  ✓ Villagers likely sacrifices in ongoing ritual');

  console.log('\n🎯 Next Objectives:');
  console.log('  1. Find the sacrifice chamber');
  console.log('  2. Stop the ritual before completion');
  console.log('  3. Discover what the thing beneath really is');

  console.log('\n📍 Location: Pool Chamber (Tamoachan deeper levels)');
  console.log('\n✅ SESSION 2 COMPLETE\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const orchestratorSummary = cinematic.getSessionSummary();
  console.log(`🎬 LEVEL 3 ORCHESTRATOR: ${orchestratorSummary.moments} moments logged across ${orchestratorSummary.scenes} scenes`);
  console.log('All cinematic beats executed. Campaign momentum building.\n');
}

runSession2().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
