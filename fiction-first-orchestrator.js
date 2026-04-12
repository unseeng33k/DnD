#!/usr/bin/env node

/**
 * FICTION-FIRST RULES ORCHESTRATOR
 * 
 * The unified brain that sits between players and subsystems.
 * 
 * Every player action flows through ONE decision engine:
 * Fiction (intent) → Parse → Consult world + rules → Decide randomness → Update state → Narrate
 * 
 * This is the nervous system that makes all five pillars work as ONE coherent experience.
 */

class FictionFirstOrchestrator {
  constructor(worldState, rulesModules, subsystems) {
    this.world = worldState;
    this.rules = rulesModules; // {combat, magic, social, skills, exploration, etc}
    this.subsystems = subsystems; // Combat engine, magic engine, etc.
    this.decisionLog = [];
  }

  /**
   * THE CORE ORCHESTRATION LOOP
   * 
   * This is called ONCE per player action. Everything flows through here.
   */
  async orchestrateAction(playerAction) {
    const orchestration = {
      timestamp: Date.now(),
      playerAction: playerAction,
      stages: {}
    };

    // STAGE 1: PARSE INTENT FROM FICTION
    orchestration.stages.parseIntent = await this.parseIntentFromFiction(playerAction);

    // STAGE 2: CONSULT WORLD STATE + RULES
    orchestration.stages.consultContext = await this.consultContextualRules(
      orchestration.stages.parseIntent,
      this.world
    );

    // STAGE 3: DECIDE RANDOMNESS
    orchestration.stages.randomnessDecision = await this.decideRandomness(
      orchestration.stages.consultContext
    );

    // STAGE 4: EXECUTE SUBSYSTEM(S)
    orchestration.stages.subsystemExecution = await this.executeSubsystems(
      orchestration.stages.randomnessDecision,
      orchestration.stages.consultContext
    );

    // STAGE 5: UPDATE WORLD STATE
    orchestration.stages.stateUpdate = await this.updateWorldState(
      orchestration.stages.subsystemExecution
    );

    // STAGE 6: NARRATE OUTCOME
    orchestration.stages.narrative = await this.narrateOutcome(
      orchestration.stages.subsystemExecution,
      orchestration.stages.stateUpdate
    );

    this.decisionLog.push(orchestration);
    return orchestration;
  }

  /**
   * STAGE 1: PARSE INTENT FROM FICTION
   * 
   * "I want to leap from the balcony, knock the goblin off the cart, and grab the reins"
   * 
   * Extract:
   * - Goal (what are they trying to accomplish?)
   * - Means (how are they doing it?)
   * - Style (what's the narrative flavor?)
   */
  async parseIntentFromFiction(statement) {
    const parsing = {
      rawStatement: statement,
      goal: null, // What do they want to achieve?
      goals: [], // Multiple possible goals
      means: [], // How they plan to achieve it
      style: null, // Narrative flavor
      constraints: [], // What limits them?
      risks: [] // What could go wrong?
    };

    // Extract primary goal (what comes first after "I want to")
    const goalMatch = statement.match(/(?:want to|try to|attempt to|do)\s+(.+?)(?:\s*,|\s+and|\s*$)/i);
    if (goalMatch) {
      parsing.goal = goalMatch[1].trim();
    }

    // Extract all goals (comma or "and" separated)
    const allGoals = statement.split(/,|and/).map(s => s.trim());
    parsing.goals = allGoals.filter(g => g.length > 0);

    // Extract means (what mechanics/skills are involved?)
    parsing.means = this.extractMechanics(statement);

    // Extract style (any color/flavor in the action?)
    parsing.style = this.extractStyle(statement);

    // Extract constraints (what's blocking them?)
    parsing.constraints = this.extractConstraints(statement);

    return parsing;
  }

  /**
   * Extract mechanics from statement
   * 
   * "leap" → acrobatics
   * "knock off" → strength/athletics
   * "grab" → dexterity
   */
  extractMechanics(statement) {
    const mechanics = [];

    const mechanicMap = {
      'leap|jump|vault': { skill: 'acrobatics', ability: 'DEX', type: 'movement' },
      'knock|push|shove': { skill: 'athletics', ability: 'STR', type: 'physical' },
      'grab|catch|seize': { skill: 'acrobatics', ability: 'DEX', type: 'physical' },
      'sneak|hide|creep': { skill: 'stealth', ability: 'DEX', type: 'stealth' },
      'persuade|convince|negotiate': { skill: 'persuasion', ability: 'CHA', type: 'social' },
      'deceive|bluff|lie': { skill: 'deception', ability: 'CHA', type: 'social' },
      'intimidate|threaten': { skill: 'intimidation', ability: 'CHA', type: 'social' },
      'charm|seduce': { skill: 'performance', ability: 'CHA', type: 'social' },
      'analyze|investigate|search': { skill: 'investigation', ability: 'INT', type: 'mental' },
      'track|notice|observe': { skill: 'perception', ability: 'WIS', type: 'mental' },
      'heal|help': { skill: 'medicine', ability: 'WIS', type: 'utility' },
      'break|damage|destroy': { skill: 'athletics', ability: 'STR', type: 'physical' }
    };

    for (const [keywords, mechanic] of Object.entries(mechanicMap)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(statement)) {
        mechanics.push(mechanic);
      }
    }

    return mechanics;
  }

  /**
   * Extract style (narrative flavor)
   */
  extractStyle(statement) {
    const styleKeywords = {
      'daring|bold|reckless|audacious': 'daring',
      'careful|cautious|methodical|planned': 'careful',
      'creative|unusual|unexpected': 'creative',
      'brutal|violent|aggressive': 'aggressive',
      'subtle|quiet|sneaky|stealthy': 'subtle'
    };

    for (const [keywords, style] of Object.entries(styleKeywords)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(statement)) {
        return style;
      }
    }

    return 'standard';
  }

  /**
   * Extract constraints (what limits this action?)
   */
  extractConstraints(statement) {
    const constraints = [];

    // Check for negations
    if (/without/.test(statement)) constraints.push('improvised');
    if (/while/.test(statement)) constraints.push('during');
    if (/despite/.test(statement)) constraints.push('adversity');

    return constraints;
  }

  /**
   * STAGE 2: CONSULT WORLD STATE + RULES
   * 
   * Pull in:
   * - Character stats, conditions, resources
   * - Environmental factors (height, terrain, visibility)
   * - NPC attitudes, faction modifiers, prior promises
   * - Applicable rule modules
   */
  async consultContextualRules(intent, world) {
    const context = {
      intent: intent,
      character: null,
      environment: null,
      npcs: [],
      factions: [],
      applicableRules: [],
      modifiers: [],
      precedents: [] // What happened before that matters?
    };

    // Get character context
    if (intent.character) {
      context.character = {
        stats: intent.character.stats,
        skills: intent.character.skills,
        conditions: intent.character.conditions || [],
        resources: intent.character.resources || {},
        level: intent.character.level,
        abilities: intent.character.abilities || []
      };
    }

    // Get environment context
    if (intent.location) {
      context.environment = {
        terrain: intent.location.terrain,
        visibility: intent.location.visibility,
        hazards: intent.location.hazards || [],
        allies: intent.location.allies || [],
        enemies: intent.location.enemies || [],
        height: intent.location.height,
        movementDifficulty: this.calculateMovementDifficulty(intent.location)
      };
    }

    // Get applicable rule modules
    context.applicableRules = this.selectApplicableRules(intent, this.rules);

    // Find relevant modifiers (from world state)
    context.modifiers = await this.findModifiers(intent, world);

    // Find precedents (what happened before that's relevant?)
    context.precedents = await this.findPrecedents(intent, world);

    return context;
  }

  /**
   * Select which rule modules apply
   */
  selectApplicableRules(intent, rules) {
    const applicable = [];

    // Map intent to rule modules
    const ruleMap = {
      'combat': ['attack', 'damage', 'grapple', 'shove'],
      'magic': ['cast', 'spell', 'magic', 'arcane', 'divine'],
      'social': ['persuade', 'deceive', 'intimidate', 'charm'],
      'skills': ['acrobatics', 'athletics', 'stealth', 'perception'],
      'exploration': ['climb', 'swim', 'jump', 'search', 'navigate'],
      'downtime': ['rest', 'craft', 'gather', 'research']
    };

    // Match intent to rules
    for (const [module, keywords] of Object.entries(ruleMap)) {
      const regex = new RegExp(keywords.join('|'), 'i');
      if (regex.test(intent.goal)) {
        applicable.push(module);
      }
    }

    // Always include core rules
    applicable.push('core');

    return applicable.filter((m, i, a) => a.indexOf(m) === i); // Deduplicate
  }

  /**
   * Find modifiers from world state
   */
  async findModifiers(intent, world) {
    const modifiers = [];

    // NPC attitudes affect social checks
    if (intent.means.some(m => m.type === 'social')) {
      const npc = world.entities.get(intent.target);
      if (npc && npc.attitude) {
        modifiers.push({
          source: 'npc_attitude',
          value: npc.attitude === 'friendly' ? 1 : npc.attitude === 'hostile' ? -2 : 0,
          description: `NPC is ${npc.attitude}`
        });
      }
    }

    // Environmental modifiers
    if (intent.location) {
      const env = intent.location;
      if (env.visibility === 'dark') {
        modifiers.push({
          source: 'darkness',
          value: -1,
          description: 'Darkness makes this harder'
        });
      }

      if (env.terrain === 'difficult') {
        modifiers.push({
          source: 'terrain',
          value: -1,
          description: 'Difficult terrain makes this harder'
        });
      }
    }

    // Preparation bonus
    if (intent.constraints.includes('planned')) {
      modifiers.push({
        source: 'preparation',
        value: 1,
        description: 'You prepared for this'
      });
    }

    return modifiers;
  }

  /**
   * Find precedents (what happened before that's relevant?)
   */
  async findPrecedents(intent, world) {
    // Check world state for prior events that affect this action
    const relevantEvents = [];

    // Example: Did they scout this location before?
    if (world.events) {
      const scouting = world.events.filter(e =>
        e.type === 'scouting' && e.location === intent.location
      );
      if (scouting.length > 0) {
        relevantEvents.push({
          type: 'prior_scouting',
          advantage: true,
          description: 'You scouted this before'
        });
      }
    }

    return relevantEvents;
  }

  /**
   * Calculate movement difficulty from terrain
   */
  calculateMovementDifficulty(location) {
    const difficulties = {
      'open': 0,
      'rough': 1,
      'difficult': 2,
      'extreme': 3
    };

    return difficulties[location.terrain] || 0;
  }

  /**
   * STAGE 3: DECIDE RANDOMNESS
   * 
   * Do we roll?
   * What type of roll?
   * What's the modifier?
   */
  async decideRandomness(context) {
    const decision = {
      shouldRoll: false,
      rollType: null, // 'check', 'save', 'attack', 'contested', 'cascade'
      dc: null,
      modifier: 0,
      advantage: false,
      disadvantage: false,
      reasoning: ''
    };

    // Consult roll arbitration engine
    const rollArbitration = this.subsystems.rollArbitration.arbitrateRoll({
      action: context.intent.goal,
      character: context.character,
      difficulty: this.estimateDifficulty(context)
    });

    decision.shouldRoll = rollArbitration.shouldRoll;

    if (!decision.shouldRoll) {
      decision.reasoning = rollArbitration.reasoning;
      return decision;
    }

    // Determine roll type based on mechanics
    if (context.applicableRules.includes('combat')) {
      decision.rollType = context.intent.goal.includes('attack') ? 'attack' : 'check';
    } else if (context.applicableRules.includes('magic')) {
      decision.rollType = 'save'; // Magic often involves saves
    } else {
      decision.rollType = 'check';
    }

    // Calculate DC based on difficulty + modifiers
    const baseDC = this.estimateDC(context);
    decision.dc = baseDC + context.modifiers.reduce((sum, m) => sum + m.value, 0);

    // Calculate modifier from character stats
    const primaryMechanic = context.intent.means[0];
    if (primaryMechanic && context.character) {
      decision.modifier = context.character.stats[primaryMechanic.ability] || 0;
    }

    // Apply advantage/disadvantage
    if (context.precedents.some(p => p.advantage)) {
      decision.advantage = true;
    }

    return decision;
  }

  /**
   * Estimate difficulty of action
   */
  estimateDifficulty(context) {
    // Difficulty based on intent complexity, environment, opposition
    let difficulty = 'moderate';

    if (context.intent.goals.length > 1) {
      difficulty = 'challenging'; // Compound actions are harder
    }

    if (context.environment && context.environment.hazards.length > 0) {
      difficulty = 'hard';
    }

    return difficulty;
  }

  /**
   * Estimate DC (Difficulty Class) base
   */
  estimateDC(context) {
    const dcMap = {
      'trivial': 5,
      'routine': 8,
      'easy': 10,
      'moderate': 12,
      'challenging': 15,
      'hard': 16,
      'very hard': 18
    };

    const difficulty = this.estimateDifficulty(context);
    return dcMap[difficulty] || 12;
  }

  /**
   * STAGE 4: EXECUTE SUBSYSTEMS
   * 
   * Call the appropriate subsystem (combat engine, magic system, etc.)
   * based on decision from Stage 3
   */
  async executeSubsystems(randomnessDecision, context) {
    const execution = {
      rolled: randomnessDecision.shouldRoll,
      result: null,
      rollDetails: null,
      subsystemUsed: null
    };

    if (!randomnessDecision.shouldRoll) {
      // Auto-success or auto-fail, no roll needed
      execution.result = 'success'; // Or determine from context
      return execution;
    }

    // Roll the dice
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + randomnessDecision.modifier;

    execution.rollDetails = {
      d20: roll,
      modifier: randomnessDecision.modifier,
      total: total,
      dc: randomnessDecision.dc,
      success: total >= randomnessDecision.dc
    };

    execution.result = execution.rollDetails.success ? 'success' : 'failure';

    // Route to appropriate subsystem for detailed resolution
    if (randomnessDecision.rollType === 'attack') {
      execution.subsystemUsed = 'combat';
      // Combat engine handles damage, positioning, etc.
    } else if (context.applicableRules.includes('magic')) {
      execution.subsystemUsed = 'magic';
      // Magic system handles spell effects
    } else {
      execution.subsystemUsed = 'skills';
      // Skills system handles outcomes
    }

    return execution;
  }

  /**
   * STAGE 5: UPDATE WORLD STATE
   * 
   * Apply changes to:
   * - Characters (health, resources, conditions)
   * - NPCs (attitudes, knowledge, state)
   * - Locations (state changes)
   * - Factions (reputation)
   * - Open quests/loops
   */
  async updateWorldState(execution) {
    const updates = {
      characterUpdates: [],
      npcUpdates: [],
      locationUpdates: [],
      factionUpdates: [],
      quests: [],
      events: []
    };

    if (execution.result === 'success') {
      // Action succeeded → update world accordingly
      updates.events.push({
        type: 'successful_action',
        description: `Player succeeded at their action`,
        timestamp: Date.now()
      });
    } else {
      // Action failed → create interesting complication
      updates.events.push({
        type: 'failed_action',
        description: `Player's action failed. Complication: ${this.generateComplication()}`,
        timestamp: Date.now()
      });
    }

    return updates;
  }

  /**
   * Generate interesting complication on failure
   */
  generateComplication() {
    const complications = [
      'Something unexpected happens',
      'Time pressure increases',
      'An alarm sounds',
      'Someone unexpected appears',
      'Resources are wasted',
      'Your weakness is exposed'
    ];

    return complications[Math.floor(Math.random() * complications.length)];
  }

  /**
   * STAGE 6: NARRATE OUTCOME
   * 
   * Explain what happened in vivid, jargon-free language
   */
  async narrateOutcome(execution, stateUpdate) {
    const narrative = {
      shortForm: '',
      longForm: '',
      whatChanged: [],
      whatMatters: [],
      nextHooks: []
    };

    if (execution.rolled && execution.rollDetails) {
      const { d20, modifier, total, dc, success } = execution.rollDetails;

      if (success) {
        narrative.shortForm = `You rolled ${d20}. That's ${total} total. You needed ${dc}. You made it.`;
      } else {
        const margin = dc - total;
        narrative.shortForm = `You rolled ${d20}. That's ${total} total. You needed ${dc}. You fell short by ${margin}.`;
      }
    }

    // Add what changed
    if (stateUpdate.characterUpdates.length > 0) {
      narrative.whatChanged.push(`Your condition changed: ${stateUpdate.characterUpdates[0]}`);
    }

    if (stateUpdate.events.length > 0) {
      narrative.whatChanged.push(stateUpdate.events[0].description);
    }

    return narrative;
  }
}

export { FictionFirstOrchestrator };
