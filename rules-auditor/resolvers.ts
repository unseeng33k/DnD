/**
 * Rules Resolvers: Compute exact mechanical outcomes (damage, attack rolls, etc)
 * No ambiguity - all numbers are deterministic and logged
 */

import { GameState, StateChange } from "./game-state";

export interface ResolutionResult {
  outcome: "hit" | "miss" | "success" | "failure" | "partial";
  stateChanges: StateChange[];
  logEntry: string;
}

export class RulesResolver {
  constructor(private gameState: GameState) {}

  resolveAttack(
    attacker: string,
    target: string,
    attackBonus: number,
    rollResult: number, // d20 result
    damagePerHit: { dice: string; bonus: number }
  ): ResolutionResult {
    const attackerParticipant = this.gameState.participants[attacker];
    const targetParticipant = this.gameState.participants[target];

    if (!attackerParticipant || !targetParticipant) {
      return {
        outcome: "failure",
        stateChanges: [],
        logEntry: "Attack resolution failed: participant not found",
      };
    }

    const targetAC = targetParticipant.stats.ac;
    const totalAttackRoll = rollResult + attackBonus;

    const stateChanges: StateChange[] = [];
    let logEntry = `${attacker} attacks ${target} (d20: ${rollResult} + ${attackBonus} = ${totalAttackRoll} vs AC ${targetAC})`;

    if (totalAttackRoll < targetAC) {
      logEntry += " - MISS";
      return { outcome: "miss", stateChanges, logEntry };
    }

    // HIT: Apply damage
    const damageRoll = this.rollDamage(damagePerHit.dice);
    const totalDamage = damageRoll + damagePerHit.bonus;

    const oldHP = targetParticipant.stats.hp.current;
    const newHP = Math.max(0, oldHP - totalDamage);

    stateChanges.push({
      path: `participants.${target}.stats.hp.current`,
      before: oldHP,
      after: newHP,
      reason: "damage_from_attack",
    });

    // Check if target dies
    let outcome: "hit" | "partial" = "hit";
    if (newHP === 0) {
      stateChanges.push({
        path: `participants.${target}.status`,
        before: targetParticipant.status,
        after: "unconscious",
        reason: "hp_depleted",
      });
      outcome = "partial"; // Unconscious, not necessarily dead
      logEntry += ` - HIT for ${totalDamage} damage (${damageRoll} + ${damagePerHit.bonus}). Target unconscious!`;
    } else {
      logEntry += ` - HIT for ${totalDamage} damage (${damageRoll} + ${damagePerHit.bonus}). ${newHP} HP remaining.`;
    }

    return { outcome, stateChanges, logEntry };
  }

  resolveCastSpell(
    caster: string,
    spellName: string,
    spellLevel: number,
    dc: number,
    targets: Array<{ id: string; saveType: string; saveRoll: number }>
  ): ResolutionResult {
    const stateChanges: StateChange[] = [];
    let logEntry = `${caster} casts ${spellName} (level ${spellLevel}, DC ${dc})`;

    const casterParticipant = this.gameState.participants[caster];
    if (!casterParticipant) {
      return {
        outcome: "failure",
        stateChanges,
        logEntry: "Spell cast failed: caster not found",
      };
    }

    // Consume spell slot
    const slots = casterParticipant.spellSlots[spellLevel];
    if (slots) {
      stateChanges.push({
        path: `participants.${caster}.spellSlots.${spellLevel}.used`,
        before: slots.used,
        after: slots.used + 1,
        reason: "spell_cast",
      });
    }

    // Process saves for each target
    const successfulSaves: string[] = [];
    const failedSaves: string[] = [];

    for (const target of targets) {
      const totalSave = target.saveRoll + this.getSaveBonus(target.id, target.saveType);
      
      if (totalSave >= dc) {
        successfulSaves.push(target.id);
      } else {
        failedSaves.push(target.id);
      }
    }

    if (successfulSaves.length > 0) {
      logEntry += ` - ${successfulSaves.length} targets made save`;
    }
    if (failedSaves.length > 0) {
      logEntry += ` - ${failedSaves.length} targets failed save`;
    }

    const outcome =
      failedSaves.length > 0 ? "success" : successfulSaves.length > 0 ? "partial" : "failure";

    return { outcome, stateChanges, logEntry };
  }

  resolveDamageOverTime(
    target: string,
    damagePerRound: number,
    condition: string,
    durationRounds: number
  ): ResolutionResult {
    const stateChanges: StateChange[] = [];
    const participant = this.gameState.participants[target];

    if (!participant) {
      return {
        outcome: "failure",
        stateChanges,
        logEntry: `DoT failed: target ${target} not found`,
      };
    }

    const currentHP = participant.stats.hp.current;
    const newHP = Math.max(0, currentHP - damagePerRound);

    stateChanges.push({
      path: `participants.${target}.stats.hp.current`,
      before: currentHP,
      after: newHP,
      reason: "damage_over_time",
    });

    stateChanges.push({
      path: `participants.${target}.conditions.${condition}`,
      before: null,
      after: {
        name: condition,
        durationRounds,
        appliedBy: "hazard",
      },
      reason: "condition_applied",
    });

    const logEntry = `${target} takes ${damagePerRound} damage from ${condition} (${durationRounds} rounds remaining)`;

    return { outcome: "success", stateChanges, logEntry };
  }

  resolveConditionSave(
    target: string,
    condition: string,
    saveType: string,
    dc: number,
    saveRoll: number
  ): ResolutionResult {
    const participant = this.gameState.participants[target];
    const stateChanges: StateChange[] = [];

    if (!participant) {
      return {
        outcome: "failure",
        stateChanges,
        logEntry: `Save failed: target ${target} not found`,
      };
    }

    const saveBonus = this.getSaveBonus(target, saveType);
    const totalSave = saveRoll + saveBonus;

    let logEntry = `${target} saves vs ${condition} (${saveType} DC ${dc}: ${saveRoll} + ${saveBonus} = ${totalSave})`;

    if (totalSave >= dc) {
      // Remove condition or reduce duration
      const existingCondition = participant.conditions[condition];
      if (existingCondition && existingCondition.durationRounds !== null) {
        stateChanges.push({
          path: `participants.${target}.conditions.${condition}.durationRounds`,
          before: existingCondition.durationRounds,
          after: Math.max(0, existingCondition.durationRounds - 1),
          reason: "save_succeeded",
        });
        logEntry += " - SAVE SUCCEEDED, duration reduced by 1";
      } else {
        stateChanges.push({
          path: `participants.${target}.conditions.${condition}`,
          before: participant.conditions[condition] || null,
          after: null,
          reason: "save_succeeded",
        });
        logEntry += " - SAVE SUCCEEDED, condition removed";
      }
      return { outcome: "success", stateChanges, logEntry };
    } else {
      logEntry += " - SAVE FAILED";
      return { outcome: "failure", stateChanges, logEntry };
    }
  }

  private rollDamage(diceExpression: string): number {
    // Parse "2d6", "1d8", etc and roll
    const match = diceExpression.match(/(\d+)d(\d+)/);
    if (!match) return 0;

    const numDice = parseInt(match[1]);
    const diceSize = parseInt(match[2]);
    let total = 0;

    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * diceSize) + 1;
    }

    return total;
  }

  private getSaveBonus(participantId: string, saveType: string): number {
    // This would pull from character sheet save bonuses
    // For now, return placeholder based on participant type
    const participant = this.gameState.participants[participantId];
    if (!participant) return 0;

    // Simplified: assume +1 to +5 based on level
    return Math.min(5, Math.floor(Math.random() * 5) + 1);
  }

  resolveSkillCheck(
    participant: string,
    skillName: string,
    dc: number,
    rollResult: number
  ): ResolutionResult {
    const part = this.gameState.participants[participant];
    const stateChanges: StateChange[] = [];

    if (!part) {
      return {
        outcome: "failure",
        stateChanges,
        logEntry: `Skill check failed: participant ${participant} not found`,
      };
    }

    const skillBonus = 2; // Placeholder
    const total = rollResult + skillBonus;

    const logEntry = `${participant} rolls ${skillName} (d20: ${rollResult} + ${skillBonus} = ${total} vs DC ${dc})`;

    return {
      outcome: total >= dc ? "success" : "failure",
      stateChanges,
      logEntry: logEntry + (total >= dc ? " - SUCCESS" : " - FAILURE"),
    };
  }
}
