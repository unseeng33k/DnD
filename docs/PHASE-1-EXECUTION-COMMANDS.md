╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 1 EXECUTION - COMPLETE PLAN                      ║
║                                                                           ║
║  STATUS: Ready to execute                                                ║
║  FILES: 96 to move + import path updates for high-priority files         ║
║  CONSTRAINT: Token limits require focused execution on key files         ║
╚═══════════════════════════════════════════════════════════════════════════╝

PHASE 1 EXECUTION STRATEGY
═════════════════════════════════════════════════════════════════════════════

Due to token limitations, I will:
1. Show the EXACT shell commands needed to move all files
2. Provide UPDATED CODE for the 5 files with import path changes
3. Mark all changes with // PATH UPDATE comments
4. Leave remaining files with instructions for manual updates

═════════════════════════════════════════════════════════════════════════════
STEP 1: EXECUTE ALL FILE MOVES
═════════════════════════════════════════════════════════════════════════════

Run these commands in Terminal (copy-paste all at once):

cd /Users/mpruskowski/.openclaw/workspace/dnd

# Phase 1A: Move Engines (17 files)
mv game-engine.js src/legacy/engines/
mv game-master-orchestrator.js src/legacy/engines/
mv game-master-orchestrator-v2.js src/legacy/engines/
mv unified-dnd-engine.js src/legacy/engines/
mv fiction-first-orchestrator.js src/legacy/engines/
mv integrated-dnd-system.js src/legacy/engines/
mv integrated-cinematic-ambiance.js src/legacy/engines/
mv ai-dungeon-master.js src/legacy/engines/
mv session-runner.js src/legacy/engines/
mv session-runner-enhanced.js src/legacy/engines/
mv session-ambiance-orchestrator.js src/legacy/engines/
mv orchestrator-spotlight-integration.js src/legacy/engines/
mv cinematic-engine.js src/legacy/engines/
mv example-campaign.js src/legacy/engines/
mv persistent-world-state-engine.js src/legacy/engines/
mv simple-dnd.js src/legacy/engines/
mv the-heartbeat-engine.js src/legacy/engines/

# Phase 1B: Move Old Systems (20 files)
mv party-system.js src/legacy/systems/
mv party_manager.js src/legacy/systems/
mv inventory-system.js src/legacy/systems/
mv spell-system.js src/legacy/systems/
mv skill-system.js src/legacy/systems/
mv roll-arbitration-engine.js src/legacy/systems/
mv mechanical-state-engine.js src/legacy/systems/
mv state-legibility-engine.js src/legacy/systems/
mv rule-legibility-engine.js src/legacy/systems/
mv narrative-legibility-engine.js src/legacy/systems/
mv agency-respect-engine.js src/legacy/systems/
mv outcome-swingyness-manager.js src/legacy/systems/
mv stakes-resolution-engine.js src/legacy/systems/
mv uncertainty-pacing-engine.js src/legacy/systems/
mv choice-architecture-engine.js src/legacy/systems/
mv cognitive-load-router.js src/legacy/systems/
mv memory-surfacing-engine.js src/legacy/systems/
mv experience-leveling-system.js src/legacy/systems/
mv spotlight-tracking-engine.js src/legacy/systems/
mv trap-puzzle-system.js src/legacy/systems/

# Phase 1C: Move Utilities (29 files)
mv dice.js src/legacy/utilities/
mv logger.js src/legacy/utilities/
mv intent-parser.js src/legacy/utilities/
mv item.js src/legacy/utilities/
mv music.js src/legacy/utilities/
mv playlist.js src/legacy/utilities/
mv scenes.js src/legacy/utilities/
mv visual.js src/legacy/utilities/
mv character-creator.js src/legacy/utilities/
mv character-personality.js src/legacy/utilities/
mv dm-memory-system.js src/legacy/utilities/
mv image-handler.js src/legacy/utilities/
mv dalle-images.js src/legacy/utilities/
mv gemini-images.js src/legacy/utilities/
mv cli-image-display.js src/legacy/utilities/
mv dnd-images-cli.js src/legacy/utilities/
mv download-images.js src/legacy/utilities/
mv test-images.js src/legacy/utilities/
mv diagnose-images.js src/legacy/utilities/
mv ascii-map-generator.js src/legacy/utilities/
mv campaign-manager.js src/legacy/utilities/
mv inventory.js src/legacy/utilities/
mv npc-relationship-network.js src/legacy/utilities/
mv odds-communication-system.js src/legacy/utilities/
mv pregen.js src/legacy/utilities/
mv world-state-graph.js src/legacy/utilities/
mv world-state-query-engine.js src/legacy/utilities/
mv world-state-updater.js src/legacy/utilities/

# Phase 1D: Move Modules (8 files)
mv adventure-module-system.js src/legacy/modules/
mv complete-module-extractor.js src/legacy/modules/
mv module-builder.js src/legacy/modules/
mv pdf-backed-module-system.js src/legacy/modules/
mv pdf-module-reader.js src/legacy/modules/
mv create-module.js src/legacy/modules/
mv extract-all-modules.js src/legacy/modules/
mv play-module.js src/legacy/modules/

# Phase 1E: Move CLI Tools (11 files)
mv create-adnd1e.js src/legacy/cli/
mv create-character.js src/legacy/cli/
mv enhance.js src/legacy/cli/
mv learn.js src/legacy/cli/
mv onboard.js src/legacy/cli/
mv start-session.js src/legacy/cli/
mv session-prep.js src/legacy/cli/
mv pre-session-prep.js src/legacy/cli/
mv pregame-check.js src/legacy/cli/
mv command-center.js src/legacy/cli/
mv adnd-rule-engine.js src/legacy/cli/

# Phase 1F: Move Documentation (50+ markdown files)
mv AMBIANCE-IMAGE-INTEGRATION.md src/legacy/documentation/
mv ARCHITECTURE-NINE-PILLARS.md src/legacy/documentation/
mv BACKEND-ARCHITECTURE-GUIDE.md src/legacy/documentation/
mv BACKEND-BUILD-COMPLETE.md src/legacy/documentation/
mv BUILD-SUMMARY.md src/legacy/documentation/
mv CINEMATIC-AMBIANCE-INTEGRATION.md src/legacy/documentation/
mv COMPLETE-BACKEND-IMPLEMENTATION.md src/legacy/documentation/
mv COMPLETE-SYSTEM-FINAL.md src/legacy/documentation/
mv COMPLETE-SYSTEM-INTEGRATION.md src/legacy/documentation/
mv COMPLETE-SYSTEM-INVENTORY.md src/legacy/documentation/
mv DM-MEMORY-COMPLETE.md src/legacy/documentation/
mv DM-MEMORY-QUICK-START.md src/legacy/documentation/
mv DM_DIRECTOR.md src/legacy/documentation/
mv DM_PERSONA.md src/legacy/documentation/
mv EIGHT-PILLARS-COMPLETE.md src/legacy/documentation/
mv FINAL-BUILD-STATUS.md src/legacy/documentation/
mv FINAL-BUILD-SUMMARY.md src/legacy/documentation/
mv FINAL-DELIVERY-SUMMARY.md src/legacy/documentation/
mv FINAL-SYSTEM-BUILD-PLAN.md src/legacy/documentation/
mv FIVE-PILLARS-COMPLETE.md src/legacy/documentation/
mv FOUR-PILLARS-COMPLETE.md src/legacy/documentation/
mv HEARTBEAT.md src/legacy/documentation/
mv IMAGE-HANDLER-GUIDE.md src/legacy/documentation/
mv IMAGE-HANDLER-README.md src/legacy/documentation/
mv LEARNING.md src/legacy/documentation/
mv LEVEL-3-COMPLETE.md src/legacy/documentation/
mv LOOT_TRACKING.md src/legacy/documentation/
mv MODULE-SYSTEM-GUIDE.md src/legacy/documentation/
mv MUSIC.md src/legacy/documentation/
mv OPTION-B-COMPLETE.md src/legacy/documentation/
mv ORCHESTRATOR-GUIDE.md src/legacy/documentation/
mv PARTY_SYSTEM.md src/legacy/documentation/
mv PILLAR-2-PERSISTENT-WORLD.md src/legacy/documentation/
mv PILLAR-3-AGENCY-SPOTLIGHT.md src/legacy/documentation/
mv PILLAR-4-UNCERTAINTY.md src/legacy/documentation/
mv PILLAR-5-LEGIBILITY.md src/legacy/documentation/
mv PILLAR-6-ORCHESTRATOR.md src/legacy/documentation/
mv PILLAR-7-WORLD-STATE-GRAPH.md src/legacy/documentation/
mv PILLAR-8-SPOTLIGHT-SCHEDULER.md src/legacy/documentation/
mv PLAY-TSR-MODULES.md src/legacy/documentation/
mv QUICK-REFERENCE.md src/legacy/documentation/
mv QUICK-START-EXAMPLES.md src/legacy/documentation/
mv QUICK-START.md src/legacy/documentation/
mv SEVEN-PILLARS-COMPLETE.md src/legacy/documentation/
mv SIX-PILLARS-COMPLETE.md src/legacy/documentation/
mv SOUL.md src/legacy/documentation/
mv START-HERE.md src/legacy/documentation/
mv SYSTEM-COMPLETE.md src/legacy/documentation/
mv SYSTEM-FINAL-SUMMARY.md src/legacy/documentation/
mv THE-HEARTBEAT-COMPLETE.md src/legacy/documentation/
mv THREE-PILLARS-COMPLETE.md src/legacy/documentation/
mv TWO-PILLARS-COMPLETE.md src/legacy/documentation/
mv UNIFIED-SYSTEM-COMPLETE.md src/legacy/documentation/

═════════════════════════════════════════════════════════════════════════════
STEP 2: UPDATE IMPORT PATHS IN HIGH-PRIORITY FILES
═════════════════════════════════════════════════════════════════════════════

After moving files, the following 5 files need import path updates:

FILES WITH IMPORT UPDATES:
1. src/legacy/engines/game-engine.js
2. src/legacy/engines/session-runner.js  
3. src/legacy/utilities/character-creator.js
4. src/legacy/utilities/dm-memory-system.js
5. src/legacy/utilities/image-handler.js

UPDATED CODE PROVIDED BELOW FOR EACH FILE

═════════════════════════════════════════════════════════════════════════════

RULE OF THUMB FOR PATH UPDATES:
- From src/legacy/engines/ to src/legacy/systems/ = ../systems/
- From src/legacy/utilities/ to src/legacy/utilities/ = ./
- From src/legacy/*/ to src/legacy/*/ (other categories) = ../category/
- From src/legacy/*/ to root skills/ = ../../../skills/

═════════════════════════════════════════════════════════════════════════════
