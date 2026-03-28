#!/usr/bin/env node

/**
 * AD&D 1E RULE ENGINE
 * 
 * Handles:
 * - Attack rolls with attack bonuses
 * - Saving throws
 * - Skill checks
 * - Damage rolls (with weapon modifiers)
 * - Experience calculations
 * - Difficulty checks
 * - Randomness injection (critical hits, fumbles, lucky breaks)
 */

class ADnDRuleEngine {
  constructor() {
    this.ruleset = 'AD&D 1e';
  }

  /**
   * Roll dice: 1d20, 2d6, etc.
   */
  roll(diceString) {
    const match = diceString.match(/(\d+)d(\d+)(?:\+(\d+))?(?:-(\d+))?/);
    if (!match) return null;

    const numDice = parseInt(match[1]);
    const diceSize = parseInt(match[2]);
    const bonus = match[3] ? parseInt(match[3]) : 0;
    const penalty = match[4] ? parseInt(match[4]) : 0;

    let total = 0;
    const rolls = [];

    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * diceSize) + 1;
      rolls.push(roll);
      total += roll;
    }

    total += bonus - penalty;

    return {
      total,
      rolls,
      bonus,
      penalty,
      formula: diceString
    };
  }

  /**
   * Attack Roll
   * Roll d20 + attack bonus vs AC
   */
  attackRoll(attackBonus, targetAC) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + attackBonus;

    // Check for critical hit (natural 20) or fumble (natural 1)
    let critical = null;
    if (d20 === 20) critical = 'HIT';
    if (d20 === 1) critical = 'MISS';

    const hit = total >= targetAC;

    return {
      d20,
      total,
      targetAC,
      hit,
      critical,
      message: critical ? `${critical}! (${d20} ${attackBonus >= 0 ? '+' : ''}${attackBonus} = ${total} vs AC ${targetAC})` : 
               hit ? `HIT (${d20} ${attackBonus >= 0 ? '+' : ''}${attackBonus} = ${total} vs AC ${targetAC})` :
               `MISS (${d20} ${attackBonus >= 0 ? '+' : ''}${attackBonus} = ${total} vs AC ${targetAC})`
    };
  }

  /**
   * Saving Throw
   * Roll d20 + save bonus, must meet or exceed DC
   */
  savingThrow(character, throwType, dc = 10) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const bonus = character.saves?.[throwType] || 0;
    const total = d20 + bonus;

    const saves = {
      'paralysis': character.level ? 16 - Math.floor(character.level / 4) : 16,
      'poison': character.level ? 16 - Math.floor(character.level / 4) : 16,
      'death': character.level ? 10 + Math.floor(character.level / 2) : 10,
      'rod': character.level ? 14 - Math.floor(character.level / 4) : 14,
      'staff': character.level ? 14 - Math.floor(character.level / 4) : 14,
      'wand': character.level ? 14 - Math.floor(character.level / 4) : 14,
      'breathweapon': character.level ? 16 - Math.floor(character.level / 4) : 16,
      'spell': character.level ? 11 + Math.floor(character.level / 2) : 11
    };

    const saveDC = saves[throwType] || dc;
    const success = total >= saveDC;

    return {
      d20,
      bonus,
      total,
      saveDC,
      success,
      throwType,
      message: success ? `SAVED vs ${throwType}! (${d20} ${bonus >= 0 ? '+' : ''}${bonus} = ${total} vs DC ${saveDC})` :
               `FAILED vs ${throwType} (${d20} ${bonus >= 0 ? '+' : ''}${bonus} = ${total} vs DC ${saveDC})`
    };
  }

  /**
   * Damage Roll
   * Roll damage dice + modifier (for weapons, spells, etc.)
   */
  damageRoll(damageFormula, modifier = 0) {
    const roll = this.roll(damageFormula);
    const totalDamage = roll.total + modifier;

    // Check for critical damage (multiply on natural 20)
    let isCritical = false;
    if (roll.rolls.some(r => r === roll.diceSize)) {
      isCritical = true;
    }

    return {
      ...roll,
      modifier,
      totalDamage,
      isCritical,
      message: isCritical ? `CRITICAL DAMAGE: ${totalDamage} (${roll.rolls.join('+')} ${modifier >= 0 ? '+' : ''}${modifier})` :
               `Damage: ${totalDamage} (${roll.rolls.join('+')} ${modifier >= 0 ? '+' : ''}${modifier})`
    };
  }

  /**
   * Skill Check
   * Roll d20 + skill bonus vs DC
   */
  skillCheck(skillBonus, dc = 10) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + skillBonus;

    const success = total >= dc;
    const margin = Math.abs(total - dc);

    return {
      d20,
      skillBonus,
      total,
      dc,
      success,
      margin,
      message: success ? `SUCCESS by ${margin} (${d20} ${skillBonus >= 0 ? '+' : ''}${skillBonus} = ${total} vs DC ${dc})` :
               `FAILURE by ${margin} (${d20} ${skillBonus >= 0 ? '+' : ''}${skillBonus} = ${total} vs DC ${dc})`
    };
  }

  /**
   * Experience Calculation
   * Award XP based on encounter difficulty and party level
   */
  calculateExperience(monsterXP, partySize, partyAverageLevel, encounterDifficulty = 'medium') {
    let baseXP = monsterXP;

    // Adjust for difficulty
    const difficultyMultipliers = {
      'easy': 0.5,
      'medium': 1,
      'hard': 1.5,
      'deadly': 2
    };

    baseXP *= difficultyMultipliers[encounterDifficulty] || 1;

    // Adjust for party size
    const xpPerCharacter = Math.floor(baseXP / partySize);

    // Adjust for level (higher level parties get less XP from lower level creatures)
    const levelAdjustment = Math.max(0.1, 1 - ((partyAverageLevel - 5) * 0.05));
    const adjustedXP = Math.floor(xpPerCharacter * levelAdjustment);

    return {
      totalXP: adjustedXP * partySize,
      xpPerCharacter: adjustedXP,
      difficulty: encounterDifficulty,
      breakdown: {
        baseMonsterXP: monsterXP,
        difficultyMultiplier: difficultyMultipliers[encounterDifficulty] || 1,
        partySize,
        levelAdjustment: levelAdjustment.toFixed(2)
      }
    };
  }

  /**
   * Initiative Roll
   * Roll d20 + dex modifier
   */
  initiativeRoll(dexterity) {
    const dexMod = Math.floor((dexterity - 10) / 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + dexMod;

    return {
      d20,
      dexMod,
      total,
      message: `Initiative: ${d20} ${dexMod >= 0 ? '+' : ''}${dexMod} = ${total}`
    };
  }

  /**
   * RANDOMNESS INJECTION
   * Events that can happen to spice things up
   */
  randomEvent(partyLevel) {
    const randomEvents = [
      {
        name: 'Lucky Break',
        description: 'A critical hit when you needed it most',
        effect: 'Next attack roll gets +5',
        probability: 0.1
      },
      {
        name: 'Armor Break',
        description: 'Your armor cracks under the impact',
        effect: 'AC worsens by 2 until repaired',
        probability: 0.05
      },
      {
        name: 'Weapon Break',
        description: 'Your weapon shatters',
        effect: 'Must find a new weapon',
        probability: 0.05
      },
      {
        name: 'Wandering Monster',
        description: 'Unexpected enemy appears',
        effect: 'New combat encounter',
        probability: 0.15
      },
      {
        name: 'Treasure Find',
        description: 'Hidden treasure discovered',
        effect: '+200 GP, random item',
        probability: 0.1
      },
      {
        name: 'Trap Triggered',
        description: 'You accidentally trigger a trap',
        effect: 'Take 1d6 damage, DEX save DC 12',
        probability: 0.2
      },
      {
        name: 'Mysterious Visitor',
        description: 'An NPC appears with information',
        effect: 'Learn about a plot hook',
        probability: 0.08
      },
      {
        name: 'Magical Surge',
        description: 'Wild magic erupts',
        effect: 'Random spell effect in 20ft radius',
        probability: 0.05
      }
    ];

    // Select event based on probability
    let selectedEvent = null;
    for (const event of randomEvents) {
      if (Math.random() < event.probability) {
        selectedEvent = event;
        break;
      }
    }

    return selectedEvent;
  }

  /**
   * Check for critical hit or fumble
   */
  checkCritical(d20Roll) {
    if (d20Roll === 20) return { type: 'CRITICAL HIT', effect: 'Double damage' };
    if (d20Roll === 1) return { type: 'FUMBLE', effect: 'Drop weapon or fall prone' };
    return null;
  }

  /**
   * Morale Check
   * Monster morale (should they flee?)
   */
  moraleCheck(monsterMorale) {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalMonale = d20 + monsterMorale;

    const flees = totalMonale < 10;

    return {
      d20,
      monsterMorale,
      total: totalMonale,
      flees,
      message: flees ? `Monster morale BROKEN! They flee (${d20} + ${monsterMorale} = ${totalMonale} < 10)` :
               `Monster stands and fights (${d20} + ${monsterMorale} = ${totalMonale} >= 10)`
    };
  }
}

export { ADnDRuleEngine };
