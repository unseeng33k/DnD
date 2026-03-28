#!/usr/bin/env node

/**
 * Research & Spell Creation System
 */

class ResearchSystem {
  constructor() {
    this.spellLevels = {
      1: { cost: 500, time: '1 week', library: 'basic' },
      2: { cost: 1000, time: '2 weeks', library: 'basic' },
      3: { cost: 2000, time: '4 weeks', library: 'good' },
      4: { cost: 4000, time: '2 months', library: 'good' },
      5: { cost: 8000, time: '4 months', library: 'excellent' },
      6: { cost: 16000, time: '8 months', library: 'excellent' },
      7: { cost: 32000, time: '16 months', library: 'master' },
      8: { cost: 64000, time: '32 months', library: 'master' },
      9: { cost: 128000, time: '64 months', library: 'archmage' }
    };
    
    this.failureTable = [
      { roll: 1, result: 'Catastrophic failure', effect: 'Spell backfires, 2d6 damage to caster' },
      { roll: 2, result: 'Major failure', effect: 'Spell fails, 1d6 damage to caster' },
      { roll: 3, result: 'Minor failure', effect: 'Spell fails, all materials lost' },
      { roll: 4, result: 'Partial success', effect: 'Spell works at half strength' },
      { roll: 5, result: 'Partial success', effect: 'Spell works at half strength' },
      { roll: 6, result: 'Success', effect: 'Spell works as intended' },
      { roll: 7, result: 'Success', effect: 'Spell works as intended' },
      { roll: 8, result: 'Success', effect: 'Spell works as intended' },
      { roll: 9, result: 'Success', effect: 'Spell works as intended' },
      { roll: 10, result: 'Critical success', effect: 'Spell works, 25% reduction in future research time' }
    ];
    
    this.experimentDangers = [
      'Minor explosion (1d6 damage)',
      'Toxic fumes (save vs poison or sick 1d4 days)',
      'Dimensional rift (summons 1d4 random creatures)',
      'Fire (spellbook damaged, 500gp to repair)',
      'Frost (laboratory frozen, 1 week to thaw)',
      'Lightning (2d6 damage, equipment destroyed)',
      'Transformation (caster polymorphed for 1d4 days)',
      'Mind blast (lose 1d4 INT for 1 week)',
      'Demonic attention (summoned by demon name)',
      'Permanent side effect (random physical change)'
    ];
  }

  calculateResearchCost(level, modifiers = {}) {
    const base = this.spellLevels[level];
    if (!base) return { error: 'Invalid spell level' };
    
    let cost = base.cost;
    let time = base.time;
    
    // Modifiers
    if (modifiers.library === 'excellent') cost *= 0.9;
    if (modifiers.library === 'poor') cost *= 1.2;
    if (modifiers.assistant) cost *= 1.5; // But time reduced
    if (modifiers.rush) cost *= 2;
    
    // Intelligence bonus
    const int = modifiers.intelligence || 10;
    if (int >= 18) cost *= 0.9;
    if (int <= 8) cost *= 1.1;
    
    return {
      level,
      cost: Math.floor(cost),
      time,
      library: base.library,
      successChance: this.calculateSuccessChance(level, int)
    };
  }

  calculateSuccessChance(level, intelligence) {
    let base = 60; // 60% base
    
    // Level penalty
    base -= (level * 3);
    
    // Intelligence bonus
    const intBonus = Math.floor((intelligence - 10) / 2);
    base += (intBonus * 5);
    
    return Math.max(10, Math.min(95, base));
  }

  attemptResearch(level, intelligence, modifiers = {}) {
    const roll = Math.floor(Math.random() * 10) + 1;
    const result = this.failureTable.find(r => r.roll === roll) || this.failureTable[5];
    
    // Adjust roll based on intelligence
    const intBonus = Math.floor((intelligence - 10) / 2);
    const adjustedRoll = Math.max(1, Math.min(10, roll + intBonus));
    
    return {
      roll,
      adjustedRoll,
      ...this.failureTable.find(r => r.roll === adjustedRoll),
      cost: this.calculateResearchCost(level, modifiers).cost
    };
  }

  experiment(intelligence, modifiers = {}) {
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Base danger on roll
    let danger = 'None';
    if (roll === 1) danger = this.experimentDangers[Math.floor(Math.random() * this.experimentDangers.length)];
    else if (roll <= 5) danger = 'Minor side effect';
    else if (roll <= 10) danger = 'Temporary inconvenience';
    
    // Intelligence reduces danger
    const intBonus = Math.floor((intelligence - 10) / 2);
    if (intBonus >= 3 && roll <= 3) danger = 'None'; // High INT avoids worst
    
    return {
      roll,
      danger,
      success: roll >= 15 // Need 15+ for success
    };
  }

  copySpell(spellLevel, intelligence) {
    const baseChance = 60 + (spellLevel * 5);
    const intBonus = Math.floor((intelligence - 10) / 2) * 5;
    const totalChance = Math.min(99, baseChance + intBonus);
    
    const roll = Math.floor(Math.random() * 100) + 1;
    
    return {
      roll,
      target: totalChance,
      success: roll <= totalChance,
      time: `${spellLevel} days`,
      cost: spellLevel * 100
    };
  }
}

module.exports = ResearchSystem;
