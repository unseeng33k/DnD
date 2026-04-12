#!/usr/bin/env node

/**
 * UNIFIED D&D ENGINE - Version 3
 * 
 * Integrates:
 * - PartyManager (party + relationships)
 * - CharacterPersonality (character voice & arcs)
 * - NPCRelationshipNetwork (NPC intelligence & memory)
 * - IntegratedCinematicAmbiance (narrative + sensory)
 * - ModuleBuilder (module creation)
 * 
 * This is the COMPLETE backend for a living, breathing D&D world.
 */

import { PartyManager } from './party-manager.js';
import { CharacterPersonality } from './character-personality.js';
import { NPCRelationshipNetwork } from './npc-relationship-network.js';
import { IntegratedCinematicAmbiance } from './integrated-cinematic-ambiance.js';
import { ModuleBuilder } from './module-builder.js';
import fs from 'fs';
import path from 'path';

class UnifiedDndEngine {
  constructor(campaignName, moduleId) {
    this.campaignName = campaignName;
    this.moduleId = moduleId;
    this.sessionNumber = 0;
    this.sessionLog = [];

    // Core systems
    this.party = new PartyManager(campaignName);
    this.npcs = new NPCRelationshipNetwork(campaignName);
    this.cinema = null;
    this.ambiance = null;

    // Character personalities indexed by name
    this.characterPersonalities = new Map();

    // Campaign state
    this.worldState = {
      timeElapsed: 0,
      dayCount: 0,
      eventsOccurred: [],
      secretsRevealed: [],
      factionsAffected: []
    };
  }

  /**
   * Initialize a new campaign
   */
  async initializeCampaign(moduleData) {
    console.log(`\n🎲 Initializing campaign: ${this.campaignName}`);
    console.log(`📚 Module: ${this.moduleId}`);

    // Load module metadata
    const moduleMetadata = moduleData.metadata || {};

    // Initialize party
    if (moduleData.party?.members) {
      for (const member of moduleData.party.members) {
        this.party.addMember(member);

        // Create personality system for each party member
        const personality = new CharacterPersonality(member);
        this.characterPersonalities.set(member.name, personality);
      }
    }

    // Initialize NPCs
    if (moduleData.npcs) {
      for (const npc of moduleData.npcs) {
        this.npcs.addNPC(npc);
      }
    }

    console.log(`✅ Campaign initialized`);
    console.log(`👥 Party: ${this.party.members.size} members`);
    console.log(`🧙 NPCs: ${this.npcs.npcs.size} characters`);

    return {
      campaign: this.campaignName,
      partySize: this.party.members.size,
      npcCount: this.npcs.npcs.size
    };
  }

  /**
   * Start a new session
   */
  startSession(sessionNumber) {
    this.sessionNumber = sessionNumber;
    const sessionStart = {
      sessionNumber,
      startTime: new Date().toISOString(),
      partyStatus: this.party.getStatus(),
      worldState: this.worldState
    };

    this.sessionLog.push(sessionStart);
    console.log(`\n🎭 SESSION ${sessionNumber} START`);
    console.log(`Party morale: ${this.party.morale}/100`);

    return sessionStart;
  }

  /**
   * Handle party decision
   */
  async handlePartyDecision(decision, characterMakingDecision) {
    const personality = this.characterPersonalities.get(characterMakingDecision);
    if (!personality) return { error: 'Character not found' };

    // Get personality-based response
    const response = personality.wouldAgreeWith(decision);

    // Record in party log
    this.party.recordInteraction(
      characterMakingDecision,
      'another_party_member',
      `Proposed: ${decision.description}`,
      response.agrees ? 10 : -5
    );

    // Check if NPCs react to this decision
    const npcReactions = [];
    for (const [npcId, npc] of this.npcs.npcs.entries()) {
      if (decision.affectsNPCs?.includes(npcId)) {
        const reaction = this.npcs.recordPartyInteraction(
          npcId,
          decision.description,
          decision.emotionalWeight || 0
        );
        npcReactions.push(reaction);
      }
    }

    return {
      character: characterMakingDecision,
      decision: decision.description,
      response: response.likelyResponse,
      npcReactions
    };
  }

  /**
   * Handle combat encounter
   */
  async startEncounter(encounter, cinematicEngine) {
    console.log(`\n⚔️  ENCOUNTER: ${encounter.name}`);

    const combatLog = {
      encounter: encounter.name,
      difficulty: encounter.difficulty,
      enemies: encounter.enemies,
      rounds: [],
      casualties: {
        party: [],
        enemies: []
      }
    };

    return {
      encounter: encounter.name,
      difficulty: encounter.difficulty,
      ready: true,
      combatLog
    };
  }

  /**
   * Handle character growth/arc completion
   */
  progressCharacterArc(characterName, test, passed) {
    const personality = this.characterPersonalities.get(characterName);
    if (!personality) return { error: 'Character not found' };

    if (passed) {
      personality.growTrait('compassion', 1);
      personality.arc.currentTrait = `${characterName} has grown`;

      return {
        character: characterName,
        test: test,
        result: 'PASSED',
        effect: 'Character grows',
        newTrait: personality.arc.currentTrait
      };
    } else {
      personality.growTrait('caution', 1);
      return {
        character: characterName,
        test: test,
        result: 'FAILED',
        effect: 'Character learns through failure',
        lesson: 'Caution increased'
      };
    }
  }

  /**
   * Handle NPC death - cascading consequences
   */
  handleNPCDeath(npcId, killer) {
    const npc = this.npcs.npcs.get(npcId);
    if (!npc) return null;

    console.log(`\n💀 ${npc.name} is dead`);

    // Check for consequences
    const cascades = this.npcs.checkConsequences({
      npcId,
      type: 'death'
    });

    // Update world state
    this.worldState.eventsOccurred.push({
      event: `${npc.name} died`,
      causedBy: killer,
      timestamp: new Date().toISOString(),
      consequences: cascades
    });

    // Affect party morale
    const moodEffect = npc.partyReputation > 0 ? -20 : 10;
    this.party.updateMorale(moodEffect, `${npc.name} died`);

    return {
      npc: npc.name,
      role: npc.role,
      cascades,
      moraleEffect: moodEffect
    };
  }

  /**
   * Handle party member death
   */
  handlePartyMemberDeath(characterName, killer) {
    const personality = this.characterPersonalities.get(characterName);
    if (!personality) return null;

    console.log(`\n💀💀💀 ${characterName} is DEAD`);

    // Remove from party
    this.party.members.delete(characterName);
    this.characterPersonalities.delete(characterName);

    // Affect other party members
    for (const [name, otherChar] of this.characterPersonalities.entries()) {
      const rel = this.party.getCharacterRelationships(name);
      const wasRelated = rel.some(r =>
        (r.character1 === characterName || r.character2 === characterName) &&
        r.strength > 0
      );

      if (wasRelated) {
        otherChar.recordExperience(
          `${characterName} died`,
          'Grief. Regret. Loss.'
        );
      }
    }

    // Party morale tanks
    this.party.updateMorale(-40, `${characterName} died`);

    // Record in world state
    this.worldState.eventsOccurred.push({
      event: `Character ${characterName} died`,
      causedBy: killer,
      timestamp: new Date().toISOString()
    });

    return {
      character: characterName,
      killer,
      partyMoraleHit: -40,
      partyMembersAffected: this.party.members.size
    };
  }

  /**
   * Get complete game state snapshot
   */
  getGameState() {
    return {
      campaign: this.campaignName,
      module: this.moduleId,
      session: this.sessionNumber,
      partyStatus: this.party.getStatus(),
      npcNetwork: this.npcs.getNetworkStatus(),
      worldState: this.worldState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Save campaign state to file
   */
  saveCampaignState(outputPath) {
    const state = {
      campaign: this.campaignName,
      module: this.moduleId,
      sessionNumber: this.sessionNumber,
      partyData: this.party.members,
      partyRelationships: Array.from(this.party.relationships.values()),
      partyMorale: this.party.morale,
      npcNetwork: {
        npcs: Array.from(this.npcs.npcs.values()),
        relationships: Array.from(this.npcs.relationships.values()),
        secrets: this.npcs.secrets
      },
      worldState: this.worldState,
      characterPersonalities: Array.from(this.characterPersonalities.values()).map(p => p.getSnapshot()),
      sessionLog: this.sessionLog,
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(state, null, 2));
    return outputPath;
  }

  /**
   * Load campaign state from file
   */
  static loadCampaignState(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Reconstruction logic would go here
    return data;
  }
}

export { UnifiedDndEngine };
