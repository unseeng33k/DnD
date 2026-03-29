/**
 * PARTY-SYSTEM ADAPTER
 * 
 * Bridges old PartySystem with new orchestrator API
 * 
 * Integrates:
 * - Initiative rolling & turn order
 * - Combat tracking
 * - HP/damage management
 * - Party composition
 */

import { PartySystem } from '../party-system.js';

class PartySystemAdapter {
  constructor(partyName, eventBus, registries, spotlightScheduler = null) {
    this.eventBus = eventBus;
    this.registries = registries;
    this.spotlightScheduler = spotlightScheduler;
    
    // Wrap the old PartySystem
    this.party = new PartySystem(partyName);
    
    // Connect to new architecture
    this.setupEventListeners();
  }

  /**
   * STEP 1: Listen to combat events
   * Wire PartySystem into eventBus
   */
  setupEventListeners() {
    // When turn starts, update party turn order
    this.eventBus.on('combat:start', (data) => {
      this.startCombat(data.members);
    });

    // When turn ends, advance to next actor
    this.eventBus.on('combat:turn-end', (data) => {
      this.nextTurn();
    });

    // When damage is applied, update HP
    this.eventBus.on('mechanical:damage-applied', (data) => {
      this.damagePartyMember(data.target, data.amount);
    });

    // When healing is applied
    this.eventBus.on('mechanical:healing-applied', (data) => {
      this.healPartyMember(data.target, data.amount);
    });
  }

  /**
   * STEP 2: Party member management
   */
  addMember(characterData) {
    const member = this.party.addMember(characterData);
    
    this.eventBus.emit('party:member-added', {
      name: characterData.name,
      class: characterData.class,
      hp: characterData.hitPoints,
      ac: characterData.ac || 10
    });
    
    return member;
  }

  removeMember(characterName) {
    const result = this.party.removeMember(characterName);
    
    if (result) {
      this.eventBus.emit('party:member-removed', {
        name: characterName
      });
    }
    
    return result;
  }

  /**
   * STEP 3: Initiative & combat
   */
  startCombat(members) {
    // Add all members to party if not already there
    for (const member of members) {
      if (!this.party.members.find(m => m.name === member.name)) {
        this.addMember(member);
      }
    }
    
    // Roll initiative for entire party
    const initiativeOrder = this.party.rollInitiative();
    
    // Start combat
    this.party.startCombat();
    
    // Emit event so DM-memory can log it
    this.eventBus.emit('combat:initiative-rolled', {
      round: this.party.round,
      turnOrder: initiativeOrder,
      currentActor: this.party.getCurrentActor()
    });
    
    return initiativeOrder;
  }

  rollInitiative() {
    const order = this.party.rollInitiative();
    
    this.eventBus.emit('combat:initiative-rolled', {
      turnOrder: order,
      round: this.party.round
    });
    
    return order;
  }

  nextTurn() {
    const result = this.party.nextTurn();
    
    if (result.endOfRound) {
      this.eventBus.emit('combat:round-end', {
        round: this.party.round
      });
    }
    
    this.eventBus.emit('combat:turn-start', {
      actor: result.currentActor?.name,
      round: this.party.round,
      turn: this.party.currentTurn + 1
    });
    
    return result;
  }

  /**
   * STEP 4: Damage & healing
   */
  damagePartyMember(characterName, damage) {
    const result = this.party.damagePartyMember(characterName, damage);
    
    if (result.success) {
      this.eventBus.emit('combat:damage', {
        actor: characterName,
        damage: damage,
        newHP: result.currentHP,
        maxHP: result.maxHP,
        status: result.status
      });
    }
    
    return result;
  }

  healPartyMember(characterName, healing) {
    const result = this.party.healPartyMember(characterName, healing);
    
    if (result.success) {
      this.eventBus.emit('combat:healing', {
        target: characterName,
        healing: result.healing,
        newHP: result.currentHP,
        maxHP: result.maxHP,
        status: result.status
      });
    }
    
    return result;
  }

  /**
   * STEP 5: Query party state
   */
  getPartyStatus() {
    return this.party.partyState;
  }

  getPartyMembers() {
    return this.party.members;
  }

  getMember(characterName) {
    return this.party.getMember(characterName);
  }

  getCurrentActor() {
    return this.party.getCurrentActor();
  }

  getInitiativeOrder() {
    return this.party.initiative;
  }

  isInCombat() {
    return this.party.combatActive;
  }

  getRound() {
    return this.party.round;
  }

  getCurrentTurn() {
    return this.party.currentTurn;
  }

  endCombat() {
    const result = this.party.endCombat();
    
    this.eventBus.emit('combat:end', {
      roundsCompleted: this.party.round,
      totalTurns: this.party.currentTurn
    });
    
    return result;
  }
}

export { PartySystemAdapter };
