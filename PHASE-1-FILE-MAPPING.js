#!/usr/bin/env node

/**
 * PHASE 1 CLEANUP MAPPING
 * Categorizes all root-level JS and MD files for reorganization
 */

const fileMapping = {
  // FILES ALREADY IN src/ (NO MOVE NEEDED)
  'already_in_src': {
    'core/': 'src/core/',
    'registries/': 'src/registries/',
    'effects/': 'src/effects/',
    'systems/': 'src/systems/',
  },

  // GAME ENGINES → src/legacy/engines/
  'legacy_engines': [
    'game-engine.js',
    'game-master-orchestrator.js',
    'game-master-orchestrator-v2.js',
    'unified-dnd-engine.js',
    'fiction-first-orchestrator.js',
    'integrated-dnd-system.js',
    'integrated-cinematic-ambiance.js',
    'ai-dungeon-master.js',
    'session-runner.js',
    'session-runner-enhanced.js',
    'session-ambiance-orchestrator.js',
    'orchestrator-spotlight-integration.js',
  ],

  // OLD SYSTEMS (WILL BE DEPRECATED) → src/legacy/systems/
  'legacy_old_systems': [
    'party-system.js',
    'party_manager.js',
    'inventory-system.js',
    'spell-system.js',
    'skill-system.js',
    'roll-arbitration-engine.js',
    'mechanical-state-engine.js',
    'state-legibility-engine.js',
    'rule-legibility-engine.js',
    'narrative-legibility-engine.js',
    'agency-respect-engine.js',
    'outcome-swingyness-manager.js',
    'stakes-resolution-engine.js',
    'uncertainty-pacing-engine.js',
    'choice-architecture-engine.js',
    'cognitive-load-router.js',
    'memory-surfacing-engine.js',
  ],

  // UTILITIES → src/legacy/utilities/
  'legacy_utilities': [
    'dice.js',
    'logger.js',
    'intent-parser.js',
    'item.js',
    'music.js',
    'playlist.js',
    'scenes.js',
    'visual.js',
    'character-creator.js',
    'character-personality.js',
    'party-manager.js',
    'dm-memory-system.js',
    'image-handler.js',
    'dalle-images.js',
    'gemini-images.js',
    'cli-image-display.js',
    'dnd-images-cli.js',
    'download-images.js',
    'test-images.js',
    'diagnose-images.js',
  ],

  // MODULES → src/legacy/modules/
  'legacy_modules': [
    'adventure-module-system.js',
    'complete-module-extractor.js',
    'module-builder.js',
    'pdf-backed-module-system.js',
    'pdf-module-reader.js',
    'create-module.js',
    'extract-all-modules.js',
    'play-module.js',
  ],

  // CLI TOOLS → src/legacy/cli/
  'legacy_cli': [
    'create-adnd1e.js',
    'create-character.js',
    'enhance.js',
    'learn.js',
    'onboard.js',
    'start-session.js',
    'session-prep.js',
    'pre-session-prep.js',
    'pregame-check.js',
    'command-center.js',
    'adnd-rule-engine.js',
  ],

  // DOCUMENTATION → src/legacy/documentation/
  'legacy_documentation': [
    'AMBIANCE-IMAGE-INTEGRATION.md',
    'ARCHITECTURE-NINE-PILLARS.md',
    'BACKEND-ARCHITECTURE-GUIDE.md',
    'BACKEND-BUILD-COMPLETE.md',
    'BUILD-SUMMARY.md',
    'CINEMATIC-AMBIANCE-INTEGRATION.md',
    'COMPLETE-BACKEND-IMPLEMENTATION.md',
    'COMPLETE-SYSTEM-FINAL.md',
    'COMPLETE-SYSTEM-INTEGRATION.md',
    'COMPLETE-SYSTEM-INVENTORY.md',
    'DM-MEMORY-COMPLETE.md',
    'DM-MEMORY-QUICK-START.md',
    'DM_DIRECTOR.md',
    'DM_PERSONA.md',
    'EIGHT-PILLARS-COMPLETE.md',
    'FINAL-BUILD-STATUS.md',
    'FINAL-BUILD-SUMMARY.md',
    'FINAL-DELIVERY-SUMMARY.md',
    'FINAL-SYSTEM-BUILD-PLAN.md',
    'FIVE-PILLARS-COMPLETE.md',
    'FOUR-PILLARS-COMPLETE.md',
    'HEARTBEAT.md',
    'IMAGE-HANDLER-GUIDE.md',
    'IMAGE-HANDLER-README.md',
    'LEARNING.md',
    'LEVEL-3-COMPLETE.md',
    'LOOT_TRACKING.md',
    'MODULE-SYSTEM-GUIDE.md',
    'MUSIC.md',
    'OPTION-B-COMPLETE.md',
    'ORCHESTRATOR-GUIDE.md',
    'PARTY_SYSTEM.md',
    'PILLAR-2-PERSISTENT-WORLD.md',
    'PILLAR-3-AGENCY-SPOTLIGHT.md',
    'PILLAR-4-UNCERTAINTY.md',
    'PILLAR-5-LEGIBILITY.md',
    'PILLAR-6-ORCHESTRATOR.md',
    'PILLAR-7-WORLD-STATE-GRAPH.md',
    'PILLAR-8-SPOTLIGHT-SCHEDULER.md',
    'PLAY-TSR-MODULES.md',
    'QUICK-REFERENCE.md',
    'QUICK-START-EXAMPLES.md',
    'QUICK-START.md',
    'SEVEN-PILLARS-COMPLETE.md',
    'SIX-PILLARS-COMPLETE.md',
    'SOUL.md',
    'START-HERE.md',
    'SYSTEM-COMPLETE.md',
    'SYSTEM-FINAL-SUMMARY.md',
    'THE-HEARTBEAT-COMPLETE.md',
    'THREE-PILLARS-COMPLETE.md',
    'TWO-PILLARS-COMPLETE.md',
    'UNIFIED-SYSTEM-COMPLETE.md',
  ],

  // CONFIG FILES (STAY IN ROOT)
  'stay_in_root': [
    'package.json',
    'dnd-config.json',
    'campaign.json',
    'party.json',
    'current_map.json',
    'inventory-system.json',
    'learning-system.json',
    'session_state.json',
    '.dnd-state.json',
    'auto_log.json',
    'api-keys.md',
  ],

  // SCRIPTS (STAY IN ROOT)
  'stay_in_root_scripts': [
    'check-api-keys.sh',
    'set-api-key.sh',
    'setup-images.sh',
  ],

  // DATA FILES (STAY IN ROOT)
  'stay_in_root_data': [
    'log.md',
    'session-2-log.md',
    'character_record_sheet.md',
  ],

  // DIRECTORIES (STAY IN ROOT)
  'stay_in_root_dirs': [
    'campaigns/',
    'characters/',
    'images/',
    'resources/',
    'skills/',
    '.git/',
  ],
};

// Summary
const totalFiles = Object.values(fileMapping)
  .filter(v => Array.isArray(v))
  .reduce((sum, arr) => sum + arr.length, 0);

console.log(`📊 FILE MAPPING SUMMARY`);
console.log(`═══════════════════════════════════════`);
console.log(`
Engines:           ${fileMapping.legacy_engines.length} files
Old Systems:       ${fileMapping.legacy_old_systems.length} files
Utilities:         ${fileMapping.legacy_utilities.length} files
Modules:           ${fileMapping.legacy_modules.length} files
CLI Tools:         ${fileMapping.legacy_cli.length} files
Documentation:     ${fileMapping.legacy_documentation.length} files
───────────────────────────────────────────
TOTAL TO ORGANIZE: ${totalFiles} files

Stay in root:      ${fileMapping.stay_in_root.length + fileMapping.stay_in_root_scripts.length + fileMapping.stay_in_root_data.length} files
Stay in root dirs: ${fileMapping.stay_in_root_dirs.length} dirs
`);

export { fileMapping };
