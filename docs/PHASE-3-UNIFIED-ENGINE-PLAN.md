╔═══════════════════════════════════════════════════════════════════════════╗
║           PHASE 3: UNIFIED NINE PILLARS ENGINE ARCHITECTURE               ║
║                                                                           ║
║  GOAL: Create single unified engine using the Nine Pillars design        ║
║  STATUS: Ready to begin (Phase 1 & 2 complete)                          ║
║  APPROACH: Build on consolidated Phase 2 foundation                      ║
╚═══════════════════════════════════════════════════════════════════════════╝

PHASE 3 OVERVIEW
═════════════════════════════════════════════════════════════════════════════

The Nine Pillars Engine represents the complete AD&D 1E system orchestrated
around a central heartbeat. Each pillar provides a specific function while
working in harmony with the others.

THE NINE PILLARS:
1. Mechanical State         - Character/mechanics layer
2. Persistent World         - World state tracking
3. Agency & Spotlight       - Player agency + spotlight distribution
4. Uncertainty & Stakes     - Pacing & tension management
5. Legibility              - Player/DM understanding of rules & state
6. Orchestrator            - Narrative coherence
7. World State Graph       - Relationship & consequence tracking
8. Spotlight Scheduler     - Turn/scene management
9. The Heartbeat           - Central lifecycle manager

═════════════════════════════════════════════════════════════════════════════
PHASE 3 STRUCTURE
═════════════════════════════════════════════════════════════════════════════

src/legacy/systems/
├── nine-pillars-engine.js          ← MAIN UNIFIED ENGINE
├── pillar-1-mechanical-state.js
├── pillar-2-persistent-world.js
├── pillar-3-agency-spotlight.js
├── pillar-4-uncertainty-stakes.js
├── pillar-5-legibility.js
├── pillar-6-orchestrator.js
├── pillar-7-world-state-graph.js
├── pillar-8-spotlight-scheduler.js
├── pillar-9-heartbeat.js
├── nine-pillars-integration.js      ← Ties all pillars together
└── [supporting systems]
    ├── spotlight-pacing-scheduler.js
    ├── mechanical-state-engine.js
    ├── image-generator.js
    └── orchestrator-integration.js

src/legacy/engines/
├── unified-adventure-runner.js      ← Universal adventure engine
├── playtest-runner.js               ← Reference implementation
├── grond-malice-adventure.js        ← Campaign-specific runner
└── [other specific adventures]

═════════════════════════════════════════════════════════════════════════════
PHASE 3 EXECUTION PLAN
═════════════════════════════════════════════════════════════════════════════

STEP 1: CREATE UNIFIED ENGINE SKELETON (2 hours)
─────────────────────────────────────────────────────────────────────────────

Create nine-pillars-engine.js with:

```javascript
class NinePillarsEngine {
  constructor() {
    this.pillar1 = new MechanicalStateEngine();
    this.pillar2 = new PersistentWorld();
    this.pillar3 = new AgencySpotlight();
    this.pillar4 = new UncertaintyStakes();
    this.pillar5 = new Legibility();
    this.pillar6 = new Orchestrator();
    this.pillar7 = new WorldStateGraph();
    this.pillar8 = new SpotlightScheduler();
    this.pillar9 = new Heartbeat();
    
    // Integration layer
    this.state = {}; // Shared state
    this.history = []; // Action history
  }
  
  // Heartbeat lifecycle
  startRound() { /* coordinate all pillars */ }
  processTurn(action) { /* validate + execute + broadcast */ }
  endRound() { /* update state, check consequences */ }
}
```

STEP 2: CONSOLIDATE MECHANICAL STATE (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create pillar-1-mechanical-state.js:

- Consolidate mechanical-state-engine.js functionality
- Add character/NPC templates
- Add combat mechanics (THAC0, AC, saves, etc.)
- Add spell slot tracking
- Add condition management

STEP 3: BUILD PERSISTENT WORLD (1.5 hours)
─────────────────────────────────────────────────────────────────────────────

Create pillar-2-persistent-world.js:

- Merge world-state-graph + world-state-query-engine
- Track locations, NPCs, factions
- Manage time (days, rounds)
- Handle travel & movement
- Track discovered/undiscovered areas

STEP 4: IMPLEMENT AGENCY & SPOTLIGHT (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create pillar-3-agency-spotlight.js:

- Consolidate spotlight-pacing-scheduler
- Ensure balanced spotlight across party
- Track mechanical wins, narrative moments, decision gates
- Manage player agency & meaningful choices
- Prevent spotlight hogging

STEP 5: MANAGE UNCERTAINTY & STAKES (1.5 hours)
─────────────────────────────────────────────────────────────────────────────

Create pillar-4-uncertainty-stakes.js:

- Pacing control (intensity curve)
- Stakes management (what's at risk)
- Consequence tracking
- Difficulty scaling
- Tension building

STEP 6: BUILD LEGIBILITY SYSTEM (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create pillar-5-legibility.js:

- Clear rule exposition
- Character sheet clarity
- State visibility (what players understand)
- DM reference system
- Quick lookup tables

STEP 7: CREATE ORCHESTRATOR (1.5 hours)
─────────────────────────────────────────────────────────────────────────────

Create pillar-6-orchestrator.js:

- Narrative coherence
- Scene management
- Image generation integration
- Ambiance coordination
- DM voice consistency

STEP 8: WORLD STATE GRAPH (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create pillar-7-world-state-graph.js:

- Relationship tracking (NPCs, factions, PCs)
- Consequence propagation
- Cause & effect chains
- Rumor/information flow
- Reputation system

STEP 9: SPOTLIGHT SCHEDULER (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create pillar-8-spotlight-scheduler.js:

- Turn order management
- Initiative tracking
- Round progression
- Spotlight allocation per turn
- Combat vs roleplay balancing

STEP 10: BUILD THE HEARTBEAT (2 hours)
─────────────────────────────────────────────────────────────────────────────

Create pillar-9-heartbeat.js:

This is the CENTRAL ENGINE that drives everything:

```javascript
class Heartbeat {
  // Session lifecycle
  startSession(party, setting) { }
  
  // Round lifecycle
  startRound() {
    this.pillar8.calculateTurnOrder();
    this.pillar3.checkSpotlightBalance();
    this.pillar4.adjustPacing();
  }
  
  executeAction(actor, action) {
    // Get pillar decisions
    const legality = this.pillar5.validateAction(action);
    const mechanical = this.pillar1.resolveMechanics(action);
    const narrative = this.pillar6.narrateOutcome(action);
    const consequences = this.pillar7.propagateConsequences(action);
    
    // Update all pillars
    this.pillar2.updateWorld(consequences);
    this.pillar3.recordMoment(actor, mechanical);
    this.pillar4.updateStakes(consequences);
    
    return { mechanical, narrative, consequences };
  }
  
  endRound() {
    this.pillar4.updateTension();
    this.pillar3.rebalanceSpotlight();
    this.pillar7.resolveConsequences();
  }
  
  endSession() {
    this.generateSessionSummary();
    this.saveState();
  }
}
```

STEP 11: CREATE INTEGRATION LAYER (1 hour)
─────────────────────────────────────────────────────────────────────────────

Create nine-pillars-integration.js:

- Coordinate between pillars
- Share state efficiently
- Manage pillar communication
- Handle edge cases
- Provide unified API

STEP 12: BUILD UNIVERSAL ADVENTURE RUNNER (1.5 hours)
─────────────────────────────────────────────────────────────────────────────

Create unified-adventure-runner.js:

```javascript
class UniversalAdventureRunner {
  constructor(nineEngine) {
    this.engine = nineEngine;
  }
  
  loadAdventure(config) {
    // Can load ANY adventure with same engine
    this.engine.startSession(config.party, config.setting);
    this.narrative = config.scenes;
  }
  
  executeGameLoop() {
    while (!this.gameOver) {
      const action = this.getPlayerInput();
      const result = this.engine.executeAction(action);
      this.displayResult(result);
    }
  }
  
  // Works for ANY adventure: grond-malice, town-thornhearth, etc.
  // No duplication - all use same engine
}
```

═════════════════════════════════════════════════════════════════════════════
PHASE 3 TIMELINE
═════════════════════════════════════════════════════════════════════════════

Step 1:  Engine Skeleton              → 2 hours
Step 2:  Mechanical State             → 1 hour
Step 3:  Persistent World             → 1.5 hours
Step 4:  Agency & Spotlight           → 1 hour
Step 5:  Uncertainty & Stakes         → 1.5 hours
Step 6:  Legibility                   → 1 hour
Step 7:  Orchestrator                 → 1.5 hours
Step 8:  World State Graph            → 1 hour
Step 9:  Spotlight Scheduler          → 1 hour
Step 10: The Heartbeat (CRITICAL)     → 2 hours
Step 11: Integration                  → 1 hour
Step 12: Universal Runner             → 1.5 hours
Testing & Documentation               → 2 hours
                                        ──────────
TOTAL:                                ~19 hours

═════════════════════════════════════════════════════════════════════════════
PHASE 3 BENEFITS
═════════════════════════════════════════════════════════════════════════════

✅ Single Unified Engine
   - One implementation instead of 17 adventure-specific copies
   - All adventures use the same mechanical system
   - Consistent rules enforcement

✅ Reduced Duplication
   - SpotlightPacingScheduler used once, not 8 times
   - MechanicalStateEngine shared across all adventures
   - Single source of truth

✅ Easy to Extend
   - Add new adventure → just load new narrative config
   - Add new pillar → integrate without breaking existing pillars
   - Add new rule → update Heartbeat once

✅ Better Maintenance
   - Bug fix in combat system → fixed everywhere
   - Rule clarification → single update
   - Performance optimization → benefits all adventures

✅ AI Integration Ready
   - Clean API for agents to call
   - Each pillar exportable to LLMs
   - Telegram bot integration simplified

═════════════════════════════════════════════════════════════════════════════
PHASE 3 SUCCESS CRITERIA
═════════════════════════════════════════════════════════════════════════════

✅ All 9 pillars implemented
✅ Heartbeat successfully coordinates all pillars
✅ Can run existing adventures with unified engine
✅ All imports resolve correctly
✅ No code duplication across engines
✅ Tests pass for all mechanics
✅ DM can start a session and play end-to-end
✅ Spotlight is balanced across party
✅ World state persists correctly
✅ Consequences propagate properly

═════════════════════════════════════════════════════════════════════════════
PHASE 4 (Future)
═════════════════════════════════════════════════════════════════════════════

Once Phase 3 is complete:
- CLI interface for playing adventures
- Telegram bot integration
- Builder mode for creating new adventures
- Module system for TSR modules
- Character generation system
- Full AD&D 1E rules database integration

═════════════════════════════════════════════════════════════════════════════

🎭 PHASE 3 PLAN IS READY

With Phase 1 & 2 complete, the architecture is clean and ready.
Phase 3 will build the unified Nine Pillars engine that powers all adventures.

Next step: Start Phase 3 - Create the Heartbeat engine

═════════════════════════════════════════════════════════════════════════════
