#!/usr/bin/env node

/**
 * PILLAR 8: SPOTLIGHT SCHEDULER
 * 
 * Responsibility: Turn order, initiative, round management
 * 
 * Handles:
 * - Initiative calculation & rolling
 * - Turn order tracking
 * - Round progression
 * - Spotlight allocation per turn
 * - Combat vs roleplay mode switching
 */

class SpotlightSchedulerPillar {
  constructor() {
    this.name = 'SpotlightScheduler';
    this.currentRound = 0;
    this.currentTurn = 0;
    this.combatActive = false;
    this.initiativeOrder = [];
    this.turnLog = [];
  }

  initSession(engine, { party, setting }) {
    this.engine = engine;
    this.party = party;
    this.log(`✅ Initialized turn scheduler for ${party.length} characters`);
  }

  /**
   * CALCULATE INITIATIVE
   */

  calculateInitiative(characters) {
    if (characters.size === 0) return [];

    this.initiativeOrder = [];

    for (const char of characters.values()) {
      // AD&D 1E: Initiative = DEX modifier + d6
      const dexMod = Math.floor((char.abilities.dex - 10) / 2);
      const d6Roll = Math.floor(Math.random() * 6) + 1;
      const initiative = dexMod + d6Roll;

      this.initiativeOrder.push({
        charId: char.id,
        charName: char.name,
        initiative,
        dexMod,
        roll: d6Roll,
        actions: 0
      });

      this.log(`⚔️  ${char.name} rolls initiative: ${dexMod > 0 ? '+' : ''}${dexMod} + ${d6Roll} = ${initiative}`);
    }

    // Sort by initiative (highest first)
    this.initiativeOrder.sort((a, b) => b.initiative - a.initiative);

    this.combatActive = true;
    this.currentTurn = 0;

    return this.initiativeOrder;
  }

  /**
   * GET TURN ORDER
   */

  getTurnOrder() {
    return this.initiativeOrder.map(char => ({
      position: this.initiativeOrder.indexOf(char) + 1,
      ...char
    }));
  }

  /**
   * GET NEXT ACTOR
   */

  getNextActor() {
    if (this.initiativeOrder.length === 0) return null;

    const actor = this.initiativeOrder[this.currentTurn % this.initiativeOrder.length];
    return actor;
  }

  /**
   * ADVANCE TO NEXT TURN
   */

  nextTurn() {
    if (!this.combatActive) return null;

    const currentActor = this.getNextActor();
    this.currentTurn++;

    // Check if round is over
    if (this.currentTurn >= this.initiativeOrder.length) {
      this.currentRound++;
      this.currentTurn = 0;
      this.log(`\n🔄 Round ${this.currentRound} begins`);
    }

    const nextActor = this.getNextActor();
    this.log(`⏱️  Turn ${this.currentTurn + 1}: ${nextActor.charName}'s turn`);

    return nextActor;
  }

  /**
   * RECORD TURN ACTION
   */

  recordTurn(actor, action, result) {
    const turnRecord = {
      round: this.currentRound,
      turn: this.currentTurn,
      actor: actor.name,
      action: action.name,
      result: result.success ? '✅' : '❌',
      timestamp: new Date().toISOString()
    };

    this.turnLog.push(turnRecord);

    // Track spotlight for this turn
    for (const initiativeEntry of this.initiativeOrder) {
      if (initiativeEntry.charId === actor.id) {
        initiativeEntry.actions++;
      }
    }
  }

  /**
   * END COMBAT (RETURN TO NORMAL PLAY)
   */

  endCombat() {
    this.combatActive = false;
    this.log(`\n🛑 Combat ended`);
    return {
      roundsFought: this.currentRound,
      totalActions: this.turnLog.length,
      actionLog: this.turnLog
    };
  }

  /**
   * GET SPOTLIGHT THIS ROUND
   */

  getSpotlightThisRound() {
    const spotlight = {};

    for (const entry of this.initiativeOrder) {
      spotlight[entry.charId] = {
        name: entry.charName,
        actions: entry.actions,
        initiative: entry.initiative
      };
    }

    return spotlight;
  }

  /**
   * REBALANCE TURNS
   * If one character has way more actions, adjust
   */

  rebalanceTurns() {
    const actionCounts = this.initiativeOrder.map(e => e.actions);
    const maxActions = Math.max(...actionCounts);
    const minActions = Math.min(...actionCounts);

    if (maxActions - minActions > 3) {
      this.log(`\n⚠️  Action imbalance detected!`);
      for (const entry of this.initiativeOrder) {
        if (entry.actions < minActions + 1) {
          this.log(`   💡 ${entry.charName} should get priority next`);
        }
      }
    }
  }

  /**
   * QUERIES
   */

  getRound() {
    return this.currentRound;
  }

  getTurn() {
    return this.currentTurn;
  }

  isCombat() {
    return this.combatActive;
  }

  /**
   * LOGGING
   */

  log(msg) {
    console.log(`[Pillar8-Scheduler] ${msg}`);
  }
}

export { SpotlightSchedulerPillar };
