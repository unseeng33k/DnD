#!/usr/bin/env node

/**
 * DM MEMORY SYSTEM - Session State & Event Logging
 * 
 * Tracks everything that happens during a session:
 * - Timeline of events (exploration, combat, roleplay, discovery)
 * - NPC interactions and relationship changes
 * - World state modifications
 * - Decisions and rulings
 * - Combat state
 * 
 * Usage:
 *   const memory = new DMMemory('Curse of Strahd', 1);
 *   memory.logEvent('combat', 'Party fights goblins', { enemies: 3 });
 *   const saved = memory.saveSession();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Timeline - Event logging structure
 */
class Timeline {
  constructor() {
    this.events = [];
    this.eventIndex = 0;
  }

  addEvent(type, description, metadata = {}) {
    const event = {
      id: this.eventIndex++,
      type,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      round: null
    };

    this.events.push(event);
    return event;
  }

  getRecentEvents(count = 5) {
    return this.events.slice(-count);
  }

  getEventsByType(type) {
    return this.events.filter(e => e.type === type);
  }

  export() {
    return {
      totalEvents: this.events.length,
      events: this.events,
      byType: {
        exploration: this.getEventsByType('exploration').length,
        combat: this.getEventsByType('combat').length,
        roleplay: this.getEventsByType('roleplay').length,
        discovery: this.getEventsByType('discovery').length
      }
    };
  }
}

/**
 * Decisions - Rulings and decisions made during session
 */
class Decisions {
  constructor() {
    this.decisions = [];
    this.auditTrail = [];
  }

  recordRuling(decision, reasoning, ruleReference = null) {
    const ruling = {
      id: this.decisions.length + 1,
      decision,
      reasoning,
      ruleReference,
      timestamp: new Date().toISOString(),
      precedent: this.findSimilar(decision)
    };

    this.decisions.push(ruling);
    this.auditTrail.push({
      decision,
      timestamp: ruling.timestamp,
      similar: ruling.precedent.length
    });

    return ruling;
  }

  findSimilar(decision) {
    const keyword = decision.toLowerCase().substring(0, 20);
    return this.decisions.filter(d =>
      d.decision.toLowerCase().includes(keyword)
    );
  }

  export() {
    return {
      totalDecisions: this.decisions.length,
      decisions: this.decisions,
      auditTrail: this.auditTrail
    };
  }
}

/**
 * NPC Interactions - Track NPC relationship changes
 */
class NPCInteractions {
  constructor() {
    this.interactions = [];
    this.relationships = new Map();
  }

  recordInteraction(npcName, action, details = {}) {
    const interaction = {
      npcName,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    this.interactions.push(interaction);

    // Update relationship score
    const current = this.relationships.get(npcName) || 0;
    let change = 0;

    if (action.toLowerCase().includes('help')) change = 1;
    if (action.toLowerCase().includes('betray')) change = -2;
    if (action.toLowerCase().includes('insult')) change = -1;
    if (action.toLowerCase().includes('gift')) change = 1;
    if (action.toLowerCase().includes('agree')) change = 0.5;

    if (change !== 0) {
      this.relationships.set(npcName, current + change);
    }

    return interaction;
  }

  getRelationshipScore(npcName) {
    return this.relationships.get(npcName) || 0;
  }

  export() {
    return {
      totalInteractions: this.interactions.length,
      interactions: this.interactions,
      relationships: Array.from(this.relationships.entries())
    };
  }
}

/**
 * MAIN DM MEMORY CLASS
 */
export class DMMemory {
  constructor(campaignName, sessionNumber) {
    this.campaignName = campaignName;
    this.sessionNumber = sessionNumber;
    this.startTime = new Date().toISOString();

    // Core systems
    this.timeline = new Timeline();
    this.decisions = new Decisions();
    this.npc = new NPCInteractions();

    // State tracking
    this.location = null;
    this.currentEncounter = null;
    this.worldState = new Map();
    this.rules = new Map();
    this.sessionState = {
      partyStatus: {},
      threatLevel: 'normal',
      pacing: 'normal'
    };
  }

  /**
   * LOG EVENT - Main event tracking
   */
  logEvent(type, description, metadata = {}) {
    return this.timeline.addEvent(type, description, metadata);
  }

  /**
   * LOG NARRATIVE EVENT - Descriptive text without game mechanics
   */
  logNarrativeEvent(text, metadata = {}) {
    return this.timeline.addEvent('narrative', text, metadata);
  }

  /**
   * RECORD NPC INTERACTION
   */
  recordNPCInteraction(npcName, action, details = {}) {
    return this.npc.recordInteraction(npcName, action, details);
  }

  /**
   * RECORD RULING - Decision with reasoning
   */
  recordRuling(decision, reasoning, ruleRef = null) {
    return this.decisions.recordRuling(decision, reasoning, ruleRef);
  }

  /**
   * SET LOCATION
   */
  setLocation(locationName) {
    this.location = locationName;
    this.timeline.addEvent('location', `Entered ${locationName}`, {
      location: locationName
    });
  }

  /**
   * SET ENCOUNTER
   */
  setEncounter(encounterName, details = {}) {
    this.currentEncounter = {
      name: encounterName,
      startTime: new Date().toISOString(),
      ...details
    };
    this.timeline.addEvent('encounter', `Started encounter: ${encounterName}`, details);
  }

  /**
   * LOG COMBAT ROUND
   */
  logCombatRound(roundNumber, turnOrder) {
    const round = this.timeline.addEvent('combat', `Round ${roundNumber} started`, {
      round: roundNumber,
      turnOrder
    });
    round.round = roundNumber;
    return round;
  }

  /**
   * LOG ACTION - Combat or narrative action
   */
  logAction(actor, action, details = {}) {
    return this.timeline.addEvent('action', `${actor}: ${action}`, {
      actor,
      action,
      ...details
    });
  }

  /**
   * UPDATE WORLD STATE
   */
  setWorldState(key, value, description = '') {
    const previous = this.worldState.get(key);
    this.worldState.set(key, value);

    this.timeline.addEvent('discovery', `World state: ${key}`, {
      key,
      previous,
      new: value,
      description
    });

    return { key, previous, new: value };
  }

  /**
   * LOOKUP RULE
   */
  lookupRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return { error: `Rule ${ruleId} not found` };
    }
    return rule;
  }

  /**
   * AUDIT TRAIL - Get decision history
   */
  auditTrail() {
    return this.decisions.auditTrail;
  }

  /**
   * GET RECENT EVENTS
   */
  getRecentEvents(count = 5) {
    return this.timeline.getRecentEvents(count);
  }

  /**
   * EXPORT SESSION STATE
   */
  exportState() {
    return {
      campaign: this.campaignName,
      session: this.sessionNumber,
      startTime: this.startTime,
      endTime: new Date().toISOString(),
      location: this.location,
      currentEncounter: this.currentEncounter,
      timeline: this.timeline.export(),
      decisions: this.decisions.export(),
      npcInteractions: this.npc.export(),
      worldState: Array.from(this.worldState.entries()),
      sessionState: this.sessionState
    };
  }

  /**
   * SAVE SESSION - Write to file
   */
  saveSession() {
    const campaignDir = path.join(__dirname, 'campaigns', this.campaignName);
    const sessionsDir = path.join(campaignDir, 'sessions');

    // Ensure directories exist
    if (!fs.existsSync(campaignDir)) {
      fs.mkdirSync(campaignDir, { recursive: true });
    }
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    // Create filename
    const filename = `session_${String(this.sessionNumber).padStart(3, '0')}-memory.json`;
    const filepath = path.join(sessionsDir, filename);

    // Export and save
    const sessionData = this.exportState();
    fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2), 'utf8');

    return filepath;
  }

  /**
   * LOAD SESSION - Read from file
   */
  static loadSession(campaignName, sessionNumber) {
    const campaignDir = path.join(__dirname, 'campaigns', campaignName);
    const sessionsDir = path.join(campaignDir, 'sessions');
    const filename = `session_${String(sessionNumber).padStart(3, '0')}-memory.json`;
    const filepath = path.join(sessionsDir, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return data;
  }
}

export default DMMemory;
