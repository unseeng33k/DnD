╔═══════════════════════════════════════════════════════════════════════════╗
║                  DND PROJECT: INTEGRATION AUDIT COMPLETE                 ║
║                                                                           ║
║  You have a clean architecture in src/.                                  ║
║  You have legacy code at root level + in skills/.                        ║
║  You want to integrate them deliberately, NOT auto-merge.                ║
║                                                                           ║
║  This folder contains your integration strategy.                         ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
START HERE
═════════════════════════════════════════════════════════════════════════════

📄 INTEGRATION-STRATEGY.md
   The master overview. Read this first.
   Explains the principle, your phase timeline, and key rules.

═════════════════════════════════════════════════════════════════════════════
THEN READ THESE IN ORDER
═════════════════════════════════════════════════════════════════════════════

1️⃣  DEPENDENCY-AUDIT.md
    Lists every legacy file
    Shows what it does
    Ranks by integration priority
    Tells you which to tackle first

2️⃣  PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
    Complete implementation guide for dm-memory (Phase 1)
    Shows adapter code (ready to implement)
    Testing strategy
    Success criteria

3️⃣  LEGACY-CODE-AUDIT.md
    High-level inventory of all legacy code
    What's in archive/
    How to use it

4️⃣  INTEGRATION-ROADMAP.md
    Timeline for all phases
    What gets done when
    Success metrics per phase

═════════════════════════════════════════════════════════════════════════════
THE STRATEGY IN 30 SECONDS
═════════════════════════════════════════════════════════════════════════════

PROBLEM:
  You have working legacy code (dm-memory, party-system, etc.)
  You have clean new architecture (src/)
  You want to use both without tangling them up

SOLUTION:
  Create ADAPTERS in src/adapters/
  Adapters WRAP old code (import it, don't copy it)
  Adapters TRANSLATE between old API and new API
  New code ONLY talks to adapters, not old code directly

PHASES:
  Phase 1: dm-memory adapter (4-6 hours)
  Phase 2: party-system adapter (6-8 hours)
  Phase 3: deduplication + cleanup (2-3 hours)
  Phase 4: skills & generators (backlog)

RESULT:
  Old code stays in place, untouched
  New code stays clean
  Everything works together
  No code duplication
  Easy to test

═════════════════════════════════════════════════════════════════════════════
WHAT EACH DOCUMENT DOES
═════════════════════════════════════════════════════════════════════════════

📄 INTEGRATION-STRATEGY.md
   Status: READ FIRST
   Length: 250 lines
   Purpose: Understand the overall approach
   Action: Nothing - just read & understand
   Time: 10 minutes

📄 DEPENDENCY-AUDIT.md
   Status: Read after strategy
   Length: 300 lines
   Purpose: Know which files to integrate & in what order
   Action: Note the priority ranking
   Time: 15 minutes

📄 PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
   Status: Implementation guide for Phase 1
   Length: 400 lines
   Purpose: Step-by-step adapter creation
   Action: Follow the 4 steps to create src/adapters/dm-memory-adapter.js
   Time: 4-6 hours (implementation + testing)

📄 LEGACY-CODE-AUDIT.md
   Status: Reference during integration
   Length: 300 lines
   Purpose: Inventory of all legacy files
   Action: Consult when planning Phase 2, 3, etc.
   Time: Refer as needed

📄 INTEGRATION-ROADMAP.md
   Status: Timeline reference
   Length: 200 lines
   Purpose: Track progress across all phases
   Action: Update after each phase completes
   Time: 5 minutes per phase

═════════════════════════════════════════════════════════════════════════════
YOUR NEXT 3 ACTIONS
═════════════════════════════════════════════════════════════════════════════

1️⃣  READ THIS FOLDER
   □ Read INTEGRATION-STRATEGY.md (the master doc)
   □ Skim DEPENDENCY-AUDIT.md (understand priorities)
   □ Read PHASE-1-DM-MEMORY-ADAPTER-PLAN.md (implementation)

2️⃣  IMPLEMENT PHASE 1
   □ Create src/adapters/dm-memory-adapter.js (copy code from Plan doc)
   □ Create test/adapters/dm-memory-adapter.test.js
   □ Run tests to verify
   □ Update src/index.js and turn-pipeline.js
   □ Test end-to-end

3️⃣  COMMIT & PLAN PHASE 2
   □ Commit to git: "feat(adapters): add dm-memory adapter"
   □ Write PHASE-2-PARTY-ADAPTER-PLAN.md (using same template)
   □ Repeat for Phase 2

═════════════════════════════════════════════════════════════════════════════
KEY FILES MENTIONED
═════════════════════════════════════════════════════════════════════════════

LEGACY CODE (stays in place, don't modify):
  • dm-memory-system.js (root level)
  • party-system.js (root level)
  • spotlight-pacing-scheduler.js (root level)
  • skills/combat-tracker.js
  • skills/encounter-generator.js
  • skills/npc-manager/ (directory)

NEW ADAPTERS (create these):
  • src/adapters/dm-memory-adapter.js ← START HERE
  • src/adapters/party-system-adapter.js ← Phase 2
  • (more as needed)

CLEAN ARCHITECTURE (don't modify):
  • src/core/event-bus.js
  • src/core/turn-pipeline.js
  • src/core/registry.js
  • src/systems/* (all of them)
  • src/registries/* (all of them)

═════════════════════════════════════════════════════════════════════════════
QUESTIONS?
═════════════════════════════════════════════════════════════════════════════

Q: Why not just move the legacy code into src/?
A: Because it's not designed for the new architecture.
   Adapters are the bridge. It's cleaner.

Q: What if legacy code is broken?
A: Fix it in-place first. Adapters just wrap it.
   If it's completely dead, archive it instead.

Q: Can I integrate multiple systems at once?
A: No. One system per phase.
   Test each phase before moving to the next.
   This prevents accumulating bugs.

Q: What if the adapter is too complex?
A: That might mean the old code has too many dependencies.
   Simplify the old code or break it into smaller pieces.
   Or reconsider if it's worth integrating.

Q: Do I have to follow this exact order?
A: No, but it's recommended.
   Phase 1 (dm-memory) is fundamental.
   Phase 2 (party-system) depends on Phase 1.
   Phase 3+ are flexible.

═════════════════════════════════════════════════════════════════════════════
SUCCESS LOOKS LIKE
═════════════════════════════════════════════════════════════════════════════

After Phase 1:
  ✅ src/adapters/dm-memory-adapter.js exists
  ✅ Tests pass
  ✅ dm-memory-system.js unchanged
  ✅ Turn-pipeline emits events to DM-memory
  ✅ Rules populate from DM-memory

After Phase 2:
  ✅ src/adapters/party-system-adapter.js exists
  ✅ Tests pass
  ✅ party-system.js unchanged
  ✅ Initiative & turn order integrated
  ✅ Damage & healing flow through mechanics-system

After Phase 3:
  ✅ spotlight-pacing-scheduler deduplicated (or removed)
  ✅ No dead code in root
  ✅ All legacy code either integrated or archived
  ✅ src/ is clean and cohesive
  ✅ Old code isolated but accessible

═════════════════════════════════════════════════════════════════════════════
GET STARTED
═════════════════════════════════════════════════════════════════════════════

Next step:
  1. Open INTEGRATION-STRATEGY.md
  2. Read it carefully
  3. Move to DEPENDENCY-AUDIT.md
  4. When you're ready to implement Phase 1:
     Open PHASE-1-DM-MEMORY-ADAPTER-PLAN.md
  5. Follow the steps

═════════════════════════════════════════════════════════════════════════════
