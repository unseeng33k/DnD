#!/usr/bin/env node

/**
 * Random Encounter Generator
 */

class EncounterGenerator {
  constructor() {
    this.encounters = {
      jungle: {
        day: [
          { creatures: '2-8 giant centipedes', chance: 15 },
          { creatures: '1-4 poisonous snakes', chance: 15 },
          { creatures: '1-2 jaguars', chance: 10 },
          { creatures: '2-12 stirges', chance: 15 },
          { creatures: '1-6 lizard men', chance: 10 },
          { creatures: '1 giant crocodile', chance: 5 },
          { creatures: '1-4 basilisks', chance: 5 },
          { creatures: 'No encounter', chance: 25 }
        ],
        night: [
          { creatures: '1-6 ghouls', chance: 15 },
          { creatures: '1-4 jaguars', chance: 15 },
          { creatures: '2-8 giant spiders', chance: 15 },
          { creatures: '1-4 wights', chance: 10 },
          { creatures: '1 vampire spawn', chance: 5 },
          { creatures: '1-6 shadows', chance: 10 },
          { creatures: 'No encounter', chance: 30 }
        ]
      },
      dungeon: {
        general: [
          { creatures: '2-8 goblins', chance: 20 },
          { creatures: '1-6 skeletons', chance: 15 },
          { creatures: '1-4 zombies', chance: 15 },
          { creatures: '1-4 ghouls', chance: 10 },
          { creatures: '1-2 wights', chance: 10 },
          { creatures: '1 mummy', chance: 5 },
          { creatures: '1 basilisk', chance: 5 },
          { creatures: 'Trap', chance: 10 },
          { creatures: 'No encounter', chance: 10 }
        ]
      },
      road: {
        day: [
          { creatures: '1-6 bandits', chance: 20 },
          { creatures: '1-4 merchants with guards', chance: 15 },
          { creatures: '1-2 pilgrims', chance: 10 },
          { creatures: '1 noble with retinue', chance: 10 },
          { creatures: '1 patrol of soldiers', chance: 15 },
          { creatures: '1 wandering monster', chance: 15 },
          { creatures: 'No encounter', chance: 15 }
        ],
        night: [
          { creatures: '2-12 bandits', chance: 25 },
          { creatures: '1-6 wolves', chance: 20 },
          { creatures: '1-4 ghouls', chance: 15 },
          { creatures: '1 wraith', chance: 10 },
          { creatures: 'No encounter', chance: 30 }
        ]
      },
      swamp: {
        day: [
          { creatures: '1-6 lizard men', chance: 20 },
          { creatures: '1 giant crocodile', chance: 15 },
          { creatures: '2-8 giant leeches', chance: 15 },
          { creatures: '1-4 poisonous snakes', chance: 15 },
          { creatures: '1-2 will-o-wisps', chance: 10 },
          { creatures: 'No encounter', chance: 25 }
        ],
        night: [
          { creatures: '2-8 ghouls', chance: 20 },
          { creatures: '1-4 wights', chance: 15 },
          { creatures: '1-2 will-o-wisps', chance: 15 },
          { creatures: '1-6 shadows', chance: 15 },
          { creatures: '1 ghost', chance: 10 },
          { creatures: 'No encounter', chance: 25 }
        ]
      }
    };
    
    this.weatherEffects = {
      rain: 'Visibility reduced to 50%, tracks obscured',
      fog: 'Visibility 20 feet, surprise chance +1',
      storm: 'No missile fire, movement halved',
      heat: 'Exhaustion after 4 hours, water consumption doubled',
      snow: 'Movement quartered, cold damage per hour'
    };
  }

  roll() {
    return Math.floor(Math.random() * 100) + 1;
  }

  generate(terrain, timeOfDay = 'day', weather = 'clear') {
    const table = this.encounters[terrain];
    if (!table) return { error: 'Unknown terrain' };
    
    const encounters = table[timeOfDay] || table.general;
    if (!encounters) return { error: 'No encounters for this time' };
    
    const roll = this.roll();
    let cumulative = 0;
    
    for (const entry of encounters) {
      cumulative += entry.chance;
      if (roll <= cumulative) {
        const result = {
          encounter: entry.creatures,
          terrain,
          timeOfDay,
          weather,
          roll
        };
        
        if (weather !== 'clear' && this.weatherEffects[weather]) {
          result.weatherEffect = this.weatherEffects[weather];
        }
        
        return result;
      }
    }
    
    return { encounter: 'No encounter', terrain, timeOfDay, weather, roll };
  }

  generateMultiple(terrain, timeOfDay, count = 3) {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(this.generate(terrain, timeOfDay));
    }
    return results;
  }
}

module.exports = EncounterGenerator;
