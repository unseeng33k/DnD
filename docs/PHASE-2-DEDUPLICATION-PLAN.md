╔═══════════════════════════════════════════════════════════════════════════╗
║                 PHASE 2: DEDUPLICATION & MERGING PLAN                     ║
║                                                                           ║
║  STATUS: Analysis complete. 23 files to consolidate.                     ║
║  ISSUE: Import paths are broken (importing from ./ when files are in ../)║
║  GOAL: Create unified systems in src/legacy/systems/                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

CURRENT ANALYSIS
═════════════════════════════════════════════════════════════════════════════

FILES IDENTIFIED FOR CONSOLIDATION:
─────────────────────────────────────────────────────────────────────────────

ENGINES (17 files) - Organized adventure runners:
  ✓ grond-malice-adventure.js
  ✓ grond-malice-adventure-v2.js
  ✓ quest-engine-with-ambiance.js
  ✓ quest-framework-engine.js
  ✓ soul-orchestrator.js
  ✓ world-state-graph.js (DUPLICATES world-state-query-engine.js)
  ✓ world-state-query-engine.js (DUPLICATES world-state-graph.js)
  ✓ playtest-runner.js (+ playtest-narrative.js, playtest-party.js)
  ✓ adventure-base-class.js
  ✓ adventure-with-full-ambiance.js
  ✓ + 6 more specific adventure instances

UTILITIES (6 files) - Core systems:
  ✓ spotlight-pacing-scheduler.js (USED BY engines but in wrong location)
  ✓ mechanical-state-engine.js (USED BY engines but in wrong location)
  ✓ image-generator.js
  ✓ orchestrator-spotlight-integration.js
  ✓ clean-system-test.js (TEST FILE - can be archived)
  ✓ core-architecture-test.js (TEST FILE - can be archived)

═════════════════════════════════════════════════════════════════════════════
CRITICAL ISSUE: BROKEN IMPORTS
═════════════════════════════════════════════════════════════════════════════

PROBLEM:
  File: src/legacy/engines/grond-malice-adventure.js
  Line: import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';
  
  Issue: SpotlightPacingScheduler is in src/legacy/utilities/, not src/legacy/engines/
  Should be: import { SpotlightPacingScheduler } from '../utilities/spotlight-pacing-scheduler.js';

SCOPE: All 17 engine files have similar broken imports

═════════════════════════════════════════════════════════════════════════════
PHASE 2 EXECUTION PLAN
═════════════════════════════════════════════════════════════════════════════

STEP 1: FIX IMPORT PATHS (15 min)
─────────────────────────────────────────────────────────────────────────────
Update all engines to correctly import from ../utilities/:

For each file in src/legacy/engines/:
  OLD: import { X } from './X.js';
  NEW: import { X } from '../utilities/X.js';
  
Files to update:
  - grond-malice-adventure.js (imports spotlight-pacing-scheduler, mechanical-state-engine, world-state-graph)
  - quest-engine-with-ambiance.js (likely similar)
  - All other engines using utilities

STEP 2: CONSOLIDATE DUPLICATE WORLD-STATE SYSTEMS (20 min)
─────────────────────────────────────────────────────────────────────────────
Problem: Two nearly identical systems

Files:
  - src/legacy/engines/world-state-graph.js
  - src/legacy/engines/world-state-query-engine.js

Action:
  1. Compare both implementations
  2. Merge into single: src/legacy/systems/world-state-engine.js
  3. Update imports across all files
  4. Archive old duplicate files

STEP 3: CREATE UNIFIED CORE SYSTEMS (45 min)
─────────────────────────────────────────────────────────────────────────────
Consolidate redundant functionality into reusable systems:

src/legacy/systems/unified-combat-system.js
  ├─ Consolidate mechanical-state-engine.js functionality
  ├─ Unify all combat tracking across engines
  └─ Single source of truth for mechanics

src/legacy/systems/unified-spotlight-system.js
  ├─ Consolidate spotlight-pacing-scheduler.js
  ├─ Orchestrator-spotlight-integration.js
  └─ Unified turn management & spotlight tracking

src/legacy/systems/unified-world-state-system.js
  ├─ Merge world-state-graph.js + world-state-query-engine.js
  └─ Single world model for all adventures

src/legacy/systems/unified-quest-system.js
  ├─ Consolidate quest-framework-engine.js
  ├─ quest-engine-with-ambiance.js
  └─ Unified quest lifecycle

STEP 4: MOVE UTILITIES TO SYSTEMS (10 min)
─────────────────────────────────────────────────────────────────────────────
Move core systems from utilities/ to systems/:

  src/legacy/utilities/spotlight-pacing-scheduler.js
    → src/legacy/systems/spotlight-pacing-scheduler.js

  src/legacy/utilities/mechanical-state-engine.js
    → src/legacy/systems/mechanical-state-engine.js

  src/legacy/utilities/image-generator.js
    → src/legacy/systems/image-generator.js

  src/legacy/utilities/orchestrator-spotlight-integration.js
    → src/legacy/systems/orchestrator-integration.js

STEP 5: UPDATE ALL IMPORTS (30 min)
─────────────────────────────────────────────────────────────────────────────
For each engine file, update imports:

OLD PATTERN:
  import { SpotlightPacingScheduler } from '../utilities/spotlight-pacing-scheduler.js';
  import { MechanicalStateEngine } from '../utilities/mechanical-state-engine.js';

NEW PATTERN:
  import { SpotlightPacingScheduler } from '../systems/unified-spotlight-system.js';
  import { CombatSystem } from '../systems/unified-combat-system.js';

Mark all changes with:
  // PATH UPDATE: Consolidated import from utilities to unified systems

STEP 6: DEPRECATE DUPLICATES (5 min)
─────────────────────────────────────────────────────────────────────────────
Archive/mark as deprecated:

Files to move to src/legacy/archived/:
  - grond-malice-adventure.js (replaced by unified system)
  - world-state-query-engine.js (merged into unified-world-state-system.js)
  - quest-framework-engine.js (functionality in unified-quest-system.js)
  - clean-system-test.js (old test)
  - core-architecture-test.js (old test)

Add deprecation notice to top of each:
  /**
   * DEPRECATED - Phase 2
   * This functionality has been consolidated into:
   *   - src/legacy/systems/unified-XX-system.js
   * 
   * Use the unified system instead.
   */

═════════════════════════════════════════════════════════════════════════════
EXPECTED OUTCOME
═════════════════════════════════════════════════════════════════════════════

BEFORE Phase 2:
  /src/legacy/
    ├── engines/ (17 scattered adventure files with broken imports)
    ├── utilities/ (6 systems misplaced here)
    ├── systems/ (empty)
    └── modules/ (empty)

AFTER Phase 2:
  /src/legacy/
    ├── engines/ (5-7 clean adventure runners - playtest, grond-malice, quest, etc.)
    ├── utilities/ (helper functions, image generation)
    ├── systems/ (5 unified core systems)
    │   ├── unified-combat-system.js
    │   ├── unified-spotlight-system.js
    │   ├── unified-world-state-system.js
    │   ├── unified-quest-system.js
    │   └── image-generator.js
    ├── archived/ (deprecated/merged implementations)
    └── modules/ (ready for expansion)

BENEFITS:
  ✅ All imports work correctly
  ✅ No duplicate functionality
  ✅ Single source of truth for mechanics
  ✅ Engines can focus on narrative/adventures
  ✅ Systems are reusable across all adventures
  ✅ Clear separation of concerns
  ✅ Ready for Phase 3: Unified Nine Pillars Engine

═════════════════════════════════════════════════════════════════════════════
EXECUTION TIME: ~2 hours
RISK LEVEL: Low (no logic changes, just consolidation + import updates)
SUCCESS METRIC: All imports resolve + all tests pass

═════════════════════════════════════════════════════════════════════════════
