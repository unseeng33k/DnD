#!/usr/bin/env node

/**
 * AGENCY RESPECT ENGINE
 * 
 * When players propose something creative that's not "in the book":
 * - Parse the underlying intent
 * - Map it to some combination of checks/state changes
 * - Reward cleverness with better odds, narrative, or new hooks
 * 
 * CORE PRINCIPLE: Never say "you can't do that"
 * Instead: "Here's how that works..."
 */

class AgencyRespectEngine {
  constructor() {
    this.customActions = []; // Track novel actions
    this.creativeBonus = {}; // Bonus for cleverness
  }

  /**
   * EVALUATE CUSTOM ACTION
   * 
   * Player: "Instead of fighting, I want to crash a wagon into the bridge
   *          to collapse it and trap the enemies on the other side."
   */
  evaluateCustomAction(playerIntention, context = {}) {
    const evaluation = {
      action: playerIntention,
      feasible: true,
      mechanics: [],
      difficulty: 'moderate',
      reward: null,
      narrative: null
    };

    // Step 1: PARSE INTENTION
    const parsed = this.parseIntention(playerIntention);
    evaluation.parsed = parsed;

    // Step 2: MAP TO MECHANICS
    const mechanics = this.mapToMechanics(parsed, context);
    evaluation.mechanics = mechanics;

    // Step 3: ASSESS DIFFICULTY
    evaluation.difficulty = this.assessDifficulty(parsed, mechanics);

    // Step 4: CHECK FEASIBILITY
    evaluation.feasible = this.checkFeasibility(parsed, context);

    if (!evaluation.feasible) {
      evaluation.reason = 'Not possible given current situation';
      return evaluation;
    }

    // Step 5: ASSESS CLEVERNESS
    const cleverness = this.assessCleverness(parsed, context);
    evaluation.cleverness = cleverness;

    // Step 6: APPLY REWARD
    if (cleverness.isClever) {
      evaluation.reward = this.applyCleverBonus(cleverness);
    }

    // Step 7: GENERATE NARRATIVE
    evaluation.narrative = this.generateNarrative(parsed, evaluation);

    return evaluation;
  }

  /**
   * PARSE INTENTION
   * 
   * Break down what player actually wants
   */
  parseIntention(statement) {
    const intention = {
      verb: '', // What are they doing?
      object: '', // What are they doing it to?
      method: '', // How are they doing it?
      goal: '', // Why are they doing it?
      constraints: [] // What limits do they accept?
    };

    // Extract verb (first action)
    const verbMatch = statement.match(/^(i\s+)?(\w+)/i);
    if (verbMatch) intention.verb = verbMatch[2].toLowerCase();

    // Extract goal (often after "to" or "so that")
    const goalMatch = statement.match(/(?:to|so that|in order to)\s+(.+?)(?:\.|$)/i);
    if (goalMatch) intention.goal = goalMatch[1];

    // Extract method details
    const methodMatch = statement.match(/(?:by|using|with)\s+(.+?)(?:\.|$)/i);
    if (methodMatch) intention.method = methodMatch[1];

    return intention;
  }

  /**
   * MAP TO MECHANICS
   * 
   * How does this action work in D&D terms?
   */
  mapToMechanics(parsed, context) {
    const mechanics = [];

    // Most custom actions are combinations of:
    // - Ability check (STR to crash wagon, DEX to climb, INT to calculate)
    // - Skill check (Acrobatics, Stealth, etc.)
    // - Attack roll (if it involves hitting something)
    // - Save (if it involves damage)
    // - Resource expenditure (HP, items, spells)

    const verb = parsed.verb.toLowerCase();

    // CRASH/DESTROY
    if (['crash', 'destroy', 'collapse', 'break'].includes(verb)) {
      mechanics.push({
        type: 'ability_check',
        ability: 'STR',
        description: 'Strength to force/push/break the object'
      });
      mechanics.push({
        type: 'damage_roll',
        damage: '3d6', // Impact damage
        target: 'structure'
      });
    }

    // CLIMB/ESCAPE/TRICK
    if (['climb', 'escape', 'trick', 'deceive'].includes(verb)) {
      mechanics.push({
        type: 'ability_check',
        ability: 'DEX',
        description: 'Dexterity for finesse/acrobatics'
      });
      mechanics.push({
        type: 'ability_check',
        ability: 'CHA',
        description: 'Charisma for deception'
      });
    }

    // CALCULATE/PREDICT
    if (['calculate', 'predict', 'analyze', 'understand'].includes(verb)) {
      mechanics.push({
        type: 'ability_check',
        ability: 'INT',
        description: 'Intelligence to solve/understand'
      });
    }

    // If no mechanics identified, default to primary intent
    if (mechanics.length === 0) {
      mechanics.push({
        type: 'ability_check',
        ability: 'WIS',
        description: 'Wisdom check to resolve'
      });
    }

    return mechanics;
  }

  /**
   * ASSESS DIFFICULTY
   * 
   * Is this action easy, moderate, hard, or nearly impossible?
   */
  assessDifficulty(parsed, mechanics) {
    let difficulty = 12; // Base moderate DC

    // Adjust based on how creative it is
    if (parsed.method && parsed.method.includes('creative')) {
      difficulty -= 2; // Cleverness earns easier check
    }

    // Adjust based on number of checks required
    if (mechanics.length > 2) {
      difficulty += 2; // Multiple checks = harder overall
    }

    // Adjust based on goal
    if (parsed.goal.includes('only way') || parsed.goal.includes('desperate')) {
      difficulty -= 1; // Desperation makes unlikely ideas work
    }

    if (difficulty < 8) difficulty = 8; // Floor
    if (difficulty > 16) difficulty = 16; // Ceiling

    return difficulty;
  }

  /**
   * CHECK FEASIBILITY
   * 
   * Is this action possible given current situation?
   */
  checkFeasibility(parsed, context) {
    const verb = parsed.verb.toLowerCase();

    // You can't cast spells if silenced and your action requires incantation
    if (context.silenced && verb.includes('cast')) {
      return false;
    }

    // You can't climb if you're paralyzed
    if (context.paralyzed && verb.includes('climb')) {
      return false;
    }

    // You can't deceive if they can read minds
    if (context.mindReader && verb.includes('deceive')) {
      return false;
    }

    // Most actions are feasible unless explicitly blocked
    return true;
  }

  /**
   * ASSESS CLEVERNESS
   * 
   * Is this action clever? Does it deserve bonus?
   */
  assessCleverness(parsed, context) {
    const score = {
      isClever: false,
      reason: '',
      bonus: 0
    };

    // Clever if: uses unexpected combination of mechanics
    if (parsed.method && parsed.method.length > 20) {
      score.isClever = true;
      score.reason = 'Detailed, well-thought-out plan';
      score.bonus = 2; // +2 to roll
    }

    // Clever if: solves problem without violence
    if (context.nonviolent && parsed.goal && !parsed.goal.includes('kill')) {
      score.isClever = true;
      score.reason = 'Creative non-violent solution';
      score.bonus = 1; // +1 to roll
    }

    // Clever if: uses terrain/environment
    if (parsed.method && (parsed.method.includes('environment') || parsed.method.includes('terrain'))) {
      score.isClever = true;
      score.reason = 'Uses environment creatively';
      score.bonus = 1;
    }

    // Clever if: risky (high stakes = high creativity)
    if (context.risky) {
      score.isClever = true;
      score.reason = 'Risky but creative approach';
      score.bonus = 1;
    }

    return score;
  }

  /**
   * APPLY CLEVER BONUS
   * 
   * How do we reward cleverness?
   */
  applyCleverBonus(cleverness) {
    if (!cleverness.isClever) return null;

    return {
      rollBonus: cleverness.bonus, // Bonus to check
      narrativeBonus: 'more vivid description',
      storytelling: 'consequences are more interesting',
      worldHook: 'success opens new narrative threads'
    };
  }

  /**
   * GENERATE NARRATIVE
   * 
   * How do we describe what happens?
   */
  generateNarrative(parsed, evaluation) {
    if (!evaluation.feasible) {
      return `You try to ${parsed.verb}, but the situation doesn't allow it. You need another approach.`;
    }

    if (evaluation.cleverness && evaluation.cleverness.isClever) {
      return `It's a ${evaluation.difficulty} check to ${parsed.verb}. Your creative approach gives you +${evaluation.cleverness.bonus}.`;
    }

    return `Make a ${evaluation.mechanics[0]?.ability || 'WIS'} check (DC ${evaluation.difficulty}) to ${parsed.verb}.`;
  }

  /**
   * "YES, AND" PATTERN
   * 
   * When player tries something novel, default to "yes" with complications
   */
  yesAndApproach(playerAction, context = {}) {
    const result = {
      answer: 'YES, AND...',
      action: playerAction,
      mechanics: [],
      complication: null
    };

    // Instead of "no," ask what they're really trying to do
    const parsed = this.parseIntention(playerAction);

    // Map to mechanics
    result.mechanics = this.mapToMechanics(parsed, context);

    // Add a complication (makes it interesting)
    result.complication = this.generateComplication(parsed, context);

    result.narrative = `Yes, you can try that. Here's how it works: ${result.mechanics.map(m => m.description).join(', ')}. But there's a catch: ${result.complication}`;

    return result;
  }

  /**
   * GENERATE COMPLICATION
   * 
   * Every custom action has a catch
   */
  generateComplication(parsed, context) {
    const complications = [
      'It takes longer than you expected',
      'Someone notices what you\'re doing',
      'It uses up resources you might need later',
      'It attracts unwanted attention',
      'It works, but the consequences are messier than planned',
      'It requires commitment - you can\'t undo it'
    ];

    return complications[Math.floor(Math.random() * complications.length)];
  }

  /**
   * NEVER SAY "YOU CAN'T"
   * 
   * Reframe any refusal as "here's how it works"
   */
  reframeRefusal(impossibleAction, reason) {
    // Instead of: "You can't do that"
    // Say: "Here's why that won't work, what could work instead?"

    const reframes = {
      'silenced': 'You can\'t cast spells (you\'re silenced), but you could gesture-based magic or use scrolls.',
      'paralyzed': 'You can\'t move, but you could try to break the paralysis with a save.',
      'charmed': 'You can\'t attack them (you\'re charmed), but you could try to resist with a save.',
      'not_possible': 'That won\'t work as described, but you could try: [alternative]'
    };

    return reframes[reason] || `That approach won't work, but you could try something else...`;
  }
}

export { AgencyRespectEngine };
