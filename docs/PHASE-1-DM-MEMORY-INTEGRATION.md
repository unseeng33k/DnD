╔═══════════════════════════════════════════════════════════════════════════╗
║        PHASE 1: DM-MEMORY INTEGRATION - DETAILED CODE PLAN               ║
║                                                                           ║
║  Integration of dm-memory-system.js into the new clean architecture     ║
║  ONE SYSTEM. ONE TIME. Then test.                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
WHAT WE'RE DOING
═════════════════════════════════════════════════════════════════════════════

The dm-memory-system.js is the DM's brain during play:
  • Rules lookups (PHB, DMG)
  • Character abilities reference
  • Session event timeline
  • Decision audit trail (consistency checking)
  • NPC tracking and relationships

This is VALUABLE and WORKING. We're NOT rewriting it.
We're ADAPTING it to work with the new event-driven architecture.

═════════════════════════════════════════════════════════════════════════════
CURRENT WIRING (OLD)
═════════════════════════════════════════════════════════════════════════════

1. STANDALONE USAGE
   
   // Old way - dm-memory is isolated
   import { DMMemory } from './dm-memory-system.js';
   const memory = new DMMemory('Curse of Strahd', 1);
   
   // Log an event (just stores locally)
   memory.logEvent('combat', 'Grond attacks', { damage: 15 });
   
   // Look up a rule
   const rule = memory.lookupRule('sneak_attack');
   
   // Record a decision
   memory.recordRuling('Allow bonus action sneak', 'advantage', 'PHB 96', {...});
   
   // Get NPC quick ref
   const npc = memory.getNPCQuickRef('Strahd');
   
   ⚠️  PROBLEM: Events only stored in memory.timeline.events array
                No integration with turn-pipeline
                No integration with other systems

═════════════════════════════════════════════════════════════════════════════
PROPOSED WIRING (NEW)
═════════════════════════════════════════════════════════════════════════════

The DMMemory system will:

1. PROVIDE data (rules, characters, NPCs) via registries
2. CONSUME events from eventBus (log all game events)
3. EXPOSE query API for turn-pipeline
4. EMIT decisions for audit trail

ARCHITECTURE:

  Turn Pipeline
    ├─ emits: turn:input-processed, turn:effects-applied, etc.
    ├─> DMMemoryAdapter listens
    ├─> logs to timeline
    ├─> checks consistency
    └─> returns decision metadata

  Registries
    ├─ rule-registry.get('sneak_attack')
    ├─> DMMemory.rules provides backing data
    └─ character-registry, world-registry also use DMMemory

═════════════════════════════════════════════════════════════════════════════
STEP 1: CREATE THE ADAPTER
═════════════════════════════════════════════════════════════════════════════

File: src/systems/dm-memory-adapter.js

PURPOSE: Bridge between old DMMemory (standalone) and new architecture (event-driven)

WHAT IT DOES:
  1. Wraps the existing RuleDatabase, CharacterDatabase, etc.
  2. Listens to eventBus for all game events
  3. Auto-logs events to DMMemory.timeline
  4. Provides query interface for turn-pipeline
  5. Tracks decisions and checks consistency

CODE STRUCTURE:

```javascript
import { eventBus } from '../core/event-bus.js';
import {
  DMMemory,
  RuleDatabase,
  CharacterDatabase,
  EventTimeline,
  DecisionTrail,
  NPCDatabase
} from '../../dm-memory-system.js';

class DMMemoryAdapter {
  constructor(campaignName, sessionNumber) {
    this.memory = new DMMemory(campaignName, sessionNumber);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for all turn pipeline events and log them
    eventBus.on('turn:input-processed', (data) => {
      this.memory.logEvent('turn', 'Input processed', data);
    });

    eventBus.on('turn:effects-applied', (data) => {
      this.memory.logEvent('turn', 'Effects applied', data);
    });

    eventBus.on('turn:world-updated', (data) => {
      this.memory.logEvent('world', 'State updated', data);
    });

    // ... more listeners
  }

  // Expose DMMemory API
  lookupRule(ruleName) {
    return this.memory.lookupRule(ruleName);
  }

  getCharacterAbility(charName, abilityName) {
    return this.memory.getCharacterAbility(charName, abilityName);
  }

  recordDecision(decision, reasoning, ruleRef, impact) {
    const entry = this.memory.recordRuling(decision, reasoning, ruleRef, impact);
    
    // Emit to eventBus so other systems can react
    eventBus.emit('dm:decision-recorded', {
      decision: entry,
      consistency: entry.consistency
    });

    return entry;
  }

  getNPCQuickRef(name) {
    return this.memory.getNPCQuickRef(name);
  }

  // Add new query methods needed by turn-pipeline
  getSessionState() {
    return this.memory.getSessionSummary();
  }

  getEventTimeline() {
    return this.memory.timeline.getTimeline();
  }
}

export { DMMemoryAdapter };
```

═════════════════════════════════════════════════════════════════════════════
STEP 2: REGISTER RULES IN THE REGISTRY
═════════════════════════════════════════════════════════════════════════════

File: src/registries/rule-registry.js (UPDATE)

CURRENT STATE: empty registry

NEW STATE: Populated from DMMemory.rules at startup

CODE CHANGE:

```javascript
// Before
class RuleRegistry {
  constructor() {
    this.rules = new Map();
  }
  
  register(ruleName, ruleData) {
    this.rules.set(ruleName, ruleData);
  }
}

// After
import { RuleDatabase } from '../../dm-memory-system.js';

class RuleRegistry {
  constructor(dmMemory) {
    this.rules = new Map();
    this.dmMemory = dmMemory;
    this.populateFromDMMemory();
  }
  
  populateFromDMMemory() {
    const ruleNames = this.dmMemory.listAvailableRules();
    for (const ruleName of ruleNames) {
      const ruleData = this.dmMemory.lookupRule(ruleName);
      this.rules.set(ruleName, ruleData);
    }
  }
  
  register(ruleName, ruleData) {
    this.rules.set(ruleName, ruleData);
  }
  
  get(ruleName) {
    return this.rules.get(ruleName) || null;
  }
}

export { RuleRegistry };
```

═════════════════════════════════════════════════════════════════════════════
STEP 3: UPDATE TURN-PIPELINE TO USE DM-MEMORY
═════════════════════════════════════════════════════════════════════════════

File: src/core/turn-pipeline.js (UPDATE)

CURRENT: Standalone turn execution

NEW: Integrated with DM-memory for event logging

CODE CHANGE:

```javascript
// Add to constructor
constructor(eventBus, effectRuntime, registries, dmMemoryAdapter) {
  this.eventBus = eventBus;
  this.effectRuntime = effectRuntime;
  this.registries = registries;
  this.dmMemory = dmMemoryAdapter;  // NEW
  this.turnCount = 0;
  this.turnHistory = [];
}

// Add logging to key methods
async stageProcessInput(input) {
  const intentType = input.action || 'unknown';
  const intent = this.registries.intent?.get(intentType);

  const processed = {
    ...input,
    intent,
    resolvedAt: new Date()
  };

  // NEW: Log to DM memory
  if (this.dmMemory) {
    this.dmMemory.memory.logEvent('game', `Action: ${input.action}`, {
      actor: input.actor,
      action: input.action,
      target: input.target
    });
  }

  this.eventBus.emit('turn:input-processed', {
    turnNumber: this.turnCount,
    input,
    processed
  });

  return processed;
}

// Similar updates to other stage methods
```

═════════════════════════════════════════════════════════════════════════════
STEP 4: UPDATE EFFECT-RUNTIME TO EMIT DECISION EVENTS
═════════════════════════════════════════════════════════════════════════════

File: src/core/effect-runtime.js (UPDATE)

When an effect resolves, emit a 'decision' event so DM-memory can log it.

CODE CHANGE:

```javascript
async executeAll(context) {
  const results = [];
  
  for (const effect of this.activeEffects) {
    const result = await effect.execute(context);
    
    // NEW: Emit decision event
    this.eventBus.emit('effect:resolved', {
      effectId: effect.id,
      effectName: effect.name,
      result: result,
      executedAt: new Date()
    });
    
    results.push(result);
  }
  
  return results;
}
```

═════════════════════════════════════════════════════════════════════════════
STEP 5: WIRE IT ALL TOGETHER IN src/index.js
═════════════════════════════════════════════════════════════════════════════

File: src/index.js (UPDATE)

CURRENT: Imports modules but doesn't initialize DM-memory

NEW: Initialize DMMemoryAdapter and pass to turn-pipeline

CODE CHANGE:

```javascript
import { DMMemoryAdapter } from './systems/dm-memory-adapter.js';
import { TurnPipeline } from './core/turn-pipeline.js';
import { eventBus } from './core/event-bus.js';
import { registries } from './registries/index.js';
import { EffectRuntime } from './core/effect-runtime.js';

// Initialize DM-memory
const dmMemory = new DMMemoryAdapter('Campaign Name', sessionNumber);

// Initialize systems with dm-memory
const effectRuntime = new EffectRuntime(eventBus);
const turnPipeline = new TurnPipeline(eventBus, effectRuntime, registries, dmMemory);

export { turnPipeline, dmMemory, eventBus, registries };
```

═════════════════════════════════════════════════════════════════════════════
STEP 6: UPDATE TURN-PIPELINE CONSTRUCTOR CALLS
═════════════════════════════════════════════════════════════════════════════

Every place that creates a TurnPipeline needs to pass dmMemory.

FIND: All `new TurnPipeline(...)` calls
UPDATE: Add dmMemory as 4th parameter

═════════════════════════════════════════════════════════════════════════════
BEFORE & AFTER EXAMPLE
═════════════════════════════════════════════════════════════════════════════

BEFORE (Old way - isolated):
  ┌─────────────────────────────┐
  │ DMMemory (standalone)       │
  │  - Rules                    │
  │  - Characters               │
  │  - Timeline (not connected) │
  │  - Decisions (not logged)   │
  └─────────────────────────────┘

AFTER (New way - integrated):
  ┌─────────────────────────────┐
  │ EventBus                    │
  │  ↑ (all events flow through)│
  └────────────┬────────────────┘
               │
       ┌───────▼────────┐
       │ Turn Pipeline  │
       │  Emits events  │
       └────────┬───────┘
                │
       ┌────────▼──────────────────┐
       │ DMMemoryAdapter           │
       │  Listens to eventBus      │
       │  Logs to timeline         │
       │  Populates registries     │
       │  Checks consistency       │
       └───────────────────────────┘

═════════════════════════════════════════════════════════════════════════════
TESTING PHASE 1
═════════════════════════════════════════════════════════════════════════════

Create: test/integration/dm-memory-integration.test.js

Tests:
  ✓ DMMemoryAdapter initializes without error
  ✓ Events emitted to eventBus are logged in DM-memory timeline
  ✓ Rules lookup returns correct data from registry
  ✓ Decision recording checks consistency
  ✓ NPC quick-ref works through adapter
  ✓ Event timeline persists across multiple turns

Example test:

```javascript
test('Events are logged to DM-memory', async () => {
  const dmMemory = new DMMemoryAdapter('Test', 1);
  const pipeline = new TurnPipeline(eventBus, effectRuntime, registries, dmMemory);

  // Execute a turn
  const result = await pipeline.execute({
    action: 'attack',
    actor: 'Grond',
    target: 'Goblin'
  });

  // Check that it was logged
  const timeline = dmMemory.getEventTimeline();
  expect(timeline.length).toBeGreaterThan(0);
  expect(timeline[0].category).toBe('game');
  expect(timeline[0].description).toContain('attack');
});
```

═════════════════════════════════════════════════════════════════════════════
NEXT STEPS (After Phase 1 succeeds)
═════════════════════════════════════════════════════════════════════════════

1. ✅ DMMemoryAdapter is live
2. ✅ RuleRegistry is populated from DMMemory
3. ✅ TurnPipeline logs to DMMemory
4. ✅ All tests pass

THEN: Move to Phase 2 (Party-System Integration)

═════════════════════════════════════════════════════════════════════════════
