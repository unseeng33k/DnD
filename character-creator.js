#!/usr/bin/env node

/**
 * AD&D 1E CHARACTER CREATOR
 * 
 * Full character generation from scratch:
 * - Ability scores (4d6 drop lowest)
 * - Race/class selection
 * - Hit points, THAC0, saves
 * - Starting equipment
 * - Spells (if applicable)
 * - Character sheet export
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

class CharacterCreator {
  constructor() {
    this.character = {
      name: '',
      race: '',
      class: '',
      level: 1,
      alignment: 'Neutral',
      hitPoints: 0,
      experience: 0
    };
    
    this.abilityScores = {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0
    };
    
    this.abilityModifiers = {};
    this.inventory = [];
    this.gold = 0;
    this.spells = [];
  }

  /**
   * Roll 4d6, drop lowest
   */
  rollAbilityScore() {
    const rolls = [];
    for (let i = 0; i < 4; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    rolls.sort((a, b) => a - b);
    rolls.shift(); // Remove lowest
    return rolls.reduce((a, b) => a + b, 0);
  }

  /**
   * Roll all 6 ability scores
   */
  rollAllAbilities() {
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const scores = {};
    
    console.log('\n🎲 Rolling ability scores (4d6 drop lowest):\n');
    
    for (const ability of abilities) {
      const score = this.rollAbilityScore();
      scores[ability] = score;
      console.log(`${ability}: ${score}`);
    }
    
    this.abilityScores = scores;
    this.calculateModifiers();
  }

  /**
   * Calculate ability modifiers
   */
  calculateModifiers() {
    const mods = {};
    for (const [ability, score] of Object.entries(this.abilityScores)) {
      mods[ability] = Math.floor((score - 10) / 2);
    }
    this.abilityModifiers = mods;
  }

  /**
   * Get race options
   */
  getRaces() {
    return {
      'human': {
        name: 'Human',
        bonuses: {},
        description: 'Versatile, get extra feat'
      },
      'dwarf': {
        name: 'Dwarf',
        bonuses: { CON: 1, CHA: -1 },
        description: 'Tough, stonecunning'
      },
      'elf': {
        name: 'Elf',
        bonuses: { DEX: 1, CON: -1 },
        description: 'Graceful, keen senses'
      },
      'gnome': {
        name: 'Gnome',
        bonuses: { CON: 1, CHA: -1 },
        description: 'Small, good underground'
      },
      'halfling': {
        name: 'Halfling',
        bonuses: { DEX: 1, STR: -1 },
        description: 'Small, lucky, tough'
      },
      'half-orc': {
        name: 'Half-Orc',
        bonuses: { STR: 2, INT: -2, CHA: -2 },
        description: 'Strong, intimidating'
      }
    };
  }

  /**
   * Get class options
   */
  getClasses() {
    return {
      'fighter': {
        name: 'Fighter',
        requirements: { STR: 9 },
        hitDie: 10,
        description: 'Master of weapons and armor'
      },
      'mage': {
        name: 'Mage',
        requirements: { INT: 9 },
        hitDie: 4,
        description: 'Spellcaster, powerful in battle'
      },
      'thief': {
        name: 'Thief',
        requirements: { DEX: 9 },
        hitDie: 6,
        description: 'Stealth, lockpicking, backstab'
      },
      'cleric': {
        name: 'Cleric',
        requirements: { WIS: 9 },
        hitDie: 8,
        description: 'Holy warrior, healing and buffs'
      },
      'ranger': {
        name: 'Ranger',
        requirements: { STR: 13, DEX: 13, WIS: 14, CON: 14 },
        hitDie: 10,
        description: 'Wilderness expert, tracker'
      },
      'paladin': {
        name: 'Paladin',
        requirements: { STR: 12, CON: 11, WIS: 13, CHA: 17, alignment: 'Lawful Good' },
        hitDie: 10,
        description: 'Holy knight, smite evil'
      },
      'druid': {
        name: 'Druid',
        requirements: { WIS: 12, CHA: 15 },
        hitDie: 8,
        description: 'Nature magic, wild shape'
      },
      'bard': {
        name: 'Bard',
        requirements: { CHA: 15, DEX: 10 },
        hitDie: 6,
        description: 'Magic songs, persuasion, music'
      },
      'monk': {
        name: 'Monk',
        requirements: { STR: 15, DEX: 15, CON: 11, WIS: 14 },
        hitDie: 8,
        description: 'Martial artist, discipline'
      }
    };
  }

  /**
   * Calculate THAC0 (To Hit Armor Class 0)
   */
  calculateTHAC0() {
    const thac0Table = {
      'fighter': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'ranger': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'paladin': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'thief': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'cleric': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'druid': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'mage': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'bard': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'monk': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
    };

    const table = thac0Table[this.character.class] || [20];
    const level = Math.min(this.character.level, table.length) - 1;
    return table[level] || 20;
  }

  /**
   * Calculate hit points
   */
  calculateHitPoints() {
    const classDice = {
      'fighter': 10, 'ranger': 10, 'paladin': 10,
      'thief': 6, 'bard': 6,
      'cleric': 8, 'druid': 8, 'monk': 8,
      'mage': 4
    };

    const hitDie = classDice[this.character.class] || 6;
    const conMod = this.abilityModifiers.CON;
    
    // Roll first hit die
    let hp = Math.floor(Math.random() * hitDie) + 1 + conMod;
    
    // Add for additional levels
    for (let i = 1; i < this.character.level; i++) {
      const roll = Math.floor(Math.random() * hitDie) + 1;
      hp += Math.max(1, roll + conMod); // Min 1 HP per die
    }
    
    this.character.hitPoints = Math.max(1, hp);
  }

  /**
   * Get saving throws by class and level
   */
  getSavingThrows() {
    const saves = {
      'fighter': { paralysis: 12, poison: 13, death: 10, rod: 14, breath: 15, spell: 16 },
      'mage': { paralysis: 13, poison: 14, death: 11, rod: 11, breath: 14, spell: 12 },
      'thief': { paralysis: 13, poison: 13, death: 10, rod: 13, breath: 16, spell: 15 },
      'cleric': { paralysis: 10, poison: 12, death: 8, rod: 12, breath: 16, spell: 15 },
      'ranger': { paralysis: 12, poison: 13, death: 10, rod: 14, breath: 15, spell: 16 },
      'paladin': { paralysis: 10, poison: 12, death: 8, rod: 12, breath: 16, spell: 15 },
      'druid': { paralysis: 10, poison: 12, death: 8, rod: 12, breath: 16, spell: 15 },
      'bard': { paralysis: 13, poison: 13, death: 10, rod: 13, breath: 16, spell: 15 },
      'monk': { paralysis: 12, poison: 13, death: 10, rod: 14, breath: 15, spell: 16 }
    };

    return saves[this.character.class] || saves['fighter'];
  }

  /**
   * Assign ability scores interactively
   */
  async assignAbilities() {
    console.log('\n📊 Assign your rolled scores to abilities:');
    console.log('Rolled scores (can assign in any order):');
    
    const rolls = Object.values(this.abilityScores);
    rolls.sort((a, b) => b - a);
    console.log(rolls.join(', '));
    
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    
    for (const ability of abilities) {
      let valid = false;
      while (!valid) {
        const input = await question(`${ability} score: `);
        const score = parseInt(input);
        if (rolls.includes(score)) {
          this.abilityScores[ability] = score;
          rolls.splice(rolls.indexOf(score), 1);
          valid = true;
        } else {
          console.log('Invalid score. Choose from remaining rolls.');
        }
      }
    }
    
    this.calculateModifiers();
  }

  /**
   * Full interactive creation
   */
  async create() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🎲 AD&D 1E CHARACTER CREATOR 🎲    ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Name
    this.character.name = await question('Character name: ');

    // Ability scores
    const autoRoll = await question('Auto-roll ability scores? (y/n): ');
    if (autoRoll.toLowerCase() === 'y') {
      this.rollAllAbilities();
    } else {
      await this.assignAbilities();
    }

    // Display scores
    console.log('\n📈 Ability Scores:');
    for (const [ability, score] of Object.entries(this.abilityScores)) {
      const mod = this.abilityModifiers[ability];
      console.log(`  ${ability}: ${score} (${mod >= 0 ? '+' : ''}${mod})`);
    }

    // Race
    console.log('\n👤 Choose Race:');
    const races = this.getRaces();
    const raceKeys = Object.keys(races);
    raceKeys.forEach((key, i) => {
      console.log(`  ${i + 1}. ${races[key].name} - ${races[key].description}`);
    });
    const raceChoice = parseInt(await question('Race (1-6): ')) - 1;
    this.character.race = raceKeys[raceChoice];

    // Class
    console.log('\n⚔️  Choose Class:');
    const classes = this.getClasses();
    const classKeys = Object.keys(classes);
    classKeys.forEach((key, i) => {
      console.log(`  ${i + 1}. ${classes[key].name} - ${classes[key].description}`);
    });
    const classChoice = parseInt(await question('Class (1-9): ')) - 1;
    this.character.class = classKeys[classChoice];

    // Alignment
    console.log('\n⚖️  Choose Alignment:');
    console.log('  1. Lawful Good    2. Neutral Good   3. Chaotic Good');
    console.log('  4. Lawful Neutral 5. True Neutral   6. Chaotic Neutral');
    console.log('  7. Lawful Evil    8. Neutral Evil   9. Chaotic Evil');
    const alignmentChoice = parseInt(await question('Alignment (1-9): '));
    const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
    this.character.alignment = alignments[alignmentChoice - 1];

    // Calculate derived stats
    this.calculateHitPoints();
    
    // Display character
    this.displayCharacter();

    // Save character
    const save = await question('\nSave character? (y/n): ');
    if (save.toLowerCase() === 'y') {
      this.saveCharacter();
    }

    rl.close();
  }

  /**
   * Display character sheet
   */
  displayCharacter() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║            CHARACTER SHEET                         ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`Name: ${this.character.name.padEnd(30)} Race: ${this.character.race}`);
    console.log(`Class: ${this.character.class.padEnd(28)} Level: 1`);
    console.log(`Alignment: ${this.character.alignment.padEnd(25)} XP: 0\n`);

    console.log('ABILITIES:');
    for (const [ability, score] of Object.entries(this.abilityScores)) {
      const mod = this.abilityModifiers[ability];
      console.log(`  ${ability}: ${score.toString().padEnd(2)} (${mod >= 0 ? '+' : ''}${mod})`);
    }

    console.log(`\nHit Points: ${this.character.hitPoints}`);
    console.log(`THAC0: ${this.calculateTHAC0()}`);
    
    const saves = this.getSavingThrows();
    console.log('\nSaving Throws:');
    console.log(`  Paralysis: ${saves.paralysis}  Poison: ${saves.poison}  Death: ${saves.death}`);
    console.log(`  Rod/Staff/Wand: ${saves.rod}  Breath: ${saves.breath}  Spell: ${saves.spell}`);
  }

  /**
   * Save character to JSON
   */
  saveCharacter() {
    const charData = {
      character: this.character,
      abilityScores: this.abilityScores,
      abilityModifiers: this.abilityModifiers,
      hitPoints: this.character.hitPoints,
      thac0: this.calculateTHAC0(),
      savingThrows: this.getSavingThrows(),
      createdAt: new Date().toISOString()
    };

    const fs = require('fs');
    const filename = `${this.character.name.replace(/\s/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(charData, null, 2));
    console.log(`\n✅ Character saved to ${filename}`);
  }
}

// Run
const creator = new CharacterCreator();
creator.create().catch(console.error);
