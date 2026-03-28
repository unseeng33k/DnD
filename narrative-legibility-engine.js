#!/usr/bin/env node

/**
 * NARRATIVE LEGIBILITY ENGINE
 * 
 * The fiction clearly reflects the mechanics WITHOUT jargon.
 * Players understand what changed in world-state.
 * Clear hooks for "what we might do next."
 */

class NarrativeLegibilityEngine {
  constructor() {
    this.narrativeOutputs = [];
    this.stateChangeTracker = [];
  }

  /**
   * TRANSLATE MECHANICS INTO VIVID FICTION
   * 
   * Not: "You have disadvantage on this check because circumstances are unfavorable"
   * But: "The rain makes visibility terrible. You're squinting. This is harder."
   */
  mechanicsToFiction(mechanic) {
    const translations = {
      'advantage': {
        mechanic: 'Roll advantage',
        vividTranslation: 'You\'re in a strong position. Fortune favors you.',
        examples: [
          'Mechanic: Stealth check with advantage',
          'Fiction: You scouted well. The guards are distracted. Conditions are perfect.',
          ''
        ]
      },

      'disadvantage': {
        mechanic: 'Roll disadvantage',
        vividTranslation: 'The odds are against you. But you\'re trying anyway.',
        examples: [
          'Mechanic: Attack roll with disadvantage',
          'Fiction: The enemy sees you coming. You\'re exposed. You\'re throwing caution to the wind.'
        ]
      },

      'critical_success': {
        mechanic: 'Natural 20',
        vividTranslation: 'Everything goes perfectly. Better than expected.',
        examples: [
          'Mechanic: Nat 20 on negotiation',
          'Fiction: Your words strike deep. They reconsider everything. You\'ve won them over completely.'
        ]
      },

      'critical_failure': {
        mechanic: 'Natural 1',
        vividTranslation: 'Something goes wrong in an interesting way.',
        examples: [
          'Mechanic: Nat 1 on stealth',
          'Fiction: Your foot catches on something. You stumble. A guard turns just as you fall.'
        ]
      },

      'prepared': {
        mechanic: '+1 bonus, advantage, or auto-success',
        vividTranslation: 'Your preparation gives you an edge.',
        examples: [
          'Mechanic: +1 to stealth because you scouted',
          'Fiction: You know the guard\'s patrol pattern. You use that knowledge.'
        ]
      },

      'disadvantage_from_reckless': {
        mechanic: 'Disadvantage',
        vividTranslation: 'You\'re throwing caution to the wind.',
        examples: [
          'Mechanic: Disadvantage on attack because no armor',
          'Fiction: You\'re unarmored, exposed. Every swing is risky.'
        ]
      }
    };

    return translations[mechanic] || null;
  }

  /**
   * MAKE STATE CHANGES OBVIOUS IN NARRATIVE
   * 
   * When something changes, the fiction shows it CLEARLY
   */
  narrateStateChange(change) {
    const narratives = {
      'attitude_shift_positive': {
        change: 'NPC attitude improved',
        narrative: 'Something shifts in their expression. They see you differently now.',
        signal: '✓ Trust gained'
      },

      'attitude_shift_negative': {
        change: 'NPC attitude worsened',
        narrative: 'Their face hardens. The warmth is gone.',
        signal: '✗ Trust lost'
      },

      'alarm_raised': {
        change: 'Combat begins / alarm sounds',
        narrative: 'A bell tolls. Shouts echo. Guards are coming.',
        signal: '⚠ Alarm'
      },

      'door_unlocked': {
        change: 'Access granted / obstacle removed',
        narrative: 'The lock clicks open. You\'re through.',
        signal: '✓ Path clear'
      },

      'resource_depleted': {
        change: 'Out of healing / spells / ammo',
        narrative: 'You reach for the last one. It\'s gone.',
        signal: '✗ Resource gone'
      },

      'time_running_out': {
        change: 'Deadline approaching',
        narrative: 'The stars align. You have minutes, not hours.',
        signal: '⏱ Time pressure'
      }
    };

    const narration = narratives[change.type] || null;
    if (narration) {
      return {
        fiction: narration.narrative,
        mechanicSignal: narration.signal,
        meaning: narration.change
      };
    }

    return null;
  }

  /**
   * SET UP CLEAR HOOKS FOR "WHAT NEXT?"
   * 
   * After each scene, offer 2-3 obvious next moves (not railroaded choices)
   */
  generateNextHooks(currentScene) {
    const hooks = {
      situation: currentScene.situation,
      followUpOptions: [],
      mysteries: [],
      opportunities: []
    };

    // What naturally follows from this moment?
    if (currentScene.npcIntroduced) {
      hooks.followUpOptions.push({
        prompt: 'Follow up with this NPC',
        narrative: `${currentScene.npcIntroduced.name} is still here. You could talk more.`,
        mechanical: 'Another interaction/negotiation'
      });
    }

    if (currentScene.doorOpened) {
      hooks.followUpOptions.push({
        prompt: 'Explore what\'s beyond',
        narrative: 'The path ahead is open. Unknown.',
        mechanical: 'Exploration / discovery'
      });
    }

    if (currentScene.enemyEscaped) {
      hooks.mysteries.push({
        prompt: 'Hunt the enemy',
        narrative: 'They\'re out there. You could track them.',
        mechanical: 'Tracking / pursuit'
      });
    }

    if (currentScene.secretLearned) {
      hooks.opportunities.push({
        prompt: 'Act on this knowledge',
        narrative: `You know something they don't. What do you do with it?`,
        mechanical: 'Leverage / confrontation'
      });
    }

    return {
      scene: hooks.situation,
      naturalFollowUps: hooks.followUpOptions,
      unfinishedThreads: hooks.mysteries,
      newOpportunities: hooks.opportunities,
      nextDecision: 'What do you want to do?'
    };
  }

  /**
   * MAKE "WORLD CHANGED" VISUALLY/NARRATIVELY CLEAR
   * 
   * Show the before and after
   */
  showWorldChange(before, after) {
    return {
      before: {
        description: before.description,
        keyDetails: before.keyDetails
      },

      change: {
        whatHappened: after.whatChanged,
        why: after.reason
      },

      after: {
        description: after.description,
        keyDetails: after.keyDetails,
        whatsDifferent: this.findDifferences(before, after)
      },

      impactOnParty: {
        narrative: after.narrativeImpact,
        mechanical: after.mechanicalImpact
      }
    };
  }

  /**
   * Find and highlight what's different
   */
  findDifferences(before, after) {
    const diffs = [];

    if (before.npcAttitude !== after.npcAttitude) {
      diffs.push(`NPC attitude: ${before.npcAttitude} → ${after.npcAttitude}`);
    }

    if (before.doorOpen !== after.doorOpen) {
      diffs.push(`Door: ${before.doorOpen ? 'open' : 'closed'} → ${after.doorOpen ? 'open' : 'closed'}`);
    }

    if (before.alarmRaised !== after.alarmRaised) {
      diffs.push(`Alarm: ${before.alarmRaised ? 'yes' : 'no'} → ${after.alarmRaised ? 'yes' : 'no'}`);
    }

    return diffs;
  }

  /**
   * NO JARGON IN PLAYER-FACING NARRATIVE
   * 
   * We never say:
   * - "You have advantage"
   * Instead: "Your position is strong. Fortune favors you."
   * 
   * We never say:
   * - "Make a Persuasion check"
   * Instead: "Can you convince them?"
   */
  stripJargon(mechanicalStatement) {
    const jargonMap = {
      'roll d20 + modifier vs. DC': 'Roll the dice. Try to hit this target number.',
      'make a check': 'Try it.',
      'you have advantage': 'Conditions favor you. Good odds.',
      'you have disadvantage': 'The odds are against you. Risky.',
      'natural 20': 'You rolled a 20. Perfect success.',
      'natural 1': 'You rolled a 1. Something goes wrong.',
      'saving throw': 'Resist the effect.',
      'critical hit': 'Perfect strike.',
      'initiative': 'Everyone gets ready to act.'
    };

    // Replace jargon with plain language
    let clean = mechanicalStatement;
    for (const [jargon, plain] of Object.entries(jargonMap)) {
      clean = clean.replace(new RegExp(jargon, 'gi'), plain);
    }

    return clean;
  }
}

export { NarrativeLegibilityEngine };
