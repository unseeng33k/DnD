#!/usr/bin/env node

/**
 * SPOTLIGHT TRACKING ENGINE
 * 
 * Under the hood fairness regulator:
 * - Who has driven major outcomes recently?
 * - Which PC traits/backstory hooks have been underused?
 * - Who has been mechanically busy but narratively invisible?
 * 
 * Biases world to ensure:
 * - Everyone gets legitimate chances to bend story
 * - Spotlight is distributed, not monopolized
 * - No one becomes permanent NPC in their own campaign
 */

class SpotlightTrackingEngine {
  constructor(partyMembers = []) {
    this.party = partyMembers; // Array of PC objects
    this.spotlightHistory = []; // Who drove outcomes
    this.narrativeInvestment = {}; // Tracking narrative moments
    this.mechanicalBusy = {}; // Who rolled what
    this.backStoryHooks = {}; // Which hooks have been used
    this.nextSpotlight = null; // Who should get spotlight next
    
    // Initialize tracking
    for (const pc of partyMembers) {
      this.narrativeInvestment[pc.id] = 0;
      this.mechanicalBusy[pc.id] = 0;
      this.backStoryHooks[pc.id] = pc.backStory || [];
    }
  }

  /**
   * RECORD SPOTLIGHT EVENT
   * 
   * When a PC drives outcome
   */
  recordSpotlight(pcId, eventType, description = '') {
    const event = {
      pcId,
      type: eventType, // 'major_decision', 'clever_solution', 'combat_action', 'negotiation', 'backstory'
      description,
      timestamp: Date.now(),
      sessionNumber: this.getSessionNumber(),
      narrativeWeight: this.getWeight(eventType)
    };

    this.spotlightHistory.push(event);
    this.narrativeInvestment[pcId] += event.narrativeWeight;
  }

  /**
   * RECORD MECHANICAL BUSY-NESS
   * 
   * Who rolled what (combat spotlight vs. narrative spotlight)
   */
  recordMechanicalAction(pcId, actionType, rollCount = 1) {
    // Track that this PC made rolls
    // But distinguish from narrative action
    
    const action = {
      pcId,
      type: actionType, // 'attack', 'skill_check', 'save', 'spell'
      count: rollCount,
      timestamp: Date.now()
    };

    this.mechanicalBusy[pcId] += rollCount;
  }

  /**
   * GET SPOTLIGHT BALANCE
   * 
   * Who has driven outcomes? Is it balanced?
   */
  getSpotlightBalance() {
    const balance = {};

    for (const pc of this.party) {
      const narrative = this.narrativeInvestment[pc.id] || 0;
      const mechanical = this.mechanicalBusy[pc.id] || 0;
      const total = narrative + mechanical;

      balance[pc.id] = {
        name: pc.name,
        narrativeSpotlight: narrative,
        mechanicalSpotlight: mechanical,
        total,
        percentOfPartyTotal: (total / this.getTotalSpotlight() * 100).toFixed(0) + '%',
        status: this.getSpotlightStatus(total)
      };
    }

    return balance;
  }

  /**
   * GET SPOTLIGHT STATUS
   */
  getSpotlightStatus(totalSpotlight) {
    const average = this.getTotalSpotlight() / this.party.length;

    if (totalSpotlight < average * 0.5) {
      return 'UNDERREPRESENTED'; // This PC needs spotlight
    }
    if (totalSpotlight > average * 1.5) {
      return 'OVERREPRESENTED'; // This PC is hogging it
    }
    return 'BALANCED';
  }

  /**
   * GET NEXT SPOTLIGHT RECOMMENDATION
   * 
   * Who should get spotlight next?
   */
  recommendNextSpotlight() {
    const balance = this.getSpotlightBalance();
    const underrepresented = [];
    const average = this.getTotalSpotlight() / this.party.length;

    for (const [pcId, stats] of Object.entries(balance)) {
      if (stats.narrativeSpotlight < average * 0.6) {
        underrepresented.push({
          pcId,
          name: stats.name,
          deficit: average - stats.narrativeSpotlight
        });
      }
    }

    // Sort by deficit
    underrepresented.sort((a, b) => b.deficit - a.deficit);

    if (underrepresented.length > 0) {
      return {
        recommendation: underrepresented[0],
        reason: `${underrepresented[0].name} hasn't driven many outcomes recently. Time to spotlight their moment.`,
        unused_hooks: this.getUnusedHooks(underrepresented[0].pcId)
      };
    }

    return null;
  }

  /**
   * GET UNUSED BACKSTORY HOOKS
   * 
   * Which of this PC's story threads haven't been used?
   */
  getUnusedHooks(pcId) {
    const pc = this.party.find(p => p.id === pcId);
    if (!pc || !pc.backStory) return [];

    const usedHooks = this.spotlightHistory
      .filter(e => e.pcId === pcId && e.type === 'backstory')
      .map(e => e.description);

    return pc.backStory.filter(hook => !usedHooks.includes(hook));
  }

  /**
   * BIAS WORLD TO NEXT PC
   * 
   * When engine generates encounters/NPCs, favor hooks of underrepresented PC
   */
  getEncounterBias() {
    const rec = this.recommendNextSpotlight();
    if (!rec) return null;

    const pc = this.party.find(p => p.id === rec.recommendation.pcId);
    const hooks = rec.unused_hooks;

    return {
      targetPC: pc,
      hooks: hooks.slice(0, 3), // Top 3 hooks
      bias: 'HIGH' // Engine should favor this PC's story
    };
  }

  /**
   * CUSTOM MOMENT
   * 
   * Create a decision point tailored to underrepresented PC
   */
  generateCustomMoment(pcId) {
    const pc = this.party.find(p => p.id === pcId);
    if (!pc) return null;

    const hooks = this.getUnusedHooks(pcId);
    if (hooks.length === 0) return null;

    const hook = hooks[0]; // Use first unused hook

    const moment = {
      pcId,
      pcName: pc.name,
      hook: hook,
      description: `This moment speaks directly to ${pc.name}'s story: "${hook}"`,
      isCustom: true,
      mechanics: [], // Will be filled based on hook
      expectedOutcome: 'PC gets to use their unique skills/traits'
    };

    return moment;
  }

  /**
   * WHICH ABILITIES GET CUSTOM MOMENTS?
   * 
   * Track which abilities have been used in spotlight
   */
  getUnusedAbilities(pcId) {
    const pc = this.party.find(p => p.id === pcId);
    if (!pc || !pc.abilities) return [];

    const usedAbilities = this.spotlightHistory
      .filter(e => e.pcId === pcId && e.type === 'ability_moment')
      .map(e => e.description);

    return pc.abilities.filter(ability => !usedAbilities.includes(ability));
  }

  /**
   * SUGGESTION: Who should make the next big decision?
   */
  suggestNextDecisionMaker() {
    const balance = this.getSpotlightBalance();
    const sorted = Object.entries(balance)
      .sort((a, b) => a[1].total - b[1].total); // Least spotlight first

    if (sorted.length > 0) {
      return {
        suggestedPC: sorted[0][1].name,
        spotlight: sorted[0][1].total,
        reason: 'This PC has driven fewest outcomes recently'
      };
    }

    return null;
  }

  /**
   * COMBAT FAIRNESS CHECK
   * 
   * In combat: did everyone get meaningful turns?
   */
  getCombatFairness() {
    // Track who got effective actions in last combat
    const combatActions = this.spotlightHistory.filter(e => 
      e.type.includes('combat') && 
      e.timestamp > Date.now() - (1000 * 60 * 30) // Last 30 min
    );

    const combatSpotlight = {};
    for (const action of combatActions) {
      combatSpotlight[action.pcId] = (combatSpotlight[action.pcId] || 0) + 1;
    }

    // Who didn't act?
    const silent = [];
    for (const pc of this.party) {
      if (!combatSpotlight[pc.id] || combatSpotlight[pc.id] === 0) {
        silent.push(pc);
      }
    }

    return {
      actionsPerPC: combatSpotlight,
      silentPCs: silent,
      fairness: silent.length === 0 ? 'FAIR' : 'UNFAIR'
    };
  }

  /**
   * NARRATIVE VISIBILITY CHECK
   * 
   * Who has been mechanically busy but narratively invisible?
   */
  getNarrativeVisibilityCheck() {
    const check = {};

    for (const pc of this.party) {
      const mechanical = this.mechanicalBusy[pc.id] || 0;
      const narrative = this.narrativeInvestment[pc.id] || 0;

      // If high mechanical but low narrative, they're invisible
      if (mechanical > 5 && narrative < 3) {
        check[pc.id] = {
          name: pc.name,
          issue: 'INVISIBLE',
          mechanicalRolls: mechanical,
          narrativeSpotlight: narrative,
          recommendation: 'Give this PC a narrative moment soon'
        };
      }
    }

    return check;
  }

  /**
   * HELPER: Get total spotlight
   */
  getTotalSpotlight() {
    return Object.values(this.narrativeInvestment).reduce((sum, val) => sum + val, 0);
  }

  /**
   * HELPER: Get weight of event type
   */
  getWeight(eventType) {
    const weights = {
      'major_decision': 3, // Big choice
      'clever_solution': 2.5, // Ingenuity
      'combat_action': 1, // One combat turn
      'negotiation': 2, // Social interaction
      'backstory': 3 // Personal moment
    };

    return weights[eventType] || 1;
  }

  /**
   * HELPER: Get session number (simplified)
   */
  getSessionNumber() {
    return Math.floor(this.spotlightHistory.length / 10) + 1;
  }
}

export { SpotlightTrackingEngine };
