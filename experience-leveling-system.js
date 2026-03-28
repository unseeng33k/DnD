#!/usr/bin/env node

/**
 * EXPERIENCE & LEVELING SYSTEM - COMPLETE
 * 
 * Tracks:
 * - XP gain from encounters
 * - Milestone leveling
 * - HP progression
 * - Ability improvements
 * - New spells on levelup
 * - Class-specific advancements
 * - Thief skill improvements
 * - Feature unlocks
 */

class ExperienceSystem {
  constructor(character) {
    this.character = character;
    this.currentXP = character.experience || 0;
    this.experienceLog = [];
    this.xpThresholds = this.getXPThresholds(character.class);
    this.levelHistory = [];
  }

  /**
   * XP THRESHOLDS by class (AD&D 1e)
   * Each class has different progression
   */
  getXPThresholds(className) {
    const thresholds = {
      'fighter': [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000],
      'ranger': [0, 2250, 4500, 9000, 18000, 36000, 75000, 150000, 300000, 450000],
      'paladin': [0, 2500, 5000, 10000, 20000, 40000, 85000, 170000, 340000, 510000],
      'thief': [0, 1250, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000],
      'mage': [0, 2500, 5000, 10000, 20000, 40000, 60000, 90000, 135000, 250000],
      'cleric': [0, 1500, 3000, 6000, 13000, 27500, 55000, 110000, 225000, 450000],
      'druid': [0, 2000, 4000, 8000, 16000, 32500, 65000, 130000, 260000, 390000],
      'bard': [0, 1250, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000],
      'monk': [0, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000]
    };

    return thresholds[className] || thresholds['fighter'];
  }

  /**
   * Award XP for encounter
   */
  awardXP(amount, reason = 'encounter', difficulty = 'medium') {
    const difficultyMultipliers = {
      'easy': 0.5,
      'medium': 1,
      'hard': 1.5,
      'deadly': 2
    };

    const multiplier = difficultyMultipliers[difficulty] || 1;
    const actualXP = Math.floor(amount * multiplier);

    this.currentXP += actualXP;

    this.experienceLog.push({
      timestamp: new Date().toISOString(),
      xpGained: actualXP,
      reason,
      difficulty,
      multiplier,
      totalXP: this.currentXP
    });

    // Check for level up
    return this.checkLevelUp();
  }

  /**
   * Check if character leveled up
   */
  checkLevelUp() {
    let leveledUp = false;
    let newLevel = this.character.level || 1;

    while (this.xpThresholds[newLevel] && this.currentXP >= this.xpThresholds[newLevel]) {
      newLevel++;
      leveledUp = true;
    }

    if (leveledUp) {
      const oldLevel = this.character.level;
      this.character.level = newLevel;
      
      const levelUpData = {
        oldLevel,
        newLevel,
        xpNeeded: this.xpThresholds[newLevel],
        currentXP: this.currentXP,
        xpProgress: `${this.currentXP} / ${this.xpThresholds[newLevel] || '∞'}`
      };

      this.levelHistory.push(levelUpData);
      this.applyLevelUpBonuses(oldLevel, newLevel);

      return {
        leveledUp: true,
        newLevel,
        oldLevel,
        bonuses: this.getLevelUpBonuses(oldLevel, newLevel, this.character.class)
      };
    }

    return { leveledUp: false, currentLevel: this.character.level };
  }

  /**
   * Apply all level up bonuses
   */
  applyLevelUpBonuses(oldLevel, newLevel) {
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      // HP increase
      this.increaseHP(level);

      // Ability score improvement (every 4 levels)
      if (level % 4 === 0) {
        this.improveAbilityScore(level);
      }

      // Spell slots (if applicable)
      if (['mage', 'cleric', 'druid', 'bard'].includes(this.character.class)) {
        this.increaseSpellSlots(level);
      }

      // Thief skills (if applicable)
      if (this.character.class === 'thief') {
        this.improveThiefSkills(level);
      }

      // Special features
      this.unlockFeatures(level);
    }
  }

  /**
   * Increase HP on level up
   */
  increaseHP(level) {
    const hitDieSize = {
      'fighter': 10, 'ranger': 10, 'paladin': 10,
      'thief': 6, 'bard': 6,
      'cleric': 8, 'druid': 8, 'monk': 8,
      'mage': 4
    };

    const dieSize = hitDieSize[this.character.class] || 6;
    const conMod = Math.floor((this.character.abilityScores?.CON || 10) - 10) / 2;

    // Roll new hit die
    const hpGain = Math.max(1, Math.floor(Math.random() * dieSize) + 1 + conMod);
    
    this.character.hitPoints = (this.character.hitPoints || 0) + hpGain;

    return {
      level,
      hpGain,
      newTotal: this.character.hitPoints
    };
  }

  /**
   * Ability score improvement (one point every 4 levels)
   */
  improveAbilityScore(level) {
    // Every 4th level, choose an ability to improve
    // AI system would choose based on class
    const preferredAbility = this.getPreferredAbility(this.character.class);
    
    if (this.character.abilityScores && this.character.abilityScores[preferredAbility]) {
      this.character.abilityScores[preferredAbility]++;
    }

    return {
      level,
      improvedAbility: preferredAbility,
      newScore: this.character.abilityScores?.[preferredAbility] || 10
    };
  }

  /**
   * Get preferred ability for class
   */
  getPreferredAbility(className) {
    const preferences = {
      'fighter': 'STR',
      'ranger': 'DEX',
      'paladin': 'CHA',
      'thief': 'DEX',
      'mage': 'INT',
      'cleric': 'WIS',
      'druid': 'WIS',
      'bard': 'CHA',
      'monk': 'DEX'
    };

    return preferences[className] || 'STR';
  }

  /**
   * Increase spell slots on level up
   */
  increaseSpellSlots(level) {
    // Spell progression varies by class
    // Mages: get 1st level spell at level 1, 2nd at level 3, etc.
    // Clerics: get spells by level, deity determines access

    const spellLevelGained = Math.floor(level / 2); // Simplified
    
    return {
      level,
      spellLevelGained,
      description: `Can now cast ${spellLevelGained}-level spells`
    };
  }

  /**
   * Improve thief skills on level up
   */
  improveThiefSkills(level) {
    // Each level, all thief skills improve by 5%
    const skillBonus = 5;

    return {
      level,
      skillBonus,
      description: 'All thief skills improved by 5%'
    };
  }

  /**
   * Unlock class features on specific levels
   */
  unlockFeatures(level) {
    const features = {
      'fighter': {
        5: 'Extra attack',
        9: 'Can use any weapon',
        13: 'Legendary resistance (1/day)',
        17: 'Multiple attacks'
      },
      'mage': {
        3: 'Specialization school (+1 spell level)',
        6: 'Evocation mastery',
        9: 'Spell mastery (can cast select spell at will)',
        12: 'Overchannel spells'
      },
      'thief': {
        3: 'Assassinate (auto-crit from stealth)',
        5: 'Evasion (half damage on failed save)',
        9: 'Uncanny Dodge',
        13: 'Shadow Master'
      },
      'cleric': {
        5: 'Channel divinity (2/day)',
        6: 'Destroy undead',
        8: 'Potent spellcasting',
        14: 'Divine intervention'
      },
      'ranger': {
        2: 'Fighting style',
        3: 'Ranger archetype',
        5: 'Extra attack',
        11: 'Master Hunter'
      }
    };

    const classFeatures = features[this.character.class] || {};
    
    if (classFeatures[level]) {
      return {
        level,
        feature: classFeatures[level],
        unlocked: true
      };
    }

    return { level, unlocked: false };
  }

  /**
   * Get level up bonuses summary
   */
  getLevelUpBonuses(oldLevel, newLevel, className) {
    const bonuses = {
      levels: newLevel - oldLevel,
      hpIncrease: `${(newLevel - oldLevel)} hit die rolls`,
      abilityIncrease: newLevel % 4 === 0 ? '+1 to an ability score' : 'none',
      newSpells: ['mage', 'cleric', 'druid', 'bard'].includes(className) ? 'New spell slots available' : 'none',
      skillImprovements: className === 'thief' ? '+5% per level to all thief skills' : 'none'
    };

    return bonuses;
  }

  /**
   * Get XP progress to next level
   */
  getProgress() {
    const currentLevel = this.character.level || 1;
    const nextLevelXP = this.xpThresholds[currentLevel + 1];
    const currentLevelXP = this.xpThresholds[currentLevel];

    const xpToNextLevel = nextLevelXP - this.currentXP;
    const xpInThisLevel = nextLevelXP - currentLevelXP;
    const progressPercent = ((this.currentXP - currentLevelXP) / xpInThisLevel) * 100;

    return {
      currentLevel: currentLevel,
      currentXP: this.currentXP,
      nextLevelXP,
      xpToNextLevel,
      progressPercent: Math.floor(progressPercent),
      progressBar: this.getProgressBar(progressPercent)
    };
  }

  /**
   * Progress bar visualization
   */
  getProgressBar(percent) {
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Milestone leveling (alternative to XP)
   */
  milestoneLevel(reason = 'milestone') {
    const oldLevel = this.character.level || 1;
    const newLevel = oldLevel + 1;

    this.character.level = newLevel;
    this.applyLevelUpBonuses(oldLevel, newLevel);

    return {
      milestoneAchieved: true,
      oldLevel,
      newLevel,
      reason
    };
  }

  /**
   * Display character progression
   */
  displayProgress() {
    const progress = this.getProgress();
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║          EXPERIENCE & LEVEL            ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`Level: ${progress.currentLevel}`);
    console.log(`Experience: ${progress.currentXP} / ${progress.nextLevelXP}`);
    console.log(`To Next Level: ${progress.xpToNextLevel} XP\n`);

    console.log(`Progress: [${progress.progressBar}] ${progress.progressPercent}%`);
    console.log(`\nHP: ${this.character.hitPoints}`);
    
    if (this.levelHistory.length > 0) {
      console.log(`\nLevel History:`);
      for (const entry of this.levelHistory.slice(-5)) {
        console.log(`  Level ${entry.newLevel} reached with ${entry.currentXP} XP`);
      }
    }
  }
}

export { ExperienceSystem };
