#!/usr/bin/env node

/**
 * ODDS COMMUNICATION SYSTEM
 * 
 * How the engine talks about risk so players feel:
 * - INFORMED (roughly 70/30 even if you never say the number)
 * - RESPECTED (you told me it was risky, I chose it, I own this)
 * - REWARDED (for good risk management: prep, intel, advantage)
 */

class OddsCommunicationSystem {
  constructor() {
    this.playerUnderstanding = {}; // Track what players understand
    this.riskFrames = [];
    this.respectSignals = [];
  }

  /**
   * COMMUNICATE ODDS WITHOUT NUMBERS
   * 
   * Players should FEEL the odds without explicit percentages
   * 
   * Instead of: "You have a 35% chance"
   * Say: "This is a long shot. You're outmatched, but not impossible."
   */
  communicateOdds(context) {
    const { dc, character_bonus, roll_die = 20 } = context;

    // Calculate actual odds
    const highest_roll = roll_die + character_bonus;
    const odds = this.calculateOdds(highest_roll, dc);

    // Translate odds to VISCERAL LANGUAGE
    const frame = this.chooseFrame(odds);

    return {
      odds_percentage: odds,
      player_facing_language: frame.language,
      danger_level: frame.danger,
      risk_ownership: frame.ownership,
      narrative: frame.narrative,
      recommendation: frame.recommendation
    };
  }

  /**
   * CALCULATE ODDS (simplified)
   */
  calculateOdds(highest_possible, dc) {
    if (highest_possible < dc) {
      // Can't succeed even on nat 20
      return 0;
    }

    if (highest_possible >= dc + 5) {
      // Very likely to succeed
      const needed = dc;
      const odds = ((21 - needed) / 20) * 100;
      return Math.round(odds);
    }

    // Normal case
    const needed = dc;
    const odds = ((21 - needed) / 20) * 100;
    return Math.round(odds);
  }

  /**
   * CHOOSE FRAME (language pattern for odds)
   * 
   * 0-15%: Nearly impossible
   * 15-30%: Long shot
   * 30-50%: Risky
   * 50-70%: Fair coin flip
   * 70-85%: Good odds
   * 85-100%: Likely
   */
  chooseFrame(odds) {
    if (odds < 15) {
      return {
        language: 'This is nearly impossible. You\'d need a miracle.',
        danger: 'SUICIDAL',
        ownership: 'You know this is basically a death wish.',
        narrative: 'Even if you succeed, the world will remember this as audacious.',
        recommendation: 'Only do this if the story demands it.'
      };
    }

    if (odds < 30) {
      return {
        language: 'Long shot. You\'re outmatched, but not impossible.',
        danger: 'VERY_HIGH',
        ownership: 'You\'re choosing to gamble. Own it.',
        narrative: 'If you succeed, it will be legendary.',
        recommendation: 'Consider if there\'s a better way. If not, understand the risk.'
      };
    }

    if (odds < 50) {
      return {
        language: 'This is risky. You might fail.',
        danger: 'HIGH',
        ownership: 'You\'re accepting real risk here.',
        narrative: 'Success is possible but not assured.',
        recommendation: 'Preparation or advantage could help.'
      };
    }

    if (odds < 70) {
      return {
        language: 'Roughly even odds. Could go either way.',
        danger: 'MODERATE',
        ownership: 'Fairish. Your choice.',
        narrative: 'This could break either direction.',
        recommendation: 'Standard approach. Normal risk.'
      };
    }

    if (odds < 85) {
      return {
        language: 'Good odds. You\'re favored but not guaranteed.',
        danger: 'LOW',
        ownership: 'You\'re in a strong position.',
        narrative: 'Likely to succeed if you don\'t mess up.',
        recommendation: 'Go for it. You\'ve got this.'
      };
    }

    return {
      language: 'Very likely. This should work.',
      danger: 'MINIMAL',
      ownership: 'You\'re heavily favored.',
      narrative: 'Your competence shines here.',
      recommendation: 'Auto-success might even apply.'
    };
  }

  /**
   * RESPECT SIGNALS
   * 
   * Let players know their choice is acknowledged
   */
  generateRespectSignal(decision) {
    const signals = {
      'confirmed_risky': {
        message: 'You understand this is risky. Proceeding anyway?',
        shows: 'You told me the stakes. I\'m choosing to proceed.'
      },

      'confirmed_prepared': {
        message: 'Your preparation makes this more viable.',
        shows: 'Your intel/setup matters. You\'ve earned better odds.'
      },

      'confirmed_expertise': {
        message: 'Your expertise helps here.',
        shows: 'Your skill set is relevant. You\'re not gambling blindly.'
      },

      'confirmed_resource': {
        message: 'You\'re spending a resource for this. Noted.',
        shows: 'Your tactical choice (using item/ability) is honored.'
      }
    };

    return signals[decision] || null;
  }

  /**
   * REWARD GOOD RISK MANAGEMENT
   * 
   * Players who:
   * - Gather intelligence
   * - Prepare / setup
   * - Use resources wisely
   * - Think tactically
   * 
   * Should feel that effort matters
   */
  rewardRiskManagement(context) {
    const rewards = [];

    // Gathered intelligence?
    if (context.intel_gathered) {
      rewards.push({
        type: 'INTEL_BONUS',
        bonus: '+1 to roll',
        narrative: 'You learned something useful. That helps.'
      });
    }

    // Prepared?
    if (context.preparation) {
      rewards.push({
        type: 'PREPARATION_BONUS',
        bonus: 'Advantage on roll',
        narrative: 'Your setup paid off. Roll twice, use better.'
      });
    }

    // Using tactical resource?
    if (context.tactical_resource) {
      rewards.push({
        type: 'RESOURCE_BONUS',
        bonus: '+2 to roll or auto-success (depending on resource)',
        narrative: 'You spent a key resource. It works as intended.'
      });
    }

    // Good position?
    if (context.superior_position) {
      rewards.push({
        type: 'POSITION_BONUS',
        bonus: 'Advantage or +1',
        narrative: 'You\'ve maneuvered well. That matters.'
      });
    }

    return {
      total_bonuses: rewards,
      message: `You prepared well. You get: ${rewards.map(r => r.bonus).join(' + ')}`
    };
  }

  /**
   * "YOU OWN THIS" STATEMENT
   * 
   * When player commits to risky action, acknowledge ownership
   */
  generateOwnershipStatement(decision, odds) {
    const statements = {
      'aware_high_risk': {
        risky: 'You know this is risky.',
        owned: 'You\'re choosing it anyway.',
        consequence: 'You own the outcome.'
      },

      'aware_long_shot': {
        risky: 'This is a long shot.',
        owned: 'You\'re rolling the dice.',
        consequence: 'Whatever happens, that\'s on you. In the best way.'
      },

      'aware_prepared': {
        risky: 'This is risky.',
        owned: 'But you\'ve prepared.',
        consequence: 'Your prep changes the calculus.'
      }
    };

    return statements[decision] || statements['aware_high_risk'];
  }

  /**
   * TRANSPARENCY (without over-explanation)
   * 
   * Players should know:
   * - What affects odds (ability mod, prep, intel, position)
   * - What the DC is (even if metaphorical)
   * - What failure looks like (roughly)
   */
  provideTransparency(context) {
    const transparency = {
      what_affects_odds: [],
      dc_explanation: '',
      failure_consequence: ''
    };

    // What affects odds?
    if (context.character_ability) {
      transparency.what_affects_odds.push(`Your ${context.character_ability} is your strength here.`);
    }

    if (context.preparation) {
      transparency.what_affects_odds.push('Your preparation helps.');
    }

    if (context.intel) {
      transparency.what_affects_odds.push('What you learned matters.');
    }

    // DC explanation
    if (context.dc) {
      const difficulty_name = this.getDifficultyName(context.dc);
      transparency.dc_explanation = `This is ${difficulty_name} (DC ${context.dc}).`;
    }

    // Failure consequence
    if (context.failure_consequence) {
      transparency.failure_consequence = context.failure_consequence;
    }

    return transparency;
  }

  /**
   * Helper: Get difficulty name from DC
   */
  getDifficultyName(dc) {
    if (dc <= 5) return 'trivial';
    if (dc <= 8) return 'routine';
    if (dc <= 10) return 'easy';
    if (dc <= 12) return 'moderate';
    if (dc <= 15) return 'challenging';
    if (dc <= 18) return 'hard';
    if (dc <= 20) return 'very hard';
    return 'nearly impossible';
  }
}

export { OddsCommunicationSystem };
