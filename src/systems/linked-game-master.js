#!/usr/bin/env node

/**
 * LINKED GAME MASTER
 * 
 * Game Master with deep character-rule linkage for roleplaying and combat.
 * Every decision factors in character abilities, conditions, and rules.
 */

import { RulebookConsultant } from './rulebook-consultant/index.js';
import { LinkedCombatEngine } from './linked-combat-engine.js';
import { CompleteCharacterLinkage } from './character-rule-linkage.js';

/**
 * LinkedGameMaster - Full integration of rules and character data
 */
export class LinkedGameMaster {
  constructor(options = {}) {
    this.consultant = new RulebookConsultant(options);
    this.combatEngine = null;
    this.party = [];
    this.sessionLog = [];
    this.currentScene = null;
  }

  /**
   * Initialize with party
   */
  async initialize(partyNames) {
    console.log('🎲 Initializing Linked Game Master...\n');
    
    this.party = this.consultant.characterLoader.loadParty(partyNames);
    
    console.log(`✓ Linked ${this.party.length} party members:\n`);
    
    for (const member of this.party) {
      const linkage = new CompleteCharacterLinkage(member);
      const effects = linkage.getActiveEffects();
      
      console.log(`  📊 ${member.name}`);
      console.log(`     Class: ${member.class} ${member.level}`);
      console.log(`     AC: ${linkage.calculateAC().total}, THAC0: ${member.thac0 || 'calculated'}`);
      
      if (effects.racialAbilities && Object.keys(effects.racialAbilities).length > 0) {
        console.log(`     Racial: ${Object.keys(effects.racialAbilities).join(', ')}`);
      }
      
      if (effects.magicItems && effects.magicItems.length > 0) {
        console.log(`     Items: ${effects.magicItems.length} magic items`);
      }
      
      console.log();
    }
    
    return this.party;
  }

  /**
   * Start encounter with full linkage
   */
  async startEncounter(encounterData) {
    const partyNames = this.party.map(p => p.name);
    
    this.combatEngine = new LinkedCombatEngine(this.consultant);
    
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
   * Process a roleplay action with full character context
   */
  processRoleplayAction(characterName, action, context = {}) {
    const character = this.getCharacter(characterName);
    if (!character) {
      return { error: `Character ${characterName} not found` };
    }

    const linkage = new CompleteCharacterLinkage(character);
    const effects = linkage.getActiveEffects();

    console.log(`\n🎭 ${characterName} attempts: ${action}`);

    // Factor in ability scores
    let relevantAbility = null;
    let abilityMod = 0;

    if (action.toLowerCase().includes('strength') || action.toLowerCase().includes('lift')) {
      relevantAbility = 'STR';
      abilityMod = effects.abilityScores?.str?.mod || 0;
    } else if (action.toLowerCase().includes('dexterity') || action.toLowerCase().includes('sneak')) {
      relevantAbility = 'DEX';
      abilityMod = effects.abilityScores?.dex?.mod || 0;
    } else if (action.toLowerCase().includes('intelligence') || action.toLowerCase().includes('know')) {
      relevantAbility = 'INT';
      abilityMod = effects.abilityScores?.int?.mod || 0;
    } else if (action.toLowerCase().includes('wisdom') || action.toLowerCase().includes('perceive')) {
      relevantAbility = 'WIS';
      abilityMod = effects.abilityScores?.wis?.mod || 0;
    } else if (action.toLowerCase().includes('charisma') || action.toLowerCase().includes('persuade')) {
      relevantAbility = 'CHA';
      abilityMod = effects.abilityScores?.cha?.mod || 0;
    }

    if (relevantAbility) {
      console.log(`   Relevant ability: ${relevantAbility} (${abilityMod >= 0 ? '+' : ''}${abilityMod})`);
    }

    // Factor in racial abilities
    if (effects.racialAbilities) {
      if (effects.racialAbilities.darkvision && context.lighting === 'dark') {
        console.log(`   Racial: Darkvision active (${effects.racialAbilities.darkvision}ft)`);
      }
      if (effects.racialAbilities.charmResistance && action.toLowerCase().includes('charm')) {
        console.log(`   Racial: Charm resistance applies`);
      }
    }

    // Factor in conditions
    if (effects.conditions && effects.conditions.length > 0) {
      console.log(`   Conditions: ${effects.conditions.join(', ')}`);
    }

    // Factor in class features
    if (effects.classFeatures) {
      if (effects.classFeatures.tracking && action.toLowerCase().includes('track')) {
        console.log(`   Class: Tracking bonus applies`);
      }
    }

    return {
      character: characterName,
      action,
      relevantAbility,
      abilityMod,
      racialAbilities: effects.racialAbilities,
      conditions: effects.conditions,
      success: null // DM decides based on context
    };
  }

  /**
   * Get character with full linkage
   */
  getCharacter(name) {
    return this.consultant.characterLoader.loadCharacter(name);
  }

  /**
   * Get combat engine
   */
  getCombat() {
    return this.combatEngine;
  }

  /**
   * Lookup rule
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
   * End session
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

export default { LinkedGameMaster };
