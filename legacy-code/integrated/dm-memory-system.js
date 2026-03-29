#!/usr/bin/env node

/**
 * DM's Real-Time Memory System - Level 3 Integration
 * 
 * The DM's brain during gameplay:
 * - Active session state (what's happening NOW)
 * - Character sheets & abilities (searchable)
 * - Rule lookups (DMG/PHB instant access)
 * - NPC/monster database (with relationships)
 * - Decision log (what changed, why, consequences)
 * - Event timeline (what happened, when, by whom)
 * 
 * Every decision gets logged. Nothing gets forgotten.
 * 
 * Usage:
 *   import { DMMemory } from './dm-memory-system.js';
 *   const memory = new DMMemory('Curse of Strahd', sessionNumber);
 *   
 *   // Log an event
 *   memory.logEvent('combat', 'Initiative rolled', { round: 1, initiative: [12, 8, 5] });
 *   
 *   // Check character ability
 *   memory.getCharacterAbility('Malice', 'sneak attack');
 *   
 *   // Look up a rule
 *   memory.lookupRule('inspiration', 'action');
 *   
 *   // Make a decision with context
 *   memory.recordDecision('Allow bonus action sneak attack', 'advantage', 'PHB page 96', 
 *     { appliedTo: 'Malice', baseCheck: 12, withBonus: 14 });
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rule Database - DMG, PHB, quick references
 */
class RuleDatabase {
  constructor() {
    this.rules = {
      // Actions & Bonus Actions (PHB p.192-193)
      'action': {
        description: 'An action in combat lets you perform a wide variety of activities',
        sources: ['PHB 192'],
        options: [
          'Attack', 'Cast a Spell', 'Dash', 'Disengage', 'Dodge', 
          'Help', 'Hide', 'Ready', 'Search', 'Use Object'
        ]
      },
      'bonus_action': {
        description: 'A bonus action is a quick action that happens on your turn',
        sources: ['PHB 192'],
        note: 'You can only take one bonus action per turn'
      },
      'reaction': {
        description: 'A reaction is an instant response to a trigger that occurs on your turn or someone else\'s',
        sources: ['PHB 192'],
        note: 'You can only take one reaction per round'
      },
      // Advantage/Disadvantage (PHB p.110)
      'advantage': {
        description: 'When an attack roll, ability check, or saving throw has advantage, roll the d20 twice and use the higher result',
        sources: ['PHB 110'],
        stacks: false
      },
      'disadvantage': {
        description: 'When an attack roll, ability check, or saving throw has disadvantage, roll the d20 twice and use the lower result',
        sources: ['PHB 110'],
        stacks: false
      },
      // Inspiration (PHB p.125)
      'inspiration': {
        description: 'A player can spend inspiration to add a d20 to an ability check, attack roll, or saving throw',
        sources: ['PHB 125'],
        duration: 'expires at end of session if unused',
        limit: 'one per player'
      },
      // Sneak Attack (PHB p.96-97)
      'sneak_attack': {
        description: 'Once per turn, you can deal an extra 1d6 damage to one creature you hit with a weapon attack if you have advantage on the attack roll, or if the target is within 5 feet of an ally who isn\'t incapacitated',
        sources: ['PHB 96'],
        class: 'Rogue',
        scaling: 'increases by 1d6 at higher levels',
        requirements: [
          'finesse or ranged weapon',
          'advantage on attack OR adjacent ally',
          'once per turn'
        ]
      },
      // Cunning Action (PHB p.96)
      'cunning_action': {
        description: 'On each of your turns in combat, you can use a bonus action to take the Dash, Disengage, or Hide action',
        sources: ['PHB 96'],
        class: 'Rogue',
        level: 2
      },
      // Short Rest (PHB p.186)
      'short_rest': {
        description: 'A short rest is a period of downtime, at least 1 hour long, during which a character does nothing more strenuous than eating, drinking, reading, and tending to wounds',
        sources: ['PHB 186'],
        hitDiceRecovery: 'You can spend hit dice to regain HP',
        spellSlotRecovery: 'Warlocks recover spell slots'
      },
      // Long Rest (PHB p.186)
      'long_rest': {
        description: 'A long rest is a period of extended downtime, at least 8 hours long, during which a character sleeps or performs light activity',
        sources: ['PHB 186'],
        recovers: [
          'All hit points',
          'All hit dice (up to max)',
          'Ability score reduction',
          'Spell slots',
          'Limited-use abilities'
        ]
      },
      // Concentration (PHB p.203)
      'concentration': {
        description: 'Some spells require you to maintain concentration to keep their magic active',
        sources: ['PHB 203'],
        breaks: [
          'Cast another spell requiring concentration',
          'Take damage (DC 10 or half damage)',
          'Incapacitated',
          'Death'
        ]
      }
    };
  }

  lookup(ruleName) {
    const rule = this.rules[ruleName.toLowerCase().replace(/\s+/g, '_')];
    return rule || { error: `Rule "${ruleName}" not found in database` };
  }

  listRules() {
    return Object.keys(this.rules);
  }
}

/**
 * Character Database - searchable character abilities & details
 */
class CharacterDatabase {
  constructor(campaignName) {
    this.campaign = campaignName;
    this.characters = new Map();
    this.loadCharacters();
  }

  loadCharacters() {
    const charsDir = path.join(__dirname, 'characters');
    if (!fs.existsSync(charsDir)) return;

    const files = fs.readdirSync(charsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(charsDir, file), 'utf8'));
          const charName = data.name || file.replace('.json', '');
          this.characters.set(charName.toLowerCase(), data);
        } catch (e) {
          // Silent fail for malformed files
        }
      }
    });
  }

  getCharacter(name) {
    return this.characters.get(name.toLowerCase()) || null;
  }

  getAbility(charName, abilityName) {
    const char = this.getCharacter(charName);
    if (!char) return { error: `Character "${charName}" not found` };

    const ability = char.abilities?.[abilityName.toLowerCase()];
    if (!ability) return { error: `Ability "${abilityName}" not found for ${charName}` };

    return {
      name: abilityName,
      character: charName,
      ...ability
    };
  }

  listCharacters() {
    return Array.from(this.characters.keys());
  }

  search(query) {
    const results = [];
    this.characters.forEach((char, name) => {
      if (name.includes(query.toLowerCase())) {
        results.push({ name, character: char });
      }
    });
    return results;
  }
}

/**
 * Session Event Timeline - what happened, when, by whom
 */
class EventTimeline {
  constructor(campaignName, sessionNum) {
    this.campaign = campaignName;
    this.sessionNum = sessionNum;
    this.events = [];
    this.roundNumber = 0;
    this.turnOrder = [];
  }

  /**
   * Log an event during gameplay
   */
  logEvent(category, description, details = {}) {
    const event = {
      id: this.events.length + 1,
      timestamp: new Date().toISOString(),
      round: this.roundNumber,
      category, // 'combat', 'roleplay', 'exploration', 'discovery', 'death', 'milestone'
      description,
      details
    };

    this.events.push(event);
    return event;
  }

  setRound(roundNum) {
    this.roundNumber = roundNum;
  }

  setTurnOrder(order) {
    this.turnOrder = order;
  }

  /**
   * Get all events from this session
   */
  getTimeline() {
    return this.events;
  }

  /**
   * Search events by category
   */
  getEventsByCategory(category) {
    return this.events.filter(e => e.category === category);
  }

  /**
   * Get last N events (quick recap)
   */
  getRecentEvents(count = 5) {
    return this.events.slice(-count);
  }

  /**
   * Find events involving a character
   */
  getCharacterEvents(charName) {
    return this.events.filter(e => 
      e.details.character === charName || 
      e.description.includes(charName)
    );
  }
}

/**
 * Decision Audit Trail - what the DM changed, why, and what the impact was
 */
class DecisionTrail {
  constructor() {
    this.decisions = [];
  }

  /**
   * Record a major decision
   */
  record(decision, reasoning, ruleReference = null, impact = {}) {
    const entry = {
      id: this.decisions.length + 1,
      timestamp: new Date().toISOString(),
      decision,
      reasoning,
      ruleReference, // e.g., "PHB p. 96" or "House Rule"
      impact, // { appliedTo: character, rolls: [12, 15], finalResult: 15 }
      precedent: this.findPrecedent(decision)
    };

    this.decisions.push(entry);
    return entry;
  }

  /**
   * Find if we've made a similar decision before
   */
  findPrecedent(decision) {
    return this.decisions.find(d => 
      d.decision.toLowerCase().includes(decision.toLowerCase().substring(0, 20))
    ) || null;
  }

  /**
   * Audit trail for consistency
   */
  getTrail() {
    return this.decisions;
  }

  /**
   * Check consistency on a decision
   */
  checkConsistency(newDecision) {
    const similar = this.decisions.filter(d =>
      d.decision.toLowerCase().includes(newDecision.toLowerCase().substring(0, 15))
    );

    if (similar.length > 0) {
      return {
        consistent: true,
        previousDecisions: similar,
        message: `You've ruled on similar situations ${similar.length} time(s) before. Check consistency.`
      };
    }

    return { consistent: false };
  }
}

/**
 * NPC & Monster Database - relationships, stats, interactions
 */
class NPCDatabase {
  constructor(campaignName) {
    this.campaign = campaignName;
    this.npcs = new Map();
    this.relationships = [];
    this.loadNPCs();
  }

  loadNPCs() {
    // Load from campaign NPC files
    const npcDir = path.join(__dirname, 'campaigns', this.campaign, 'npcs');
    if (!fs.existsSync(npcDir)) return;

    const files = fs.readdirSync(npcDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(npcDir, file), 'utf8'));
          this.npcs.set(data.name?.toLowerCase(), data);
        } catch (e) {
          // Silent fail
        }
      }
    });
  }

  getNPC(name) {
    return this.npcs.get(name.toLowerCase()) || null;
  }

  addNPC(name, data) {
    this.npcs.set(name.toLowerCase(), {
      name,
      firstMet: new Date().toISOString(),
      ...data
    });
  }

  recordInteraction(npcName, description, details = {}) {
    const npc = this.getNPC(npcName);
    if (!npc) return { error: `NPC "${npcName}" not found` };

    if (!npc.interactions) npc.interactions = [];
    npc.interactions.push({
      timestamp: new Date().toISOString(),
      description,
      ...details
    });

    return npc;
  }

  listNPCs() {
    return Array.from(this.npcs.keys());
  }

  /**
   * Quick NPC reference during gameplay
   */
  quickRef(npcName) {
    const npc = this.getNPC(npcName);
    if (!npc) return null;

    return {
      name: npc.name,
      role: npc.role || 'Unknown',
      disposition: npc.disposition || 'Neutral',
      lastSeen: npc.interactions?.length > 0 
        ? npc.interactions[npc.interactions.length - 1].timestamp 
        : npc.firstMet,
      recentInteractions: npc.interactions?.slice(-3) || []
    };
  }
}

/**
 * Main DM Memory System
 */
class DMMemory {
  constructor(campaignName, sessionNumber) {
    this.campaign = campaignName;
    this.session = sessionNumber;
    this.startedAt = new Date().toISOString();
    
    // Initialize all subsystems
    this.rules = new RuleDatabase();
    this.characters = new CharacterDatabase(campaignName);
    this.timeline = new EventTimeline(campaignName, sessionNumber);
    this.decisions = new DecisionTrail();
    this.npcs = new NPCDatabase(campaignName);
    
    // Session state
    this.state = {
      location: null,
      activeEncounter: null,
      partyStatus: {},
      resourcesTracked: {}
    };
  }

  /**
   * GAMEPLAY LOGGING
   */
  
  logCombatRound(roundNum, turnOrder) {
    this.timeline.setRound(roundNum);
    this.timeline.setTurnOrder(turnOrder);
    this.timeline.logEvent('combat', `Round ${roundNum} started`, { 
      turnOrder,
      timestamp: new Date().toISOString()
    });
  }

  logAction(character, action, details = {}) {
    return this.timeline.logEvent('combat', `${character} ${action}`, {
      character,
      ...details
    });
  }

  logNarrativeEvent(description, details = {}) {
    return this.timeline.logEvent('roleplay', description, details);
  }

  logDiscovery(description, details = {}) {
    return this.timeline.logEvent('discovery', description, details);
  }

  /**
   * RULE LOOKUPS
   */

  lookupRule(ruleName) {
    return this.rules.lookup(ruleName);
  }

  listAvailableRules() {
    return this.rules.listRules();
  }

  /**
   * CHARACTER QUERIES
   */

  getCharacter(name) {
    return this.characters.getCharacter(name);
  }

  getCharacterAbility(charName, abilityName) {
    return this.characters.getAbility(charName, abilityName);
  }

  searchCharacters(query) {
    return this.characters.search(query);
  }

  /**
   * DECISION RECORDING (Rule consistency tracker)
   */

  recordRuling(decision, reasoning, ruleReference = null, impact = {}) {
    // Check consistency first
    const consistency = this.decisions.checkConsistency(decision);
    
    const entry = this.decisions.record(decision, reasoning, ruleReference, impact);
    
    return {
      recorded: entry,
      consistency: consistency
    };
  }

  auditTrail() {
    return this.decisions.getTrail();
  }

  /**
   * NPC QUERIES
   */

  getNPC(name) {
    return this.npcs.getNPC(name);
  }

  getNPCQuickRef(name) {
    return this.npcs.quickRef(name);
  }

  recordNPCInteraction(npcName, description, details = {}) {
    return this.npcs.recordInteraction(npcName, description, details);
  }

  /**
   * SESSION STATE
   */

  setLocation(location) {
    this.state.location = location;
    this.timeline.logEvent('exploration', `Party moved to ${location}`, { location });
  }

  setEncounter(encounterName, details = {}) {
    this.state.activeEncounter = encounterName;
    this.timeline.logEvent('combat', `Encounter started: ${encounterName}`, { 
      encounter: encounterName,
      ...details
    });
  }

  updateCharacterStatus(charName, status) {
    this.state.partyStatus[charName] = status;
  }

  /**
   * QUICK SESSION RECAP
   */

  getSessionSummary() {
    return {
      campaign: this.campaign,
      session: this.session,
      startedAt: this.startedAt,
      duration: new Date() - new Date(this.startedAt),
      location: this.state.location,
      activeEncounter: this.state.activeEncounter,
      eventCount: this.timeline.events.length,
      decisionsLogged: this.decisions.decisions.length,
      recentEvents: this.timeline.getRecentEvents(5),
      partyStatus: this.state.partyStatus
    };
  }

  /**
   * SAVE SESSION STATE
   */

  saveSession() {
    const sessionDir = path.join(__dirname, 'campaigns', this.campaign, 'sessions');
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const sessionFile = path.join(sessionDir, `session-${this.session}-memory.json`);
    
    const sessionData = {
      campaign: this.campaign,
      sessionNumber: this.session,
      startedAt: this.startedAt,
      endedAt: new Date().toISOString(),
      summary: this.getSessionSummary(),
      timeline: this.timeline.getTimeline(),
      decisions: this.decisions.getTrail(),
      state: this.state
    };

    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    return sessionFile;
  }
}

export { DMMemory, RuleDatabase, CharacterDatabase, EventTimeline, DecisionTrail, NPCDatabase };
