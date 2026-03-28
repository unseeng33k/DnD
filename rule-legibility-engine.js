#!/usr/bin/env node

/**
 * RULE LEGIBILITY ENGINE
 * 
 * The engine uses CONSISTENT LANGUAGE and explains WHY things happen
 * in plain speech, not jargon.
 * 
 * Players learn the system through experience, not manuals.
 */

class RuleLegibilityEngine {
  constructor() {
    this.ruleGlossary = {};
    this.explanationPatterns = {};
    this.consistentTerms = {};
  }

  /**
   * BUILD CONSISTENT LANGUAGE GLOSSARY
   * 
   * Every term used exactly the same way, always
   */
  buildGlossary() {
    return {
      'check': {
        definition: 'd20 roll + ability modifier vs. a target number (DC)',
        shortForm: 'roll d20 + modifier, compare to DC',
        examples: [
          'Stealth check to sneak past guard',
          'Persuasion check to convince NPC',
          'Strength check to break door'
        ]
      },

      'advantage': {
        definition: 'Roll twice, use the better result',
        shortForm: 'Roll twice, take the higher roll',
        examples: [
          'You have advantage because you scouted first',
          'Advantage on this save because you prepared'
        ]
      },

      'disadvantage': {
        definition: 'Roll twice, use the worse result',
        shortForm: 'Roll twice, take the lower roll',
        examples: [
          'You have disadvantage because you\'re panicked',
          'Disadvantage on this check because you didn\'t prepare'
        ]
      },

      'DC': {
        definition: 'Difficulty Class. The target number you\'re trying to meet or beat.',
        shortForm: 'Target number (higher = harder)',
        scale: {
          '5': 'Trivial',
          '8': 'Routine',
          '10': 'Easy',
          '12': 'Moderate',
          '15': 'Challenging',
          '18': 'Hard',
          '20': 'Very hard'
        }
      },

      'critical success': {
        definition: 'Nat 20 on d20 roll',
        shortForm: 'Natural 20 (automatic success + bonus)',
        examples: [
          'You rolled a natural 20. Not only do you succeed—you succeed SPECTACULARLY',
          'Nat 20 on negotiation = not just agreement, they become your ally'
        ]
      },

      'critical failure': {
        definition: 'Nat 1 on d20 roll',
        shortForm: 'Natural 1 (failure + complication)',
        examples: [
          'You rolled a 1. You fail, AND something unexpected happens',
          'Nat 1 on stealth = you\'re spotted, but have 2 rounds before alarm sounds'
        ]
      },

      'save': {
        definition: 'Roll to resist or avoid an effect',
        shortForm: 'd20 + save modifier vs. enemy DC',
        examples: [
          'Constitution save against poison',
          'Wisdom save against mind control'
        ]
      }
    };
  }

  /**
   * EXPLAIN OUTCOMES IN PLAIN SPEECH
   * 
   * Not: "You roll 7. 7 + 2 = 9. DC 15. Miss."
   * But: "You roll 7 + 2 = 9 vs. DC 15. You needed a higher number. Your strike goes wide."
   */
  explainOutcome(context) {
    const { roll, modifier, dc, action, success } = context;

    const explanation = {
      result: success ? 'SUCCESS' : 'FAILURE',
      math: `${roll} + ${modifier} = ${roll + modifier} vs. DC ${dc}`,
      narrative: ''
    };

    if (success) {
      explanation.narrative = `You roll ${roll}. With your +${modifier}, that's ${roll + modifier}. You needed ${dc}. You made it. ${this.generateSuccessNarrative(action)}`;
    } else {
      const margin = dc - (roll + modifier);
      explanation.narrative = `You roll ${roll}. With your +${modifier}, that's ${roll + modifier}. You needed ${dc}. You're short by ${margin}. ${this.generateFailureNarrative(action, margin)}`;
    }

    explanation.whyItHappened = this.explainWhyThisHappened(context);

    return explanation;
  }

  /**
   * Generate success narrative
   */
  generateSuccessNarrative(action) {
    const narratives = {
      'attack': 'Your strike finds its mark. Damage.',
      'stealth': 'You slip past unseen.',
      'persuasion': 'They listen. Your words have weight.',
      'save': 'You resist the effect.',
      'default': 'You succeed.'
    };

    return narratives[action] || narratives['default'];
  }

  /**
   * Generate failure narrative
   */
  generateFailureNarrative(action, margin) {
    if (margin <= 2) {
      return 'Close call. Almost made it.';
    } else if (margin <= 5) {
      return 'Clear failure. Something goes wrong.';
    } else {
      return 'Spectacularly failed. Things escalate.';
    }
  }

  /**
   * EXPLAIN WHY THIS HAPPENED
   * 
   * What factors affected this outcome?
   */
  explainWhyThisHappened(context) {
    const { character, preparation, intel, position, conditions = [] } = context;

    const factors = [];

    if (character.ability && character.modifier > 0) {
      factors.push(`Your ${character.ability} helped (+${character.modifier})`);
    }

    if (preparation) {
      factors.push('You prepared, which helped');
    }

    if (intel) {
      factors.push('You had intelligence advantage');
    }

    if (position === 'advantageous') {
      factors.push('Your position was strong');
    }

    if (conditions.includes('disadvantage')) {
      factors.push('You were at a disadvantage');
    }

    if (factors.length === 0) {
      return 'Just the roll. Luck played the biggest part.';
    }

    return factors.join('. ') + '.';
  }

  /**
   * TEACH THE SYSTEM THROUGH EXPERIENCE
   * 
   * Show patterns, let players learn
   */
  teachPattern(patternName, examples) {
    const patterns = {
      'when_you_prepare': {
        name: 'When you prepare, you get advantage',
        pattern: 'If you scout → scouting bonus on next action',
        learningMoments: [
          'You scouted the area. That gives you advantage on this check.',
          'Because you knew the guard\'s patrol route, you have advantage.',
          'Your preparation paid off. Advantage on the roll.'
        ]
      },

      'failure_creates_complications': {
        name: 'Failure doesn\'t stop the story—it complicates it',
        pattern: 'If you fail → interesting problem, not dead end',
        learningMoments: [
          'You failed the stealth check. You\'re spotted, but have 2 rounds before reinforcements.',
          'Your negotiation failed. They\'re not friendly now, but you learned something.',
          'You fell. You took damage, but you\'re not dead.'
        ]
      },

      'success_can_do_more': {
        name: 'Exceptional success opens new threads',
        pattern: 'If you roll well → better outcome than expected',
        learningMoments: [
          'You rolled high on persuasion. Not only does he agree—he becomes your ally.',
          'Excellent roll on stealth. You slip past AND overhear their plans.',
          'Great roll on investigation. You find the secret AND a new lead.'
        ]
      },

      'nat_20_is_special': {
        name: 'Natural 20 is a special event, not just success',
        pattern: 'Nat 20 → automatic success + something extra',
        learningMoments: [
          'Nat 20! You don\'t just survive—you thrive.',
          'Natural 20 on negotiation! You turned enemies into allies.',
          'Nat 20! Not only do you escape—you confuse them completely.'
        ]
      }
    };

    return patterns[patternName] || null;
  }

  /**
   * SURFACE "WHY THIS RULE" when introducing mechanics
   * 
   * Players accept rules better when they understand the WHY
   */
  explainRuleDesign(ruleName) {
    const designReasons = {
      'advantage/disadvantage': {
        rule: 'Advantage when you prepare, disadvantage when reckless',
        why: 'This rewards smart play. Prep matters. Rushing has consequences.',
        feel: 'Your decisions change the odds. You\'re in control.'
      },

      'nat_1_complication': {
        rule: 'Nat 1 creates complication, not instant failure',
        why: 'Otherwise failures feel bad. This way, failures are interesting.',
        feel: 'Failure doesn\'t end the story. It starts a new chapter.'
      },

      'DC_communication': {
        rule: 'We tell you the DC before you roll',
        why: 'You can make informed choices. You know the risk.',
        feel: 'You own your decision. You\'re not gambling blind.'
      },

      'rolls_are_sparse': {
        rule: 'We only roll when it matters',
        why: 'Each roll is a moment of real tension, not background noise.',
        feel: 'When we roll, it MEANS something. Every roll matters.'
      }
    };

    return designReasons[ruleName] || null;
  }
}

export { RuleLegibilityEngine };
