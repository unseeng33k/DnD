╔═══════════════════════════════════════════════════════════════════════════╗
║     PHASE 1: DM-MEMORY ADAPTER IMPLEMENTATION PLAN                       ║
║                                                                           ║
║  How to integrate dm-memory-system.js into the clean architecture       ║
║  WITHOUT copying it into src/                                           ║
║  USING an adapter that bridges old code to new API                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
BEFORE: How dm-memory currently works
═════════════════════════════════════════════════════════════════════════════

Location: /Users/mpruskowski/.openclaw/workspace/dnd/dm-memory-system.js
Status: STANDALONE - no imports, not connected to event bus

Current Usage Pattern:
  const memory = new DMMemory('Campaign Name', sessionNumber);
  
  // Later in game session:
  memory.logEvent('combat', 'Attack rolled', { attacker: 'Grond', roll: 15 });
  memory.lookupRule('sneak_attack');
  memory.recordRuling('Allow bonus action', 'advantage', 'PHB 96', {...});
  
  // At end of session:
  memory.saveSession();

PROBLEM: 
  • Events logged to memory.timeline (internal array)
  • NOT connected to turn-pipeline
  • NOT populating registries
  • NOT emitting to eventBus
  • If dm-memory is garbage collected, session is lost

═════════════════════════════════════════════════════════════════════════════
AFTER: How dm-memory will work with adapter
═════════════════════════════════════════════════════════════════════════════

Location: src/adapters/dm-memory-adapter.js (NEW)
The adapter wraps DMMemory and connects it to the new architecture

New Usage Pattern:
  import { DMMemoryAdapter } from './src/adapters/dm-memory-adapter.js';
  import { eventBus } from './src/index.js';
  
  const dmMemory = new DMMemoryAdapter('Campaign Name', sessionNumber, eventBus);
  
  // DMMemory automatically:
  // 1. Listens to eventBus for all turn events
  // 2. Logs events to timeline
  // 3. Populates rule-registry from RuleDatabase
  // 4. Provides query interface to turn-pipeline
  
  // Turn-pipeline uses it:
  const result = await turnPipeline.execute({
    action: 'attack',
    actor: 'Grond',
    target: 'Goblin'
  });
  // → DMMemoryAdapter.logEvent() called automatically via eventBus
  
  // Later, query it:
  const rule = dmMemory.lookupRule('sneak_attack');
  const events = dmMemory.getTimeline();
  const decision = dmMemory.recordDecision(...);

BENEFIT:
  • Original dm-memory code unchanged
  • Events flow through eventBus
  • Registries stay populated
  • Turn-pipeline can query game state
  • Session state is part of event stream

═════════════════════════════════════════════════════════════════════════════
ADAPTER CODE: src/adapters/dm-memory-adapter.js
═════════════════════════════════════════════════════════════════════════════

```javascript
/**
 * DM-MEMORY ADAPTER
 * 
 * Bridges old DMMemory system with new orchestrator API
 * 
 * OLD: DMMemory is standalone, events siloed
 * NEW: DMMemory listens to eventBus, integrates with registries
 */

import { DMMemory } from '../dm-memory-system.js';

class DMMemoryAdapter {
  constructor(campaignName, sessionNumber, eventBus, registries) {
    this.eventBus = eventBus;
    this.registries = registries;
    
    // Wrap the old DMMemory system
    this.memory = new DMMemory(campaignName, sessionNumber);
    
    // Connect it to the new architecture
    this.setupEventListeners();
    this.populateRegistries();
  }

  /**
   * STEP 1: Listen to all turn-pipeline events
   * When anything happens in the game, log it to DMMemory timeline
   */
  setupEventListeners() {
    // Combat events
    this.eventBus.on('turn:input-processed', (data) => {
      this.memory.logEvent('turn', `Input: ${data.input.action}`, data);
    });

    this.eventBus.on('turn:effects-applied', (data) => {
      this.memory.logEvent('turn', `Effects applied`, {
        count: data.effectCount,
        results: data.results.map(r => r.name)
      });
    });

    this.eventBus.on('turn:world-updated', (data) => {
      this.memory.logEvent('world', `State updated`, data.updates);
    });

    this.eventBus.on('turn:output', (data) => {
      this.memory.logEvent('narrative', data.output.narrative, {});
    });

    // Combat-specific events
    this.eventBus.on('combat:initiative-rolled', (data) => {
      this.memory.logCombatRound(data.round, data.turnOrder);
    });

    this.eventBus.on('combat:damage', (data) => {
      this.memory.logAction(data.actor, `took ${data.damage} damage`, {
        damage: data.damage,
        newHP: data.newHP,
        maxHP: data.maxHP
      });
    });

    // NPC interaction events
    this.eventBus.on('npc:interaction', (data) => {
      this.memory.recordNPCInteraction(data.npcName, data.description, {
        disposition: data.disposition,
        outcome: data.outcome
      });
    });

    // Discovery events
    this.eventBus.on('world:discovery', (data) => {
      this.memory.logDiscovery(data.description, {
        location: data.location,
        significance: data.significance
      });
    });
  }

  /**
   * STEP 2: Populate registries from DMMemory at startup
   * This makes all rules queryable via the registry system
   */
  populateRegistries() {
    // Populate rule-registry from DMMemory.rules
    const ruleNames = this.memory.listAvailableRules();
    for (const ruleName of ruleNames) {
      const ruleData = this.memory.lookupRule(ruleName);
      if (this.registries.ruleRegistry) {
        this.registries.ruleRegistry.register(ruleName, ruleData);
      }
    }
  }

  /**
   * STEP 3: Expose DMMemory query API
   * Turn-pipeline and other systems query through these methods
   */
  
  lookupRule(ruleName) {
    return this.memory.lookupRule(ruleName);
  }

  getCharacterAbility(charName, abilityName) {
    return this.memory.getCharacterAbility(charName, abilityName);
  }

  getNPCQuickRef(npcName) {
    return this.memory.getNPCQuickRef(npcName);
  }

  getTimeline(limit = 50) {
    return this.memory.timeline.getRecentEvents(limit);
  }

  getSessionSummary() {
    return this.memory.getSessionSummary();
  }

  /**
   * STEP 4: Record decisions through adapter
   * Decisions are logged AND emitted to eventBus
   */
  recordDecision(decision, reasoning, ruleRef, impact) {
    const entry = this.memory.recordRuling(decision, reasoning, ruleRef, impact);
    
    // Emit to eventBus so other systems can react
    this.eventBus.emit('dm:decision-recorded', {
      decision: entry.decision,
      reasoning: entry.reasoning,
      ruleRef: entry.ruleReference,
      consistency: entry.consistency
    });

    return entry;
  }

  /**
   * STEP 5: Save state at session end
   */
  saveSession() {
    const sessionFile = this.memory.saveSession();
    
    this.eventBus.emit('session:saved', {
      file: sessionFile,
      summary: this.memory.getSessionSummary()
    });

    return sessionFile;
  }
}

export { DMMemoryAdapter };
```

═════════════════════════════════════════════════════════════════════════════
STEP 1: CREATE THE ADAPTER FILE
═════════════════════════════════════════════════════════════════════════════

1. Create directory: mkdir src/adapters
2. Create file: src/adapters/dm-memory-adapter.js
3. Copy code from above

═════════════════════════════════════════════════════════════════════════════
STEP 2: UPDATE src/index.js TO EXPORT ADAPTER
═════════════════════════════════════════════════════════════════════════════

Add to src/index.js:

  import { DMMemoryAdapter } from './adapters/dm-memory-adapter.js';
  export { DMMemoryAdapter };

═════════════════════════════════════════════════════════════════════════════
STEP 3: UPDATE src/core/turn-pipeline.js TO USE ADAPTER
═════════════════════════════════════════════════════════════════════════════

Modify TurnPipeline constructor:

  // Before
  constructor(eventBus, effectRuntime, registries) {
    this.eventBus = eventBus;
    this.effectRuntime = effectRuntime;
    this.registries = registries;
  }

  // After
  constructor(eventBus, effectRuntime, registries, dmMemoryAdapter = null) {
    this.eventBus = eventBus;
    this.effectRuntime = effectRuntime;
    this.registries = registries;
    this.dmMemory = dmMemoryAdapter;  // NEW - optional
  }

The adapter is optional because turn-pipeline can work without DM-memory.
But when initialized, dm-memory listens to all turn events automatically.

═════════════════════════════════════════════════════════════════════════════
STEP 4: INITIALIZE ADAPTER IN YOUR GAME LOOP
═════════════════════════════════════════════════════════════════════════════

Example usage (e.g., in your session runner):

  import { 
    TurnPipeline, 
    eventBus, 
    registries,
    DMMemoryAdapter 
  } from './src/index.js';
  
  // Create DM-memory adapter
  const dmMemory = new DMMemoryAdapter(
    'Curse of Strahd',
    1,
    eventBus,
    registries
  );
  
  // Create turn-pipeline with dm-memory attached
  const turnPipeline = new TurnPipeline(
    eventBus,
    effectRuntime,
    registries,
    dmMemory  // ← Pass the adapter
  );
  
  // Now run a turn
  const result = await turnPipeline.execute({
    action: 'attack',
    actor: 'Grond',
    target: 'Goblin'
  });
  
  // DMMemory automatically logged this to timeline
  // via eventBus events
  
  // Later: query DM-memory
  const sneak = dmMemory.lookupRule('sneak_attack');
  const timeline = dmMemory.getTimeline();
  
  // End of session:
  dmMemory.saveSession();

═════════════════════════════════════════════════════════════════════════════
TESTING PHASE 1
═════════════════════════════════════════════════════════════════════════════

Create: test/adapters/dm-memory-adapter.test.js

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { DMMemoryAdapter } from '../../src/adapters/dm-memory-adapter.js';
import { EventBus } from '../../src/core/event-bus.js';
import { ruleRegistry } from '../../src/registries/index.js';

describe('DMMemoryAdapter', () => {
  let adapter, eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    adapter = new DMMemoryAdapter(
      'Test Campaign',
      1,
      eventBus,
      { ruleRegistry }
    );
  });

  it('should initialize DMMemory', () => {
    expect(adapter.memory).toBeDefined();
    expect(adapter.memory.campaign).toBe('Test Campaign');
  });

  it('should populate rule-registry from DMMemory', () => {
    const rule = ruleRegistry.get('sneak_attack');
    expect(rule).toBeDefined();
    expect(rule.class).toBe('Rogue');
  });

  it('should log events emitted to eventBus', (done) => {
    eventBus.emit('turn:input-processed', {
      input: { action: 'attack' }
    });

    setTimeout(() => {
      const timeline = adapter.getTimeline();
      expect(timeline.length).toBeGreaterThan(0);
      expect(timeline[0].description).toContain('attack');
      done();
    }, 100);
  });

  it('should record decisions with consistency checking', () => {
    const decision = adapter.recordDecision(
      'Allow bonus action sneak attack',
      'Player has advantage',
      'PHB 96',
      { appliedTo: 'Grond' }
    );

    expect(decision.recorded).toBeDefined();
    expect(decision.consistency).toBeDefined();
  });

  it('should lookup rules correctly', () => {
    const rule = adapter.lookupRule('advantage');
    expect(rule.description).toContain('roll the d20 twice');
  });
});
```

Run: npm test -- test/adapters/dm-memory-adapter.test.js

═════════════════════════════════════════════════════════════════════════════
SUCCESS CRITERIA
═════════════════════════════════════════════════════════════════════════════

✅ Adapter file created: src/adapters/dm-memory-adapter.js
✅ Adapter exported from src/index.js
✅ TurnPipeline accepts optional dmMemoryAdapter parameter
✅ DMMemory listens to eventBus events
✅ Rule-registry populated from DMMemory.rules
✅ All tests pass
✅ dm-memory-system.js file UNCHANGED (no modifications)
✅ DM-memory queries work through adapter API

═════════════════════════════════════════════════════════════════════════════
WHAT'S NOT HAPPENING
═════════════════════════════════════════════════════════════════════════════

❌ dm-memory-system.js is NOT copied into src/
❌ dm-memory-system.js is NOT modified
❌ dm-memory-system.js is NOT moved to src/
❌ Old functions from dm-memory are NOT called directly

✅ Instead: adapter bridges the gap
✅ Old code stays in archive/root
✅ New code in src/ talks only to adapter
✅ Adapter translates between old & new APIs

═════════════════════════════════════════════════════════════════════════════
