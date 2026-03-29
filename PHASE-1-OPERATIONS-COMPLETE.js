#!/usr/bin/env node

/**
 * PHASE 1 COMPLETE: ALL MV OPERATIONS & IMPORT PATH RULES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * EXECUTION RULE:
 * 1. Move each file to new location
 * 2. Update ONLY import paths in moved files
 * 3. DO NOT change any function bodies, signatures, or logic
 * 4. Files that import from each other: update relative paths
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// PHASE 1A: LEGACY ENGINES
// ─────────────────────────────────────────────────────────────────────────────
// 12 engine files → src/legacy/engines/

const PHASE_1A_ENGINES = [
  'mv game-engine.js src/legacy/engines/game-engine.js',
  'mv game-master-orchestrator.js src/legacy/engines/game-master-orchestrator.js',
  'mv game-master-orchestrator-v2.js src/legacy/engines/game-master-orchestrator-v2.js',
  'mv unified-dnd-engine.js src/legacy/engines/unified-dnd-engine.js',
  'mv fiction-first-orchestrator.js src/legacy/engines/fiction-first-orchestrator.js',
  'mv integrated-dnd-system.js src/legacy/engines/integrated-dnd-system.js',
  'mv integrated-cinematic-ambiance.js src/legacy/engines/integrated-cinematic-ambiance.js',
  'mv ai-dungeon-master.js src/legacy/engines/ai-dungeon-master.js',
  'mv session-runner.js src/legacy/engines/session-runner.js',
  'mv session-runner-enhanced.js src/legacy/engines/session-runner-enhanced.js',
  'mv session-ambiance-orchestrator.js src/legacy/engines/session-ambiance-orchestrator.js',
  'mv orchestrator-spotlight-integration.js src/legacy/engines/orchestrator-spotlight-integration.js',
];

// PHASE 1B: OLD SYSTEMS
// ─────────────────────────────────────────────────────────────────────────────
// 17 old system files → src/legacy/systems/

const PHASE_1B_OLD_SYSTEMS = [
  'mv party-system.js src/legacy/systems/party-system.js',
  'mv party_manager.js src/legacy/systems/party_manager.js',
  'mv inventory-system.js src/legacy/systems/inventory-system.js',
  'mv spell-system.js src/legacy/systems/spell-system.js',
  'mv skill-system.js src/legacy/systems/skill-system.js',
  'mv roll-arbitration-engine.js src/legacy/systems/roll-arbitration-engine.js',
  'mv mechanical-state-engine.js src/legacy/systems/mechanical-state-engine.js',
  'mv state-legibility-engine.js src/legacy/systems/state-legibility-engine.js',
  'mv rule-legibility-engine.js src/legacy/systems/rule-legibility-engine.js',
  'mv narrative-legibility-engine.js src/legacy/systems/narrative-legibility-engine.js',
  'mv agency-respect-engine.js src/legacy/systems/agency-respect-engine.js',
  'mv outcome-swingyness-manager.js src/legacy/systems/outcome-swingyness-manager.js',
  'mv stakes-resolution-engine.js src/legacy/systems/stakes-resolution-engine.js',
  'mv uncertainty-pacing-engine.js src/legacy/systems/uncertainty-pacing-engine.js',
  'mv choice-architecture-engine.js src/legacy/systems/choice-architecture-engine.js',
  'mv cognitive-load-router.js src/legacy/systems/cognitive-load-router.js',
  'mv memory-surfacing-engine.js src/legacy/systems/memory-surfacing-engine.js',
];

// PHASE 1C: UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
// 20 utility files → src/legacy/utilities/

const PHASE_1C_UTILITIES = [
  'mv dice.js src/legacy/utilities/dice.js',
  'mv logger.js src/legacy/utilities/logger.js',
  'mv intent-parser.js src/legacy/utilities/intent-parser.js',
  'mv item.js src/legacy/utilities/item.js',
  'mv music.js src/legacy/utilities/music.js',
  'mv playlist.js src/legacy/utilities/playlist.js',
  'mv scenes.js src/legacy/utilities/scenes.js',
  'mv visual.js src/legacy/utilities/visual.js',
  'mv character-creator.js src/legacy/utilities/character-creator.js',
  'mv character-personality.js src/legacy/utilities/character-personality.js',
  'mv party-manager.js src/legacy/utilities/party-manager.js',  // NOTE: duplicate key, systems takes precedence
  'mv dm-memory-system.js src/legacy/utilities/dm-memory-system.js',
  'mv image-handler.js src/legacy/utilities/image-handler.js',
  'mv dalle-images.js src/legacy/utilities/dalle-images.js',
  'mv gemini-images.js src/legacy/utilities/gemini-images.js',
  'mv cli-image-display.js src/legacy/utilities/cli-image-display.js',
  'mv dnd-images-cli.js src/legacy/utilities/dnd-images-cli.js',
  'mv download-images.js src/legacy/utilities/download-images.js',
  'mv test-images.js src/legacy/utilities/test-images.js',
  'mv diagnose-images.js src/legacy/utilities/diagnose-images.js',
];

// PHASE 1D: MODULES
// ─────────────────────────────────────────────────────────────────────────────
// 8 module files → src/legacy/modules/

const PHASE_1D_MODULES = [
  'mv adventure-module-system.js src/legacy/modules/adventure-module-system.js',
  'mv complete-module-extractor.js src/legacy/modules/complete-module-extractor.js',
  'mv module-builder.js src/legacy/modules/module-builder.js',
  'mv pdf-backed-module-system.js src/legacy/modules/pdf-backed-module-system.js',
  'mv pdf-module-reader.js src/legacy/modules/pdf-module-reader.js',
  'mv create-module.js src/legacy/modules/create-module.js',
  'mv extract-all-modules.js src/legacy/modules/extract-all-modules.js',
  'mv play-module.js src/legacy/modules/play-module.js',
];

// PHASE 1E: CLI TOOLS
// ─────────────────────────────────────────────────────────────────────────────
// 11 CLI tool files → src/legacy/cli/

const PHASE_1E_CLI = [
  'mv create-adnd1e.js src/legacy/cli/create-adnd1e.js',
  'mv create-character.js src/legacy/cli/create-character.js',
  'mv enhance.js src/legacy/cli/enhance.js',
  'mv learn.js src/legacy/cli/learn.js',
  'mv onboard.js src/legacy/cli/onboard.js',
  'mv start-session.js src/legacy/cli/start-session.js',
  'mv session-prep.js src/legacy/cli/session-prep.js',
  'mv pre-session-prep.js src/legacy/cli/pre-session-prep.js',
  'mv pregame-check.js src/legacy/cli/pregame-check.js',
  'mv command-center.js src/legacy/cli/command-center.js',
  'mv adnd-rule-engine.js src/legacy/cli/adnd-rule-engine.js',
];

// PHASE 1F: MISCELLANEOUS (uncategorized engines, systems, utilities)
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_1F_MISC = [
  // Additional engines
  'mv cinematic-engine.js src/legacy/engines/cinematic-engine.js',
  'mv example-campaign.js src/legacy/engines/example-campaign.js',
  'mv persistent-world-state-engine.js src/legacy/engines/persistent-world-state-engine.js',
  'mv simple-dnd.js src/legacy/engines/simple-dnd.js',
  'mv the-heartbeat-engine.js src/legacy/engines/the-heartbeat-engine.js',
  
  // Additional systems
  'mv experience-leveling-system.js src/legacy/systems/experience-leveling-system.js',
  'mv spotlight-tracking-engine.js src/legacy/systems/spotlight-tracking-engine.js',
  'mv trap-puzzle-system.js src/legacy/systems/trap-puzzle-system.js',
  
  // Additional utilities
  'mv ascii-map-generator.js src/legacy/utilities/ascii-map-generator.js',
  'mv campaign-manager.js src/legacy/utilities/campaign-manager.js',
  'mv inventory.js src/legacy/utilities/inventory.js',
  'mv npc-relationship-network.js src/legacy/utilities/npc-relationship-network.js',
  'mv odds-communication-system.js src/legacy/utilities/odds-communication-system.js',
  'mv pregen.js src/legacy/utilities/pregen.js',
  'mv world-state-graph.js src/legacy/utilities/world-state-graph.js',
  'mv world-state-query-engine.js src/legacy/utilities/world-state-query-engine.js',
  'mv world-state-updater.js src/legacy/utilities/world-state-updater.js',
];

// PHASE 1G: DOCUMENTATION
// ─────────────────────────────────────────────────────────────────────────────
// 50+ markdown files → src/legacy/documentation/

const PHASE_1G_DOCUMENTATION = [
  'mv AMBIANCE-IMAGE-INTEGRATION.md src/legacy/documentation/',
  'mv ARCHITECTURE-NINE-PILLARS.md src/legacy/documentation/',
  'mv BACKEND-ARCHITECTURE-GUIDE.md src/legacy/documentation/',
  'mv BACKEND-BUILD-COMPLETE.md src/legacy/documentation/',
  'mv BUILD-SUMMARY.md src/legacy/documentation/',
  'mv CINEMATIC-AMBIANCE-INTEGRATION.md src/legacy/documentation/',
  'mv COMPLETE-BACKEND-IMPLEMENTATION.md src/legacy/documentation/',
  'mv COMPLETE-SYSTEM-FINAL.md src/legacy/documentation/',
  'mv COMPLETE-SYSTEM-INTEGRATION.md src/legacy/documentation/',
  'mv COMPLETE-SYSTEM-INVENTORY.md src/legacy/documentation/',
  'mv DM-MEMORY-COMPLETE.md src/legacy/documentation/',
  'mv DM-MEMORY-QUICK-START.md src/legacy/documentation/',
  'mv DM_DIRECTOR.md src/legacy/documentation/',
  'mv DM_PERSONA.md src/legacy/documentation/',
  'mv EIGHT-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv FINAL-BUILD-STATUS.md src/legacy/documentation/',
  'mv FINAL-BUILD-SUMMARY.md src/legacy/documentation/',
  'mv FINAL-DELIVERY-SUMMARY.md src/legacy/documentation/',
  'mv FINAL-SYSTEM-BUILD-PLAN.md src/legacy/documentation/',
  'mv FIVE-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv FOUR-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv HEARTBEAT.md src/legacy/documentation/',
  'mv IMAGE-HANDLER-GUIDE.md src/legacy/documentation/',
  'mv IMAGE-HANDLER-README.md src/legacy/documentation/',
  'mv LEARNING.md src/legacy/documentation/',
  'mv LEVEL-3-COMPLETE.md src/legacy/documentation/',
  'mv LOOT_TRACKING.md src/legacy/documentation/',
  'mv MODULE-SYSTEM-GUIDE.md src/legacy/documentation/',
  'mv MUSIC.md src/legacy/documentation/',
  'mv OPTION-B-COMPLETE.md src/legacy/documentation/',
  'mv ORCHESTRATOR-GUIDE.md src/legacy/documentation/',
  'mv PARTY_SYSTEM.md src/legacy/documentation/',
  'mv PILLAR-2-PERSISTENT-WORLD.md src/legacy/documentation/',
  'mv PILLAR-3-AGENCY-SPOTLIGHT.md src/legacy/documentation/',
  'mv PILLAR-4-UNCERTAINTY.md src/legacy/documentation/',
  'mv PILLAR-5-LEGIBILITY.md src/legacy/documentation/',
  'mv PILLAR-6-ORCHESTRATOR.md src/legacy/documentation/',
  'mv PILLAR-7-WORLD-STATE-GRAPH.md src/legacy/documentation/',
  'mv PILLAR-8-SPOTLIGHT-SCHEDULER.md src/legacy/documentation/',
  'mv PLAY-TSR-MODULES.md src/legacy/documentation/',
  'mv QUICK-REFERENCE.md src/legacy/documentation/',
  'mv QUICK-START-EXAMPLES.md src/legacy/documentation/',
  'mv QUICK-START.md src/legacy/documentation/',
  'mv SEVEN-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv SIX-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv START-HERE.md src/legacy/documentation/',
  'mv SYSTEM-COMPLETE.md src/legacy/documentation/',
  'mv SYSTEM-FINAL-SUMMARY.md src/legacy/documentation/',
  'mv THE-HEARTBEAT-COMPLETE.md src/legacy/documentation/',
  'mv THREE-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv TWO-PILLARS-COMPLETE.md src/legacy/documentation/',
  'mv UNIFIED-SYSTEM-COMPLETE.md src/legacy/documentation/',
];

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT PATH UPDATE RULES FOR PHASE 1
// ═══════════════════════════════════════════════════════════════════════════

const IMPORT_RULES = `
IMPORT PATH CALCULATION:

When a file moves from ROOT to src/legacy/CATEGORY/:

CASE 1: It imports another file that ALSO moves
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example:
  FROM: game-engine.js (root) imports './party_manager.js' (root)
  BOTH MOVE: game-engine.js → src/legacy/engines/
              party_manager.js → src/legacy/systems/

  UPDATE PATH TO: '../systems/party_manager.js'
  WHY: Both in src/legacy/, different subcategories

CASE 2: It imports a file that STAYS in root
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example:
  FROM: game-engine.js (root) imports './skills/combat-tracker.js'
  ONLY game-engine.js MOVES: game-engine.js → src/legacy/engines/
                              skills/ STAYS in root

  UPDATE PATH TO: '../../../skills/combat-tracker.js'
  WHY: Need to go up from src/legacy/engines/ to root to access skills/
       .../ = up to src/legacy/
       ../ = up to src/
       ../ = up to root

CASE 3: It imports from src/ (organized subdirectories)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Example:
  FILE: src/legacy/engines/game-engine.js
  WANTS: import { eventBus } from 'src/core/event-bus.js'
  
  UPDATE PATH TO: '../../core/event-bus.js'
  WHY: ../ = up to src/legacy/
       ../ = up to src/
       core/ = into core/

QUICK REFERENCE:
────────────────────────────────────────────────────────────────────────────
From: src/legacy/engines/
  To same category:  './file.js'
  To sibling:        '../systems/file.js'   or '../utilities/file.js'
  To src/:           '../../core/file.js'   or '../../registries/file.js'
  To root:           '../../../file.js'

From: src/legacy/utilities/
  To same category:  './file.js'
  To sibling:        '../systems/file.js'   or '../engines/file.js'
  To src/:           '../../core/file.js'
  To root:           '../../../file.js'

FILE THAT NEED IMPORT UPDATES (high probability):
────────────────────────────────────────────────────────────────────────────
✓ game-engine.js          (many root imports)
✓ session-runner.js       (imports image-handler)
✓ unified-dnd-engine.js   (multiple system imports)
✓ integrated-dnd-system.js (imports various files)
✓ character-creator.js    (imports character-personality, dice)
✓ dm-memory-system.js     (imports logger, intent-parser)
✓ image-handler.js        (imports dalle-images, gemini-images, etc)
✓ party-system.js         (imports inventory, skill, spell systems)
✓ spell-system.js         (might import dice)
✓ spell-system.js         (might import dice)
✓ skill-system.js         (might import dice)
✓ roll-arbitration-engine.js (imports dice)
✓ adventure-module-system.js (imports character-creator)
✓ create-character.js     (imports character-creator, dice)
✓ start-session.js        (imports various systems)

FILES WITH FEW/NO IMPORT CHANGES (low probability):
────────────────────────────────────────────────────────────────────────────
  • dice.js              (likely standalone)
  • logger.js            (likely standalone)
  • item.js              (likely standalone)
  • music.js, playlist.js, visual.js (likely standalone)
  • scenes.js            (likely standalone)
`;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║              PHASE 1 MV OPERATIONS - COMPLETE MAPPING                    ║
║                                                                           ║
║  TOTAL FILES TO MOVE: ${PHASE_1A_ENGINES.length + PHASE_1B_OLD_SYSTEMS.length + PHASE_1C_UTILITIES.length + PHASE_1D_MODULES.length + PHASE_1E_CLI.length + PHASE_1F_MISC.length + PHASE_1G_DOCUMENTATION.length} files
║                                                                           ║
║  ENGINES:        ${PHASE_1A_ENGINES.length + PHASE_1F_MISC.filter(m => m.includes('/engines/')).length} files
║  OLD SYSTEMS:    ${PHASE_1B_OLD_SYSTEMS.length + PHASE_1F_MISC.filter(m => m.includes('/systems/')).length} files
║  UTILITIES:      ${PHASE_1C_UTILITIES.length + PHASE_1F_MISC.filter(m => m.includes('/utilities/')).length} files
║  MODULES:        ${PHASE_1D_MODULES.length} files
║  CLI TOOLS:      ${PHASE_1E_CLI.length} files
║  DOCUMENTATION:  ${PHASE_1G_DOCUMENTATION.length} files
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

${IMPORT_RULES}
`);

export { PHASE_1A_ENGINES, PHASE_1B_OLD_SYSTEMS, PHASE_1C_UTILITIES, PHASE_1D_MODULES, PHASE_1E_CLI, PHASE_1F_MISC, PHASE_1G_DOCUMENTATION };
