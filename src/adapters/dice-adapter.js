/**
 * DICE ADAPTER - PHASE 4
 * 
 * Bridges legacy dice.js system with new orchestrator API
 * 
 * OLD: dice.js has standalone roll functions, no event coordination
 * NEW: DiceAdapter listens to eventBus, emits standardized events, integrates with registries
 */

class DiceAdapter {
  constructor(eventBus, registries) {
    this.eventBus = eventBus;
    this.registries = registries;
    
    // Roll history tracking
    this.rollHistory = [];
    this.maxHistorySize = 100;
    
    // Setup event listeners for dice-related events
    this.setupEventListeners();
  }

  /**
   * STEP 1: Listen to all dice-related events from turn-pipeline
   */
  setupEventListeners() {
    this.eventBus.on('dice:roll-requested', (data) => {
      const result = this.rollDice(data.diceType, data.count, data.modifier);
      this.eventBus.emit('dice:roll-completed', {
        request: data,
        result: result
      });
    });

    this.eventBus.on('dice:attack-roll-requested', (data) => {
      const result = this.rollD20(data.modifier);
      if (data.advantage) result = this.rollWithAdvantage(1, data.modifier);
      if (data.disadvantage) result = this.rollWithDisadvantage(1, data.modifier);
      
      this.eventBus.emit('dice:attack-roll-completed', {
        request: data,
        result: result
      });
    });

    this.eventBus.on('dice:damage-roll-requested', (data) => {
      const result = this.rollDice(data.diceType, data.count, data.modifier);
      
      this.eventBus.emit('dice:damage-roll-completed', {
        request: data,
        result: result
      });
    });
  }

  /**
   * Roll a single die
   */
  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  /**
   * Roll a d20 (most common)
   */
  rollD20(modifier = 0) {
    const roll = this.rollDie(20);
    const total = roll + modifier;
    
    const result = {
      rolls: [roll],
      modifier: modifier,
      total: total,
      type: 'normal',
      isCritical: roll === 20,
      isFail: roll === 1
    };

    this.addToHistory(result, 'd20', modifier);

    if (result.isCritical || result.isFail) {
      this.eventBus.emit('dice:critical-result', {
        type: result.isCritical ? 'critical-hit' : 'critical-fail',
        roll: roll,
        modifier: modifier,
        total: total
      });
    }

    return result;
  }

  /**
   * Roll multiple dice with optional modifier
   * Format: "d20", "2d6", "3d8+2", "4d6", etc.
   */
  rollDice(diceType, count = 1, modifier = 0) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
      results.push(this.rollDie(diceType));
    }

    const sum = results.reduce((a, b) => a + b, 0);
    const total = sum + modifier;

    const result = {
      rolls: results,
      modifier: modifier,
      total: total,
      type: 'normal',
      diceType: diceType
    };

    this.addToHistory(result, `${count}d${diceType}`, modifier);

    return result;
  }

  /**
   * Roll with advantage (roll d20 twice, use higher)
   */
  rollWithAdvantage(count = 1, modifier = 0) {
    const roll1 = this.rollDie(20);
    const roll2 = this.rollDie(20);
    
    const kept = Math.max(roll1, roll2);
    const dropped = Math.min(roll1, roll2);
    const total = kept + modifier;

    const result = {
      rolls: [roll1, roll2],
      kept: kept,
      dropped: dropped,
      modifier: modifier,
      total: total,
      type: 'advantage',
      isCritical: kept === 20,
      isFail: dropped === 1
    };

    this.addToHistory(result, 'd20', modifier, 'advantage');

    this.eventBus.emit('dice:advantage-applied', {
      rolls: [roll1, roll2],
      kept: kept,
      dropped: dropped,
      total: total
    });

    if (result.isCritical || result.isFail) {
      this.eventBus.emit('dice:critical-result', {
        type: result.isCritical ? 'critical-hit' : 'critical-fail',
        roll: kept,
        modifier: modifier,
        total: total,
        appliedWith: 'advantage'
      });
    }

    return result;
  }

  /**
   * Roll with disadvantage (roll d20 twice, use lower)
   */
  rollWithDisadvantage(count = 1, modifier = 0) {
    const roll1 = this.rollDie(20);
    const roll2 = this.rollDie(20);
    
    const kept = Math.min(roll1, roll2);
    const dropped = Math.max(roll1, roll2);
    const total = kept + modifier;

    const result = {
      rolls: [roll1, roll2],
      kept: kept,
      dropped: dropped,
      modifier: modifier,
      total: total,
      type: 'disadvantage',
      isCritical: kept === 20,
      isFail: kept === 1
    };

    this.addToHistory(result, 'd20', modifier, 'disadvantage');

    this.eventBus.emit('dice:disadvantage-applied', {
      rolls: [roll1, roll2],
      kept: kept,
      dropped: dropped,
      total: total
    });

    if (result.isCritical || result.isFail) {
      this.eventBus.emit('dice:critical-result', {
        type: result.isFail ? 'critical-fail' : 'critical-hit',
        roll: kept,
        modifier: modifier,
        total: total,
        appliedWith: 'disadvantage'
      });
    }

    return result;
  }

  /**
   * Special: 4d6 drop lowest (character generation)
   */
  rollCharacterAbilityStat() {
    const results = [
      this.rollDie(6),
      this.rollDie(6),
      this.rollDie(6),
      this.rollDie(6)
    ];

    const sorted = [...results].sort((a, b) => b - a);
    const dropped = sorted.pop();
    const total = sorted.reduce((a, b) => a + b, 0);

    const result = {
      rolls: results,
      kept: sorted,
      dropped: dropped,
      total: total,
      type: '4d6-drop-lowest'
    };

    this.addToHistory(result, '4d6', 0, 'drop-lowest');

    return result;
  }

  /**
   * Get statistical average for a roll
   */
  getAverageResult(sides, count = 1) {
    const avgPerDie = (sides + 1) / 2;
    return avgPerDie * count;
  }

  /**
   * Get roll history
   */
  getRollHistory(limit = 20) {
    return this.rollHistory.slice(-limit);
  }

  /**
   * Clear roll history
   */
  clearHistory() {
    this.rollHistory = [];
  }

  /**
   * Add roll to history
   */
  addToHistory(result, rollType, modifier, variant = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: rollType,
      variant: variant,
      result: result.total,
      rolls: result.rolls,
      modifier: modifier
    };

    this.rollHistory.push(entry);

    // Keep history size manageable
    if (this.rollHistory.length > this.maxHistorySize) {
      this.rollHistory = this.rollHistory.slice(-this.maxHistorySize);
    }

    return entry;
  }

  /**
   * Get roll statistics
   */
  getRollStats(diceType = null) {
    const filtered = diceType 
      ? this.rollHistory.filter(r => r.type === diceType)
      : this.rollHistory;

    if (filtered.length === 0) return null;

    const totals = filtered.map(r => r.result);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const min = Math.min(...totals);
    const max = Math.max(...totals);

    return {
      count: filtered.length,
      average: avg.toFixed(2),
      min: min,
      max: max,
      diceType: diceType || 'all'
    };
  }
}

export { DiceAdapter };
