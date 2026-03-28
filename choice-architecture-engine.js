#!/usr/bin/env node

/**
 * CHOICE ARCHITECTURE ENGINE
 * 
 * Presents meaningful decisions that:
 * - Are legible (players know what they're choosing between)
 * - Are open-ended (not just picking from a menu)
 * - Are consequential (different paths lead different directions)
 * - Never feel pre-scripted (all outcomes have real possibility)
 * 
 * The difference between:
 * ❌ "Do you fight or talk?" (false choice—outcome predetermined)
 * ✅ "The guard is outnumbered but armed. What do you do?" (genuine fork)
 */

class ChoiceArchitectureEngine {
  constructor() {
    this.choices = [];
    this.choiceHistory = [];
  }

  /**
   * PRESENT DECISION POINT
   * 
   * Takes situation and generates LEGITIMATE OPTIONS
   * (not menu choices, but genuine forks)
   */
  presentChoice(context) {
    const choice = {
      id: `choice_${Date.now()}`,
      situation: context.situation,
      stakes: context.stakes,
      options: [],
      timeLimit: context.timeLimit || null, // Pressure?
      scopeOfImpact: context.scope || 'immediate', // immediate, campaign, world
      revocable: context.revocable !== false, // Can you undo this?
      actors: context.actors || [], // Who's involved?
      constraints: context.constraints || [] // Physical/magical limits
    };

    // Generate options from situation
    const generated = this.generateOptions(context);
    choice.options = generated;

    // Mark as "genuine" if options have different outcomes
    choice.isGenuine = this.assessGenuineness(choice);

    this.choices.push(choice);
    return choice;
  }

  /**
   * GENERATE OPTIONS from situation (not a menu)
   * 
   * This is the key: options emerge from situation logic, not DM whim
   */
  generateOptions(context) {
    const options = [];

    // START WITH FUNDAMENTAL APPROACHES
    const approaches = [
      { type: 'direct', name: 'Direct', description: 'Use force or obvious action' },
      { type: 'subtle', name: 'Subtle', description: 'Use deception, stealth, or misdirection' },
      { type: 'diplomatic', name: 'Diplomatic', description: 'Negotiate, persuade, appeal' },
      { type: 'magical', name: 'Magical', description: 'Use spells or supernatural means' },
      { type: 'creative', name: 'Creative', description: 'Do something unexpected' }
    ];

    // Filter approaches by SITUATION FEASIBILITY
    // (Some are more viable than others)
    for (const approach of approaches) {
      if (this.isApproachFeasible(approach, context)) {
        const option = {
          id: `option_${approach.type}`,
          name: approach.name,
          description: this.generateDescription(approach, context),
          approach: approach.type,
          likelihood: this.assessLikelihood(approach, context), // % chance of success
          costs: this.assessCosts(approach, context), // What's the downside?
          benefits: this.assessBenefits(approach, context), // What's the upside?
          visible: true, // Player can think of this
          outcomes: this.generateOutcomes(approach, context) // Possible results
        };

        options.push(option);
      }
    }

    // ALLOW PLAYER TO INVENT
    options.push({
      id: 'option_other',
      name: 'Something else',
      description: 'You can try something the options above don\'t cover',
      approach: 'custom',
      likelihood: 'varies', // Depends on their idea
      costs: 'unknown',
      benefits: 'unknown',
      visible: true,
      outcomes: [] // Will be generated when they propose
    });

    return options;
  }

  /**
   * Is this approach FEASIBLE in this situation?
   */
  isApproachFeasible(approach, context) {
    const { situation, constraints = [] } = context;

    // Can't use magic if silenced
    if (approach.type === 'magical' && constraints.includes('silenced')) {
      return false;
    }

    // Can't sneak if there's nowhere to hide
    if (approach.type === 'subtle' && constraints.includes('open_ground')) {
      return false;
    }

    // Can't negotiate if target is mindless
    if (approach.type === 'diplomatic' && constraints.includes('mindless')) {
      return false;
    }

    // All others generally feasible
    return true;
  }

  /**
   * Generate VIVID DESCRIPTION of option
   */
  generateDescription(approach, context) {
    const { situation, actors = [] } = context;

    const descriptions = {
      direct: `You could attack directly. ${actors[0]?.name || 'Your target'} is ${actors[0]?.armor ? 'armored' : 'unarmored'}. The area is ${context.terrain || 'open'}. Speed matters.`,
      
      subtle: `You could use stealth, deception, or misdirection. There are ${context.hidingSpots || 'some'} places to hide or move quietly. Timing is critical.`,
      
      diplomatic: `You could try to talk, persuade, or negotiate. ${actors[0]?.name || 'They'} seem ${actors[0]?.attitude || 'uncertain'} about you. Words could shift that.`,
      
      magical: `You could cast a spell. You have ${context.spellsAvailable || 'some spells'} prepared. The environment is ${context.spellSafe ? 'safe for magic' : 'risky for magic'}.`,
      
      creative: `You could try something no one expects. The risk is high but the reward could be huge if it works.`
    };

    return descriptions[approach.type] || '';
  }

  /**
   * Assess LIKELIHOOD of success for approach
   */
  assessLikelihood(approach, context) {
    const { actors = [], terrain, targetLevel } = context;

    let likelihood = 50; // Base 50%

    // Direct is easier vs lower-level enemies
    if (approach.type === 'direct') {
      if (targetLevel && targetLevel < 3) likelihood = 75;
      if (targetLevel && targetLevel > 6) likelihood = 25;
    }

    // Subtle is harder with many enemies
    if (approach.type === 'subtle' && actors.length > 3) likelihood -= 20;

    // Diplomatic harder with hostile targets
    if (approach.type === 'diplomatic' && actors[0]?.attitude === 'hostile') likelihood -= 30;

    // Magic unpredictable (50/50)
    if (approach.type === 'magical') likelihood = 50;

    // Creative: depends on cleverness (can't predict)
    if (approach.type === 'creative') likelihood = 'unknown';

    return likelihood;
  }

  /**
   * Assess COSTS of approach
   */
  assessCosts(approach, context) {
    const costs = {
      direct: ['Time (may alert others)', 'Injury (you might take damage)', 'Collateral (things break)'],
      subtle: ['Time (takes longer)', 'Requires success (failure is loud)', 'Uses resources (tools, spells)'],
      diplomatic: ['Time (talking takes time)', 'Commitment (they may want reciprocal)', 'Reveals info (they learn about you)'],
      magical: ['Spell slots (resources)', 'Risk (spell might fail)', 'Visibility (magic is noticed)'],
      creative: ['Unknown (could backfire)', 'Unfamiliar (you\'re making this up)', 'Risky (no precedent)']
    };

    return costs[approach.type] || [];
  }

  /**
   * Assess BENEFITS of approach
   */
  assessBenefits(approach, context) {
    const benefits = {
      direct: ['Immediate (quick resolution)', 'Decisive (clear victory)', 'Direct (no confusion)'],
      subtle: ['Stealthy (no alarm)', 'Elegant (minimal collateral)', 'Clever (enemies never see it coming)'],
      diplomatic: ['Ally (might gain support)', 'Information (learn their goals)', 'Peaceful (no bloodshed)'],
      magical: ['Powerful (magic is potent)', 'Flexible (many spell options)', 'Wondrous (only magic can do this)'],
      creative: ['Unexpected (no one prepared for this)', 'Memorable (if it works, legend status)', 'Rewarding (DM loves creative)']
    };

    return benefits[approach.type] || [];
  }

  /**
   * Generate POSSIBLE OUTCOMES for approach
   */
  generateOutcomes(approach, context) {
    const outcomes = [];

    const baseOutcomes = {
      direct: [
        { result: 'success', narrative: 'Your target is defeated. You won.' },
        { result: 'partial', narrative: 'Your target is hurt but escapes. Unfinished business.' },
        { result: 'failure', narrative: 'Your target turns the tables. You\'re now in danger.' }
      ],
      
      subtle: [
        { result: 'success', narrative: 'Your target never saw you coming. Perfect execution.' },
        { result: 'partial', narrative: 'You succeeded but were spotted. The element of surprise is gone.' },
        { result: 'failure', narrative: 'Your plan was discovered before execution. Now they\'re prepared.' }
      ],
      
      diplomatic: [
        { result: 'success', narrative: 'They agree. You may have gained an ally.' },
        { result: 'partial', narrative: 'They\'re neutral. Not allies but not enemies.' },
        { result: 'failure', narrative: 'They refuse. Your words made things worse. Hostility increased.' }
      ],
      
      magical: [
        { result: 'success', narrative: 'The spell works perfectly. Reality bends to your will.' },
        { result: 'partial', narrative: 'The spell partially works. You got what you wanted but complications arose.' },
        { result: 'failure', narrative: 'The spell backfires. Unexpected consequences.' }
      ],
      
      creative: [
        { result: 'success', narrative: 'It worked! And better than you expected. Genius move.' },
        { result: 'partial', narrative: 'It worked but not perfectly. You improvise.' },
        { result: 'failure', narrative: 'It didn\'t work. Back to the drawing board.' }
      ]
    };

    return baseOutcomes[approach.type] || [];
  }

  /**
   * ASSESS GENUINENESS
   * 
   * Are these real options or illusion of choice?
   * Genuine = different outcomes lead different directions
   */
  assessGenuineness(choice) {
    if (choice.options.length < 2) {
      return false; // No real choice if only 1 option
    }

    // Check if outcomes actually diverge
    const outcomes = new Set();
    for (const option of choice.options) {
      for (const outcome of option.outcomes) {
        outcomes.add(outcome.result);
      }
    }

    // Genuine if outcomes actually differ
    return outcomes.size > 1;
  }

  /**
   * PLAYER MAKES CHOICE
   * 
   * Record their decision and consequence
   */
  playerChooses(choiceId, optionId, reasoning = null) {
    const choice = this.choices.find(c => c.id === choiceId);
    if (!choice) return null;

    const option = choice.options.find(o => o.id === optionId);
    if (!option) return null;

    const decision = {
      choiceId,
      optionId,
      option: option.name,
      approach: option.approach,
      timestamp: Date.now(),
      reasoning, // Why did they choose this?
      consequence: null // Will be filled by resolution
    };

    this.choiceHistory.push(decision);
    return decision;
  }

  /**
   * RECORD CONSEQUENCE
   * 
   * What actually happened as result of choice
   */
  recordConsequence(choiceId, consequence) {
    const lastDecision = this.choiceHistory.find(d => d.choiceId === choiceId);
    if (lastDecision) {
      lastDecision.consequence = consequence;
      lastDecision.resolved = true;
    }
  }

  /**
   * GET CHOICE STATISTICS
   * 
   * For spotlighting: who makes decisions?
   */
  getChoiceStats(partyMembers = []) {
    const stats = {
      totalChoices: this.choiceHistory.length,
      byApproach: {},
      successRate: 0,
      byActor: {}
    };

    // Count by approach
    for (const decision of this.choiceHistory) {
      stats.byApproach[decision.approach] = (stats.byApproach[decision.approach] || 0) + 1;
    }

    // Success rate
    const resolved = this.choiceHistory.filter(d => d.resolved);
    const successes = resolved.filter(d => d.consequence?.result === 'success');
    stats.successRate = resolved.length > 0 ? (successes.length / resolved.length * 100).toFixed(0) : 'N/A';

    return stats;
  }
}

export { ChoiceArchitectureEngine };
