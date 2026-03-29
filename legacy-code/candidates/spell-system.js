#!/usr/bin/env node

/**
 * SPELL SYSTEM
 * 
 * - Spell database (AD&D spells)
 * - Memorization system
 * - Spell slots by level
 * - Casting, components, effects
 */

class SpellSystem {
  constructor(character) {
    this.character = character;
    this.memorizedSpells = [];
    this.spellSlots = this.calculateSpellSlots();
    this.spellsKnown = [];
  }

  /**
   * AD&D Spell Database (1st-5th level)
   */
  getSpellDatabase() {
    return {
      'mage': {
        1: [
          { name: 'Magic Missile', level: 1, components: ['V', 'S'], range: '6" + 1"/level', duration: 'Instantaneous', effect: '1d4+1 damage per missile' },
          { name: 'Detect Magic', level: 1, components: ['V', 'S'], range: 'Special', duration: '1 round + 1/level', effect: 'Detect magical auras' },
          { name: 'Mage Armor', level: 1, components: ['V', 'S'], range: 'Touch', duration: '1 hour/level', effect: 'AC 6 protection' },
          { name: 'Light', level: 1, components: ['V', 'M'], range: '6"', duration: '6 turns/level', effect: 'Illuminates 6" radius' },
          { name: 'Burning Hands', level: 1, components: ['V', 'S'], range: 'Touch', duration: 'Instantaneous', effect: 'Cone of fire 1d4 damage' },
          { name: 'Sleep', level: 1, components: ['V', 'S', 'M'], range: '3" + 1"/level', duration: 'Varies', effect: 'Put creatures to sleep' }
        ],
        2: [
          { name: 'Fireball', level: 2, components: ['V', 'S', 'M'], range: '6"/level', duration: 'Instantaneous', effect: 'Sphere 2d6 + 1d6/level damage' },
          { name: 'Scorching Ray', level: 2, components: ['V', 'S'], range: '6"/level', duration: 'Instantaneous', effect: 'Ray 2d6 fire damage' },
          { name: 'Invisibility', level: 2, components: ['V', 'S', 'M'], range: 'Touch', duration: 'Special', effect: 'Target becomes invisible' },
          { name: 'Mirror Image', level: 2, components: ['V', 'S'], range: 'Self', duration: '1 round/level', effect: 'Create 1d4 + 1 duplicates' },
          { name: 'Detect Invisibility', level: 2, components: ['V', 'S'], range: '10" radius', duration: '1 turn/level', effect: 'See invisible creatures' }
        ]
      },
      'cleric': {
        1: [
          { name: 'Cure Light Wounds', level: 1, components: ['V', 'S'], range: 'Touch', duration: 'Instantaneous', effect: 'Heal 1d8 + level HP' },
          { name: 'Detect Magic', level: 1, components: ['V', 'S'], range: 'Special', duration: '1 round + 1/level', effect: 'Detect magical auras' },
          { name: 'Light', level: 1, components: ['V', 'M'], range: '6"', duration: '6 turns/level', effect: 'Illuminates 6" radius' },
          { name: 'Bless', level: 1, components: ['V', 'S'], range: '6"', duration: '1 round/level', effect: '+1 to hit & saves' },
          { name: 'Cause Fear', level: 1, components: ['V', 'S'], range: '6"', duration: 'Special', effect: 'Creature flees in fear' },
          { name: 'Detect Undead', level: 1, components: ['V', 'S'], range: '6"', duration: 'Special', effect: 'Sense undead creatures' }
        ],
        2: [
          { name: 'Hold Person', level: 2, components: ['V', 'S'], range: '6"', duration: 'Varies', effect: 'Paralyze humanoid' },
          { name: 'Cure Serious Wounds', level: 2, components: ['V', 'S'], range: 'Touch', duration: 'Instantaneous', effect: 'Heal 2d8 + level HP' },
          { name: 'Spiritual Weapon', level: 2, components: ['V', 'S'], range: '6" + 1"/level', duration: '1 round/level', effect: 'Magical weapon to attack' },
          { name: 'Aid', level: 2, components: ['V', 'S'], range: 'Touch', duration: '1 round/level', effect: '+1d8 HP, +1 to hit' }
        ]
      }
    };
  }

  /**
   * Calculate spell slots by class and level
   */
  calculateSpellSlots() {
    const slotsByClass = {
      'mage': {
        1: { 1: 1 },
        2: { 1: 2 },
        3: { 1: 2, 2: 1 },
        4: { 1: 3, 2: 2 },
        5: { 1: 3, 2: 2, 3: 1 }
      },
      'cleric': {
        1: { 1: 1 },
        2: { 1: 2 },
        3: { 1: 2, 2: 1 },
        4: { 1: 3, 2: 2 },
        5: { 1: 3, 2: 2, 3: 1 }
      }
    };

    const classSlots = slotsByClass[this.character.class];
    if (!classSlots) return {};

    return classSlots[this.character.level] || {};
  }

  /**
   * Learn a spell
   */
  learnSpell(spellName) {
    const database = this.getSpellDatabase();
    const classSpells = database[this.character.class];
    
    if (!classSpells) {
      return { success: false, message: 'This class cannot cast spells' };
    }

    for (const [level, spells] of Object.entries(classSpells)) {
      const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase());
      if (spell) {
        this.spellsKnown.push(spell);
        return { success: true, message: `Learned ${spellName}` };
      }
    }

    return { success: false, message: 'Spell not found' };
  }

  /**
   * Memorize a spell (prepare it for casting)
   */
  memorizeSpell(spellName) {
    const spell = this.spellsKnown.find(s => s.name.toLowerCase() === spellName.toLowerCase());
    
    if (!spell) {
      return { success: false, message: 'Spell not learned' };
    }

    const slots = this.spellSlots[spell.level];
    if (!slots) {
      return { success: false, message: 'No spell slots of that level' };
    }

    const memorizedCount = this.memorizedSpells.filter(s => s.level === spell.level).length;
    if (memorizedCount >= slots) {
      return { success: false, message: 'No more spell slots available' };
    }

    this.memorizedSpells.push(spell);
    return { success: true, message: `Memorized ${spellName}` };
  }

  /**
   * Cast a spell
   */
  castSpell(spellName) {
    const spellIndex = this.memorizedSpells.findIndex(s => s.name.toLowerCase() === spellName.toLowerCase());
    
    if (spellIndex === -1) {
      return { success: false, message: 'Spell not memorized' };
    }

    const spell = this.memorizedSpells[spellIndex];
    
    // Spell is cast and removed from memorized
    this.memorizedSpells.splice(spellIndex, 1);

    return {
      success: true,
      message: `Cast ${spell.name}!`,
      effect: spell.effect,
      duration: spell.duration
    };
  }

  /**
   * List available spells for character
   */
  listAvailableSpells() {
    const database = this.getSpellDatabase();
    const classSpells = database[this.character.class];
    
    if (!classSpells) {
      console.log('This class cannot cast spells');
      return;
    }

    console.log(`\n📖 Available Spells for ${this.character.class.toUpperCase()}:\n`);
    
    for (const [level, spells] of Object.entries(classSpells)) {
      console.log(`Level ${level}:`);
      for (const spell of spells) {
        console.log(`  ${spell.name.padEnd(25)} (${spell.components.join(', ')})`);
      }
      console.log('');
    }
  }

  /**
   * List memorized spells
   */
  listMemorizedSpells() {
    console.log('\n✨ Memorized Spells:\n');
    
    if (this.memorizedSpells.length === 0) {
      console.log('(None)');
      return;
    }

    for (const spell of this.memorizedSpells) {
      console.log(`${spell.name.padEnd(20)} Level ${spell.level}`);
    }
  }

  /**
   * Get spell details
   */
  getSpellDetails(spellName) {
    const database = this.getSpellDatabase();
    const classSpells = database[this.character.class];
    
    if (!classSpells) return null;

    for (const [level, spells] of Object.entries(classSpells)) {
      const spell = spells.find(s => s.name.toLowerCase() === spellName.toLowerCase());
      if (spell) return spell;
    }

    return null;
  }
}

export { SpellSystem };
