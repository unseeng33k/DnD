#!/usr/bin/env node

/**
 * Interactive Character Creator for D&D 3.5e
 * Walks player through creation, handles all the math
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

// Core 3.5e Races with ability modifiers
const RACES = {
  'Human': { mods: {}, size: 'Medium', speed: 30, favored: 'Any', traits: ['Bonus feat at 1st level', 'Bonus skill points'] },
  'Dwarf': { mods: { con: 2, cha: -2 }, size: 'Medium', speed: 20, favored: 'Fighter', traits: ['Darkvision 60ft', 'Stonecunning', 'Weapon familiarity (dwarven waraxe, urgrosch)', 'Stability', '+2 vs poison/spells', '+1 vs orcs/goblinoids'] },
  'Elf': { mods: { dex: 2, con: -2 }, size: 'Medium', speed: 30, favored: 'Wizard', traits: ['Low-light vision', 'Immune to sleep', '+2 vs enchantment', 'Weapon proficiency (longsword, rapier, longbow, shortbow)'] },
  'Gnome': { mods: { con: 2, str: -2 }, size: 'Small', speed: 20, favored: 'Bard', traits: ['Low-light vision', 'Speak with burrowing mammals', '+1 vs illusions', '+1 to illusion DCs', 'Weapon familiarity (gnome hooked hammer)'] },
  'Half-Elf': { mods: {}, size: 'Medium', speed: 30, favored: 'Any', traits: ['Immune to sleep', '+2 vs enchantment', 'Low-light vision', 'Elf blood'] },
  'Half-Orc': { mods: { str: 2, int: -2, cha: -2 }, size: 'Medium', speed: 30, favored: 'Barbarian', traits: ['Darkvision 60ft', 'Orc blood'] },
  'Halfling': { mods: { dex: 2, str: -2 }, size: 'Small', speed: 20, favored: 'Rogue', traits: ['+2 Climb/Jump/Move Silently', '+1 all saves', '+1 AC', '+2 thrown weapons'] }
};

// Core classes with key info
const CLASSES = {
  'Barbarian': { hd: 12, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'poor' }, skills: 4, keyAbility: 'str' },
  'Bard': { hd: 6, bab: 'medium', saves: { fort: 'poor', ref: 'good', will: 'good' }, skills: 6, keyAbility: 'cha', spellcaster: true },
  'Cleric': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 2, keyAbility: 'wis', spellcaster: true },
  'Druid': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 4, keyAbility: 'wis', spellcaster: true },
  'Fighter': { hd: 10, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'poor' }, skills: 2, keyAbility: 'str' },
  'Monk': { hd: 8, bab: 'medium', saves: { fort: 'good', ref: 'good', will: 'good' }, skills: 4, keyAbility: 'wis' },
  'Paladin': { hd: 10, bab: 'full', saves: { fort: 'good', ref: 'poor', will: 'good' }, skills: 2, keyAbility: 'cha', spellcaster: 'limited' },
  'Ranger': { hd: 8, bab: 'full', saves: { fort: 'good', ref: 'good', will: 'poor' }, skills: 6, keyAbility: 'dex', spellcaster: 'limited' },
  'Rogue': { hd: 6, bab: 'medium', saves: { fort: 'poor', ref: 'good', will: 'poor' }, skills: 8, keyAbility: 'dex' },
  'Sorcerer': { hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, skills: 2, keyAbility: 'cha', spellcaster: true },
  'Wizard': { hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, skills: 2, keyAbility: 'int', spellcaster: true }
};

const ALIGNMENTS = ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'];

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollStats() {
  const stats = [];
  for (let i = 0; i < 6; i++) {
    const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
    rolls.sort((a, b) => b - a);
    rolls.pop(); // drop lowest
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

async function createCharacter() {
  console.log('\n🎲 D&D 3.5e Character Creator\n');
  
  const character = {
    name: '',
    race: '',
    class: '',
    level: 1,
    alignment: '',
    abilityScores: {},
    hp: 0,
    skills: [],
    feats: [],
    equipment: []
  };
  
  // Step 1: Name
  character.name = await question('Character name: ');
  
  // Step 2: Race
  console.log('\n--- RACES ---');
  Object.keys(RACES).forEach((r, i) => console.log(`${i + 1}. ${r}`));
  const raceChoice = await question('\nPick a race (number or name): ');
  const raceName = Object.keys(RACES)[parseInt(raceChoice) - 1] || 
                   Object.keys(RACES).find(r => r.toLowerCase() === raceChoice.toLowerCase());
  if (!RACES[raceName]) {
    console.log('Invalid race, defaulting to Human');
    character.race = 'Human';
  } else {
    character.race = raceName;
  }
  const race = RACES[character.race];
  console.log(`✓ ${character.race}: ${Object.entries(race.mods).map(([k,v]) => `${k.toUpperCase()} ${v>=0?'+':''}${v}`).join(', ') || 'No ability mods'}`);
  
  // Step 3: Class
  console.log('\n--- CLASSES ---');
  Object.keys(CLASSES).forEach((c, i) => {
    const cls = CLASSES[c];
    const caster = cls.spellcaster ? (cls.spellcaster === true ? ' [Spellcaster]' : ' [Limited spells]') : '';
    console.log(`${i + 1}. ${c} (d${cls.hd}, ${cls.bab} BAB)${caster}`);
  });
  const classChoice = await question('\nPick a class (number or name): ');
  const className = Object.keys(CLASSES)[parseInt(classChoice) - 1] || 
                    Object.keys(CLASSES).find(c => c.toLowerCase() === classChoice.toLowerCase());
  if (!CLASSES[className]) {
    console.log('Invalid class, defaulting to Fighter');
    character.class = 'Fighter';
  } else {
    character.class = className;
  }
  const cls = CLASSES[character.class];
  console.log(`✓ ${character.class}: d${cls.hd} HD, ${cls.skills} + INT skill points/level`);
  
  // Step 4: Alignment
  console.log('\n--- ALIGNMENTS ---');
  console.log('LG=Lawful Good  NG=Neutral Good  CG=Chaotic Good');
  console.log('LN=Lawful Neutral N=True Neutral CN=Chaotic Neutral');
  console.log('LE=Lawful Evil  NE=Neutral Evil  CE=Chaotic Evil');
  const align = await question('\nAlignment (e.g., CG, LN): ');
  character.alignment = ALIGNMENTS.includes(align.toUpperCase()) ? align.toUpperCase() : 'N';
  console.log(`✓ ${character.alignment}`);
  
  // Step 5: Roll Stats
  console.log('\n--- ABILITY SCORES ---');
  console.log('Rolling 4d6 drop lowest, 6 times...\n');
  const rolls = rollStats();
  console.log(`Your rolls: ${rolls.join(', ')}\n`);
  
  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const remaining = [...rolls];
  
  for (const ability of abilities) {
    console.log(`Remaining: [${remaining.join(', ')}]`);
    const choice = await question(`Assign to ${ability}: `);
    const val = parseInt(choice);
    const idx = remaining.indexOf(val);
    if (idx === -1) {
      console.log('Invalid choice, using highest remaining');
      character.abilityScores[ability.toLowerCase()] = remaining.shift();
    } else {
      remaining.splice(idx, 1);
      character.abilityScores[ability.toLowerCase()] = val;
    }
  }
  
  // Apply racial mods
  for (const [stat, mod] of Object.entries(race.mods)) {
    character.abilityScores[stat] += mod;
  }
  
  console.log('\n--- FINAL SCORES ---');
  for (const ability of abilities) {
    const score = character.abilityScores[ability.toLowerCase()];
    const mod = getModifier(score);
    console.log(`${ability}: ${score} (${formatModifier(mod)})`);
  }
  
  // Step 6: HP
  const conMod = getModifier(character.abilityScores.con);
  const maxHp = cls.hd + conMod;
  character.hp = Math.max(1, maxHp);
  console.log(`\nHP: ${character.hp} (d${cls.hd} + ${formatModifier(conMod)} CON)`);
  
  // Step 7: Saves
  const getSave = (type, ability) => {
    const base = cls.saves[type] === 'good' ? 2 : 0;
    return base + getModifier(character.abilityScores[ability]);
  };
  
  console.log(`\nSAVES: Fort +${getSave('fort', 'con')}, Ref +${getSave('ref', 'dex')}, Will +${getSave('will', 'wis')}`);
  
  // Step 8: Skill points
  const intMod = getModifier(character.abilityScores.int);
  const skillPoints = Math.max(1, (cls.skills + intMod) * 4); // ×4 at 1st level
  console.log(`\nSKILL POINTS: ${skillPoints} (${cls.skills} + ${formatModifier(intMod)} INT) × 4`);
  
  // Step 9: Feats
  let feats = [];
  if (character.race === 'Human') feats.push('Bonus Feat (Human)');
  if (character.class === 'Fighter') feats.push('Bonus Feat (Fighter)');
  console.log(`\nFEATS: ${feats.length > 0 ? feats.join(', ') : 'Standard feat selection'}`);
  
  // Summary
  console.log('\n' + '='.repeat(40));
  console.log('CHARACTER SUMMARY');
  console.log('='.repeat(40));
  console.log(`${character.name} — ${character.race} ${character.class} ${character.level}`);
  console.log(`Alignment: ${character.alignment}`);
  console.log(`HP: ${character.hp} | AC: ${10 + getModifier(character.abilityScores.dex) + (race.size === 'Small' ? 1 : 0)}`);
  console.log('\nAbilities: ' + abilities.map(a => `${a} ${character.abilityScores[a.toLowerCase()]}`).join(', '));
  
  // Save to file
  const savePath = path.join(__dirname, 'characters', `${character.name.toLowerCase().replace(/\s+/g, '_')}.json`);
  const charData = {
    ...character,
    raceData: race,
    classData: cls,
    ac: {
      total: 10 + getModifier(character.abilityScores.dex) + (race.size === 'Small' ? 1 : 0),
      base: 10,
      dex: getModifier(character.abilityScores.dex),
      size: race.size === 'Small' ? 1 : 0
    },
    saves: {
      fortitude: getSave('fort', 'con'),
      reflex: getSave('ref', 'dex'),
      will: getSave('will', 'wis')
    },
    bab: cls.bab === 'full' ? 1 : (cls.bab === 'medium' ? 0 : 0),
    created: new Date().toISOString()
  };
  
  fs.writeFileSync(savePath, JSON.stringify(charData, null, 2));
  console.log(`\n✅ Saved to: ${savePath}`);
  
  rl.close();
}

createCharacter().catch(err => {
  console.error('Error:', err);
  rl.close();
});
