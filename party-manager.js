#!/usr/bin/env node

/**
 * PARTY MANAGER - Handles all party members and their relationships
 * 
 * Tracks:
 * - All party members with full stats
 * - Inter-party relationships (trust/conflict/romance)
 * - Party morale (affects behavior)
 * - Shared goals + personal secrets
 * - Character arcs progressing together
 * 
 * This is what makes a GROUP of characters feel like a PARTY.
 */

import fs from 'fs';
import path from 'path';

class PartyManager {
  constructor(campaignName) {
    this.campaignName = campaignName;
    this.members = new Map();
    this.relationships = new Map();
    this.morale = 100;
    this.goals = [];
    this.history = [];
    this.formationDate = new Date().toISOString();
  }

  /**
   * Add a party member with full personality data
   */
  addMember(characterData) {
    const member = {
      name: characterData.name,
      class: characterData.class,
      level: characterData.level,
      hp: characterData.hp,
      maxHP: characterData.maxHP,
      ac: characterData.ac,
      
      // PERSONALITY & VOICE
      personality: {
        archetype: characterData.personality?.archetype || 'undefined',
        traits: {
          openness: characterData.personality?.traits?.openness || 5,
          aggressiveness: characterData.personality?.traits?.aggressiveness || 5,
          humor: characterData.personality?.traits?.humor || 'dry',
          riskTolerance: characterData.personality?.traits?.riskTolerance || 5,
          compassion: characterData.personality?.traits?.compassion || 5
        },
        mannerisms: characterData.personality?.mannerisms || [],
        catchphrases: characterData.personality?.catchphrases || [],
        voice: {
          dialect: characterData.personality?.voice?.dialect || 'neutral',
          speed: characterData.personality?.voice?.speed || 'measured',
          vocabulary: characterData.personality?.voice?.vocabulary || 'casual'
        }
      },
      
      // MOTIVATIONS & GOALS
      goals: {
        primary: characterData.goals?.primary,
        secondary: characterData.goals?.secondary || [],
        hidden: characterData.goals?.hidden
      },
      
      // FEARS & TRIGGERS
      fears: characterData.fears || [],
      angers: characterData.angers || [],
      saddens: characterData.saddens || [],
      
      // RESOURCES
      spellSlots: characterData.spellSlots || {},
      hitDice: characterData.hitDice || {},
      conditions: [],
      
      // CHARACTER ARC
      arc: {
        startingTrait: characterData.arc?.startingTrait,
        currentTrait: characterData.arc?.currentTrait || characterData.arc?.startingTrait,
        nextTest: characterData.arc?.nextTest,
        completionPoint: characterData.arc?.completionPoint
      }
    };

    this.members.set(characterData.name, member);
    return member;
  }

  /**
   * Define relationship between two party members
   */
  setRelationship(char1, char2, relationshipType, strength = 0) {
    const key = [char1, char2].sort().join('↔');
    
    this.relationships.set(key, {
      character1: char1,
      character2: char2,
      relationship: relationshipType,
      strength: strength,
      history: []
    });
  }

  /**
   * Record interaction between party members
   * Affects relationship strength
   */
  recordInteraction(char1, char2, event, emotionalWeight = 0) {
    const key = [char1, char2].sort().join('↔');
    const rel = this.relationships.get(key);
    
    if (!rel) {
      this.setRelationship(char1, char2, 'neutral', 0);
      return this.recordInteraction(char1, char2, event, emotionalWeight);
    }

    rel.history.push({
      event,
      timestamp: new Date().toISOString(),
      weight: emotionalWeight
    });

    // Update relationship strength
    if (event.includes('trust') || event.includes('save')) {
      rel.strength += Math.abs(emotionalWeight);
    }
    if (event.includes('betrayal') || event.includes('abandon')) {
      rel.strength -= Math.abs(emotionalWeight);
    }
  }

  /**
   * Update party morale
   */
  updateMorale(delta, reason = '') {
    const previous = this.morale;
    this.morale = Math.max(0, Math.min(100, this.morale + delta));

    this.history.push({
      type: 'morale_change',
      previous,
      current: this.morale,
      delta,
      reason,
      timestamp: new Date().toISOString()
    });

    return {
      previous,
      current: this.morale,
      status: this.getMoraleStatus(),
      effect: this.getMoraleEffect()
    };
  }

  /**
   * Get morale status
   */
  getMoraleStatus() {
    if (this.morale < 20) return 'broken';
    if (this.morale < 40) return 'wavering';
    if (this.morale < 60) return 'uncertain';
    if (this.morale < 80) return 'confident';
    return 'excellent';
  }

  /**
   * Get what morale affects
   */
  getMoraleEffect() {
    const status = this.getMoraleStatus();
    const effects = {
      broken: 'Party losing hope, may surrender or flee',
      wavering: 'Some doubt emerging, hesitation in decisions',
      uncertain: 'Party steady but not inspired',
      confident: 'Party united and determined',
      excellent: 'Party motivated and fearless'
    };
    return effects[status];
  }

  /**
   * Get party composition
   */
  getComposition() {
    const members = Array.from(this.members.values());
    return {
      size: members.length,
      classes: members.map(m => m.class),
      averageLevel: Math.floor(members.reduce((s, m) => s + m.level, 0) / members.length),
      averageHP: Math.floor(members.reduce((s, m) => s + m.hp, 0) / members.length)
    };
  }

  /**
   * Get relationship between two characters
   */
  getRelationship(char1, char2) {
    const key = [char1, char2].sort().join('↔');
    return this.relationships.get(key) || null;
  }

  /**
   * Get all relationships for a character
   */
  getCharacterRelationships(characterName) {
    const rels = [];
    for (const [key, rel] of this.relationships.entries()) {
      if (rel.character1 === characterName || rel.character2 === characterName) {
        rels.push(rel);
      }
    }
    return rels;
  }

  /**
   * Get party status snapshot
   */
  getStatus() {
    return {
      campaign: this.campaignName,
      memberCount: this.members.size,
      composition: this.getComposition(),
      morale: {
        value: this.morale,
        status: this.getMoraleStatus(),
        effect: this.getMoraleEffect()
      },
      relationships: Array.from(this.relationships.values()),
      recentHistory: this.history.slice(-10)
    };
  }

  /**
   * Save party to file
   */
  saveParty(outputPath) {
    const partyData = {
      campaign: this.campaignName,
      formationDate: this.formationDate,
      members: Array.from(this.members.values()),
      relationships: Array.from(this.relationships.values()),
      morale: this.morale,
      history: this.history,
      goals: this.goals
    };

    fs.writeFileSync(outputPath, JSON.stringify(partyData, null, 2));
    return outputPath;
  }

  /**
   * Load party from file
   */
  static loadParty(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const party = new PartyManager(data.campaign);
    
    data.members.forEach(member => {
      party.members.set(member.name, member);
    });
    
    data.relationships.forEach(rel => {
      party.relationships.set([rel.character1, rel.character2].sort().join('↔'), rel);
    });
    
    party.morale = data.morale;
    party.history = data.history;
    party.goals = data.goals;
    
    return party;
  }
}

export { PartyManager };
