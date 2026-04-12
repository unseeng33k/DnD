╔═══════════════════════════════════════════════════════════════════════════╗
║                      INTEGRATION AUDIT CHECKLIST                         ║
║                                                                           ║
║  What was done. What to do next. How to proceed.                         ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
✅ COMPLETED IN THIS SESSION
═════════════════════════════════════════════════════════════════════════════

Documentation Created:
  ✅ INTEGRATION-AUDIT-README.md
     Master overview - start here
  
  ✅ INTEGRATION-STRATEGY.md
     The principle and timeline
  
  ✅ DEPENDENCY-AUDIT.md
     What legacy code exists, what it does, priorities
  
  ✅ PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
     Complete implementation guide with code examples
  
  ✅ INTEGRATION-AUDIT-STATUS.txt
     This file - current progress

Audit Completed:
  ✅ Identified legacy files (dm-memory, party-system, skills, etc.)
  ✅ Ranked by priority (dm-memory first, party-system second)
  ✅ Determined integration approach (adapters, not auto-merge)
  ✅ Created Phase 1 implementation plan (ready to code)
  ✅ Documented all 4 phases

═════════════════════════════════════════════════════════════════════════════
📋 PHASE 1: DM-MEMORY ADAPTER (NEXT)
═════════════════════════════════════════════════════════════════════════════

Status: READY TO IMPLEMENT
Effort: 4-6 hours

To implement Phase 1:
  □ Read PHASE-1-DM-MEMORY-ADAPTER-PLAN.md completely
  □ Create src/adapters/ directory
  □ Create src/adapters/dm-memory-adapter.js (copy code from plan)
  □ Create test/adapters/dm-memory-adapter.test.js (copy tests)
  □ Update src/index.js to export DMMemoryAdapter
  □ Update src/core/turn-pipeline.js to accept optional adapter
  □ Run tests: npm test -- test/adapters/dm-memory-adapter.test.js
  □ Verify all tests pass
  □ Commit to git: "feat(adapters): add dm-memory adapter"
  □ Write PHASE-1-IMPLEMENTATION-REPORT.md when done

═════════════════════════════════════════════════════════════════════════════
📋 PHASE 2: PARTY-SYSTEM ADAPTER (AFTER PHASE 1)
═════════════════════════════════════════════════════════════════════════════

Status: PLANNED
Effort: 6-8 hours

To implement Phase 2:
  □ Write PHASE-2-PARTY-ADAPTER-PLAN.md (use same template as Phase 1)
  □ Create src/adapters/party-system-adapter.js
  □ Create test/adapters/party-system-adapter.test.js
  □ Update src/core/turn-pipeline.js to use party adapter
  □ Run tests
  □ Verify all tests pass
  □ Commit to git: "feat(adapters): add party-system adapter"

═════════════════════════════════════════════════════════════════════════════
📋 PHASE 3: DEDUPLICATION (AFTER PHASE 2)
═════════════════════════════════════════════════════════════════════════════

Status: PLANNED
Effort: 2-3 hours

To implement Phase 3:
  □ Compare spotlight-pacing-scheduler.js (root) with pillar-8 (src/legacy)
  □ Determine which is more complete
  □ Merge best parts into one version
  □ Delete the duplicate
  □ Run tests to verify no breakage
  □ Commit to git: "refactor: deduplicate spotlight scheduler"

═════════════════════════════════════════════════════════════════════════════
📋 PHASE 4: SKILLS & GENERATORS (BACKLOG)
═════════════════════════════════════════════════════════════════════════════

Status: BACKLOG
Candidates:
  • skills/encounter-generator.js
  • skills/npc-manager/
  • skills/treasure-generator.js
  • Others (inspect first)

To handle Phase 4:
  □ Inspect each skill (read the code)
  □ Determine if it's worth integrating
  □ If yes: create adapter
  □ If no: move to archive/
  □ Do ONE skill at a time

═════════════════════════════════════════════════════════════════════════════
📋 CLEANUP: ARCHIVE DEAD CODE (ONGOING)
═════════════════════════════════════════════════════════════════════════════

Files to move to archive/:
  □ game-engine.js (old - replaced by turn-pipeline)
  □ session-runner.js (old - replaced by turn-pipeline)
  □ game-master-orchestrator*.js (old - dead)
  □ All other -v1, -v2, old engines
  □ Other dead skills (after inspection)

Process:
  1. Move to archive/
  2. Don't delete
  3. Document why in INTEGRATION-AUDIT.md

═════════════════════════════════════════════════════════════════════════════
📊 PROGRESS TRACKING
═════════════════════════════════════════════════════════════════════════════

Current Status:
  Planning: ✅ COMPLETE
    • All legacy code audited
    • All phases documented
    • All implementation plans created
  
  Phase 1:  ⏳ READY TO START
    • Documentation complete
    • Implementation plan ready
    • Code examples provided
  
  Phase 2:  🔲 PLANNED
  Phase 3:  🔲 PLANNED
  Phase 4:  🔲 PLANNED

═════════════════════════════════════════════════════════════════════════════
🎯 KEY SUCCESS METRICS
═════════════════════════════════════════════════════════════════════════════

After ALL phases complete:

Code Quality:
  ✅ No legacy code in src/ (except adapters)
  ✅ All new code follows clean architecture patterns
  ✅ All adapters have tests (>80% coverage)
  ✅ No code duplication between old and new
  ✅ All imports use adapters, not old files directly

Functionality:
  ✅ dm-memory events flow through eventBus
  ✅ Rules populate from dm-memory into registry
  ✅ Initiative rolls use party-system through adapter
  ✅ All combat mechanics work
  ✅ NPC system works (when integrated)

Cleanliness:
  ✅ Root directory only has: src/, test/, package.json, .git, config
  ✅ All dead code in archive/
  ✅ No -v1, -v2, -old versions at root
  ✅ Clear separation: old (archived) ↔ adapters (src) ↔ clean (src)

═════════════════════════════════════════════════════════════════════════════
📌 KEY DOCUMENTS TO READ (IN ORDER)
═════════════════════════════════════════════════════════════════════════════

1. INTEGRATION-AUDIT-README.md (5 min)
   Overview of all documents

2. INTEGRATION-STRATEGY.md (10 min)
   The approach and principles

3. DEPENDENCY-AUDIT.md (15 min)
   What legacy code exists

4. PHASE-1-DM-MEMORY-ADAPTER-PLAN.md (read fully before implementing)
   Step-by-step implementation guide

═════════════════════════════════════════════════════════════════════════════
⚡ QUICK START (If you just want to implement Phase 1)
═════════════════════════════════════════════════════════════════════════════

1. Read: PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
2. Create: src/adapters/ directory
3. Copy: adapter code from plan into dm-memory-adapter.js
4. Copy: test code into test/adapters/dm-memory-adapter.test.js
5. Update: src/index.js and turn-pipeline.js (as described)
6. Run: npm test
7. Commit: git commit -m "feat(adapters): add dm-memory adapter"
8. Document: Write PHASE-1-IMPLEMENTATION-REPORT.md

═════════════════════════════════════════════════════════════════════════════
❓ COMMON QUESTIONS
═════════════════════════════════════════════════════════════════════════════

Q: Do I have to do all 4 phases?
A: No. Phase 1 (dm-memory) is critical.
   Phase 2 (party-system) is important.
   Phases 3-4 are nice-to-have.

Q: Can I skip Phase 1?
A: Not recommended. It's the foundation.
   Phase 2 depends on Phase 1's event logging.

Q: What if Phase 1 doesn't work?
A: Debug using the tests.
   The tests are comprehensive - if they pass, it works.
   If they fail, you know exactly what's broken.

Q: How long will this take total?
A: Phase 1: 4-6 hours
   Phase 2: 6-8 hours
   Phase 3: 2-3 hours
   Phase 4: varies (probably 10-20 hours total)
   Total: 25-40 hours for everything

Q: Should I integrate ALL skills?
A: No. Only useful ones.
   Archive the rest.
   Default to "not integrating" unless it's valuable.

═════════════════════════════════════════════════════════════════════════════
✅ READY TO BEGIN PHASE 1?
═════════════════════════════════════════════════════════════════════════════

Steps:
  1. Open PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
  2. Read it completely
  3. Follow the implementation steps
  4. Run tests when done
  5. Report back success

═════════════════════════════════════════════════════════════════════════════
