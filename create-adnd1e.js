#!/usr/bin/env node

/**
 * AD&D 1st Edition Character Creator
 * THAC0, percentile strength, class-specific XP tables, the real deal
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

// AD&D 1e Races
const RACES = {
  'Human': { mods: {}, mins: {}, maxs: {}, classes: ['Cleric','Druid','Fighter','Paladin','Ranger','Magic-User','Illusionist','Thief','Assassin','Monk'], infravision: 0 },
  'Dwarf': { mods: { con: 1, cha: -1 }, mins: { con: 12 }, maxs: { cha: 17, dex: 17 }, classes: ['Cleric','Fighter','Thief'], infravision: 60 },
  'Elf': { mods: { dex: 1, con: -1 }, mins: { int: 12, dex: 12 }, maxs: { con: 17 }, classes: ['Cleric','Fighter','Magic-User','Thief','Assassin'], infravision: 60 },
  'Gnome': { mods: { int: 1, wis: -1 }, mins: { con: 12, int: 12 }, maxs: {}, classes: ['Cleric','Fighter','Illusionist','Thief'], infravision: 60 },
  'Half-Elf': { mods: {}, mins: { int: 12, dex: 12 }, maxs: {}, classes: ['Cleric','Druid','Fighter','Ranger','Magic-User','Illusionist','Thief','Assassin'], infravision: 60 },
  'Halfling': { mods: { dex: 1, str: -1 }, mins: { con: 12, dex: 12 }, maxs: { str: 17 }, classes: ['Cleric','Fighter','Thief'], infravision: 30 },
  'Half-Orc': { mods: { str: 1, con: 1, cha: -2 }, mins: { str: 12, con: 12 }, maxs: { cha: 12 }, classes: ['Cleric','Fighter','Thief','Assassin'], infravision: 60 }
};

// AD&D 1e Classes
const CLASSES = {
  'Cleric': { hd: 8, hdAfter9: 2, xpTable: [0,1500,3000,6000,13000,27500,55000,110000,225000,450000,675000,900000], thac0: 20, armor: 'Any', shields: 'Any', weapons: 'Blunt only', primeReq: 'Wisdom' },
  'Druid': { hd: 8, hdAfter9: 2, xpTable: [0,2000,4000,7500,12500,20000,35000,60000,90000,125000,200000,300000,750000,1500000], thac0: 20, armor: 'Leather, wooden shield', weapons: 'Club, sickle, dart, spear, sling, scimitar', primeReq: 'Wisdom' },
  'Fighter': { hd: 10, hdAfter9: 3, xpTable: [0,2000,4000,8000,18000,35000,70000,125000,250000,500000,750000,1000000], thac0: 20, armor: 'Any', shields: 'Any', weapons: 'Any', primeReq: 'Strength' },
  'Paladin': { hd: 10, hdAfter9: 3, xpTable: [0,2750,5500,12000,24000,45000,95000,175000,350000,700000,1050000,1400000], thac0: 20, armor: 'Any', shields: 'Any', weapons: 'Any', primeReq: 'Strength, Wisdom, Charisma 17+' },
  'Ranger': { hd: 8, hdAfter9: 2, xpTable: [0,2250,4500,10000,20000,40000,90000,150000,225000,325000,650000,975000,1300000], thac0: 20, armor: 'Any', shields: 'Any', weapons: 'Any', primeReq: 'Strength, Intelligence, Wisdom' },
  'Magic-User': { hd: 4, hdAfter9: 1, xpTable: [0,2500,5000,10000,22500,40000,60000,90000,135000,250000,375000,500000,625000,750000,875000,1000000], thac0: 20, armor: 'None', shields: 'None', weapons: 'Dagger, dart, staff, knife', primeReq: 'Intelligence' },
  'Illusionist': { hd: 4, hdAfter9: 1, xpTable: [0,2250,4500,9000,18000,35000,60000,95000,145000,220000,440000,660000,880000,1100000,1320000,1540000,1760000,1980000,2200000], thac0: 20, armor: 'None', shields: 'None', weapons: 'Dagger, dart, staff, knife', primeReq: 'Intelligence, Dexterity' },
  'Thief': { hd: 6, hdAfter9: 2, xpTable: [0,1250,2500,5000,10000,20000,40000,70000,110000,160000,220000,440000,660000], thac0: 20, armor: 'Leather, no shield', weapons: 'Any', primeReq: 'Dexterity' },
  'Assassin': { hd: 6, hdAfter9: 2, xpTable: [0,1500,3000,6000,12000,25000,50000,100000,200000,300000,425000,575000,750000,1000000], thac0: 20, armor: 'Leather, no shield', weapons: 'Any', primeReq: 'Strength, Dexterity, Intelligence' },
  'Monk': { hd: 4, hdAfter9: 2, xpTable: [0,2250,4750,10000,22500,47500,98000,200000,425000,850000], thac0: 20, armor: 'None', weapons: 'Any', primeReq: 'Strength, Wisdom, Dexterity' }
};

// THAC0 progression by level (index 0 = level 1)
const THAC0_TABLE = {
  'Cleric': [20,20,20,18,18,18,16,16,16,14,14,14,12,12,12,10,10,10,8],
  'Druid': [20,20,20,18,18,18,16,16,16,14,14,14,12,12,12,10,10,10,8],
  'Fighter': [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2],
  'Paladin': [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2],
  'Ranger': [20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2],
  'Magic-User': [20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14],
  'Illusionist': [20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14],
  'Thief': [20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14],
  'Assassin': [20,20,20,19,19,19,18,18,18,17,17,17,16,16,16,15,15,15,14],
  'Monk': [20,20,20,18,18,18,16,16,16,14,14,14,12,12,12,10,10,10,8]
};

// Exceptional Strength table
const EXCEPTIONAL_STRENGTH = {
  '18/01-50': { hit: 1, dmg: 3, weight: 135, doors: '7/12', bars: '0%' },
  '18/51-75': { hit: 2, dmg: 3, weight: 160, doors: '8/12', bars: '1%' },
  '18/76-90': { hit: 2, dmg: 4, weight: 185, doors: '8/12', bars: '1%' },
  '18/91-99': { hit: 2, dmg: 5, weight: 235, doors: '9/12', bars: '2%' },
  '18/00': { hit: 3, dmg: 6, weight: 335, doors: '10/12', bars: '3%' }
};

const ALIGNMENTS = ['LG','NG','CG','LN','N','CN','LE','NE','CE'];

function rollDie(sides) { return Math.floor(Math.random() * sides) + 1; }

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
  if (score === 3) return -3;
  if (score <= 5) return -2;
  if (score <= 7) return -1;
  if (score <= 14) return 0;
  if (score <= 16) return 1;
  if (score <= 17) return 2;
  if (score >= 18) return 3;
  return 0;
}

function rollPercentile() {
  return (rollDie(10) - 1) * 10 + rollDie(10);
}

function getExceptionalStrength(roll) {
  if (roll <= 50) return '18/01-50';
  if (roll <= 75) return '18/51-75';
  if (roll <= 90) return '18/76-90';
  if (roll <= 99) return '18/91-99';
  return '18/00';
}

async function createCharacter() {
  console.log('\n🎲 AD&D 1st Edition Character Creator');
  console.log('"Back in my day, we rolled 3d6 in order and LIKED it!"\n');
  
  const character = {
    name: '', race: '', class: '', level: 1, alignment: '',
    abilityScores: {}, exceptionalStrength: null,
    hp: 0, thac0: 20, ac: 10, xp: 0, gold: 0
  };
  
  // Name
  character.name = await question('Character name: ');
  
  // Roll stats
  console.log('\n--- ROLLING ABILITY SCORES ---');
  console.log('Rolling 4d6, drop lowest, 6 times...\n');
  const rolls = rollStats();
  console.log(`Your rolls: ${rolls.join(', ')}\n`);
  
  const abilities = ['STR','INT','WIS','DEX','CON','CHA'];
  const remaining = [...rolls];
  
  for (const ability of abilities) {
    console.log(`Remaining: [${remaining.join(', ')}]`);
    const choice = await question(`Assign to ${ability}: `);
    const val = parseInt(choice);
    const idx = remaining.indexOf(val);
    if (idx !== -1) {
      remaining.splice(idx, 1);
      character.abilityScores[ability.toLowerCase()] = val;
    } else {
      character.abilityScores[ability.toLowerCase()] = remaining.shift();
    }
  }
  
  // Race
  console.log('\n--- RACE ---');
  console.log('Human, Dwarf, Elf, Gnome, Half-Elf, Halfling, Half-Orc');
  const raceInput = await question('Race: ');
  character.race = Object.keys(RACES).find(r => r.toLowerCase() === raceInput.toLowerCase()) || 'Human';
  const race = RACES[character.race];
  
  // Apply racial mods
  for (const [stat, mod] of Object.entries(race.mods)) {
    character.abilityScores[stat] += mod;
  }
  // Check caps
  for (const [stat, max] of Object.entries(race.maxs)) {
    if (character.abilityScores[stat] > max) character.abilityScores[stat] = max;
  }
  
  console.log(`✓ ${character.race} (Infravision: ${race.infravision}ft)`);
  
  // Class
  console.log('\n--- CLASS ---');
  console.log(`Available: ${race.classes.join(', ')}`);
  const classInput = await question('Class: ');
  character.class = Object.keys(CLASSES).find(c => c.toLowerCase() === classInput.toLowerCase()) || 'Fighter';
  const cls = CLASSES[character.class];
  console.log(`✓ ${character.class}`);
  
  // Exceptional Strength
  if ((character.class === 'Fighter' || character.class === 'Paladin' || character.class === 'Ranger') && character.abilityScores.str === 18) {
    console.log('\n--- EXCEPTIONAL STRENGTH ---');
    const excRoll = rollPercentile();
    character.exceptionalStrength = getExceptionalStrength(excRoll);
    const exc = EXCEPTIONAL_STRENGTH[character.exceptionalStrength];
    console.log(`🎲 Roll: ${excRoll} → ${character.exceptionalStrength}`);
    console.log(`   Hit: +${exc.hit}, Damage: +${exc.dmg}, Weight: ${exc.weight} lbs`);
  }
  
  // Alignment
  console.log('\n--- ALIGNMENT ---');
  console.log('LG NG CG | LN N CN | LE NE CE');
  const align = await question('Alignment: ');
  character.alignment = ALIGNMENTS.includes(align.toUpperCase()) ? align.toUpperCase() : 'N';
  console.log(`✓ ${character.alignment}`);
  
  // HP
  const conMod = getModifier(character.abilityScores.con);
  const hdRoll = rollDie(cls.hd);
  character.hp = Math.max(1, hdRoll + conMod);
  console.log(`\n--- HIT POINTS ---`);
  console.log(`🎲 ${hdRoll} + ${conMod} CON = ${character.hp} HP`);
  
  // THAC0
  character.thac0 = THAC0_TABLE[character.class][0];
  
  // Starting Gold
  let goldRolls = 5, goldDie = 4;
  if (['Cleric','Druid'].includes(character.class)) { goldRolls = 3; goldDie = 6; }
  else if (['Magic-User','Illusionist'].includes(character.class)) { goldRolls = 2; goldDie = 4; }
  else if (['Thief','Assassin'].includes(character.class)) { goldRolls = 2; goldDie = 6; }
  else if (character.class === 'Monk') { goldRolls = 1; goldDie = 4; }
  
  let gold = 0;
  for (let i = 0; i < goldRolls; i++) gold += rollDie(goldDie);
  character.gold = gold * 10;
  console.log(`\n--- STARTING GOLD ---`);
  console.log(`🎲 ${goldRolls}d${goldDie} x 10 = ${character.gold} gp`);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('AD&D 1st EDITION CHARACTER');
  console.log('='.repeat(50));
  console.log(`${character.name}`);
  console.log(`${character.race} ${character.class} (${character.alignment})`);
  console.log(`Level: ${character.level} | XP: ${character.xp}`);
  console.log(`HP: ${character.hp} | THAC0: ${character.thac0} | AC: ${character.ac}`);
  console.log(`Gold: ${character.gold} gp`);
  console.log('\nAbilities:');
  for (const abil of abilities) {
    const score = character.abilityScores[abil.toLowerCase()];
    const mod = getModifier(score);
    let line = `  ${abil}: ${score}`;
    if (abil === 'STR' && character.exceptionalStrength) line += ` (${character.exceptionalStrength})`;
    if (mod !== 0) line += ` (${mod >= 0 ? '+' : ''}${mod})`;
    console.log(line);
  }
  
  // Save
  const charPath = path.join(__dirname, 'characters', `${character.name.toLowerCase().replace(/\s+/g, '_')}.json`);
  fs.mkdirSync(path.dirname(charPath), { recursive: true });
  fs.writeFileSync(charPath, JSON.stringify(character, null, 2));
  console.log(`\n✅ Saved: ${charPath}`);
  
  rl.close();
}

createCharacter().catch(err => {
  console.error('Error:', err);
  rl.close();
});
