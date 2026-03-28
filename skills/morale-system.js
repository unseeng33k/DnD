#!/usr/bin/env node

/**
 * Morale & Reaction System
 * Old-school AD&D style
 */

class MoraleSystem {
  constructor() {
    this.reactionTable = {
      2: { result: 'Hostile, attacks immediately', roll: '2' },
      3: { result: 'Hostile, threatening', roll: '3-5' },
      6: { result: 'Uncertain, wary', roll: '6-8' },
      9: { result: 'Neutral, interested', roll: '9-11' },
      12: { result: 'Friendly, helpful', roll: '12' }
    };
    
    this.moraleModifiers = {
      leaderSlain: -4,
      halfCasualties: -2,
      quarterCasualties: -1,
      surprised: -2,
      outnumbered: -1,
      outnumberEnemy: +1,
      defendingHome: +2,
      fanatical: +3,
      leaderPresent: +2
    };
  }

  roll2d6() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  }

  checkReaction(modifier = 0) {
    const roll = this.roll2d6() + modifier;
    
    if (roll <= 2) return this.reactionTable[2];
    if (roll <= 5) return this.reactionTable[3];
    if (roll <= 8) return this.reactionTable[6];
    if (roll <= 11) return this.reactionTable[9];
    return this.reactionTable[12];
  }

  checkMorale(baseMorale, situation = {}) {
    let modifier = 0;
    
    if (situation.leaderSlain) modifier += this.moraleModifiers.leaderSlain;
    if (situation.halfCasualties) modifier += this.moraleModifiers.halfCasualties;
    if (situation.quarterCasualties) modifier += this.moraleModifiers.quarterCasualties;
    if (situation.surprised) modifier += this.moraleModifiers.surprised;
    if (situation.outnumbered) modifier += this.moraleModifiers.outnumbered;
    if (situation.outnumberEnemy) modifier += this.moraleModifiers.outnumberEnemy;
    if (situation.defendingHome) modifier += this.moraleModifiers.defendingHome;
    if (situation.fanatical) modifier += this.moraleModifiers.fanatical;
    if (situation.leaderPresent) modifier += this.moraleModifiers.leaderPresent;

    const roll = this.roll2d6();
    const total = roll + modifier;
    
    return {
      roll,
      modifier,
      total,
      pass: total <= baseMorale,
      result: total <= baseMorale ? 'Holds firm' : 'Flees/surrenders'
    };
  }

  getMonsterMorale(monsterType) {
    const morales = {
      'goblin': 7,
      'orc': 8,
      'hobgoblin': 9,
      'gnoll': 8,
      'bugbear': 9,
      'ogre': 10,
      'troll': 10,
      'giant': 11,
      'dragon': 12,
      'demon': 12,
      'undead': 12, // Undead usually don't check morale
      'skeleton': 12,
      'zombie': 12,
      'ghoul': 10,
      'wight': 11,
      'vampire': 12
    };
    
    return morales[monsterType.toLowerCase()] || 8;
  }
}

module.exports = MoraleSystem;
