#!/usr/bin/env node

/**
 * ROLL ARBITRATION ENGINE
 * 
 * The most important decision in D&D:
 * WHEN to roll vs. when to auto-succeed vs. when to auto-fail
 * 
 * Core principle: Every roll must be MEANINGFUL
 * - Outcome is truly uncertain
 * - Consequences matter narratively
 * - No rolls for automatic competence (tying shoes at level 10)
 * - No rolls when outcome is predetermined
 */

class RollArbitrationEngine {
  constructor() {
    this.rollDecisions = [];
    this.competenceThresholds = {};
  }

  /**
   * DECIDE: Should we roll?
   * 
   * This is the gate that separates drama from tedium
   */
  arbitrateRoll(context) {
    const decision = {
      action: context.action,
      character: context.character,
      difficulty: context.difficulty || 'unknown',
      shouldRoll: null,
      reasoning: '',
      alternatives: []
    };

    // RULE 1: AUTO-SUCCESS for routine tasks at appropriate level
    if (this.isRoutineForLevel(context)) {
      decision.shouldRoll = false;
      decision.reasoning = 'AUTO-SUCCESS: This character is too skilled for this task to challenge them.';
      decision.example = 'Level 10 wizard doesn\'t roll to tie their shoes. They just tie them.';
      return decision;
    }

    // RULE 2: AUTO-FAILURE when fiction makes it impossible
    if (this.isImpossible(context)) {
      decision.shouldRoll = false;
      decision.reasoning = 'AUTO-FAILURE: The fiction makes this impossible.';
      decision.example = 'You can\'t negotiate with a mindless undead horde. They don\'t negotiate.';
      return decision;
    }

    // RULE 3: AUTO-SUCCESS when stakes are trivial AND time isn't pressing
    if (this.isTrivial(context) && !this.isTimePressure(context)) {
      decision.shouldRoll = false;
      decision.reasoning = 'AUTO-SUCCESS: No meaningful stakes. You just do it.';
      decision.example = 'Finding a tavern in a city? You find it. Not a check.';
      return decision;
    }

    // RULE 4: ROLL when outcome is UNCERTAIN and CONSEQUENTIAL
    if (this.isUncertain(context) && this.isConsequential(context)) {
      decision.shouldRoll = true;
      decision.reasoning = 'ROLL: Outcome is genuinely uncertain AND narratively meaningful.';
      return decision;
    }

    // RULE 5: PARTIAL CREDIT (roll with advantage/disadvantage)
    if (this.hasPreparation(context) || this.hasIntelligence(context)) {
      decision.shouldRoll = true;
      decision.advantage = true;
      decision.reasoning = 'ROLL WITH ADVANTAGE: Character prepared or gathered intelligence.';
      return decision;
    }

    // DEFAULT: If truly uncertain, roll
    if (this.isUncertain(context)) {
      decision.shouldRoll = true;
      decision.reasoning = 'ROLL: Outcome is uncertain.';
      return decision;
    }

    // DEFAULT: If stakes matter, roll
    if (this.isConsequential(context)) {
      decision.shouldRoll = true;
      decision.reasoning = 'ROLL: Consequences matter.';
      return decision;
    }

    // CONSERVATIVE: No roll
    decision.shouldRoll = false;
    decision.reasoning = 'NO ROLL: Outcome is certain or stakes are trivial.';
    return decision;
  }

  /**
   * Is this ROUTINE for character's level?
   * 
   * Core insight: A level 10 character shouldn't roll to climb
   * a ladder. They're too skilled.
   */
  isRoutineForLevel(context) {
    const { character, action, difficulty } = context;
    if (!character.level) return false;

    // Difficulty DC vs character level
    // At level X, DC < (10 + X/2) is routine
    const routineDC = 10 + (character.level / 2);

    if (difficulty === 'routine' || difficulty === 'trivial') {
      return true;
    }

    const parsedDC = this.parseDifficulty(difficulty);
    if (parsedDC < routineDC) {
      return true;
    }

    return false;
  }

  /**
   * Is this IMPOSSIBLE?
   */
  isImpossible(context) {
    const { character, action, target, constraints = [] } = context;

    // Can't negotiate with mindless creatures
    if (constraints.includes('mindless') && action.includes('negotiate')) {
      return true;
    }

    // Can't cast spells while silenced (without workaround)
    if (constraints.includes('silenced') && action.includes('cast') && !action.includes('silent')) {
      return true;
    }

    // Can't see in absolute darkness (without darkvision)
    if (constraints.includes('absolute_darkness') && !character.darkvision) {
      return true;
    }

    return false;
  }

  /**
   * Is this TRIVIAL?
   * 
   * No stakes, no consequence
   */
  isTrivial(context) {
    const { stakes = null, consequence = null } = context;

    if (!stakes && !consequence) {
      return true;
    }

    if (stakes === 'none' || consequence === 'none') {
      return true;
    }

    return false;
  }

  /**
   * Is this UNCERTAIN?
   */
  isUncertain(context) {
    const { character, difficulty, bonuses = 0 } = context;

    const roll20 = 20; // Assume best case
    const modifier = this.getModifier(character);
    const total = roll20 + modifier + bonuses;

    const dc = this.parseDifficulty(difficulty);

    // Uncertain if even with best roll, success isn't guaranteed
    // AND with worst roll, failure is possible
    if (total >= dc + 5) {
      // Even worst case has good chance
      return false;
    }

    if (total < dc - 5) {
      // Even best case has bad chance
      return false;
    }

    return true;
  }

  /**
   * Is this CONSEQUENTIAL?
   * 
   * Does failure matter? Does success open doors?
   */
  isConsequential(context) {
    const { consequence, stakes, narrative_weight } = context;

    // Explicit consequence
    if (consequence && consequence !== 'none') {
      return true;
    }

    // Explicit stakes
    if (stakes && stakes !== 'none') {
      return true;
    }

    // Changes story direction
    if (narrative_weight === 'high') {
      return true;
    }

    // Opens new story threads
    if (context.opens_new_paths) {
      return true;
    }

    return false;
  }

  /**
   * Does character have preparation?
   */
  hasPreparation(context) {
    const { preparation = [] } = context;

    if (preparation.length > 0) {
      return true;
    }

    if (context.action.includes('prepared')) {
      return true;
    }

    return false;
  }

  /**
   * Does character have intelligence?
   */
  hasIntelligence(context) {
    const { intel = [] } = context;

    if (intel.length > 0) {
      return true;
    }

    if (context.action.includes('knew')) {
      return true;
    }

    return false;
  }

  /**
   * Is there time pressure?
   */
  isTimePressure(context) {
    const { time_limit = null, rounds_remaining = null } = context;

    if (time_limit || rounds_remaining) {
      return true;
    }

    return false;
  }

  /**
   * Helper: Parse difficulty to DC
   */
  parseDifficulty(difficulty) {
    const dcMap = {
      'trivial': 5,
      'routine': 8,
      'easy': 10,
      'moderate': 12,
      'challenging': 15,
      'hard': 16,
      'nearly_impossible': 20,
      'impossible': 25
    };

    if (typeof difficulty === 'number') {
      return difficulty;
    }

    return dcMap[difficulty] || 12;
  }

  /**
   * Helper: Get character modifier
   */
  getModifier(character) {
    const { abilities = {} } = character;

    // Use strongest relevant ability
    const abilities_list = Object.values(abilities || {});
    if (abilities_list.length === 0) return 0;

    const max = Math.max(...abilities_list);
    return Math.floor((max - 10) / 2);
  }

  /**
   * COMMUNICATE THE DECISION
   * 
   * How do we explain why we're/aren't rolling?
   */
  communicateDecision(decision) {
    if (decision.shouldRoll) {
      return `Roll a d20 + modifier. DC ${decision.difficulty}. ${decision.reasoning}`;
    } else {
      return decision.reasoning;
    }
  }
}

export { RollArbitrationEngine };
