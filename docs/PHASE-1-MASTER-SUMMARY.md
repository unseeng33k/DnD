╔═══════════════════════════════════════════════════════════════════════════╗
║                  PHASE 1 REFACTORING - MASTER SUMMARY                    ║
║                                                                           ║
║  STATUS: Ready for execution                                             ║
║  PHASE: Move files + update import paths ONLY (no logic changes)         ║
║  TOTAL FILES: 96 JavaScript files + 50+ markdown files                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 DOCUMENTS CREATED
═══════════════════════════════════════════════════════════════════════════

1. PHASE-1-MV-OPERATIONS.js
   └─ Lists all mv operations organized by category
   └─ 96 total file moves across 6 categories

2. PHASE-1-IMPORT-RULES.js
   └─ Explains how to calculate import path changes
   └─ Shows depth rules (../, ../../, etc.)

3. PHASE-1-EXAMPLE-UPDATES.js
   └─ Shows concrete example: game-engine.js
   └─ Demonstrates which imports change and which don't
   └─ Includes comments marking changes with // PATH UPDATE

4. PHASE-1-OPERATIONS-COMPLETE.js
   └─ Complete mapping with import rules
   └─ Lists files that will need import updates
   └─ Organized by probability of needing changes

5. PHASE-1-ALL-OPERATIONS.js
   └─ Executable bash format for all mv commands
   └─ Can be used to generate shell script

═══════════════════════════════════════════════════════════════════════════
📊 FILE ORGANIZATION BY CATEGORY
═══════════════════════════════════════════════════════════════════════════

src/legacy/engines/ (17 files)
├─ game-engine.js
├─ game-master-orchestrator.js
├─ game-master-orchestrator-v2.js
├─ unified-dnd-engine.js
├─ fiction-first-orchestrator.js
├─ integrated-dnd-system.js
├─ integrated-cinematic-ambiance.js
├─ ai-dungeon-master.js
├─ session-runner.js
├─ session-runner-enhanced.js
├─ session-ambiance-orchestrator.js
├─ orchestrator-spotlight-integration.js
├─ cinematic-engine.js
├─ example-campaign.js
├─ persistent-world-state-engine.js
├─ simple-dnd.js
└─ the-heartbeat-engine.js

src/legacy/systems/ (20 files)
├─ party-system.js
├─ party_manager.js
├─ inventory-system.js
├─ spell-system.js
├─ skill-system.js
├─ roll-arbitration-engine.js
├─ mechanical-state-engine.js
├─ state-legibility-engine.js
├─ rule-legibility-engine.js
├─ narrative-legibility-engine.js
├─ agency-respect-engine.js
├─ outcome-swingyness-manager.js
├─ stakes-resolution-engine.js
├─ uncertainty-pacing-engine.js
├─ choice-architecture-engine.js
├─ cognitive-load-router.js
├─ memory-surfacing-engine.js
├─ experience-leveling-system.js
├─ spotlight-tracking-engine.js
└─ trap-puzzle-system.js

src/legacy/utilities/ (29 files)
├─ dice.js
├─ logger.js
├─ intent-parser.js
├─ item.js
├─ music.js
├─ playlist.js
├─ scenes.js
├─ visual.js
├─ character-creator.js
├─ character-personality.js
├─ dm-memory-system.js
├─ image-handler.js
├─ dalle-images.js
├─ gemini-images.js
├─ cli-image-display.js
├─ dnd-images-cli.js
├─ download-images.js
├─ test-images.js
├─ diagnose-images.js
├─ ascii-map-generator.js
├─ campaign-manager.js
├─ inventory.js
├─ npc-relationship-network.js
├─ odds-communication-system.js
├─ pregen.js
├─ world-state-graph.js
├─ world-state-query-engine.js
└─ world-state-updater.js

src/legacy/modules/ (8 files)
├─ adventure-module-system.js
├─ complete-module-extractor.js
├─ module-builder.js
├─ pdf-backed-module-system.js
├─ pdf-module-reader.js
├─ create-module.js
├─ extract-all-modules.js
└─ play-module.js

src/legacy/cli/ (11 files)
├─ create-adnd1e.js
├─ create-character.js
├─ enhance.js
├─ learn.js
├─ onboard.js
├─ start-session.js
├─ session-prep.js
├─ pre-session-prep.js
├─ pregame-check.js
├─ command-center.js
└─ adnd-rule-engine.js

src/legacy/documentation/ (50+ markdown files)
└─ All CAPS .md files from root

═══════════════════════════════════════════════════════════════════════════
🔄 IMPORT PATH EXAMPLES
═══════════════════════════════════════════════════════════════════════════

EXAMPLE 1: game-engine.js
───────────────────────────────────────────────────────────────────────────
MOVE:    game-engine.js → src/legacy/engines/game-engine.js

IMPORTS THAT CHANGE:
  ./party_manager          → ../systems/party_manager
  ./logger                 → ../utilities/logger
  
IMPORTS THAT STAY SAME:
  ./skills/combat-tracker  → ../../../skills/combat-tracker

WHY THEY CHANGE:
  - party_manager and logger ALSO moved (to different src/legacy/ subdir)
  - skills/ stayed in root, so path gets longer
  
MARK WITH COMMENT:
  // PATH UPDATE: Adjusted from './party_manager' to '../systems/party_manager'

═══════════════════════════════════════════════════════════════════════════

EXAMPLE 2: image-handler.js
───────────────────────────────────────────────────────────────────────────
MOVE:    image-handler.js → src/legacy/utilities/image-handler.js

IMPORTS THAT CHANGE:
  ./dalle-images          → ./dalle-images  (both in utilities)
  ./gemini-images         → ./gemini-images (both in utilities)
  ./logger                → ./logger        (both in utilities)
  
NO PATH UPDATES NEEDED:
  All these files moved together to the same category!

═══════════════════════════════════════════════════════════════════════════

EXAMPLE 3: party-system.js (complex)
───────────────────────────────────────────────────────────────────────────
MOVE:    party-system.js → src/legacy/systems/party-system.js

IMPORTS THAT CHANGE:
  ./inventory-system       → ./inventory-system        (both in systems)
  ./spell-system           → ./spell-system            (both in systems)
  ./skill-system           → ./skill-system            (both in systems)
  ./dice                   → ../utilities/dice         (dice moved to utilities)
  
MARK CHANGES:
  // PATH UPDATE: dice moved from root to ../utilities/dice

═══════════════════════════════════════════════════════════════════════════
⚡ EXECUTION CHECKLIST
═══════════════════════════════════════════════════════════════════════════

BEFORE MOVING FILES:
  ☐ Verify all src/legacy/{engines,systems,utilities,modules,cli,documentation}
    directories exist
  ☐ Verify no files already in those locations
  ☐ Create backup of root directory (git commit current state)

MOVING FILES:
  ☐ Run all 96 mv commands (can be batch with bash script)
  ☐ Verify files appear in new locations
  ☐ Verify no files left in root (except config, scripts, dirs)

UPDATING IMPORTS:
  ☐ For each file that changed location:
    - Open file in editor
    - Find all import/require statements
    - Calculate new paths based on IMPORT PATH RULES
    - Add // PATH UPDATE comments to changed lines
    - Verify file still loads without errors
  
  ☐ Start with high-probability files:
    - game-engine.js
    - session-runner.js
    - unified-dnd-engine.js
    - character-creator.js
    - dm-memory-system.js
    - image-handler.js

VERIFICATION:
  ☐ No function bodies changed
  ☐ No function signatures changed
  ☐ No business logic changed
  ☐ All import comments added (// PATH UPDATE)
  ☐ Files can still be required/imported

GIT COMMIT:
  ☐ git add .
  ☐ git commit -m "refactor: Phase 1 - move files to src/legacy/ and update imports"

═══════════════════════════════════════════════════════════════════════════
🎯 KEY RULES FOR THIS PHASE
═══════════════════════════════════════════════════════════════════════════

✅ DO:
  • Move files to new locations
  • Update import paths to reflect new locations
  • Add // PATH UPDATE comments where imports changed
  • Keep all function bodies, signatures, logic unchanged
  • Use relative paths (../, ./, etc.) not absolute paths
  • Test each moved file can still be imported

❌ DON'T:
  • Merge duplicate code (save for Phase 2)
  • Refactor function bodies
  • Change function signatures
  • Rename files (except path changes)
  • Add new features
  • Delete old code (use Phase 2 for that)

═══════════════════════════════════════════════════════════════════════════
📝 DOCUMENTATION FILES
═══════════════════════════════════════════════════════════════════════════

See these files for details:

1. PHASE-1-MV-OPERATIONS.js
   - All move commands organized by category
   
2. PHASE-1-IMPORT-RULES.js  
   - How to calculate import paths
   - Depth rules and examples
   
3. PHASE-1-EXAMPLE-UPDATES.js
   - Concrete example: game-engine.js before/after
   
4. PHASE-1-OPERATIONS-COMPLETE.js
   - Complete mapping with import rules
   - Files needing updates by probability
   
5. PHASE-1-ALL-OPERATIONS.js
   - All commands in executable format

═══════════════════════════════════════════════════════════════════════════

NEXT STEPS:
1. Execute Phase 1 (move files)
2. Update import paths in moved files
3. Test that files still load correctly
4. Commit to git
5. Move to PHASE 2: Deduplication & Merging

═══════════════════════════════════════════════════════════════════════════
