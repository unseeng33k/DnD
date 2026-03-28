#!/usr/bin/env node

/**
 * Combat Tracker
 * Initiative, HP, rounds, turn management
 */

class CombatTracker {
  constructor() {
    this.active = false;
    this.round = 0;
    this.initiative = [];
    this.currentTurn = 0;
    this.combatLog = [];
  }

  startCombat(participants) {
    this.active = true;
    this.round = 1;
    this.initiative = participants.map(p => ({
      name: p.name,
      hp: p.hp || 10,
      maxHp: p.hp || 10,
      ac: p.ac || 10,
      initiative: p.initiative || 0,
      type: p.type || 'enemy',
      conditions: []
    })).sort((a, b) => b.initiative - a.initiative);
    
    this.currentTurn = 0;
    this.log('Combat started!');
    return this.getStatus();
  }

  addCombatant(name, hp, ac, initiative, type = 'enemy') {
    this.initiative.push({
      name, hp, maxHp: hp, ac, initiative, type, conditions: []
    });
    this.initiative.sort((a, b) => b.initiative - a.initiative);
  }

  damage(name, amount) {
    const combatant = this.initiative.find(c => c.name === name);
    if (!combatant) return null;
    
    combatant.hp = Math.max(0, combatant.hp - amount);
    this.log(`${name} takes ${amount} damage (${combatant.hp}/${combatant.maxHp} HP)`);
    
    if (combatant.hp === 0) {
      this.log(`${name} is DOWN!`);
    }
    
    return combatant.hp;
  }

  heal(name, amount) {
    const combatant = this.initiative.find(c => c.name === name);
    if (!combatant) return null;
    
    combatant.hp = Math.min(combatant.maxHp, combatant.hp + amount);
    this.log(`${name} heals ${amount} HP (${combatant.hp}/${combatant.maxHp})`);
    return combatant.hp;
  }

  nextTurn() {
    this.currentTurn++;
    if (this.currentTurn >= this.initiative.length) {
      this.currentTurn = 0;
      this.round++;
      this.log(`--- Round ${this.round} ---`);
    }
    
    const current = this.initiative[this.currentTurn];
    if (current.hp <= 0) {
      return this.nextTurn(); // Skip dead combatants
    }
    
    return current;
  }

  addCondition(name, condition) {
    const combatant = this.initiative.find(c => c.name === name);
    if (combatant) {
      combatant.conditions.push(condition);
      this.log(`${name} is ${condition}`);
    }
  }

  removeCondition(name, condition) {
    const combatant = this.initiative.find(c => c.name === name);
    if (combatant) {
      combatant.conditions = combatant.conditions.filter(c => c !== condition);
      this.log(`${name} is no longer ${condition}`);
    }
  }

  getStatus() {
    if (!this.active) return 'No active combat.';
    
    let output = `\n⚔️  COMBAT - Round ${this.round}\n\n`;
    output += 'Initiative Order:\n';
    
    this.initiative.forEach((c, i) => {
      const marker = i === this.currentTurn ? '▶️ ' : '  ';
      const status = c.hp <= 0 ? '💀' : `❤️ ${c.hp}/${c.maxHp}`;
      const conditions = c.conditions.length > 0 ? ` [${c.conditions.join(', ')}]` : '';
      output += `${marker}${c.name} ${status}${conditions}\n`;
    });
    
    const current = this.initiative[this.currentTurn];
    if (current && current.hp > 0) {
      output += `\n🎯 CURRENT TURN: ${current.name}\n`;
    }
    
    return output;
  }

  log(message) {
    this.combatLog.push({
      round: this.round,
      message,
      time: new Date().toISOString()
    });
  }

  endCombat() {
    this.active = false;
    this.log('Combat ended!');
    return this.combatLog;
  }
}

module.exports = CombatTracker;
