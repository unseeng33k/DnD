#!/usr/bin/env node

/**
 * Henchmen & Hirelings System
 */

class HenchmanSystem {
  constructor() {
    this.baseWages = {
      '0-level': { daily: 1, monthly: 30 },
      '1st-level': { daily: 3, monthly: 100 },
      '2nd-level': { daily: 5, monthly: 200 },
      '3rd-level': { daily: 10, monthly: 400 },
      '4th-level': { daily: 20, monthly: 800 },
      '5th-level': { daily: 40, monthly: 1500 }
    };
    
    this.loyaltyModifiers = {
      paidWell: 2,
      treatedWell: 2,
      sharedTreasure: 3,
      leaderCharisma: 0, // Based on CHA
      dangerHigh: -2,
      dangerLow: 1,
      abused: -4,
      unpaid: -6,
      friendSlain: -4
    };
  }

  roll2d6() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  }

  calculateLoyalty(baseLoyalty, modifiers = {}) {
    let total = baseLoyalty;
    
    for (const [key, value] of Object.entries(modifiers)) {
      if (this.loyaltyModifiers[key] !== undefined) {
        total += this.loyaltyModifiers[key] * value;
      }
    }
    
    return Math.max(2, Math.min(12, total));
  }

  checkMorale(loyalty, situation = {}) {
    const roll = this.roll2d6();
    
    let modifier = 0;
    if (situation.leaderDown) modifier -= 2;
    if (situation.outnumbered) modifier -= 1;
    if (situation.friendSlain) modifier -= 2;
    if (situation.treasureVisible) modifier += 1;
    
    const total = roll + modifier;
    
    return {
      roll,
      modifier,
      total,
      pass: total <= loyalty,
      result: total <= loyalty ? 'Stands firm' : 'Flees/retreats'
    };
  }

  hireHenchman(name, level, characterClass, stats = {}) {
    return {
      name,
      level,
      class: characterClass,
      stats: {
        str: stats.str || this.roll3d6(),
        int: stats.int || this.roll3d6(),
        wis: stats.wis || this.roll3d6(),
        dex: stats.dex || this.roll3d6(),
        con: stats.con || this.roll3d6(),
        cha: stats.cha || this.roll3d6()
      },
      hp: this.calculateHP(level, stats.con || 10),
      loyalty: 7, // Base loyalty
      wages: this.baseWages[`${level}th-level`] || this.baseWages['0-level'],
      equipment: [],
      status: 'available'
    };
  }

  roll3d6() {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      total += Math.floor(Math.random() * 6) + 1;
    }
    return total;
  }

  calculateHP(level, con) {
    const conBonus = Math.floor((con - 10) / 2);
    return (level * 5) + (level * conBonus);
  }

  generateHireling(type = 'mercenary') {
    const types = {
      mercenary: { hp: 6, ac: 6, wage: 2, skill: 'Fighting' },
      torchbearer: { hp: 4, ac: 9, wage: 1, skill: 'Light carrying' },
      porter: { hp: 4, ac: 9, wage: 1, skill: 'Heavy carrying' },
      guide: { hp: 4, ac: 8, wage: 5, skill: 'Navigation' },
      linkboy: { hp: 2, ac: 10, wage: 1, skill: 'Torch holding' },
      cook: { hp: 4, ac: 10, wage: 3, skill: 'Cooking' },
      animalHandler: { hp: 4, ac: 9, wage: 3, skill: 'Animal handling' }
    };

    const hireling = types[type] || types.mercenary;
    
    return {
      name: this.generateName(),
      type,
      ...hireling,
      loyalty: 6,
      equipment: ['Basic gear']
    };
  }

  generateName() {
    const first = ['Aldo', 'Bruno', 'Carlo', 'Dario', 'Enzo', 'Fabio', 'Gino', 'Hugo', 'Ivo', 'Jano'];
    const last = ['Smith', 'Jones', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor', 'Anderson'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }

  shareTreasure(henchman, amount) {
    // Henchmen expect a half-share
    const share = Math.floor(amount / 2);
    henchman.loyalty = Math.min(12, henchman.loyalty + 1);
    return { share, loyalty: henchman.loyalty };
  }
}

module.exports = HenchmanSystem;
