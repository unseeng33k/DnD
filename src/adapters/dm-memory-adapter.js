/**
 * DM-MEMORY ADAPTER
 * 
 * Bridges old DMMemory system with new orchestrator API
 * 
 * OLD: DMMemory is standalone, events siloed
 * NEW: DMMemory listens to eventBus, integrates with registries
 */

import { DMMemory } from '../dm-memory-system.js';

class DMMemoryAdapter {
  constructor(campaignName, sessionNumber, eventBus, registries) {
    this.eventBus = eventBus;
    this.registries = registries;
    
    // Wrap the old DMMemory system
    this.memory = new DMMemory(campaignName, sessionNumber);
    
    // Connect it to the new architecture
    this.setupEventListeners();
    this.populateRegistries();
  }

  /**
   * STEP 1: Listen to all turn-pipeline events
   * When anything happens in the game, log it to DMMemory timeline
   */
  setupEventListeners() {
    // Combat events
    this.eventBus.on('turn:input-processed', (data) => {
      this.memory.logEvent('turn', `Input: ${data.input.action}`, data);
    });

    this.eventBus.on('turn:effects-applied', (data) => {
      this.memory.logEvent('turn', `Effects applied`, {
        count: data.effectCount,
        results: (data.results || []).map(r => r.name || 'effect')
      });
    });

    this.eventBus.on('turn:world-updated', (data) => {
      this.memory.logEvent('world', `State updated`, data.updates || {});
    });

    this.eventBus.on('turn:output', (data) => {
      this.memory.logEvent('narrative', data.output?.narrative || 'turn output', {});
    });

    // Combat-specific events
    this.eventBus.on('combat:initiative-rolled', (data) => {
      this.memory.logCombatRound(data.round, data.turnOrder);
    });

    this.eventBus.on('combat:damage', (data) => {
      this.memory.logAction(data.actor, `took ${data.damage} damage`, {
        damage: data.damage,
        newHP: data.newHP,
        maxHP: data.maxHP
      });
    });

    // NPC interaction events
    this.eventBus.on('npc:interaction', (data) => {
      this.memory.recordNPCInteraction(data.npcName, data.description, {
        disposition: data.disposition,
        outcome: data.outcome
      });
    });

    // Discovery events
    this.eventBus.on('world:discovery', (data) => {
      this.memory.logDiscovery(data.description, {
        location: data.location,
        significance: data.significance
      });
    });
  }

  /**
   * STEP 2: Populate registries from DMMemory at startup
   * This makes all rules queryable via the registry system
   */
  populateRegistries() {
    // Populate rule-registry from DMMemory.rules
    const ruleNames = this.memory.listAvailableRules();
    for (const ruleName of ruleNames) {
      const ruleData = this.memory.lookupRule(ruleName);
      if (this.registries && this.registries.ruleRegistry) {
        this.registries.ruleRegistry.register(ruleName, ruleData);
      }
    }
  }

  /**
   * STEP 3: Expose DMMemory query API
   * Turn-pipeline and other systems query through these methods
   */
  
  lookupRule(ruleName) {
    return this.memory.lookupRule(ruleName);
  }

  getCharacterAbility(charName, abilityName) {
    return this.memory.getCharacterAbility(charName, abilityName);
  }

  getNPCQuickRef(npcName) {
    return this.memory.getNPCQuickRef(npcName);
  }

  getTimeline(limit = 50) {
    return this.memory.timeline.getRecentEvents(limit);
  }

  getSessionSummary() {
    return this.memory.getSessionSummary();
  }

  /**
   * STEP 4: Record decisions through adapter
   * Decisions are logged AND emitted to eventBus
   */
  recordDecision(decision, reasoning, ruleRef, impact) {
    const entry = this.memory.recordRuling(decision, reasoning, ruleRef, impact);
    
    // Emit to eventBus so other systems can react
    this.eventBus.emit('dm:decision-recorded', {
      decision: entry.decision,
      reasoning: entry.reasoning,
      ruleRef: entry.ruleReference,
      consistency: entry.consistency
    });

    return entry;
  }

  /**
   * STEP 5: Save state at session end
   */
  saveSession() {
    const sessionFile = this.memory.saveSession();
    
    this.eventBus.emit('session:saved', {
      file: sessionFile,
      summary: this.memory.getSessionSummary()
    });

    return sessionFile;
  }
}

export { DMMemoryAdapter };
