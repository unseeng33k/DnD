#!/usr/bin/env node

/**
 * COGNITIVE LOAD ROUTER
 * 
 * Decide what information to show, what to hide, how to phrase it
 * so even a tired parent at 10:30pm feels clever, not overwhelmed.
 * 
 * Core principle: Collapse complex math into simple, repeatable patterns
 */

class CognitiveLoadRouter {
  constructor() {
    this.infoLayers = {
      'surface': [], // What player sees immediately
      'detail': [], // Drill-down info if they ask
      'hidden': [] // Behind-the-scenes math
    };
  }

  /**
   * COLLAPSE COMPLEX MATH INTO SIMPLE PATTERNS
   * 
   * Not: "You roll 17. With your +2 STR and +1 proficiency = 20. DC 18. Success!"
   * But: "Your strength helps here. With your skill, you're favored. Roll the dice."
   */
  simplifyDecision(complexity) {
    const patterns = {
      'advantage': {
        surface: 'You\'re in a strong position. Good odds. Roll twice, use the better.',
        detail: 'Your preparation / position / intelligence gives you advantage.',
        why: 'When you set things up right, luck favors you.'
      },

      'standard_check': {
        surface: 'Roll the dice. Try to hit this target number.',
        detail: 'Roll d20 + your relevant ability + any bonuses.',
        why: 'Standard risk. Could go either way.'
      },

      'disadvantage': {
        surface: 'You\'re outmatched. Bad odds. Roll twice, use the worse.',
        detail: 'You\'re unprepared / exposed / at a disadvantage.',
        why: 'Rushing without setup carries risk.'
      }
    };

    return patterns[complexity] || patterns['standard_check'];
  }

  /**
   * PRESENT INFORMATION IN ORDER OF URGENCY
   * 
   * What matters most? Show that first.
   * Show supporting details only if asked.
   */
  prioritizeInfo(context) {
    const priority = [];

    // TIER 1: What can I do RIGHT NOW?
    priority.push({
      tier: 1,
      urgency: 'IMMEDIATE',
      info: 'What would you like to do?',
      show: true
    });

    // TIER 2: What's the risk?
    priority.push({
      tier: 2,
      urgency: 'HIGH',
      info: `This is ${context.dangerLevel}. Consequences: ${context.consequence}`,
      show: true
    });

    // TIER 3: What affects odds?
    priority.push({
      tier: 3,
      urgency: 'MEDIUM',
      info: `Your ${context.strength} helps. You have ${context.preparation ? 'advantage' : 'standard odds'}.`,
      show: context.wantDetail
    });

    // TIER 4: Detailed mechanics
    priority.push({
      tier: 4,
      urgency: 'LOW',
      info: `You roll d20 + ${context.modifier}. Target DC ${context.dc}.`,
      show: context.wantDeepDive
    });

    // TIER 5: Behind-the-scenes
    priority.push({
      tier: 5,
      urgency: 'MINIMAL',
      info: `Base DC ${context.baseDC}, +${context.dcModifier} from circumstances, -${context.dcReduction} for prep`,
      show: false // Never show unless explicitly asked
    });

    return priority.filter(p => p.show);
  }

  /**
   * SHORT + STRONG DEFAULTS for common actions
   * 
   * Make common actions trivial to understand
   * Let power players dig deeper if they want
   */
  provideDefaults(actionType) {
    const defaults = {
      'attack': {
        shortForm: 'Attack. Roll d20. Add your damage bonus if you hit.',
        ifWantMore: 'What kind of attack? Melee vs. ranged changes the bonus.',
        ifWantDeep: 'Base d20 + STR/DEX mod + proficiency. Compare to enemy AC.'
      },

      'cast_spell': {
        shortForm: 'Cast it. Does the target resist? If yes, they make a save.',
        ifWantMore: 'What\'s the spell? Some have higher save DCs than others.',
        ifWantDeep: 'Your save DC = 8 + spell ability mod + proficiency.'
      },

      'stealth': {
        shortForm: 'Sneak. Try to avoid being noticed.',
        ifWantMore: 'Any special preparation? Darkness helps, open ground doesn\'t.',
        ifWantDeep: 'Roll d20 + DEX mod vs. enemy passive Perception.'
      },

      'persuade': {
        shortForm: 'Make your case. They listen or they don\'t.',
        ifWantMore: 'What are you saying? That changes the odds.',
        ifWantDeep: 'Roll d20 + CHA mod vs. DC (depends on NPC disposition).'
      }
    };

    return defaults[actionType] || null;
  }

  /**
   * EXPLANATORY MICROCOPY after rolls
   * 
   * Give feedback that's clear AND conversational
   */
  generateMicrocopy(rollResult) {
    const { roll, modifier, dc, success, margin } = rollResult;

    let microcopy = '';

    if (success) {
      if (margin > 5) {
        microcopy = `You rolled ${roll}. Great! With your +${modifier}, that's ${roll + modifier}. You crushed it.`;
      } else if (margin > 0) {
        microcopy = `You rolled ${roll}. With your +${modifier}, that's ${roll + modifier}. You made it.`;
      }
    } else {
      if (margin > -3) {
        microcopy = `You rolled ${roll}. With your +${modifier}, that's ${roll + modifier}. Close, but not quite. You needed ${dc}.`;
      } else if (margin > -6) {
        microcopy = `You rolled ${roll}. That's ${roll + modifier} with your bonus. You needed ${dc}. You fell short.`;
      } else {
        microcopy = `You rolled ${roll}. Even with your +${modifier}, that's only ${roll + modifier}. You needed ${dc}. Not close.`;
      }
    }

    return microcopy;
  }

  /**
   * PROGRESSIVE DISCLOSURE
   * 
   * Start simple. Let player ask for more detail if interested.
   */
  progressivelyDisclose(topic) {
    return {
      levelOne: {
        show: 'Basic understanding',
        example: 'You attack. Make a roll.'
      },

      levelTwo: {
        show: 'If they ask "how do I attack?"',
        example: 'Roll d20 + your attack bonus. If it\'s higher than their AC, you hit.'
      },

      levelThree: {
        show: 'If they ask "what\'s my attack bonus?"',
        example: 'It\'s your Strength modifier (+2) plus your proficiency bonus (+2). Total +4.'
      },

      levelFour: {
        show: 'If they ask "why those bonuses?"',
        example: 'Strength is your physical power. Proficiency is your training. Both help you hit.'
      },

      levelFive: {
        show: 'If they want the full system',
        example: 'Attack = d20 + STR mod + proficiency vs. target AC. Critical hit on Nat 20. Damage is weapon die + STR mod.'
      }
    };
  }

  /**
   * TRACK AND SURFACE ONLY DELTAS
   * 
   * Instead of status dump, show what CHANGED
   */
  surfaceDeltas(previousState, currentState, relevantTo = 'party') {
    const deltas = [];

    // What matters to party?
    if (previousState.partyHealth !== currentState.partyHealth) {
      deltas.push({
        icon: '❤',
        change: `Party health: ${previousState.partyHealth} → ${currentState.partyHealth}`,
        urgency: 'HIGH'
      });
    }

    if (previousState.enemyCount !== currentState.enemyCount) {
      deltas.push({
        icon: '⚔',
        change: `Enemies: ${previousState.enemyCount} → ${currentState.enemyCount}`,
        urgency: 'HIGH'
      });
    }

    if (previousState.timeRemaining !== currentState.timeRemaining) {
      deltas.push({
        icon: '⏱',
        change: `Time: ${previousState.timeRemaining} minutes left → ${currentState.timeRemaining}`,
        urgency: previousState.timeRemaining > 5 ? 'MEDIUM' : 'CRITICAL'
      });
    }

    if (previousState.npcTrust !== currentState.npcTrust) {
      deltas.push({
        icon: '🤝',
        change: `NPC trust shifted`,
        urgency: 'MEDIUM'
      });
    }

    // Show most urgent first
    deltas.sort((a, b) => {
      const urgencyRank = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      return urgencyRank[a.urgency] - urgencyRank[b.urgency];
    });

    return deltas;
  }

  /**
   * AVOID: Unframed complexity
   * 
   * This is the engine's enemy
   */
  checkForUnframedComplexity(description) {
    const issues = [];

    if (description.includes('modifier') && !description.includes('why')) {
      issues.push('Mentions modifier without explaining what it is');
    }

    if (description.includes('DC') && !description.includes('target number')) {
      issues.push('Uses jargon (DC) without plain English equivalent');
    }

    if (description.includes('d20') && !description.includes('dice')) {
      issues.push('Uses shorthand (d20) without explanation');
    }

    if (description.length > 150) {
      issues.push('Too much information at once. Needs to be shortened.');
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      recommendation: issues.length > 0 ? 'Simplify and frame complexity' : 'Good legibility'
    };
  }
}

export { CognitiveLoadRouter };
