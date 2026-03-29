/**
 * UNIFIED ENTRY POINT FOR DND ENGINE
 * 
 * Exports all clean architecture modules for use throughout the project
 * 
 * Usage:
 * import { CleanGameEngine, eventBus, Registry } from './src/index.js';
 */

// ═══════════════════════════════════════════════════════
// CLEAN ARCHITECTURE (Core)
// ═══════════════════════════════════════════════════════
export { eventBus, EventBus } from './core/event-bus.js';
export { Registry } from './core/registry.js';
export { Effect, EffectRuntime } from './core/effect-runtime.js';
export { TurnPipeline } from './core/turn-pipeline.js';

// ═══════════════════════════════════════════════════════
// REGISTRIES
// ═══════════════════════════════════════════════════════
export { 
  intentRegistry,
  ruleRegistry,
  ambianceRegistry,
  effectRegistry,
  worldRegistry
} from './registries/index.js';

// ═══════════════════════════════════════════════════════
// EFFECTS
// ═══════════════════════════════════════════════════════
export {
  MechanicalEffect,
  AmbianceEffect,
  NarrativeEffect,
  WorldStateEffect
} from './effects/index.js';

// ═══════════════════════════════════════════════════════
// SYSTEMS
// ═══════════════════════════════════════════════════════
export {
  QuestSystem,
  AmbianceSystem,
  MechanicSystem,
  WorldSystem,
  UISystem,
  CinematicAmbianceOrchestrator
} from './systems/index.js';

// ═══════════════════════════════════════════════════════
// ADAPTERS (Bridge legacy code to new architecture)
// ═══════════════════════════════════════════════════════
// Phase 1: DM-Memory Integration
export { DMMemoryAdapter } from './adapters/dm-memory-adapter.js';

// Phase 2: Party-System Integration
export { PartySystemAdapter } from './adapters/party-system-adapter.js';

// Phase 4: Dice Rolling Integration
export { DiceAdapter } from './adapters/dice-adapter.js';

console.log('✅ DND Engine - Clean Architecture + Phases 1, 2, 4 + LEVEL 3 CinematicAmbianceOrchestrator initialized');