#!/usr/bin/env node

/**
 * PERSISTENT WORLD STATE ENGINE
 * 
 * The second pillar of a real D&D engine:
 * "How what just happened changes everything later"
 * 
 * Stores the world as a LIVING GRAPH:
 * - Entities (NPCs, factions, locations, items, quests)
 * - Relationships (attitudes, debts, secrets, promises)
 * - Causal history (WHY things are as they are)
 * - Open loops (unresolved threads)
 * - Time-based evolution (world doesn't wait)
 */

class PersistentWorldStateEngine {
  constructor() {
    this.entities = new Map(); // All entities by ID
    this.relationships = new Map(); // Entity relationships
    this.events = []; // Complete causal history
    this.openLoops = []; // Unresolved promises/quests
    this.timeline = []; // In-game time progression
    this.currentTime = 0; // Session counter
  }

  /**
   * CREATE ENTITY (NPC, faction, location, item)
   * 
   * Key insight: Entities have IDENTITY and HISTORY from day 1
   * Not "Guard #7" but "Sergeant Marlow, the one we bribed"
   */
  createEntity(id, type, properties = {}) {
    const entity = {
      id,
      type, // 'npc', 'faction', 'location', 'item', 'quest'
      name: properties.name || id,
      description: properties.description || '',
      
      // IDENTITY MARKERS
      attributes: properties.attributes || {},
      
      // HISTORY (grows over time)
      history: [],
      firstSeen: this.currentTime,
      lastInteraction: null,
      interactionCount: 0,
      
      // EMOTIONAL STATE (changes with player actions)
      attitude: properties.attitude || 'neutral', // 'friendly', 'hostile', 'indifferent', 'curious'
      trust: properties.trust || 0, // -100 to 100
      fear: properties.fear || 0, // -100 to 100
      debt: properties.debt || 0, // How much NPC owes player (or vice versa)
      
      // RELATIONSHIPS (links to other entities)
      relationships: new Map(),
      
      // STATE (what changed about them)
      state: properties.state || {},
      
      // MEMORY OF PLAYER
      memoryOfPlayer: [],
      
      // RESOURCES (if applicable)
      resources: properties.resources || {},
      
      // SECRETS (things PC might not know)
      secrets: properties.secrets || [],
      
      // AGENCY (what this entity wants)
      goals: properties.goals || [],
      obstacles: properties.obstacles || []
    };

    this.entities.set(id, entity);
    return entity;
  }

  /**
   * RECORD CAUSAL EVENT
   * 
   * Not just "PC defeated goblin"
   * But "PC spared goblin they could have killed → goblin remembers mercy"
   */
  recordEvent(eventData) {
    const event = {
      timestamp: this.currentTime,
      type: eventData.type, // 'interaction', 'combat', 'discovery', 'promise', 'betrayal'
      actor: eventData.actor, // Who did this?
      target: eventData.target, // Who/what was affected?
      action: eventData.action, // What happened?
      consequence: eventData.consequence, // What changes as a result?
      moral: eventData.moral || null, // Moral alignment ('merciful', 'cruel', 'selfish')
      witnesses: eventData.witnesses || [], // Who saw it?
      description: eventData.description || ''
    };

    this.events.push(event);

    // Update entity history
    if (this.entities.has(event.actor)) {
      this.entities.get(event.actor).history.push(event);
    }
    if (this.entities.has(event.target)) {
      this.entities.get(event.target).history.push(event);
    }

    return event;
  }

  /**
   * APPLY CONSEQUENCE to entity
   * 
   * Takes resolution outcome and updates entity state persistently
   */
  applyConsequence(entityId, consequence) {
    const entity = this.entities.get(entityId);
    if (!entity) return null;

    switch (consequence.type) {
      case 'attitude_shift':
        entity.attitude = consequence.newAttitude;
        entity.memoryOfPlayer.push({
          time: this.currentTime,
          event: consequence.reason,
          impact: consequence.newAttitude
        });
        break;

      case 'trust_change':
        entity.trust = Math.max(-100, Math.min(100, entity.trust + consequence.amount));
        break;

      case 'debt_created':
        entity.debt += consequence.amount;
        this.recordOpenLoop({
          type: 'debt',
          creditor: consequence.creditor,
          debtor: consequence.debtor,
          amount: consequence.amount,
          reason: consequence.reason,
          created: this.currentTime
        });
        break;

      case 'promise_made':
        this.recordOpenLoop({
          type: 'promise',
          maker: consequence.maker,
          promisee: consequence.promisee,
          promise: consequence.text,
          deadline: consequence.deadline,
          created: this.currentTime
        });
        break;

      case 'secret_revealed':
        entity.secrets = entity.secrets.filter(s => s !== consequence.secret);
        // Update all NPCs who witnessed
        if (consequence.witnesses) {
          consequence.witnesses.forEach(witId => {
            const wit = this.entities.get(witId);
            if (wit && !wit.secrets.includes(consequence.secret)) {
              wit.secrets.push({
                text: consequence.secret,
                learnedTime: this.currentTime,
                source: entityId
              });
            }
          });
        }
        break;

      case 'goal_achieved':
        entity.goals = entity.goals.filter(g => g !== consequence.goal);
        // Trigger cascade: NPC now has free resources
        consequence.newGoal && entity.goals.push(consequence.newGoal);
        break;

      case 'death':
        entity.state.dead = true;
        entity.state.diedAt = this.currentTime;
        entity.state.diedHow = consequence.how;
        // Cascade: update related entities (allies, enemies, family)
        this.cascadeDeathConsequences(entityId, consequence);
        break;

      case 'resource_change':
        entity.resources[consequence.resource] = (entity.resources[consequence.resource] || 0) + consequence.amount;
        break;
    }

    entity.lastInteraction = this.currentTime;
    entity.interactionCount++;
    return entity;
  }

  /**
   * RECORD OPEN LOOP (unresolved promise, debt, quest, mystery)
   * 
   * These are the threads that bring you back months later
   */
  recordOpenLoop(loopData) {
    const loop = {
      id: `loop_${this.openLoops.length}`,
      type: loopData.type, // 'promise', 'debt', 'quest', 'mystery', 'threat'
      created: this.currentTime,
      createdBy: loopData.maker || loopData.creator,
      affectsEntities: [
        loopData.maker, loopData.promisee,
        loopData.creditor, loopData.debtor,
        loopData.questGiver
      ].filter(e => e),
      description: loopData.promise || loopData.text || loopData.description,
      resolved: false,
      resolvedAt: null,
      consequence: loopData.consequence || null,
      
      // How many sessions have passed?
      ageInSessions: 0,
      
      // Pressure (does this matter yet? will it matter soon?)
      pressure: 'low' // 'low', 'medium', 'high', 'critical'
    };

    this.openLoops.push(loop);
    return loop;
  }

  /**
   * CASCADE CONSEQUENCES (world doesn't wait)
   * 
   * When NPC dies → friends mourn/seek revenge
   * When secret revealed → cascades to all who heard
   * When cult is ignored → it grows without you
   */
  cascadeDeathConsequences(deadNpcId, deathData) {
    const deadNpc = this.entities.get(deadNpcId);
    if (!deadNpc) return;

    // Find allies/enemies
    for (const [otherId, otherEntity] of this.entities) {
      if (otherId === deadNpcId) continue;

      const relationship = this.getRelationship(otherId, deadNpcId);
      
      // ALLIES grieve & seek revenge
      if (relationship && relationship.type === 'ally') {
        this.applyConsequence(otherId, {
          type: 'attitude_shift',
          newAttitude: 'hostile',
          reason: `${deadNpc.name} was killed by ${deathData.killedBy}`
        });

        // Create revenge quest
        this.recordOpenLoop({
          type: 'revenge',
          creator: otherId,
          description: `Avenge the death of ${deadNpc.name}`,
          target: deathData.killedBy,
          created: this.currentTime
        });
      }

      // ENEMIES celebrate (if appropriate)
      if (relationship && relationship.type === 'enemy') {
        this.applyConsequence(otherId, {
          type: 'attitude_shift',
          newAttitude: 'triumphant',
          reason: `${deadNpc.name} is dead`
        });
      }
    }
  }

  /**
   * GET RELATIONSHIP between two entities
   */
  getRelationship(fromId, toId) {
    const key = `${fromId}→${toId}`;
    return this.relationships.get(key);
  }

  /**
   * SET RELATIONSHIP (directed)
   */
  setRelationship(fromId, toId, relData) {
    const key = `${fromId}→${toId}`;
    const relationship = {
      from: fromId,
      to: toId,
      type: relData.type, // 'ally', 'enemy', 'family', 'rival', 'mentor', 'servant'
      strength: relData.strength || 50, // 0-100
      history: relData.history || [],
      lastUpdated: this.currentTime
    };

    this.relationships.set(key, relationship);

    // Also update entity's relationship map
    const fromEntity = this.entities.get(fromId);
    if (fromEntity) {
      fromEntity.relationships.set(toId, relationship);
    }

    return relationship;
  }

  /**
   * TIME PASSES (world evolves without player)
   * 
   * Call this when players skip time or ignore threats
   */
  advanceTime(sessionsPassed = 1) {
    this.currentTime += sessionsPassed;

    // NPCs pursue goals independently
    for (const [npcId, npc] of this.entities) {
      if (npc.type !== 'npc') continue;
      if (npc.state.dead) continue;

      // Goal progress
      for (const goal of npc.goals) {
        goal.progress = (goal.progress || 0) + sessionsPassed;
        
        // If goal completes, trigger consequence
        if (goal.progress >= goal.deadline) {
          this.recordEvent({
            type: 'autonomous_action',
            actor: npcId,
            target: goal.target,
            action: `${npc.name} achieved goal: ${goal.text}`,
            consequence: goal.consequence,
            description: `While you were away, ${npc.name} pursued their goals`
          });
        }
      }
    }

    // Update open loop ages & pressures
    for (const loop of this.openLoops) {
      if (loop.resolved) continue;
      
      loop.ageInSessions += sessionsPassed;
      
      // Pressure increases with age
      if (loop.ageInSessions < 3) loop.pressure = 'low';
      else if (loop.ageInSessions < 10) loop.pressure = 'medium';
      else if (loop.ageInSessions < 20) loop.pressure = 'high';
      else loop.pressure = 'critical';
    }

    return {
      newTime: this.currentTime,
      autonomousActions: this.events.filter(e => e.timestamp >= this.currentTime - sessionsPassed)
    };
  }

  /**
   * SURFACE RELEVANT MEMORIES into play
   * 
   * When NPC is encountered, remind DM what they remember
   * When location is visited, remind DM what changed
   */
  getSurfacedMemories(entityId, context = {}) {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    const memories = [];

    // Memory of player interactions
    if (entity.memoryOfPlayer && entity.memoryOfPlayer.length > 0) {
      memories.push({
        type: 'npc_memory_of_player',
        entity: entityId,
        content: entity.memoryOfPlayer.slice(-5), // Last 5 interactions
        relevance: 'high'
      });
    }

    // Open loops involving this entity
    const relevantLoops = this.openLoops.filter(
      loop => loop.affectsEntities.includes(entityId) && !loop.resolved
    );
    
    if (relevantLoops.length > 0) {
      memories.push({
        type: 'open_loops',
        entity: entityId,
        loops: relevantLoops,
        relevance: 'critical'
      });
    }

    // Recent events involving entity
    const recentEvents = this.events
      .filter(e => (e.actor === entityId || e.target === entityId) && e.timestamp > this.currentTime - 5)
      .slice(-3);

    if (recentEvents.length > 0) {
      memories.push({
        type: 'recent_events',
        entity: entityId,
        events: recentEvents,
        relevance: 'medium'
      });
    }

    // Secrets entity knows
    if (entity.secrets && entity.secrets.length > 0) {
      memories.push({
        type: 'secrets',
        entity: entityId,
        count: entity.secrets.length,
        relevance: 'high'
      });
    }

    return memories;
  }

  /**
   * RECALL MOMENT (player asks "do I remember...")
   * 
   * Engine checks: Have you encountered this? When? What was the context?
   */
  recallMoment(query) {
    // Search events for matching description
    const matches = this.events.filter(e => 
      e.description.toLowerCase().includes(query.toLowerCase()) ||
      e.action.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length === 0) {
      return {
        found: false,
        message: "You don't recall that happening."
      };
    }

    const recentMatch = matches[matches.length - 1]; // Most recent
    return {
      found: true,
      event: recentMatch,
      message: `Yes. ${recentMatch.description}. That was ${this.currentTime - recentMatch.timestamp} sessions ago.`,
      consequences: recentMatch.consequence
    };
  }

  /**
   * EXPORT WORLD STATE
   * 
   * Save for continuity across sessions
   */
  exportState() {
    return {
      currentTime: this.currentTime,
      entities: Array.from(this.entities.entries()),
      relationships: Array.from(this.relationships.entries()),
      events: this.events,
      openLoops: this.openLoops.filter(l => !l.resolved)
    };
  }

  /**
   * IMPORT WORLD STATE
   */
  importState(data) {
    this.currentTime = data.currentTime;
    this.entities = new Map(data.entities);
    this.relationships = new Map(data.relationships);
    this.events = data.events;
    this.openLoops = data.openLoops;
  }

  /**
   * GET WORLD CONTEXT (useful for DM prompts)
   */
  getWorldContext(focusEntity = null) {
    const context = {
      currentTime: this.currentTime,
      recentEvents: this.events.slice(-10),
      openLoops: this.openLoops.filter(l => !l.resolved),
      criticalLoops: this.openLoops.filter(l => !l.resolved && l.pressure === 'critical')
    };

    if (focusEntity && this.entities.has(focusEntity)) {
      context.focusEntity = this.entities.get(focusEntity);
      context.relevantMemories = this.getSurfacedMemories(focusEntity);
    }

    return context;
  }
}

export { PersistentWorldStateEngine };
