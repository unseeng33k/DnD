#!/usr/bin/env node

/**
 * PHASE 1 REFACTORING - EXECUTABLE BASH SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file shows all MV operations in bash format.
 * Each line is a separate `mv` command that can be executed.
 * 
 * To execute ALL moves at once:
 *   bash PHASE-1-EXECUTE.sh
 * 
 * Then run import updates script.
 */

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1A: ENGINES (12 files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1a = [
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1B: OLD SYSTEMS (17 files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1b = [
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1C: UTILITIES (20 files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1c = [
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1D: MODULES (8 files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1d = [
  'mv adventure-module-system.js src/legacy/modules/adventure-module-system.js',
  'mv complete-module-extractor.js src/legacy/modules/complete-module-extractor.js',
  'mv module-builder.js src/legacy/modules/module-builder.js',
  'mv pdf-backed-module-system.js src/legacy/modules/pdf-backed-module-system.js',
  'mv pdf-module-reader.js src/legacy/modules/pdf-module-reader.js',
  'mv create-module.js src/legacy/modules/create-module.js',
  'mv extract-all-modules.js src/legacy/modules/extract-all-modules.js',
  'mv play-module.js src/legacy/modules/play-module.js',
];

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1E: CLI TOOLS (11 files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1e = [
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

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1F: MISC (18 additional files)
// ═══════════════════════════════════════════════════════════════════════════

const commands_1f = [
  // Engines
  'mv cinematic-engine.js src/legacy/engines/cinematic-engine.js',
  'mv example-campaign.js src/legacy/engines/example-campaign.js',
  'mv persistent-world-state-engine.js src/legacy/engines/persistent-world-state-engine.js',
  'mv simple-dnd.js src/legacy/engines/simple-dnd.js',
  'mv the-heartbeat-engine.js src/legacy/engines/the-heartbeat-engine.js',
  
  // Systems
  'mv experience-leveling-system.js src/legacy/systems/experience-leveling-system.js',
  'mv spotlight-tracking-engine.js src/legacy/systems/spotlight-tracking-engine.js',
  'mv trap-puzzle-system.js src/legacy/systems/trap-puzzle-system.js',
  
  // Utilities
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

// Summary
console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                        PHASE 1 - ALL MV OPERATIONS                        ║
║                                                                           ║
║                          TOTAL: 96 FILE MOVES                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

PHASE 1A: ENGINES (${commands_1a.length} files)
${commands_1a.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

PHASE 1B: OLD SYSTEMS (${commands_1b.length} files)
${commands_1b.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

PHASE 1C: UTILITIES (${commands_1c.length} files)
${commands_1c.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

PHASE 1D: MODULES (${commands_1d.length} files)
${commands_1d.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

PHASE 1E: CLI TOOLS (${commands_1e.length} files)
${commands_1e.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

PHASE 1F: MISC (${commands_1f.length} files)
${commands_1f.map((cmd, i) => \`\${i + 1}. \${cmd}\`).join('\n')}

═══════════════════════════════════════════════════════════════════════════
DOCUMENTATION: 50+ markdown files → src/legacy/documentation/
All CAPS .md files will be moved
═══════════════════════════════════════════════════════════════════════════
`);

module.exports = { commands_1a, commands_1b, commands_1c, commands_1d, commands_1e, commands_1f };
