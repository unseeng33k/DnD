#!/usr/bin/env node

/**
 * PARTY SYSTEM - COMPLETE
 * 
 * Handles multiple characters in party:
 * - Turn order by initiative
 * - Reaction time (DEX-based)
 * - Party composition
 * - Combat coordination
 * - Party-wide effects
 * - Turn tracking
 */

class PartySystem {
  constructor(partyName = 'The Adventurers') {
    this.partyName = partyName;
    this.members = [];
    this.initiative = [];
    this.currentTurn = 0;
    this.round = 1;
    this.combatActive = false;
    this.partyState = {
      morale: 100,
      encumbranceOverall: 'light',
      averageLevel: 1,
      composition: {}
    };
  }

  /**
   * Add character to party
   */
  addMember(characterData) {
    const member = {
      ...characterData,
      partyRole: this.determineRole(characterData.class),
      initiative: 0,
      reactionTime: 0,
      hasReacted: false,
      currentHP: characterData.hitPoints,
      temporaryEffects: [],
      status: 'healthy'
    };

    this.members.push(member);
    this.recalculatePartyStats();
    return member;
  }

  /**
   * Remove character from party
   */
  removeMember(characterName) {
    const index = this.members.findIndex(m => m.name === characterName);
    if (index > -1) {
      this.members.splice(index, 1);
      this.recalculatePartyStats();
      return true;
    }
    return false;
  }

  /**
   * Determine character's role in party
   */
  determineRole(className) {
    const roles = {
      'fighter': 'Tank/Melee',
      'ranger': 'Ranged/Scout',
      'paladin': 'Melee/Support',
      'thief': 'Scout/Damage',
      'mage': 'Spellcaster/Damage',
      'cleric': 'Healer/Support',
      'druid': 'Healer/Nature',
      'bard': 'Support/Spellcaster',
      'monk': 'Scout/Melee'
    };
    return roles[className] || 'Unknown';
  }

  /**
   * INITIATIVE & REACTION TIME SYSTEM
   * 
   * AD&D 1e Turn Order:
   * 1. Check reaction time (DEX-based)
   * 2. Initiative roll (d10, DEX mod applies)
   * 3. Movement declarations
   * 4. Combat resolution
   * 5. Reactions applied (second chance to act)
   */

  /**
   * Roll initiative for entire party
   */
  rollInitiative() {
    this.initiative = [];
    
    for (const member of this.members) {
      const d10 = Math.floor(Math.random() * 10) + 1;
      const dexMod = Math.floor((member.abilityScores?.DEX || 10 - 10) / 2);
      const initiative = d10 + dexMod;

      // Reaction time (DEX-based, checked first in combat)
      const reactionTime = Math.floor((member.abilityScores?.DEX || 10) / 2); // 5-9 scales to 2-4 rounds
      
      // Can react before normal turn if:
      // DEX 15+: Can interrupt action (reaction)
      // DEX 13-14: Can react after declaration
      // DEX 11-12: Can react on turn
      // DEX 10-: No special reaction

      let canReact = false;
      let reactionType = 'none';
      
      if (member.abilityScores?.DEX >= 15) {
        canReact = true;
        reactionType = 'interrupt'; // Can interrupt opponent's action
      } else if (member.abilityScores?.DEX >= 13) {
        canReact = true;
        reactionType = 'after_declaration'; // Can react after opponent declares
      } else if (member.abilityScores?.DEX >= 11) {
        canReact = true;
        reactionType = 'turn_based'; // Reacts on own turn
      }

      this.initiative.push({
        name: member.name,
        class: member.class,
        initiative,
        d10,
        dexMod,
        dexScore: member.abilityScores?.DEX || 10,
        reactionTime,
        canReact,
        reactionType,
        hasActed: false
      });
    }

    // Sort by initiative (highest first)
    this.initiative.sort((a, b) => b.initiative - a.initiative);
    
    return this.initiative;
  }

  /**
   * Calculate reaction time from DEX
   * Returns how many rounds before character can react
   */
  calculateReactionTime(dexterity) {
    const baseReaction = Math.floor(dexterity / 2);
    const roundsToReact = Math.max(1, 6 - baseReaction); // 1-5 rounds
    
    return {
      dexterity,
      baseReactionScore: baseReaction,
      roundsUntilReaction: roundsToReact,
      canInterrupt: dexterity >= 15,
      canReactAfterDeclaration: dexterity >= 13,
      description: this.getReactionDescription(dexterity)
    };
  }

  /**
   * Get reaction description
   */
  getReactionDescription(dexterity) {
    if (dexterity >= 18) return 'Superhuman reflexes - instant reaction';
    if (dexterity >= 15) return 'Can interrupt opponent\'s actions';
    if (dexterity >= 13) return 'Can react after opponent declares';
    if (dexterity >= 11) return 'Can react on own turn';
    if (dexterity >= 9) return 'Slow reaction';
    return 'Very slow reaction';
  }

  /**
   * Start combat - calculate turn order
   */
  startCombat() {
    this.combatActive = true;
    this.round = 1;
    this.currentTurn = 0;
    this.rollInitiative();
    
    // Reset action flags
    for (const init of this.initiative) {
      init.hasActed = false;
    }

    return {
      round: this.round,
      initiativeOrder: this.initiative,
      currentActor: this.getCurrentActor(),
      combatStarted: true
    };
  }

  /**
   * Get current actor in turn order
   */
  getCurrentActor() {
    if (this.currentTurn >= this.initiative.length) {
      return null;
    }
    return this.initiative[this.currentTurn];
  }

  /**
   * Next turn in combat
   */
  nextTurn() {
    if (!this.combatActive) return null;

    this.currentTurn++;

    // End of round - reset
    if (this.currentTurn >= this.initiative.length) {
      this.currentTurn = 0;
      this.round++;
      
      // Reset action flags for new round
      for (const init of this.initiative) {
        init.hasActed = false;
      }

      return {
        endOfRound: true,
        nextRound: this.round,
        currentActor: this.getCurrentActor()
      };
    }

    return {
      nextTurn: this.currentTurn,
      round: this.round,
      currentActor: this.getCurrentActor()
    };
  }

  /**
   * Mark member as acted
   */
  memberActed(name) {
    const actor = this.initiative.find(i => i.name === name);
    if (actor) {
      actor.hasActed = true;
      return true;
    }
    return false;
  }

  /**
   * Handle character's action
   */
  handleAction(characterName, action, target = null) {
    const member = this.members.find(m => m.name === characterName);
    const initEntry = this.initiative.find(i => i.name === characterName);

    if (!member || !initEntry) {
      return { success: false, message: 'Character not found' };
    }

    // Check if can act (DEX-based for reactions)
    const canActNow = this.canActNow(characterName, action);

    return {
      success: true,
      actor: characterName,
      action,
      target,
      round: this.round,
      reactionType: initEntry.reactionType,
      canActNow,
      roundDescription: this.getRoundDescription(this.round)
    };
  }

  /**
   * Determine if character can act this round
   */
  canActNow(characterName, action) {
    const initEntry = this.initiative.find(i => i.name === characterName);
    if (!initEntry) return false;

    const isCurrentTurn = initEntry === this.getCurrentActor();
    const isReaction = action === 'dodge' || action === 'parry' || action === 'react';

    // Can act on own turn
    if (isCurrentTurn && !initEntry.hasActed) return true;

    // Can react if allowed
    if (isReaction && initEntry.canReact) {
      if (initEntry.reactionType === 'interrupt') return true;
      if (initEntry.reactionType === 'after_declaration' && this.hasDeclarationOccurred()) return true;
    }

    return false;
  }

  /**
   * Check if declaration has occurred this round
   */
  hasDeclarationOccurred() {
    return this.initiative.some(i => i.hasActed);
  }

  /**
   * Get round description (AD&D 1e 10-second rounds)
   */
  getRoundDescription(round) {
    return `Round ${round} (${round * 10} seconds)`;
  }

  /**
   * Apply damage to party member
   */
  damagePartyMember(characterName, damage) {
    const member = this.members.find(m => m.name === characterName);
    if (!member) return { success: false };

    member.currentHP -= damage;
    
    // Update status
    const hpPercent = member.currentHP / member.hitPoints;
    if (member.currentHP <= 0) {
      member.status = 'dead';
    } else if (hpPercent < 0.25) {
      member.status = 'critical';
    } else if (hpPercent < 0.5) {
      member.status = 'injured';
    } else if (hpPercent < 0.75) {
      member.status = 'wounded';
    } else {
      member.status = 'healthy';
    }

    return {
      success: true,
      character: characterName,
      damage,
      currentHP: member.currentHP,
      maxHP: member.hitPoints,
      status: member.status
    };
  }

  /**
   * Heal party member
   */
  healPartyMember(characterName, healing) {
    const member = this.members.find(m => m.name === characterName);
    if (!member) return { success: false };

    const oldHP = member.currentHP;
    member.currentHP = Math.min(member.hitPoints, member.currentHP + healing);
    const actualHealing = member.currentHP - oldHP;

    // Update status
    if (member.currentHP <= 0) {
      member.status = 'dead';
    } else if (member.currentHP / member.hitPoints < 0.5) {
      member.status = 'injured';
    } else {
      member.status = 'healthy';
    }

    return {
      success: true,
      character: characterName,
      healing: actualHealing,
      currentHP: member.currentHP,
      maxHP: member.hitPoints,
      status: member.status
    };
  }

  /**
   * Get party status summary
   */
  getPartyStatus() {
    console.log(`\n╔══════════════════════════════════════════╗`);
    console.log(`║ 🎭 PARTY: ${this.partyName.padEnd(28)} ║`);
    console.log(`╚══════════════════════════════════════════╝\n`);

    console.log(`📊 Party Statistics:`);
    console.log(`  Members: ${this.members.length}`);
    console.log(`  Average Level: ${this.partyState.averageLevel}`);
    console.log(`  Morale: ${this.partyState.morale}%`);
    console.log(`  Overall Encumbrance: ${this.partyState.encumbranceOverall}\n`);

    console.log(`💪 Combat Status:`);
    for (const member of this.members) {
      const hpBar = this.getHPBar(member.currentHP, member.hitPoints);
      console.log(`  ${member.name.padEnd(15)} [${hpBar}] ${member.currentHP}/${member.hitPoints} (${member.status.toUpperCase()})`);
    }

    if (this.combatActive) {
      console.log(`\n⚔️  Combat: Round ${this.round}, Turn: ${this.currentTurn + 1}/${this.initiative.length}`);
      const current = this.getCurrentActor();
      if (current) {
        console.log(`  Current Actor: ${current.name} (Initiative: ${current.initiative})`);
      }
    }
  }

  /**
   * Get HP bar visualization
   */
  getHPBar(current, max) {
    const percent = Math.floor((current / max) * 10);
    const bar = '█'.repeat(percent) + '░'.repeat(10 - percent);
    return bar;
  }

  /**
   * Recalculate party stats
   */
  recalculatePartyStats() {
    if (this.members.length === 0) return;

    const totalLevel = this.members.reduce((sum, m) => sum + (m.level || 1), 0);
    this.partyState.averageLevel = Math.floor(totalLevel / this.members.length);

    // Count composition
    const composition = {};
    for (const member of this.members) {
      composition[member.class] = (composition[member.class] || 0) + 1;
    }
    this.partyState.composition = composition;

    // Calculate total morale
    const healthyCount = this.members.filter(m => m.status === 'healthy').length;
    const morale = Math.floor((healthyCount / this.members.length) * 100);
    this.partyState.morale = morale;
  }

  /**
   * Get member details
   */
  getMember(characterName) {
    return this.members.find(m => m.name === characterName);
  }

  /**
   * End combat
   */
  endCombat() {
    this.combatActive = false;
    this.currentTurn = 0;
    this.round = 1;
    return { combatEnded: true };
  }
}

export { PartySystem };
