#!/usr/bin/env node

/**
 * Training System
 */

class TrainingSystem {
  constructor() {
    this.baseCosts = {
      fighter: { cost: 1000, time: 1, trainer: 'Fighter level 2+' },
      cleric: { cost: 1500, time: 1, trainer: 'Cleric level 2+' },
      thief: { cost: 800, time: 1, trainer: 'Thief level 2+' },
      magicUser: { cost: 2000, time: 1, trainer: 'Magic-User level 2+' },
      paladin: { cost: 1500, time: 1, trainer: 'Paladin level 2+' },
      ranger: { cost: 1200, time: 1, trainer: 'Ranger level 2+' },
      monk: { cost: 1000, time: 1, trainer: 'Monk level 2+' },
      druid: { cost: 1500, time: 1, trainer: 'Druid level 2+' }
    };
    
    this.trainingRequirements = {
      1: { xp: 0, cost: 0 },
      2: { xp: 2000, cost: 1 },
      3: { xp: 4000, cost: 1 },
      4: { xp: 8000, cost: 2 },
      5: { xp: 16000, cost: 2 },
      6: { xp: 32000, cost: 3 },
      7: { xp: 64000, cost: 3 },
      8: { xp: 125000, cost: 4 },
      9: { xp: 250000, cost: 4 },
      10: { xp: 500000, cost: 5 }
    };
  }

  calculateTrainingCost(characterClass, currentLevel, trainerQuality = 'average') {
    const base = this.baseCosts[characterClass.toLowerCase()] || this.baseCosts.fighter;
    const requirement = this.trainingRequirements[currentLevel + 1];
    
    if (!requirement) return { error: 'Maximum level reached' };
    
    let cost = base.cost * requirement.cost;
    let weeks = base.time * requirement.cost;
    
    // Trainer quality modifiers
    if (trainerQuality === 'excellent') {
      cost *= 1.5;
      weeks *= 0.75;
    } else if (trainerQuality === 'poor') {
      cost *= 0.75;
      weeks *= 1.5;
    }
    
    return {
      currentLevel,
      nextLevel: currentLevel + 1,
      cost: Math.floor(cost),
      time: `${weeks} weeks`,
      trainer: base.trainer,
      xpRequired: requirement.xp
    };
  }

  attemptTraining(character, trainer, weeksSpent) {
    const requirement = this.calculateTrainingCost(character.class, character.level, trainer.quality);
    
    // Check if enough XP
    if (character.xp < requirement.xpRequired) {
      return {
        success: false,
        reason: 'Insufficient experience points',
        needed: requirement.xpRequired,
        has: character.xp
      };
    }
    
    // Check if enough gold
    if (character.gold < requirement.cost) {
      return {
        success: false,
        reason: 'Insufficient gold',
        needed: requirement.cost,
        has: character.gold
      };
    }
    
    // Check time
    const weeksNeeded = parseInt(requirement.time);
    if (weeksSpent < weeksNeeded) {
      return {
        success: false,
        reason: 'Training incomplete',
        needed: weeksNeeded,
        spent: weeksSpent
      };
    }
    
    // Success!
    return {
      success: true,
      newLevel: requirement.nextLevel,
      cost: requirement.cost,
      time: requirement.time,
      hpGain: this.rollHP(character.class),
      message: `Training complete! ${character.name} is now level ${requirement.nextLevel}!`
    };
  }

  rollHP(characterClass) {
    const hd = {
      fighter: 10, paladin: 10, ranger: 8,
      cleric: 8, druid: 8,
      thief: 6, monk: 6,
      magicUser: 4
    };
    
    const sides = hd[characterClass.toLowerCase()] || 6;
    return Math.floor(Math.random() * sides) + 1;
  }

  findTrainer(location, characterClass) {
    const trainers = [
      { name: 'Master Thorne', class: 'fighter', level: 8, quality: 'excellent', cost: 1.5 },
      { name: 'Sister Maria', class: 'cleric', level: 7, quality: 'good', cost: 1.2 },
      { name: 'Shadow', class: 'thief', level: 9, quality: 'excellent', cost: 1.5 },
      { name: 'Archmage Albus', class: 'magicUser', level: 12, quality: 'master', cost: 2.0 },
      { name: 'Old Guard', class: 'fighter', level: 4, quality: 'poor', cost: 0.8 },
      { name: 'Apprentice', class: 'magicUser', level: 3, quality: 'poor', cost: 0.8 }
    ];
    
    return trainers.filter(t => t.class === characterClass.toLowerCase());
  }
}

module.exports = TrainingSystem;
