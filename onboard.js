#!/usr/bin/env node

/**
 * Full D&D Onboarding System
 * Campaign setup + Module selection + Character creation
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

// Complete D&D Module Library (from user's Dropbox collection)
const MODULES = {
  // I-Series (Intermediate)
  'Tomb of the Lizard King': {
    code: 'I2',
    level: '5-7',
    setting: 'Swamp/Wilderness',
    theme: 'Rescue mission, lizardfolk, cultists',
    description: 'The daughter of a wealthy merchant has been kidnapped by the Lizard King. Navigate treacherous swamps, face lizardfolk warriors, and infiltrate the tomb of an ancient king.'
  },
  'Ravenloft': {
    code: 'I6',
    level: '5-7',
    setting: 'Gothic Horror/Demi-plane',
    theme: 'Vampires, horror, trapped in mist',
    description: 'Trapped in the cursed realm of Barovia, you must face the vampire lord Strahd von Zarovich. Gothic horror at its finest — survival is not guaranteed.'
  },
  'Dwellers of the Forbidden City': {
    code: 'I1',
    level: '4-6',
    setting: 'Jungle/Lost City',
    theme: 'Yuan-ti, mongrelmen, factions',
    description: 'A lost city in the jungle holds the secret of a mysterious drug. Navigate between yuan-ti, mongrelmen, and other factions in this sandbox adventure.'
  },
  'Baltron\'s Beacon': {
    code: 'I7',
    level: '8-10',
    setting: 'Island/Coastal',
    theme: 'Pirates, underwater, ancient evil',
    description: 'An island beacon has gone dark. Pirates, sahuagin, and something ancient beneath the waves await those who investigate.'
  },
  'Ravager of Time': {
    code: 'I8',
    level: '9-12',
    setting: 'Planar/Time',
    theme: 'Time travel, paradox, chronomancy',
    description: 'A threat to time itself sends you hurtling through eras. Dinosaurs, ancient empires, and the end of days all factor into this temporal epic.'
  },
  
  // S-Series (Special)
  'Tomb of Horrors': {
    code: 'S1',
    level: '10+',
    setting: 'Dungeon/Death Trap',
    theme: 'Death traps, Acererak, legendary difficulty',
    description: 'The most infamous dungeon ever written. Only the brave or foolish enter Acererak\'s tomb. Few return. Not for the faint of heart.'
  },
  'White Plume Mountain': {
    code: 'S2',
    level: '5-7',
    setting: 'Volcano/Dungeon',
    theme: 'Traps, puzzles, legendary weapons',
    description: 'Three legendary weapons have been stolen. The thief left a riddle pointing to White Plume Mountain, a volcano filled with bizarre traps and guardians.'
  },
  'Lost Caverns of Tsojcanth': {
    code: 'S4',
    level: '6-10',
    setting: 'Mountain/Caverns',
    theme: 'Archmage\'s lair, treasure hunt, monsters',
    description: 'The archmage Iggwilv\'s lost caverns hold legendary treasure. But her creations — and rivals — still guard them.'
  },
  
  // G/D/Q-Series (Giants/Drow/Queen)
  'Against the Giants': {
    code: 'G1-2-3',
    level: '8-12',
    setting: 'Mountains/Underground',
    theme: 'Giants, steading raids, epic battles',
    description: 'The giants have grown bold, raiding human lands. Strike at their steadings — hill, frost, and fire giant strongholds await.'
  },
  'Vault of the Drow': {
    code: 'D3',
    level: '10-14',
    setting: 'Underdark/City',
    theme: 'Drow, Lolth, demonweb',
    description: 'Descend into the drow city of Erelhei-Cinlu. Navigate house politics, demon summoning, and the path to the Demonweb Pits.'
  },
  'Queen of the Demonweb Pits': {
    code: 'Q1',
    level: '10-14',
    setting: 'Planar/Abyss',
    theme: 'Lolth, demonweb, goddess confrontation',
    description: 'The culmination of the GDQ series. Enter Lolth\'s domain in the Abyss and confront the Spider Queen herself.'
  },
  
  // T-Series (Temple)
  'The Temple of Elemental Evil': {
    code: 'T1-4',
    level: '1-8',
    setting: 'Village/Dungeon',
    theme: 'Elemental cults, Zuggtmoy, sandbox',
    description: 'The village of Hommlet holds secrets. Beneath the nearby ruined moathouse lies a temple to elemental evil — and something worse.'
  },
  
  // U-Series (Underwater/Underground)
  'The Sinister Secret of Saltmarsh': {
    code: 'U1',
    level: '1-3',
    setting: 'Coastal/Village',
    theme: 'Smugglers, haunted house, mystery',
    description: 'A haunted house on the cliffs hides a smuggling operation. Perfect starter adventure with investigation and coastal atmosphere.'
  },
  'Danger at Dunwater': {
    code: 'U2',
    level: '3-5',
    setting: 'Coastal/Lizardfolk',
    theme: 'Lizardfolk, diplomacy, threat assessment',
    description: 'The lizardfolk are arming. Are they a threat or preparing for something worse? Investigation and potential diplomacy await.'
  },
  'The Final Enemy': {
    code: 'U3',
    level: '5-7',
    setting: 'Underwater/Sahuagin',
    theme: 'Sahuagin fortress, underwater combat',
    description: 'The sahuagin threat culminates in an assault on their underwater fortress. Can you stop their invasion before it begins?'
  },
  
  // UK-Series (United Kingdom)
  'Beyond the Crystal Cave': {
    code: 'UK1',
    level: '4-7',
    setting: 'Fey/Otherworld',
    theme: 'Fey, puzzles, whimsical danger',
    description: 'A crystal cave leads to a realm of fey and wonder. But beauty masks danger in this psychedelic adventure.'
  },
  'The Sentinel': {
    code: 'UK2',
    level: '2-5',
    setting: 'Wilderness/Keep',
    theme: 'Bandits, ancient guardian, wilderness',
    description: 'Bandits plague the roads, but they serve a darker master. An ancient sentinel holds secrets best left buried.'
  },
  'The Gauntlet': {
    code: 'UK3',
    level: '3-6',
    setting: 'Dungeon/Test',
    theme: 'Trials, tests, gauntlet challenge',
    description: 'A gauntlet of trials designed to test the worthy. Traps, puzzles, and combat in a proving ground of legend.'
  },
  'When a Star Falls': {
    code: 'UK4',
    level: '3-5',
    setting: 'Wilderness/Impact Site',
    theme: 'Meteor, mind flayers, cosmic horror',
    description: 'A star fell in the mountains. Those who investigate find mind flayers, cosmic horror, and something that should not be.'
  },
  'Eye of the Serpent': {
    code: 'UK5',
    level: '4-7',
    setting: 'Island/Jungle',
    theme: 'Serpent cult, island survival, yuan-ti',
    description: 'Shipwrecked on an island of serpent worshippers. Survive the jungle, the cult, and the eye that watches all.'
  },
  'All That Glitters': {
    code: 'UK6',
    level: '5-8',
    setting: 'Urban/Planar',
    theme: 'Thieves, guilds, planar nexus',
    description: 'A thieves\' guild war in a city that touches other planes. Not everything that glitters is gold — some of it is far worse.'
  },
  
  // WG-Series (World of Greyhawk)
  'Forgotten Temple of Tharizdun': {
    code: 'WG4',
    level: '5-8',
    setting: 'Temple/Wilderness',
    theme: 'Elder evil, cult, madness',
    description: 'The mad god Tharizdun\'s forgotten temple holds dark rituals and darker secrets. Not all who enter leave sane.'
  },
  'Mordenkainen\'s Fantastic Adventure': {
    code: 'WG5',
    level: '9-12',
    setting: 'Dungeon/Mage\'s Lair',
    theme: 'Archmage dungeon, high magic, artifacts',
    description: 'Mordenkainen\'s own dungeon — designed by the archmage himself. High-level challenges for the bold.'
  },
  'Isle of the Ape': {
    code: 'WG6',
    level: '18+',
    setting: 'Island/Prehistoric',
    theme: 'King Kong, godlings, epic level',
    description: 'An island of prehistoric beasts ruled by a godlike ape. For epic-level characters only. TPK potential: extreme.'
  },
  
  // N-Series (Novice)
  'Cult of the Reptile God': {
    code: 'N1',
    level: '1-3',
    setting: 'Village/Swamp',
    theme: 'Cult, mind control, investigation',
    description: 'The village of Orlane is wrong. People are changing. A cult dedicated to a reptile god has taken root.'
  },
  'The Forest Oracle': {
    code: 'N2',
    level: '2-4',
    setting: 'Forest/Wilderness',
    theme: 'Druids, blight, nature mystery',
    description: 'The forest is dying and the druids are missing. Something ancient stirs in the woods.'
  },
  'Destiny of Kings': {
    code: 'N3',
    level: '4-7',
    setting: 'Political/Intrigue',
    theme: 'Assassination, succession, politics',
    description: 'A king is dead, succession is in question, and assassins stalk the shadows. Political intrigue and danger.'
  },
  
  // L-Series (Low-level)
  'The Assassin\'s Knot': {
    code: 'L2',
    level: '2-5',
    setting: 'Urban/Whodunit',
    theme: 'Murder mystery, assassins guild',
    description: 'A baron is murdered. Everyone has secrets. Can you untangle the assassin\'s knot before more die?'
  },
  
  // RPGA Modules
  'To the Aid of Falx': {
    code: 'R1',
    level: '3-5',
    setting: 'Wilderness/Keep',
    theme: 'Rescue, siege, tactical combat',
    description: 'The wizard Falx\'s tower is under siege. Break through enemy lines and aid the besieged.'
  },
  'The Egg of the Phoenix': {
    code: 'R3',
    level: '5-8',
    setting: 'Planar/Quest',
    theme: 'Artifact quest, planes, phoenix',
    description: 'The Egg of the Phoenix has been stolen. A quest across planes to recover it and prevent catastrophe.'
  },
  'Doc\'s Island': {
    code: 'R4',
    level: '4-6',
    setting: 'Island/Mad Scientist',
    theme: 'Island of Dr. Moreau, experiments',
    description: 'An island of unnatural creatures and a mad wizard\'s experiments. Not all monsters are born — some are made.'
  },
  
  // C-Series (Competition)
  'Hidden Shrine of Tamoachan': {
    code: 'C1',
    level: '5-7',
    setting: 'Jungle/Temple',
    theme: 'Mayan-inspired, traps, ancient evil',
    description: 'An ancient Olman temple lost in the jungle, filled with deadly traps, strange creatures, and the lingering presence of forgotten gods.'
  },
  'Ghost Tower of Inverness': {
    code: 'C2',
    level: '5-7',
    setting: 'Tower/Dungeon',
    theme: 'Time travel, ghostly visions, artifact retrieval',
    description: 'The Duke needs the Star of Gemworld. It lies in the Ghost Tower, a place where time folds in on itself and the past is always present.'
  },
  
  // B-Series (Basic)
  'Keep on the Borderlands': {
    code: 'B2',
    level: '1-3',
    setting: 'Wilderness/Caves',
    theme: 'Classic dungeon crawl, multiple factions',
    description: 'The classic beginner module. A keep stands at the edge of civilization, guarding against the monstrous hordes in the nearby Caves of Chaos.'
  },
  
  // 3e/3.5e Specific
  'The Sunless Citadel': {
    code: '',
    level: '1-3',
    setting: 'Dungeon/Cavern',
    theme: 'Goblinoids, dragons, ancient ruins',
    description: 'A sunken fortress holds dark secrets. Goblins and kobolds wage war in its depths, and something ancient stirs below. Perfect for starting characters.'
  },
  'The Forge of Fury': {
    code: '',
    level: '3-5',
    setting: 'Mountain/Dungeon',
    theme: 'Orcs, duergar, ancient forge',
    description: 'Khundrukar, the dwarven forge, has been lost for centuries. Now orcs and worse dwell in its halls, guarding treasures and secrets of the old kingdom.'
  }
};

const EDITIONS = ['3.0', '3.5', 'Pathfinder 1e'];

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollStats() {
  const stats = [];
  for (let i = 0; i < 6; i++) {
    const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
    rolls.sort((a, b) => b - a);
    rolls.pop();
    stats.push(rolls.reduce((a, b) => a + b, 0));
  }
  return stats.sort((a, b) => b - a);
}

function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Races and Classes
const RACES = {
  'Human': { mods: {}, size: 'Medium', speed: 30, favored: 'Any' },
  'Dwarf': { mods: { con: 2, cha: -2 }, size: 'Medium', speed: 20, favored: 'Fighter' },
  'Elf': { mods: { dex: 2, con: -2 }, size: 'Medium', speed: 30, favored: 'Wizard' },
  'Gnome': { mods: { con: 2, str: -2 }, size: 'Small', speed: 20, favored: 'Bard' },
  'Half-Elf': { mods: {}, size: 'Medium', speed: 30, favored: 'Any' },
  'Half-Orc': { mods: { str: 2, int: -2, cha: -2 }, size: 'Medium', speed: 30, favored: 'Barbarian' },
  'Halfling': { mods: { dex: 2, str: -2 }, size: 'Small', speed: 20, favored: 'Rogue' }
};

const CLASSES = {
  'Barbarian': { hd: 12, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'poor' }, skills: 4 },
  'Bard': { hd: 6, bab: 'medium', saves: { fort: 'poor', ref: 'good', will: 'good' }, skills: 6, spellcaster: true },
  'Cleric': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 2, spellcaster: true },
  'Druid': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 4, spellcaster: true },
  'Fighter': { hd: 10, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'poor' }, skills: 2 },
  'Monk': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'good', will: 'good' }, skills: 4 },
  'Paladin': { hd: 10, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 2, spellcaster: 'limited' },
  'Ranger': { hd: 8, bab: 'full', saves: { fort: 'good', ref: 'good', will: 'poor' }, skills: 6, spellcaster: 'limited' },
  'Rogue': { hd: 6, bab: 'medium', saves: { fort: 'poor', ref: 'good', will: 'poor' }, skills: 8 },
  'Sorcerer': { hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, skills: 2, spellcaster: true },
  'Wizard': { hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, skills: 2, spellcaster: true }
};

const ALIGNMENTS = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'];

async function onboard() {
  console.log('\n🐉 D&D 3.5e Campaign Onboarding\n');
  console.log('Let\'s set up your adventure!\n');
  
  const campaign = {
    name: '',
    edition: '3.5',
    module: null,
    party: [],
    created: new Date().toISOString()
  };
  
  // Campaign Name
  campaign.name = await question('Campaign name (or press Enter for "Untitled Campaign"): ');
  if (!campaign.name) campaign.name = 'Untitled Campaign';
  console.log(`✓ Campaign: ${campaign.name}\n`);
  
  // Edition
  console.log('--- EDITION ---');
  EDITIONS.forEach((e, i) => console.log(`${i + 1}. ${e}`));
  const edChoice = await question('\nSelect edition (1-3, default 3.5): ');
  campaign.edition = EDITIONS[parseInt(edChoice) - 1] || '3.5';
  console.log(`✓ Edition: ${campaign.edition}\n`);
  
  // Module Selection
  console.log('--- ADVENTURE MODULE ---');
  console.log('0. Custom / No module (sandbox)');
  Object.entries(MODULES).forEach(([name, data], i) => {
    console.log(`${i + 1}. ${name} [${data.code}] (Levels ${data.level})`);
  });
  
  const modChoice = await question('\nSelect module (0 for custom): ');
  const modIndex = parseInt(modChoice) - 1;
  
  if (modIndex >= 0 && modIndex < Object.keys(MODULES).length) {
    const modName = Object.keys(MODULES)[modIndex];
    campaign.module = { name: modName, ...MODULES[modName] };
    console.log(`\n✓ Module: ${modName}`);
    console.log(`  Level: ${campaign.module.level}`);
    console.log(`  Setting: ${campaign.module.setting}`);
    console.log(`  ${campaign.module.description}\n`);
    
    const recLevel = parseInt(campaign.module.level.split('-')[0]);
    console.log(`💡 Recommended starting level: ${recLevel}`);
    
    const useRec = await question('Use recommended level? (y/n): ');
    campaign.recommendedLevel = useRec.toLowerCase() === 'y' ? recLevel : null;
  } else {
    console.log('✓ Custom campaign (no module)\n');
    campaign.module = null;
  }
  
  // Character Creation
  console.log('\n--- CHARACTER CREATION ---');
  const charCount = parseInt(await question('How many characters? (1-6, default 1): ')) || 1;
  
  for (let i = 0; i < charCount; i++) {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`CHARACTER ${i + 1} OF ${charCount}`);
    console.log('='.repeat(40));
    
    const character = await createCharacter(campaign.recommendedLevel);
    campaign.party.push(character);
  }
  
  // Final Setup
  console.log('\n' + '='.repeat(50));
  console.log('CAMPAIGN SETUP COMPLETE');
  console.log('='.repeat(50));
  console.log(`\n📜 ${campaign.name}`);
  console.log(`   Edition: ${campaign.edition}`);
  if (campaign.module) {
    console.log(`   Module: ${campaign.module.name}`);
  }
  console.log(`\n🎭 Party (${campaign.party.length}):`);
  campaign.party.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name} — ${c.race} ${c.class} ${c.level}`);
  });
  
  // Save campaign
  const campaignPath = path.join(__dirname, 'campaign.json');
  fs.writeFileSync(campaignPath, JSON.stringify(campaign, null, 2));
  console.log(`\n✅ Campaign saved to: ${campaignPath}`);
  
  // Update log
  const logPath = path.join(__dirname, 'log.md');
  const logEntry = `
# ${campaign.name}

**Edition:** ${campaign.edition}
**Module:** ${campaign.module ? campaign.module.name : 'Custom'}
**Started:** ${new Date().toLocaleDateString()}

## Party

${campaign.party.map(c => `- **${c.name}** — ${c.race} ${c.class} ${c.level}`).join('\n')}

## Session 1

*Adventure begins...*

`;
  fs.writeFileSync(logPath, logEntry);
  console.log(`✅ Adventure log started: ${logPath}`);
  
  console.log('\n🎲 Ready to play!');
  
  rl.close();
}

async function createCharacter(recommendedLevel) {
  const character = {
    name: '',
    race: '',
    class: '',
    level: recommendedLevel || 1,
    alignment: '',
    abilityScores: {},
    hp: 0
  };
  
  // Name
  character.name = await question('\nCharacter name: ');
  
  // Level
  if (!recommendedLevel) {
    const lvl = parseInt(await question('Level (1-20, default 1): '));
    character.level = lvl >= 1 && lvl <= 20 ? lvl : 1;
  }
  
  // Race
  console.log('\nRaces: ' + Object.keys(RACES).join(', '));
  const raceInput = await question('Race: ');
  character.race = Object.keys(RACES).find(r => r.toLowerCase() === raceInput.toLowerCase()) || 'Human';
  const race = RACES[character.race];
  console.log(`✓ ${character.race}`);
  
  // Class
  console.log('\nClasses: ' + Object.keys(CLASSES).join(', '));
  const classInput = await question('Class: ');
  character.class = Object.keys(CLASSES).find(c => c.toLowerCase() === classInput.toLowerCase()) || 'Fighter';
  const cls = CLASSES[character.class];
  console.log(`✓ ${character.class}`);
  
  // Alignment
  console.log('\nAlignments: LG NG CG LN N CN LE NE CE');
  const align = await question('Alignment: ');
  character.alignment = ALIGNMENTS.includes(align.toUpperCase()) ? align.toUpperCase() : 'N';
  console.log(`✓ ${character.alignment}`);
  
  // Stats
  console.log('\n--- ROLLING STATS ---');
  const rolls = rollStats();
  console.log(`Rolls: ${rolls.join(', ')}`);
  
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const remaining = [...rolls];
  
  for (const ability of abilities) {
    const choice = await question(`${ability} (remaining: ${remaining.join(', ')}): `);
    const val = parseInt(choice);
    const idx = remaining.indexOf(val);
    if (idx !== -1) {
      remaining.splice(idx, 1);
      character.abilityScores[ability.toLowerCase()] = val;
    } else {
      character.abilityScores[ability.toLowerCase()] = remaining.shift();
    }
  }
  
  // Apply racial mods
  for (const [stat, mod] of Object.entries(race.mods)) {
    character.abilityScores[stat] += mod;
  }
  
  // Calculate HP
  const conMod = getModifier(character.abilityScores.con);
  const maxHp = cls.hd + conMod;
  character.hp = Math.max(1, maxHp);
  
  // Save character
  const charPath = path.join(__dirname, 'characters', `${character.name.toLowerCase().replace(/\s+/g, '_')}.json`);
  const charData = {
    ...character,
    ac: {
      total: 10 + getModifier(character.abilityScores.dex) + (race.size === 'Small' ? 1 : 0),
      touch: 10 + getModifier(character.abilityScores.dex),
      flatFooted: 10 + (race.size === 'Small' ? 1 : 0)
    },
    saves: {
      fortitude: (cls.saves.fort === 'good' ? 2 : 0) + conMod,
      reflex: (cls.saves.ref === 'good' ? 2 : 0) + getModifier(character.abilityScores.dex),
      will: (cls.saves.will === 'good' ? 2 : 0) + getModifier(character.abilityScores.wis)
    },
    bab: cls.bab === 'full' ? 1 : 0,
    raceData: race,
    classData: cls
  };
  
  fs.mkdirSync(path.dirname(charPath), { recursive: true });
  fs.writeFileSync(charPath, JSON.stringify(charData, null, 2));
  console.log(`✅ Saved: ${charPath}`);
  
  return character;
}

onboard().catch(err => {
  console.error('Error:', err);
  rl.close();
});
