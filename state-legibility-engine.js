#!/usr/bin/env node

/**
 * STATE LEGIBILITY ENGINE
 * 
 * At any moment, a player should answer WITHOUT digging through menus:
 * - "How screwed are we?" (danger level)
 * - "What can I meaningfully do right now?" (options)
 * - "What are consequences if we choose X vs Y?" (outcomes)
 * 
 * The engine surfaces ONLY relevant deltas, not status dumps
 */

class StateLegibilityEngine {
  constructor() {
    this.lastState = null;
    this.currentState = null;
    this.visibleState = null; // What the player sees
  }

  /**
   * ANSWER: "How screwed are we?"
   * 
   * In simple, vivid language—not stats
   */
  assessDangerLevel(context) {
    const { partyHealth, resources, timeRemaining, enemies, environment } = context;

    const assessment = {
      dangerRating: 'MODERATE', // SAFE, CAUTION, DANGEROUS, CRITICAL
      vividDescription: '',
      numericSummary: '',
      immediateThreats: [],
      escalationPath: ''
    };

    // Calculate danger from multiple factors
    let dangerScore = 0;

    // Party health
    const avgHealth = partyHealth.reduce((a, b) => a + b, 0) / partyHealth.length;
    if (avgHealth < 25) dangerScore += 3; // Badly wounded
    if (avgHealth < 50) dangerScore += 2; // Hurt
    if (avgHealth > 80) dangerScore -= 1; // Healthy

    // Resources (healing, ammo, spells)
    if (resources.healing < 2) dangerScore += 2;
    if (resources.spellSlots < 3) dangerScore += 1;

    // Time pressure
    if (timeRemaining && timeRemaining < 5) dangerScore += 3;
    if (timeRemaining && timeRemaining < 15) dangerScore += 1;

    // Enemy threat
    if (enemies && enemies.length > 0) {
      dangerScore += Math.min(enemies.length, 3);
      if (enemies.some(e => e.threat === 'high')) dangerScore += 2;
    }

    // Translate score to assessment
    if (dangerScore <= 2) {
      assessment.dangerRating = 'SAFE';
      assessment.vividDescription = 'You have breathing room. Not much pressure.';
    } else if (dangerScore <= 5) {
      assessment.dangerRating = 'CAUTION';
      assessment.vividDescription = 'You\'re managing, but one bad move could spiral.';
    } else if (dangerScore <= 8) {
      assessment.dangerRating = 'DANGEROUS';
      assessment.vividDescription = 'Things are tight. You\'re in real trouble if luck turns.';
    } else {
      assessment.dangerRating = 'CRITICAL';
      assessment.vividDescription = 'You\'re one mistake away from TPK. Act now.';
    }

    assessment.numericSummary = `Danger Score: ${dangerScore}/10`;

    return assessment;
  }

  /**
   * ANSWER: "What can I meaningfully do right now?"
   * 
   * Surface ONLY viable options, not exhaustive lists
   */
  surfaceMeaningfulOptions(context) {
    const { character, situation, constraints = [], previousActions = [] } = context;

    const options = [];

    // FUNDAMENTAL OPTIONS (always available unless constrained)
    if (!constraints.includes('paralyzed')) {
      options.push({
        category: 'MOVEMENT',
        actions: ['Move to safety', 'Move to advantage', 'Reposition'],
        icon: '↔'
      });
    }

    if (!constraints.includes('silenced') && !constraints.includes('restrained')) {
      options.push({
        category: 'INTERACT',
        actions: ['Talk/Negotiate', 'Use object', 'Help ally'],
        icon: '✋'
      });
    }

    if (!constraints.includes('silenced')) {
      options.push({
        category: 'CAST',
        actions: ['Cast spell', 'Use ability', 'Prepare action'],
        icon: '✦'
      });
    }

    if (!constraints.includes('disarmed')) {
      options.push({
        category: 'ATTACK',
        actions: ['Attack enemy', 'Grapple', 'Defend ally'],
        icon: '⚔'
      });
    }

    // Collapse into SHORT list (max 5 main actions)
    const collapsed = options.map(opt => ({
      icon: opt.icon,
      category: opt.category,
      shortForm: opt.actions[0] // Just show primary action
    }));

    return {
      mainOptions: collapsed,
      message: 'What do you want to do?',
      constraints: constraints.length > 0 ? constraints : null
    };
  }

  /**
   * ANSWER: "What happens if we choose X vs Y?"
   * 
   * Clear consequence contrasts
   */
  surfaceConsequences(optionA, optionB) {
    const consequences = {
      optionA: {
        action: optionA.action,
        successLikelihood: optionA.likelihood,
        successConsequence: optionA.successOutcome,
        failureConsequence: optionA.failureOutcome,
        costIfWrong: optionA.cost
      },

      optionB: {
        action: optionB.action,
        successLikelihood: optionB.likelihood,
        successConsequence: optionB.successOutcome,
        failureConsequence: optionB.failureOutcome,
        costIfWrong: optionB.cost
      },

      comparison: {
        ifSucceedA: `You ${optionA.successOutcome}`,
        ifSucceedB: `You ${optionB.successOutcome}`,
        ifFailA: `You ${optionA.failureOutcome}. Cost: ${optionA.cost}`,
        ifFailB: `You ${optionB.failureOutcome}. Cost: ${optionB.cost}`,
        recommendation: this.getRecommendation(optionA, optionB)
      }
    };

    return consequences;
  }

  /**
   * SURFACE ONLY DELTAS (not status dumps)
   * 
   * Instead of: "Here's everything about the guard: stats, inventory, attitude..."
   * Say: "Guard trust ↓, rumor about you ↑, time pressure ↑"
   */
  surfaceDeltas(previousState, currentState) {
    const deltas = [];

    // What changed?
    for (const [key, newValue] of Object.entries(currentState)) {
      const oldValue = previousState[key];

      if (oldValue === undefined) {
        deltas.push({
          property: key,
          change: 'NEW',
          value: newValue,
          icon: '⊕'
        });
      } else if (newValue !== oldValue) {
        const direction = newValue > oldValue ? '↑' : '↓';
        deltas.push({
          property: key,
          change: direction,
          oldValue,
          newValue,
          icon: direction
        });
      }
    }

    return {
      changes: deltas,
      summary: deltas.map(d => `${d.property} ${d.icon}`).join(', ')
    };
  }

  /**
   * Helper: Get recommendation
   */
  getRecommendation(optionA, optionB) {
    const aScore = optionA.likelihood * (1 - (optionA.cost || 0) / 100);
    const bScore = optionB.likelihood * (1 - (optionB.cost || 0) / 100);

    if (aScore > bScore * 1.2) return `Option A is safer.`;
    if (bScore > aScore * 1.2) return `Option B is safer.`;
    return `They're roughly equivalent. Choose based on style.`;
  }
}

export { StateLegibilityEngine };
