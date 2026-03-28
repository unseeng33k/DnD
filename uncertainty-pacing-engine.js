#!/usr/bin/env node

/**
 * UNCERTAINTY PACING ENGINE
 * 
 * How risk escalates across a session and campaign
 * 
 * The curve:
 * - EARLY: Low-stakes rolls (establish stakes, teach system)
 * - MID: Compounding risk (resources dwindling, time pressure)
 * - CLIMAX: Stacked uncertainty (multiple rolls cascade)
 * 
 * Like a F2P difficulty curve, but currency is cortisol + laughter
 */

class UncertaintyPacingEngine {
  constructor() {
    this.sessionPhase = 'start'; // start, mid, climax
    this.roundNumber = 0;
    this.riskLevel = 0; // 0-10 scale
    this.resourcesDepleted = [];
    this.timeRemaining = null;
    this.openLoops = [];
    this.previousFailures = [];
    this.consequenceChain = [];
  }

  /**
   * ANALYZE CURRENT PACING PHASE
   * 
   * Where are we in the curve?
   */
  getCurrentPhase(roundNumber, sessionMinutesElapsed = 0) {
    // Typically: 0-30 min = setup, 30-120 = mid, 120+ = climax
    
    if (roundNumber < 5) {
      return {
        phase: 'SETUP',
        description: 'Low stakes. Establishing system and tension.',
        recommendedRiskLevel: 2,
        shouldRoll: 'rarely'
      };
    }

    if (roundNumber < 15) {
      return {
        phase: 'RISING_ACTION',
        description: 'Medium stakes. Tension building.',
        recommendedRiskLevel: 5,
        shouldRoll: 'often'
      };
    }

    if (roundNumber < 25) {
      return {
        phase: 'CLIMAX',
        description: 'High stakes. Multiple consequences compound.',
        recommendedRiskLevel: 8,
        shouldRoll: 'always'
      };
    }

    return {
      phase: 'RESOLUTION',
      description: 'Consequences play out. Tension resolving.',
      recommendedRiskLevel: 6,
      shouldRoll: 'sometimes'
    };
  }

  /**
   * CALCULATE CURRENT RISK LEVEL (0-10)
   * 
   * Takes multiple factors into account
   */
  calculateRiskLevel(context = {}) {
    let risk = 0;

    // Base: session phase
    const phase = this.getCurrentPhase(context.roundNumber || 0);
    risk += phase.recommendedRiskLevel;

    // Factor: Resources depleted
    const resourceDepleted = (context.resourcesDepleted || []).length;
    risk += Math.min(resourceDepleted, 3); // Cap at 3

    // Factor: Time pressure
    if (context.timeRemaining && context.timeRemaining < 5) {
      risk += 2; // Imminent deadline
    } else if (context.timeRemaining && context.timeRemaining < 15) {
      risk += 1; // Some time pressure
    }

    // Factor: Previous failures
    const recentFailures = (context.previousFailures || []).filter(f => 
      f.age < 3 // Recent (last 3 rounds)
    ).length;
    risk += Math.min(recentFailures, 2);

    // Factor: Open loops
    const criticLoops = (context.openLoops || []).filter(l => l.pressure === 'critical').length;
    risk += Math.min(criticLoops, 2);

    // Cap at 10
    return Math.min(10, risk);
  }

  /**
   * ESCALATE RISK DELIBERATELY
   * 
   * Not randomly - intentionally increase pressure
   */
  escalateRisk(trigger) {
    const escalations = {
      'resource_depleted': {
        increase: 1,
        narrative: 'You\'ve used a critical resource. Options narrow.',
        example: 'Last healing potion used. Injuries accumulate now.'
      },
      
      'time_pressure': {
        increase: 2,
        narrative: 'Time is running out.',
        example: 'The ritual will complete in 2 minutes.'
      },
      
      'cross_wired_goals': {
        increase: 1.5,
        narrative: 'Multiple competing objectives. Can\'t do everything.',
        example: 'Save the hostage OR stop the bomb. Not both.'
      },
      
      'failure_cascade': {
        increase: 2,
        narrative: 'One failure leads to another.',
        example: 'Failed to disarm trap → alarm sounds → guards coming'
      },
      
      'previous_defeat': {
        increase: 1,
        narrative: 'You\'ve been beaten before. They remember.',
        example: 'The enemy you fled from is back and expecting you.'
      }
    };

    const escalation = escalations[trigger];
    if (escalation) {
      this.riskLevel += escalation.increase;
      this.riskLevel = Math.min(10, this.riskLevel);
      return escalation;
    }

    return null;
  }

  /**
   * DESIGN ENCOUNTER RISK CURVE
   * 
   * Plan encounter so risk escalates smoothly
   */
  designEncounterCurve(durationRounds = 10) {
    const curve = [];

    for (let round = 0; round < durationRounds; round++) {
      const phase = round / durationRounds; // 0 to 1
      
      // Risk curve: starts low, peaks at climax, drops at end
      let risk = 5 * Math.sin(phase * Math.PI); // 0 to 5
      
      // Add randomness
      risk += Math.random() * 2 - 1;
      risk = Math.max(0, Math.min(10, risk));

      curve.push({
        round,
        risk: Math.round(risk),
        phase: this.describePhase(round, durationRounds),
        recommendations: this.getRecommendations(risk)
      });
    }

    return curve;
  }

  /**
   * STACKED UNCERTAINTY
   * 
   * Multiple rolls cascade into one big story beat
   * 
   * Example: Jumping chasm while enemy fires arrows
   *   - DEX check to start jump
   *   - STR check to make distance
   *   - DEX save from arrow
   *   - All three rolls determine final outcome
   */
  stackUncertainty(rolls = []) {
    const stacked = {
      rolls: rolls,
      cascadeEffect: true,
      failureChain: [],
      successChain: [],
      narrative: this.generateStackedNarrative(rolls)
    };

    // If ANY roll fails, cascade effects
    const anyFailed = rolls.some(r => !r.success);
    if (anyFailed) {
      stacked.failureChain = this.calculateCascade(rolls, 'failure');
    } else {
      stacked.successChain = this.calculateCascade(rolls, 'success');
    }

    return stacked;
  }

  /**
   * Calculate cascade effects
   */
  calculateCascade(rolls, type) {
    const chain = [];

    rolls.forEach((roll, idx) => {
      if (type === 'failure' && !roll.success) {
        // Each failure cascades into consequence
        chain.push({
          roll: idx,
          consequence: `Failed ${roll.name}. Next action is harder.`,
          difficulty_increase: 2
        });
      } else if (type === 'success' && roll.success) {
        chain.push({
          roll: idx,
          benefit: `Succeeded ${roll.name}. Momentum carries forward.`,
          advantage_on_next: true
        });
      }
    });

    return chain;
  }

  /**
   * Helper: Describe phase
   */
  describePhase(round, total) {
    const percent = round / total;
    
    if (percent < 0.25) return 'Setup';
    if (percent < 0.75) return 'Rising';
    return 'Climax';
  }

  /**
   * Helper: Get recommendations for risk level
   */
  getRecommendations(riskLevel) {
    if (riskLevel < 2) {
      return 'Low risk. Maybe no roll needed.';
    }
    if (riskLevel < 5) {
      return 'Moderate risk. Roll if failure matters.';
    }
    if (riskLevel < 8) {
      return 'High risk. Definitely roll. Failure has cost.';
    }
    return 'Critical risk. Every roll stacks consequences.';
  }

  /**
   * Generate narrative for stacked rolls
   */
  generateStackedNarrative(rolls) {
    const names = rolls.map(r => r.name).join(' → ');
    return `Multiple challenges stack: ${names}. Each affects the next.`;
  }
}

export { UncertaintyPacingEngine };
