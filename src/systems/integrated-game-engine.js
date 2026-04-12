#!/usr/bin/env node

/**
 * INTEGRATED GAME ENGINE
 * 
 * Enhanced game engine with automatic rulebook and character sheet consultation.
 * This engine ensures that every encounter is validated against the rules and
 * all character data is loaded before combat begins.
 * 
 * Integration Points:
 * - Pre-encounter rulebook consultation (PHB, DMG, MM)
 * - Character sheet loading and validation
 * - Real-time mechanical validation
 * - Automatic rule lookups during play
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CharacterSheetLoader, RulebookConsultant } from './rulebook-consultant/index.js';
import { ADnDRuleEngine } from '../../adnd-rule-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * IntegratedCombatEngine - Combat with rulebook integration
 */
export class IntegratedCombatEngine {
  constructor(rulebookConsultant, ruleEngine) {
    this.consultant = rulebookConsultant;
    this.rules = ruleEngine || new ADnDRuleEngine();
    this.inCombat = false;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants = new Map();
    this.combatLog = [];
    this.consultation = null;
  }

  /**
   * Begin encounter with automatic rulebook consultation
   */
  async beginEncounter(encounterName, enemies, partyMembers, encounterData = {}) {
    console.log(`\n⚔️  INITIATING ENCOUNTER: ${encounterName}\n`);

    // STEP 1: Consult rulebooks and load character sheets
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

    // STEP 3: Load party members with full character data
    for (const memberName of partyMembers) {
      try {
        const character = this.consultant.characterLoader.loadCharacter(memberName);
        this.combatants.set(memberName, {
          name: memberName,
          type: 'party',
          hp: character.hp?.current || 10,
          maxHp: character.hp?.max || 10,
          ac: character.ac?.total || 10,
          thac0: character.thac0 || 20,
          abilityScores: character.abilityScores || {},
          saves: character.saves || {},
          spells: character.spells || {},
          magicItems: character.magicItems || [],
          conditions: character.conditions || [],
          initiative: 0,
          actions: { standard: true, move: true, swift: true }
        });
        this.turnOrder.push(memberName);
      } catch (e) {
        console.warn(`Could not load character ${memberName}: ${e.message}`);
        // Add with defaults
        this.combatants.set(memberName, {
          name: memberName,
          type: 'party',
          hp: 10,
          maxHp: 10,
          ac: 10,
          thac0: 20,
          initiative: 0,
          actions: { standard: true, move: true, swift: true }
        });
        this.turnOrder.push(memberName);
      }
    }

    // STEP 4: Add enemies
    for (const enemy of enemies) {
      const enemyName = typeof enemy === 'string' ? enemy : enemy.name;
      const hp = typeof enemy === 'string' ? 10 : (enemy.hp || 10);
      const ac = typeof enemy === 'string' ? 10 : (enemy.ac || 10);
      const thac0 = typeof enemy === 'string' ? 20 : (enemy.thac0 || 20);

      this.combatants.set(enemyName, {
        name: enemyName,
        type: 'enemy',
        hp,
        maxHp: hp,
        ac,
        thac0,
        initiative: 0,
        actions: { standard: true, move: true, swift: true },
        ...(typeof enemy === 'object' ? enemy : {})
      });
      this.turnOrder.push(enemyName);
    }

    // STEP 5: Roll initiative
    console.log('\n🎲 ROLLING INITIATIVE...\n');
    for (const name of this.turnOrder) {
      const combatant = this.combatants.get(name);
      const dex = combatant.abilityScores?.dex?.score || 10;
      const initRoll = this.rules.initiativeRoll(dex);
      combatant.initiative = initRoll.total;
      console.log(`  ${name}: ${initRoll.message}`);
    }

    // Sort by initiative (highest first)
    this.turnOrder.sort((a, b) => {
      const initA = this.combatants.get(a).initiative;
      const initB = this.combatants.get(b).initiative;
      return initB - initA;
    });

    // STEP 6: Log encounter start
    this.logCombatEvent('encounter_start', {
      name: encounterName,
      participants: Array.from(this.combatants.keys()),
      turnOrder: this.turnOrder,
      consultation: this.consultation
    });

    // STEP 7: Print encounter summary
    this.printEncounterStart();

    return {
      encounter: encounterName,
      participants: Array.from(this.combatants.keys()),
      turnOrder: this.turnOrder,
      consultation: this.consultation
    };
  }

  /**
   * Print encounter start summary
   */
  printEncounterStart() {
    console.log('\n' + '='.repeat(60));
    console.log('COMBAT INITIATED');
    console.log('='.repeat(60));

    console.log('\n👥 COMBATANTS:');
    for (const name of this.turnOrder) {
      const c = this.combatants.get(name);
      const type = c.type === 'party' ? '🟢' : '🔴';
      console.log(`  ${type} ${name} (HP: ${c.hp}/${c.maxHp}, AC: ${c.ac}, Init: ${c.initiative})`);
    }

    console.log('\n📋 TURN ORDER:');
    this.turnOrder.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Start next round
   */
  nextRound() {
    if (!this.inCombat) {
      return { error: 'No combat in progress' };
    }

    this.currentRound++;

    // Reset actions for all combatants
    for (const combatant of this.combatants.values()) {
      combatant.actions = { standard: true, move: true, swift: true };
    }

    this.logCombatEvent('round_start', {
      round: this.currentRound,
      turnOrder: this.turnOrder
    });

    console.log(`\n🔷 ROUND ${this.currentRound} STARTS\n`);

    return {
      round: this.currentRound,
      firstTurn: this.turnOrder[0]
    };
  }

  /**
   * Execute attack with full rule validation
   */
  executeAttack(attackerName, targetName, options = {}) {
    const attacker = this.combatants.get(attackerName);
    const target = this.combatants.get(targetName);

    if (!attacker || !target) {
      return { error: 'Invalid attacker or target' };
    }

    // Check if attacker has standard action
    if (!attacker.actions.standard) {
      return { error: `${attackerName} has no standard action remaining` };
    }

    // Calculate attack bonus
    const strBonus = attacker.abilityScores?.str?.mod || 0;
    const attackBonus = options.attackBonus || strBonus;
    const targetAC = target.ac;

    // Roll attack
    const attackResult = this.rules.attackRoll(attackBonus, targetAC);

    // Spend standard action
    attacker.actions.standard = false;

    // Log the attack
    this.logCombatEvent('attack', {
      attacker: attackerName,
      target: targetName,
      roll: attackResult.d20,
      total: attackResult.total,
      targetAC,
      hit: attackResult.hit,
      critical: attackResult.critical
    });

    console.log(`⚔️  ${attackerName} attacks ${targetName}: ${attackResult.message}`);

    // If hit, prompt for damage
    if (attackResult.hit) {
      console.log(`   💥 HIT! Roll damage...`);
    }

    return {
      attacker: attackerName,
      target: targetName,
      ...attackResult
    };
  }

  /**
   * Apply damage with validation
   */
  applyDamage(targetName, amount, damageType = 'physical', source = 'attack') {
    const target = this.combatants.get(targetName);
    if (!target) {
      return { error: `Target ${targetName} not found` };
    }

    const previousHP = target.hp;
    target.hp -= amount;

    // Check for unconsciousness or death
    let status = 'alive';
    if (target.hp <= 0) {
      if (target.hp <= -10) {
        status = 'dead';
        console.log(`💀 ${targetName} has died!`);
      } else {
        status = 'unconscious';
        console.log(`😵 ${targetName} falls unconscious!`);
      }
    }

    // Log damage
    this.logCombatEvent('damage', {
      target: targetName,
      damage: amount,
      type: damageType,
      source,
      previousHP,
      newHP: target.hp,
      status
    });

    console.log(`💔 ${targetName} takes ${amount} ${damageType} damage (${previousHP} → ${target.hp})`);

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

    // Check if caster has standard action
    if (!caster.actions.standard) {
      return { error: `${casterName} has no standard action remaining` };
    }

    // Check spell slots
    const spellSlots = caster.spells?.[spellClass];
    if (!spellSlots) {
      return { error: `${casterName} has no ${spellClass} spell slots` };
    }

    const levelKey = String(spellLevel);
    const slots = spellSlots[levelKey];
    if (!slots || slots.remaining <= 0) {
      return { error: `${casterName} has no level ${spellLevel} ${spellClass} spell slots remaining` };
    }

    // Spend spell slot
    slots.remaining--;

    // Spend standard action
    caster.actions.standard = false;

    // Log spell cast
    this.logCombatEvent('spell_cast', {
      caster: casterName,
      spell: spellName,
      level: spellLevel,
      class: spellClass,
      slotsRemaining: slots.remaining
    });

    console.log(`✨ ${casterName} casts ${spellName} (L${spellLevel}) - ${slots.remaining} slots remaining`);

    return {
      caster: casterName,
      spell: spellName,
      level: spellLevel,
      slotsRemaining: slots.remaining
    };
  }

  /**
   * Make saving throw
   */
  makeSave(characterName, saveType, dc = null) {
    const character = this.combatants.get(characterName);
    if (!character) {
      return { error: `Character ${characterName} not found` };
    }

    // Get save value from character sheet
    const saveValue = character.saves?.[saveType] || 10;
    const effectiveDC = dc || saveValue;

    // Roll d20 save
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= effectiveDC;

    this.logCombatEvent('saving_throw', {
      character: characterName,
      type: saveType,
      dc: effectiveDC,
      roll,
      success
    });

    console.log(`${success ? '✅' : '❌'} ${characterName} ${saveType} save: ${roll} vs ${effectiveDC} - ${success ? 'SUCCESS' : 'FAILURE'}`);

    return {
      character: characterName,
      type: saveType,
      dc: effectiveDC,
      roll,
      success
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

    console.log('\n' + '='.repeat(60));
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
      combatants: Array.from(this.combatants.entries()).map(([name, data]) => ({
        name,
        type: data.type,
        hp: data.hp,
        maxHp: data.maxHp,
        ac: data.ac,
        initiative: data.initiative,
        actions: data.actions,
        conditions: data.conditions
      }))
    };
  }

  /**
   * Get consultation data
   */
  getConsultation() {
    return this.consultation;
  }
}

/**
 * Enhanced Game Master Orchestrator with Rulebook Integration
 */
export class EnhancedGameMaster {
  constructor(options = {}) {
    this.consultant = new RulebookConsultant(options);
    this.ruleEngine = new ADnDRuleEngine();
    this.combatEngine = null;
    this.party = [];
    this.sessionLog = [];
  }

  /**
   * Initialize with party
   */
  async initialize(partyNames) {
    console.log('🎲 Initializing Enhanced Game Master...\n');
    
    this.party = this.consultant.characterLoader.loadParty(partyNames);
    
    console.log(`✓ Loaded ${this.party.length} party members:`);
    for (const member of this.party) {
      console.log(`  • ${member.name} (${member.class} ${member.level})`);
    }
    
    return this.party;
  }

  /**
   * Start encounter with full rulebook consultation
   */
  async startEncounter(encounterData) {
    const partyNames = this.party.map(p => p.name);
    
    this.combatEngine = new IntegratedCombatEngine(this.consultant, this.ruleEngine);
    
    const result = await this.combatEngine.beginEncounter(
      encounterData.name || 'Unnamed Encounter',
      encounterData.enemies || [],
      partyNames,
      encounterData
    );

    this.sessionLog.push({
      type: 'encounter_start',
      data: result,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Get quick reference for a rule
   */
  async lookupRule(rulebook, topic) {
    switch (rulebook.toLowerCase()) {
      case 'phb':
        return await this.consultant.queryPHB(topic);
      case 'dmg':
        return await this.consultant.queryDMG(topic);
      case 'mm':
        return await this.consultant.queryMM(topic);
      default:
        return null;
    }
  }

  /**
   * Get character sheet data
   */
  getCharacter(name) {
    return this.consultant.characterLoader.loadCharacter(name);
  }

  /**
   * List all characters
   */
  listCharacters() {
    return this.consultant.characterLoader.listCharacters();
  }

  /**
   * Get combat engine for current encounter
   */
  getCombat() {
    return this.combatEngine;
  }

  /**
   * End session and save log
   */
  endSession() {
    const summary = {
      timestamp: new Date().toISOString(),
      party: this.party.map(p => p.name),
      log: this.sessionLog
    };

    console.log('\n📚 Session ended');
    console.log(`   Events logged: ${this.sessionLog.length}`);

    return summary;
  }
}

// Export for module use
export default { 
  IntegratedCombatEngine, 
  EnhancedGameMaster,
  CharacterSheetLoader,
  RulebookConsultant
};

// CLI usage
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const command = args[0];

  const gm = new EnhancedGameMaster();

  switch (command) {
    case 'init':
      const partyNames = args[1]?.split(',') || ['malice', 'blackdow', 'dogman', 'threetrees', 'grond'];
      gm.initialize(partyNames);
      break;

    case 'encounter':
      const encounterName = args[1] || 'Test Encounter';
      const enemyList = args[2]?.split(',') || ['goblin', 'goblin'];
      
      gm.initialize(['malice', 'blackdow', 'dogman', 'threetrees', 'grond']).then(() => {
        gm.startEncounter({
          name: encounterName,
          enemies: enemyList.map(e => ({ name: e, hp: 7, ac: 6 }))
        });
      });
      break;

    case 'lookup':
      const book = args[1];
      const topic = args[2];
      if (!book || !topic) {
        console.log('Usage: lookup <phb|dmg|mm> <topic>');
        process.exit(1);
      }
      gm.lookupRule(book, topic).then(result => {
        console.log(result || 'No results found');
      });
      break;

    case 'character':
      const charName = args[1];
      if (!charName) {
        console.log('Usage: character <name>');
        process.exit(1);
      }
      const char = gm.getCharacter(charName);
      console.log(JSON.stringify(char, null, 2));
      break;

    default:
      console.log(`
Integrated Game Engine CLI

Usage:
  node integrated-game-engine.js init [party-names]
  node integrated-game-engine.js encounter [name] [enemies]
  node integrated-game-engine.js lookup <phb|dmg|mm> <topic>
  node integrated-game-engine.js character <name>

Examples:
  node integrated-game-engine.js init
  node integrated-game-engine.js init malice,blackdow
  node integrated-game-engine.js encounter "Goblin Ambush" goblin,goblin,orc
  node integrated-game-engine.js lookup phb combat
  node integrated-game-engine.js character malice
`);
  }
}
