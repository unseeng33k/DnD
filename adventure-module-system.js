#!/usr/bin/env node

/**
 * ADVENTURE MODULE SYSTEM
 * 
 * Handles loading different D&D modules/adventures with full configuration:
 * - Module metadata (name, level, duration, setting)
 * - Pre-configured parties
 * - Module-specific NPCs
 * - Pre-defined encounters
 * - Maps and locations
 * - Plot hooks and story beats
 * 
 * Usage:
 *   const module = new AdventureModule('Curse of Strahd');
 *   const config = module.load();
 *   const party = module.getPartyTemplate();
 *   const encounters = module.getEncounters();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Module Metadata - Defines adventure structure
 */
class ModuleMetadata {
  constructor(data) {
    this.id = data.id; // curse-of-strahd, lost-shrine-tamoachan, etc
    this.name = data.name; // Full name
    this.description = data.description;
    this.level = data.level; // [3, 10] means levels 3-10
    this.length = data.length; // 'short', 'medium', 'long'
    this.setting = data.setting; // Fantasy world, region, etc
    this.themes = data.themes; // ['gothic', 'horror', 'supernatural']
    this.ruleSet = data.ruleSet || 'AD&D 1e'; // Which ruleset
    this.partySize = data.partySize || [4, 6]; // Recommended party size
  }
}

/**
 * Party Template - Pre-configured party for module
 */
class PartyTemplate {
  constructor(data) {
    this.moduleId = data.moduleId;
    this.name = data.name; // "Curse of Strahd Party"
    this.members = data.members; // Array of character templates
    this.difficulty = data.difficulty; // 'easy', 'medium', 'hard'
    this.story = data.story; // Why they're together, motivation
  }

  instantiate() {
    // Create actual party members with randomized values
    return this.members.map(template => ({
      ...template,
      hp: template.hp + Math.floor(Math.random() * 4),
      // Keep other stats as-is from template
    }));
  }
}

/**
 * Module Location - Predefined location with scenes
 */
class ModuleLocation {
  constructor(data) {
    this.id = data.id; // 'castle-ravenloft', 'village-barovia'
    this.name = data.name;
    this.description = data.description;
    this.type = data.type; // 'dungeon', 'town', 'wilderness', 'npc-lair'
    this.level = data.level; // Dungeon level if applicable
    this.encounters = data.encounters; // Encounter IDs available here
    this.npcs = data.npcs; // NPC IDs present
    this.connections = data.connections; // Other location IDs connected to this
    this.atmosphere = data.atmosphere; // Ambiance description
    this.music = data.music; // YouTube music link
    this.secrets = data.secrets; // Hidden things to discover
  }
}

/**
 * Module Encounter - Predefined combat encounter
 */
class ModuleEncounter {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.locationId = data.locationId;
    this.difficulty = data.difficulty; // 'trivial', 'easy', 'medium', 'hard', 'deadly'
    this.enemies = data.enemies; // Array of enemy definitions
    this.objectives = data.objectives; // What players need to accomplish
    this.rewards = data.rewards; // XP, treasure, story rewards
    this.special = data.special; // Environmental effects, tactics, etc
  }
}

/**
 * Module NPC - Predefined NPC with personality and hooks
 */
class ModuleNPC {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role; // 'villain', 'ally', 'neutral', 'quest-giver'
    this.alignment = data.alignment;
    this.class = data.class;
    this.level = data.level;
    this.personality = data.personality; // Description of temperament
    this.motives = data.motives; // What they want
    this.plot_hooks = data.plot_hooks; // How to involve in story
    this.stat_block = data.stat_block; // Combat stats if needed
  }
}

/**
 * MAIN ADVENTURE MODULE LOADER
 */
class AdventureModule {
  constructor(moduleId) {
    this.moduleId = moduleId;
    this.metadata = null;
    this.partyTemplate = null;
    this.locations = new Map();
    this.encounters = new Map();
    this.npcs = new Map();
    this.modulePath = path.join(__dirname, 'modules', moduleId);
    this.load();
  }

  /**
   * Load all module data from directory
   */
  load() {
    if (!fs.existsSync(this.modulePath)) {
      throw new Error(`Module not found: ${this.moduleId}`);
    }

    // Load metadata
    const metadataFile = path.join(this.modulePath, 'metadata.json');
    if (fs.existsSync(metadataFile)) {
      const data = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
      this.metadata = new ModuleMetadata(data);
    }

    // Load party template
    const partyFile = path.join(this.modulePath, 'party.json');
    if (fs.existsSync(partyFile)) {
      const data = JSON.parse(fs.readFileSync(partyFile, 'utf8'));
      this.partyTemplate = new PartyTemplate(data);
    }

    // Load locations
    const locationsDir = path.join(this.modulePath, 'locations');
    if (fs.existsSync(locationsDir)) {
      const files = fs.readdirSync(locationsDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const data = JSON.parse(fs.readFileSync(path.join(locationsDir, file), 'utf8'));
          const location = new ModuleLocation(data);
          this.locations.set(location.id, location);
        }
      });
    }

    // Load encounters
    const encountersDir = path.join(this.modulePath, 'encounters');
    if (fs.existsSync(encountersDir)) {
      const files = fs.readdirSync(encountersDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const data = JSON.parse(fs.readFileSync(path.join(encountersDir, file), 'utf8'));
          const encounter = new ModuleEncounter(data);
          this.encounters.set(encounter.id, encounter);
        }
      });
    }

    // Load NPCs
    const npcsDir = path.join(this.modulePath, 'npcs');
    if (fs.existsSync(npcsDir)) {
      const files = fs.readdirSync(npcsDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const data = JSON.parse(fs.readFileSync(path.join(npcsDir, file), 'utf8'));
          const npc = new ModuleNPC(data);
          this.npcs.set(npc.id, npc);
        }
      });
    }

    return {
      metadata: this.metadata,
      locationsLoaded: this.locations.size,
      encountersLoaded: this.encounters.size,
      npcsLoaded: this.npcs.size
    };
  }

  /**
   * Get instantiated party for this module
   */
  getParty() {
    if (!this.partyTemplate) {
      throw new Error('No party template for this module');
    }
    return this.partyTemplate.instantiate();
  }

  /**
   * Get a specific location
   */
  getLocation(locationId) {
    return this.locations.get(locationId) || null;
  }

  /**
   * Get all locations
   */
  getAllLocations() {
    return Array.from(this.locations.values());
  }

  /**
   * Get a specific encounter
   */
  getEncounter(encounterId) {
    return this.encounters.get(encounterId) || null;
  }

  /**
   * Get all encounters
   */
  getAllEncounters() {
    return Array.from(this.encounters.values());
  }

  /**
   * Get encounters for a specific location
   */
  getEncountersForLocation(locationId) {
    return Array.from(this.encounters.values()).filter(
      e => e.locationId === locationId
    );
  }

  /**
   * Get a specific NPC
   */
  getNPC(npcId) {
    return this.npcs.get(npcId) || null;
  }

  /**
   * Get all NPCs
   */
  getAllNPCs() {
    return Array.from(this.npcs.values());
  }

  /**
   * Get NPCs for a specific location
   */
  getNPCsForLocation(locationId) {
    const location = this.getLocation(locationId);
    if (!location || !location.npcs) return [];
    return location.npcs.map(npcId => this.getNPC(npcId)).filter(n => n);
  }

  /**
   * Get module info
   */
  getInfo() {
    return {
      id: this.moduleId,
      name: this.metadata?.name,
      description: this.metadata?.description,
      level: this.metadata?.level,
      length: this.metadata?.length,
      partyTemplate: this.partyTemplate?.name,
      locations: this.locations.size,
      encounters: this.encounters.size,
      npcs: this.npcs.size,
    };
  }
}

/**
 * MODULE REGISTRY - Manage all available modules
 */
class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.modulesDir = path.join(__dirname, 'modules');
    this.scan();
  }

  /**
   * Scan modules directory for available modules
   */
  scan() {
    if (!fs.existsSync(this.modulesDir)) {
      fs.mkdirSync(this.modulesDir, { recursive: true });
      return;
    }

    const dirs = fs.readdirSync(this.modulesDir);
    dirs.forEach(dir => {
      const metadataFile = path.join(this.modulesDir, dir, 'metadata.json');
      if (fs.existsSync(metadataFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
          this.modules.set(dir, {
            id: dir,
            name: data.name,
            description: data.description,
            level: data.level
          });
        } catch (e) {
          // Silent fail
        }
      }
    });
  }

  /**
   * List all available modules
   */
  list() {
    return Array.from(this.modules.values());
  }

  /**
   * Load a module
   */
  load(moduleId) {
    if (!this.modules.has(moduleId)) {
      throw new Error(`Module not found: ${moduleId}`);
    }
    return new AdventureModule(moduleId);
  }

  /**
   * Check if module exists
   */
  has(moduleId) {
    return this.modules.has(moduleId);
  }
}

export { AdventureModule, ModuleMetadata, PartyTemplate, ModuleLocation, ModuleEncounter, ModuleNPC, ModuleRegistry };
