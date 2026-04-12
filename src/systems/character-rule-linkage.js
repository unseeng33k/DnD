#!/usr/bin/env node

/**
 * CHARACTER-RULE LINKAGE SYSTEM
 * 
 * Deep integration of character details and rules into roleplaying and combat.
 * Every ability, item, spell, and condition actively affects gameplay.
 * 
 * Linkage Points:
 * - Ability scores affect all relevant rolls
 * - Magic items trigger automatic effects
 * - Spells validate components, range, duration
 * - Conditions modify rolls and available actions
 * - Racial abilities apply automatically
 * - Class features trigger at appropriate times
 */

import { ADnDRuleEngine } from '../../adnd-rule-engine.js';

/**
 * AbilityScoreLinkage - Links ability scores to all relevant mechanics
 */
export class AbilityScoreLinkage {
  static getModifier(score) {
    if (score >= 18) return 3;
    if (score >= 16) return 2;
    if (score >= 13) return 1;
    if (score >= 9) return 0;
    if (score >= 6) return -1;
    if (score >= 4) return -2;
    return -3;
  }

  /**
   * Apply ability score modifiers to attack rolls
   */
  static getAttackBonus(character, weapon) {
    let bonus = 0;
    const str = character.abilityScores?.str?.score || 10;
    const dex = character.abilityScores?.dex?.score || 10;

    // Strength for melee, Dex for ranged
    if (weapon?.type === 'ranged') {
      bonus = this.getModifier(dex);
    } else {
      bonus = this.getModifier(str);
    }

    // Specialization bonus
    if (weapon?.specialized) {
      bonus += 1;
    }

    // Magic weapon bonus
    if (weapon?.bonus) {
      bonus += weapon.bonus;
    }

    return bonus;
  }

  /**
   * Apply ability score modifiers to damage
   */
  static getDamageBonus(character, weapon) {
    const str = character.abilityScores?.str?.score || 10;
    
    // Strength bonus to damage (melee only)
    if (weapon?.type !== 'ranged') {
      return this.getModifier(str);
    }
    
    return 0;
  }

  /**
   * Get saving throw modifiers from ability scores
   */
  static getSaveModifier(character, saveType) {
    const scores = character.abilityScores || {};
    
    switch (saveType) {
      case 'paralysis':
      case 'poison':
      case 'death':
        // Constitution affects poison/death saves
        return this.getModifier(scores.con?.score || 10);
      case 'rod':
      case 'staff':
      case 'wand':
      case 'spell':
        // Wisdom affects mental saves
        return this.getModifier(scores.wis?.score || 10);
      case 'breath':
        // Dexterity affects reflex saves
        return this.getModifier(scores.dex?.score || 10);
      default:
        return 0;
    }
  }

  /**
   * Get reaction adjustment from Charisma
   */
  static getReactionAdjustment(character) {
    const cha = character.abilityScores?.cha?.score || 10;
    return this.getModifier(cha);
  }

  /**
   * Get HP bonus from Constitution
   */
  static getHPBonus(character) {
    const con = character.abilityScores?.con?.score || 10;
    return this.getModifier(con);
  }

  /**
   * Get bonus spells from high ability scores
   */
  static getBonusSpells(character, spellClass) {
    const bonusSpells = {};
    
    if (spellClass === 'cleric' || spellClass === 'druid') {
      const wis = character.abilityScores?.wis?.score || 10;
      // AD&D 1e: Bonus spells for WIS 13+
      if (wis >= 13) bonusSpells['1'] = 1;
      if (wis >= 14) bonusSpells['2'] = 1;
      if (wis >= 15) bonusSpells['3'] = 1;
      if (wis >= 16) bonusSpells['4'] = 1;
      if (wis >= 17) bonusSpells['5'] = 1;
      if (wis >= 18) bonusSpells['6'] = 1;
    }
    
    if (spellClass === 'mage' || spellClass === 'illusionist') {
      const int = character.abilityScores?.int?.score || 10;
      // AD&D 1e: Bonus spells for INT 13+
      if (int >= 13) bonusSpells['1'] = 1;
      if (int >= 14) bonusSpells['2'] = 1;
      if (int >= 15) bonusSpells['3'] = 1;
      if (int >= 16) bonusSpells['4'] = 1;
      if (int >= 17) bonusSpells['5'] = 1;
      if (int >= 18) bonusSpells['6'] = 1;
    }
    
    return bonusSpells;
  }
}

/**
 * MagicItemLinkage - Links magic items to automatic effects
 */
export class MagicItemLinkage {
  static getItemEffects(item) {
    const effects = {
      acBonus: 0,
      attackBonus: 0,
      damageBonus: 0,
      saveBonus: 0,
      special: []
    };

    if (!item) return effects;

    // Parse item name/type for bonuses
    const name = item.name || item;
    const lowerName = name.toLowerCase();

    // Armor bonuses
    const armorMatch = lowerName.match(/\+(\d+)/);
    if (armorMatch) {
      const bonus = parseInt(armorMatch[1]);
      if (lowerName.includes('armor') || lowerName.includes('shield') || lowerName.includes('cloak')) {
        effects.acBonus = bonus;
      }
      if (lowerName.includes('weapon') || lowerName.includes('sword') || lowerName.includes('axe')) {
        effects.attackBonus = bonus;
        effects.damageBonus = bonus;
      }
    }

    // Special item effects
    if (lowerName.includes('cloak of protection')) {
      effects.acBonus = 1;
      effects.saveBonus = 1;
    }

    if (lowerName.includes('ring of protection')) {
      effects.acBonus = 1;
      effects.saveBonus = 1;
    }

    if (lowerName.includes('staff of the magi')) {
      effects.special.push('absorb_spell');
      effects.special.push('retributive_strike');
    }

    if (lowerName.includes('wand')) {
      effects.special.push('spell_charges');
    }

    return effects;
  }

  /**
   * Calculate total AC from armor and magic items
   */
  static calculateAC(character) {
    let baseAC = 10;
    let magicBonus = 0;

    // Check for equipped armor
    if (character.equipment && Array.isArray(character.equipment)) {
      for (const item of character.equipment) {
        if (item.type === 'armor') {
          baseAC = item.ac || baseAC;
        }
      }
    }

    // Check magic items
    if (character.magicItems) {
      for (const item of character.magicItems) {
        const effects = this.getItemEffects(item);
        magicBonus += effects.acBonus;
      }
    }

    // Dexterity bonus
    const dexMod = AbilityScoreLinkage.getModifier(character.abilityScores?.dex?.score || 10);

    return baseAC - magicBonus - dexMod;
  }

  /**
   * Get total attack bonus from magic items
   */
  static getMagicAttackBonus(character) {
    let bonus = 0;

    if (character.magicItems) {
      for (const item of character.magicItems) {
        const effects = this.getItemEffects(item);
        bonus += effects.attackBonus;
      }
    }

    return bonus;
  }
}

/**
 * SpellLinkage - Links spells to validation and effects
 */
export class SpellLinkage {
  static spellDatabase = {
    'magic missile': {
      level: 1,
      class: 'mage',
      range: '60 feet + 10 feet/level',
      duration: 'Instant',
      damage: '1d4+1 per missile',
      missiles: '1 per 2 levels (round up)',
      components: ['V', 'S'],
      castingTime: '1 segment'
    },
    'fireball': {
      level: 3,
      class: 'mage',
      range: '100 feet + 10 feet/level',
      duration: 'Instant',
      damage: '1d6 per level (max 10d6)',
      area: '20-foot radius',
      save: 'Half damage',
      components: ['V', 'S', 'M'],
      castingTime: '3 segments'
    },
    'cure light wounds': {
      level: 1,
      class: 'cleric',
      range: 'Touch',
      duration: 'Instant',
      healing: '1d8+1',
      components: ['V', 'S'],
      castingTime: '5 rounds'
    },
    'hold person': {
      level: 2,
      class: 'cleric',
      range: '60 feet',
      duration: '6 rounds + 1 round/level',
      targets: '1-3 humanoids',
      save: 'Negates',
      components: ['V', 'S', 'M'],
      castingTime: '5 rounds'
    }
  };

  /**
   * Get spell details
   */
  static getSpell(spellName) {
    const key = spellName.toLowerCase();
    return this.spellDatabase[key] || null;
  }

  /**
   * Validate spell can be cast
   */
  static validateSpellCast(character, spellName, spellLevel, spellClass) {
    const errors = [];
    const warnings = [];

    // Check spell slots
    const slots = character.spells?.[spellClass]?.[String(spellLevel)];
    if (!slots || slots.remaining <= 0) {
      errors.push(`No level ${spellLevel} ${spellClass} spell slots remaining`);
    }

    // Check for silence (verbal components)
    if (character.conditions?.includes('silence')) {
      errors.push('Cannot cast spells with verbal components while silenced');
    }

    // Check for bound hands (somatic components)
    if (character.conditions?.includes('bound')) {
      errors.push('Cannot cast spells with somatic components while bound');
    }

    // Check for material components (simplified)
    const spell = this.getSpell(spellName);
    if (spell?.components?.includes('M')) {
      // Would check component pouch here
      warnings.push('Requires material components');
    }

    return { valid: errors.length === 0, errors, warnings, spell };
  }

  /**
   * Calculate spell effect based on caster level
   */
  static calculateSpellEffect(spellName, casterLevel) {
    const spell = this.getSpell(spellName);
    if (!spell) return null;

    const effects = { ...spell };

    // Calculate missiles for Magic Missile
    if (spellName.toLowerCase() === 'magic missile') {
      effects.missileCount = Math.ceil(casterLevel / 2);
      effects.totalDamage = `${effects.missileCount}d4+${effects.missileCount}`;
    }

    // Calculate Fireball damage
    if (spellName.toLowerCase() === 'fireball') {
      const dice = Math.min(casterLevel, 10);
      effects.damage = `${dice}d6`;
    }

    // Calculate range
    if (spell.range?.includes('/level')) {
      const baseMatch = spell.range.match(/(\d+) feet/);
      if (baseMatch) {
        const base = parseInt(baseMatch[1]);
        const perLevel = spell.range.includes('10 feet/level') ? 10 : 5;
        effects.calculatedRange = base + (perLevel * casterLevel);
      }
    }

    return effects;
  }
}

/**
 * ConditionLinkage - Links conditions to mechanical effects
 */
export class ConditionLinkage {
  static conditionEffects = {
    'blind': {
      acPenalty: 4,
      attackPenalty: 4,
      special: ['cannot_target_spells']
    },
    'prone': {
      acPenalty: 4,
      attackPenalty: 4,
      special: ['melee_attackers_gain_plus_4']
    },
    'stunned': {
      loseActions: ['standard', 'move'],
      acPenalty: 2
    },
    'poisoned': {
      statPenalty: { str: 2, dex: 2 },
      ongoingDamage: '1 per round'
    },
    'invisible': {
      acBonus: 4,
      attackBonus: 4,
      special: ['cannot_be_targeted']
    },
    'blessed': {
      attackBonus: 1,
      saveBonus: 1
    },
    'prayer': {
      attackBonus: 1,
      damageBonus: 1,
      saveBonus: 1
    },
    'haste': {
      extraAttack: true,
      acBonus: 4,
      saveBonus: 4
    },
    'slow': {
      loseActions: ['standard'],
      acPenalty: 4,
      savePenalty: 4
    },
    'silence': {
      cannotCast: ['verbal'],
      special: ['no_sound']
    },
    'fear': {
      mustFlee: true,
      loseActions: ['standard']
    },
    'charmed': {
      cannotAttack: ['charmer'],
      special: ['regard_charmer_as_friend']
    }
  };

  /**
   * Get all modifiers from conditions
   */
  static getConditionModifiers(character) {
    const modifiers = {
      ac: 0,
      attack: 0,
      damage: 0,
      saves: 0,
      loseActions: [],
      special: []
    };

    if (!character.conditions) return modifiers;

    for (const condition of character.conditions) {
      const name = typeof condition === 'string' ? condition : condition.name;
      const effects = this.conditionEffects[name.toLowerCase()];
      
      if (effects) {
        modifiers.ac += effects.acBonus || 0;
        modifiers.ac -= effects.acPenalty || 0;
        modifiers.attack += effects.attackBonus || 0;
        modifiers.attack -= effects.attackPenalty || 0;
        modifiers.damage += effects.damageBonus || 0;
        modifiers.saves += effects.saveBonus || 0;
        modifiers.saves -= effects.savePenalty || 0;
        
        if (effects.loseActions) {
          modifiers.loseActions.push(...effects.loseActions);
        }
        if (effects.special) {
          modifiers.special.push(...effects.special);
        }
      }
    }

    return modifiers;
  }

  /**
   * Check if character can take an action
   */
  static canTakeAction(character, actionType) {
    const modifiers = this.getConditionModifiers(character);
    
    if (modifiers.loseActions.includes(actionType)) {
      return { allowed: false, reason: `Condition prevents ${actionType} actions` };
    }

    return { allowed: true };
  }
}

/**
 * RacialAbilityLinkage - Links racial abilities to automatic effects
 */
export class RacialAbilityLinkage {
  static racialAbilities = {
    'drow': {
      darkvision: 120,
      spellResistance: 2,
      innateSpells: ['dancing lights', 'faerie fire', 'darkness'],
      lightSensitivity: true
    },
    'elf': {
      darkvision: 60,
      charmResistance: true,
      surpriseBonus: 4
    },
    'dwarf': {
      darkvision: 60,
      poisonResistance: 2,
      magicResistance: { rods: 2, staves: 2, spells: 2 }
    },
    'half-ogre': {
      darkvision: 60,
      infravision: true,
      poisonResistance: 2,
      size: 'large'
    },
    'human': {
      // No special abilities
    }
  };

  /**
   * Get racial abilities for character
   */
  static getRacialAbilities(character) {
    const race = character.race?.toLowerCase() || '';
    
    // Check for subraces
    if (race.includes('drow')) return this.racialAbilities.drow;
    if (race.includes('elf')) return this.racialAbilities.elf;
    if (race.includes('dwarf')) return this.racialAbilities.dwarf;
    if (race.includes('ogre')) return this.racialAbilities['half-ogre'];
    
    return this.racialAbilities[race] || {};
  }

  /**
   * Apply racial save bonuses
   */
  static getRacialSaveBonus(character, saveType) {
    const abilities = this.getRacialAbilities(character);
    
    if (saveType === 'spell' && abilities.spellResistance) {
      return abilities.spellResistance;
    }
    
    if (saveType === 'poison' && abilities.poisonResistance) {
      return abilities.poisonResistance;
    }
    
    if ((saveType === 'rod' || saveType === 'staff' || saveType === 'wand' || saveType === 'spell') 
        && abilities.magicResistance) {
      return abilities.magicResistance[saveType] || 0;
    }
    
    return 0;
  }
}

/**
 * ClassFeatureLinkage - Links class features to automatic triggers
 */
export class ClassFeatureLinkage {
  static classFeatures = {
    'fighter': {
      hitDice: 'd10',
      thac0Progression: 'fast',
      specialization: true,
      extraAttacks: [7, 13]
    },
    'cleric': {
      hitDice: 'd8',
      thac0Progression: 'medium',
      turnUndead: true,
      spellCasting: 'divine'
    },
    'mage': {
      hitDice: 'd4',
      thac0Progression: 'slow',
      spellCasting: 'arcane'
    },
    'ranger': {
      hitDice: 'd10',
      thac0Progression: 'fast',
      tracking: true,
      favoredEnemy: true
    },
    'paladin': {
      hitDice: 'd10',
      thac0Progression: 'fast',
      layOnHands: true,
      detectEvil: true
    },
    'thief': {
      hitDice: 'd6',
      thac0Progression: 'medium',
      backstab: true,
      thiefSkills: true
    }
  };

  /**
   * Get class features
   */
  static getClassFeatures(character) {
    const className = character.class?.toLowerCase() || '';
    return this.classFeatures[className] || {};
  }

  /**
   * Check if character gets extra attacks
   */
  static getExtraAttacks(character) {
    const features = this.getClassFeatures(character);
    const level = character.level || 1;
    
    if (features.extraAttacks) {
      let attacks = 1;
      for (const attackLevel of features.extraAttacks) {
        if (level >= attackLevel) attacks++;
      }
      return attacks;
    }
    
    return 1;
  }

  /**
   * Calculate THAC0 based on class and level
   */
  static calculateTHAC0(character) {
    const features = this.getClassFeatures(character);
    const level = character.level || 1;
    
    const progressions = {
      fast: 20 - Math.floor((level - 1) * 2),
      medium: 20 - Math.floor((level - 1) * 1.5),
      slow: 20 - Math.floor((level - 1))
    };
    
    return progressions[features.thac0Progression] || 20;
  }
}

/**
 * CompleteCharacterLinkage - Integrates all linkage systems
 */
export class CompleteCharacterLinkage {
  constructor(character) {
    this.character = character;
    this.ruleEngine = new ADnDRuleEngine();
  }

  /**
   * Get complete attack calculation
   */
  calculateAttack(weapon = {}) {
    const baseTHAC0 = this.character.thac0 || 
                      ClassFeatureLinkage.calculateTHAC0(this.character);
    
    const abilityBonus = AbilityScoreLinkage.getAttackBonus(this.character, weapon);
    const magicBonus = MagicItemLinkage.getMagicAttackBonus(this.character);
    const conditionMod = ConditionLinkage.getConditionModifiers(this.character);

    return {
      thac0: baseTHAC0,
      abilityBonus,
      magicBonus,
      conditionMod: conditionMod.attack,
      totalBonus: abilityBonus + magicBonus + conditionMod.attack
    };
  }

  /**
   * Get complete AC calculation
   */
  calculateAC() {
    const baseAC = MagicItemLinkage.calculateAC(this.character);
    const conditionMod = ConditionLinkage.getConditionModifiers(this.character);
    
    return {
      base: baseAC,
      conditionMod: conditionMod.ac,
      total: baseAC - conditionMod.ac // Lower AC is better
    };
  }

  /**
   * Get complete save calculation
   */
  calculateSave(saveType) {
    const baseSave = this.character.saves?.[saveType] || 10;
    const abilityMod = AbilityScoreLinkage.getSaveModifier(this.character, saveType);
    const racialMod = RacialAbilityLinkage.getRacialSaveBonus(this.character, saveType);
    const conditionMod = ConditionLinkage.getConditionModifiers(this.character);

    return {
      base: baseSave,
      abilityMod,
      racialMod,
      conditionMod: conditionMod.saves,
      total: baseSave - abilityMod - racialMod - conditionMod.saves
    };
  }

  /**
   * Validate any action
   */
  validateAction(actionType, details = {}) {
    const conditionCheck = ConditionLinkage.canTakeAction(this.character, actionType);
    if (!conditionCheck.allowed) {
      return conditionCheck;
    }

    // Spell-specific validation
    if (actionType === 'cast_spell') {
      return SpellLinkage.validateSpellCast(
        this.character,
        details.spellName,
        details.spellLevel,
        details.spellClass
      );
    }

    return { allowed: true };
  }

  /**
   * Get all active effects summary
   */
  getActiveEffects() {
    return {
      abilityScores: this.character.abilityScores,
      magicItems: this.character.magicItems?.map(item => ({
        name: item.name || item,
        effects: MagicItemLinkage.getItemEffects(item)
      })),
      conditions: this.character.conditions,
      racialAbilities: RacialAbilityLinkage.getRacialAbilities(this.character),
      classFeatures: ClassFeatureLinkage.getClassFeatures(this.character)
    };
  }
}

export default {
  AbilityScoreLinkage,
  MagicItemLinkage,
  SpellLinkage,
  ConditionLinkage,
  RacialAbilityLinkage,
  ClassFeatureLinkage,
  CompleteCharacterLinkage
};
