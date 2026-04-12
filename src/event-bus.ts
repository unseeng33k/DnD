/**
 * Event-driven bus for D&D 3.5e rules auditor system
 * Enables loose coupling between validators, resolvers, consequence tracker, and audit loop
 */

export interface StateChange {
  path: string; // e.g., "participants[0].stats.hp", "participants[0].conditions[0]"
  oldValue: any;
  newValue: any;
  timestamp: Date;
  affectedParticipantId: string;
  description: string;
}

export interface ActionProposedEvent {
  type: 'ACTION_PROPOSED';
  action: string; // e.g., "castSpell", "attack", "move"
  participantId: string;
  targetId?: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface ActionResolvedEvent {
  type: 'ACTION_RESOLVED';
  action: string;
  participantId: string;
  targetId?: string;
  parameters: Record<string, any>;
  stateChanges: StateChange[];
  outcome: string;
  timestamp: Date;
}

export interface StateUpdatedEvent {
  type: 'STATE_UPDATED';
  stateChanges: StateChange[];
  timestamp: Date;
}

export interface RoundEndedEvent {
  type: 'ROUND_ENDED';
  roundNumber: number;
  timestamp: Date;
}

export interface ConsequenceEmittedEvent {
  type: 'CONSEQUENCE_EMITTED';
  consequenceId: string;
  linkedNPC: string;
  triggerDescription: string;
  npcReaction: string;
  tension: number;
  timestamp: Date;
}

export interface AuditFlaggedEvent {
  type: 'AUDIT_FLAGGED';
  violationType: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  affectedPath: string;
  suggestedFix: string;
  timestamp: Date;
}

export type GameEvent = 
  | ActionProposedEvent 
  | ActionResolvedEvent 
  | StateUpdatedEvent 
  | RoundEndedEvent 
  | ConsequenceEmittedEvent 
  | AuditFlaggedEvent;

export class EventBus {
  private subscribers: Map<string, ((event: GameEvent) => void)[]> = new Map();
  private eventLog: GameEvent[] = [];

  subscribe(eventType: string, callback: (event: GameEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  emit(event: GameEvent): void {
    this.eventLog.push(event);
    const callbacks = this.subscribers.get(event.type) || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  getLog(): GameEvent[] {
    return [...this.eventLog];
  }

  getLogByType(eventType: string): GameEvent[] {
    return this.eventLog.filter(event => event.type === eventType);
  }

  clearLog(): void {
    this.eventLog = [];
  }
}
