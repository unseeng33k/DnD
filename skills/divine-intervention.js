#!/usr/bin/env node

/**
 * Divine Intervention System
 */

class DivineIntervention {
  constructor() {
    this.baseChance = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 7,
      7: 10,
      8: 13,
      9: 16,
      10: 20,
      11: 25,
      12: 30,
      13: 35,
      14: 40,
      15: 50,
      16: 55,
      17: 60,
      18: 70,
      19: 80,
      20: 90
    };
    
    this.interventionTypes = {
      minor: [
        'Heal 2d8 HP',
        'Cure poison/disease',
        'Provide food/water',
        'Light in darkness',
        'Warmth in cold',
        'Calm frightened allies'
      ],
      moderate: [
        'Heal 4d8 HP to all allies',
        'Destroy undead (2d6 HD)',
        'Dispel magic',
        'Remove curse',
        'Neutralize poison on all',
        'Create barrier vs evil'
      ],
      major: [
        'Resurrect dead (within 1 turn)',
        'Destroy undead (4d6 HD)',
        'Imprison demon/devil',
        'Part water/create path',
        'Earthquake (local)',
        'Plague of locusts on enemies'
      ]
    };
    
    this.consequences = [
      'Lose all spells for 24 hours',
      'Must undertake quest immediately',
      'Lose 1 point of CON permanently',
      'Age 1d10 years instantly',
      'Attract attention of enemy deity',
      'Sacrifice valuable magic item',
      'Must build shrine (1000gp)',
      'Lose ability to turn undead for 1 week',
      'Cannot call again for 1 month',
      'Deity demands service (1d4 weeks)'
    ];
  }

  roll(percentile) {
    return Math.floor(Math.random() * 100) + 1;
  }

  attempt(level, piety = 0, situation = {}) {
    let chance = this.baseChance[level] || 1;
    
    // Modifiers
    chance += piety; // +1% per point of piety
    if (situation.holyGround) chance += 10;
    if (situation.defendingFaithful) chance += 5;
    if (situation.selfishRequest) chance -= 20;
    if (situation.greaterGood) chance += 10;
    if (situation.alreadyAsked) chance -= 50;
    
    chance = Math.max(1, Math.min(99, chance));
    
    const roll = this.roll();
    const success = roll <= chance;
    
    let result = {
      roll,
      chance,
      success,
      level
    };
    
    if (success) {
      result.intervention = this.determineIntervention(level);
      result.consequence = this.determineConsequence();
    }
    
    return result;
  }

  determineIntervention(level) {
    if (level <= 5) {
      return this.random(this.interventionTypes.minor);
    } else if (level <= 10) {
      return this.random(this.interventionTypes.moderate);
    } else {
      return this.random(this.interventionTypes.major);
    }
  }

  determineConsequence() {
    return this.random(this.consequences);
  }

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  increasePiety(current, amount) {
    return Math.min(20, current + amount);
  }

  decreasePiety(current, amount) {
    return Math.max(-10, current - amount);
  }
}

module.exports = DivineIntervention;
