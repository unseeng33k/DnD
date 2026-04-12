import { EventBus, EVENT_TYPES, StateChange } from './event-bus';
import { GameState } from './game-state';
import { RulesValidator } from './validators';
import { RulesResolver } from './resolvers';
import { ConsequenceTracker } from './consequences';

/**
 * RulesAuditor is the central audit loop.
 *
 * It continuously monitors the game state and:
 * 1. Validates all state changes against D&D 3.5e rules
 * 2. Flags illegal actions with specific violation messages
 * 3. Suggests mechanical fixes ("cast spell requires 1 spell slot, you have 0")
 * 4. Maintains an immutable audit log for post-session review
 *
 * The auditor never modifies state - it only observes and flag. The DM decides
 * whether to rewind, accept, or manually adjust based on auditor feedback.
 */

export interface AuditViolation {
  type: 'illegal_action' | 'state_inconsistency' | 'mechanical_error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  affectedPath?: string;
  suggestedFix?: string;
  roundDetected: number;
  involvedParticipants: string[];
}

export interface AuditEntry {
  timestamp: number;
  roundNumber: number;
  stateChanges: StateChange[];
  violations: AuditViolation[];
  validationResults: Record<string, { legal: boolean; violations: string[] }>;
  contextSnapshot: {
    affectedParticipants: string[];
    changedPaths: string[];
  };
}

export class RulesAuditor {
  private eventBus: EventBus;
  private gameState: GameState;
  private validator: RulesValidator;
  private resolver: RulesResolver;
  private consequenceTracker: ConsequenceTracker;
  
  private auditLog: AuditEntry[] = [];
  private violationCounts: Record<AuditViolation['type'], number> = {
    illegal_action: 0,
    state_inconsistency: 0,
    mechanical_error: 0,
  };

  constructor(
    eventBus: EventBus,
    gameState: GameState,
    validator: RulesValidator,
    resolver: RulesResolver,
    consequenceTracker: ConsequenceTracker
  ) {
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.validator = validator;
    this.resolver = resolver;
    this.consequenceTracker = consequenceTracker;

    // Subscribe to state changes and validate them
    this.eventBus.subscribe(EVENT_TYPES.STATE_UPDATED, (event) => {
      this.auditStateChanges(event.stateChanges);
    });

    // Subscribe to round end to perform end-of-round validation
    this.eventBus.subscribe(EVENT_TYPES.ROUND_ENDED, (event) => {
      this.auditRoundEnd(event.roundNumber);
    });

    // Subscribe to resolution events to check resolver math
    this.eventBus.subscribe(EVENT_TYPES.ACTION_RESOLVED, (event) => {
      this.auditResolution(event);
    });
  }

  /**
   * Main audit function: given state changes, validate them against D&D rules.
   * This is called after every state mutation.
   */
  private auditStateChanges(stateChanges: StateChange[]): void {
    const roundNumber = this.gameState.session.currentRound || 0;
    const violations: AuditViolation[] = [];
    const validationResults: Record<string, { legal: boolean; violations: string[] }> = {};
    const affectedParticipants = new Set<string>();
    const changedPaths = stateChanges.map(sc => sc.path);

    for (const stateChange of stateChanges) {
      // Extract participant name from path (e.g., "participants.pc_1.hp" -> "pc_1")
      const parts = stateChange.path.split('.');
      if (parts[0] === 'participants' && parts[1]) {
        affectedParticipants.add(parts[1]);
      }

      // Route validation based on what changed
      if (stateChange.path.includes('hp')) {
        violations.push(...this.validateHPChange(stateChange, roundNumber));
      }
      if (stateChange.path.includes('status')) {
        violations.push(...this.validateStatusChange(stateChange, roundNumber));
      }
      if (stateChange.path.includes('conditions')) {
        violations.push(...this.validateConditionApplication(stateChange, roundNumber));
      }
      if (stateChange.path.includes('position')) {
        violations.push(...this.validateMovement(stateChange, roundNumber));
      }
      if (stateChange.path.includes('spellSlots') || stateChange.reason.includes('cast')) {
        violations.push(...this.validateSpellCast(stateChange, roundNumber));
      }
    }

    // Run comprehensive validators on affected participants
    for (const participantName of affectedParticipants) {
      const participant = this.gameState.participants.find(p => p.name === participantName);
      if (!participant) continue;

      // Validate action economy (did they spend actions they don't have?)
      const actionResult = this.validator.validateActionEconomy(participantName);
      validationResults['actionEconomy'] = actionResult;
      if (!actionResult.legal) {
        violations.push({
          type: 'illegal_action',
          severity: 'critical',
          message: `Action economy violation for ${participantName}: ${actionResult.violations.join('; ')}`,
          affectedPath: `participants.${participantName}.actions`,
          suggestedFix: 'Rewind action and reselect valid action',
          roundDetected: roundNumber,
          involvedParticipants: [participantName],
        });
      }

      // Validate conditions don't conflict
      const conditionResult = this.validator.validateConditionApplication(
        participantName,
        participant.conditions[0]?.name || ''
      );
      validationResults['conditions'] = conditionResult;
      if (!conditionResult.legal) {
        violations.push({
          type: 'state_inconsistency',
          severity: 'warning',
          message: `Condition conflict for ${participantName}: ${conditionResult.violations.join('; ')}`,
          affectedPath: `participants.${participantName}.conditions`,
          suggestedFix: 'Remove conflicting condition or apply immunity',
          roundDetected: roundNumber,
          involvedParticipants: [participantName],
        });
      }
    }

    // Record audit entry
    const entry: AuditEntry = {
      timestamp: Date.now(),
      roundNumber,
      stateChanges,
      violations,
      validationResults,
      contextSnapshot: {
        affectedParticipants: Array.from(affectedParticipants),
        changedPaths,
      },
    };

    this.auditLog.push(entry);

    // Emit audit flagged events for each violation
    for (const violation of violations) {
      this.eventBus.emit(EVENT_TYPES.AUDIT_FLAGGED, {
        flagType: violation.type,
        severity: violation.severity,
        message: violation.message,
        suggestedFix: violation.suggestedFix,
        stateChanges,
      });

      this.violationCounts[violation.type]++;
    }
  }

  /**
   * Validate HP changes: dead targets shouldn't take more damage, negative HP capped at -10, etc.
   */
  private validateHPChange(stateChange: StateChange, roundNumber: number): AuditViolation[] {
    const violations: AuditViolation[] = [];
    const newHP = typeof stateChange.after === 'number' ? stateChange.after : 0;
    const oldHP = typeof stateChange.before === 'number' ? stateChange.before : 0;
    const participantName = stateChange.path.split('.')[1];
    const participant = this.gameState.participants.find(p => p.name === participantName);

    if (!participant) return violations;

    // Dead targets can't take more damage
    if (participant.status === 'dead' && newHP < oldHP) {
      violations.push({
        type: 'illegal_action',
        severity: 'warning',
        message: `Dead target "${participantName}" received additional damage. Dead targets cannot be damaged.`,
        affectedPath: stateChange.path,
        suggestedFix: `Revert HP change: ${participantName} was already dead`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    // HP can't exceed max
    const maxHP = participant.stats.hp.max;
    if (newHP > maxHP) {
      violations.push({
        type: 'mechanical_error',
        severity: 'warning',
        message: `${participantName} HP exceeded maximum. Current: ${newHP}, Max: ${maxHP}`,
        affectedPath: stateChange.path,
        suggestedFix: `Cap HP at ${maxHP}`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    // Unconsciousness at 0 or below
    if (newHP <= 0 && participant.status === 'alive') {
      violations.push({
        type: 'mechanical_error',
        severity: 'warning',
        message: `${participantName} reached 0 HP but status still "alive". Should be "unconscious"`,
        affectedPath: stateChange.path,
        suggestedFix: `Set status to "unconscious" and begin death saves`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    return violations;
  }

  /**
   * Validate status changes: can't resurrect dead targets mid-combat, etc.
   */
  private validateStatusChange(stateChange: StateChange, roundNumber: number): AuditViolation[] {
    const violations: AuditViolation[] = [];
    const newStatus = stateChange.after as string;
    const oldStatus = stateChange.before as string;
    const participantName = stateChange.path.split('.')[1];

    // Resurrection should be rare and intentional
    if (oldStatus === 'dead' && newStatus === 'alive') {
      violations.push({
        type: 'mechanical_error',
        severity: 'info',
        message: `${participantName} resurrected (dead → alive). Verify spell or ability allowed this.`,
        affectedPath: stateChange.path,
        suggestedFix: 'Confirm: Is there a Resurrection spell active? A Cleric ability? Or rewind?',
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    // Petrification should last (no auto-unpetrifying)
    if (oldStatus === 'petrified' && newStatus === 'alive') {
      violations.push({
        type: 'mechanical_error',
        severity: 'warning',
        message: `${participantName} unpetrified without Stone to Flesh spell. Verify.`,
        affectedPath: stateChange.path,
        suggestedFix: 'Confirm Stone to Flesh was cast, or rewind',
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    return violations;
  }

  /**
   * Validate condition applications: no immunity conflicts, duration is positive, etc.
   */
  private validateConditionApplication(stateChange: StateChange, roundNumber: number): AuditViolation[] {
    const violations: AuditViolation[] = [];
    const participantName = stateChange.path.split('.')[1];
    const participant = this.gameState.participants.find(p => p.name === participantName);
    const conditionName = stateChange.reason;

    if (!participant) return violations;

    // Check for immunity
    const conditionValidator = this.validator.validateConditionApplication(
      participantName,
      conditionName
    );
    if (!conditionValidator.legal) {
      violations.push({
        type: 'illegal_action',
        severity: 'warning',
        message: `${participantName} is immune to "${conditionName}". ${conditionValidator.violations.join('; ')}`,
        affectedPath: stateChange.path,
        suggestedFix: `Remove "${conditionName}" application or confirm immunity override`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    return violations;
  }

  /**
   * Validate movement: distance traveled doesn't exceed speed, terrain is passable, etc.
   */
  private validateMovement(stateChange: StateChange, roundNumber: number): AuditViolation[] {
    const violations: AuditViolation[] = [];
    const participantName = stateChange.path.split('.')[1];
    const newPos = stateChange.after as { x: number; y: number } | undefined;
    const oldPos = stateChange.before as { x: number; y: number } | undefined;

    if (!newPos || !oldPos) return violations;

    const distance = Math.sqrt(
      Math.pow(newPos.x - oldPos.x, 2) + Math.pow(newPos.y - oldPos.y, 2)
    );

    const movementValidator = this.validator.validateMovement(participantName, distance);
    if (!movementValidator.legal) {
      violations.push({
        type: 'illegal_action',
        severity: 'warning',
        message: `Movement violation for ${participantName}: ${movementValidator.violations.join('; ')}`,
        affectedPath: stateChange.path,
        suggestedFix: `Reduce movement to valid distance or spend additional movement action`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    return violations;
  }

  /**
   * Validate spell casting: slots available, concentration, etc.
   */
  private validateSpellCast(stateChange: StateChange, roundNumber: number): AuditViolation[] {
    const violations: AuditViolation[] = [];
    const participantName = stateChange.path.split('.')[1];

    const spellValidator = this.validator.validateCastSpell(participantName, stateChange.reason);
    if (!spellValidator.legal) {
      violations.push({
        type: 'illegal_action',
        severity: 'critical',
        message: `Cannot cast spell: ${spellValidator.violations.join('; ')}`,
        affectedPath: stateChange.path,
        suggestedFix: `Choose different spell or wait for resources to refresh`,
        roundDetected: roundNumber,
        involvedParticipants: [participantName],
      });
    }

    return violations;
  }

  /**
   * End-of-round audit: check that all condition saves were attempted, no one has impossible conditions, etc.
   */
  private auditRoundEnd(roundNumber: number): void {
    const violations: AuditViolation[] = [];

    // Check each participant with conditions
    for (const participant of this.gameState.participants) {
      if (!participant.conditions.length) continue;

      // Conditions without a duration should have been resolved
      for (const condition of participant.conditions) {
        if (condition.durationRounds === undefined) {
          violations.push({
            type: 'state_inconsistency',
            severity: 'warning',
            message: `${participant.name} has condition "${condition.name}" with undefined duration at end of round`,
            affectedPath: `participants.${participant.name}.conditions`,
            suggestedFix: `Set duration or mark as permanent effect`,
            roundDetected: roundNumber,
            involvedParticipants: [participant.name],
          });
        }

        // Check for expired conditions that weren't removed
        if (condition.durationRounds === 0 && condition.durationRounds !== undefined) {
          violations.push({
            type: 'mechanical_error',
            severity: 'warning',
            message: `${participant.name} condition "${condition.name}" expired (0 rounds left) but wasn't removed`,
            affectedPath: `participants.${participant.name}.conditions`,
            suggestedFix: `Remove expired condition "${condition.name}"`,
            roundDetected: roundNumber,
            involvedParticipants: [participant.name],
          });
        }
      }

      // Check actions reset at end of round
      if ((participant.actions.standard || participant.actions.move || participant.actions.swift) && roundNumber > 0) {
        // This will vary by game system - in 3.5e, actions reset each round
        // If a participant still has unspent actions at EOD, it may indicate they didn't finish their turn
      }
    }

    // Record violations
    if (violations.length > 0) {
      const entry: AuditEntry = {
        timestamp: Date.now(),
        roundNumber,
        stateChanges: [],
        violations,
        validationResults: {},
        contextSnapshot: {
          affectedParticipants: violations.flatMap(v => v.involvedParticipants),
          changedPaths: [],
        },
      };

      this.auditLog.push(entry);

      for (const violation of violations) {
        this.eventBus.emit(EVENT_TYPES.AUDIT_FLAGGED, {
          flagType: violation.type,
          severity: violation.severity,
          message: violation.message,
          suggestedFix: violation.suggestedFix,
        });
      }
    }
  }

  /**
   * Audit resolution events: check that resolver math is correct.
   * This is a post-hoc verification that resolved outcomes match the state changes.
   */
  private auditResolution(event: any): void {
    const roundNumber = this.gameState.session.currentRound || 0;
    const violations: AuditViolation[] = [];

    // Example: if a spell save was supposed to succeed but participant took damage, flag it
    if (event.outcome === 'success' && event.stateChanges.some((sc: StateChange) => sc.path.includes('hp'))) {
      violations.push({
        type: 'mechanical_error',
        severity: 'warning',
        message: `Resolution shows success but HP damage was applied. Verify save outcome.`,
        affectedPath: `outcome.${event.outcome}`,
        suggestedFix: 'Reroll save or adjust damage',
        roundDetected: roundNumber,
        involvedParticipants: event.stateChanges
          .map((sc: StateChange) => sc.path.split('.')[1])
          .filter(Boolean),
      });
    }

    if (violations.length > 0) {
      const entry: AuditEntry = {
        timestamp: Date.now(),
        roundNumber,
        stateChanges: event.stateChanges || [],
        violations,
        validationResults: {},
        contextSnapshot: {
          affectedParticipants: violations.flatMap(v => v.involvedParticipants),
          changedPaths: event.stateChanges?.map((sc: StateChange) => sc.path) || [],
        },
      };

      this.auditLog.push(entry);
    }
  }

  /**
   * Get audit log for session review.
   * Shows every state change and what the auditor flagged.
   */
  getAuditLog(): AuditEntry[] {
    return this.auditLog;
  }

  /**
   * Get summary of violations by type.
   */
  getViolationSummary(): Record<AuditViolation['type'], number> {
    return this.violationCounts;
  }

  /**
   * Get all unresolved violations from current session.
   */
  getActiveViolations(): AuditViolation[] {
    const violations: AuditViolation[] = [];
    for (const entry of this.auditLog) {
      violations.push(...entry.violations);
    }
    return violations;
  }

  /**
   * Print a human-readable audit report.
   * Useful for DM at end of session: "Here's what the rules system flagged."
   */
  printAuditReport(): string {
    let report = `\n=== RULES AUDIT REPORT ===\n`;
    report += `Total violations: ${this.auditLog.reduce((sum, e) => sum + e.violations.length, 0)}\n`;
    report += `Critical: ${this.violationCounts.illegal_action}\n`;
    report += `Warnings: ${this.violationCounts.state_inconsistency}\n`;
    report += `Info: ${this.violationCounts.mechanical_error}\n\n`;

    report += `Recent violations:\n`;
    const recentViolations = this.auditLog
      .slice(-5)
      .flatMap(e => e.violations.map(v => ({ ...v, round: e.roundNumber })));

    for (const v of recentViolations) {
      report += `[Round ${v.round}] ${v.severity.toUpperCase()}: ${v.message}\n`;
      if (v.suggestedFix) report += `  → Fix: ${v.suggestedFix}\n`;
    }

    return report;
  }
}
