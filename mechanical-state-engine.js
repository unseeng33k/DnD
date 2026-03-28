#!/usr/bin/env node

/**
 * MECHANICAL STATE ENGINE (PILLAR #9)
 * 
 * The simulation spine: character/mechanics state layer.
 * Tracks all crunchy stuff and provides query API for orchestrator.
 * 
 * Tracks:
 * - Characters (stats, HP, AC, skills, proficiencies)
 * - Spells (slots, prepared, durations, ongoing effects)
 * - Abilities (uses per rest, triggers, passive vs active)
 * - Gear (weapons, armor, attunements, charges)
 * - Conditions (grappled, poisoned, stunned, adv/disadv)
 * - Temporal states (round-based durations, until-rest flags)
 */

class MechanicalStateEngine {
  constructor() {
    this.characterDefinitions = new Map();
    this.characters = new Map();
    this.spellDefinitions = new Map();
    this.abilityDefinitions = new Map();
    this.activeEffects = new Map();
    this.conditions = new Map();
    this.resources = new Map();
    
    this.currentRound = 0;
    this.currentInitiative = 0;
  }

  /**
   * CREATE CHARACTER INSTANCE
   */
  createCharacter(id, name, classDefinition, raceDefinition, level, choices = {}) {
    const character = {
      id,
      name,
      classDefinition: classDefinition.name,
      raceDefinition: raceDefinition.name,
      level,
      
      baseStats: {
        str: raceDefinition.modifiers?.str || 0,
        dex: raceDefinition.modifiers?.dex || 0,
        con: raceDefinition.modifiers?.con || 0,
        int: raceDefinition.modifiers?.int || 0,
        wis: raceDefinition.modifiers?.wis || 0,
        cha: raceDefinition.modifiers?.cha || 0
      },
      
      builds: choices,
      
      state: {
        hp: classDefinition.hpAtFirstLevel,
        maxHp: classDefinition.hpAtFirstLevel,
        tempHp: 0,
        ac: 10 + (raceDefinition.modifiers?.dex || 0),
        initiative: raceDefinition.modifiers?.dex || 0
      },
      
      proficiencies: {
        savingThrows: classDefinition.savingThrows || [],
        skills: classDefinition.skills || [],
        weapons: classDefinition.weapons || [],
        armor: classDefinition.armor || []
      },
      
      features: this.getFeaturesByLevel(classDefinition, level),
      
      spellsKnown: choices.spellsKnown || [],
      
      equipment: {
        armor: choices.armor || null,
        weapons: choices.weapons || [],
        items: choices.items || []
      }
    };

    this.characters.set(id, character);
    this.activeEffects.set(id, []);
    this.conditions.set(id, {});
    
    this.initializeResources(id, classDefinition, level);
    
    return character;
  }

  /**
   * APPLY EFFECT
   */
  applyEffect(targetId, effect) {
    const effectInstance = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: effect.type,
      name: effect.name,
      source: effect.source,
      
      duration: effect.duration || 'instant',
      startedAt: this.currentRound,
      expiresAt: this.calculateExpiry(effect.duration),
      
      effects: effect.effects || [],
      triggers: effect.triggers || [],
      
      stackable: effect.stackable !== false,
      tags: effect.tags || []
    };

    const effects = this.activeEffects.get(targetId) || [];
    effects.push(effectInstance);
    this.activeEffects.set(targetId, effects);
    
    return effectInstance;
  }

  /**
   * APPLY CONDITION
   */
  applyCondition(targetId, conditionType, duration, source) {
    const conditions = this.conditions.get(targetId) || {};
    
    conditions[conditionType] = {
      type: conditionType,
      duration: duration,
      startedAt: this.currentRound,
      expiresAt: this.calculateExpiry(duration),
      source: source
    };
    
    this.conditions.set(targetId, conditions);
  }

  /**
   * REMOVE CONDITION
   */
  removeCondition(targetId, conditionType) {
    const conditions = this.conditions.get(targetId) || {};
    delete conditions[conditionType];
    this.conditions.set(targetId, conditions);
  }

  /**
   * QUERY: EFFECTIVE STATS
   */
  getEffectiveStats(characterId, actionType = 'general') {
    const character = this.characters.get(characterId);
    if (!character) return null;

    const stats = { ...character.baseStats };
    const modifiers = [];

    const activeEffects = this.activeEffects.get(characterId) || [];
    for (const effect of activeEffects) {
      for (const atomic of effect.effects) {
        if (atomic.type === 'modify_stat') {
          stats[atomic.stat] += atomic.value;
          modifiers.push({
            source: effect.name,
            stat: atomic.stat,
            value: atomic.value
          });
        }
      }
    }

    const conditions = this.conditions.get(characterId) || {};
    if (conditions.grappled) {
      modifiers.push({ source: 'grappled', stat: 'dex', value: -2 });
    }
    if (conditions.poisoned) {
      modifiers.push({ source: 'poisoned', stat: 'all', value: -1 });
    }

    return {
      baseStats: character.baseStats,
      effectiveStats: stats,
      modifiers: modifiers,
      conditions: conditions
    };
  }

  /**
   * QUERY: ATTACK PROFILE
   */
  getAttackProfile(attackerId, targetId, weaponChoice) {
    const attacker = this.characters.get(attackerId);
    const target = this.characters.get(targetId);
    if (!attacker || !target) return null;

    const profile = {
      attacker: attacker.name,
      target: target.name,
      weapon: weaponChoice,
      
      attackBonus: 0,
      targetAC: this.getEffectiveAC(targetId),
      
      advantage: [],
      disadvantage: [],
      
      damageFormula: null,
      odds: null
    };

    const attackerStats = this.getEffectiveStats(attackerId, 'attack');
    const attackerConditions = this.conditions.get(attackerId) || {};
    
    const ability = weaponChoice?.finesse ? 
      Math.max(attackerStats.effectiveStats.str, attackerStats.effectiveStats.dex) :
      attackerStats.effectiveStats.str;
    
    profile.attackBonus = this.getAbilityModifier(ability);
    
    if (this.hasProficiency(attackerId, weaponChoice?.name)) {
      profile.attackBonus += this.getProficiencyBonus(attacker.level);
    }

    for (const mod of attackerStats.modifiers) {
      if (mod.stat === 'dex' || mod.stat === 'str') {
        profile.attackBonus += mod.value;
      }
    }

    if (attackerConditions.invisible) {
      profile.advantage.push('invisible');
    }
    if (attackerConditions.frightened) {
      profile.disadvantage.push('frightened');
    }

    const d20Result = 20;
    const total = d20Result + profile.attackBonus;
    const hitChance = Math.max(0, Math.min(100, (total - profile.targetAC + 1) * 5));
    profile.odds = `${hitChance}% hit chance`;

    return profile;
  }

  /**
   * QUERY: LEGAL ACTIONS
   */
  getLegalActions(characterId) {
    const character = this.characters.get(characterId);
    if (!character) return null;

    return {
      movement: this.getMovementOptions(characterId),
      actions: this.getActionOptions(characterId),
      bonusActions: this.getBonusActionOptions(characterId),
      reactions: this.getReactionOptions(characterId),
      freeActions: ['interact_with_object']
    };
  }

  /**
   * QUERY: EFFECTIVE AC
   */
  getEffectiveAC(characterId) {
    const character = this.characters.get(characterId);
    if (!character) return 10;

    let ac = character.state.ac;
    
    const activeEffects = this.activeEffects.get(characterId) || [];
    for (const effect of activeEffects) {
      for (const atomic of effect.effects) {
        if (atomic.type === 'modify_ac') {
          ac += atomic.value;
        }
      }
    }

    return ac;
  }

  /**
   * ADVANCE ROUND
   */
  advanceRound() {
    this.currentRound++;
    
    for (const [charId, effects] of this.activeEffects) {
      const active = [];
      
      for (const effect of effects) {
        if (effect.expiresAt && effect.expiresAt <= this.currentRound) {
          continue;
        }
        active.push(effect);
      }
      
      this.activeEffects.set(charId, active);
    }

    for (const [charId, conditions] of this.conditions) {
      const active = {};
      
      for (const [condType, condition] of Object.entries(conditions)) {
        if (condition.expiresAt && condition.expiresAt <= this.currentRound) {
          continue;
        }
        active[condType] = condition;
      }
      
      this.conditions.set(charId, active);
    }
  }

  /**
   * HELPERS
   */
  calculateExpiry(duration) {
    if (!duration || duration === 'instant') return this.currentRound;
    if (duration.includes('round')) {
      const rounds = parseInt(duration) || 1;
      return this.currentRound + rounds;
    }
    return null;
  }

  getAbilityModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
  }

  getProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1;
  }

  hasProficiency(characterId, weaponName) {
    const character = this.characters.get(characterId);
    if (!character) return false;
    return character.proficiencies.weapons.includes(weaponName);
  }

  getFeaturesByLevel(classDefinition, level) {
    return classDefinition.features?.filter(f => f.level <= level) || [];
  }

  initializeResources(characterId, classDefinition, level) {
    const resources = {};
    
    if (classDefinition.name === 'Wizard' || classDefinition.name === 'Cleric') {
      const maxSlots = Math.ceil(level / 2);
      resources.spellSlots = { current: maxSlots, max: maxSlots };
    }
    
    if (classDefinition.name === 'Barbarian') {
      resources.rage = { current: level >= 3 ? 2 : 1, max: level >= 3 ? 2 : 1 };
    }
    
    this.resources.set(characterId, resources);
  }

  getMovementOptions(characterId) {
    return [
      { type: 'move', distance: 30 },
      { type: 'dash', distance: 60 },
      { type: 'disengage' }
    ];
  }

  getActionOptions(characterId) {
    return [
      { type: 'attack' },
      { type: 'cast_spell' },
      { type: 'dodge' },
      { type: 'help' },
      { type: 'hide' },
      { type: 'search' }
    ];
  }

  getBonusActionOptions(characterId) {
    const character = this.characters.get(characterId);
    if (!character) return [];
    
    const options = [];
    
    if (character.classDefinition === 'Rogue') {
      options.push({ type: 'cunning_action' });
    }
    
    return options;
  }

  getReactionOptions(characterId) {
    return [
      { type: 'opportunity_attack' },
      { type: 'shield' },
      { type: 'counterspell' }
    ];
  }
}

export { MechanicalStateEngine };
