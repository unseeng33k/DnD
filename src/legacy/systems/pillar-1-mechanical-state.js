#!/usr/bin/env node

/**
 * PILLAR 1: MECHANICAL STATE
 * 
 * Responsible for:
 * - Character/NPC statistics (STR, DEX, CON, INT, WIS, CHA)
 * - Health points and conditions
 * - Combat mechanics (THAC0, AC, saves, initiative)
 * - Spell slots and innate abilities
 * - Equipment and armor
 * - Character progression (XP, levels)
 */

class MechanicalStatePillar {
  constructor() {
    this.name = 'MechanicalState';
    this.characters = new Map();
    this.activeEffects = new Map();
    this.conditions = new Map();
    this.currentRound = 0;
  }

  initSession(engine, { party, setting }) {
    this.engine = engine;
    
    // Create character entries with mechanical stats
    for (const char of party) {
      this.createCharacter(char);
    }

    this.log(`✅ Initialized ${party.length} characters`);
  }

  /**
   * CREATE CHARACTER with full AD&D 1E stats
   */

  createCharacter(charData) {
    const char = {
      id: charData.id,
      name: charData.name,
      race: charData.race,
      class: charData.class,
      level: charData.level || 1,
      alignment: charData.alignment || 'Neutral',

      // ABILITY SCORES (3-18)
      abilities: {
        str: charData.str || 10,
        dex: charData.dex || 10,
        con: charData.con || 10,
        int: charData.int || 10,
        wis: charData.wis || 10,
        cha: charData.cha || 10
      },

      // COMBAT STATS
      hp: {
        current: charData.hp || 10,
        max: charData.hp || 10
      },
      ac: charData.ac || 10,
      thac0: this.calculateTHAC0(charData.class, charData.level),
      initiative: 0,

      // SAVING THROWS
      saves: this.getSavingThrows(charData.class),

      // SPELLS (if applicable)
      spells: {
        available: charData.spells || {},
        cast: {}
      },

      // CONDITIONS & EFFECTS
      conditions: [],
      effects: [],

      // EXPERIENCE & PROGRESSION
      experience: charData.experience || 0,
      gold: charData.gold || 0,

      // EQUIPMENT
      equipment: charData.equipment || [],
      inventory: charData.inventory || []
    };

    this.characters.set(char.id, char);
    return char;
  }

  /**
   * ABILITY SCORE MODIFIERS
   */

  getAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  /**
   * COMBAT MECHANICS
   */

  calculateTHAC0(charClass, level) {
    // AD&D 1E THAC0 progression
    const thac0Base = {
      'Fighter': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Ranger': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Paladin': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Cleric': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Druid': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Thief': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Bard': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Mage': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      'Monk': [20, 19, 18, 17, 16, 15, 14, 13, 12, 11]
    };

    const baseTable = thac0Base[charClass] || [20];
    const idx = Math.min(level - 1, baseTable.length - 1);
    return baseTable[idx];
  }

  getSavingThrows(charClass) {
    // AD&D 1E saving throws by class
    return {
      deathRay: 14,      // vs Death ray/poison
      wand: 13,          // vs Magic wand
      paralysis: 12,     // vs Paralysis/turn to stone
      breathWeapon: 15,  // vs Dragon breath
      spell: 14,         // vs Magic spell
      rodStaffWand: 11   // vs Rod/staff/wand
    };
  }

  /**
   * DAMAGE & HEALING
   */

  takeDamage(charId, amount, source = 'unknown') {
    const char = this.characters.get(charId);
    if (!char) return null;

    const damage = Math.min(amount, char.hp.current);
    char.hp.current -= damage;

    if (char.hp.current <= 0) {
      char.hp.current = 0;
      this.addCondition(charId, 'unconscious');
      this.log(`💀 ${char.name} is unconscious!`);
    }

    return {
      charName: char.name,
      damageTaken: damage,
      hpRemaining: char.hp.current,
      maxHp: char.hp.max,
      source
    };
  }

  heal(charId, amount, source = 'healing') {
    const char = this.characters.get(charId);
    if (!char) return null;

    const healed = Math.min(amount, char.hp.max - char.hp.current);
    char.hp.current += healed;

    if (char.hp.current > char.hp.max) {
      char.hp.current = char.hp.max;
    }

    return {
      charName: char.name,
      healed,
      hpRemaining: char.hp.current,
      maxHp: char.hp.max,
      source
    };
  }

  /**
   * CONDITIONS (ongoing effects)
   */

  addCondition(charId, condition, duration = null) {
    const char = this.characters.get(charId);
    if (!char) return;

    char.conditions.push({
      name: condition,
      duration,
      appliedAt: this.currentRound
    });

    this.log(`⚠️  ${char.name} gains condition: ${condition}`);
  }

  removeCondition(charId, condition) {
    const char = this.characters.get(charId);
    if (!char) return;

    const idx = char.conditions.findIndex(c => c.name === condition);
    if (idx >= 0) {
      char.conditions.splice(idx, 1);
      this.log(`✅ ${char.name} loses condition: ${condition}`);
    }
  }

  hasCondition(charId, condition) {
    const char = this.characters.get(charId);
    return char && char.conditions.some(c => c.name === condition);
  }

  /**
   * SPELLS & ABILITIES
   */

  castSpell(charId, spellName, level, spellClass) {
    const char = this.characters.get(charId);
    if (!char) return false;

    // Check if spell is available
    const available = this.getAvailableSpells(charId, spellClass, level);
    if (available <= 0) {
      this.log(`❌ ${char.name} has no ${spellClass} level ${level} spells!`);
      return false;
    }

    // Use the spell
    if (!char.spells.cast[spellClass]) {
      char.spells.cast[spellClass] = {};
    }
    if (!char.spells.cast[spellClass][level]) {
      char.spells.cast[spellClass][level] = 0;
    }

    char.spells.cast[spellClass][level]++;
    this.log(`✨ ${char.name} casts ${spellName}`);
    return true;
  }

  getAvailableSpells(charId, spellClass, level) {
    const char = this.characters.get(charId);
    if (!char) return 0;

    const total = char.spells.available[spellClass]?.[level] || 0;
    const used = char.spells.cast[spellClass]?.[level] || 0;
    return Math.max(0, total - used);
  }

  /**
   * RESTING & RECOVERY
   */

  shortRest(duration = 1) {
    // HD recovery, some spells for warlocks
    this.log(`😴 Short rest (${duration} hour)`);
    // Implementation depends on game system
  }

  longRest(duration = 8) {
    // Full healing, all HP, all spell slots
    this.log(`😴 Long rest (${duration} hours)`);
    
    for (const char of this.characters.values()) {
      char.hp.current = char.hp.max;
      char.spells.cast = {};
      
      // Clear non-permanent conditions
      char.conditions = char.conditions.filter(c => c.duration === 'permanent');
    }
  }

  /**
   * EQUIPMENT & INVENTORY
   */

  addItem(charId, item) {
    const char = this.characters.get(charId);
    if (!char) return;
    char.inventory.push(item);
  }

  removeItem(charId, itemName) {
    const char = this.characters.get(charId);
    if (!char) return;
    const idx = char.inventory.findIndex(i => i.name === itemName);
    if (idx >= 0) char.inventory.splice(idx, 1);
  }

  /**
   * EXPERIENCE & PROGRESSION
   */

  awardExperience(charId, amount) {
    const char = this.characters.get(charId);
    if (!char) return;

    char.experience += amount;
    this.log(`⭐ ${char.name} gains ${amount} XP`);

    // Check for level up
    const nextLevelXP = this.getXPForLevel(char.class, char.level + 1);
    if (char.experience >= nextLevelXP) {
      this.levelUp(charId);
    }
  }

  levelUp(charId) {
    const char = this.characters.get(charId);
    if (!char) return;

    char.level++;
    const hpGain = Math.max(1, Math.floor(Math.random() * this.getHitDie(char.class)) + 1);
    char.hp.max += hpGain;
    char.hp.current = char.hp.max;
    char.thac0 = this.calculateTHAC0(char.class, char.level);

    this.log(`🎉 ${char.name} is now level ${char.level}!`);
  }

  getXPForLevel(charClass, level) {
    // AD&D 1E XP tables (simplified)
    const xpTable = {
      'Fighter': [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000],
      'Cleric': [0, 1500, 3000, 6000, 13000, 27500, 55000, 110000, 220000],
      'Mage': [0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000],
      'Thief': [0, 1250, 2500, 5000, 10000, 20000, 40000, 80000, 160000]
    };
    return xpTable[charClass]?.[level - 1] || 0;
  }

  getHitDie(charClass) {
    const hitDice = {
      'Fighter': 10, 'Ranger': 10, 'Paladin': 10,
      'Cleric': 8, 'Druid': 8, 'Monk': 8,
      'Thief': 6, 'Bard': 6,
      'Mage': 4
    };
    return hitDice[charClass] || 6;
  }

  /**
   * QUERIES
   */

  getCharacter(id) {
    return this.characters.get(id);
  }

  getEffectiveAC(charId) {
    const char = this.characters.get(charId);
    if (!char) return 10;

    let ac = char.ac;
    // Apply condition modifiers, magic items, etc.
    return ac;
  }

  /**
   * LOGGING
   */

  log(msg) {
    console.log(`[Pillar1-Mechanical] ${msg}`);
  }
}

export { MechanicalStatePillar };
