#!/usr/bin/env node

/**
 * PERSISTENT WORLD-STATE GRAPH
 * 
 * A unified, queryable knowledge graph that stores and connects:
 * - Entities (PCs, NPCs, factions, locations, items, monsters)
 * - Relationships (member of, owes debt, sworn enemy, controls, destroyed by, promised to)
 * - Time-aware events (day 37: party burned the mill → faction A suspicion +2)
 * - Attributes + psychology (attitudes, fears, ambitions, secrets, reputations)
 */

class PersistentWorldStateGraph {
  constructor() {
    this.entities = new Map();
    this.relationships = new Map();
    this.events = [];
    this.themes = new Map();
    this.timeline = 0;
  }

  /**
   * CREATE ENTITY
   * Every "thing" is an entity: PCs, NPCs, factions, locations, items, rumors, scenes
   */
  createEntity(id, type, properties = {}) {
    const entity = {
      id,
      type,
      name: properties.name || id,
      description: properties.description || '',
      
      // IDENTITY
      attributes: properties.attributes || {},
      
      // PSYCHOLOGY
      psychology: {
        attitudes: properties.attitudes || {},
        fears: properties.fears || [],
        ambitions: properties.ambitions || [],
        secrets: properties.secrets || [],
        strengths: properties.strengths || [],
        weaknesses: properties.weaknesses || []
      },
      
      // SOCIAL STATE
      reputation: properties.reputation || {},
      alliances: properties.alliances || [],
      debts: properties.debts || {},
      promises: properties.promises || [],
      
      // FACTION STATE (if faction)
      factionState: type === 'faction' ? {
        power: properties.power || 50,
        resources: properties.resources || [],
        members: properties.members || [],
        goals: properties.goals || [],
        threats: properties.threats || []
      } : null,
      
      // LOCATION STATE (if location)
      locationState: type === 'location' ? {
        terrain: properties.terrain || 'unknown',
        inhabitants: properties.inhabitants || [],
        resources: properties.resources || [],
        hazards: properties.hazards || [],
        ownership: properties.ownership || null
      } : null,
      
      // TIMELINE
      createdAt: this.timeline,
      lastUpdated: this.timeline,
      history: []
    };

    this.entities.set(id, entity);
    return entity;
  }

  /**
   * CREATE TYPED RELATIONSHIP
   * Relationships are directional and typed
   */
  createRelationship(fromId, toId, type, properties = {}) {
    const relationshipKey = `${fromId}→${toId}:${type}`;
    
    const relationship = {
      from: fromId,
      to: toId,
      type,
      strength: properties.strength || 50,
      history: properties.history || [],
      createdAt: this.timeline,
      lastUpdated: this.timeline,
      metadata: properties.metadata || {}
    };

    this.relationships.set(relationshipKey, relationship);
    return relationship;
  }

  /**
   * LOG EVENT
   * Every significant action becomes an event node in the timeline
   * Events are the GROUND TRUTH of what happened
   */
  logEvent(eventData) {
    const event = {
      id: `event_${this.timeline}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: this.timeline,
      type: eventData.type,
      
      actor: eventData.actor,
      target: eventData.target,
      action: eventData.action,
      narrative: eventData.narrative || '',
      
      significance: eventData.significance || 'minor',
      consequences: eventData.consequences || {},
      
      moral: eventData.moral || null,
      emotion: eventData.emotion || null,
      
      cascadeTo: eventData.cascadeTo || [],
      opensLoops: eventData.opensLoops || [],
      closesLoops: eventData.closesLoops || []
    };

    this.events.push(event);
    
    if (this.entities.has(event.actor)) {
      this.entities.get(event.actor).history.push(event);
    }
    if (this.entities.has(event.target)) {
      this.entities.get(event.target).history.push(event);
    }

    this.applyConsequence(event);
    return event;
  }

  /**
   * APPLY CONSEQUENCE
   */
  applyConsequence(event) {
    for (const cascadeId of event.cascadeTo) {
      const entity = this.entities.get(cascadeId);
      if (!entity) continue;

      if (event.moral === 'merciful') {
        entity.psychology.attitudes[event.actor] = 
          (entity.psychology.attitudes[event.actor] || 0) + 10;
      } else if (event.moral === 'cruel') {
        entity.psychology.attitudes[event.actor] = 
          (entity.psychology.attitudes[event.actor] || 0) - 15;
      }

      if (entity.type === 'faction' && event.type === 'action') {
        if (event.action.includes('betray')) {
          entity.factionState.power -= 5;
        }
      }

      entity.lastUpdated = this.timeline;
    }
  }

  /**
   * QUERY: "Who is this NPC, what's their history with the party, how do they feel right now?"
   */
  getEntityPortrait(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return null;

    return {
      name: entity.name,
      type: entity.type,
      description: entity.description,
      
      currentAttitudes: entity.psychology.attitudes,
      currentFears: entity.psychology.fears,
      currentAmbitions: entity.psychology.ambitions,
      
      howPeopleViewThem: entity.reputation,
      
      debtsOutstanding: entity.debts,
      promisesMade: entity.promises,
      
      recentEvents: this.getEntityRecentHistory(entityId, 5),
      
      relationships: this.getEntityRelationships(entityId),
      
      secrets: entity.psychology.secrets,
      
      goals: entity.psychology.ambitions,
      obstacles: entity.psychology.weaknesses
    };
  }

  /**
   * QUERY: "What open promises, threats, and quests hang in this region?"
   */
  getRegionOpenLoops(locationId) {
    const loops = {
      promises: [],
      threats: [],
      quests: [],
      mysteries: []
    };

    const locationEvents = this.events.filter(e => {
      const target = this.entities.get(e.target);
      return target && target.id === locationId;
    });

    for (const event of locationEvents) {
      if (event.opensLoops && event.opensLoops.length > 0) {
        loops.quests.push(...event.opensLoops);
      }

      if (event.type === 'threat' && !event.resolved) {
        loops.threats.push(event);
      }

      if (event.type === 'promise' && !event.resolved) {
        loops.promises.push(event);
      }
    }

    return loops;
  }

  /**
   * QUERY: "What unresolved hooks are nearby that I can surface?"
   */
  queryNearbyHooks(locationId, limit = 5) {
    const hooks = [];

    const unresolved = this.events.filter(e =>
      e.target === locationId &&
      (!e.closesLoops || e.closesLoops.length === 0) &&
      e.timestamp > this.timeline - 10
    );

    for (const event of unresolved) {
      if (event.opensLoops && event.opensLoops.length > 0) {
        hooks.push({
          event,
          type: event.type,
          hooks: event.opensLoops,
          age: this.timeline - event.timestamp
        });
      }
    }

    hooks.sort((a, b) => a.age - b.age);
    return hooks.slice(0, limit);
  }

  /**
   * ADVANCE TIMELINE
   */
  advanceTime(days = 1) {
    this.timeline += days;
  }

  /**
   * HELPERS
   */
  getEntityRelationships(entityId) {
    const relationships = [];

    for (const [key, rel] of this.relationships) {
      if (rel.from === entityId || rel.to === entityId) {
        relationships.push(rel);
      }
    }

    return relationships;
  }

  getEntityRecentHistory(entityId, limit = 5) {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    return entity.history.slice(-limit);
  }

  exportState() {
    return {
      timeline: this.timeline,
      entities: Array.from(this.entities.entries()),
      relationships: Array.from(this.relationships.entries()),
      events: this.events
    };
  }

  importState(data) {
    this.timeline = data.timeline;
    this.entities = new Map(data.entities);
    this.relationships = new Map(data.relationships);
    this.events = data.events;
  }
}

export { PersistentWorldStateGraph };
