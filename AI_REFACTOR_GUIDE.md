╔═══════════════════════════════════════════════════════════════════════════╗
║                    AI REFACTOR GUIDE FOR DND PROJECT                      ║
║                                                                           ║
║  Rules that Claude (or any AI assistant) MUST follow when refactoring    ║
║  the DND architecture. These protect code integrity during reorganization.║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
CORE PRINCIPLE
═════════════════════════════════════════════════════════════════════════════

Never delete code during reorganization. Move unused/legacy code into /archive
or /legacy-code/ instead. This preserves history and allows safe rollback if
needed.

═════════════════════════════════════════════════════════════════════════════
REFACTOR PHASES
═════════════════════════════════════════════════════════════════════════════

PHASE 1: STRUCTURAL REORGANIZATION (Changes Only Allowed in Phase 1)
─────────────────────────────────────────────────────────────────────

Phase 1 refactors may ONLY do the following:
  ✓ Move files to new locations
  ✓ Update import/export statements in moved files
  ✓ Adjust re-exports to match new paths
  ✓ Rename files for clarity

Phase 1 refactors may NOT do:
  ✗ Change function signatures or behavior
  ✗ Rename functions or classes
  ✗ Merge or split modules
  ✗ Add new functionality
  ✗ Delete code

PHASE 2+: BEHAVIORAL CHANGES (Always in Separate Phases)
─────────────────────────────────────────────────────────

All behavioral changes (refactoring, optimization, new features) must happen
in explicitly labeled, separate phases AFTER structural reorganization.

Example: "PHASE 2: Optimize TurnPipeline event handling"

═════════════════════════════════════════════════════════════════════════════
REFACTOR WORKFLOW (Required for All Proposals)
═════════════════════════════════════════════════════════════════════════════

Before making ANY changes, follow this exact workflow:

STEP 1: Propose File Mapping
─────────────────────────────
Show old → new structure for ALL affected files.

Example:
  Old → New Mapping:
  dm-memory-system.js → legacy-code/integrated/dm-memory-system.js
  src/index.js → src/index.js (no change)
  src/core/turn-pipeline.js → src/core/turn-pipeline.js (no change)

STEP 2: List Import Updates Needed
──────────────────────────────────
List EVERY file that needs import path changes.

Example:
  Files needing import updates:
  • src/index.js (updates export path)
  • src/core/turn-pipeline.js (if it imports dm-memory-system)
  • test/adapters/dm-memory-adapter.test.js (if it imports dm-memory-system)

STEP 3: Show Updated File Contents
───────────────────────────────────
Only THEN show the actual code changes. Keep changes minimal:
- Old import → New import
- No other modifications
- Preserve function signatures exactly

Example:
  OLD: import { DMMemory } from '../dm-memory-system.js';
  NEW: import { DMMemory } from '../../legacy-code/integrated/dm-memory-system.js';

═════════════════════════════════════════════════════════════════════════════
ENGINE CORE STRUCTURE (DO NOT SPLIT OR REORGANIZE)
═════════════════════════════════════════════════════════════════════════════

The engine core is the heart of the system. It has a defined structure that
all other code depends on. DO NOT reorganize these directories without
explicit authorization.

  src/core/
    • event-bus.js - Event-driven communication hub
    • registry.js - Central data registry
    • effect-runtime.js - Effect processing engine
    • turn-pipeline.js - Main orchestrator
    ↓ (This is the ENGINE CORE - stable, protected)

  src/systems/
    • ambiance-system.js
    • mechanic-system.js
    • quest-system.js
    • world-system.js
    • ui-system.js
    ↓ (Game systems that call into core)

  src/effects/
  src/registries/
  src/adapters/
    ↓ (Support layers - can be reorganized if core path stays stable)

═════════════════════════════════════════════════════════════════════════════
AGENT/SKILL ARCHITECTURE
═════════════════════════════════════════════════════════════════════════════

Agents, skills, and experiments must CALL INTO the engine core.
They must NOT implement their own game logic.

WRONG:
  src/agents/my-agent/game-engine.js  ← Duplicate game logic!
  src/agents/my-agent/effect-handler.js ← Rewriting effects!

RIGHT:
  src/agents/my-agent/index.js
    ↓ imports from src/core/
    ↓ calls TurnPipeline.execute()
    ↓ calls eventBus.emit()
    ↓ No local game logic

═════════════════════════════════════════════════════════════════════════════
SAFETY CHECKLIST (For Every Refactor)
═════════════════════════════════════════════════════════════════════════════

Before proceeding with any refactor, verify:

  □ No code is being deleted (only moved)
  □ File mapping is complete and proposed
  □ Import updates are listed for all affected files
  □ Function signatures remain identical
  □ No behavioral changes in Phase 1
  □ No new functionality added
  □ Test imports are updated correctly
  □ Legacy code is moved to /legacy-code/ or /archive/
  □ Engine core structure remains stable
  □ All exports match new file locations

═════════════════════════════════════════════════════════════════════════════
EXAMPLES OF SAFE REFACTORS
═════════════════════════════════════════════════════════════════════════════

✓ SAFE: Moving dm-memory-system.js to legacy-code/integrated/
✓ SAFE: Updating imports in src/index.js to match new paths
✓ SAFE: Moving old engines to /archive/
✓ SAFE: Creating /docs/ and moving .md files
✓ SAFE: Renaming /legacy-code/archive/ to something clearer

✗ UNSAFE: Deleting spotlight-pacing-scheduler.js without archiving
✗ UNSAFE: Changing TurnPipeline.execute() signature
✗ UNSAFE: Moving core/ out of src/
✗ UNSAFE: Splitting effect-runtime.js into multiple files
✗ UNSAFE: Adding new event types in Phase 1

═════════════════════════════════════════════════════════════════════════════
WHAT TO DO IF SOMETHING BREAKS
═════════════════════════════════════════════════════════════════════════════

If a refactor causes issues:

1. Identify which files have broken imports
   - Look for "Cannot find module" errors
   - Check that old → new mapping matches actual code

2. Verify function signatures haven't changed
   - Compare old file to new file
   - Ensure no parameters were removed

3. Check that all exports are correct
   - src/index.js should export from new paths
   - No circular imports

4. If unfixable in Phase 1, mark as TODO for Phase 2
   - Document what needs to change
   - Don't force the change in this phase

═════════════════════════════════════════════════════════════════════════════
QUESTIONS FOR CLAUDE
═════════════════════════════════════════════════════════════════════════════

If you're proposing a refactor and aren't sure if it's safe, ask:

1. "Is this moving code or changing its behavior?"
   → Moving = Phase 1 ✓
   → Changing = Phase 2 ✗

2. "Will this change any function signatures?"
   → No = Phase 1 ✓
   → Yes = Phase 2 ✗

3. "Does this touch the engine core (src/core/)?
   → Only path updates = Phase 1 ✓
   → Any logic changes = Phase 2 ✗

═════════════════════════════════════════════════════════════════════════════
SUMMARY
═════════════════════════════════════════════════════════════════════════════

Phase 1 Refactors:
  • Move files (no behavior changes)
  • Update imports only
  • Preserve all function signatures
  • Keep engine core stable
  • Move old code to archive (don't delete)

Phase 2+ Refactors:
  • Optimize behavior
  • Change signatures if needed
  • Add new features
  • Merge/split modules
  • Always label phase explicitly

This protects the codebase integrity while allowing safe, controlled evolution.
