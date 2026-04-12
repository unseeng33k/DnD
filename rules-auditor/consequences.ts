import { EventBus, StateChange, EVENT_TYPES } from './event-bus';
import { GameState, Consequence, TensionTrack } from './game-state';

/**
 * ConsequenceTracker monitors game state changes and emits consequences when:
 * - Linked NPCs/factions have incentives to act
 * - Tension thresholds are crossed
 * - Player inaction escalates hidden clocks
 *
 * Consequences are deterministic: same input state always produces same escalations.
 * This allows the DM to trust that consequences follow player choices, not arbitrary impulse.
 */
export interface ConsequenceEmission {
  consequence: Consequence;
  escalationReason: string;
  affectedTensionTracks: string[];
  suggestedNPCReactions: NPCReaction[];
  roundTriggered: number;
}

export interface NPCReaction {
  npcName: string;
  faction: string;
  motivationPath: string; // e.g., "linkedNPCs.black_dow.goals" - what the NPC wants
  suggestedAction: string; // e.g., "Attack player supply line"
  urgencyLevel: 'low' | 'medium' | 'high'; // based on tension and relationship
}

export interface TensionThresholdCrossing {
  trackName: string;
  oldLevel: number;
  newLevel: number;
  thresholdDescription: string;
  linkedConsequences: Consequence[];
}

export class ConsequenceTracker {
  private eventBus: EventBus;
  private gameState: GameState;
  private consequenceHistory: ConsequenceEmission[] = [];
  private thresholdCrossingLog: TensionThresholdCrossing[] = [];

  constructor(eventBus: EventBus, gameState: GameState) {
    this.eventBus = eventBus;
    this.gameState = gameState;
    
    // Listen for state updates to check consequence triggers
    this.eventBus.subscribe(EVENT_TYPES.STATE_UPDATED, (event) => {
      this.checkConsequenceTriggers(event.stateChanges);
    });

    // Listen for round end to escalate time-based consequences
    this.eventBus.subscribe(EVENT_TYPES.ROUND_ENDED, (event) => {
      this.escalateTimeBasedConsequences(event.roundNumber);
    });
  }

  /**
   * Check if any consequences should activate based on state changes.
   * Consequences trigger when:
   * 1. An action linked to the consequence is taken (e.g., breaking a sacred oath)
   * 2. A condition linked to a consequence manifests (e.g., death of a key NPC)
   * 3. Global tension reaches a threshold
   */
  private checkConsequenceTriggers(stateChanges: StateChange[]): void {
    const consequences = this.gameState.consequences || [];

    for (const stateChange of stateChanges) {
      for (const consequence of consequences) {
        // Check if this state change is the trigger for this consequence
        if (this.isConsequenceTrigger(stateChange, consequence)) {
          this.emitConsequence(consequence, stateChange);
        }
      }

      // Check if tension thresholds are crossed
      this.checkTensionThresholds(stateChange);
    }
  }

  /**
   * Determine if a state change triggers a consequence.
   * Consequences are tied to specific actions and their outcomes.
   */
  private isConsequenceTrigger(stateChange: StateChange, consequence: Consequence): boolean {
    // Example triggers:
    // 1. Casting a forbidden spell (state path = spellCast, consequence.action = "cast forbidden spell")
    if (stateChange.path.includes('spellCast') && consequence.action.includes('spell')) {
      return stateChange.reason.includes(consequence.action);
    }

    // 2. Killing a linked NPC (state path = participants.npc_X.status changes to dead)
    if (stateChange.path.includes('status') && stateChange.after === 'dead') {
      const participantName = stateChange.path.split('.')[1];
      if (consequence.linkedNPCs?.includes(participantName)) {
        return true;
      }
    }

    // 3. Breaking an oath or betraying a faction (tracked in consequence.action)
    if (consequence.action === stateChange.reason) {
      return true;
    }

    return false;
  }

  /**
   * Emit a consequence and record it in the ledger.
   * This notifies the audit system and suggests NPC reactions.
   */
  private emitConsequence(consequence: Consequence, trigger: StateChange): void {
    const roundNumber = this.gameState.session.currentRound || 0;
    const affectedTensionTracks: string[] = [];
    const suggestedReactions: NPCReaction[] = [];

    // Escalate any linked tension tracks
    if (consequence.linkedFactions) {
      for (const faction of consequence.linkedFactions) {
        const track = this.gameState.tensionTracks.find(t => t.name === faction);
        if (track && consequence.globalTensionIncrease) {
          const newLevel = Math.min(track.currentLevel + consequence.globalTensionIncrease, track.maxLevel);
          if (newLevel > track.currentLevel) {
            affectedTensionTracks.push(faction);
            track.currentLevel = newLevel; // Deterministic escalation
          }
        }
      }
    }

    // Generate NPC reactions based on consequence
    if (consequence.linkedNPCs) {
      suggestedReactions.push(...this.generateNPCReactions(consequence));
    }

    const emission: ConsequenceEmission = {
      consequence,
      escalationReason: trigger.reason,
      affectedTensionTracks,
      suggestedNPCReactions: suggestedReactions,
      roundTriggered: roundNumber,
    };

    this.consequenceHistory.push(emission);

    // Emit event so audit loop and DM are notified
    this.eventBus.emit(EVENT_TYPES.CONSEQUENCE_EMITTED, {
      consequence,
      escalationReason: trigger.reason,
      suggestedReactions,
      triggeredBy: trigger,
    });
  }

  /**
   * Generate NPC reaction suggestions based on the consequence and their motivations.
   * Each NPC that is linked to this consequence gets a suggested action that aligns with their goals.
   */
  private generateNPCReactions(consequence: Consequence): NPCReaction[] {
    const reactions: NPCReaction[] = [];

    if (!consequence.linkedNPCs) return reactions;

    for (const npcName of consequence.linkedNPCs) {
      const participant = this.gameState.participants.find(p => p.name === npcName);
      if (!participant || !participant.npcState) continue;

      const faction = participant.npcState.faction;
      const goals = participant.npcState.goals || [];
      const relationship = participant.npcState.relationship || 'neutral';

      // Relationship influences urgency
      const urgencyMap: Record<string, NPCReaction['urgencyLevel']> = {
        'ally': 'high',
        'neutral': 'medium',
        'enemy': 'high',
        'betrayed': 'high', // Betrayed allies escalate faster
      };

      const reaction: NPCReaction = {
        npcName,
        faction,
        motivationPath: `linkedNPCs.${npcName}.goals`,
        suggestedAction: this.suggestActionForGoal(goals, consequence),
        urgencyLevel: urgencyMap[relationship] || 'medium',
      };

      reactions.push(reaction);
    }

    return reactions;
  }

  /**
   * Suggest what action an NPC might take given their goals and a consequence.
   * This aligns NPC behavior with their motivations, not random escalation.
   */
  private suggestActionForGoal(goals: string[], consequence: Consequence): string {
    if (!goals.length) return 'Investigate the consequences of recent events';

    const goal = goals[0]; // Primary goal
    const baseAction = `Act on primary goal: ${goal}`;

    // Tie action to consequence type
    if (consequence.action.includes('steal')) {
      return `Retaliate for theft; pursue ${baseAction}`;
    }
    if (consequence.action.includes('kill')) {
      return `Seek revenge or justice; pursue ${baseAction}`;
    }
    if (consequence.action.includes('betray')) {
      return `Retaliate for betrayal; accelerate ${baseAction}`;
    }

    return baseAction;
  }

  /**
   * Check if any tension thresholds are crossed by a state change.
   * When thresholds cross, consequences that depend on that tension level activate.
   */
  private checkTensionThresholds(stateChange: StateChange): void {
    // Tension thresholds are typically reached when global actions accumulate
    // e.g., "3 broken oaths = faction becomes hostile"
    
    for (const track of this.gameState.tensionTracks) {
      const oldLevel = typeof stateChange.before === 'number' ? stateChange.before : track.currentLevel;
      const newLevel = typeof stateChange.after === 'number' ? stateChange.after : track.currentLevel;

      if (newLevel > oldLevel) {
        for (const threshold of track.thresholds) {
          if (oldLevel < threshold.level && newLevel >= threshold.level) {
            this.emitThresholdCrossing(track.name, oldLevel, newLevel, threshold.trigger);
          }
        }
      }
    }
  }

  /**
   * Record when a tension track crosses a threshold.
   * This triggers all consequences linked to that threshold.
   */
  private emitThresholdCrossing(
    trackName: string,
    oldLevel: number,
    newLevel: number,
    thresholdDescription: string
  ): void {
    // Find all consequences linked to this track
    const linkedConsequences = (this.gameState.consequences || []).filter(
      c => c.linkedFactions?.includes(trackName)
    );

    const crossing: TensionThresholdCrossing = {
      trackName,
      oldLevel,
      newLevel,
      thresholdDescription,
      linkedConsequences,
    };

    this.thresholdCrossingLog.push(crossing);

    // Emit audit event
    this.eventBus.emit(EVENT_TYPES.AUDIT_FLAGGED, {
      flagType: 'threshold_crossed',
      severity: 'high',
      message: `Tension track "${trackName}" crossed threshold: ${thresholdDescription}`,
      linkedConsequences,
      stateSnapshot: { trackName, newLevel, maxLevel: this.gameState.tensionTracks.find(t => t.name === trackName)?.maxLevel },
    });
  }

  /**
   * Escalate consequences based on time passage (rounds elapsed without resolution).
   * This models "pressure from waiting" - if players ignore a threat long enough, it matures.
   */
  private escalateTimeBasedConsequences(currentRound: number): void {
    const consequences = this.gameState.consequences || [];

    for (const consequence of consequences) {
      if (!consequence.resolution) {
        const roundsElapsed = currentRound - consequence.sessionIntroduced;

        // Escalation schedule: every 3 rounds, tension increases by 1
        const escalationTier = Math.floor(roundsElapsed / 3);
        const timesApplied = consequence.linkedFactions
          ?.flatMap(faction => {
            const track = this.gameState.tensionTracks.find(t => t.name === faction);
            return track?.escalatorsApplied || [];
          })
          .filter(e => e.includes('time_passage')).length || 0;

        if (escalationTier > timesApplied) {
          // Apply time-based escalation
          for (const faction of consequence.linkedFactions || []) {
            const track = this.gameState.tensionTracks.find(t => t.name === faction);
            if (track) {
              track.currentLevel = Math.min(track.currentLevel + 1, track.maxLevel);
              track.escalatorsApplied.push(`time_passage_round_${currentRound}`);
            }
          }

          this.eventBus.emit(EVENT_TYPES.AUDIT_FLAGGED, {
            flagType: 'time_based_escalation',
            severity: 'medium',
            message: `Unresolved consequence "${consequence.action}" escalated after ${roundsElapsed} rounds of player inaction`,
            linkedConsequences: [consequence],
            stateSnapshot: { unresolved: consequence.action, roundsElapsed },
          });
        }
      }
    }
  }

  /**
   * Mark a consequence as resolved.
   * This stops time-based escalations and removes the threat from active tracking.
   */
  resolveConsequence(consequenceAction: string, resolution: string): void {
    const consequence = this.gameState.consequences?.find(c => c.action === consequenceAction);
    if (consequence) {
      consequence.resolution = resolution;
      this.eventBus.emit(EVENT_TYPES.AUDIT_FLAGGED, {
        flagType: 'consequence_resolved',
        severity: 'low',
        message: `Consequence "${consequenceAction}" resolved: ${resolution}`,
        linkedConsequences: [consequence],
      });
    }
  }

  /**
   * Get all emitted consequences in order.
   * Useful for post-session review: "Here's what escalated during the game."
   */
  getConsequenceHistory(): ConsequenceEmission[] {
    return this.consequenceHistory;
  }

  /**
   * Get all threshold crossings that occurred.
   * Useful for understanding tension track evolution.
   */
  getThresholdCrossingLog(): TensionThresholdCrossing[] {
    return this.thresholdCrossingLog;
  }

  /**
   * Get current status of all unresolved consequences.
   * DM can ask: "What's hanging over them right now?"
   */
  getUnresolvedConsequences(): Consequence[] {
    return (this.gameState.consequences || []).filter(c => !c.resolution);
  }

  /**
   * Get all tension tracks with current levels.
   * Useful for DM during narrative: "How much pressure is faction X under?"
   */
  getTensionStatus(): Array<{ name: string; currentLevel: number; maxLevel: number; escalators: string[] }> {
    return this.gameState.tensionTracks.map(track => ({
      name: track.name,
      currentLevel: track.currentLevel,
      maxLevel: track.maxLevel,
      escalators: track.escalatorsApplied,
    }));
  }
}
