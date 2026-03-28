#!/usr/bin/env node

/**
 * THE HEARTBEAT ENGINE
 * 
 * This is the CORE loop that makes D&D feel like D&D:
 * 
 * 1. Player expresses intent (natural language)
 * 2. System understands stakes
 * 3. System produces fair, interesting resolution
 * 4. System updates world coherently
 * 5. System sets up next decision point
 * 6. Repeat
 */

import { IntentParser } from './intent-parser.js';
import { StakesAndResolutionEngine } from './stakes-resolution-engine.js';
import { WorldStateUpdater } from './world-state-updater.js';
import { AsciiMapGenerator } from './ascii-map-generator.js';
import { ADnDRuleEngine } from './adnd-rule-engine.js';

class TheHeartbeatEngine {
  constructor() {
    this.intentParser = new IntentParser();
    this.stakesEngine = new StakesAndResolutionEngine();
    this.worldUpdater = new WorldStateUpdater();
    this.mapGenerator = new AsciiMapGenerator();
    this.ruleEngine = new ADnDRuleEngine();

    this.conversationHistory = [];
    this.currentScene = null;
    this.party = null;
    this.round = 0;
  }

  /**
   * THE HEARTBEAT
   * 
   * Input: Player statement (natural language)
   * Output: Complete resolution (narrative + world changes + next choice)
   */
  async handlePlayerIntent(playerStatement, context = {}) {
    this.round++;

    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║                    HEARTBEAT ROUND ${this.round}                        ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);

    // STEP 1: UNDERSTAND INTENT
    // "I want to charm the guard, not just roll"
    // → Goal: secure_passage, Method: social, Constraints: [avoid_mechanics_only]

    console.log(`📖 PARSING INTENT...\n`);
    const intent = this.intentParser.parseIntent(
      playerStatement,
      context.npc,
      context.world
    );

    console.log(`Primary Goal: ${intent.primaryGoal}`);
    console.log(`Method: ${intent.method}`);
    console.log(`Confidence: ${(intent.confidence * 100).toFixed(0)}%`);
    if (intent.constraints.length > 0) {
      console.log(`Constraints: ${intent.constraints.join(', ')}`);
    }

    // STEP 2: ANALYZE STAKES
    // "If you succeed, the guard lets you pass; if you fail, he calls for backup"

    console.log(`\n📊 ANALYZING STAKES...\n`);
    const stakes = this.stakesEngine.analyzeStakes(intent, context.npc, intent);

    console.log(`On Success:`);
    stakes.onSuccess.forEach(s => console.log(`  ✓ ${s}`));
    console.log(`\nOn Failure:`);
    stakes.onFailure.forEach(f => console.log(`  ✗ ${f}`));
    if (stakes.onComplication.length > 0) {
      console.log(`\nOn Complication:`);
      stakes.onComplication.forEach(c => console.log(`  ? ${c}`));
    }

    // STEP 3: PRODUCE RESOLUTION
    // Rolls, applies rules, outputs narrative

    console.log(`\n🎲 RESOLVING...\n`);
    const resolution = this.stakesEngine.resolveAction(
      intent,
      context.character,
      context.npc
    );

    if (resolution.roll) {
      console.log(`ROLL: d20${resolution.roll.modifier >= 0 ? '+' : ''}${resolution.roll.modifier} = ${resolution.roll.total} vs DC ${resolution.dc}`);
    }

    console.log(`\nOUTCOME: ${resolution.outcomeType.toUpperCase()}`);
    console.log(`\n"${resolution.narrative}"`);

    // STEP 4: UPDATE WORLD STATE
    // NPC attitudes change, locations become accessible, etc.

    console.log(`\n🌍 UPDATING WORLD...\n`);
    const worldUpdate = this.worldUpdater.applyResolution(
      resolution,
      context.party,
      context.module
    );

    console.log(`Changes applied: ${worldUpdate.changes.length}`);
    for (const change of worldUpdate.changes) {
      console.log(`  • ${change.type}`);
    }

    // STEP 5: SET NEXT DECISION POINT
    // "Guard steps aside. What do you do?"

    console.log(`\n→ NEXT DECISION POINT\n`);
    console.log(`"${resolution.nextDecisionPoint}"\n`);

    // STEP 6: TRACK CONSEQUENCES
    const pendingConsequences = this.worldUpdater.getPendingConsequences();
    if (pendingConsequences.length > 0) {
      console.log(`⚠️  PENDING CONSEQUENCES:\n`);
      pendingConsequences.forEach(c => {
        console.log(`  • ${c.description}`);
      });
    }

    // Record in history
    this.conversationHistory.push({
      round: this.round,
      playerStatement,
      intent,
      stakes,
      resolution,
      worldUpdate
    });

    return {
      intent,
      stakes,
      resolution,
      worldUpdate,
      nextDecisionPoint: resolution.nextDecisionPoint,
      consequences: pendingConsequences
    };
  }

  /**
   * Display current scene
   */
  displayScene() {
    const worldState = this.worldUpdater.getWorldState();
    
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║                      WORLD STATE                           ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);

    console.log(`📍 KNOWN LOCATIONS:`);
    for (const [locId, loc] of Object.entries(worldState.locations)) {
      const status = loc.accessible ? '✓' : '✗';
      console.log(`  ${status} ${loc.name}`);
    }

    console.log(`\n👥 NPC ATTITUDES:`);
    for (const [npcId, npc] of Object.entries(worldState.npcs)) {
      console.log(`  ${npc.name}: ${npc.attitude} ${npc.isAlly ? '(ALLY)' : ''}`);
    }

    console.log(`\n💡 KNOWN FACTS:`);
    worldState.partyState.knownFacts.forEach(fact => {
      console.log(`  • ${fact}`);
    });

    if (worldState.partyState.conditions.length > 0) {
      console.log(`\n⚡ ACTIVE CONDITIONS:`);
      worldState.partyState.conditions.forEach(cond => {
        console.log(`  ⚠️  ${cond}`);
      });
    }
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Export session
   */
  exportSession() {
    return {
      round: this.round,
      history: this.conversationHistory,
      worldState: this.worldUpdater.exportState()
    };
  }
}

export { TheHeartbeatEngine };
