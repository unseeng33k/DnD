╔═══════════════════════════════════════════════════════════════════════════╗
║                    FILE REORGANIZATION MOVE PLAN                          ║
║                                                                           ║
║  Detailed plan for moving 70+ .md files and legacy .js files             ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
PHASE 1: MOVE ALL .md FILES TO /docs/
═════════════════════════════════════════════════════════════════════════════

THESE .md FILES SHOULD MOVE TO /docs/:

Documentation Files (70+ files):
  • All PHASE-*.md files (20+ files)
  • All PILLAR-*.md files (8 files)
  • All *-COMPLETE.md files (20+ files)
  • AMBIANCE-IMAGE-INTEGRATION.md
  • ARCHITECTURE-NINE-PILLARS.md
  • BACKEND-ARCHITECTURE-GUIDE.md
  • BACKEND-BUILD-COMPLETE.md
  • BUILD-SUMMARY.md
  • CINEMATIC-AMBIANCE-INTEGRATION.md
  • COMPLETE-BACKEND-IMPLEMENTATION.md
  • COMPLETE-SYSTEM-FINAL.md
  • COMPLETE-SYSTEM-INTEGRATION.md
  • COMPLETE-SYSTEM-INVENTORY.md
  • DEPENDENCY-AUDIT.md
  • DM-MEMORY-COMPLETE.md
  • DM-MEMORY-QUICK-START.md
  • DM_DIRECTOR.md
  • DM_PERSONA.md
  • EIGHT-PILLARS-COMPLETE.md
  • FINAL-BUILD-STATUS.md
  • FINAL-BUILD-SUMMARY.md
  • FINAL-DELIVERY-SUMMARY.md
  • FINAL-SYSTEM-BUILD-PLAN.md
  • FIVE-PILLARS-COMPLETE.md
  • FOUR-PILLARS-COMPLETE.md
  • HEARTBEAT.md
  • IMAGE-HANDLER-GUIDE.md
  • IMAGE-HANDLER-README.md
  • INTEGRATION-AUDIT-README.md
  • INTEGRATION-CHECKLIST.md
  • INTEGRATION-ROADMAP.md
  • INTEGRATION-STRATEGY.md
  • LEGACY-CODE-AUDIT.md
  • LEVEL-3-COMPLETE.md
  • LEARNING.md
  • LOOT_TRACKING.md
  • MODULE-SYSTEM-GUIDE.md
  • MUSIC.md
  • NINE-PILLARS-AMBIANCE-STATUS.md
  • OPENCLAW-EXECUTION-SUMMARY.md
  • OPTION-B-COMPLETE.md
  • ORCHESTRATOR-GUIDE.md
  • PARTY_SYSTEM.md
  • PHASE-*.md (all variations)
  • PILLAR-*.md (all pillars)
  • PLAY-TSR-MODULES.md
  • QUICK-REFERENCE.md
  • QUICK-START-EXAMPLES.md
  • QUICK-START.md
  • SESSION-SUMMARY.md
  • SEVEN-PILLARS-COMPLETE.md
  • SIX-PILLARS-COMPLETE.md
  • SOUL.md (already in docs, verify)
  • SYSTEM-COMPLETE.md
  • SYSTEM-FINAL-SUMMARY.md
  • THE-HEARTBEAT-COMPLETE.md
  • THREE-PILLARS-COMPLETE.md
  • TWO-PILLARS-COMPLETE.md
  • UNIFIED-SYSTEM-COMPLETE.md
  • VERIFICATION-COMPLETE.md
  • VISUAL.md

═════════════════════════════════════════════════════════════════════════════
PHASE 2: MOVE LEGACY .js FILES TO /legacy-code/
═════════════════════════════════════════════════════════════════════════════

FILES TO MOVE TO /legacy-code/integrated/ (Already wrapped by adapters):
  • dm-memory-system.js → /legacy-code/integrated/
  • party-system.js → /legacy-code/integrated/

FILES TO MOVE TO /legacy-code/candidates/ (Need Phase 3-5 adapters):
  • dice.js
  • spell-system.js
  • skill-system.js
  • inventory-system.js
  • character-creator.js
  • experience-leveling-system.js
  • npc-relationship-network.js
  • trap-puzzle-system.js
  • adnd-rule-engine.js
  • mechanical-state-engine.js
  • world-state-graph.js
  • persistent-world-state-engine.js
  • narrative-legibility-engine.js
  • rule-legibility-engine.js
  • state-legibility-engine.js
  • odds-communication-system.js
  • memory-surfacing-engine.js
  • agency-respect-engine.js
  • outcome-swingyness-manager.js
  • choice-architecture-engine.js
  • intent-parser.js
  • logger.js
  • item.js
  • inventory.js
  • scenes.js
  • module-builder.js
  • adventure-module-system.js
  • pdf-backed-module-system.js
  • pdf-module-reader.js
  • complete-module-extractor.js
  • extract-all-modules.js
  • play-module.js

FILES TO MOVE TO /legacy-code/archive/ (Old/experimental, don't use):
  • game-engine.js (old)
  • game-master-orchestrator.js (old)
  • game-master-orchestrator-v2.js (old)
  • unified-dnd-engine.js (old)
  • integrated-dnd-system.js (old)
  • integrated-cinematic-ambiance.js (old)
  • cinematic-engine.js (old)
  • fiction-first-orchestrator.js (old)
  • session-runner.js (old)
  • session-runner-enhanced.js (old)
  • pre-session-prep.js (old)
  • session-prep.js (old)
  • pregame-check.js (old)
  • command-center.js (old)
  • onboard.js (old)
  • ai-dungeon-master.js (old)
  • the-heartbeat-engine.js (old)
  • roll-arbitration-engine.js (old)
  • stakes-resolution-engine.js (old)
  • uncertainty-pacing-engine.js (old)
  • orchestrator-spotlight-integration.js (old)
  • cognitive-load-router.js (old)
  • session-ambiance-orchestrator.js (old)
  • party_manager.js (old version, use party-system.js)
  • party-manager.js (duplicate)
  • spotlight-pacing-scheduler.js (DUPLICATE - pillar-8 exists in src/)
  • spotlight-tracking-engine.js (old)
  • learn.js (experimental)
  • enhance.js (experimental)
  • pregen.js (experimental)
  • start-session.js (old)
  • create-adnd1e.js (old)
  • create-character.js (old)
  • create-module.js (old)
  • simple-dnd.js (old)
  • campaign-manager.js (experimental)
  • example-campaign.js (old)
  • ascii-map-generator.js (old)
  • music.js (old)
  • playlist.js (old)
  • cli-image-display.js (old)
  • image-handler.js (old)
  • dalle-images.js (old)
  • gemini-images.js (old)
  • dnd-images-cli.js (old)
  • download-images.js (old)
  • test-images.js (old)
  • diagnose-images.js (old)
  • dm-reference-guide.js (old)
  • visual.js (old)
  • world-state-updater.js (old)
  • world-state-query-engine.js (old)
  • character-personality.js (old)
  • kill_process.js (if present - system tool)

═════════════════════════════════════════════════════════════════════════════
KEEP AT ROOT LEVEL (Do NOT move these)
═════════════════════════════════════════════════════════════════════════════

Configuration & Core:
  • package.json
  • dnd-config.json
  • README.md
  • START-HERE.md
  • AI_REFACTOR_GUIDE.md

Shell Scripts (System setup):
  • check-api-keys.sh
  • create-directories.sh
  • set-api-key.sh
  • setup-dirs.sh
  • setup-images.sh

JSON Data Files (Game state):
  • .dnd-state.json
  • campaign.json
  • party.json
  • inventory-system.json
  • learning-system.json
  • current_map.json
  • session_state.json
  • auto_log.json

Keep at Root:
  • api-keys.md (sensitive, keep accessible)
  • log.md (session log)
  • character_record_sheet.md (active character)
  • CLEANUP-COMPLETE.md (status)
  • FILE_MOVE_PLAN.md (this file)

═════════════════════════════════════════════════════════════════════════════
EXECUTION STRATEGY
═════════════════════════════════════════════════════════════════════════════

STEP 1: Batch move all .md files to /docs/
  Command: Move all 70+ .md files in one operation

STEP 2: Move integrated .js files to /legacy-code/integrated/
  • dm-memory-system.js
  • party-system.js

STEP 3: Move candidate .js files to /legacy-code/candidates/
  • All Phase 3-5 candidates (30+ files)

STEP 4: Move old/experimental .js files to /legacy-code/archive/
  • All old engines and experimental code (50+ files)

STEP 5: Verify structure
  • Check that all files are in correct locations
  • Verify no files were deleted
  • Confirm imports still work

═════════════════════════════════════════════════════════════════════════════
SUMMARY
═════════════════════════════════════════════════════════════════════════════

Moving:
  ✓ 70+ .md files → /docs/
  ✓ 2 integrated systems → /legacy-code/integrated/
  ✓ 30+ candidate systems → /legacy-code/candidates/
  ✓ 50+ old systems → /legacy-code/archive/

Total files moving: ~150+ files
Root level after: ~40 files (clean, essential only)

═════════════════════════════════════════════════════════════════════════════
READY FOR EXECUTION
═════════════════════════════════════════════════════════════════════════════

All files categorized. Ready to move when you give the go-ahead.
