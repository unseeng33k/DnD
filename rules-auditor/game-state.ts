/**
 * GameState: Single source of truth for all mechanical elements
 * Deterministic, auditable, persistable, event-driven
 */

export interface GameState {
  session: {
    number: number;
    date: string;
    location: string;
    turn: number;
    round: number;
  };

  participants: {
    [creatureId: string]: Participant;
  };

  environment: {
    lighting: "bright" | "dim" | "darkness";
    weather: string;
    obstacles: {
      [obstacleId: string]: Obstacle;
    };
    hazards: {
      [hazardId: string]: Hazard;
    };
  };

  consequences: {
    [consequenceId: string]: Consequence;
  };

  tensionTracks: {
    [trackName: string]: TensionTrack;
  };

  auditLog: {
    [eventId: string]: AuditEntry;
  };
}

export interface Participant {
  name: string;
  type: "pc" | "npc" | "enemy";

  stats: {
    hp: { current: number; max: number };
    ac: number;
    initiative: number;
  };

  actions: {
    standard: number;
    move: number;
    swift: number;
    reactions: number;
    fullRound: boolean;
  };

  spellSlots: {
    [level: number]: { used: number; max: number };
  };

  abilities: {
    [abilityName: string]: {
      usedToday: number;
      maxPerDay: number;
      cooldownRounds?: number;
    };
  };

  conditions: {
    [conditionName: string]: Condition;
  };

  resources: {
    gold: number;
    ammunition: { [type: string]: number };
    spellComponents: { [component: string]: number };
    heldItems: string[];
  };

  position: {
    x: number;
    y: number;
    z?: number;
    distanceFromTarget?: { [targetId: string]: number };
  };

  status: "alive" | "unconscious" | "dead" | "petrified" | "polymorphed";

  npcState?: NPCState;
}

export interface Condition {
  name: string;
  durationRounds: number | null;
  appliedBy?: string;
  saveAtEndOfTurn?: {
    dc: number;
    ability: string;
  };
}

export interface NPCState {
  faction: string;
  relationship: {
    partyReputation: "ally" | "neutral" | "enemy" | "unknown";
    lastInteractionSession: number;
    knownSecrets: string[];
  };
  goals: string[];
  fearFactors: string[];
}

export interface Obstacle {
  name: string;
  position: { x: number; y: number };
  ac: number;
  hp: { current: number; max: number };
  blockingMovement: boolean;
}

export interface Hazard {
  name: string;
  dc: number;
  damagePerRound?: number;
  condition?: string;
}

export interface Consequence {
  action: string;
  actor: string;
  sessionIntroduced: number;
  resolution: null | string;
  linkedNPCs: string[];
  linkedFactions: string[];
  globalTensionIncrease?: number;
}

export interface TensionTrack {
  name: string;
  currentLevel: number;
  maxLevel: number;
  escalatorsApplied: string[];
  thresholds: {
    [level: number]: string;
  };
}

export interface AuditEntry {
  timestamp: string;
  event: string;
  proposedAction?: {
    actor: string;
    action: string;
    target?: string;
  };
  validationResult?: {
    legal: boolean;
    violations: string[];
  };
  stateChanges?: { [key: string]: { before: any; after: any } };
}

export function createGameState(sessionNumber: number): GameState {
  return {
    session: {
      number: sessionNumber,
      date: new Date().toISOString(),
      location: "Unspecified",
      turn: 0,
      round: 0,
    },
    participants: {},
    environment: {
      lighting: "bright",
      weather: "clear",
      obstacles: {},
      hazards: {},
    },
    consequences: {},
    tensionTracks: {},
    auditLog: {},
  };
}

export function addParticipant(
  state: GameState,
  id: string,
  participant: Participant
): GameState {
  return {
    ...state,
    participants: {
      ...state.participants,
      [id]: participant,
    },
  };
}

export function updateParticipantHP(
  state: GameState,
  participantId: string,
  newHp: number
): GameState {
  const participant = state.participants[participantId];
  if (!participant) return state;

  return {
    ...state,
    participants: {
      ...state.participants,
      [participantId]: {
        ...participant,
        stats: {
          ...participant.stats,
          hp: {
            ...participant.stats.hp,
            current: Math.max(0, newHp),
          },
        },
      },
    },
  };
}
