╔═══════════════════════════════════════════════════════════════════════════╗
║              DND PROJECT: LEGACY INTEGRATION ROADMAP                      ║
║                                                                           ║
║  A phased approach to deliberate integration of legacy code into the     ║
║  clean architecture. One system at a time. Test after each.              ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
PROJECT STATE
═════════════════════════════════════════════════════════════════════════════

CLEAN ARCHITECTURE (src/):
  ✅ Core: event-bus, turn-pipeline, registry, effect-runtime
  ✅ Systems: quest, ambiance, mechanic, world, ui
  ✅ Registries: intent, rule, ambiance, effect, world
  ✅ Effects: mechanical, ambiance, narrative, world-state
  ✅ Entry point: src/index.js

LEGACY CODE (root level + archive/):
  ❌ NOT YET INTEGRATED - dm-memory-system.js
  ❌ NOT YET INTEGRATED - party-system.js
  ❌ NOT YET INTEGRATED - various skills/
  ⓘ  QUARANTINED IN archive/ - 30+ old files

═════════════════════════════════════════════════════════════════════════════
PHASE 1: DM-MEMORY-SYSTEM INTEGRATION
═════════════════════════════════════════════════════════════════════════════

WHAT: Integrate rule lookups, character database, session event logging

FILES INVOLVED:
  • dm-memory-system.js (old code in archive/)
  • src/systems/dm-memory-adapter.js (NEW - to create)
  • src/core/turn-pipeline.js (UPDATE - add event logging)
  • src/registries/rule-registry.js (UPDATE - populate from DMMemory)
  • src/index.js (UPDATE - initialize DMMemory)

DELIVERABLES:
  ✓ Create DMMemoryAdapter that wraps RuleDatabase, CharacterDatabase, etc.
  ✓ Wire DM-memory to eventBus (listens for all turn events)
  ✓ Populate rule-registry from DM-memory at startup
  ✓ Add session event logging to turn-pipeline
  ✓ Write integration tests
  ✓ Document: PHASE-1-DM-MEMORY-INTEGRATION.md

EFFORT: 4-6 hours (implementation + testing)

NEXT TRIGGER: After PHASE 1 tests pass and session logging works

═════════════════════════════════════════════════════════════════════════════
PHASE 2: PARTY-SYSTEM INTEGRATION
═════════════════════════════════════════════════════════════════════════════

WHAT: Integrate initiative, turn order, combat tracking, party management

FILES INVOLVED:
  • party-system.js (old code in archive/)
  • src/legacy/systems/pillar-8-spotlight-scheduler.js (exists, needs update)
  • src/systems/mechanical-system.js (UPDATE - damage/healing effects)
  • src/core/turn-pipeline.js (UPDATE - use spotlight scheduler)

DELIVERABLES:
  ✓ Update spotlight-scheduler to use party initiative system
  ✓ Wrap party-system in adapter (src/systems/party-adapter.js)
  ✓ Integrate combat damage as mechanical-effects
  ✓ Wire turn order to turn-pipeline
  ✓ Write integration tests
  ✓ Document: PHASE-2-PARTY-INTEGRATION.md

EFFORT: 6-8 hours (implementation + testing)

TRIGGER: After PHASE 1 + tests pass

═════════════════════════════════════════════════════════════════════════════
PHASE 3: SKILLS & GENERATORS
═════════════════════════════════════════════════════════════════════════════

WHAT: Integrate useful skills (encounter gen, treasure gen, NPC system)

CANDIDATES:
  • skills/encounter-generator.js → encounter-system.js
  • skills/treasure-generator.js → treasure-system.js
  • skills/npc-manager/ → npc-system.js
  • skills/ambiance-agent/ → integrate into ambiance-system

DELIVERABLES:
  ✓ Audit each skill to understand dependencies
  ✓ Create adapters for high-value skills
  ✓ Register with appropriate systems/registries
  ✓ Write integration tests
  ✓ Document: PHASE-3-SKILLS-INTEGRATION.md

EFFORT: 8-12 hours (per skill integrated)

TRIGGER: After PHASE 2 + tests pass

═════════════════════════════════════════════════════════════════════════════
PHASE 4: CLEANUP & ARCHIVAL
═════════════════════════════════════════════════════════════════════════════

WHAT: Identify dead code, delete unneeded files, clean up root directory

FILES TO CLEAN:
  • Move all legacy files to archive/ (only src/ + tests at root)
  • Delete truly dead files (marked in INTEGRATION-STATUS.md)
  • Update .gitignore if needed

EFFORT: 2-3 hours

TRIGGER: After PHASES 1-3 complete

═════════════════════════════════════════════════════════════════════════════
CURRENT NEXT STEPS
═════════════════════════════════════════════════════════════════════════════

IMMEDIATE (This session):
  ☐ Read LEGACY-CODE-AUDIT.md
  ☐ Read PHASE-1-DM-MEMORY-INTEGRATION.md
  ☐ Review dm-memory-system.js (in archive/)
  ☐ Start implementation of DMMemoryAdapter

DAY 1 (After reading):
  ☐ Create src/systems/dm-memory-adapter.js
  ☐ Update src/core/turn-pipeline.js for event logging
  ☐ Update src/registries/rule-registry.js to use DMMemory
  ☐ Update src/index.js initialization

DAY 2 (Testing & validation):
  ☐ Write integration tests
  ☐ Test with sample session log
  ☐ Verify event timeline works
  ☐ Verify rule lookups work
  ☐ Fix any issues

DAY 3 (Documentation & sign-off):
  ☐ Document any issues found
  ☐ Update this roadmap
  ☐ Commit changes to git
  ☐ Plan PHASE 2

═════════════════════════════════════════════════════════════════════════════
SUCCESS CRITERIA
═════════════════════════════════════════════════════════════════════════════

PHASE 1 SUCCESS:
  ✓ DM-memory events are logged when turn-pipeline executes
  ✓ Rules are accessible via rule-registry.get('rule_name')
  ✓ Character abilities are queryable
  ✓ Decisions logged include consistency checks
  ✓ Tests verify all above functionality

PHASE 2 SUCCESS:
  ✓ Initiative is rolled using party system
  ✓ Turn order drives turn-pipeline execution
  ✓ Combat damage is tracked via mechanical-effects
  ✓ Tests verify all above functionality

PHASE 3 SUCCESS:
  ✓ At least 3 skills successfully integrated into systems
  ✓ Skills register with appropriate systems/registries
  ✓ Tests verify all above functionality

PHASE 4 SUCCESS:
  ✓ Root directory only has: src/, tests/, package.json, README, .git, .env
  ✓ All legacy code in archive/ or deleted
  ✓ .gitignore updated

═════════════════════════════════════════════════════════════════════════════
KEY PRINCIPLES (Do NOT forget these)
═════════════════════════════════════════════════════════════════════════════

1. DELIBERATE, NOT AUTO-MERGE
   Don't copy files directly into src/
   Create adapters that bridge old & new
   
2. ONE SYSTEM AT A TIME
   Don't integrate multiple things in one pass
   Each system gets its own document & phase
   
3. TEST AFTER EACH PHASE
   Can't move to next phase until tests pass
   Prevents accumulation of bugs
   
4. DOCUMENT EVERYTHING
   Each phase gets an integration document
   Explains what changed and why
   
5. ARCHIVE FIRST
   Move legacy code to archive/ before integration
   Don't let old code pollute src/
   Only move code back in after adapter is built

═════════════════════════════════════════════════════════════════════════════
CURRENT DOCUMENTATION FILES
═════════════════════════════════════════════════════════════════════════════

📄 LEGACY-CODE-AUDIT.md
   Complete inventory of legacy code
   What exists, what it does, integration priority

📄 PHASE-1-DM-MEMORY-INTEGRATION.md  
   Detailed plan for Phase 1
   Step-by-step code changes
   Before/after examples

📄 archive/README.md
   Explains archive/ directory
   How to use it during integration

📄 INTEGRATION-ROADMAP.md (this file)
   High-level overview of all phases
   Timeline and success criteria

═════════════════════════════════════════════════════════════════════════════
