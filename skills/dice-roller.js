#!/usr/bin/env node

/**
 * Dice Roller with History
 */

class DiceRoller {
  constructor() {
    this.history = [];
    this.stats = {
      totalRolls: 0,
      crits: 0,
      fumbles: 0,
      average: 0
    };
  }

  roll(dice, reason = '') {
    const match = dice.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return { error: 'Invalid dice format. Use NdN+N' };

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    const rolls = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    total += modifier;

    // Check for crits/fumbles (d20 only)
    let special = null;
    if (sides === 20 && count === 1) {
      if (rolls[0] === 20) {
        special = 'CRITICAL SUCCESS! 🎉';
        this.stats.crits++;
      } else if (rolls[0] === 1) {
        special = 'CRITICAL FAILURE! 💀';
        this.stats.fumbles++;
      }
    }

    const result = {
      dice,
      rolls,
      modifier,
      total,
      reason,
      special,
      timestamp: new Date().toISOString()
    };

    this.history.push(result);
    this.updateStats();

    return result;
  }

  updateStats() {
    this.stats.totalRolls = this.history.length;
    const sum = this.history.reduce((acc, r) => acc + r.total, 0);
    this.stats.average = this.stats.totalRolls > 0 ? (sum / this.stats.totalRolls).toFixed(2) : 0;
  }

  rollWithAdvantage(reason = '') {
    const roll1 = this.roll('1d20', reason + ' (adv 1)');
    const roll2 = this.roll('1d20', reason + ' (adv 2)');
    const best = Math.max(roll1.total, roll2.total);
    
    return {
      rolls: [roll1, roll2],
      used: roll1.total >= roll2.total ? roll1 : roll2,
      total: best,
      reason: reason + ' (with advantage)',
      timestamp: new Date().toISOString()
    };
  }

  rollWithDisadvantage(reason = '') {
    const roll1 = this.roll('1d20', reason + ' (dis 1)');
    const roll2 = this.roll('1d20', reason + ' (dis 2)');
    const worst = Math.min(roll1.total, roll2.total);
    
    return {
      rolls: [roll1, roll2],
      used: roll1.total <= roll2.total ? roll1 : roll2,
      total: worst,
      reason: reason + ' (with disadvantage)',
      timestamp: new Date().toISOString()
    };
  }

  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  printRoll(result) {
    let output = `🎲 ${result.dice}`;
    if (result.reason) output += ` - ${result.reason}`;
    output += '\n';
    
    output += `   Rolls: [${result.rolls.join(', ')}]`;
    if (result.modifier !== 0) output += ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`;
    output += '\n';
    
    output += `   Total: ${result.total}`;
    if (result.special) output += ` - ${result.special}`;
    output += '\n';
    
    return output;
  }

  printStats() {
    return `
📊 ROLLING STATISTICS

Total Rolls: ${this.stats.totalRolls}
Critical Hits: ${this.stats.crits}
Critical Misses: ${this.stats.fumbles}
Average Roll: ${this.stats.average}
`;
  }
}

module.exports = DiceRoller;
