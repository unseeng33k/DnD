#!/usr/bin/env node

/**
 * STAKES ENGINE & RESOLUTION ENGINE
 * 
 * Takes intent + stakes and produces:
 * 1. Outcome (success/failure/complication)
 * 2. Narrative describing what happened
 * 3. World state changes
 * 4. Next decision point
 * 
 * The heartbeat: INTENT → STAKES → RESOLUTION → WORLD UPDATE → NEXT TURN
 */

class StakesAndResolutionEngine {
  constructor(rules = null, worldState = null) {
    this.rules = rules; // AD&D rule engine
    this.worldState = worldState || this.initializeWorldState();
    this.resolutionHistory = [];
  }

  /**
   * Initialize world state
   */
  initializeWorldState() {
    return {
      locations: {},
      npcs: {},
      partyState: {},
      factions: {},
      timeline: [],
      secrets: []
    };
  }

  /**
   * ANALYZE STAKES
   * Make the stakes LEGIBLE to players
   * 
   * Input: intent + NPC context
   * Output: Clear statement of what's at risk
   */
  analyzeStakes(intent, npcContext, attempt = null) {
    const stakes = {
      onSuccess: [],
      onFailure: [],
      onComplication: [],
      likelihood: 'moderate'
    };

    // Goal-specific stakes
    if (intent.primaryGoal === 'secure_passage') {
      stakes.onSuccess.push('Guard steps aside, you can enter');
      stakes.onFailure.push('Guard becomes hostile, may alert others');
      stakes.onComplication.push('Guard becomes suspicious but doesn\'t attack');
    }

    if (intent.primaryGoal === 'gain_information') {
      stakes.onSuccess.push('You learn what they know');
      stakes.onFailure.push('They give you wrong information OR refuse');
      stakes.onComplication.push('They give you partial truth, mixed with lies');
    }

    if (intent.primaryGoal === 'form_relationship') {
      stakes.onSuccess.push('NPC becomes friendly, offers aid');
      stakes.onFailure.push('NPC distrusts you');
      stakes.onComplication.push('NPC sees potential but needs proof of good faith');
    }

    // Adjust for NPC personality
    if (npcContext) {
      if (npcContext.traits && npcContext.traits.includes('paranoid')) {
        stakes.likelihood = 'failure_likely';
        stakes.onFailure.push('NPC sees threat in your actions');
      }
      if (npcContext.traits && npcContext.traits.includes('greedy')) {
        stakes.onSuccess.push('But they may demand payment');
      }
    }

    // Adjust for attempt type
    if (attempt) {
      if (attempt.method === 'deception') {
        stakes.likelihood = 'risky'; // Deception has higher failure cost
        stakes.onFailure.push('If caught lying, they may attack');
      }
      if (attempt.method === 'social') {
        stakes.likelihood = 'moderate'; // Social interaction is balanced
      }
    }

    return stakes;
  }

  /**
   * DETERMINE UNCERTAINTY
   * Do we roll? Or is it automatic?
   */
  determineUncertainty(intent, npcContext = null) {
    // Auto-success scenarios
    if (intent.method === 'social' && npcContext?.attitude === 'friendly') {
      return { rollNeeded: false, type: 'auto_success' };
    }

    // Auto-failure scenarios
    if (intent.method === 'deception' && npcContext?.intelligence === 'very_high') {
      return { rollNeeded: false, type: 'auto_failure' };
    }

    // Combat is always uncertain
    if (intent.method === 'combat') {
      return { rollNeeded: true, type: 'attack_roll' };
    }

    // Social interaction usually needs uncertainty
    if (intent.method === 'social') {
      return { rollNeeded: true, type: 'ability_check', ability: 'CHA' };
    }

    // Deception/stealth need checks
    if (intent.method === 'deception') {
      return { rollNeeded: true, type: 'ability_check', ability: 'CHA' };
    }
    if (intent.method === 'stealth') {
      return { rollNeeded: true, type: 'ability_check', ability: 'DEX' };
    }

    // Default: roll if uncertain
    return { rollNeeded: true, type: 'ability_check', ability: 'WIS' };
  }

  /**
   * RESOLVE ACTION
   * 
   * Input: intent + character + stakes
   * Output: {success, narrative, worldChanges, nextChoice}
   */
  resolveAction(intent, character, npcContext = null, difficulty = null) {
    const resolution = {
      intent: intent.primaryGoal,
      method: intent.method,
      outcome: null,
      outcomeType: null, // success, failure, complication, auto_success, auto_failure
      roll: null,
      dc: null,
      narrative: '',
      worldChanges: [],
      npcReaction: null,
      partyConsequences: [],
      nextDecisionPoint: '',
      fictionCoherence: null // How well does result fit established fiction?
    };

    // Step 1: Determine if roll is needed
    const uncertainty = this.determineUncertainty(intent, npcContext);

    // Step 2: If roll needed, make it
    if (uncertainty.rollNeeded) {
      const dc = difficulty || this.calculateDC(intent, npcContext);
      const modifier = this.getModifier(character, uncertainty.ability);
      const d20 = Math.floor(Math.random() * 20) + 1;
      const total = d20 + modifier;

      resolution.roll = { d20, modifier, total };
      resolution.dc = dc;

      // Determine outcome
      if (total >= dc) {
        resolution.outcomeType = 'success';
        resolution.outcome = true;
      } else if (total < dc - 5) {
        resolution.outcomeType = 'critical_failure';
        resolution.outcome = false;
      } else {
        resolution.outcomeType = 'complication'; // Close failure = interesting complication
        resolution.outcome = 'complication';
      }
    } else if (uncertainty.type === 'auto_success') {
      resolution.outcomeType = 'auto_success';
      resolution.outcome = true;
    } else if (uncertainty.type === 'auto_failure') {
      resolution.outcomeType = 'auto_failure';
      resolution.outcome = false;
    }

    // Step 3: Generate NARRATIVE that explains outcome
    resolution.narrative = this.generateNarrative(
      resolution.outcome,
      resolution.outcomeType,
      intent,
      npcContext,
      resolution.roll
    );

    // Step 4: Determine WORLD CHANGES
    resolution.worldChanges = this.calculateWorldChanges(
      intent,
      resolution.outcome,
      npcContext
    );

    // Step 5: NPC REACTION
    if (npcContext) {
      resolution.npcReaction = this.calculateNPCReaction(
        intent,
        resolution.outcome,
        npcContext
      );
    }

    // Step 6: Next decision point
    resolution.nextDecisionPoint = this.getNextDecisionPoint(
      resolution.outcome,
      intent,
      npcContext
    );

    return resolution;
  }

  /**
   * Calculate DC based on context
   */
  calculateDC(intent, npcContext = null) {
    let baseDC = 10;

    // Method difficulty
    if (intent.method === 'deception') baseDC = 12;
    if (intent.method === 'combat') baseDC = 12;
    if (intent.method === 'social') baseDC = 12;
    if (intent.method === 'stealth') baseDC = 13;

    // NPC difficulty
    if (npcContext) {
      if (npcContext.intelligence === 'very_high') baseDC += 2;
      if (npcContext.attitude === 'hostile') baseDC += 2;
      if (npcContext.attitude === 'friendly') baseDC -= 2;
    }

    return baseDC;
  }

  /**
   * Get ability modifier for character
   */
  getModifier(character, ability) {
    if (!character || !character.abilityScores) return 0;

    const scores = character.abilityScores;
    const score = scores[ability] || 10;
    return Math.floor((score - 10) / 2);
  }

  /**
   * GENERATE NARRATIVE
   * Describe what happened in vivid, compact language
   */
  generateNarrative(outcome, outcomeType, intent, npcContext, roll) {
    const narratives = {
      success_social: [
        `${npcContext?.name || 'The NPC'} nods slowly, considering your words. Conviction crosses their face.`,
        `Your carefully chosen words strike a chord. ${npcContext?.name || 'They'} begin to relax.`,
        `Something you said resonated. ${npcContext?.name || 'The guard'} steps aside.`
      ],
      success_deception: [
        `Your lie lands perfectly. ${npcContext?.name || 'They'} believe you without question.`,
        `You spin a convincing tale. ${npcContext?.name || 'They'} don't suspect a thing.`,
        `${npcContext?.name || 'The NPC'} accepts your story completely.`
      ],
      success_combat: [
        `Your strike finds its mark! ${npcContext?.name || 'Your enemy'} reels backward.`,
        `You land a solid blow. ${npcContext?.name || 'They'} grunt in pain.`,
        `Your weapon connects. Blood drips.`
      ],
      complication: [
        `${npcContext?.name || 'The NPC'} seems unconvinced but not hostile. They ask a clarifying question.`,
        `Your attempt doesn't fully work, but you haven't failed. Things are... uncertain.`,
        `${npcContext?.name || 'They'} are on the fence. One wrong word could tip things.`
      ],
      failure_social: [
        `${npcContext?.name || 'They'} narrow their eyes. Your plea falls on deaf ears.`,
        `Your words seem to make things worse. ${npcContext?.name || 'They'} become defensive.`,
        `${npcContext?.name || 'The guard'} shakes their head firmly. No.`
      ],
      failure_deception: [
        `Something in your delivery rings false. ${npcContext?.name || 'They'} catch the lie.`,
        `${npcContext?.name || 'They'} don't believe you. Not for a second.`,
        `Your deception crumbles. ${npcContext?.name || 'They'}} see through it.`
      ],
      critical_failure: [
        `Catastrophe. Your attempt goes horribly wrong.`,
        `The worst outcome: ${npcContext?.name || 'They'} are now actively hostile.`,
        `Everything you feared. Everything falls apart.`
      ]
    };

    const key = `${outcomeType}_${intent.method}` || outcomeType;
    const options = narratives[key] || narratives['complication'];
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Calculate world changes based on outcome
   */
  calculateWorldChanges(intent, outcome, npcContext = null) {
    const changes = [];

    if (intent.primaryGoal === 'secure_passage' && outcome === true) {
      changes.push({ type: 'location_accessible', location: 'next_area' });
      changes.push({ type: 'npc_attitude_change', npc: npcContext?.id, attitude: 'friendly' });
    }

    if (intent.primaryGoal === 'gain_information' && outcome === true) {
      changes.push({ type: 'lore_revealed', lore: 'contextual' });
      changes.push({ type: 'party_knowledge_increase' });
    }

    if (intent.primaryGoal === 'form_relationship' && outcome === true) {
      changes.push({ type: 'faction_reputation_increase', faction: npcContext?.faction });
      changes.push({ type: 'npc_becomes_ally', npc: npcContext?.id });
    }

    if (intent.method === 'combat' && outcome === false) {
      changes.push({ type: 'combat_continues' });
      changes.push({ type: 'party_under_pressure' });
    }

    return changes;
  }

  /**
   * Calculate NPC reaction
   */
  calculateNPCReaction(intent, outcome, npcContext) {
    if (!npcContext) return null;

    const reaction = {
      npc: npcContext.id,
      emotionalState: 'neutral',
      likelihood: null,
      willHelp: false,
      willAttack: false,
      willAlertOthers: false
    };

    if (outcome === true) {
      reaction.emotionalState = 'pleased';
      reaction.willHelp = true;
    } else if (outcome === false) {
      reaction.emotionalState = 'angry';
      if (intent.method === 'deception') {
        reaction.willAlertOthers = true;
      }
      if (intent.method === 'combat' || intent.method === 'threaten') {
        reaction.willAttack = true;
      }
    } else if (outcome === 'complication') {
      reaction.emotionalState = 'uncertain';
      reaction.likelihood = '50/50';
    }

    return reaction;
  }

  /**
   * Get NEXT DECISION POINT
   * Where does play go from here?
   */
  getNextDecisionPoint(outcome, intent, npcContext = null) {
    if (outcome === true) {
      if (intent.primaryGoal === 'secure_passage') {
        return 'You enter the next chamber. What do you do?';
      }
      if (intent.primaryGoal === 'gain_information') {
        return 'You now know the truth. What will you do with it?';
      }
      return 'The path forward is clear. What next?';
    }

    if (outcome === false) {
      if (intent.method === 'combat') {
        return 'Combat intensifies. You are in danger. Roll for initiative!';
      }
      if (intent.method === 'deception') {
        return `${npcContext?.name || 'They'} now suspect you. What do you do?`;
      }
      return 'The situation worsens. Act quickly.';
    }

    if (outcome === 'complication') {
      return `${npcContext?.name || 'The NPC'} still hasn't made up their mind. You could try again, offer something, or move on.`;
    }

    return 'The next move is yours.';
  }
}

export { StakesAndResolutionEngine };
