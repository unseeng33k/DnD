#!/usr/bin/env node

/**
 * SKILL & DEXTERITY SYSTEM
 * 
 * AD&D 1e skills:
 * - Thief skills (percentile-based)
 * - Climbing, swimming, jumping
 * - DEX checks for dodge, balance, acrobatics
 * - Saving throws by category
 * - Ability checks (STR, DEX, CON, INT, WIS, CHA)
 */

class SkillSystem {
  constructor(character) {
    this.character = character;
    this.skills = this.initializeSkills();
    this.skillExperience = {};
  }

  /**
   * Initialize skill list based on class
   */
  initializeSkills() {
    const baseSkills = {
      // Physical skills (DEX-based)
      'balance': { ability: 'DEX', difficulty: 12, description: 'Walk narrow surface' },
      'climb': { ability: 'STR', difficulty: 10, description: 'Climb walls/ropes' },
      'swim': { ability: 'STR', difficulty: 11, description: 'Swim in water' },
      'jump': { ability: 'DEX', difficulty: 12, description: 'Leap distance' },
      'acrobatics': { ability: 'DEX', difficulty: 13, description: 'Perform flips/rolls' },
      'dodge': { ability: 'DEX', difficulty: 11, description: 'Avoid incoming attack' },
      'ride': { ability: 'DEX', difficulty: 10, description: 'Ride a mount' },
      'stealth': { ability: 'DEX', difficulty: 12, description: 'Move silently' },

      // Combat skills
      'parry': { ability: 'DEX', difficulty: 11, description: 'Block with weapon' },
      'attack': { ability: 'STR', difficulty: 10, description: 'Melee attack' },
      'aim': { ability: 'DEX', difficulty: 11, description: 'Ranged attack accuracy' },

      // Knowledge skills
      'knowledge_religion': { ability: 'INT', difficulty: 12, description: 'Religious lore' },
      'knowledge_nature': { ability: 'INT', difficulty: 11, description: 'Natural world' },
      'knowledge_history': { ability: 'INT', difficulty: 12, description: 'Historical events' },
      'knowledge_local': { ability: 'INT', difficulty: 10, description: 'Local customs' },

      // Social skills
      'persuasion': { ability: 'CHA', difficulty: 12, description: 'Convince someone' },
      'deception': { ability: 'CHA', difficulty: 12, description: 'Lie convincingly' },
      'intimidation': { ability: 'CHA', difficulty: 11, description: 'Threaten/scare' },
      'performance': { ability: 'CHA', difficulty: 11, description: 'Sing/dance/entertain' }
    };

    // Add thief skills if applicable
    if (this.character.class === 'thief' || this.character.class === 'bard') {
      baseSkills['pick_locks'] = { ability: 'DEX', difficulty: 12, description: 'Open locks', percentile: true };
      baseSkills['pick_pockets'] = { ability: 'DEX', difficulty: 13, description: 'Steal items', percentile: true };
      baseSkills['find_traps'] = { ability: 'DEX', difficulty: 12, description: 'Detect traps', percentile: true };
      baseSkills['disable_traps'] = { ability: 'DEX', difficulty: 14, description: 'Disarm traps', percentile: true };
      baseSkills['hide'] = { ability: 'DEX', difficulty: 12, description: 'Conceal self', percentile: true };
      baseSkills['listen'] = { ability: 'WIS', difficulty: 11, description: 'Hear sounds', percentile: true };
      baseSkills['backstab'] = { ability: 'DEX', difficulty: 11, description: 'Surprise attack', percentile: true };
    }

    return baseSkills;
  }

  /**
   * Attempt a skill check
   */
  skillCheck(skillName, difficulty = null, advantage = false, disadvantage = false) {
    const skill = this.skills[skillName.toLowerCase()];
    
    if (!skill) {
      return { success: false, message: `Unknown skill: ${skillName}` };
    }

    const ability = skill.ability;
    const abilityScore = this.character.abilityScores?.[ability] || 10;
    const modifier = Math.floor((abilityScore - 10) / 2);
    const dc = difficulty || skill.difficulty;

    let d20 = Math.floor(Math.random() * 20) + 1;

    // Handle advantage/disadvantage
    if (advantage) {
      const d20_2 = Math.floor(Math.random() * 20) + 1;
      d20 = Math.max(d20, d20_2);
    } else if (disadvantage) {
      const d20_2 = Math.floor(Math.random() * 20) + 1;
      d20 = Math.min(d20, d20_2);
    }

    const total = d20 + modifier;
    const success = total >= dc;
    const margin = Math.abs(total - dc);

    // Special: thief skills are percentile-based
    if (skill.percentile) {
      const thieveryBonus = this.character.level ? (this.character.level * 5) : 5;
      const percentileCheck = Math.floor(Math.random() * 100) + 1;
      const thiefTotal = percentileCheck + thieveryBonus;
      const thiefSuccess = thiefTotal <= 90; // Max 90%

      return {
        success: thiefSuccess,
        skillType: 'percentile',
        skill: skillName,
        roll: percentileCheck,
        bonus: thieveryBonus,
        total: thiefTotal,
        dc: 90,
        margin,
        message: thiefSuccess ? `SUCCESS! ${skillName}` : `FAILED ${skillName}`
      };
    }

    return {
      success,
      skill: skillName,
      ability,
      abilityScore,
      modifier: modifier >= 0 ? `+${modifier}` : `${modifier}`,
      d20,
      total,
      dc,
      margin,
      advantage: advantage ? 'yes' : 'no',
      disadvantage: disadvantage ? 'yes' : 'no',
      message: success ? `SUCCESS by ${margin}! (${d20} ${modifier >= 0 ? '+' : ''}${modifier} = ${total} vs DC ${dc})` :
               `FAILURE by ${margin} (${d20} ${modifier >= 0 ? '+' : ''}${modifier} = ${total} vs DC ${dc})`
    };
  }

  /**
   * DEX CHECK (dodge, balance, acrobatics)
   */
  dexCheck(checkType, difficulty = 12) {
    const dexScore = this.character.abilityScores?.DEX || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + dexMod;
    const success = total >= difficulty;

    return {
      checkType,
      dexScore,
      dexMod: dexMod >= 0 ? `+${dexMod}` : `${dexMod}`,
      d20,
      total,
      difficulty,
      success,
      message: success ? `DODGE SUCCESS! ${d20} ${dexMod >= 0 ? '+' : ''}${dexMod} = ${total} vs DC ${difficulty}` :
               `DODGE FAILED ${d20} ${dexMod >= 0 ? '+' : ''}${dexMod} = ${total} vs DC ${difficulty}`
    };
  }

  /**
   * STRENGTH CHECK (climb, swim, jump)
   */
  strengthCheck(checkType, difficulty = 12) {
    const strScore = this.character.abilityScores?.STR || 10;
    const strMod = Math.floor((strScore - 10) / 2);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + strMod;
    const success = total >= difficulty;

    // Special: Calculate jump distance
    let jumpDistance = 0;
    if (checkType.toLowerCase() === 'jump' && success) {
      jumpDistance = strMod * 3 + 3; // Base 3 feet + STR modifier * 3
    }

    return {
      checkType,
      strScore,
      strMod: strMod >= 0 ? `+${strMod}` : `${strMod}`,
      d20,
      total,
      difficulty,
      success,
      jumpDistance: jumpDistance > 0 ? `${jumpDistance} feet` : null,
      message: success ? `SUCCESS! (${d20} ${strMod >= 0 ? '+' : ''}${strMod} = ${total} vs DC ${difficulty})` :
               `FAILED (${d20} ${strMod >= 0 ? '+' : ''}${strMod} = ${total} vs DC ${difficulty})`
    };
  }

  /**
   * ABILITY CHECK (any ability)
   */
  abilityCheck(ability, difficulty = 10) {
    const score = this.character.abilityScores?.[ability.toUpperCase()] || 10;
    const modifier = Math.floor((score - 10) / 2);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;
    const success = total >= difficulty;

    return {
      ability: ability.toUpperCase(),
      score,
      modifier: modifier >= 0 ? `+${modifier}` : `${modifier}`,
      d20,
      total,
      difficulty,
      success,
      message: success ? `SUCCESS (${d20} ${modifier >= 0 ? '+' : ''}${modifier} = ${total} vs DC ${difficulty})` :
               `FAILED (${d20} ${modifier >= 0 ? '+' : ''}${modifier} = ${total} vs DC ${difficulty})`
    };
  }

  /**
   * THIEF SKILL (percentile-based)
   * 
   * Chance = (Base % + Bonuses) - Penalties
   * Base varies by skill: 15% for open locks, 20% for pick pockets, etc.
   */
  thiefSkill(skillName, baseChance = 15, bonuses = 0, penalties = 0) {
    const level = this.character.level || 1;
    const levelBonus = level * 5; // +5% per level
    const chance = Math.min(100, baseChance + levelBonus + bonuses - penalties);

    const roll = Math.floor(Math.random() * 100) + 1;
    const success = roll <= chance;

    return {
      skill: skillName,
      baseChance,
      levelBonus,
      bonuses,
      penalties,
      totalChance: chance,
      roll,
      success,
      message: success ? `SUCCESS! (${roll} <= ${chance}%)` : `FAILED (${roll} > ${chance}%)`
    };
  }

  /**
   * List all available skills
   */
  listSkills() {
    console.log('\n📚 AVAILABLE SKILLS:\n');
    
    const byAbility = {};
    
    for (const [name, skill] of Object.entries(this.skills)) {
      const ability = skill.ability;
      if (!byAbility[ability]) {
        byAbility[ability] = [];
      }
      byAbility[ability].push({ name, ...skill });
    }

    for (const [ability, skills] of Object.entries(byAbility)) {
      const abilityScore = this.character.abilityScores?.[ability] || 10;
      const modifier = Math.floor((abilityScore - 10) / 2);
      console.log(`${ability} (${abilityScore}, ${modifier >= 0 ? '+' : ''}${modifier}):`);
      
      for (const skill of skills) {
        const percentile = skill.percentile ? ' [PERCENTILE]' : '';
        console.log(`  • ${skill.name.padEnd(20)} DC ${skill.difficulty}${percentile} - ${skill.description}`);
      }
      console.log('');
    }
  }

  /**
   * Passive skill check (no roll, just modifier)
   */
  passiveSkillCheck(skillName) {
    const skill = this.skills[skillName.toLowerCase()];
    if (!skill) return null;

    const ability = skill.ability;
    const abilityScore = this.character.abilityScores?.[ability] || 10;
    const modifier = Math.floor((abilityScore - 10) / 2);

    // Passive score = 10 + modifier
    const passiveScore = 10 + modifier;

    return {
      skill: skillName,
      ability,
      abilityScore,
      modifier,
      passiveScore,
      description: `Passive ${skillName}: ${passiveScore}`
    };
  }
}

export { SkillSystem };
