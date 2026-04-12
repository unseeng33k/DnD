#!/usr/bin/env node

/**
 * OUTCOME SWINGYNESS MANAGER
 * 
 * How to handle failure so it generates INTERESTING complications
 * instead of dead stops
 * 
 * Core insight: Failure isn't the end of the story.
 * It's the inciting incident for the NEXT story.
 */

class OutcomeSwinginessManager {
  constructor() {
    this.natRolls = [];
    this.failureComplications = [];
    this.successBoosts = [];
  }

  /**
   * NATURAL 20 - Special Event, Not Constant Noise
   * 
   * Nat 20 should feel RARE and REWARDING
   * Not just +1 damage
   */
  handleNat20(context) {
    const crit = {
      raw_roll: 20,
      type: 'natural_20',
      action: context.action,
      narrative: ''
    };

    // What does a nat 20 MEAN?
    // Not just "double damage" - that's boring
    
    switch (context.action) {
      case 'attack':
        crit.effect = 'Critical hit. Double damage + enemy is disoriented.';
        crit.narrative = 'Your strike finds an opening in their armor. They stagger.';
        break;

      case 'negotiation':
        crit.effect = 'Not just success - enemy becomes ally.';
        crit.narrative = 'Your words strike deep. They reconsider everything.';
        break;

      case 'stealth':
        crit.effect = 'Not just undetected - you gain intel.';
        crit.narrative = 'You slip past unseen AND overhear their secret.';
        break;

      case 'rescue':
        crit.effect = 'Save + bonus outcome. Rescued person becomes asset.';
        crit.narrative = 'You not only save them, you earn undying gratitude.';
        break;

      default:
        crit.effect = 'Spectacular success. Better than expected.';
        crit.narrative = 'Not only do you succeed - you succeed DRAMATICALLY.';
    }

    return crit;
  }

  /**
   * NATURAL 1 - Complication, Not Disaster
   * 
   * Nat 1 should create INTERESTING problems, not TPK
   */
  handleNat1(context) {
    const fumble = {
      raw_roll: 1,
      type: 'natural_1',
      action: context.action,
      severity: 'complication', // Not disaster
      narrative: ''
    };

    // Don't just say "you fail"
    // Say "you fail AND here's the interesting consequence"

    switch (context.action) {
      case 'attack':
        fumble.effect = 'Miss AND drop weapon (takes action to retrieve)';
        fumble.narrative = 'Your strike goes wildly wide. Your weapon clatters to the ground.';
        fumble.opportunity = 'Enemy now has opening, but you can pick up weapon next turn';
        break;

      case 'negotiation':
        fumble.effect = 'Fail AND insult them (attitude shifts negative)';
        fumble.narrative = 'Your words come out wrong. They\'re now offended.';
        fumble.opportunity = 'Can fix it with apology + next successful persuasion';
        break;

      case 'stealth':
        fumble.effect = 'Discovered AND enemy alerts others (but 2-round delay)';
        fumble.narrative = 'A guard turns just as you move. You lock eyes.';
        fumble.opportunity = 'You have 2 rounds before guards arrive. Act now.';
        break;

      case 'rescue':
        fumble.effect = 'Rescue fails AND you take damage (but target is unharmed)';
        fumble.narrative = 'You try to grab them but slip. You fall, they\'re safe above.';
        fumble.opportunity = 'Try again, but now you\'re injured and need help up';
        break;

      default:
        fumble.effect = 'Something unexpected goes wrong.';
        fumble.narrative = 'This didn\'t go as planned.';
    }

    return fumble;
  }

  /**
   * FAILURE COMPLICATIONS
   * 
   * How do we turn "you failed" into "you failed AND here's interesting"
   */
  generateComplication(failureContext) {
    const complication = {
      failure: failureContext.action,
      dc: failureContext.dc,
      roll: failureContext.roll,
      margin: failureContext.dc - failureContext.roll,
      severity: this.calculateSeverity(failureContext),
      complications: [],
      narrative: ''
    };

    // Severity based on HOW MUCH they failed
    if (complication.margin < 3) {
      // Close failure (barely missed)
      complication.complications.push('You almost made it. Try again next turn?');
    } else if (complication.margin < 6) {
      // Clear failure
      complication.complications.push('You didn\'t manage it.');
      complication.complications.push('Enemy now aware of your attempt.');
    } else {
      // Critical failure
      complication.complications.push('Spectacularly failed.');
      complication.complications.push('Something unexpected happens.');
      complication.complications.push('New problem appears: ' + this.generateNewProblem());
    }

    // Generate narrative
    complication.narrative = this.narrativeFailure(failureContext);

    return complication;
  }

  /**
   * Calculate severity based on how much failed
   */
  calculateSeverity(context) {
    const margin = context.dc - context.roll;

    if (margin < 2) return 'NEAR_MISS';
    if (margin < 5) return 'CLEAR_FAILURE';
    if (margin < 10) return 'CRITICAL_FAILURE';
    return 'CATASTROPHIC_FAILURE';
  }

  /**
   * Generate a new problem from failure
   */
  generateNewProblem() {
    const problems = [
      'An alarm sounds',
      'Someone unexpected appears',
      'Resources are consumed',
      'Attention shifts to your weakness',
      'Time pressure increases',
      'An ally is compromised',
      'The situation escalates'
    ];

    return problems[Math.floor(Math.random() * problems.length)];
  }

  /**
   * Narrative failure
   * 
   * Make failure VIVID and INTERESTING
   */
  narrativeFailure(context) {
    const narratives = {
      'attack': 'Your strike misses. Your enemy grins. They were expecting that.',
      'stealth': 'A floorboard creaks under your weight. Eyes turn toward you.',
      'negotiation': 'Your words hang awkwardly. They stand up. This is over.',
      'save': 'Your hand closes on empty air. Too slow.',
      'puzzle': 'The mechanism clicks incorrectly. The door doesn\'t open.',
      'escape': 'The rope snaps. You fall.'
    };

    return narratives[context.action] || 'It doesn\'t work.';
  }

  /**
   * SUCCESS BOOSTS
   * 
   * Success can do MORE than just "you succeed"
   */
  generateSuccessBoost(successContext) {
    const boost = {
      success: successContext.action,
      roll: successContext.roll,
      dc: successContext.dc,
      margin: successContext.roll - successContext.dc,
      boost_level: this.calculateBoostLevel(successContext),
      benefits: [],
      narrative: ''
    };

    if (boost.margin > 5) {
      // Exceptional success
      boost.benefits.push('You succeed WELL. Extra benefit or advantage.');
      boost.benefits.push('Momentum carries forward to next action.');
    } else if (boost.margin > 0) {
      // Normal success
      boost.benefits.push('You succeed cleanly.');
    }

    return boost;
  }

  /**
   * Calculate boost level
   */
  calculateBoostLevel(context) {
    const margin = context.roll - context.dc;

    if (margin < 0) return 'FAILURE';
    if (margin < 3) return 'BARE_SUCCESS';
    if (margin < 6) return 'SOLID_SUCCESS';
    return 'EXCEPTIONAL_SUCCESS';
  }

  /**
   * OUTCOMES ARE INTERESTING, NOT BINARY
   * 
   * Success/Failure isn't about winning/losing
   * It's about narrative momentum
   */
  isOutcomeInteresting(outcome) {
    // Outcome is interesting if:
    // 1. It opens new story threads (not just closes one)
    // 2. It has complications even on success
    // 3. Failure isn't "you die" but "now what?"

    const interesting_checks = [
      outcome.opens_new_threads !== false,
      outcome.has_complications || outcome.severity !== 'trivial',
      outcome.narrative_consequence !== null
    ];

    return interesting_checks.filter(c => c).length >= 2;
  }
}

export { OutcomeSwinginessManager };
