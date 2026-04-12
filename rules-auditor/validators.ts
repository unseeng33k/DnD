/**
 * Rules Validators: Check if proposed actions are legal under D&D 3.5e rules
 * Each validator returns {legal: bool, violations: string[]}
 */

import { GameState } from "./game-state";

export interface ValidationResult {
  legal: boolean;
  violations: string[];
}

export class RulesValidator {
  constructor(private gameState: GameState) {}

  validateCastSpell(
    caster: string,
    spellName: string,
    spellLevel: number,
    target?: string
  ): ValidationResult {
    const violations: string[] = [];
    const participant = this.gameState.participants[caster];

    if (!participant) {
      violations.push(`Caster ${caster} not found in game state`);
      return { legal: false, violations };
    }

    // Check spell slots
    const slots = participant.spellSlots[spellLevel];
    if (!slots || slots.used >= slots.max) {
      violations.push(
        `No level-${spellLevel} spell slots available (${slots?.used || 0}/${slots?.max || 0} used)`
      );
    }

    // Check if target exists (if spell requires target)
    if (target && !this.gameState.participants[target]) {
      violations.push(`Target ${target} not found in game state`);
    }

    // Check for conditions that prevent casting
    const preventsCasting = ["stunned", "paralyzed", "dead", "unconscious"];
    for (const condition of preventsCasting) {
      if (participant.conditions[condition]) {
        violations.push(`Caster is ${condition} and cannot cast spells`);
      }
    }

    // Check action economy
    if (spellLevel === 0) {
      // Cantrips don't cost actions in 3.5e (can be cast as part of standard action)
    } else if (spellLevel <= 2) {
      if (participant.actions.standard < 1) {
        violations.push(
          `Caster has no standard action available this round`
        );
      }
    } else {
      if (!participant.actions.fullRound) {
        violations.push(`Spell requires a full-round action, not available`);
      }
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }

  validateAttack(
    attacker: string,
    target: string,
    weaponType: string
  ): ValidationResult {
    const violations: string[] = [];
    const attackerParticipant = this.gameState.participants[attacker];
    const targetParticipant = this.gameState.participants[target];

    if (!attackerParticipant) {
      violations.push(`Attacker ${attacker} not found`);
    }
    if (!targetParticipant) {
      violations.push(`Target ${target} not found`);
    }

    if (violations.length > 0) {
      return { legal: false, violations };
    }

    // Check action economy
    if (attackerParticipant!.actions.standard < 1) {
      violations.push(`Attacker has no standard action available`);
    }

    // Check if target is alive
    if (
      targetParticipant!.status === "dead" ||
      targetParticipant!.status === "petrified"
    ) {
      violations.push(`Target is ${targetParticipant!.status}`);
    }

    // Check for conditions that prevent attacking
    const preventsAttacking = ["stunned", "paralyzed"];
    for (const condition of preventsAttacking) {
      if (attackerParticipant!.conditions[condition]) {
        violations.push(`Attacker is ${condition} and cannot attack`);
      }
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }

  validateActionEconomy(
    participant: string,
    actionType: "standard" | "move" | "swift" | "reaction",
    currentRound: number
  ): ValidationResult {
    const violations: string[] = [];
    const part = this.gameState.participants[participant];

    if (!part) {
      violations.push(`Participant ${participant} not found`);
      return { legal: false, violations };
    }

    // Check if they have actions remaining
    if (part.actions[actionType] < 1) {
      violations.push(`No ${actionType} actions remaining this round`);
    }

    // Can't take reaction before their turn starts (in first round)
    if (
      actionType === "reaction" &&
      currentRound === 1 &&
      !part.actions.fullRound
    ) {
      // Reactions available after your turn
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }

  validateConditionApplication(
    target: string,
    condition: string,
    durationRounds: number | null
  ): ValidationResult {
    const violations: string[] = [];
    const participant = this.gameState.participants[target];

    if (!participant) {
      violations.push(`Target ${target} not found`);
      return { legal: false, violations };
    }

    // Check for condition immunity or conflict
    const immuneTo = this.getConditionImmunities(target);
    if (immuneTo.includes(condition)) {
      violations.push(
        `${target} is immune to ${condition} condition`
      );
    }

    // Some conditions conflict with others
    if (
      participant.conditions["polymorphed"] &&
      ["petrified", "turned_to_stone"].includes(condition)
    ) {
      violations.push(
        `Cannot apply ${condition} to polymorphed creature`
      );
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }

  validateMovement(
    participant: string,
    distanceFeet: number,
    terrain: string = "normal"
  ): ValidationResult {
    const violations: string[] = [];
    const part = this.gameState.participants[participant];

    if (!part) {
      violations.push(`Participant ${participant} not found`);
      return { legal: false, violations };
    }

    // Check movement action available
    if (part.actions.move < 1) {
      violations.push(`No move action available`);
    }

    // Get movement speed (assume 30ft base for humans, adjust per race)
    const movementSpeed = 30; // This should come from character sheet
    const terrainMultiplier = terrain === "difficult" ? 0.5 : 1;
    const maxDistance = movementSpeed * terrainMultiplier;

    if (distanceFeet > maxDistance) {
      violations.push(
        `Attempting to move ${distanceFeet}ft but max is ${maxDistance}ft in ${terrain} terrain`
      );
    }

    // Check for conditions that prevent movement
    const preventsMovement = ["paralyzed", "petrified", "dead"];
    for (const condition of preventsMovement) {
      if (part.conditions[condition]) {
        violations.push(`Participant is ${condition} and cannot move`);
      }
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }

  private getConditionImmunities(participant: string): string[] {
    // This would pull from the character's race/class immunities
    // Placeholder: extend with actual immunities
    const part = this.gameState.participants[participant];
    if (!part) return [];

    if (part.type === "enemy" && part.npcState?.goals.includes("undead")) {
      return ["poison", "disease", "energy_drain"];
    }

    return [];
  }

  validateSave(
    target: string,
    saveType: "fortitude" | "reflex" | "will",
    dc: number
  ): ValidationResult {
    const violations: string[] = [];
    const participant = this.gameState.participants[target];

    if (!participant) {
      violations.push(`Target ${target} not found`);
    }

    if (!["fortitude", "reflex", "will"].includes(saveType)) {
      violations.push(`Invalid save type: ${saveType}`);
    }

    if (dc < 1 || dc > 40) {
      violations.push(`DC ${dc} is outside normal range (1-40)`);
    }

    return {
      legal: violations.length === 0,
      violations,
    };
  }
}
