#!/usr/bin/env node

/**
 * Wilderness Survival System
 * Foraging, getting lost, food/water tracking
 */

class WildernessSystem {
  constructor() {
    this.terrainModifiers = {
      forest: { forage: 0, lost: -2, water: 0 },
      plains: { forage: -2, lost: 0, water: -2 },
      desert: { forage: -4, lost: 0, water: -4 },
      swamp: { forage: +2, lost: -2, water: +2 },
      mountains: { forage: -4, lost: -2, water: 0 },
      jungle: { forage: +2, lost: -4, water: +2 },
      arctic: { forage: -6, lost: -2, water: 0 }
    };
    
    this.foodRequirements = {
      human: 1,
      dwarf: 1,
      elf: 0.5,
      halfling: 0.5,
      gnome: 0.5,
      halfelf: 1,
      halforc: 1.5
    };
    
    this.waterRequirements = {
      normal: 1,
      hot: 2,
      desert: 3,
      arctic: 0.5
    };
  }

  roll(dice) {
    return Math.floor(Math.random() * dice) + 1;
  }

  forage(terrain, wisdom = 10, survival = false) {
    const modifier = this.terrainModifiers[terrain]?.forage || 0;
    const wisBonus = Math.floor((wisdom - 10) / 2);
    const skillBonus = survival ? 2 : 0;
    
    const roll = this.roll(6);
    const total = roll + modifier + wisBonus + skillBonus;
    
    if (total >= 5) {
      return {
        success: true,
        food: this.roll(6),
        water: terrain === 'desert' ? 0 : this.roll(6),
        description: 'Found sufficient food and water'
      };
    } else if (total >= 3) {
      return {
        success: 'partial',
        food: this.roll(3),
        water: terrain === 'desert' ? 0 : this.roll(3),
        description: 'Found minimal supplies'
      };
    } else {
      return {
        success: false,
        food: 0,
        water: 0,
        description: 'Found nothing edible'
      };
    }
  }

  checkLost(terrain, navigatorWis = 10, hasMap = false, followingRoad = false) {
    if (followingRoad) return { lost: false, reason: 'Following road' };
    
    const modifier = this.terrainModifiers[terrain]?.lost || 0;
    const wisBonus = Math.floor((navigatorWis - 10) / 2);
    const mapBonus = hasMap ? 4 : 0;
    
    const roll = this.roll(6);
    const total = roll + modifier + wisBonus + mapBonus;
    
    if (total <= 2) {
      return {
        lost: true,
        direction: this.randomDirection(),
        reason: 'Failed navigation check'
      };
    }
    
    return { lost: false, reason: 'Navigation successful' };
  }

  randomDirection() {
    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  calculateEncumbrance(items) {
    // Simplified encumbrance
    let weight = 0;
    for (const item of items) {
      weight += item.weight || 1;
    }
    
    const strength = 10; // Default
    const capacity = strength * 10;
    
    if (weight <= capacity / 3) return { level: 'Light', speed: 12, penalty: 0 };
    if (weight <= capacity * 2 / 3) return { level: 'Moderate', speed: 9, penalty: -1 };
    if (weight <= capacity) return { level: 'Heavy', speed: 6, penalty: -2 };
    return { level: 'Overloaded', speed: 3, penalty: -4 };
  }

  trackSupplies(party, days = 1, terrain = 'forest', temperature = 'normal') {
    const results = {
      days,
      terrain,
      consumption: {},
      warnings: []
    };

    for (const member of party) {
      const race = member.race || 'human';
      const foodNeed = (this.foodRequirements[race] || 1) * days;
      const waterNeed = (this.waterRequirements[temperature] || 1) * days;
      
      results.consumption[member.name] = {
        food: foodNeed,
        water: waterNeed
      };
      
      if (member.food < foodNeed) {
        results.warnings.push(`${member.name} is low on food!`);
      }
      if (member.water < waterNeed) {
        results.warnings.push(`${member.name} is low on water!`);
      }
    }

    return results;
  }

  getStarvationEffects(daysWithoutFood) {
    if (daysWithoutFood === 0) return 'No effect';
    if (daysWithoutFood <= 3) return '-1 to all rolls, fatigue';
    if (daysWithoutFood <= 7) return '-2 to all rolls, weakness';
    return '-4 to all rolls, risk of death';
  }

  getDehydrationEffects(daysWithoutWater) {
    if (daysWithoutWater === 0) return 'No effect';
    if (daysWithoutWater === 1) return '-2 to all rolls, severe fatigue';
    if (daysWithoutWater === 2) return '-4 to all rolls, hallucinations';
    return 'Death imminent';
  }
}

module.exports = WildernessSystem;
