#!/usr/bin/env node

/**
 * PILLAR 2: PERSISTENT WORLD
 * 
 * Responsibility: World state - locations, NPCs, time, travel
 * 
 * Handles:
 * - Location tracking and discovery
 * - NPC management and state
 * - Time progression (rounds, hours, days)
 * - Travel mechanics
 * - Consequence application to world
 */

class PersistentWorldPillar {
  constructor() {
    this.name = 'PersistentWorld';
    this.locations = new Map();
    this.npcs = new Map();
    this.currentLocation = null;
    this.gameTime = {
      round: 0,
      hour: 0,
      day: 1,
      month: 1,
      year: 1
    };
  }

  initSession(engine, { party, setting }) {
    this.engine = engine;
    this.party = party;

    // Create initial location
    this.createLocation(setting.name, setting.description, setting.type || 'dungeon');
    this.currentLocation = setting.name;

    this.log(`✅ World initialized at ${setting.name}`);
  }

  /**
   * LOCATION MANAGEMENT
   */

  createLocation(name, description, type = 'generic') {
    const location = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      type, // dungeon, town, wilderness, shrine, etc.
      discovered: true,
      visited: true,
      visitedAt: new Date(),
      npcs: [],
      items: [],
      connections: {},
      state: {},
      consequences: []
    };

    this.locations.set(location.id, location);
    this.log(`📍 Created location: ${name}`);
    return location;
  }

  getLocation(nameOrId) {
    // Try by ID first
    let loc = this.locations.get(nameOrId);
    if (loc) return loc;

    // Try by name
    for (const location of this.locations.values()) {
      if (location.name === nameOrId) {
        return location;
      }
    }

    return null;
  }

  getCurrentLocation() {
    return this.getLocation(this.currentLocation);
  }

  /**
   * TRAVEL
   */

  movePartyTo(locationName) {
    const location = this.getLocation(locationName);
    if (!location) {
      this.log(`❌ Location not found: ${locationName}`);
      return false;
    }

    this.currentLocation = location.id;
    location.visited = true;
    location.visitedAt = new Date();

    this.log(`🚶 Party travels to ${location.name}`);
    return true;
  }

  getTravelTime(fromLocation, toLocation) {
    // Simplified: 1-6 hours between locations
    return Math.floor(Math.random() * 6) + 1;
  }

  /**
   * TIME MANAGEMENT
   */

  advanceTime(rounds) {
    const hoursPerRound = 0.1; // 6-second combat rounds
    this.gameTime.round += rounds;
    this.gameTime.hour += Math.floor(rounds * hoursPerRound);

    if (this.gameTime.hour >= 24) {
      this.gameTime.day += Math.floor(this.gameTime.hour / 24);
      this.gameTime.hour = this.gameTime.hour % 24;
    }

    if (this.gameTime.day > 30) {
      this.gameTime.month++;
      this.gameTime.day = 1;
    }

    if (this.gameTime.month > 12) {
      this.gameTime.year++;
      this.gameTime.month = 1;
    }
  }

  advanceDays(days) {
    this.gameTime.day += days;
    while (this.gameTime.day > 30) {
      this.gameTime.month++;
      this.gameTime.day -= 30;
    }
  }

  getTime() {
    return {
      ...this.gameTime,
      formatted: `Day ${this.gameTime.day}, Month ${this.gameTime.month}, Year ${this.gameTime.year}`
    };
  }

  /**
   * NPC MANAGEMENT
   */

  createNPC(name, role, alignment = 'Neutral') {
    const npc = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      role,
      alignment,
      location: this.currentLocation,
      disposition: 0, // -100 hostile to +100 friendly
      relationships: {},
      state: {},
      notes: []
    };

    this.npcs.set(npc.id, npc);
    
    // Add to current location
    const loc = this.getCurrentLocation();
    if (loc && !loc.npcs.includes(npc.id)) {
      loc.npcs.push(npc.id);
    }

    this.log(`👤 Created NPC: ${name} (${role})`);
    return npc;
  }

  getNPC(nameOrId) {
    let npc = this.npcs.get(nameOrId);
    if (npc) return npc;

    for (const character of this.npcs.values()) {
      if (character.name === nameOrId) {
        return character;
      }
    }

    return null;
  }

  updateNPCState(npcId, updates) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;

    Object.assign(npc.state, updates);
    this.log(`📝 Updated NPC state: ${npc.name}`);
    return true;
  }

  setNPCDisposition(npcId, disposition) {
    const npc = this.getNPC(npcId);
    if (!npc) return false;

    npc.disposition = Math.max(-100, Math.min(100, disposition));
    
    if (npc.disposition < -50) {
      this.log(`😡 ${npc.name} is HOSTILE`);
    } else if (npc.disposition < 0) {
      this.log(`😠 ${npc.name} is UNFRIENDLY`);
    } else if (npc.disposition > 50) {
      this.log(`😊 ${npc.name} is FRIENDLY`);
    } else if (npc.disposition > 0) {
      this.log(`🙂 ${npc.name} is HELPFUL`);
    } else {
      this.log(`😐 ${npc.name} is NEUTRAL`);
    }

    return true;
  }

  /**
   * CONSEQUENCES & WORLD CHANGES
   */

  applyConsequences(consequences) {
    for (const consequence of consequences) {
      this.log(`⚡ Consequence: ${consequence.description}`);

      // Apply to locations
      if (consequence.affectedLocation) {
        const loc = this.getLocation(consequence.affectedLocation);
        if (loc) {
          loc.state[consequence.property] = consequence.value;
        }
      }

      // Apply to NPCs
      if (consequence.affectedNPC) {
        const npc = this.getNPC(consequence.affectedNPC);
        if (npc) {
          if (consequence.property === 'disposition') {
            this.setNPCDisposition(npc.id, npc.disposition + consequence.value);
          } else {
            npc.state[consequence.property] = consequence.value;
          }
        }
      }

      // Record in location consequences
      const loc = this.getCurrentLocation();
      if (loc) {
        loc.consequences.push({
          description: consequence.description,
          appliedAt: this.gameTime,
          source: consequence.source
        });
      }
    }
  }

  /**
   * DISCOVERY
   */

  discoverArea(locationName) {
    const loc = this.getLocation(locationName);
    if (!loc) return false;

    if (!loc.discovered) {
      loc.discovered = true;
      this.log(`🗺️  ${locationName} discovered!`);
      return true;
    }

    return false;
  }

  /**
   * QUERIES
   */

  getAvailableLocations() {
    const locations = [];
    for (const loc of this.locations.values()) {
      if (loc.discovered) {
        locations.push({
          id: loc.id,
          name: loc.name,
          visited: loc.visited,
          type: loc.type
        });
      }
    }
    return locations;
  }

  getNPCsInLocation(locationId) {
    const loc = this.getLocation(locationId);
    if (!loc) return [];

    return loc.npcs.map(npcId => this.getNPC(npcId));
  }

  /**
   * LOGGING
   */

  log(msg) {
    console.log(`[Pillar2-World] ${msg}`);
  }
}

export { PersistentWorldPillar };
