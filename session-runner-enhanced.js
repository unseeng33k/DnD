#!/usr/bin/env node

/**
 * Enhanced Session Runner - Integrated with DM Memory System
 * 
 * This is the game engine that coordinates:
 * - Session flow
 * - Real-time memory logging
 * - Character state tracking
 * - Combat management
 * - Event timeline
 * - Decision audit trail
 * 
 * The DM Memory System is wired into every major action.
 * Nothing gets forgotten. Every decision is logged.
 * 
 * Usage:
 *   import { EnhancedSessionRunner } from './session-runner-enhanced.js';
 *   const session = new EnhancedSessionRunner('Curse of Strahd', 1);
 *   await session.start();
 */

import { DMMemory } from './dm-memory-system.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Combat Manager with Memory Integration
 */
class CombatManager {
  constructor(memory) {
    this.memory = memory;
    this.inCombat = false;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatLog = [];
  }

  startCombat(encounterName, participants) {
    this.inCombat = true;
    this.currentRound = 0;
    this.turnOrder = participants;
    
    this.memory.setEncounter(encounterName, {
      participants: participants,
      startTime: new Date().toISOString()
    });

    console.log(`\n⚔️  COMBAT STARTED: ${encounterName}`);
    console.log(`Participants: ${participants.join(', ')}\n`);

    return {
      success: true,
      encounter: encounterName,
      participants: participants
    };
  }

  nextRound() {
    this.currentRound++;
    this.memory.logCombatRound(this.currentRound, this.turnOrder);
    
    console.log(`\n═══════════════════════════════════════`);
    console.log(`ROUND ${this.currentRound}`);
    console.log(`═══════════════════════════════════════\n`);

    return {
      round: this.currentRound,
      turnOrder: this.turnOrder
    };
  }

  logAction(character, action, roll = null, result = null) {
    const entry = this.memory.logAction(character, action, {
      roll,
      result,
      round: this.currentRound
    });

    let output = `${character} ${action}`;
    if (roll !== null) {
      output += ` [${roll}]`;
    }
    if (result !== null) {
      output += ` → ${result}`;
    }

    console.log(output);
    return entry;
  }

  endCombat(result = 'victory') {
    this.inCombat = false;
    
    this.memory.logEvent('combat', `Combat ended - ${result}`, {
      finalRound: this.currentRound,
      result: result
    });

    console.log(`\n✅ Combat ended: ${result}`);
    console.log(`Total rounds: ${this.currentRound}\n`);

    return {
      success: true,
      roundsFought: this.currentRound,
      result: result
    };
  }
}

/**
 * Character State Manager
 */
class CharacterStateManager {
  constructor(memory) {
    this.memory = memory;
    this.characters = new Map();
  }

  addCharacter(name, startingHP, status = 'healthy') {
    this.characters.set(name, {
      name,
      hp: startingHP,
      maxHP: startingHP,
      status: status,
      resourcesUsed: {},
      damageDealt: 0,
      damageReceived: 0
    });

    this.memory.updateCharacterStatus(name, status);
    return this.characters.get(name);
  }

  takeDamage(character, amount, source = 'unknown') {
    const char = this.characters.get(character);
    if (!char) return { error: `Character ${character} not found` };

    char.hp -= amount;
    char.damageReceived += amount;

    // Determine status
    if (char.hp <= 0) {
      char.status = 'unconscious';
    } else if (char.hp < char.maxHP / 2) {
      char.status = 'wounded';
    } else {
      char.status = 'healthy';
    }

    this.memory.updateCharacterStatus(character, char.status);

    return {
      character,
      damage: amount,
      hp: char.hp,
      status: char.status
    };
  }

  heal(character, amount) {
    const char = this.characters.get(character);
    if (!char) return { error: `Character ${character} not found` };

    const oldHP = char.hp;
    char.hp = Math.min(char.hp + amount, char.maxHP);

    if (char.hp > char.maxHP / 2) {
      char.status = 'healthy';
    }

    this.memory.updateCharacterStatus(character, char.status);

    return {
      character,
      healed: char.hp - oldHP,
      hp: char.hp,
      status: char.status
    };
  }

  spendResource(character, resource, amount = 1) {
    const char = this.characters.get(character);
    if (!char) return { error: `Character ${character} not found` };

    char.resourcesUsed[resource] = (char.resourcesUsed[resource] || 0) + amount;

    this.memory.logEvent('exploration', `${character} used ${resource}`, {
      character,
      resource,
      amount
    });

    return {
      character,
      resource,
      used: char.resourcesUsed[resource]
    };
  }

  getState(character) {
    return this.characters.get(character) || null;
  }

  getAllStates() {
    return Array.from(this.characters.values());
  }
}

/**
 * Main Enhanced Session Runner
 */
class EnhancedSessionRunner {
  constructor(campaignName, sessionNumber) {
    this.campaign = campaignName;
    this.session = sessionNumber;
    this.memory = new DMMemory(campaignName, sessionNumber);
    this.combat = new CombatManager(this.memory);
    this.characters = new CharacterStateManager(this.memory);
    this.startTime = new Date();
  }

  /**
   * Initialize session
   */
  async initialize(partyMembers) {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║ ${this.campaign.toUpperCase().padEnd(40)} ║`);
    console.log(`║ Session ${String(this.session).padEnd(33)} ║`);
    console.log(`╚════════════════════════════════════════╝\n`);

    // Add characters to tracking
    partyMembers.forEach(member => {
      this.characters.addCharacter(member.name, member.hp, 'ready');
    });

    this.memory.logEvent('exploration', `Session ${this.session} started`, {
      partySize: partyMembers.length,
      characters: partyMembers.map(m => m.name)
    });

    return {
      campaign: this.campaign,
      session: this.session,
      partySize: partyMembers.length
    };
  }

  /**
   * Move to a location
   */
  async setLocation(locationName, description = '') {
    this.memory.setLocation(locationName);

    if (description) {
      this.memory.logNarrativeEvent(description, {
        location: locationName
      });
    }

    console.log(`\n📍 ${locationName}`);
    if (description) {
      console.log(`${description}\n`);
    }

    return { location: locationName };
  }

  /**
   * Start combat encounter
   */
  async startEncounter(encounterName, enemies) {
    const partyNames = this.characters.getAllStates().map(c => c.name);
    const participants = [...partyNames, ...enemies];

    return this.combat.startCombat(encounterName, participants);
  }

  /**
   * Run a combat round
   */
  async combatRound(actions) {
    const roundStart = this.combat.nextRound();

    for (const action of actions) {
      switch (action.type) {
        case 'attack':
          this.combat.logAction(action.character, `attacks ${action.target}`, action.roll, action.result);
          break;

        case 'damage':
          const dmg = this.characters.takeDamage(action.target, action.amount, action.source);
          console.log(`💢 ${action.target} takes ${action.amount} damage (${dmg.hp}/${dmg.character.maxHP} HP)`);
          break;

        case 'heal':
          const healed = this.characters.heal(action.character, action.amount);
          console.log(`✨ ${action.character} healed for ${healed.healed} HP`);
          break;

        case 'ability':
          this.memory.logEvent('combat', `${action.character} uses ${action.ability}`, {
            character: action.character,
            ability: action.ability,
            details: action.details
          });
          console.log(`✨ ${action.character} uses ${action.ability}`);
          break;
      }
    }

    return {
      round: roundStart.round,
      actionsLogged: actions.length
    };
  }

  /**
   * End combat, return XP/rewards
   */
  async endEncounter(result = 'victory', rewards = {}) {
    const combatEnd = this.combat.endCombat(result);

    if (rewards.xp) {
      this.memory.logEvent('milestone', `Party gained ${rewards.xp} XP`, rewards);
    }

    if (rewards.gold) {
      this.memory.logEvent('milestone', `Party found ${rewards.gold} gold`, rewards);
    }

    return combatEnd;
  }

  /**
   * Record a major decision
   */
  recordDecision(decision, reasoning, ruleRef = null, impact = {}) {
    const result = this.memory.recordRuling(decision, reasoning, ruleRef, impact);

    console.log(`\n📋 Decision Recorded: ${decision}`);
    if (result.consistency.previousDecisions.length > 0) {
      console.log(`⚠️  ${result.consistency.message}`);
    }

    return result;
  }

  /**
   * Quick NPC interaction
   */
  recordNPCInteraction(npcName, description, details = {}) {
    this.memory.recordNPCInteraction(npcName, description, details);
    this.memory.logNarrativeEvent(`Interacted with ${npcName}`, {
      npc: npcName,
      interaction: description
    });

    console.log(`🎭 ${npcName}: ${description}`);

    return {
      npc: npcName,
      interaction: description
    };
  }

  /**
   * Log major discovery
   */
  logDiscovery(description, details = {}) {
    this.memory.logDiscovery(description, details);
    console.log(`🔍 DISCOVERY: ${description}\n`);

    return {
      discovery: description,
      details
    };
  }

  /**
   * End session and save
   */
  async endSession() {
    const duration = new Date() - this.startTime;
    const durationMinutes = Math.floor(duration / 1000 / 60);

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`SESSION ${this.session} COMPLETE`);
    console.log('═'.repeat(50));
    console.log(`Duration: ${durationMinutes} minutes`);
    console.log(`Events logged: ${this.memory.timeline.events.length}`);
    console.log(`Decisions recorded: ${this.memory.decisions.decisions.length}`);

    const savedFile = this.memory.saveSession();
    console.log(`\n💾 Session saved to: ${savedFile}`);
    console.log(`${'═'.repeat(50)}\n`);

    return {
      campaign: this.campaign,
      session: this.session,
      duration: durationMinutes,
      eventsLogged: this.memory.timeline.events.length,
      savedFile: savedFile
    };
  }

  /**
   * Get current session state
   */
  getSummary() {
    return {
      campaign: this.campaign,
      session: this.session,
      location: this.memory.state.location,
      activeEncounter: this.memory.state.activeEncounter,
      partyStatus: this.characters.getAllStates(),
      recentEvents: this.memory.timeline.getRecentEvents(5)
    };
  }
}

export { EnhancedSessionRunner, CombatManager, CharacterStateManager };
