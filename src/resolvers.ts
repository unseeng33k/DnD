/**
 * RulesResolver: Computes exact mechanical outcomes for D&D 3.5e actions
 * All numbers logged for DM verification - no invented numbers
 * Emits events for critical hits, natural 1s, deaths, damage thresholds
 */

import { GameState, StateChange, Participant, getParticipant } from './game-state';

export interface ResolutionResult {
  outcome: string;
  stateChanges: StateChange[];
  logEntry: string;
}

export class RulesResolver {
  constructor(eventBus, consequenceTracker) {
    this.eventBus = eventBus;
    this.consequenceTracker = consequenceTracker;
  }
  /**
   * Resolve attack: roll to hit, determine hit/miss, compute damage
   * Logs all rolls and calculations
   */
  resolveAttack(
    state: GameState,
    attackerId: string,
    targetId: string,
    baseAttackBonus: number,
    damageRoll: number,
    damageBonus: number,
    criticalMultiplier: number = 2
  ): ResolutionResult {
    const attacker = getParticipant(state, attackerId);
    const target = getParticipant(state, targetId);
    const stateChanges: StateChange[] = [];
    const logs: string[] = [];

    // Check if attacker is constrained by consequences (dead, critically damaged, etc.)
    if (this.consequenceTracker && attacker) {
      const constraint = this.consequenceTracker.isActionConstrainedByConsequence(attacker, 'ATTACK');
      if (constraint) {
        const result = {
          outcome: 'CONSTRAINED',
          stateChanges: [],
          logEntry: `Attack by ${attacker.name} prevented: ${constraint}`,
        };
        if (this.eventBus) {
          this.eventBus.emit('mechanical:action-constrained', {
            actor: attacker,
            actionType: 'ATTACK',
            constraint,
            result
          });
        }
        return result;
      }
    }

    if (!target || target.status !== 'alive') {
      return {
        outcome: 'MISS',
        stateChanges: [],
        logEntry: `Attack by ${attacker?.name} failed: target not alive`,
      };
    }

    // To-hit roll (d20 + BAB + modifiers)
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const toHit = d20Roll + baseAttackBonus;
    const targetAC = target.stats.ac;

    logs.push(
      `To-hit: d20 (${d20Roll}) + BAB (${baseAttackBonus}) = ${toHit} vs AC ${targetAC}`
    );

    if (toHit < targetAC) {
      logs.push('MISS');
      return {
        outcome: 'MISS',
        stateChanges: [],
        logEntry: logs.join(' | '),
      };
    }

    // Hit - compute damage
    let totalDamage = damageRoll + damageBonus;
    const isCritical = d20Roll === 20;
    const isNaturalOne = d20Roll === 1;

    if (isCritical) {
      totalDamage = damageRoll * criticalMultiplier + damageBonus;
      logs.push(`CRITICAL HIT (×${criticalMultiplier}): ${totalDamage} damage`);
      // Emit critical hit event
      if (this.consequenceTracker) {
        this.consequenceTracker.trackCriticalHit(
          attacker,
          target,
          totalDamage,
          criticalMultiplier,
          d20Roll
        );
      }
    } else {
      logs.push(`HIT: ${totalDamage} damage`);
    }

    // Apply damage
    const newHP = Math.max(0, target.stats.hp - totalDamage);
    stateChanges.push({
      path: `participants[${state.participants.indexOf(target)}].stats.hp`,
      oldValue: target.stats.hp,
      newValue: newHP,
      timestamp: new Date(),
      affectedParticipantId: targetId,
      description: `Damage taken: ${totalDamage}`,
    });

    // Track damage thresholds
    if (this.consequenceTracker) {
      this.consequenceTracker.trackDamageThreshold(
        target,
        newHP,
        target.stats.hp,
        totalDamage
      );
    }

    // Check for unconsciousness
    if (newHP <= 0 && newHP > -10) {
      stateChanges.push({
        path: `participants[${state.participants.indexOf(target)}].status`,
        oldValue: 'alive',
        newValue: 'unconscious',
        timestamp: new Date(),
        affectedParticipantId: targetId,
        description: 'Reduced to 0 or fewer HP - unconscious',
      });
      logs.push('Target is now unconscious');

      if (this.eventBus) {
        this.eventBus.emit('mechanical:unconscious', {
          target,
          remainingHP: newHP,
        });
      }
    }

    if (newHP <= -10) {
      stateChanges.push({
        path: `participants[${state.participants.indexOf(target)}].status`,
        oldValue: 'alive',
        newValue: 'dead',
        timestamp: new Date(),
        affectedParticipantId: targetId,
        description: 'HP reduced to -10 or lower - dead',
      });
      logs.push('Target is now dead');

      // Emit death event
      if (this.consequenceTracker) {
        this.consequenceTracker.trackDeath(target, 'Combat damage from ' + attacker.name);
      }
    }

    return {
      outcome: 'HIT',
      stateChanges,
      logEntry: logs.join(' | '),
    };
  }

  /**
   * Resolve spell casting: consume spell slot, apply effects
   */
  resolveCastSpell(
    state: GameState,
    casterId: string,
    spellLevel: number,
    spellName: string,
    effects: StateChange[]
  ): ResolutionResult {
    const caster = getParticipant(state, casterId);
    const stateChanges: StateChange[] = [];
    const logs: string[] = [];

    if (!caster) {
      return {
        outcome: 'FAILED',
        stateChanges: [],
        logEntry: 'Caster not found',
      };
    }

    // Check if caster is constrained by consequences (dead, critically damaged, etc.)
    if (this.consequenceTracker && caster) {
      const constraint = this.consequenceTracker.isActionConstrainedByConsequence(caster, 'SPELL_CAST');
      if (constraint) {
        const result = {
          outcome: 'CONSTRAINED',
          stateChanges: [],
          logEntry: `Spell cast by ${caster.name} prevented: ${constraint}`,
        };
        if (this.eventBus) {
          this.eventBus.emit('mechanical:action-constrained', {
            actor: caster,
            actionType: 'SPELL_CAST',
            constraint,
            result
          });
        }
        return result;
      }
    }

    // Consume spell slot
    const currentSlots = caster.spellSlots[spellLevel] || 0;
    const newSlots = Math.max(0, currentSlots - 1);

    stateChanges.push({
      path: `participants[${state.participants.indexOf(caster)}].spellSlots[${spellLevel}]`,
      oldValue: currentSlots,
      newValue: newSlots,
      timestamp: new Date(),
      affectedParticipantId: casterId,
      description: `Cast ${spellName}: consumed level ${spellLevel} spell slot`,
    });

    // Add spell effects
    stateChanges.push(...effects);

    logs.push(
      `${caster.name} cast ${spellName} (level ${spellLevel} slot consumed)`
    );
    logs.push(`Remaining level ${spellLevel} slots: ${newSlots}`);

    // Emit spell casting event
    if (this.eventBus) {
      this.eventBus.emit('mechanical:spell-cast', {
        caster,
        spellName,
        spellLevel,
        slotsRemaining: newSlots,
      });
    }

    // Track resource depletion (important for calibration)
    if (newSlots === 0 && this.eventBus) {
      this.eventBus.emit('mechanical:spell-slots-depleted', {
        caster,
        spellLevel,
      });
    }

    return {
      outcome: 'SUCCESS',
      stateChanges,
      logEntry: logs.join(' | '),
    };
  }

  /**
   * Resolve damage over time (bleed, poison, etc.)
   */
  resolveDamageOverTime(
    state: GameState,
    targetId: string,
    damagePerRound: number,
    damageType: string
  ): ResolutionResult {
    const target = getParticipant(state, targetId);
    const stateChanges: StateChange[] = [];
    const logs: string[] = [];

    if (!target || target.status !== 'alive') {
      return {
        outcome: 'NO_EFFECT',
        stateChanges: [],
        logEntry: `${damageType} has no effect: target not alive`,
      };
    }

    const newHP = Math.max(0, target.stats.hp - damagePerRound);
    stateChanges.push({
      path: `participants[${state.participants.indexOf(target)}].stats.hp`,
      oldValue: target.stats.hp,
      newValue: newHP,
      timestamp: new Date(),
      affectedParticipantId: targetId,
      description: `${damageType}: ${damagePerRound} damage`,
    });

    logs.push(`${damageType} damage: ${damagePerRound} to ${target.name}`);

    if (newHP === 0) {
      logs.push(`${target.name} is now unconscious`);
    }

    return {
      outcome: 'APPLIED',
      stateChanges,
      logEntry: logs.join(' | '),
    };
  }

  /**
   * Resolve condition save: d20 vs DC
   */
  resolveConditionSave(
    state: GameState,
    targetId: string,
    conditionName: string,
    saveAbility: 'fortitude' | 'reflex' | 'will',
    saveDC: number
  ): ResolutionResult {
    const target = getParticipant(state, targetId);
    const logs: string[] = [];

    if (!target) {
      return {
        outcome: 'FAILED',
        stateChanges: [],
        logEntry: 'Target not found',
      };
    }

    // Check if target is constrained by consequences (dead, critically damaged, etc.)
    if (this.consequenceTracker && target) {
      const constraint = this.consequenceTracker.isActionConstrainedByConsequence(target, 'SAVE');
      if (constraint) {
        return {
          outcome: 'CONSTRAINED',
          stateChanges: [],
          logEntry: `Save by ${target.name} prevented: ${constraint}`,
        };
      }
    }

    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const saveBonus = this.getSaveBonus(target, saveAbility);
    const saveResult = d20Roll + saveBonus;
    const isNaturalOne = d20Roll === 1;
    const isCriticalSuccess = d20Roll === 20;
    const saved = saveResult >= saveDC;

    logs.push(
      `${target.name} ${saveAbility} save vs ${conditionName}: d20(${d20Roll}) + ${saveBonus} = ${saveResult} vs DC ${saveDC}`
    );

    // Track natural 1s (critical failures on saves)
    if (isNaturalOne && this.consequenceTracker) {
      this.consequenceTracker.trackNaturalOne(
        target,
        `${saveAbility} save vs ${conditionName}`,
        d20Roll
      );
    }

    // Emit save event
    if (this.eventBus) {
      this.eventBus.emit('mechanical:condition-save', {
        target,
        condition: conditionName,
        ability: saveAbility,
        roll: d20Roll,
        bonus: saveBonus,
        result: saveResult,
        dc: saveDC,
        saved,
        isNaturalOne,
        isCriticalSuccess,
      });
    }

    if (saved) {
      logs.push('SAVE SUCCESSFUL - condition avoided');
      return {
        outcome: 'SAVED',
        stateChanges: [],
        logEntry: logs.join(' | '),
      };
    }

    logs.push('SAVE FAILED - condition applied');
    return {
      outcome: 'FAILED',
      stateChanges: [],
      logEntry: logs.join(' | '),
    };
  }

  /**
   * Resolve skill check: d20 + modifiers vs DC
   */
  resolveSkillCheck(
    state: GameState,
    participantId: string,
    skillName: string,
    skillBonus: number,
    dc: number
  ): ResolutionResult {
    const participant = getParticipant(state, participantId);

    // Check if participant is constrained by consequences
    if (this.consequenceTracker && participant) {
      const constraint = this.consequenceTracker.isActionConstrainedByConsequence(participant, 'SKILL_CHECK');
      if (constraint) {
        return {
          outcome: 'CONSTRAINED',
          stateChanges: [],
          logEntry: `${skillName} check by ${participant.name} prevented: ${constraint}`,
        };
      }
    }

    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const result = d20Roll + skillBonus;
    const success = result >= dc;
    const isNaturalOne = d20Roll === 1;
    const isCriticalSuccess = d20Roll === 20;

    const logEntry = `${skillName} check: d20(${d20Roll}) + ${skillBonus} = ${result} vs DC ${dc} - ${success ? 'SUCCESS' : 'FAILED'}`;

    // Track natural 1s (critical failures)
    if (isNaturalOne && this.consequenceTracker && participant) {
      this.consequenceTracker.trackNaturalOne(participant, `${skillName} check`, d20Roll);
    }

    // Emit skill check event
    if (this.eventBus && participant) {
      this.eventBus.emit('mechanical:skill-check', {
        participant,
        skillName,
        roll: d20Roll,
        bonus: skillBonus,
        result,
        dc,
        success,
        isNaturalOne,
        isCriticalSuccess,
      });
    }

    return {
      outcome: success ? 'SUCCESS' : 'FAILED',
      stateChanges: [],
      logEntry,
    };
  }

  private getSaveBonus(participant: Participant, saveAbility: string): number {
    // Simplified save bonus - in real game would use full ability modifier logic
    const baseBonus =
      {
        fortitude: 2,
        reflex: 1,
        will: 2,
      }[saveAbility] || 0;

    // Subtract 1 per condition that lowers saves (fatigue, etc)
    const penaltyConditions = participant.conditions.filter(c =>
      ['Fatigued', 'Sickened'].includes(c.name)
    );

    return baseBonus - penaltyConditions.length;
  }
}
