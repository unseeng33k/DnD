#!/usr/bin/env node

/**
 * WORLD STATE UPDATER
 * 
 * Takes resolution output and persists it:
 * - NPC attitudes change
 * - Locations become accessible/locked
 * - Party knowledge updates
 * - Factions react
 * - Ongoing effects tracked
 * - Fiction stays coherent
 */

class WorldStateUpdater {
  constructor(worldState = null) {
    this.world = worldState || this.initializeWorld();
    this.changeLog = [];
    this.consequences = [];
  }

  /**
   * Initialize world structure
   */
  initializeWorld() {
    return {
      npcs: {},
      locations: {},
      factions: {},
      partyState: {
        location: 'start',
        knownFacts: [],
        relationships: {},
        inventory: {},
        conditions: []
      },
      timeline: [],
      secrets: [],
      ongoingEffects: []
    };
  }

  /**
   * Apply resolution to world
   */
  applyResolution(resolution, party = null, module = null) {
    const update = {
      timestamp: new Date().toISOString(),
      resolution: resolution.intent,
      outcome: resolution.outcome,
      changes: []
    };

    // Process each world change
    for (const change of resolution.worldChanges) {
      this.applyChange(change, resolution, party);
      update.changes.push(change);
    }

    // Apply NPC reaction
    if (resolution.npcReaction) {
      this.applyNPCReaction(resolution.npcReaction);
    }

    // Add to timeline
    this.world.timeline.push(update);
    this.changeLog.push(update);

    // Check for cascading consequences
    this.checkConsequences(resolution, party);

    return update;
  }

  /**
   * Apply individual world change
   */
  applyChange(change, resolution, party = null) {
    switch (change.type) {
      case 'location_accessible':
        if (this.world.locations[change.location]) {
          this.world.locations[change.location].accessible = true;
          this.world.locations[change.location].discoveredBy = party?.name;
          this.world.locations[change.location].discoveredAt = new Date().toISOString();
        }
        break;

      case 'npc_attitude_change':
        if (this.world.npcs[change.npc]) {
          const npc = this.world.npcs[change.npc];
          npc.attitude = change.attitude;
          npc.attitudeChangedBy = resolution.intent;
          npc.attitudeChangedAt = new Date().toISOString();
          
          // Consequences of attitude shift
          if (change.attitude === 'friendly') {
            this.consequences.push({
              type: 'npc_aid',
              npc: change.npc,
              description: `${npc.name} may now offer assistance or information`
            });
          }
          if (change.attitude === 'hostile') {
            this.consequences.push({
              type: 'npc_threat',
              npc: change.npc,
              description: `${npc.name} is now a threat`
            });
          }
        }
        break;

      case 'lore_revealed':
        if (change.lore && !this.world.partyState.knownFacts.includes(change.lore)) {
          this.world.partyState.knownFacts.push(change.lore);
        }
        break;

      case 'party_knowledge_increase':
        this.world.partyState.knownFacts.push(`Gained insight: ${resolution.intent}`);
        break;

      case 'faction_reputation_increase':
        if (!this.world.factions[change.faction]) {
          this.world.factions[change.faction] = { reputation: 0 };
        }
        this.world.factions[change.faction].reputation += 10;
        break;

      case 'npc_becomes_ally':
        if (this.world.npcs[change.npc]) {
          this.world.npcs[change.npc].isAlly = true;
          this.world.partyState.relationships[change.npc] = 'ally';
        }
        break;

      case 'combat_continues':
        this.world.partyState.conditions.push('in_combat');
        break;

      case 'party_under_pressure':
        this.consequences.push({
          type: 'urgency',
          description: 'The party must act quickly'
        });
        break;

      case 'location_locked':
        if (this.world.locations[change.location]) {
          this.world.locations[change.location].accessible = false;
          this.world.locations[change.location].lockedReason = change.reason;
        }
        break;

      case 'npc_death':
        if (this.world.npcs[change.npc]) {
          this.world.npcs[change.npc].status = 'dead';
          this.consequences.push({
            type: 'npc_death_consequence',
            npc: change.npc,
            description: `${this.world.npcs[change.npc].name} is dead. Allies may seek revenge.`
          });
        }
        break;

      case 'alarm_raised':
        this.world.partyState.conditions.push('hunted');
        this.consequences.push({
          type: 'increased_difficulty',
          description: 'Enemies have been alerted. More guards patrol.'
        });
        break;
    }
  }

  /**
   * Apply NPC reaction
   */
  applyNPCReaction(reaction) {
    if (!this.world.npcs[reaction.npc]) return;

    const npc = this.world.npcs[reaction.npc];
    npc.lastReaction = reaction.emotionalState;
    npc.willHelp = reaction.willHelp;
    npc.willAttack = reaction.willAttack;
    npc.willAlertOthers = reaction.willAlertOthers;

    if (reaction.willAttack) {
      this.consequences.push({
        type: 'combat_imminent',
        npc: reaction.npc,
        description: `${npc.name} is now hostile and will attack`
      });
    }

    if (reaction.willAlertOthers) {
      this.consequences.push({
        type: 'alarm_raised',
        npc: reaction.npc,
        description: `${npc.name} will alert others to your deception`
      });
    }
  }

  /**
   * Check for cascading consequences
   * Example: NPC dies → Friends seek revenge
   */
  checkConsequences(resolution, party = null) {
    const consequences = [];

    // Death cascades
    if (resolution.worldChanges.some(c => c.type === 'npc_death')) {
      for (const change of resolution.worldChanges) {
        if (change.type === 'npc_death') {
          const deadNpc = this.world.npcs[change.npc];
          if (deadNpc) {
            // Find allies
            for (const [npcId, npc] of Object.entries(this.world.npcs)) {
              if (npc.relationship === 'ally' && npcId !== change.npc) {
                consequences.push({
                  type: 'revenge_plot',
                  npc: npcId,
                  target: change.npc,
                  description: `${npc.name} will seek revenge for ${deadNpc.name}'s death`
                });
              }
            }
          }
        }
      }
    }

    // Alarm cascades
    if (resolution.worldChanges.some(c => c.type === 'alarm_raised')) {
      consequences.push({
        type: 'reinforcements',
        description: 'More guards will arrive in 1d6 rounds'
      });
      consequences.push({
        type: 'location_lock',
        description: 'Exits may be sealed'
      });
    }

    // Add to consequences
    this.consequences.push(...consequences);
  }

  /**
   * Get current world state
   */
  getWorldState() {
    return {
      npcs: this.world.npcs,
      locations: this.world.locations,
      factions: this.world.factions,
      partyState: this.world.partyState,
      consequences: this.consequences,
      recent_changes: this.changeLog.slice(-5)
    };
  }

  /**
   * Get NPC by ID
   */
  getNPC(npcId) {
    return this.world.npcs[npcId];
  }

  /**
   * Get location by ID
   */
  getLocation(locationId) {
    return this.world.locations[locationId];
  }

  /**
   * Get faction status
   */
  getFactionStatus(factionId) {
    return this.world.factions[factionId];
  }

  /**
   * Get party-known facts
   */
  getKnownFacts() {
    return this.world.partyState.knownFacts;
  }

  /**
   * Get active conditions
   */
  getActiveConditions() {
    return this.world.partyState.conditions;
  }

  /**
   * Get consequences needing attention
   */
  getPendingConsequences() {
    return this.consequences.filter(c => !c.resolved);
  }

  /**
   * Mark consequence as resolved
   */
  resolveConsequence(consequenceId) {
    const consequence = this.consequences.find(c => c.id === consequenceId);
    if (consequence) {
      consequence.resolved = true;
      consequence.resolvedAt = new Date().toISOString();
    }
  }

  /**
   * Add custom NPC to world
   */
  addNPC(npcData) {
    const npc = {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      attitude: 'neutral',
      relationship: null,
      isAlly: false,
      ...npcData
    };

    this.world.npcs[npc.id] = npc;
    return npc;
  }

  /**
   * Add custom location to world
   */
  addLocation(locationData) {
    const location = {
      id: locationData.id,
      name: locationData.name,
      accessible: false,
      discoveredBy: null,
      ...locationData
    };

    this.world.locations[location.id] = location;
    return location;
  }

  /**
   * Export world state
   */
  exportState() {
    return JSON.stringify({
      world: this.world,
      changeLog: this.changeLog,
      consequences: this.consequences
    }, null, 2);
  }

  /**
   * Import world state
   */
  importState(stateJSON) {
    const data = JSON.parse(stateJSON);
    this.world = data.world;
    this.changeLog = data.changeLog;
    this.consequences = data.consequences;
  }
}

export { WorldStateUpdater };
