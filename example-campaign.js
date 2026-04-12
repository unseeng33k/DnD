#!/usr/bin/env node

/**
 * EXAMPLE: Using the Complete Backend System
 * 
 * This shows how to:
 * 1. Create a module with ModuleBuilder
 * 2. Initialize a campaign with UnifiedDndEngine
 * 3. Handle party decisions with personality system
 * 4. Track NPC relationships and consequences
 * 5. Save campaign state
 */

import { ModuleBuilder } from './module-builder.js';
import { UnifiedDndEngine } from './unified-dnd-engine.js';

async function exampleCampaign() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('EXAMPLE: CURSE OF STRAHD WITH FULL BACKEND SYSTEM');
  console.log('═══════════════════════════════════════════════════════\n');

  // STEP 1: Create the module
  console.log('📚 STEP 1: Creating module with ModuleBuilder\n');

  const module = new ModuleBuilder('curse-of-strahd', 'Curse of Strahd');

  module.setMetadata({
    description: 'Gothic horror adventure in the land of Barovia',
    level: [3, 10],
    length: 'long',
    setting: 'Barovia - A cursed Gothic realm trapped in mist',
    themes: ['gothic', 'horror', 'redemption', 'sacrifice'],
    estimatedPlayTime: '40-50 sessions'
  });

  // Add party members with PERSONALITIES
  module.addPartyMember({
    name: 'Malice Indarae De\'Barazzan',
    class: 'Rogue',
    level: 3,
    hp: 24,
    maxHP: 24,
    ac: 16,
    personality: {
      archetype: 'wildcard',
      traits: {
        openness: 3,
        aggressiveness: 7,
        humor: 'dark',
        riskTolerance: 8,
        compassion: 2
      },
      mannerisms: [
        'Eyes dart to exits',
        'Fingers tap dagger hilt',
        'Half-smile when nervous'
      ],
      catchphrases: [
        'That\'s not my problem.',
        'Let\'s just rob the place.',
        'I\'ve done worse.'
      ],
      voice: {
        dialect: 'street',
        speed: 'fast',
        vocabulary: 'casual'
      }
    },
    goals: {
      primary: 'Survive, by any means',
      secondary: ['Earn enough gold to disappear', 'Find her lost sister'],
      hidden: 'Prove she\'s not as broken as she thinks'
    },
    fears: ['Abandonment', 'Being caged', 'Becoming evil'],
    arc: {
      startingTrait: 'Cynical rogue, trusts no one... yet',
      currentTrait: 'Cynical rogue, trusts no one... yet',
      nextTest: 'Will she trust Grond with her life?'
    }
  });

  module.addPartyMember({
    name: 'Grond Ironhammer',
    class: 'Fighter',
    level: 3,
    hp: 32,
    maxHP: 32,
    ac: 15,
    personality: {
      archetype: 'muscle',
      traits: {
        openness: 5,
        aggressiveness: 8,
        humor: 'crude',
        riskTolerance: 7,
        compassion: 6
      },
      mannerisms: [
        'Pounds fist on table when excited',
        'Laughs deeply at his own jokes',
        'Stands at attention when thinking'
      ],
      catchphrases: ['FOR THE GODS!', 'Let\'s kill something'],
      voice: {
        dialect: 'northern',
        speed: 'slow',
        vocabulary: 'simple'
      }
    },
    goals: {
      primary: 'Protect the innocent',
      secondary: ['Become a legendary warrior', 'Find honor in battle'],
      hidden: 'Atone for his violent past'
    },
    fears: ['Dishonor', 'Weakness in himself'],
    arc: {
      startingTrait: 'Brutal warrior with a code',
      currentTrait: 'Brutal warrior with a code',
      nextTest: 'Can he show mercy when it matters?'
    }
  });

  // Add key NPCs with RELATIONSHIPS
  module.addNPC({
    id: 'strahd-von-zarovich',
    name: 'Strahd Von Zarovich',
    role: 'Villain/Tyrant',
    alignment: 'Chaotic Evil',
    class: 'Vampire',
    level: 15,
    personality: {
      archetype: 'puppet-master',
      traits: {
        openness: 8,
        aggressiveness: 9,
        humor: 'dark',
        riskTolerance: 10,
        compassion: 1
      }
    },
    goals: ['Control Barovia completely', 'Corrupt Ireena'],
    fears: ['Destruction', 'The Sunsword']
  });

  module.addNPC({
    id: 'ireena-kolyana',
    name: 'Ireena Kolyana',
    role: 'Ally/Love Interest',
    alignment: 'Lawful Good',
    class: 'Noblewoman',
    level: 2,
    personality: {
      archetype: 'heart',
      traits: {
        openness: 8,
        aggressiveness: 2,
        humor: 'gentle',
        riskTolerance: 3,
        compassion: 9
      }
    },
    goals: ['Escape Strahd\'s curse', 'Save Barovia'],
    fears: ['Strahd', 'Becoming his bride']
  });

  // Add locations
  module.addLocation({
    id: 'castle-ravenloft',
    name: 'Castle Ravenloft',
    description: 'The dark castle where Strahd dwells, towering above the mists',
    type: 'dungeon',
    atmosphere: 'Dread, majesty, decay'
  });

  module.addLocation({
    id: 'village-barovia',
    name: 'Village of Barovia',
    description: 'A small village surrounded by mist, where the curse is felt most',
    type: 'town',
    atmosphere: 'Despair, secrets'
  });

  // Build the module
  const moduleResult = await module.build();
  console.log(`✅ Module created: ${moduleResult.moduleId}`);
  console.log(`   Locations: ${moduleResult.stats.locations}`);
  console.log(`   NPCs: ${moduleResult.stats.npcs}`);
  console.log(`   Party Members: ${moduleResult.stats.partyMembers}\n`);

  // STEP 2: Initialize campaign
  console.log('🎲 STEP 2: Initialize campaign with UnifiedDndEngine\n');

  const engine = new UnifiedDndEngine('My Strahd Campaign', 'curse-of-strahd');

  const initResult = await engine.initializeCampaign({
    metadata: module.metadata,
    party: module.party,
    npcs: module.npcs
  });

  console.log(`✅ Campaign initialized: ${initResult.campaign}`);
  console.log(`   Party: ${initResult.partySize} members`);
  console.log(`   NPCs: ${initResult.npcCount}\n`);

  // STEP 3: Set up party relationships
  console.log('👥 STEP 3: Set up party relationships\n');

  engine.party.setRelationship('Malice Indarae De\'Barazzan', 'Grond Ironhammer', 'allies', -5);
  console.log('✅ Party relationships configured');
  console.log(`   Malice & Grond: Reluctant allies with tension\n`);

  // STEP 4: Start a session
  console.log('🎭 STEP 4: Start Session 1\n');

  const sessionStart = engine.startSession(1);
  console.log(`✅ Session 1 started`);
  console.log(`   Party morale: ${engine.party.morale}/100\n`);

  // STEP 5: Example decision
  console.log('⚔️  STEP 5: Party makes a decision\n');

  const decision = {
    description: 'Investigate the mysterious fog',
    riskLevel: 7,
    affectsNPCs: ['strahd-von-zarovich'],
    emotionalWeight: 15
  };

  const decisionResult = await engine.handlePartyDecision(
    decision,
    'Malice Indarae De\'Baarzzan'
  );

  console.log(`✅ Malice\'s response: "${decisionResult.response}"`);
  console.log(`   NPC reactions: ${decisionResult.npcReactions.length}\n`);

  // STEP 6: Character arc progression
  console.log('📈 STEP 6: Character arc progression\n');

  const arcResult = engine.progressCharacterArc(
    'Malice Indarae De\'Baarzzan',
    'Will she trust Grond with her life?',
    true // She passed the test!
  );

  console.log(`✅ ${arcResult.character} arc: ${arcResult.result}`);
  console.log(`   Effect: ${arcResult.effect}\n`);

  // STEP 7: Get game state
  console.log('📊 STEP 7: Campaign state snapshot\n');

  const gameState = engine.getGameState();
  console.log(`✅ Game state snapshot:`);
  console.log(`   Campaign: ${gameState.campaign}`);
  console.log(`   Session: ${gameState.session}`);
  console.log(`   Party morale: ${gameState.partyStatus.morale.value}/100`);
  console.log(`   Party morale status: ${gameState.partyStatus.morale.status}`);
  console.log(`   Events occurred: ${gameState.worldState.eventsOccurred.length}\n`);

  // STEP 8: Save campaign
  console.log('💾 STEP 8: Save campaign state\n');

  const savePath = engine.saveCampaignState('/Users/mpruskowski/.openclaw/workspace/dnd/campaigns/strahd-campaign-state.json');
  console.log(`✅ Campaign saved to: ${savePath}\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('EXAMPLE COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('NEXT STEPS:');
  console.log('1. Load the campaign with UnifiedDndEngine.loadCampaignState()');
  console.log('2. Continue sessions with engine.startSession(2), engine.startSession(3), etc.');
  console.log('3. Track all party decisions, NPC reactions, and character growth');
  console.log('4. Campaign state automatically manages everything\n');
}

// Run example
exampleCampaign().catch(console.error);
