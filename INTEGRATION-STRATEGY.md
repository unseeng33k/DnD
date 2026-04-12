╔═══════════════════════════════════════════════════════════════════════════╗
║                   INTEGRATION STRATEGY SUMMARY                           ║
║                                                                           ║
║  How to integrate legacy code WITHOUT auto-merging                      ║
║  DND Project - All files and approach                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
THE PRINCIPLE
═════════════════════════════════════════════════════════════════════════════

NEVER copy legacy files into src/
ALWAYS create an adapter that bridges old & new
TEST the adapter before using the old code

✅ OLD CODE STAYS IN PLACE (archive/ or root)
✅ NEW CODE IN src/ ONLY imports adapters (not old files)
✅ ADAPTERS bridge the gap (transform old API → new API)

═════════════════════════════════════════════════════════════════════════════
YOUR PROJECT STATE
═════════════════════════════════════════════════════════════════════════════

CLEAN ARCHITECTURE (src/):
  ✅ Core: event-bus, turn-pipeline, registry, effect-runtime
  ✅ Systems: quest, ambiance, mechanic, world, ui
  ✅ Registries: intent, rule, ambiance, effect, world
  ✅ Effects: mechanical, ambiance, narrative, world-state

LEGACY CODE (root level + archive/):
  dm-memory-system.js (PHASE 1 integration target) 
  party-system.js (PHASE 2 integration target)
  spotlight-pacing-scheduler.js (PHASE 3 integration)
  skills/ directory (various skills, unknown status)
  Lots of old engines (to be archived)

═════════════════════════════════════════════════════════════════════════════
DOCUMENTS CREATED (FOR YOUR REFERENCE)
═════════════════════════════════════════════════════════════════════════════

1. DEPENDENCY-AUDIT.md
   ├─ Lists every legacy file
   ├─ Shows what it currently does
   ├─ Explains what integration it needs
   ├─ Ranks by value & priority
   └─ Tells you which to tackle first

2. PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
   ├─ Complete implementation guide for dm-memory
   ├─ Shows adapter code (ready to use)
   ├─ Testing strategy
   ├─ Integration steps
   └─ Success criteria

3. LEGACY-CODE-AUDIT.md (from before)
   ├─ High-level overview
   ├─ What exists in archive/
   └─ Integration roadmap

4. INTEGRATION-ROADMAP.md (from before)
   ├─ Timeline for all phases
   ├─ What gets done when
   └─ Success metrics

═════════════════════════════════════════════════════════════════════════════
INTEGRATION ORDER (DO THESE IN SEQUENCE)
═════════════════════════════════════════════════════════════════════════════

PHASE 1: DM-MEMORY-SYSTEM
─────────────────────────────────────────────────────────────────────────
File: dm-memory-system.js (root level)
Adapter: src/adapters/dm-memory-adapter.js (NEW - you create this)
Status: READY TO IMPLEMENT
Effort: 4-6 hours

What it does:
  • Rule lookups (PHB, DMG)
  • Character abilities reference
  • Session event logging
  • Decision audit trail
  • NPC tracking

Why it's first:
  • ⭐⭐⭐⭐⭐ CRITICAL - DM's brain during play
  • Standalone (no dependencies on broken code)
  • Easy to test in isolation
  • Foundation for later phases

Next action: Follow PHASE-1-DM-MEMORY-ADAPTER-PLAN.md

───────────────────────────────────────────────────────────────────────────

PHASE 2: PARTY-SYSTEM
─────────────────────────────────────────────────────────────────────────
File: party-system.js (root level)
Adapter: src/adapters/party-system-adapter.js (NEW - you create this)
Status: PLANNED (after Phase 1 passes)
Effort: 6-8 hours

What it does:
  • Initiative rolling
  • Turn order management
  • HP/damage tracking
  • Party composition
  • Combat round management

Why it's second:
  • ⭐⭐⭐⭐ HIGH - Core to combat
  • Depends on Phase 1 (DM-memory for event logging)
  • Can't implement until Phase 1 event system works

Next action: Write PHASE-2-PARTY-ADAPTER-PLAN.md (similar structure)

───────────────────────────────────────────────────────────────────────────

PHASE 3: SPOTLIGHT-PACING-SCHEDULER
─────────────────────────────────────────────────────────────────────────
File: spotlight-pacing-scheduler.js (root level)
Status: PLANNED (after Phase 2 passes)
Effort: 2-3 hours

Action: Compare with src/legacy/systems/pillar-8-spotlight-scheduler.js
  • Are they the same system?
  • Merge best parts into one version
  • Delete the duplicate

Why it's third:
  • ⭐⭐⭐ MEDIUM - Duplicated functionality
  • Need to deduplicate before integrating anything else

───────────────────────────────────────────────────────────────────────────

PHASE 4+: SKILLS & GENERATORS
─────────────────────────────────────────────────────────────────────────
Files: skills/encounter-generator.js, skills/npc-manager/, etc.
Status: BACKLOG (after core 3 phases)
Effort: Varies per skill

These are nice-to-have, not essential path:
  • Encounter generation
  • Treasure generation
  • NPC management
  • Ambiance system
  • Etc.

Don't integrate until core 3 are solid.

───────────────────────────────────────────────────────────────────────────

ARCHIVE (Don't integrate - just move there):
─────────────────────────────────────────────────────────────────────────
Files: game-engine.js, session-runner.js, all -v1/-v2 files, etc.
Action: Move to archive/ once verified they're obsolete
Reason: Functionality is now in turn-pipeline + systems

═════════════════════════════════════════════════════════════════════════════
HOW TO IMPLEMENT EACH PHASE
═════════════════════════════════════════════════════════════════════════════

STEP 1: Read the old code
  • Read dm-memory-system.js completely
  • Understand what it does
  • Identify all public methods

STEP 2: Create an adapter
  • Create src/adapters/<system>-adapter.js
  • Wrap the old code (import it)
  • Add hooks to connect to eventBus/registries
  • Translate old API → new API

STEP 3: Export the adapter
  • Add to src/index.js
  • Now other code can import it

STEP 4: Wire into turn-pipeline or systems
  • Modify turn-pipeline.js or appropriate system
  • Pass adapter as parameter
  • Make it optional (fallback if not provided)

STEP 5: Write tests
  • Create test/adapters/<system>-adapter.test.js
  • Verify old code works through adapter
  • Verify new integrations work

STEP 6: Verify old code stays untouched
  • Don't modify dm-memory-system.js
  • Don't copy it into src/
  • Adapter imports it (old file stays where it is)

═════════════════════════════════════════════════════════════════════════════
EXAMPLE: What Phase 1 looks like when done
═════════════════════════════════════════════════════════════════════════════

Files created:
  ✅ src/adapters/dm-memory-adapter.js
  ✅ test/adapters/dm-memory-adapter.test.js
  ✅ PHASE-1-DM-MEMORY-ADAPTER-PLAN.md

Files modified:
  ✅ src/index.js (export DMMemoryAdapter)
  ✅ src/core/turn-pipeline.js (accept optional dmMemoryAdapter)

Files untouched:
  ✅ dm-memory-system.js (stays in root, unchanged)
  ✅ src/core/event-bus.js (stays same)
  ✅ src/core/registry.js (stays same)

Git log after Phase 1:
  • "feat(adapters): add dm-memory adapter to bridge legacy system"
  • "test(adapters): add dm-memory adapter tests"
  • "refactor(turn-pipeline): support optional dm-memory integration"

Result:
  • Old code still works (if called directly)
  • New code can use dm-memory through adapter
  • Events flow through eventBus
  • Rules populate registries
  • No code duplication
  • No breaking changes

═════════════════════════════════════════════════════════════════════════════
KEY RULES (DON'T BREAK THESE)
═════════════════════════════════════════════════════════════════════════════

1. ❌ Never copy old files into src/
   ✅ Instead: Create adapters in src/adapters/

2. ❌ Never modify old files in root
   ✅ Instead: Adapters import and wrap them

3. ❌ Never call old functions directly from new code
   ✅ Instead: Call through adapter

4. ❌ Never integrate multiple systems in one phase
   ✅ Instead: One system per phase, test before next

5. ❌ Never skip testing after integration
   ✅ Instead: Write tests for each adapter

6. ❌ Never leave old code polluting src/
   ✅ Instead: Move unused code to archive/

═════════════════════════════════════════════════════════════════════════════
READY TO START?
═════════════════════════════════════════════════════════════════════════════

Next action:
  1. Read PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
  2. Follow steps 1-4 to create the adapter
  3. Run tests to verify it works
  4. Commit to git
  5. Move to Phase 2 planning

═════════════════════════════════════════════════════════════════════════════
