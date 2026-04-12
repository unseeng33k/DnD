#!/usr/bin/env node

/**
 * WORLD-STATE QUERY ENGINE
 * 
 * The orchestrator doesn't search the graph manually.
 * It asks smart questions, and this engine answers.
 * 
 * Questions like:
 * - "Who should react to this event?"
 * - "What's the situation in this town?"
 * - "What hooks can I surface?"
 * - "Who would betray the party?"
 */

class WorldStateQueryEngine {
  constructor(worldGraph) {
    this.graph = worldGraph;
  }

  /**
   * MAIN QUERY: "What should happen?"
   * Given a player action, what does the world state suggest as consequences?
   */
  async queryWhatShouldHappen(intent) {
    const { actor, location, action, type } = intent;

    const response = {
      immediateReactions: [],
      cascadingEffects: [],
      openedHooks: [],
      thematicEchoes: []
    };

    // WHO SHOULD REACT?
    response.immediateReactions = this.queryMostRelevantNPCs(
      location,
      type,
      3
    );

    // WHAT CASCADES?
    if (type === 'betrayal') {
      response.cascadingEffects = this.queryPotentialBetrayals(location);
    }

    // WHAT HOOKS OPEN?
    response.openedHooks = this.graph.queryNearbyHooks(location);

    return response;
  }

  /**
   * MEMORY QUERY: "Who remembers this?"
   * Who in the world has context for this moment?
   */
  async queryWhoRemembersThis(eventId) {
    const event = this.graph.events.find(e => e.id === eventId);
    if (!event) return [];

    const witnesses = [];

    if (this.graph.entities.has(event.actor)) {
      witnesses.push(this.graph.entities.get(event.actor));
    }

    const location = this.graph.entities.get(event.target);
    if (location && location.locationState) {
      for (const inhabitantId of location.locationState.inhabitants) {
        witnesses.push(this.graph.entities.get(inhabitantId));
      }
    }

    for (const [, entity] of this.graph.entities) {
      if (entity.type === 'faction' && entity.history.includes(event)) {
        witnesses.push(entity);
      }
    }

    return witnesses.filter(w => w);
  }

  /**
   * SITUATION QUERY: "What's the vibe in this town?"
   * Get a snapshot of current situation
   */
  async queryLocationSituation(locationId) {
    const location = this.graph.entities.get(locationId);
    if (!location) return null;

    const situation = {
      name: location.name,
      inhabitants: [],
      openThreats: [],
      opportunities: [],
      politicalState: null,
      recentEvents: []
    };

    if (location.locationState && location.locationState.inhabitants) {
      for (const inhabitantId of location.locationState.inhabitants) {
        const npc = this.graph.entities.get(inhabitantId);
        if (npc) {
          situation.inhabitants.push({
            name: npc.name,
            type: npc.type,
            attitude: npc.psychology.attitudes,
            goals: npc.psychology.ambitions
          });
        }
      }
    }

    for (const threat of (location.locationState?.hazards || [])) {
      situation.openThreats.push(threat);
    }

    for (const resource of (location.locationState?.resources || [])) {
      situation.opportunities.push(resource);
    }

    const recentEvents = this.graph.events.filter(e =>
      e.target === locationId &&
      e.timestamp > this.graph.timeline - 5
    );
    situation.recentEvents = recentEvents.slice(-3);

    return situation;
  }

  /**
   * RELATIONSHIP QUERY: "Who do I know here? Who should I fear?"
   */
  async queryNPCStandingWithParty(partyId, location) {
    const standing = {
      allies: [],
      neutrals: [],
      enemies: [],
      complicated: []
    };

    const location_entity = this.graph.entities.get(location);
    if (!location_entity || !location_entity.locationState) return standing;

    for (const inhabitantId of location_entity.locationState.inhabitants) {
      const npc = this.graph.entities.get(inhabitantId);
      if (!npc) continue;

      const attitude = npc.psychology.attitudes[partyId] || 0;

      if (attitude > 20) {
        standing.allies.push({ npc, attitude });
      } else if (attitude < -20) {
        standing.enemies.push({ npc, attitude });
      } else if (attitude !== 0) {
        standing.complicated.push({ npc, attitude });
      } else {
        standing.neutrals.push(npc);
      }
    }

    return standing;
  }

  /**
   * CONSEQUENCE QUERY: "What changes if we do X?"
   * Predict consequences before action
   */
  async queryPredictedConsequences(action) {
    const { actor, target, type } = action;

    const targetEntity = this.graph.entities.get(target);
    if (!targetEntity) return null;

    const predicted = {
      directEffect: null,
      affectedParties: [],
      cascades: [],
      emotionalWeight: null
    };

    if (type === 'kill') {
      predicted.directEffect = `${target} dies`;
    } else if (type === 'betray') {
      predicted.directEffect = `${target} learns they were betrayed`;
    } else if (type === 'help') {
      predicted.directEffect = `${target} is helped`;
    }

    const relationships = this.graph.getEntityRelationships(target);
    for (const rel of relationships) {
      const other = rel.from === target ? rel.to : rel.from;
      predicted.affectedParties.push({
        entity: other,
        relationship: rel.type
      });
    }

    if (type === 'kill' && targetEntity.factionState) {
      predicted.cascades.push({
        effect: 'Faction seeks revenge',
        faction: target,
        delay: 1
      });
    }

    return predicted;
  }

  /**
   * LEGEND QUERY: "Is there a story about this?"
   * Find past events that echo current situation
   */
  async queryHistoricalEchoes(currentEvent) {
    const echoes = [];

    for (const pastEvent of this.graph.events) {
      if (pastEvent.type === currentEvent.type &&
          pastEvent.timestamp < this.graph.timeline) {
        echoes.push({
          event: pastEvent,
          how_it_ended: this.graph.events.find(e =>
            e.closesLoops && e.closesLoops.includes(pastEvent.id)
          ),
          ageInSessions: this.graph.timeline - pastEvent.timestamp
        });
      }
    }

    echoes.sort((a, b) => a.ageInSessions - b.ageInSessions);
    return echoes.slice(0, 3);
  }

  /**
   * DYNAMIC HOOK QUERY: "What can I introduce now?"
   * Given current state, what story hooks are available?
   */
  async queryAvailableHooks(location, preferType = null) {
    const hooks = {
      unresolved: [],
      emerging: [],
      opportunities: []
    };

    const pastUnresolved = this.graph.events.filter(e =>
      e.target === location &&
      e.opensLoops &&
      e.opensLoops.length > 0 &&
      !e.closesLoops
    );
    hooks.unresolved = pastUnresolved.slice(-3);

    const location_entity = this.graph.entities.get(location);
    if (location_entity && location_entity.locationState) {
      hooks.emerging = location_entity.locationState.hazards || [];
    }

    for (const [, entity] of this.graph.entities) {
      if (entity.psychology.ambitions &&
          entity.psychology.ambitions.length > 0) {
        hooks.opportunities.push({
          entity: entity.name,
          goal: entity.psychology.ambitions[0]
        });
      }
    }

    return hooks;
  }

  /**
   * HELPERS
   */
  queryMostRelevantNPCs(locationId, eventType, limit = 3) {
    // Returns NPCs most likely to care about this event
    return [];
  }

  queryPotentialBetrayals(locationId) {
    // Returns NPCs who might betray the party
    return [];
  }
}

export { WorldStateQueryEngine };
