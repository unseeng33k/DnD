#!/usr/bin/env node

/**
 * Ultimate DM Enhancement System
 * Sound effects, NPC voices, combat maps, inventory tracking, XP, weather, time, hirelings, recaps, death saves
 */

const fs = require('fs');
const path = require('path');

// Sound Effects Library
const SFX = {
  combat: {
    sword_hit: 'https://www.youtube.com/results?search_query=sword+hit+sound+effect',
    sword_miss: 'https://www.youtube.com/results?search_query=sword+swing+miss+sound+effect',
    arrow_shot: 'https://www.youtube.com/results?search_query=arrow+shoot+sound+effect',
    arrow_hit: 'https://www.youtube.com/results?search_query=arrow+hit+sound+effect',
    monster_roar: 'https://www.youtube.com/results?search_query=monster+roar+sound+effect',
    armor_hit: 'https://www.youtube.com/results?search_query=armor+clang+sound+effect',
    spell_cast: 'https://www.youtube.com/results?search_query=magic+spell+cast+sound+effect',
    spell_explosion: 'https://www.youtube.com/results?search_query=fireball+explosion+sound+effect'
  },
  environment: {
    door_creak: 'https://www.youtube.com/results?search_query=door+creak+sound+effect',
    door_slam: 'https://www.youtube.com/results?search_query=door+slam+sound+effect',
    stone_grind: 'https://www.youtube.com/results?search_query=stone+grinding+sound+effect',
    water_drip: 'https://www.youtube.com/results?search_query=water+drip+cave+sound+effect',
    torch_crackle: 'https://www.youtube.com/results?search_query=torch+fire+crackle+sound+effect',
    footsteps_stone: 'https://www.youtube.com/results?search_query=footsteps+stone+echo+sound+effect',
    chain_rattle: 'https://www.youtube.com/results?search_query=chain+rattle+sound+effect'
  },
  reactions: {
    critical_hit: 'https://www.youtube.com/results?search_query=epic+hit+sound+effect',
    critical_miss: 'https://www.youtube.com/results?search_query=fail+sound+effect+sad+trombone',
    level_up: 'https://www.youtube.com/results?search_query=level+up+fanfare+sound+effect',
    death_knell: 'https://www.youtube.com/results?search_query=death+bell+sound+effect',
    treasure_found: 'https://www.youtube.com/results?search_query=treasure+chest+open+sound+effect'
  }
};

// NPC Voice Generator (text prompts for ElevenLabs)
const NPC_VOICES = {
  gruff_mercenary: { accent: 'gruff, smoker, Northern English', example: '"Ye want me to stick me neck out for WHAT?"' },
  nervous_scholar: { accent: 'trembling, high-pitched, stuttering', example: '"I-I-I've read about this place! We shouldn't be here!"' },
  sultry_tavern_wench: { accent: 'sultry, playful, slight brogue', example: '"Buy a girl a drink, handsome? I know things..."' },
  ancient_lich: { accent: 'hollow, echoing, ancient, no breath', example: '"You... disturb... my... rest..."' },
  goblin_sneak: { accent: 'high, nasal, fast, squeaky', example: '"Shiny! Gimme shiny or I stick!"' },
  noble_knight: { accent: 'posh, formal, slightly arrogant', example: '"Stand aside, peasant. I shall deal with this."' },
  mysterious_stranger: { accent: 'low, whispered, ambiguous accent', example: '"I know a way. But the price... is steep."' }
};

// Combat Map Generator (ASCII)
function generateCombatMap(party, enemies, terrain) {
  const width = 10;
  const height = 8;
  let map = '\n' + '='.repeat(width * 2 + 2) + '\n';
  
  for (let y = 0; y < height; y++) {
    map += '|';
    for (let x = 0; x < width; x++) {
      // Simple terrain
      let char = '.';
      if (terrain === 'forest' && Math.random() > 0.7) char = 'T'; // Tree
      if (terrain === 'dungeon' && (x === 0 || x === width - 1)) char = '#'; // Wall
      if (terrain === 'water' && y > 4) char = '~';
      map += char + ' ';
    }
    map += '|\n';
  }
  
  map += '='.repeat(width * 2 + 2) + '\n';
  map += `Party: ${party.join(', ')}\n`;
  map += `Enemies: ${enemies}\n`;
  map += `Terrain: ${terrain}\n`;
  
  return map;
}

// Time & Weather Tracker
class GameTracker {
  constructor() {
    this.time = { hour: 8, minute: 0, day: 1 };
    this.weather = 'clear';
    this.torches = 6; // 1 hour each
    this.rations = 7; // days
    this.spellDurations = [];
  }
  
  advanceTime(minutes) {
    this.time.minute += minutes;
    while (this.time.minute >= 60) {
      this.time.minute -= 60;
      this.time.hour++;
    }
    while (this.time.hour >= 24) {
      this.time.hour -= 24;
      this.time.day++;
      this.rations--;
    }
    return this.getTimeString();
  }
  
  getTimeString() {
    const ampm = this.time.hour >= 12 ? 'PM' : 'AM';
    const hour12 = this.time.hour % 12 || 12;
    return `Day ${this.time.day}, ${hour12}:${this.time.minute.toString().padStart(2, '0')} ${ampm}`;
  }
  
  useTorch() {
    if (this.torches > 0) {
      this.torches--;
      return { success: true, remaining: this.torches };
    }
    return { success: false, message: 'No torches remaining!' };
  }
  
  checkSupplies() {
    return {
      torches: this.torches,
      rations: this.rations,
      water: 'adequate',
      warning: this.torches < 3 ? 'LOW ON TORCHES' : null
    };
  }
}

// XP & Level Tracker
const XP_TABLES = {
  'Fighter': [0, 2000, 4000, 8000, 18000, 35000, 70000, 125000, 250000, 500000],
  'Cleric': [0, 1500, 3000, 6000, 13000, 27500, 55000, 110000, 225000, 450000],
  'Magic-User': [0, 2500, 5000, 10000, 22500, 40000, 60000, 90000, 135000, 250000],
  'Thief': [0, 1250, 2500, 5000, 10000, 20000, 40000, 70000, 110000, 160000]
};

function checkLevelUp(characterClass, currentXP, currentLevel) {
  const table = XP_TABLES[characterClass] || XP_TABLES['Fighter'];
  const nextLevelXP = table[currentLevel];
  
  if (currentXP >= nextLevelXP) {
    return {
      leveled: true,
      newLevel: currentLevel + 1,
      nextXP: table[currentLevel + 1] || 'MAX',
      message: `🎉 LEVEL UP! You are now level ${currentLevel + 1}!`
    };
  }
  
  return {
    leveled: false,
    current: currentXP,
    needed: nextLevelXP - currentXP,
    message: `${nextLevelXP - currentXP} XP needed for level ${currentLevel + 1}`
  };
}

// Random Encounter Tables
const ENCOUNTER_TABLES = {
  jungle: [
    '2d6 Giant Leeches',
    '1d4+1 Lizardfolk patrol',
    '1 Giant Constrictor Snake',
    '2d6 Stirges',
    '1 Jaguar',
    '1d6 Giant Spiders',
    'Poisonous plant (save or 1d6 dmg)',
    'Quicksand (DEX check or trapped)',
    'Ancient shrine (may have treasure)',
    'Friendly explorer (needs help)'
  ],
  dungeon: [
    '2d6 Giant Rats',
    '1d6 Skeletons',
    '1d4 Zombies',
    '1 Gelatinous Cube',
    '1d6 Goblins',
    '1d4 Hobgoblins',
    '1 Gray Ooze',
    '1 Rust Monster',
    'Wandering merchant (sells gear)',
    'Other adventurers (hostile or friendly)'
  ],
  swamp: [
    '2d6 Giant Leeches',
    '1d4+2 Lizardfolk',
    '1 Giant Crocodile',
    '1d6 Troglodytes',
    '1 Shambling Mound',
    '1d4 Will-o-Wisps',
    'Quicksand',
    'Disease (save or sick for 1d4 days)',
    'Abandoned boat (supplies?)',
    'Swamp hermit (knows secrets)'
  ]
};

function rollEncounter(terrain) {
  const table = ENCOUNTER_TABLES[terrain];
  if (!table) return null;
  
  const roll = Math.floor(Math.random() * 20) + 1;
  if (roll <= 16) {
    const encounter = table[Math.floor(Math.random() * table.length)];
    return { encountered: true, what: encounter, roll };
  }
  return { encountered: false, roll };
}

// Hireling/Henchman Generator
function generateHireling() {
  const names = ['Hodgkiss', 'Mert', 'Jocelyn', 'Wart', 'Pip', 'Thistle', 'Gorm', 'Mira'];
  const types = ['Torchbearer (2gp/day)', 'Porter (1gp/day)', 'Mercenary (5gp/day)', 'Guide (10gp/day)', 'Linkboy (1gp/day)'];
  const personalities = ['Cowardly', 'Brave', 'Greedy', 'Loyal', 'Drunkard', 'Suspicious', 'Cheerful', 'Grim'];
  
  return {
    name: names[Math.floor(Math.random() * names.length)],
    type: types[Math.floor(Math.random() * types.length)],
    personality: personalities[Math.floor(Math.random() * personalities.length)],
    hp: Math.floor(Math.random() * 6) + 1,
    loyalty: Math.floor(Math.random() * 6) + 7 // 2d6 roll
  };
}

// Death Save System (AD&D 1e style)
function deathSave(hp, con) {
  if (hp > 0) return { status: 'alive', hp };
  if (hp <= -10) return { status: 'dead', message: 'Instant death. Body destroyed.' };
  
  // Between 0 and -9: unconscious, bleeding out
  const roundsToDeath = Math.abs(hp);
  return {
    status: 'dying',
    message: `Unconscious! Bleeding out in ${roundsToDeath} rounds unless healed!`,
    saveNeeded: true,
    conCheck: con // Roll d20 under CON to stabilize
  };
}

// Session Recap Generator
function generateRecap(sessionLog) {
  return `
📜 PREVIOUSLY ON YOUR ADVENTURE...

${sessionLog}

🎒 CURRENT STATUS:
- Location: [Last known location]
- Wounds: [HP status]
- Supplies: [Torch/Ration count]
- Active Quests: [Open threads]

What do you do?
`;
}

module.exports = {
  SFX,
  NPC_VOICES,
  generateCombatMap,
  GameTracker,
  checkLevelUp,
  rollEncounter,
  generateHireling,
  deathSave,
  generateRecap
};

// CLI demo
if (require.main === module) {
  console.log('🎲 ULTIMATE DM ENHANCEMENT SYSTEM\n');
  
  console.log('🔊 SOUND EFFECTS:');
  console.log('  Combat:', Object.keys(SFX.combat).join(', '));
  console.log('  Environment:', Object.keys(SFX.environment).join(', '));
  
  console.log('\n🎭 NPC VOICES:');
  console.log('  ', Object.keys(NPC_VOICES).join(', '));
  
  console.log('\n⚔️  COMBAT MAP:');
  console.log(generateCombatMap(['Fighter', 'Mage'], '6 Goblins', 'forest'));
  
  console.log('\n⏰ TIME TRACKER:');
  const tracker = new GameTracker();
  console.log('  Start:', tracker.getTimeString());
  tracker.advanceTime(120);
  console.log('  +2 hours:', tracker.getTimeString());
  console.log('  Supplies:', tracker.checkSupplies());
  
  console.log('\n📈 XP CHECK:');
  console.log(checkLevelUp('Fighter', 3500, 2));
  
  console.log('\n🎲 RANDOM ENCOUNTER:');
  console.log(rollEncounter('jungle'));
  
  console.log('\n👥 HIRELING:');
  console.log(generateHireling());
  
  console.log('\n💀 DEATH SAVE:');
  console.log('  HP -3:', deathSave(-3, 14));
  console.log('  HP -12:', deathSave(-12, 14));
}
