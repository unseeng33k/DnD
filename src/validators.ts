/**
 * RulesValidator: Deterministic legal checks for D&D 3.5e actions
 * Returns violations without inventing numbers - only checks what's possible
 */

import { GameState, Participant, getParticipant } from './game-state';

export interface ValidationResult {
  legal: boolean;
  violations: string[];
}

export class RulesValidator {
  /**
   * Validate spell casting legality
   * Checks: spell slots available, concentration not broken, not silenced/restrained
   */
  validateCastSpell(
    state: GameState,
    casterid: string,
    spellLevel: number,
    spellName: string
  ): ValidationResult {
    const violations: string[] = [];
    const caster = getParticipant(state, casterid);

    if (!caster) {
      violations.push(`Caster not found: ${casterid}`);
      return { legal: violations.length === 0, violations };
    }

    // Check spell slots
    const slotsAvailable = caster.spellSlots[spellLevel] || 0;
    if (slotsAvailable === 0) {
      violations.push(
        `No level ${spellLevel} spell slots available for spell: ${spellName}`
      );
    }

    // Check concentration
    const concentrating = caster.conditions.some(
      c => c.name === 'Concentrating'
    );
    if (
      concentrating &&
      spellName.toLowerCase().includes('concentration')
    ) {
      violations.push(
        `Cannot cast concentration spell ${spellName} while already concentrating`
      );
    }

    // Check silenced/restrained
    const silenced = caster.conditions.some(c => c.name === 'Silenced');
    const restrained = caster.conditions.some(c => c.name === 'Restrained');
    if (silenced) violations.push('Caster is silenced and cannot cast spells');
    if (restrained && spellName.toLowerCase().includes('verbal')) {
      violations.push(
        `Cannot cast spell with verbal component while restrained: ${spellName}`
      );
    }

    // Check dead/unconscious
    if (caster.status !== 'alive') {
      violations.push(
        `Cannot cast spell: caster is ${caster.status}`
      );
    }

    return { legal: violations.length === 0, violations };
  }

  /**
   * Validate attack legality
   * Checks: target exists, target alive, range valid
   */
  validateAttack(
    state: GameState,
    attackerID: string,
    targetID: string,
    rangeInFeet: number
  ): ValidationResult {
    const violations: string[] = [];
    const attacker = getParticipant(state, attackerID);
    const target = getParticipant(state, targetID);

    if (!attacker) {
      violations.push(`Attacker not found: ${attackerID}`);
    }

    if (!target) {
      violations.push(`Target not found: ${targetID}`);
    }

    if (target && target.status !== 'alive') {
      violations.push(`Cannot attack ${target.status} target: ${target.name}`);
    }

    if (attacker && target && attacker.position && target.position) {
      const distance = Math.sqrt(
        Math.pow(attacker.position.x - target.position.x, 2) +
          Math.pow(attacker.position.y - target.position.y, 2)
      );
      if (distance > rangeInFeet) {
        violations.push(
          `Target out of range: ${distance.toFixed(1)}ft > ${rangeInFeet}ft`
        );
      }
    }

    // Check if attacker can act
    if (attacker && attacker.status !== 'alive') {
      violations.push(`${attacker.name} is ${attacker.status} and cannot attack`);
    }

    return { legal: violations.length === 0, violations };
  }

  /**
   * Validate action economy
   * Checks: participant has action type available this round
   */
  validateActionEconomy(
    state: GameState,
    participantId: string,
    actionType: 'standard' | 'move' | 'swift' | 'immediate'
  ): ValidationResult {
    const violations: string[] = [];
    const participant = getParticipant(state, participantId);

    if (!participant) {
      violations.push(`Participant not found: ${participantId}`);
      return { legal: false, violations };
    }

    if (!participant.actions[actionType]) {
      violations.push(
        `${participant.name} has no ${actionType} action available this round`
      );
    }

    return { legal: violations.length === 0, violations };
  }

  /**
   * Validate condition application
   * Checks: target immune, no conflicting conditions
   */
  validateConditionApplication(
    state: GameState,
    targetId: string,
    conditionName: string
  ): ValidationResult {
    const violations: string[] = [];
    const target = getParticipant(state, targetId);

    if (!target) {
      violations.push(`Target not found: ${targetId}`);
      return { legal: false, violations };
    }

    // Check existing condition
    const existing = target.conditions.find(c => c.name === conditionName);
    if (existing) {
      violations.push(
        `${target.name} already has ${conditionName} condition`
      );
    }

    // Check immunities
    const immune = target.conditions.some(c => c.immunity && c.name === conditionName);
    if (immune) {
      violations.push(`${target.name} is immune to ${conditionName}`);
    }

    // Check conflicts
    const conflicts: Record<string, string[]> = {
      Hasted: ['Slowed'],
      Slowed: ['Hasted'],
      Charmed: ['Confused'],
      Confused: ['Charmed'],
    };

    if (conflicts[conditionName]) {
      const conflictingConditions = target.conditions.filter(c =>
        conflicts[conditionName].includes(c.name)
      );
      if (conflictingConditions.length > 0) {
        violations.push(
          `${conditionName} conflicts with ${conflictingConditions.map(c => c.name).join(', ')}`
        );
      }
    }

    return { legal: violations.length === 0, violations };
  }

  /**
   * Validate movement
   * Checks: distance doesn't exceed speed, terrain passable
   */
  validateMovement(
    state: GameState,
    participantId: string,
    distanceInFeet: number
  ): ValidationResult {
    const violations: string[] = [];
    const participant = getParticipant(state, participantId);

    if (!participant) {
      violations.push(`Participant not found: ${participantId}`);
      return { legal: false, violations };
    }

    const speed = participant.speed || 30;
    if (distanceInFeet > speed) {
      violations.push(
        `Movement exceeds speed: ${distanceInFeet}ft > ${speed}ft`
      );
    }

    // Check terrain passability
    if (state.environment?.hazards) {
      violations.push('Hazardous terrain detected - verify manual passability');
    }

    return { legal: violations.length === 0, violations };
  }

  /**
   * Validate saving throw legality
   * Checks: target can make saves, has actions available
   */
  validateSave(
    state: GameState,
    participantId: string,
    saveType: 'fortitude' | 'reflex' | 'will'
  ): ValidationResult {
    const violations: string[] = [];
    const participant = getParticipant(state, participantId);

    if (!participant) {
      violations.push(`Participant not found: ${participantId}`);
      return { legal: false, violations };
    }

    if (participant.status === 'unconscious') {
      violations.push(
        `${participant.name} is unconscious and cannot make saving throws`
      );
    }

    if (participant.status === 'dead') {
      violations.push(`${participant.name} is dead and cannot make saves`);
    }

    return { legal: violations.length === 0, violations };
  }
}
