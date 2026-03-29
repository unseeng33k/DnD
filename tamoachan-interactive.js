/**
 * TAMOACHAN INTERACTIVE GAME RUNNER
 * 
 * Player-Driven Gameplay with Level 3 Orchestration
 * 
 * Party: Grond (Fighter, 20/28 HP) + Malice (Rogue, 10/16 HP)
 * Location: Pool Chamber (just survived encounter with ancient thing)
 * Current Situation: Two warriors bloodied, mysteries revealed, decision needed
 */

// GAME STATE
const gameState = {
  currentScene: 'pool-chamber-aftermath',
  round: 2,
  session: 2,
  partyLocation: 'Pool Chamber',
  party: {
    grond: { name: 'Grond', class: 'Fighter', hp: 20, maxHp: 28, morale: 'cautious' },
    malice: { name: 'Malice', class: 'Rogue', hp: 10, maxHp: 16, morale: 'determined' }
  },
  knownInfo: [
    'Cult is binding something ancient beneath temple',
    'Villagers are sacrifices for ongoing ritual',
    'Lizard men serve the thing beneath',
    'Three archways lead to different temple sections',
    'Hall of Glyphs contains ritual instructions'
  ],
  inventory: {
    torches: 4,
    rope: 50,
    healing: 1, // one potion
    weapons: 'equipped',
    tools: 'basic'
  }
};

// SCENE DESCRIPTIONS
const scenes = {
  'pool-chamber-aftermath': {
    title: 'Pool Chamber - Aftermath',
    description: `The water is still again. The lizard men are gone. But something vast moved beneath the surface. 
    
Grond stands bloodied but unbroken. Malice wraps her clawed arm with cloth. The pool reflects torchlight.

Above, three archways lead deeper into the temple. Sounds echo from different directions:
- Left archway: Distant chanting (rhythmic, hypnotic)
- Center archway: The sound of flowing water (echoing, cavernous)
- Right archway: Nothing. Absolute silence (which is somehow worse)

You have limited time. The ritual is HAPPENING NOW.`,
    cinematic: {
      mood: 'tension',
      foreground: 'The still pool. Two warriors catching breath.',
      background: 'Three archways lead into unknowable darkness'
    }
  }
};

// AVAILABLE ACTIONS AT POOL CHAMBER
const availableActions = {
  '1': {
    label: 'Follow the CHANTING (Left Archway)',
    description: 'Head toward the ritual sounds. Risk: might walk into active ceremony. Reward: find villagers/cult directly.',
    consequence: 'Direct confrontation with cult leadership. Combat likely. Villagers visible but at risk.'
  },
  '2': {
    label: 'Investigate the WATER SOUNDS (Center Archway)',
    description: 'The cavernous echo suggests a massive chamber. Something about the sound feels important.',
    consequence: 'Mystery chamber. Might be where the THING is bound. High danger, high revelation.'
  },
  '3': {
    label: 'Approach the SILENCE (Right Archway)',
    description: 'The absolute silence is unnatural. In a temple full of sound, silence is a warning.',
    consequence: 'Unknown. Could be a trap, a guardian, or something even worse. Total mystery.'
  },
  '4': {
    label: 'Use your POTION on someone',
    description: 'Heal one character. Grond: 20→28 HP. Malice: 10→16 HP. Can only do once.',
    consequence: 'Someone gets healed. Lose the potion. Might be crucial later.'
  },
  '5': {
    label: 'REST and gather information',
    description: 'Spend time examining the glyphs here, resting wounds, planning strategy.',
    consequence: 'Might lose tactical advantage (ritual progresses). But gain knowledge and recovery.'
  }
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('🎮 TAMOACHAN - INTERACTIVE GAME RUNNER - SESSION 2 CONTINUED');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📍 CURRENT SITUATION\n');
console.log(scenes['pool-chamber-aftermath'].description);

console.log('\n\n👥 PARTY STATUS');
console.log(`  Grond (Fighter): ${gameState.party.grond.hp}/${gameState.party.grond.maxHp} HP - Morale: ${gameState.party.grond.morale}`);
console.log(`  Malice (Rogue): ${gameState.party.malice.hp}/${gameState.party.malice.maxHp} HP - Morale: ${gameState.party.malice.morale}`);

console.log('\n\n🎯 WHAT DO YOU DO?\n');
Object.entries(availableActions).forEach(([key, action]) => {
  console.log(`[${key}] ${action.label}`);
  console.log(`    → ${action.description}`);
  console.log(`    ⚡ ${action.consequence}\n`);
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('\n💬 Enter your choice (1-5) and your reasoning:');
console.log('   Example: "2 - we need to find the thing beneath the temple"');
console.log('\n   Or describe what you want to do in your own words.');
console.log('   I\'ll orchestrate the consequences using Level 3 cinematic rules.\n');
