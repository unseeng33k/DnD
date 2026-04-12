#!/usr/bin/env node

/**
 * LINKED COMBAT ENGINE
 * 
 * Combat engine with deep character-rule linkage.
 * Every attack, save, and spell cast automatically factors in:
 * - Ability score modifiers
 * - Magic item bonuses
 * - Condition effects
 * - Racial abilities
 * - Class features
 * - Spell validation
 */

import { ADnDRuleEngine } from '../../adnd-rule-engine.js';
import {
  AbilityScoreLinkage,
  MagicItemLinkage,
  SpellLinkage,
  ConditionLinkage,
  RacialAbilityLinkage,
  ClassFeatureLinkage,
  CompleteCharacterLinkage
} from './character-rule-linkage.js';

/**
 * LinkedCombatant - Combatant with full rule linkage
 */
export class LinkedCombatant {
  constructor(name, characterData, type = 'party') {
    this.name = name;
    this.type = type;
    this.characterData = characterData;
    this.linkage = new CompleteCharacterLinkage(characterData);

    // Core stats from character sheet
    this.hp = characterData.hp?.current || 10;
    this.maxHp = characterData.hp?.max || 10;
    this.ac = this.linkage.calculateAC().total;
    this.thac0 = characterData.thac0 || ClassFeatureLinkage.calculateTHAC0(characterData);
    
    // Ability scores
    this.abilityScores = characterData.abilityScores || {};
    
    // Saves
    this.saves = characterData.saves || {};
    
    // Spells
    this.spells = characterData.spells || {};
    
    // Magic items
    this.magicItems = characterData.magicItems || [];
    
    // Conditions
    this.conditions = characterData.conditions || [];
    
    // Combat state
    this.initiative = 0;
    this.actions = { standard: true, move: true, swift: true };
    
    // Class features
    this.extraAttacks = ClassFeatureLinkage.getExtraAttacks(characterData);
  }

  /**
   * Refresh AC and other calculated values
   */
  refreshCalculatedValues() {
    this.ac = this.linkage.calculateAC().total;
    this.thac0 = this.characterData.thac0 || ClassFeatureLinkage.calculateTHAC0(this.characterData);
  }

  /**
   * Add a condition
   */
  addCondition(condition) {
    if (!this.conditions.includes(condition)) {
      this.conditions.push(condition);
      this.characterData.conditions = this.conditions;
      this.refreshCalculatedValues();
      return true;
    }
    return false;
  }

  /**
   * Remove a condition
   */
  removeCondition(condition) {
    const index = this.conditions.indexOf(condition);
    if (index !== -1) {
      this.conditions.splice(index, 1);
      this.characterData.conditions = this.conditions;
      this.refreshCalculatedValues();
      return true;
    }
    return false;
  }

  /**
   * Get attack roll with all modifiers
   */
  getAttackRoll(weapon = {}) {
    const calc = this.linkage.calculateAttack(weapon);
    return {
      thac0: calc.thac0,
      totalBonus: calc.totalBonus,
      toHitAC: (ac) => calc.thac0 - ac + calc.totalBonus
    };
  }

  /**
   * Get save with all modifiers
   */
  getSave(saveType) {
    const calc = this.linkage.calculateSave(saveType);
    return {
      target: calc.total,
      modifiers: {
        ability: calc.abilityMod,
        racial: calc.racialMod,
        condition: calc.conditionMod
      }
    };
  }

  /**
   * Validate an action
   */
  validateAction(actionType, details = {}) {
    return this.linkage.validateAction(actionType, details);
  }

  /**
   * Get summary for display
   */
  getSummary() {
    return {
      name: this.name,
      type: this.type,
      hp: `${this.hp}/${this.maxHp}`,
      ac: this.ac,
      thac0: this.thac0,
      conditions: this.conditions,
      extraAttacks: this.extraAttacks
    };
  }
}

/**
 * LinkedCombatEngine - Combat engine with full rule linkage
 */
export class LinkedCombatEngine {
  constructor(rulebookConsultant) {
    this.consultant = rulebookConsultant;
    this.rules = new ADnDRuleEngine();
    this.inCombat = false;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants = new Map();
    this.combatLog = [];
    this.consultation = null;
  }

  /**
   * Begin encounter with full linkage
   */
  async beginEncounter(encounterName, enemies, partyMembers, encounterData = {}) {
    console.log(`\n⚔️  INITIATING LINKED ENCOUNTER: ${encounterName}\n`);

    // STEP 1: Consult rulebooks
    this.consultation = await this.consultant.consultBeforeEncounter(
      {
        name: encounterName,
        type: encounterData.type || 'combat',
        enemies,
        difficulty: encounterData.difficulty || 'medium',
        ...encounterData
      },
      partyMembers
    );

    // STEP 2: Initialize combat state
    this.inCombat = true;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants.clear();

    // STEP 3: Load party with full linkage
    console.log('\n🔗 LINKING CHARACTER DATA TO RULES...\n');
    
    for (const memberName of partyMembers) {
      try {
        const character = this.consultant.characterLoader.loadCharacter(memberName);
        const combatant = new LinkedCombatant(memberName, character, 'party');
        this.combatants.set(memberName, combatant);
        this.turnOrder.push(memberName);
        
        console.log(`  ✓ ${memberName} linked:`);
        console.log(`    AC: ${combatant.ac}, THAC0: ${combatant.thac0}, Attacks: ${combatant.extraAttacks}`);
        if (combatant.conditions.length > 0) {
          console.log(`    Conditions: ${combatant.conditions.join(', ')}`);
        }
      } catch (e) {
        console.warn(`  ⚠️  Could not fully link ${memberName}: ${e.message}`);
        // Create basic combatant
        const basicChar = { name: memberName, hp: { current: 10, max: 10 } };
        const combatant = new LinkedCombatant(memberName, basicChar, 'party');
        this.combatants.set(memberName, combatant);
        this.turnOrder.push(memberName);
      }
    }

    // STEP 4: Add enemies
    for (const enemy of enemies) {
      const enemyName = typeof enemy === 'string' ? enemy : enemy.name;
      const enemyData = typeof enemy === 'string' 
        ? { name: enemyName, hp: { current: 10, max: 10 }, ac: { total: 10 } }
        : { 
            name: enemyName, 
            hp: { current: enemy.hp || 10, max: enemy.hp || 10 },
            ac: { total: enemy.ac || 10 },
            thac0: enemy.thac0 || 20,
            ...enemy
          };
      
      const combatant = new LinkedCombatant(enemyName, enemyData, 'enemy');
      this.combatants.set(enemyName, combatant);
      this.turnOrder.push(enemyName);
    }

    // STEP 5: Roll initiative with Dexterity modifier
    console.log('\n🎲 ROLLING INITIATIVE (with ability modifiers)...\n');
    
    for (const name of this.turnOrder) {
      const combatant = this.combatants.get(name);
      const dex = combatant.abilityScores?.dex?.score || 10;
      const initRoll = this.rules.initiativeRoll(dex);
      combatant.initiative = initRoll.total;
      
      const dexMod = AbilityScoreLinkage.getModifier(dex);
      const modStr = dexMod >= 0 ? `+${dexMod}` : dexMod;
      console.log(`  ${name}: ${initRoll.d20} ${modStr} = ${initRoll.total}`);
    }

    // Sort by initiative
    this.turnOrder.sort((a, b) => {
      const initA = this.combatants.get(a).initiative;
      const initB = this.combatants.get(b).initiative;
      return initB - initA;
    });

    // STEP 6: Log and display
    this.logCombatEvent('encounter_start', {
      name: encounterName,
      participants: Array.from(this.combatants.keys()),
      turnOrder: this.turnOrder
    });

    this.printEncounterStart();

    return {
      encounter: encounterName,
      participants: Array.from(this.combatants.keys()),
      turnOrder: this.turnOrder
    };
  }

  /**
   * Execute attack with full linkage
   */
  executeAttack(attackerName, targetName, weapon = {}) {
    const attacker = this.combatants.get(attackerName);
    const target = this.combatants.get(targetName);

    if (!attacker || !target) {
      return { error: 'Invalid attacker or target' };
    }

    // Check action availability
    if (!attacker.actions.standard) {
      return { error: `${attackerName} has no standard action remaining` };
    }

    // Validate action
    const validation = attacker.validateAction('attack');
    if (!validation.allowed) {
      return { error: validation.reason };
    }

    // Calculate attack with all modifiers
    const attackCalc = attacker.getAttackRoll(weapon);
    const targetAC = target.ac;
    
    // Roll attack
    const attackResult = this.rules.attackRoll(attackCalc.totalBonus, targetAC);
    
    // Apply THAC0
    const neededRoll = attackCalc.thac0 - targetAC;
    const effectiveHit = attackResult.total >= neededRoll || attackResult.critical === 'HIT';

    // Spend action
    attacker.actions.standard = false;

    // Log
    this.logCombatEvent('attack', {
      attacker: attackerName,
      target: targetName,
      roll: attackResult.d20,
      total: attackResult.total,
      needed: neededRoll,
      thac0: attackCalc.thac0,
      targetAC,
      hit: effectiveHit,
      critical: attackResult.critical,
      modifiers: {
        ability: attackCalc.abilityBonus,
        magic: attackCalc.magicBonus,
        condition: attackCalc.conditionMod
      }
    });

    // Output
    const modStr = attackCalc.totalBonus >= 0 ? `+${attackCalc.totalBonus}` : attackCalc.totalBonus;
    console.log(`\n⚔️  ${attackerName} attacks ${targetName}`);
    console.log(`   THAC0: ${attackCalc.thac0}, Target AC: ${targetAC}, Need: ${neededRoll}+`);
    console.log(`   Roll: ${attackResult.d20} ${modStr} = ${attackResult.total}`);
    
    if (attackResult.critical === 'HIT') {
      console.log(`   🎯 CRITICAL HIT! (Natural 20)`);
    } else if (attackResult.critical === 'MISS') {
      console.log(`   💨 CRITICAL MISS! (Natural 1)`);
    } else if (effectiveHit) {
      console.log(`   💥 HIT!`);
    } else {
      console.log(`   🛡️  Miss`);
    }

    return {
      attacker: attackerName,
      target: targetName,
      roll: attackResult.d20,
      total: attackResult.total,
      needed: neededRoll,
      hit: effectiveHit,
      critical: attackResult.critical,
      damageBonus: AbilityScoreLinkage.getDamageBonus(attacker.characterData, weapon)
    };
  }

  /**
   * Apply damage with condition checks
   */
  applyDamage(targetName, amount, damageType = 'physical', source = 'attack') {
    const target = this.combatants.get(targetName);
    if (!target) {
      return { error: `Target ${targetName} not found` };
    }

    const previousHP = target.hp;
    target.hp -= amount;

    // Check for status changes
    let status = 'alive';
    if (target.hp <= 0) {
      target.addCondition('unconscious');
      if (target.hp <= -10) {
        status = 'dead';
        console.log(`\n💀 ${targetName} has died!`);
      } else {
        status = 'unconscious';
        console.log(`\n😵 ${targetName} falls unconscious!`);
      }
    }

    // Log
    this.logCombatEvent('damage', {
      target: targetName,
      damage: amount,
      type: damageType,
      source,
      previousHP,
      newHP: target.hp,
      status
    });

    console.log(`\n💔 ${targetName} takes ${amount} ${damageType} damage`);
    console.log(`   HP: ${previousHP} → ${target.hp}`);

    return {
      target: targetName,
      damage: amount,
      previousHP,
      newHP: target.hp,
      status
    };
  }

  /**
   * Cast spell with full validation
   */
  castSpell(casterName, spellName, spellLevel, spellClass = 'mage', options = {}) {
    const caster = this.combatants.get(casterName);
    if (!caster) {
      return { error: `Caster ${casterName} not found` };
    }

    // Validate spell casting
    const validation = caster.validateAction('cast_spell', {
      spellName,
      spellLevel,
      spellClass
    });

    if (!validation.valid) {
      console.log(`\n❌ Cannot cast ${spellName}:`);
      validation.errors.forEach(e => console.log(`   • ${e}`));
      return { error: validation.errors.join(', ') };
    }

    // Check spell slots
    const slots = caster.spells?.[spellClass]?.[String(spellLevel)];
    if (!slots || slots.remaining <= 0) {
      return { error: `${casterName} has no level ${spellLevel} ${spellClass} spell slots remaining` };
    }

    // Spend slot
    slots.remaining--;

    // Calculate effect based on caster level
    const effects = SpellLinkage.calculateSpellEffect(spellName, caster.characterData.level || 1);

    // Spend action
    caster.actions.standard = false;

    // Log
    this.logCombatEvent('spell_cast', {
      caster: casterName,
      spell: spellName,
      level: spellLevel,
      class: spellClass,
      slotsRemaining: slots.remaining,
      effects
    });

    console.log(`\n✨ ${casterName} casts ${spellName}`);
    console.log(`   Level ${spellLevel} ${spellClass} spell`);
    console.log(`   Slots remaining: ${slots.remaining}`);
    if (effects) {
      console.log(`   Effect: ${effects.damage || effects.healing || effects.duration}`);
    }

    return {
      caster: casterName,
      spell: spellName,
      level: spellLevel,
      slotsRemaining: slots.remaining,
      effects
    };
  }

  /**
   * Make saving throw with full modifiers
   */
  makeSave(characterName, saveType, dc = null) {
    const character = this.combatants.get(characterName);
    if (!character) {
      return { error: `Character ${characterName} not found` };
    }

    const saveCalc = character.getSave(saveType);
    const targetRoll = dc || saveCalc.target;

    // Roll
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= targetRoll;

    // Log
    this.logCombatEvent('saving_throw', {
      character: characterName,
      type: saveType,
      target: targetRoll,
      roll,
      success,
      modifiers: saveCalc.modifiers
    });

    const modTotal = saveCalc.modifiers.ability + saveCalc.modifiers.racial + saveCalc.modifiers.condition;
    const modStr = modTotal >= 0 ? `+${modTotal}` : modTotal;

    console.log(`\n🎲 ${characterName} ${saveType} save`);
    console.log(`   Target: ${targetRoll}, Roll: ${roll}, Mod: ${modStr}`);
    console.log(`   ${success ? '✅ SUCCESS' : '❌ FAILURE'}`);

    return {
      character: characterName,
      type: saveType,
      target: targetRoll,
      roll,
      success,
      modifiers: saveCalc.modifiers
    };
  }

  /**
   * Apply condition to target
   */
  applyCondition(targetName, condition) {
    const target = this.combatants.get(targetName);
    if (!target) {
      return { error: `Target ${targetName} not found` };
    }

    const added = target.addCondition(condition);
    
    if (added) {
      const effects = ConditionLinkage.conditionEffects[condition.toLowerCase()];
      
      this.logCombatEvent('condition_applied', {
        target: targetName,
        condition,
        effects
      });

      console.log(`\n⚡ ${targetName} is now ${condition}`);
      if (effects) {
        if (effects.acPenalty) console.log(`   AC penalty: -${effects.acPenalty}`);
        if (effects.attackPenalty) console.log(`   Attack penalty: -${effects.attackPenalty}`);
        if (effects.loseActions) console.log(`   Cannot use: ${effects.loseActions.join(', ')}`);
      }

      return { success: true, target: targetName, condition };
    }

    return { success: false, reason: 'Condition already present' };
  }

  /**
   * Remove condition from target
   */
  removeCondition(targetName, condition) {
    const target = this.combatants.get(targetName);
    if (!target) {
      return { error: `Target ${targetName} not found` };
    }

    const removed = target.removeCondition(condition);
    
    if (removed) {
      this.logCombatEvent('condition_removed', {
        target: targetName,
        condition
      });

      console.log(`\n✅ ${condition} removed from ${targetName}`);
      return { success: true, target: targetName, condition };
    }

    return { success: false, reason: 'Condition not present' };
  }

  /**
   * Start next round
   */
  nextRound() {
    if (!this.inCombat) {
      return { error: 'No combat in progress' };
    }

    this.currentRound++;

    // Reset actions
    for (const combatant of this.combatants.values()) {
      combatant.actions = { standard: true, move: true, swift: true };
      
      // Check for condition durations
      // (Would decrement duration counters here)
    }

    this.logCombatEvent('round_start', {
      round: this.currentRound,
      turnOrder: this.turnOrder
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔷 ROUND ${this.currentRound} STARTS`);
    console.log('='.repeat(60));

    return {
      round: this.currentRound,
      firstTurn: this.turnOrder[0]
    };
  }

  /**
   * End combat
   */
  endCombat(result = 'victory', xpAwarded = 0) {
    if (!this.inCombat) {
      return { error: 'No combat in progress' };
    }

    this.logCombatEvent('encounter_end', {
      result,
      xpAwarded,
      rounds: this.currentRound
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`COMBAT ENDED - ${result.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(`Rounds: ${this.currentRound}`);
    console.log(`XP Awarded: ${xpAwarded}`);

    const summary = {
      result,
      rounds: this.currentRound,
      xpAwarded,
      combatLog: this.combatLog,
      finalState: Array.from(this.combatants.entries()).map(([name, data]) => ({
        name,
        hp: data.hp,
        maxHp: data.maxHp,
        conditions: data.conditions
      }))
    };

    this.inCombat = false;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants.clear();

    return summary;
  }

  /**
   * Print encounter start
   */
  printEncounterStart() {
    console.log('\n' + '='.repeat(60));
    console.log('LINKED COMBAT INITIATED');
    console.log('='.repeat(60));

    console.log('\n👥 COMBATANTS:');
    for (const name of this.turnOrder) {
      const c = this.combatants.get(name);
      const type = c.type === 'party' ? '🟢' : '🔴';
      const cond = c.conditions.length > 0 ? ` [${c.conditions.join(', ')}]` : '';
      console.log(`  ${type} ${name} (HP: ${c.hp}/${c.maxHp}, AC: ${c.ac}, THAC0: ${c.thac0})${cond}`);
    }

    console.log('\n📋 TURN ORDER:');
    this.turnOrder.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name} (Init: ${this.combatants.get(name).initiative})`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Log combat event
   */
  logCombatEvent(type, data) {
    this.combatLog.push({
      timestamp: new Date().toISOString(),
      round: this.currentRound,
      type,
      ...data
    });
  }

  /**
   * Get combat status
   */
  getCombatStatus() {
    return {
      inCombat: this.inCombat,
      round: this.currentRound,
      turnOrder: this.turnOrder,
      currentTurn: this.turnOrder[this.currentRound % this.turnOrder.length],
      combatants: Array.from(this.combatants.entries()).map(([name, data]) => data.getSummary())
    };
  }
}

export default { LinkedCombatEngine, LinkedCombatant };
