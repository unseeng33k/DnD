#!/usr/bin/env node

/**
 * PHASE 1 REFACTORING: MV OPERATIONS & IMPORT PATH UPDATES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULES FOR THIS PHASE:
 * ✅ MOVE files to new locations
 * ✅ UPDATE import paths in moved files
 * ❌ DO NOT change function bodies, signatures, or logic
 * ❌ DO NOT deduplicate or merge code yet (Phase 2)
 * 
 * IMPORT PATH RULES:
 * • If a moved file imports from ROOT → update to relative paths from new location
 * • If a moved file imports from src/ → update to relative paths from new location
 * • Use '../' for each level up; use './' for same directory
 * 
 * EXAMPLES:
 * • dice.js moved from root to src/legacy/utilities/
 *   OLD: import logger from './logger.js'
 *   NEW: import logger from '../utilities/logger.js'
 * 
 * • game-engine.js moved from root to src/legacy/engines/
 *   OLD: import { eventBus } from './core/event-bus.js'
 *   NEW: import { eventBus } from '../../core/event-bus.js'
 */

const fileMapping = {
  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY ENGINES → src/legacy/engines/
  // ═══════════════════════════════════════════════════════════════════════════
  engines: [
    { from: 'game-engine.js', to: 'src/legacy/engines/game-engine.js' },
    { from: 'game-master-orchestrator.js', to: 'src/legacy/engines/game-master-orchestrator.js' },
    { from: 'game-master-orchestrator-v2.js', to: 'src/legacy/engines/game-master-orchestrator-v2.js' },
    { from: 'unified-dnd-engine.js', to: 'src/legacy/engines/unified-dnd-engine.js' },
    { from: 'fiction-first-orchestrator.js', to: 'src/legacy/engines/fiction-first-orchestrator.js' },
    { from: 'integrated-dnd-system.js', to: 'src/legacy/engines/integrated-dnd-system.js' },
    { from: 'integrated-cinematic-ambiance.js', to: 'src/legacy/engines/integrated-cinematic-ambiance.js' },
    { from: 'ai-dungeon-master.js', to: 'src/legacy/engines/ai-dungeon-master.js' },
    { from: 'session-runner.js', to: 'src/legacy/engines/session-runner.js' },
    { from: 'session-runner-enhanced.js', to: 'src/legacy/engines/session-runner-enhanced.js' },
    { from: 'session-ambiance-orchestrator.js', to: 'src/legacy/engines/session-ambiance-orchestrator.js' },
    { from: 'orchestrator-spotlight-integration.js', to: 'src/legacy/engines/orchestrator-spotlight-integration.js' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // OLD SYSTEMS → src/legacy/systems/
  // ═══════════════════════════════════════════════════════════════════════════
  oldSystems: [
    { from: 'party-system.js', to: 'src/legacy/systems/party-system.js' },
    { from: 'party_manager.js', to: 'src/legacy/systems/party_manager.js' },
    { from: 'inventory-system.js', to: 'src/legacy/systems/inventory-system.js' },
    { from: 'spell-system.js', to: 'src/legacy/systems/spell-system.js' },
    { from: 'skill-system.js', to: 'src/legacy/systems/skill-system.js' },
    { from: 'roll-arbitration-engine.js', to: 'src/legacy/systems/roll-arbitration-engine.js' },
    { from: 'mechanical-state-engine.js', to: 'src/legacy/systems/mechanical-state-engine.js' },
    { from: 'state-legibility-engine.js', to: 'src/legacy/systems/state-legibility-engine.js' },
    { from: 'rule-legibility-engine.js', to: 'src/legacy/systems/rule-legibility-engine.js' },
    { from: 'narrative-legibility-engine.js', to: 'src/legacy/systems/narrative-legibility-engine.js' },
    { from: 'agency-respect-engine.js', to: 'src/legacy/systems/agency-respect-engine.js' },
    { from: 'outcome-swingyness-manager.js', to: 'src/legacy/systems/outcome-swingyness-manager.js' },
    { from: 'stakes-resolution-engine.js', to: 'src/legacy/systems/stakes-resolution-engine.js' },
    { from: 'uncertainty-pacing-engine.js', to: 'src/legacy/systems/uncertainty-pacing-engine.js' },
    { from: 'choice-architecture-engine.js', to: 'src/legacy/systems/choice-architecture-engine.js' },
    { from: 'cognitive-load-router.js', to: 'src/legacy/systems/cognitive-load-router.js' },
    { from: 'memory-surfacing-engine.js', to: 'src/legacy/systems/memory-surfacing-engine.js' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES → src/legacy/utilities/
  // ═══════════════════════════════════════════════════════════════════════════
  utilities: [
    { from: 'dice.js', to: 'src/legacy/utilities/dice.js' },
    { from: 'logger.js', to: 'src/legacy/utilities/logger.js' },
    { from: 'intent-parser.js', to: 'src/legacy/utilities/intent-parser.js' },
    { from: 'item.js', to: 'src/legacy/utilities/item.js' },
    { from: 'music.js', to: 'src/legacy/utilities/music.js' },
    { from: 'playlist.js', to: 'src/legacy/utilities/playlist.js' },
    { from: 'scenes.js', to: 'src/legacy/utilities/scenes.js' },
    { from: 'visual.js', to: 'src/legacy/utilities/visual.js' },
    { from: 'character-creator.js', to: 'src/legacy/utilities/character-creator.js' },
    { from: 'character-personality.js', to: 'src/legacy/utilities/character-personality.js' },
    { from: 'party-manager.js', to: 'src/legacy/utilities/party-manager.js' },
    { from: 'dm-memory-system.js', to: 'src/legacy/utilities/dm-memory-system.js' },
    { from: 'image-handler.js', to: 'src/legacy/utilities/image-handler.js' },
    { from: 'dalle-images.js', to: 'src/legacy/utilities/dalle-images.js' },
    { from: 'gemini-images.js', to: 'src/legacy/utilities/gemini-images.js' },
    { from: 'cli-image-display.js', to: 'src/legacy/utilities/cli-image-display.js' },
    { from: 'dnd-images-cli.js', to: 'src/legacy/utilities/dnd-images-cli.js' },
    { from: 'download-images.js', to: 'src/legacy/utilities/download-images.js' },
    { from: 'test-images.js', to: 'src/legacy/utilities/test-images.js' },
    { from: 'diagnose-images.js', to: 'src/legacy/utilities/diagnose-images.js' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULES → src/legacy/modules/
  // ═══════════════════════════════════════════════════════════════════════════
  modules: [
    { from: 'adventure-module-system.js', to: 'src/legacy/modules/adventure-module-system.js' },
    { from: 'complete-module-extractor.js', to: 'src/legacy/modules/complete-module-extractor.js' },
    { from: 'module-builder.js', to: 'src/legacy/modules/module-builder.js' },
    { from: 'pdf-backed-module-system.js', to: 'src/legacy/modules/pdf-backed-module-system.js' },
    { from: 'pdf-module-reader.js', to: 'src/legacy/modules/pdf-module-reader.js' },
    { from: 'create-module.js', to: 'src/legacy/modules/create-module.js' },
    { from: 'extract-all-modules.js', to: 'src/legacy/modules/extract-all-modules.js' },
    { from: 'play-module.js', to: 'src/legacy/modules/play-module.js' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CLI TOOLS → src/legacy/cli/
  // ═══════════════════════════════════════════════════════════════════════════
  cli: [
    { from: 'create-adnd1e.js', to: 'src/legacy/cli/create-adnd1e.js' },
    { from: 'create-character.js', to: 'src/legacy/cli/create-character.js' },
    { from: 'enhance.js', to: 'src/legacy/cli/enhance.js' },
    { from: 'learn.js', to: 'src/legacy/cli/learn.js' },
    { from: 'onboard.js', to: 'src/legacy/cli/onboard.js' },
    { from: 'start-session.js', to: 'src/legacy/cli/start-session.js' },
    { from: 'session-prep.js', to: 'src/legacy/cli/session-prep.js' },
    { from: 'pre-session-prep.js', to: 'src/legacy/cli/pre-session-prep.js' },
    { from: 'pregame-check.js', to: 'src/legacy/cli/pregame-check.js' },
    { from: 'command-center.js', to: 'src/legacy/cli/command-center.js' },
    { from: 'adnd-rule-engine.js', to: 'src/legacy/cli/adnd-rule-engine.js' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTATION → src/legacy/documentation/
  // (60+ markdown files - see separate list below)
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // MISCELLANEOUS (OTHER ENGINES/UTILITIES NOT YET CATEGORIZED)
  // ═══════════════════════════════════════════════════════════════════════════
  misc: [
    { from: 'ascii-map-generator.js', to: 'src/legacy/utilities/ascii-map-generator.js' },
    { from: 'cinematic-engine.js', to: 'src/legacy/engines/cinematic-engine.js' },
    { from: 'campaign-manager.js', to: 'src/legacy/utilities/campaign-manager.js' },
    { from: 'dm-reference-guide.js', to: 'src/legacy/documentation/dm-reference-guide.js' },
    { from: 'example-campaign.js', to: 'src/legacy/engines/example-campaign.js' },
    { from: 'experience-leveling-system.js', to: 'src/legacy/systems/experience-leveling-system.js' },
    { from: 'inventory.js', to: 'src/legacy/utilities/inventory.js' },
    { from: 'npc-relationship-network.js', to: 'src/legacy/utilities/npc-relationship-network.js' },
    { from: 'odds-communication-system.js', to: 'src/legacy/utilities/odds-communication-system.js' },
    { from: 'persistent-world-state-engine.js', to: 'src/legacy/engines/persistent-world-state-engine.js' },
    { from: 'pregen.js', to: 'src/legacy/utilities/pregen.js' },
    { from: 'simple-dnd.js', to: 'src/legacy/engines/simple-dnd.js' },
    { from: 'spotlight-tracking-engine.js', to: 'src/legacy/systems/spotlight-tracking-engine.js' },
    { from: 'the-heartbeat-engine.js', to: 'src/legacy/engines/the-heartbeat-engine.js' },
    { from: 'trap-puzzle-system.js', to: 'src/legacy/systems/trap-puzzle-system.js' },
    { from: 'world-state-graph.js', to: 'src/legacy/utilities/world-state-graph.js' },
    { from: 'world-state-query-engine.js', to: 'src/legacy/utilities/world-state-query-engine.js' },
    { from: 'world-state-updater.js', to: 'src/legacy/utilities/world-state-updater.js' },
  ],
};

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                  PHASE 1: MV OPERATIONS & IMPORT UPDATES                  ║
║                                                                           ║
║  RULE: Move files & update imports ONLY. NO logic changes.              ║
╚═══════════════════════════════════════════════════════════════════════════╝

MV OPERATIONS SUMMARY
─────────────────────────────────────────────────────────────────────────────

LEGACY ENGINES (${fileMapping.engines.length} files):
${fileMapping.engines.map(f => `  mv ${f.from} ${f.to}`).join('\n')}

LEGACY OLD SYSTEMS (${fileMapping.oldSystems.length} files):
${fileMapping.oldSystems.map(f => `  mv ${f.from} ${f.to}`).join('\n')}

LEGACY UTILITIES (${fileMapping.utilities.length} files):
${fileMapping.utilities.map(f => `  mv ${f.from} ${f.to}`).join('\n')}

LEGACY MODULES (${fileMapping.modules.length} files):
${fileMapping.modules.map(f => `  mv ${f.from} ${f.to}`).join('\n')}

LEGACY CLI (${fileMapping.cli.length} files):
${fileMapping.cli.map(f => `  mv ${f.from} ${f.to}`).join('\n')}

MISC FILES (${fileMapping.misc.length} files):
${fileMapping.misc.map(f => `  mv ${f.from} ${f.to}`).join('\n')}
`);

export { fileMapping };
