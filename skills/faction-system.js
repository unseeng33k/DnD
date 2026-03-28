#!/usr/bin/env node

/**
 * Faction Reputation System
 */

class FactionSystem {
  constructor(campaignDir) {
    this.factions = {};
    this.campaignDir = campaignDir;
    this.loadFactions();
  }

  loadFactions() {
    // Default factions for Tamoachan
    this.factions = {
      'cult_of_reborn_sun': {
        name: 'Cult of the Reborn Sun',
        description: 'Fanatical worshippers of the Olman gods seeking to restore their empire',
        reputation: -10, // Hostile by default
        territory: ['Shrine of Tlaloc', 'Sacrifice Chamber'],
        leader: 'Xilonen',
        goals: ['Awaken Tlaloc', 'Restore Olman empire', 'Sacrifice prisoners'],
        attitude: 'hostile'
      },
      'villagers_of_barovia': {
        name: 'Villagers of Barovia',
        description: 'Terrified villagers trapped in the domain of dread',
        reputation: 0,
        territory: ['Village of Barovia'],
        leader: 'Burgomaster',
        goals: ['Survive', 'Escape Strahd', 'Protect Ireena'],
        attitude: 'fearful'
      },
      'vistani': {
        name: 'The Vistani',
        description: 'Wandering people with mysterious powers and knowledge',
        reputation: 2,
        territory: ['Madame Eva\'s Camp'],
        leader: 'Madame Eva',
        goals: ['Aid those who oppose Strahd', 'Preserve their traditions'],
        attitude: 'neutral'
      },
      'church_of_st_andral': {
        name: 'Church of St. Andral',
        description: 'Holy sanctuary in Barovia',
        reputation: 5,
        territory: ['Church of St. Andral'],
        leader: 'Father Donavich',
        goals: ['Protect the holy ground', 'Save souls from Strahd'],
        attitude: 'friendly'
      }
    };
  }

  getReputation(factionName) {
    const faction = this.factions[factionName];
    if (!faction) return null;
    
    let status = 'neutral';
    if (faction.reputation <= -7) status = 'hostile';
    else if (faction.reputation <= -3) status = 'unfriendly';
    else if (faction.reputation >= 7) status = 'allied';
    else if (faction.reputation >= 3) status = 'friendly';
    
    return {
      ...faction,
      status
    };
  }

  modifyReputation(factionName, change) {
    const faction = this.factions[factionName];
    if (!faction) return null;
    
    faction.reputation = Math.max(-10, Math.min(10, faction.reputation + change));
    return this.getReputation(factionName);
  }

  listFactions() {
    return Object.values(this.factions).map(f => ({
      name: f.name,
      reputation: f.reputation,
      status: this.getReputation(Object.keys(this.factions).find(key => this.factions[key] === f)).status
    }));
  }

  getReaction(factionName, partyAction) {
    const faction = this.getReputation(factionName);
    if (!faction) return null;

    const reactions = {
      hostile: 'Attack on sight, refuse all aid',
      unfriendly: 'Uncooperative, may hinder',
      neutral: 'Willing to trade, cautious',
      friendly: 'Helpful, offers assistance',
      allied: 'Full support, shared resources'
    };

    return reactions[faction.status];
  }
}

module.exports = FactionSystem;
