#!/usr/bin/env node

/**
 * INTENT PARSER
 * 
 * Understands what players ACTUALLY want, not just verbs:
 * 
 * Input: "I want to charm the guard, not just roll Persuasion"
 * Parses: Goal (charm), Method (social), Constraint (not just mechanics)
 * 
 * Extracts:
 * - Primary goal (what's the player trying to achieve?)
 * - Mechanics flag (do they want rules, or narrative?)
 * - Character agency (what does their character bring?)
 * - World stakes (what's the NPC likely to do?)
 * - Precedent (what have we established about this NPC?)
 */

class IntentParser {
  constructor() {
    this.goalPatterns = this.initializeGoalPatterns();
    this.methodPatterns = this.initializeMethodPatterns();
    this.constraintPatterns = this.initializeConstraints();
  }

  /**
   * Parse player intent from natural language
   */
  parseIntent(playerStatement, npcContext = null, worldContext = null) {
    const intent = {
      rawStatement: playerStatement,
      primaryGoal: this.extractPrimaryGoal(playerStatement),
      method: this.extractMethod(playerStatement),
      constraints: this.extractConstraints(playerStatement),
      mechanicsPreference: this.getMechanicsPreference(playerStatement),
      characterAgency: this.extractCharacterAgency(playerStatement),
      confidence: 0, // Will be set below
      stakesAnalysis: null // Will be set below
    };

    // Calculate confidence
    intent.confidence = this.calculateConfidence(intent);

    // Analyze stakes if context provided
    if (npcContext) {
      intent.stakesAnalysis = this.analyzeStakes(intent, npcContext, worldContext);
    }

    return intent;
  }

  /**
   * Extract PRIMARY GOAL (not the action verb)
   * "I want to charm the guard" → goal: "secure passage"
   * "I attack the goblin" → goal: "neutralize threat"
   * "I lie to the merchant" → goal: "get lower price"
   */
  extractPrimaryGoal(statement) {
    // Strip to lowercase for matching
    const s = statement.toLowerCase();

    // High-level goals that transcend mechanics
    const goals = {
      'secure_passage': ['want to pass', 'need to get through', 'should go past', 'convince them to let'],
      'gain_information': ['find out', 'learn', 'what do you know', 'tell me about', 'information'],
      'gain_advantage': ['trick', 'deceive', 'manipulate', 'get better deal', 'lower price'],
      'avoid_conflict': ['peaceful', 'without fighting', 'avoid combat', 'talk our way'],
      'achieve_dominance': ['intimidate', 'scare', 'threaten', 'show dominance', 'assert authority'],
      'form_relationship': ['befriend', 'make ally', 'build trust', 'gain their favor', 'impress'],
      'disable_threat': ['neutralize', 'take out', 'defeat', 'stop them'],
      'acquire_resource': ['steal', 'get', 'obtain', 'claim', 'loot', 'claim'],
      'explore_mystery': ['what is', 'investigate', 'uncover', 'discover', 'what happened']
    };

    // Find matching goal
    for (const [goal, triggers] of Object.entries(goals)) {
      for (const trigger of triggers) {
        if (s.includes(trigger)) {
          return goal;
        }
      }
    }

    // Extract from structure
    if (s.includes('i want to')) {
      return s.substring(s.indexOf('i want to') + 9).split(' and ')[0].split(',')[0].trim();
    }
    if (s.includes('i\'m going to')) {
      return s.substring(s.indexOf('i\'m going to') + 12).split(' to ')[0].trim();
    }

    return 'unknown_goal';
  }

  /**
   * Extract METHOD (how they're trying to achieve it)
   * "charm" → method: 'social'
   * "attack" → method: 'combat'
   * "lie" → method: 'deception'
   */
  extractMethod(statement) {
    const s = statement.toLowerCase();

    const methods = {
      'social': ['convince', 'persuade', 'charm', 'seduce', 'negotiate', 'talk'],
      'combat': ['attack', 'fight', 'hit', 'stab', 'shoot', 'swing', 'strike'],
      'deception': ['lie', 'bluff', 'trick', 'deceive', 'misrepresent', 'con'],
      'stealth': ['sneak', 'hide', 'creep', 'steal', 'pickpocket', 'shadow'],
      'magic': ['cast', 'spell', 'magic', 'enchant', 'dispel', 'wizard'],
      'physical': ['grapple', 'push', 'jump', 'climb', 'break', 'force'],
      'knowledge': ['roll knowledge', 'identify', 'recall', 'research'],
      'divine': ['pray', 'invoke', 'divine', 'miracle', 'bless']
    };

    for (const [method, triggers] of Object.entries(methods)) {
      for (const trigger of triggers) {
        if (s.includes(trigger)) {
          return method;
        }
      }
    }

    return 'undefined';
  }

  /**
   * Extract CONSTRAINTS (how they DON'T want to achieve it)
   * "not just roll Persuasion" → constraint: "avoid_mechanics_only"
   * "peacefully" → constraint: "no_violence"
   */
  extractConstraints(statement) {
    const constraints = [];
    const s = statement.toLowerCase();

    // Explicit "not"
    if (s.includes('not just roll')) constraints.push('avoid_mechanics_only');
    if (s.includes('without fighting')) constraints.push('no_violence');
    if (s.includes('without magic')) constraints.push('no_magic');
    if (s.includes('peacefully')) constraints.push('peaceful');
    if (s.includes('secretly')) constraints.push('covert');
    if (s.includes('cautiously')) constraints.push('careful');

    return constraints;
  }

  /**
   * Get MECHANICS PREFERENCE
   * Does the player want a roll? Just narrative? Hybrid?
   */
  getMechanicsPreference(statement) {
    const s = statement.toLowerCase();

    if (s.includes('roll') || s.includes('d20') || s.includes('check')) {
      return 'rules_first';
    }
    if (s.includes('not just roll') || s.includes('narrative')) {
      return 'narrative_first';
    }
    if (s.includes('try to') || s.includes('attempt')) {
      return 'hybrid';
    }

    return 'auto'; // System decides
  }

  /**
   * Extract CHARACTER AGENCY
   * What does their specific character bring?
   * (Requires character context)
   */
  extractCharacterAgency(statement, character = null) {
    const s = statement.toLowerCase();

    const agencyMarkers = {
      'class_ability': ['use my', 'with my', 'as a [class]', 'my [ability]'],
      'roleplay': ['my character would', 'i think', 'character voice'],
      'creative_solution': ['what if', 'could i', 'is there a way'],
      'stat_heavy': ['with my strength', 'my dexterity', 'my intelligence'],
      'narrative_description': ['descriptively', 'in detail', 'like this']
    };

    const agencies = [];
    for (const [marker, triggers] of Object.entries(agencyMarkers)) {
      for (const trigger of triggers) {
        if (s.includes(trigger)) {
          agencies.push(marker);
        }
      }
    }

    return agencies.length > 0 ? agencies : ['standard'];
  }

  /**
   * Calculate CONFIDENCE in parsing
   */
  calculateConfidence(intent) {
    let score = 0.5; // Base

    if (intent.primaryGoal !== 'unknown_goal') score += 0.2;
    if (intent.method !== 'undefined') score += 0.2;
    if (intent.constraints.length > 0) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Analyze STAKES given NPC context
   * "What's at risk? What could change?"
   */
  analyzeStakes(intent, npcContext, worldContext = null) {
    const stakes = {
      npcBehaviors: [],
      worldChanges: [],
      partyChanges: [],
      precedent: null
    };

    // What would this NPC likely do?
    if (npcContext.personality) {
      if (intent.method === 'social' && npcContext.personality.includes('friendly')) {
        stakes.npcBehaviors.push('likely_cooperative');
      }
      if (intent.method === 'deception' && npcContext.personality.includes('suspicious')) {
        stakes.npcBehaviors.push('likely_caught');
      }
      if (intent.method === 'combat' && npcContext.level > 3) {
        stakes.npcBehaviors.push('dangerous_fight');
      }
    }

    // What changes if they succeed?
    if (intent.primaryGoal === 'secure_passage') {
      stakes.worldChanges.push('area_now_accessible');
      stakes.partyChanges.push('party_can_advance');
    }
    if (intent.primaryGoal === 'gain_information') {
      stakes.worldChanges.push('lore_revealed');
      stakes.partyChanges.push('party_knowledge_increases');
    }
    if (intent.primaryGoal === 'form_relationship') {
      stakes.npcBehaviors.push('npc_becomes_ally');
      stakes.worldChanges.push('faction_attitude_improves');
    }

    // What's the precedent (has similar happened)?
    if (worldContext && worldContext.priorInteractions) {
      stakes.precedent = worldContext.priorInteractions;
    }

    return stakes;
  }

  /**
   * Initialize goal patterns
   */
  initializeGoalPatterns() {
    return {
      'social': ['charm', 'persuade', 'convince', 'seduce', 'negotiate'],
      'combat': ['attack', 'fight', 'kill', 'defeat', 'strike'],
      'stealth': ['sneak', 'hide', 'steal', 'pickpocket'],
      'magical': ['cast', 'spell', 'magic', 'enchant'],
      'investigation': ['investigate', 'search', 'examine', 'look for']
    };
  }

  /**
   * Initialize method patterns
   */
  initializeMethodPatterns() {
    return {
      'charisma_check': ['persuade', 'charm', 'seduce'],
      'strength_check': ['force', 'break', 'push'],
      'dexterity_check': ['sneak', 'dodge', 'grab'],
      'wisdom_check': ['sense', 'perceive', 'notice'],
      'intelligence_check': ['recall', 'identify', 'understand'],
      'constitution_check': ['endure', 'resist', 'hold']
    };
  }

  /**
   * Initialize constraint patterns
   */
  initializeConstraints() {
    return {
      'peaceful': ['peaceful', 'without violence'],
      'covert': ['secretly', 'without alerting'],
      'mechanical': ['just roll', 'mechanics'],
      'narrative': ['narrative', 'describe']
    };
  }
}

export { IntentParser };
