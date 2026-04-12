/**
 * PHASE 1 - IMPORT UPDATE REQUIREMENTS BY FILE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This document identifies which files need import path updates.
 * Files are listed with their BEFORE and AFTER import paths.
 * 
 * CRITICAL RULE: Only update imports for files that MOVE
 * If both the moved file AND its imported file move, update the path
 * If only moved file moves (imported file stays in root), path gets longer
 */

// ═══════════════════════════════════════════════════════════════════════════
// HIGH PROBABILITY IMPORT UPDATES
// ═══════════════════════════════════════════════════════════════════════════

const highProbability = {
  'src/legacy/engines/game-engine.js': {
    reason: 'Multiple root imports to moved files',
    imports: [
      { from: './party_manager', to: '../systems/party_manager', mark: true },
      { from: './logger', to: '../utilities/logger', mark: true },
    ],
    note: 'Skills/ imports stay same (root stays in root)'
  },

  'src/legacy/engines/session-runner.js': {
    reason: 'Imports image-handler which moves to utilities',
    imports: [
      { from: './image-handler.js', to: '../utilities/image-handler.js', mark: true },
    ]
  },

  'src/legacy/engines/unified-dnd-engine.js': {
    reason: 'Likely imports multiple systems',
    imports: [
      // Update paths for any system imports
    ]
  },

  'src/legacy/engines/integrated-dnd-system.js': {
    reason: 'Likely imports various systems and utilities',
    imports: [
      // Update paths for system/utility imports
    ]
  },

  'src/legacy/utilities/character-creator.js': {
    reason: 'Imports character-personality and dice',
    imports: [
      { from: './character-personality.js', to: './character-personality.js', mark: false, reason: 'Both in utilities' },
      { from: './dice.js', to: './dice.js', mark: false, reason: 'Both in utilities' },
    ]
  },

  'src/legacy/utilities/dm-memory-system.js': {
    reason: 'Imports logger and intent-parser',
    imports: [
      { from: './logger.js', to: './logger.js', mark: false, reason: 'Both in utilities' },
      { from: './intent-parser.js', to: './intent-parser.js', mark: false, reason: 'Both in utilities' },
    ]
  },

  'src/legacy/utilities/image-handler.js': {
    reason: 'Imports dalle-images, gemini-images, and utilities',
    imports: [
      { from: './dalle-images.js', to: './dalle-images.js', mark: false, reason: 'Same directory' },
      { from: './gemini-images.js', to: './gemini-images.js', mark: false, reason: 'Same directory' },
      { from: './cli-image-display.js', to: './cli-image-display.js', mark: false, reason: 'Same directory' },
    ]
  },

  'src/legacy/systems/party-system.js': {
    reason: 'Imports spell, skill, inventory systems in same dir; dice in utilities',
    imports: [
      { from: './spell-system.js', to: './spell-system.js', mark: false, reason: 'Same directory' },
      { from: './skill-system.js', to: './skill-system.js', mark: false, reason: 'Same directory' },
      { from: './inventory-system.js', to: './inventory-system.js', mark: false, reason: 'Same directory' },
      { from: './dice.js', to: '../utilities/dice.js', mark: true, reason: 'Dice moved to utilities' },
    ]
  },

  'src/legacy/systems/spell-system.js': {
    reason: 'Likely imports dice for spell rolls',
    imports: [
      { from: './dice.js', to: '../utilities/dice.js', mark: true, reason: 'Dice moved to utilities' },
    ]
  },

  'src/legacy/systems/skill-system.js': {
    reason: 'Likely imports dice for skill checks',
    imports: [
      { from: './dice.js', to: '../utilities/dice.js', mark: true, reason: 'Dice moved to utilities' },
    ]
  },

  'src/legacy/systems/roll-arbitration-engine.js': {
    reason: 'Imports dice directly',
    imports: [
      { from: './dice.js', to: '../utilities/dice.js', mark: true, reason: 'Dice moved to utilities' },
    ]
  },

  'src/legacy/modules/adventure-module-system.js': {
    reason: 'Imports character-creator which moves to utilities',
    imports: [
      { from: './character-creator.js', to: '../utilities/character-creator.js', mark: true },
    ]
  },

  'src/legacy/cli/create-character.js': {
    reason: 'Imports character-creator and dice from utilities',
    imports: [
      { from: './character-creator.js', to: '../utilities/character-creator.js', mark: true },
      { from: './dice.js', to: '../utilities/dice.js', mark: true },
    ]
  },

  'src/legacy/cli/start-session.js': {
    reason: 'Imports various systems and utilities',
    imports: [
      // Needs analysis
    ]
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LOW PROBABILITY IMPORT UPDATES
// ═══════════════════════════════════════════════════════════════════════════

const lowProbability = {
  'src/legacy/utilities/dice.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/logger.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/item.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/music.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/playlist.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/visual.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/scenes.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },

  'src/legacy/utilities/intent-parser.js': {
    reason: 'Likely standalone utility',
    needsUpdate: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION STEPS
// ═══════════════════════════════════════════════════════════════════════════

const executionSteps = `
STEP 1: Review High Probability Files (11 files)
  1. game-engine.js           → Check ./party_manager, ./logger
  2. session-runner.js        → Check ./image-handler
  3. unified-dnd-engine.js    → Check any system imports
  4. integrated-dnd-system.js → Check any system imports
  5. character-creator.js     → Check ./character-personality, ./dice
  6. dm-memory-system.js      → Check ./logger, ./intent-parser
  7. image-handler.js         → Check ./dalle-images, ./gemini-images
  8. party-system.js          → Check ./dice import path
  9. spell-system.js          → Check ./dice import path
  10. create-character.js     → Check ./character-creator, ./dice
  11. start-session.js        → Check all system imports

STEP 2: Review Lower Priority Files (others with imports)

STEP 3: For each file needing update:
  a. Open file in editor
  b. Find import/require statements
  c. Check if imported file also moved
  d. Calculate new path using import rules
  e. Update line and add // PATH UPDATE comment
  f. Save file

STEP 4: Test
  a. Try requiring/importing each modified file
  b. Look for "module not found" errors
  c. Fix any path errors

STEP 5: Commit
  git add .
  git commit -m "refactor: Phase 1 - update import paths after file moves"
`;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║              PHASE 1 - IMPORT UPDATE REQUIREMENTS                         ║
║                                                                           ║
║  Total files needing updates: 11 (high probability)                       ║
║  Total files likely standalone: 8 (low probability)                       ║
║  Others: Requires case-by-case analysis                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

HIGH PROBABILITY IMPORTS (analyze these first)
${Object.entries(highProbability).map(([file, data]) => `
FILE: ${file}
REASON: ${data.reason}
IMPORTS TO CHECK:
${data.imports ? data.imports.map(imp => `  ${imp.from} → ${imp.to}${imp.mark ? ' [NEEDS UPDATE]' : ' [no change]'}`).join('\n') : '  (see note)'}
${data.note ? `NOTE: ${data.note}` : ''}
`).join('\n')}

${executionSteps}
`);

module.exports = { highProbability, lowProbability };
