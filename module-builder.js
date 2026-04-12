#!/usr/bin/env node

/**
 * MODULE BUILDER - Automates module creation and population
 * 
 * Instead of manually creating folders and JSON files,
 * use ModuleBuilder to define and build entire modules.
 * 
 * Usage:
 * const module = new ModuleBuilder('tamoachan', 'Lost Shrine');
 * module.setMetadata({...});
 * module.addLocation({...});
 * await module.build();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ModuleBuilder {
  constructor(moduleId, moduleName, author = 'DM') {
    this.moduleId = moduleId;
    this.moduleName = moduleName;
    this.author = author;
    this.baseDir = path.join(__dirname, 'modules', moduleId);
    
    this.metadata = {
      id: moduleId,
      name: moduleName,
      author: author
    };
    
    this.party = {
      members: []
    };
    
    this.locations = [];
    this.encounters = [];
    this.npcs = [];
    this.validation = [];
  }

  /**
   * Set module metadata
   */
  setMetadata(config) {
    this.metadata = {
      ...this.metadata,
      description: config.description,
      level: config.level || [1, 3],
      length: config.length || 'medium',
      setting: config.setting || 'Generic',
      themes: config.themes || [],
      ruleSet: config.ruleSet || 'AD&D 1e',
      partySize: config.partySize || [4, 6],
      estimatedPlayTime: config.estimatedPlayTime || '10-20 sessions',
      createdAt: new Date().toISOString()
    };

    this.validate('metadata', this.metadata);
    return this;
  }

  /**
   * Add party member
   */
  addPartyMember(characterData) {
    const member = {
      name: characterData.name,
      class: characterData.class,
      level: characterData.level,
      hp: characterData.hp,
      maxHP: characterData.maxHP,
      ac: characterData.ac,
      alignment: characterData.alignment || 'Neutral',
      
      // Personality
      personality: {
        archetype: characterData.personality?.archetype,
        traits: characterData.personality?.traits,
        mannerisms: characterData.personality?.mannerisms,
        catchphrases: characterData.personality?.catchphrases,
        voice: characterData.personality?.voice
      },
      
      // Goals & fears
      goals: characterData.goals,
      fears: characterData.fears,
      
      // Arc
      arc: {
        startingTrait: characterData.arc?.startingTrait,
        currentTrait: characterData.arc?.currentTrait,
        nextTest: characterData.arc?.nextTest
      }
    };

    this.party.members.push(member);
    this.validate('party_member', member);
    return this;
  }

  /**
   * Add location
   */
  addLocation(locationData) {
    const location = {
      id: locationData.id,
      name: locationData.name,
      description: locationData.description,
      type: locationData.type || 'dungeon',
      level: locationData.level,
      encounters: locationData.encounters || [],
      npcs: locationData.npcs || [],
      connections: locationData.connections || [],
      atmosphere: locationData.atmosphere,
      music: locationData.music,
      secrets: locationData.secrets || [],
      createdAt: new Date().toISOString()
    };

    this.locations.push(location);
    this.validate('location', location);
    return this;
  }

  /**
   * Add encounter
   */
  addEncounter(encounterData) {
    const encounter = {
      id: encounterData.id,
      name: encounterData.name,
      locationId: encounterData.locationId,
      difficulty: encounterData.difficulty || 'medium',
      enemies: encounterData.enemies || [],
      objectives: encounterData.objectives || [],
      rewards: encounterData.rewards || { xp: 0, treasure: [] },
      special: encounterData.special,
      createdAt: new Date().toISOString()
    };

    this.encounters.push(encounter);
    this.validate('encounter', encounter);
    return this;
  }

  /**
   * Add NPC
   */
  addNPC(npcData) {
    const npc = {
      id: npcData.id,
      name: npcData.name,
      role: npcData.role,
      alignment: npcData.alignment || 'Neutral',
      class: npcData.class,
      level: npcData.level,
      
      personality: npcData.personality,
      goals: npcData.goals || [],
      fears: npcData.fears || [],
      
      relationships: npcData.relationships || {},
      
      memory: {
        interactionsWithParty: [],
        promisesMade: [],
        reputation: 0
      },
      
      stat_block: npcData.stat_block,
      createdAt: new Date().toISOString()
    };

    this.npcs.push(npc);
    this.validate('npc', npc);
    return this;
  }

  /**
   * Validation helper
   */
  validate(type, data) {
    const errors = [];

    switch (type) {
      case 'metadata':
        if (!data.description) errors.push('Missing metadata.description');
        if (!data.level) errors.push('Missing metadata.level');
        break;
      case 'party_member':
        if (!data.name) errors.push('Party member missing name');
        if (!data.class) errors.push('Party member missing class');
        if (!data.hp) errors.push('Party member missing hp');
        break;
      case 'location':
        if (!data.id) errors.push('Location missing id');
        if (!data.name) errors.push('Location missing name');
        break;
      case 'encounter':
        if (!data.id) errors.push('Encounter missing id');
        if (!data.locationId) errors.push('Encounter missing locationId');
        break;
      case 'npc':
        if (!data.id) errors.push('NPC missing id');
        if (!data.name) errors.push('NPC missing name');
        break;
    }

    if (errors.length > 0) {
      this.validation.push({ type, errors });
    }
  }

  /**
   * Build the module - create all directories and files
   */
  async build() {
    try {
      // Create base directory
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }

      // Create subdirectories
      const subdirs = ['locations', 'encounters', 'npcs'];
      for (const subdir of subdirs) {
        const dirPath = path.join(this.baseDir, subdir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }

      // Write metadata
      fs.writeFileSync(
        path.join(this.baseDir, 'metadata.json'),
        JSON.stringify(this.metadata, null, 2)
      );

      // Write party
      fs.writeFileSync(
        path.join(this.baseDir, 'party.json'),
        JSON.stringify(this.party, null, 2)
      );

      // Write locations
      for (const location of this.locations) {
        fs.writeFileSync(
          path.join(this.baseDir, 'locations', `${location.id}.json`),
          JSON.stringify(location, null, 2)
        );
      }

      // Write encounters
      for (const encounter of this.encounters) {
        fs.writeFileSync(
          path.join(this.baseDir, 'encounters', `${encounter.id}.json`),
          JSON.stringify(encounter, null, 2)
        );
      }

      // Write NPCs
      for (const npc of this.npcs) {
        fs.writeFileSync(
          path.join(this.baseDir, 'npcs', `${npc.id}.json`),
          JSON.stringify(npc, null, 2)
        );
      }

      return {
        success: true,
        moduleId: this.moduleId,
        path: this.baseDir,
        stats: {
          locations: this.locations.length,
          encounters: this.encounters.length,
          npcs: this.npcs.length,
          partyMembers: this.party.members.length
        },
        validationErrors: this.validation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get module summary
   */
  getSummary() {
    return {
      moduleId: this.moduleId,
      name: this.moduleName,
      author: this.author,
      metadata: this.metadata,
      contents: {
        locations: this.locations.length,
        encounters: this.encounters.length,
        npcs: this.npcs.length,
        partyMembers: this.party.members.length
      },
      validationIssues: this.validation.length > 0
    };
  }
}

export { ModuleBuilder };
