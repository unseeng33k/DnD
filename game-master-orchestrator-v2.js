#!/usr/bin/env node

/**
 * GAME MASTER ORCHESTRATOR V2 - MODULE-AWARE
 * 
 * Now integrates with AdventureModule system for full campaign support.
 * 
 * Usage:
 *   const gm = new GameMasterOrchestrator('curse-of-strahd');
 *   await gm.loadModule();
 *   await gm.startSession(1);
 *   await gm.loadScene('castle-ravenloft');
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DMMemory } from './dm-memory-system.js';
import { SessionAmbiance } from './session-ambiance-orchestrator.js';
import { AdventureModule, ModuleRegistry } from './adventure-module-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resource Tracker - Spell slots, hit dice, conditions, inspiration
 */
class ResourceTracker {
  constructor() {
    this.characters = new Map();
  }

  registerCharacter(name, characterData) {
    const resources = {
      name,
      spellSlots: characterData.spellSlots || {},
      hitDice: characterData.hitDice || {},
      inspiration: characterData.inspiration || false,
      conditions: [],
      temporaryHP: 0,
      deathSaves: { successes: 0, failures: 0 }
    };

    this.characters.set(name, resources);
    return resources;
  }

  castSpell(charName, spellLevel, spellClass = 'wizard') {
    const char = this.characters.get(charName);
    if (!char) return { error: `Character ${charName} not found` };

    const slots = char.spellSlots[spellClass] || {};
    const available = slots[`level_${spellLevel}`] || 0;

    if (available <= 0) {
      return { error: `No ${spellClass} level ${spellLevel} slots available` };
    }

    slots[`level_${spellLevel}`] = available - 1;
    return { success: true, slotsRemaining: available - 1 };
  }

  useHitDie(charName, dieSize = 'd8') {
    const char = this.characters.get(charName);
    if (!char) return { error: `Character ${charName} not found` };

    const dice = char.hitDice[dieSize] || 0;
    if (dice <= 0) {
      return { error: `No ${dieSize} hit dice remaining` };
    }

    const roll = Math.floor(Math.random() * parseInt(dieSize.substring(1))) + 1;
    char.hitDice[dieSize] = dice - 1;

    return { success: true, diceRemaining: dice - 1, healed: roll };
  }

  addCondition(charName, condition, durationRounds = null) {
    const char = this.characters.get(charName);
    if (!char) return { error: `Character ${charName} not found` };

    char.conditions.push({
      name: condition,
      appliedAt: new Date().toISOString(),
      duration: durationRounds
    });

    return { success: true };
  }

  removeCondition(charName, condition) {
    const char = this.characters.get(charName);
    if (!char) return { error: `Character ${charName} not found` };

    const index = char.conditions.findIndex(c => c.name === condition);
    if (index === -1) return { error: `Condition not found` };

    char.conditions.splice(index, 1);
    return { success: true };
  }

  getCharacterResources(charName) {
    return this.characters.get(charName) || null;
  }

  getAllResources() {
    return Array.from(this.characters.values());
  }
}

/**
 * Combat Engine - Automated combat with logging
 */
class IntegratedCombatEngine {
  constructor(memory, resources) {
    this.memory = memory;
    this.resources = resources;
    this.inCombat = false;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants = new Map();
  }

  beginEncounter(encounterName, enemies, partyMembers) {
    this.inCombat = true;
    this.currentRound = 0;
    this.turnOrder = [];
    this.combatants.clear();

    partyMembers.forEach(name => {
      this.combatants.set(name, { name, type: 'party', hp: 0, ac: 10 });
      this.turnOrder.push(name);
    });

    enemies.forEach(enemy => {
      const enemyName = typeof enemy === 'string' ? enemy : enemy.name;
      const hp = typeof enemy === 'string' ? 10 : (enemy.hp || 10);
      const ac = typeof enemy === 'string' ? 10 : (enemy.ac || 10);

      this.combatants.set(enemyName, { name: enemyName, type: 'enemy', hp, ac });
      this.turnOrder.push(enemyName);
    });

    this.turnOrder.sort(() => Math.random() - 0.5);

    this.memory.setEncounter(encounterName, {
      participants: Array.from(this.combatants.keys()),
      initialTurnOrder: this.turnOrder,
      startTime: new Date().toISOString()
    });

    return {
      encounter: encounterName,
      participants: Array.from(this.combatants.keys()),
      turnOrder: this.turnOrder
    };
  }

  nextRound() {
    if (!this.inCombat) return { error: 'No combat in progress' };

    this.currentRound++;
    this.memory.logCombatRound(this.currentRound, this.turnOrder);

    return {
      round: this.currentRound,
      firstTurnOrder: this.turnOrder[0]
    };
  }

  rollAttack(attacker, target, bonuses = {}) {
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const totalRoll = attackRoll + (bonuses.attackBonus || 0);

    const targetData = this.combatants.get(target);
    const ac = targetData?.ac || 10;

    const hit = totalRoll >= ac;

    this.memory.logAction(attacker, `attacks ${target}`, {
      roll: attackRoll,
      total: totalRoll,
      targetAC: ac,
      result: hit ? 'hit' : 'miss'
    });

    return {
      roll: attackRoll,
      total: totalRoll,
      ac,
      hit
    };
  }

  damageTarget(target, amount, damageType = 'physical', source = 'attack') {
    const targetData = this.combatants.get(target);
    if (!targetData) return { error: `Target ${target} not found` };

    targetData.hp -= amount;

    this.memory.logEvent('combat', `${target} takes ${amount} ${damageType} damage`, {
      target,
      damage: amount,
      type: damageType,
      source,
      hpRemaining: Math.max(0, targetData.hp)
    });

    const status = targetData.hp <= 0 ? 'unconscious' : 'alive';
    return {
      target,
      damage: amount,
      hpRemaining: Math.max(0, targetData.hp),
      status
    };
  }

  endCombat(result = 'victory', rewards = {}) {
    this.inCombat = false;

    this.memory.logEvent('combat', `Combat ended - ${result}`, {
      finalRound: this.currentRound,
      result,
      rewards
    });

    return {
      roundsTotal: this.currentRound,
      result,
      xp: rewards.xp || 0,
      gold: rewards.gold || 0
    };
  }

  getCombatStatus() {
    return {
      inCombat: this.inCombat,
      round: this.currentRound,
      turnOrder: this.turnOrder,
      combatants: Array.from(this.combatants.values())
    };
  }
}

/**
 * Consequence Engine - Decisions create lasting effects
 */
class ConsequenceEngine {
  constructor(memory) {
    this.memory = memory;
    this.promises = [];
    this.factionReputation = new Map();
    this.worldState = new Map();
    this.consequences = [];
  }

  recordPromise(promisee, promiseText, condition = 'always') {
    const promise = {
      id: this.promises.length + 1,
      madeAt: new Date().toISOString(),
      promisee,
      promiseText,
      condition,
      status: 'pending',
      consequences: []
    };

    this.promises.push(promise);

    this.memory.logEvent('roleplay', `Promise made to ${promisee}`, {
      promisee,
      promise: promiseText,
      condition
    });

    return promise;
  }

  updateFactionReputation(faction, change, reason = '') {
    const current = this.factionReputation.get(faction) || 0;
    const newRep = current + change;

    this.factionReputation.set(faction, newRep);

    this.memory.logEvent('discovery', `${faction} reputation changed by ${change}`, {
      faction,
      previousRep: current,
      newRep,
      reason
    });

    return { faction, previousRep: current, newRep };
  }

  setWorldState(key, value, description = '') {
    const previous = this.worldState.get(key);
    this.worldState.set(key, value);

    this.memory.logEvent('discovery', `World state changed: ${key}`, {
      key,
      previous,
      new: value,
      description
    });

    return { key, previous, new: value };
  }

  checkConsequences(situation) {
    const triggered = [];

    this.promises.forEach(p => {
      if (p.status === 'pending' && situation.includes(p.promisee)) {
        triggered.push({
          type: 'broken_promise',
          promisee: p.promisee,
          promise: p.promiseText,
          consequence: `${p.promisee} discovers broken promise!`
        });
      }
    });

    return triggered;
  }

  getAllConsequences() {
    return {
      promises: this.promises,
      factions: Array.from(this.factionReputation.entries()),
      worldState: Array.from(this.worldState.entries())
    };
  }
}

/**
 * Decision Assistant - Proactive rule guidance
 */
class DecisionAssistant {
  constructor(memory) {
    this.memory = memory;
  }

  assessDecision(decision, context = {}) {
    const suggestions = [];
    const warnings = [];
    const ruleReferences = [];

    const trail = this.memory.auditTrail();
    const similar = trail.filter(d =>
      d.decision.toLowerCase().includes(decision.toLowerCase().substring(0, 20))
    );

    if (similar.length > 0) {
      suggestions.push({
        type: 'consistency',
        message: `You've made similar rulings ${similar.length} time(s). Check consistency:`,
        previous: similar
      });
    }

    const ruleKeywords = {
      'sneak attack': 'sneak_attack',
      'bonus action': 'bonus_action',
      'concentration': 'concentration',
      'inspiration': 'inspiration',
      'advantage': 'advantage',
      'disadvantage': 'disadvantage'
    };

    Object.entries(ruleKeywords).forEach(([keyword, rule]) => {
      if (decision.toLowerCase().includes(keyword)) {
        const ruleData = this.memory.lookupRule(rule);
        if (ruleData && !ruleData.error) {
          ruleReferences.push(ruleData);
        }
      }
    });

    return {
      decision,
      suggestions,
      warnings,
      relevantRules: ruleReferences,
      shouldAsk: similar.length > 0 || warnings.length > 0
    };
  }
}

/**
 * Campaign Manager - Session persistence
 */
class CampaignManager {
  constructor(campaignName) {
    this.campaign = campaignName;
    this.campaignDir = path.join(__dirname, 'campaigns', campaignName);
    this.sessionsDir = path.join(this.campaignDir, 'sessions');
    this.initializeCampaign();
  }

  initializeCampaign() {
    [this.campaignDir, this.sessionsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getSessions() {
    const sessions = [];
    const files = fs.readdirSync(this.sessionsDir);

    files.forEach(file => {
      if (file.endsWith('-memory.json')) {
        try {
          const data = JSON.parse(
            fs.readFileSync(path.join(this.sessionsDir, file), 'utf8')
          );
          sessions.push(data);
        } catch (e) {
          // Silent fail
        }
      }
    });

    return sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
  }

  getLatestSession() {
    const sessions = this.getSessions();
    return sessions.length > 0 ? sessions[sessions.length - 1] : null;
  }

  loadSessionContext(sessionNum) {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.sessionNumber === sessionNum);
    return session || null;
  }

  getCampaignState() {
    const sessions = this.getSessions();
    return {
      campaign: this.campaign,
      totalSessions: sessions.length,
      lastSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
      allSessions: sessions
    };
  }
}

/**
 * MAIN ORCHESTRATOR V2 - MODULE-AWARE
 */
class GameMasterOrchestrator {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.module = null;
    this.memory = null;
    this.ambiance = null;
    this.resources = new ResourceTracker();
    this.combat = null;
    this.consequences = null;
    this.decisions = null;
    this.campaign_manager = null;
    this.sessionNumber = 1;
    this.activeParty = [];
    this.loadedLocations = new Map();
  }

  /**
   * LOAD MODULE - Initialize entire module with all content
   */
  async loadModule() {
    try {
      const registry = new ModuleRegistry();
      this.module = registry.load(this.moduleId);
      
      const info = this.module.getInfo();
      
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║ MODULE LOADED: ${info.name.substring(0, 36).padEnd(36)} ║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      
      console.log(`📖 ${info.description}`);
      console.log(`⚔️  Recommended Levels: ${info.level[0]}-${info.level[1]}`);
      console.log(`⏱️  Duration: ${info.length}`);
      console.log(`🗺️  Locations: ${info.locations}`);
      console.log(`👹 Encounters: ${info.encounters}`);
      console.log(`🎭 NPCs: ${info.npcs}\n`);
      
      return info;
    } catch (error) {
      console.error(`❌ Failed to load module: ${error.message}`);
      throw error;
    }
  }

  /**
   * START SESSION - Load module party + context
   */
  async startSession(sessionNum, telegramChatId = null) {
    if (!this.module) {
      throw new Error('Module not loaded. Call loadModule() first.');
    }

    this.sessionNumber = sessionNum;

    // Get party from module template
    try {
      this.activeParty = this.module.getParty();
    } catch (e) {
      console.warn('No party template in module, using defaults');
      this.activeParty = [];
    }

    // Initialize memory with campaign name
    const campaignName = this.module.metadata.name;
    this.memory = new DMMemory(campaignName, sessionNum);
    this.campaign_manager = new CampaignManager(campaignName);

    // Initialize combat engine
    this.combat = new IntegratedCombatEngine(this.memory, this.resources);
    this.consequences = new ConsequenceEngine(this.memory);
    this.decisions = new DecisionAssistant(this.memory);

    // Initialize ambiance
    this.ambiance = new SessionAmbiance(campaignName, telegramChatId);

    // Load previous session context if available
    const prevSession = this.campaign_manager.loadSessionContext(sessionNum - 1);
    if (prevSession) {
      console.log(`\n📚 Previous session summary:`);
      console.log(`   Last location: ${prevSession.state?.location || 'Unknown'}`);
      console.log(`   Party status: ${JSON.stringify(prevSession.summary?.partyStatus || {})}`);
    }

    // Register all party members with resources
    this.activeParty.forEach(member => {
      this.resources.registerCharacter(member.name, member);
    });

    this.memory.logEvent('exploration', `Session ${sessionNum} started`, {
      partySize: this.activeParty.length,
      characters: this.activeParty.map(m => m.name),
      module: this.module.metadata.name
    });

    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║ SESSION ${String(sessionNum).padEnd(32)} ║`);
    console.log(`╚════════════════════════════════════════╝\n`);

    console.log(`✅ Systems initialized:`);
    console.log(`   • Party: ${this.activeParty.map(p => p.name).join(', ')}`);
    console.log(`   • Memory System: READY`);
    console.log(`   • Combat Engine: READY`);
    console.log(`   • Resource Tracking: READY`);
    console.log(`   • Ambiance System: READY`);
    console.log(`   • Consequence Engine: READY`);
    console.log(`   • Campaign Context: LOADED\n`);

    return { session: sessionNum, party: this.activeParty.length };
  }

  /**
   * LOAD SCENE - From module definition
   */
  async loadScene(locationId, description = '') {
    if (!this.module) {
      throw new Error('Module not loaded');
    }

    const location = this.module.getLocation(locationId);
    if (!location) {
      console.warn(`⚠️  Location "${locationId}" not found in module`);
      return null;
    }

    // Load image + ambiance
    const sceneResult = await this.ambiance.startScene(location.name, location.atmosphere);

    // Log in memory
    this.memory.setLocation(location.name);
    this.loadedLocations.set(locationId, location);

    // Log NPCs present at this location
    const npcsHere = this.module.getNPCsForLocation(locationId);
    if (npcsHere.length > 0) {
      this.memory.logNarrativeEvent(`NPCs present: ${npcsHere.map(n => n.name).join(', ')}`, {
        location: location.name,
        npcs: npcsHere.map(n => ({ name: n.name, role: n.role }))
      });
    }

    // Log encounters available at this location
    const encountersHere = this.module.getEncountersForLocation(locationId);
    if (encountersHere.length > 0) {
      this.memory.logEvent('exploration', `Available encounters at ${location.name}`, {
        encounters: encountersHere.map(e => ({ name: e.name, difficulty: e.difficulty }))
      });
    }

    if (description) {
      this.memory.logNarrativeEvent(description, { location: location.name });
    }

    console.log(`\n📍 ${location.name}`);
    console.log(`${location.atmosphere}\n`);

    if (npcsHere.length > 0) {
      console.log(`🎭 NPCs here: ${npcsHere.map(n => n.name).join(', ')}`);
    }

    if (encountersHere.length > 0) {
      console.log(`⚔️  Possible encounters: ${encountersHere.map(e => e.name).join(', ')}`);
    }

    if (location.music) {
      console.log(`🎵 Music: ${location.music}`);
    }

    console.log();

    return {
      location: location.name,
      locationId,
      npcs: npcsHere,
      encounters: encountersHere,
      atmosphere: location.atmosphere,
      music: location.music,
      imageFile: sceneResult.imageFile,
      sensorySummary: sceneResult.sensorySummary
    };
  }

  /**
   * START ENCOUNTER - From module definition
   */
  async startEncounter(encounterId) {
    if (!this.module) {
      throw new Error('Module not loaded');
    }

    const encounter = this.module.getEncounter(encounterId);
    if (!encounter) {
      console.warn(`⚠️  Encounter "${encounterId}" not found in module`);
      return null;
    }

    const partyNames = this.activeParty.map(p => p.name);
    const result = this.combat.beginEncounter(encounter.name, encounter.enemies, partyNames);

    console.log(`\n⚔️  ${encounter.name}`);
    console.log(`📊 Difficulty: ${encounter.difficulty}`);
    console.log(`🎯 Objectives: ${encounter.objectives.join(', ')}`);

    if (encounter.special) {
      console.log(`⭐ Special: ${encounter.special}`);
    }

    console.log(`\nTurn order: ${result.turnOrder.join(' → ')}\n`);

    return {
      encounter: encounter.name,
      difficulty: encounter.difficulty,
      enemies: encounter.enemies,
      objectives: encounter.objectives,
      turnOrder: result.turnOrder,
      rewards: encounter.rewards
    };
  }

  /**
   * GET NPC FROM MODULE
   */
  getNPC(npcId) {
    if (!this.module) return null;
    return this.module.getNPC(npcId);
  }

  /**
   * INTERACT WITH NPC FROM MODULE
   */
  interactNPC(npcId, action, details = {}) {
    const npc = this.getNPC(npcId);
    if (!npc) {
      console.warn(`⚠️  NPC "${npcId}" not found in module`);
      return null;
    }

    this.memory.recordNPCInteraction(npc.name, action, {
      ...details,
      npcRole: npc.role,
      npcAlignment: npc.alignment
    });

    const triggered = this.consequences.checkConsequences(npc.name);
    if (triggered.length > 0) {
      console.log(`\n⚡ CONSEQUENCES TRIGGERED:`);
      triggered.forEach(c => console.log(`   ${c.consequence}`));
    }

    console.log(`\n🎭 ${npc.name} (${npc.role}): ${action}\n`);

    return {
      npc: npc.name,
      role: npc.role,
      action,
      consequencesTriggered: triggered
    };
  }

  /**
   * MAKE A DECISION - With proactive guidance
   */
  assessAndRecord(decision, reasoning, ruleRef = null) {
    const assessment = this.decisions.assessDecision(decision);

    if (assessment.suggestions.length > 0) {
      console.log(`\n💡 SUGGESTION:`);
      assessment.suggestions.forEach(s => {
        console.log(`   ${s.message}`);
        if (s.previous) {
          console.log(`   Previous: ${s.previous.map(p => p.decision).join(', ')}`);
        }
      });
    }

    if (assessment.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      assessment.warnings.forEach(w => console.log(`   ${w}`));
    }

    if (assessment.relevantRules.length > 0) {
      console.log(`\n📖 RELEVANT RULES:`);
      assessment.relevantRules.forEach(r => {
        console.log(`   ${r.sources?.join(', ') || 'Unknown source'}`);
        console.log(`   ${r.description}`);
      });
    }

    const recorded = this.memory.recordRuling(decision, reasoning, ruleRef);

    console.log(`\n✅ Decision recorded\n`);

    return {
      assessment,
      recorded
    };
  }

  /**
   * END SESSION - Auto-save everything
   */
  async endSession() {
    const savedFile = this.memory.saveSession();

    console.log(`\n${'═'.repeat(50)}`);
    console.log(`SESSION ${this.sessionNumber} COMPLETE`);
    console.log('═'.repeat(50));
    console.log(`Module: ${this.module.metadata.name}`);
    console.log(`Events logged: ${this.memory.timeline.events.length}`);
    console.log(`Decisions recorded: ${this.memory.decisions.decisions.length}`);
    console.log(`Consequences triggered: ${this.consequences.consequences.length}`);
    console.log(`\n💾 Saved to: ${savedFile}`);
    console.log(`${'═'.repeat(50)}\n`);

    return {
      session: this.sessionNumber,
      eventsLogged: this.memory.timeline.events.length,
      savedFile
    };
  }

  /**
   * GET STATUS - Quick overview
   */
  getStatus() {
    return {
      module: this.module?.metadata.name,
      session: this.sessionNumber,
      party: this.activeParty,
      partyResources: this.resources.getAllResources(),
      combatStatus: this.combat?.getCombatStatus(),
      consequences: this.consequences?.getAllConsequences(),
      loadedLocations: Array.from(this.loadedLocations.keys()),
      recentEvents: this.memory?.timeline.getRecentEvents(5)
    };
  }
}

export { GameMasterOrchestrator, ResourceTracker, IntegratedCombatEngine, ConsequenceEngine, DecisionAssistant, CampaignManager };
