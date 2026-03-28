#!/usr/bin/env node

/**
 * NPC RELATIONSHIP NETWORK
 * 
 * NPCs are not static. They:
 * - Remember interactions with party
 * - Have relationships with EACH OTHER
 * - Change their behavior based on party actions
 * - Form alliances and betray
 * - Remember broken promises
 * 
 * This makes the world feel ALIVE.
 */

class NPCRelationshipNetwork {
  constructor(campaignName) {
    this.campaignName = campaignName;
    this.npcs = new Map();
    this.relationships = new Map();
    this.factions = new Map();
    this.secrets = [];
    this.eventLog = [];
  }

  /**
   * Add an NPC to the network
   */
  addNPC(npcData) {
    const npc = {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      alignment: npcData.alignment,
      class: npcData.class,
      level: npcData.level,
      personality: npcData.personality,

      // Relationships with OTHER NPCs
      npcRelationships: npcData.npcRelationships || {},
      // { 'strahd': 'fears', 'rahadin': 'servant', 'ireena': 'protects' }

      // Relationship with PARTY
      partyReputation: 0,
      partyInteractions: [],
      attitude: 'neutral',

      // Faction allegiances
      factions: npcData.factions || {},

      // Secrets
      secrets: npcData.secrets || [],

      // Motivations
      goals: npcData.goals || [],
      fears: npcData.fears || [],

      // Memory of interactions
      memory: {
        firstMeeting: null,
        promises: [],
        betrayals: [],
        favorsOwed: [],
        debts: []
      }
    };

    this.npcs.set(npcData.id, npc);
    return npc;
  }

  /**
   * Record interaction between party and NPC
   */
  recordPartyInteraction(npcId, action, emotionalWeight = 0) {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    npc.partyInteractions.push({
      action,
      weight: emotionalWeight,
      timestamp: new Date().toISOString()
    });

    npc.partyReputation += emotionalWeight;

    // Update attitude based on reputation
    if (npc.partyReputation > 50) {
      npc.attitude = 'allied';
    } else if (npc.partyReputation > 20) {
      npc.attitude = 'friendly';
    } else if (npc.partyReputation > -20) {
      npc.attitude = 'neutral';
    } else if (npc.partyReputation > -50) {
      npc.attitude = 'hostile';
    } else {
      npc.attitude = 'enemy';
    }

    this.eventLog.push({
      type: 'party_interaction',
      npc: npc.name,
      action,
      weight: emotionalWeight,
      timestamp: new Date().toISOString()
    });

    return {
      npc: npc.name,
      attitude: npc.attitude,
      reputation: npc.partyReputation
    };
  }

  /**
   * Record a promise made to NPC
   */
  recordPromise(npcId, promise) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    npc.memory.promises.push({
      promise,
      date: new Date().toISOString(),
      kept: null
    });
  }

  /**
   * Record broken promise
   */
  recordBrokenPromise(npcId, promise) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    const promiseRecord = npc.memory.promises.find(p => p.promise === promise);
    if (promiseRecord) {
      promiseRecord.kept = false;
    }

    npc.memory.betrayals.push({
      betrayal: `Broke promise: ${promise}`,
      date: new Date().toISOString(),
      severity: 'high'
    });

    // Major reputation hit
    npc.partyReputation -= 50;
    npc.attitude = 'hostile';

    this.eventLog.push({
      type: 'broken_promise',
      npc: npc.name,
      promise,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record favor owed
   */
  recordFavor(npcId, favor) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    npc.memory.favorsOwed.push({
      favor,
      date: new Date().toISOString(),
      repaid: false
    });

    // Positive reputation
    npc.partyReputation += 10;
  }

  /**
   * Set relationship between two NPCs
   */
  setNPCRelationship(npcId1, npcId2, relationshipType) {
    const key = [npcId1, npcId2].sort().join('↔');

    this.relationships.set(key, {
      npc1: npcId1,
      npc2: npcId2,
      relationship: relationshipType,
      strength: 0,
      history: []
    });

    // Also set on individual NPCs
    const npc1 = this.npcs.get(npcId1);
    const npc2 = this.npcs.get(npcId2);

    if (npc1) npc1.npcRelationships[npcId2] = relationshipType;
    if (npc2) npc2.npcRelationships[npcId1] = relationshipType;
  }

  /**
   * Get NPC attitude toward party
   */
  getNPCAttitude(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    return {
      name: npc.name,
      attitude: npc.attitude,
      reputation: npc.partyReputation,
      description: this.describeAttitude(npc.attitude)
    };
  }

  /**
   * Describe what attitude means
   */
  describeAttitude(attitude) {
    const descriptions = {
      allied: 'Will help party, take risks for them, share information',
      friendly: 'Helpful, but won\'t take unnecessary risks',
      neutral: 'Will deal with party, but not bound to help',
      hostile: 'Actively opposes party, will betray if possible',
      enemy: 'Will attack party on sight'
    };
    return descriptions[attitude] || 'Unknown';
  }

  /**
   * CONSEQUENCE CASCADE: Something happens to one NPC, affects others
   */
  checkConsequences(event) {
    const cascades = [];

    for (const [id, npc] of this.npcs.entries()) {
      // Check if NPC has relationship with event target
      if (npc.npcRelationships[event.npcId]) {
        const relationshipType = npc.npcRelationships[event.npcId];

        let consequence = null;

        if (event.type === 'death' && relationshipType === 'servant') {
          // Servant's master dies -> servant is freed or seeks revenge
          consequence = {
            npc: npc.name,
            event: `${event.npcId} died`,
            consequence: 'Lost their master. Will seek revenge or freedom.',
            action: 'Becomes wildcard or enemy'
          };
        } else if (event.type === 'death' && relationshipType === 'loves') {
          consequence = {
            npc: npc.name,
            event: `${event.npcId} died`,
            consequence: 'Lover is dead. Grief and rage.',
            action: 'Becomes enemy. Seeks vengeance.'
          };
        } else if (event.type === 'aligned_with_party' && relationshipType === 'opposes') {
          consequence = {
            npc: npc.name,
            event: `${event.npcId} aligned with party`,
            consequence: 'Their opponent joined the party.',
            action: 'Now opposes party by association'
          };
        } else if (event.type === 'betrayal_of_ally' && relationshipType === 'allied') {
          consequence = {
            npc: npc.name,
            event: `${event.npcId} was betrayed`,
            consequence: 'Their ally was betrayed.',
            action: 'Becomes cautious. Might abandon party or seek revenge.'
          };
        }

        if (consequence) {
          cascades.push(consequence);
        }
      }
    }

    return cascades;
  }

  /**
   * Add secret (hidden connections between NPCs and plot)
   */
  addSecret(secret) {
    this.secrets.push({
      secret,
      knownBy: [],
      revealed: false,
      date: new Date().toISOString()
    });
  }

  /**
   * Reveal secret (affects world state)
   */
  revealSecret(secretIndex) {
    if (this.secrets[secretIndex]) {
      this.secrets[secretIndex].revealed = true;

      this.eventLog.push({
        type: 'secret_revealed',
        secret: this.secrets[secretIndex].secret,
        timestamp: new Date().toISOString()
      });

      // Consequences cascade through NPC network
      return this.checkSecretConsequences(secretIndex);
    }
  }

  /**
   * What happens when a secret is revealed
   */
  checkSecretConsequences(secretIndex) {
    const secret = this.secrets[secretIndex];
    const consequences = [];

    // Different secrets have different consequences
    // "X is secretly the villain" -> NPCs who trust X become enemies
    // "X and Y are siblings" -> Relationship changes
    // etc.

    return consequences;
  }

  /**
   * Get NPC status snapshot
   */
  getNPCStatus(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;

    return {
      name: npc.name,
      role: npc.role,
      alignment: npc.alignment,
      attitude: npc.attitude,
      partyReputation: npc.partyReputation,
      goals: npc.goals,
      fears: npc.fears,
      npcRelationships: npc.npcRelationships,
      promises: npc.memory.promises,
      betrayals: npc.memory.betrayals,
      favorsOwed: npc.memory.favorsOwed
    };
  }

  /**
   * Get entire network status
   */
  getNetworkStatus() {
    const npcStatuses = [];
    for (const [id, npc] of this.npcs.entries()) {
      npcStatuses.push({
        name: npc.name,
        attitude: npc.attitude,
        reputation: npc.partyReputation
      });
    }

    return {
      campaign: this.campaignName,
      npcCount: this.npcs.size,
      npcs: npcStatuses,
      secretCount: this.secrets.length,
      revealedSecrets: this.secrets.filter(s => s.revealed).length,
      recentEvents: this.eventLog.slice(-10)
    };
  }
}

export { NPCRelationshipNetwork };
