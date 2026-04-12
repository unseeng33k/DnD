/**
 * Event Bus: Core pub/sub system for game state changes
 * All actions flow through here. Validators and audits subscribe to events.
 */

export type GameEvent =
  | ActionProposedEvent
  | ActionResolvedEvent
  | StateUpdatedEvent
  | RoundEndedEvent
  | ConsequenceEmittedEvent
  | AuditFlaggedEvent;

export interface ActionProposedEvent {
  type: "ACTION_PROPOSED";
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target?: string;
  details: Record<string, any>;
}

export interface ActionResolvedEvent {
  type: "ACTION_RESOLVED";
  id: string;
  timestamp: string;
  actionId: string;
  outcome: "success" | "partial" | "failure";
  stateChanges: StateChange[];
  violations: string[];
}

export interface StateUpdatedEvent {
  type: "STATE_UPDATED";
  id: string;
  timestamp: string;
  changes: StateChange[];
}

export interface RoundEndedEvent {
  type: "ROUND_ENDED";
  timestamp: string;
  roundNumber: number;
  tickedTracks: Array<{
    trackName: string;
    newLevel: number;
    escalators: string[];
  }>;
}

export interface ConsequenceEmittedEvent {
  type: "CONSEQUENCE_EMITTED";
  id: string;
  timestamp: string;
  consequenceId: string;
  trigger: string;
}

export interface AuditFlaggedEvent {
  type: "AUDIT_FLAGGED";
  id: string;
  timestamp: string;
  severity: "warning" | "error" | "info";
  message: string;
  actionId?: string;
  suggestedFix?: string;
}

export interface StateChange {
  path: string;
  before: any;
  after: any;
  reason: string;
}

export type EventListener = (event: GameEvent) => void | Promise<void>;

export class EventBus {
  private listeners: Map<GameEvent["type"], EventListener[]> = new Map();
  private eventLog: GameEvent[] = [];
  private eventIdCounter = 0;

  subscribe(eventType: GameEvent["type"], listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      const idx = this.listeners.get(eventType)!.indexOf(listener);
      if (idx > -1) {
        this.listeners.get(eventType)!.splice(idx, 1);
      }
    };
  }

  async emit(event: Omit<GameEvent, "id">): Promise<GameEvent> {
    const completeEvent: GameEvent = {
      ...event,
      id: `event_${++this.eventIdCounter}`,
    } as GameEvent;

    this.eventLog.push(completeEvent);

    const listeners = this.listeners.get(completeEvent.type) || [];
    await Promise.all(listeners.map((l) => l(completeEvent)));

    return completeEvent;
  }

  getLog(): GameEvent[] {
    return [...this.eventLog];
  }

  clearLog(): void {
    this.eventLog = [];
    this.eventIdCounter = 0;
  }
}
