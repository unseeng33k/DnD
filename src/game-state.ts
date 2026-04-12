/**
 * Single source of truth for all game state in D&D 3.5e rules auditor
 * All state changes flow through StateChange objects - no mutations
 */

export interface Condition {
  name: string;
  duration: number; // rounds remaining, 0 = instant, -1 = permanent
  source: string;
  immunity?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  type: 'pc' | 'npc' | 'enemy';
  stats: {
    hp: number;
    maxHP: number;
    ac: number;
    initiative: number;
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  actions: {
    standard: boolean;
    move: boolean;
    swift: boolean;
    immediate: boolean;
  };
  spellSlots: Record<number, number>; // spell level -> remaining slots
  abilities: string[]; // special abilities, skills, feats
  conditions: Condition[];
  resources: {
    [key: string]: {
      current: number;
      max: number;
      recovery?: string; // "per_day", "per_encounter", etc
    };
  };
  position?: {
    x: number;
    y: number;
    z?: number;
  };
  speed?: number; // feet per round
  status: 'alive' | 'unconscious' | 'dead' | 'petrified' | 'polymorphed';
  alignment?: string;
  linkedFactions?: string[]; // NPC factions that track this participant
  linkedConsequences?: string[]; // consequence IDs tied to this participant
}

export interface Consequence {
  id: string;
  linkedNPC: string;
  linkedFaction?: string;
  trigger: string; // what caused the consequence
  description: string;
  npcObjective: string; // what the NPC wants to do about this
  roundEmerged: number;
  escalationRound?: number; // when it escalates if unresolved
  resolved: boolean;
  resolution?: string;
}

export interface TensionTrack {
  id: string;
  name: string;
  description: string;
  current: number; // 0-10 scale
  escalators: string[]; // what actions increase this tension
  consequences?: string[]; // what happens at different levels (5, 8, 10)
}

export interface AuditLogEntry {
  round: number;
  timestamp: Date;
  violation: {
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    affectedPath: string;
    suggestedFix: string;
  };
  stateChange?: {
    path: string;
    oldValue: any;
    newValue: any;
  };
}

export interface GameSession {
  campaignName: string;
  sessionNumber: number;
  roundNumber: number;
  timestamp: Date;
  description?: string;
}

export interface GameState {
  session: GameSession;
  participants: Participant[];
  environment?: {
    terrain: string;
    weather?: string;
    lighting?: string;
    hazards?: string[];
  };
  consequences: Consequence[];
  tensionTracks: TensionTrack[];
  auditLog: AuditLogEntry[];
}

// Helper function to get participant by ID
export function getParticipant(state: GameState, id: string): Participant | undefined {
  return state.participants.find(p => p.id === id);
}

// Helper function to get all alive participants
export function getAliveParticipants(state: GameState): Participant[] {
  return state.participants.filter(p => p.status === 'alive');
}

// Helper function to check if participant can act
export function canParticipantAct(participant: Participant): boolean {
  return participant.status === 'alive' && 
         !participant.conditions.some(c => c.name === 'Stunned' || c.name === 'Paralyzed');
}

// Helper to find consequence by ID
export function getConsequence(state: GameState, id: string): Consequence | undefined {
  return state.consequences.find(c => c.id === id);
}
