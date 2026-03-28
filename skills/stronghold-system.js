#!/usr/bin/env node

/**
 * Stronghold Building System
 */

class StrongholdSystem {
  constructor() {
    this.buildings = {
      'keep': { cost: 75000, time: '18 months', garrison: 60, income: 0 },
      'castle': { cost: 500000, time: '48 months', garrison: 200, income: 0 },
      'tower': { cost: 30000, time: '8 months', garrison: 10, income: 0 },
      'smallCastle': { cost: 250000, time: '30 months', garrison: 120, income: 0 },
      'fortifiedMonastery': { cost: 100000, time: '24 months', garrison: 40, income: 0 },
      'gatehouse': { cost: 15000, time: '4 months', garrison: 10, income: 0 },
      'moat': { cost: 20000, time: '6 months', garrison: 0, income: 0 },
      'curtainWall': { cost: 10000, time: '3 months', garrison: 0, income: 0 }
    };
    
    this.improvements = {
      'dungeon': { cost: 5000, benefit: 'Prison cells' },
      'library': { cost: 10000, benefit: 'Research bonus' },
      'laboratory': { cost: 15000, benefit: 'Potion making' },
      'temple': { cost: 20000, benefit: 'Divine intervention' },
      'workshop': { cost: 8000, benefit: 'Item crafting' },
      'stable': { cost: 3000, benefit: 'Mount housing' },
      'granary': { cost: 2000, benefit: 'Food storage' },
      'armory': { cost: 5000, benefit: 'Weapon storage' }
    };
    
    this.domainSizes = {
      'small': { area: '1-6 miles', families: 100, income: 1000 },
      'medium': { area: '6-12 miles', families: 500, income: 5000 },
      'large': { area: '12-24 miles', families: 2000, income: 20000 },
      'barony': { area: '24-48 miles', families: 10000, income: 100000 }
    };
  }

  calculateConstruction(building, modifiers = {}) {
    const base = this.buildings[building];
    if (!base) return { error: 'Building not found' };
    
    let cost = base.cost;
    let time = base.time;
    
    // Modifiers
    if (modifiers.quality === 'excellent') cost *= 1.5;
    if (modifiers.quality === 'cheap') cost *= 0.75;
    if (modifiers.rush) time = this.reduceTime(time, 25);
    if (modifiers.slow) time = this.increaseTime(time, 25);
    
    return {
      building,
      cost: Math.floor(cost),
      time,
      garrison: base.garrison,
      monthlyUpkeep: Math.floor(cost * 0.01)
    };
  }

  reduceTime(timeStr, percent) {
    // Simplified time reduction
    return timeStr; // Would parse and calculate
  }

  increaseTime(timeStr, percent) {
    return timeStr;
  }

  calculateDomainIncome(domainSize, modifiers = {}) {
    const base = this.domainSizes[domainSize];
    if (!base) return { error: 'Domain size not found' };
    
    let income = base.income;
    
    // Seasonal variation
    const season = modifiers.season || 'normal';
    if (season === 'good') income *= 1.2;
    if (season === 'poor') income *= 0.8;
    if (season === 'famine') income *= 0.5;
    
    // Tax rate
    const taxRate = modifiers.taxRate || 10; // 10% default
    const taxIncome = Math.floor(income * (taxRate / 100));
    
    // Expenses
    const garrison = modifiers.garrison || 0;
    const garrisonCost = garrison * 10; // 10gp per soldier/month
    
    const upkeep = modifiers.upkeep || 0;
    
    const netIncome = taxIncome - garrisonCost - upkeep;
    
    return {
      domainSize,
      families: base.families,
      grossIncome: income,
      taxIncome,
      expenses: {
        garrison: garrisonCost,
        upkeep
      },
      netIncome,
      loyalty: this.calculateLoyalty(taxRate, season)
    };
  }

  calculateLoyalty(taxRate, season) {
    let loyalty = 10; // Base
    
    if (taxRate > 20) loyalty -= 2;
    if (taxRate > 30) loyalty -= 4;
    if (taxRate < 5) loyalty += 2;
    
    if (season === 'famine') loyalty -= 3;
    if (season === 'poor') loyalty -= 1;
    if (season === 'good') loyalty += 1;
    
    return Math.max(2, Math.min(12, loyalty));
  }

  generateRandomEvent() {
    const events = [
      { event: 'Bandit raid', effect: 'Lose 1d6x100 gp', severity: 'minor' },
      { event: 'Orc attack', effect: 'Military response required', severity: 'major' },
      { event: 'Good harvest', effect: '+20% income this season', severity: 'benefit' },
      { event: 'Plague', effect: '-10% population, -2 loyalty', severity: 'major' },
      { event: 'Merchant caravan', effect: '+500 gp trade', severity: 'minor' },
      { event: 'Noble visitor', effect: 'Diplomatic opportunity', severity: 'neutral' },
      { event: 'Monster sighting', effect: 'Adventuring opportunity', severity: 'neutral' },
      { event: 'Peasant revolt', effect: 'Loyalty check required', severity: 'major' }
    ];
    
    return events[Math.floor(Math.random() * events.length)];
  }
}

module.exports = StrongholdSystem;
