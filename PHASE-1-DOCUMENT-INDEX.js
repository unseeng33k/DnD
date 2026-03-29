/**
 * PHASE 1 REFACTORING - DOCUMENT INDEX
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This is your navigation guide to Phase 1 documentation.
 * 
 * START HERE: PHASE-1-QUICK-REFERENCE.txt
 */

const documentIndex = {
  phase1: {
    overview: 'PHASE 1: Move files to src/legacy/ + Update import paths (NO logic changes)',
    totalFiles: '96+ JavaScript + 50+ Markdown',
    duration: '~4 hours total',
    constraint: 'DO NOT change function bodies, signatures, or logic',
  },

  documents: {
    'PHASE-1-QUICK-REFERENCE.txt': {
      description: 'START HERE - One-page summary card',
      purpose: 'Quick lookup during execution',
      content: ['File move summary', 'Import path guide', 'Workflow', 'Status checklist'],
      readTime: '5 min',
      useWhen: 'You need quick answers while executing Phase 1'
    },

    'PHASE-1-MASTER-SUMMARY.md': {
      description: 'Complete Phase 1 reference (281 lines)',
      purpose: 'Comprehensive reference guide',
      content: ['Directory structure', 'File categories', 'Import examples', 'Execution steps', 'Complete checklist'],
      readTime: '20 min',
      useWhen: 'You want to understand the full Phase 1 scope'
    },

    'PHASE-1-MV-OPERATIONS.js': {
      description: 'All 96 file move operations',
      purpose: 'Complete mapping of file moves',
      content: [
        'Phase 1A: Engines (12 files)',
        'Phase 1B: Old Systems (17 files)',
        'Phase 1C: Utilities (20 files)',
        'Phase 1D: Modules (8 files)',
        'Phase 1E: CLI Tools (11 files)',
        'Phase 1F: Misc (18 files)'
      ],
      readTime: '10 min',
      useWhen: 'You need to see all mv operations organized by category'
    },

    'PHASE-1-IMPORT-RULES.js': {
      description: 'How to calculate import path changes',
      purpose: 'Reference for updating import statements',
      content: ['Depth rules', 'Pattern examples', 'Common mistakes'],
      readTime: '5 min',
      useWhen: 'You need to figure out what an import path should be'
    },

    'PHASE-1-EXAMPLE-UPDATES.js': {
      description: 'Concrete before/after: game-engine.js',
      purpose: 'Real-world example of import updates',
      content: ['Before imports', 'After imports', 'Changed comments', 'Unchanged paths'],
      readTime: '10 min',
      useWhen: 'You want to see exactly how imports should be updated'
    },

    'PHASE-1-OPERATIONS-COMPLETE.js': {
      description: 'Complete mapping with rules (309 lines)',
      purpose: 'Authoritative Phase 1 reference',
      content: ['All 96 moves', 'All import rules', 'Case examples', 'Execution guidance'],
      readTime: '15 min',
      useWhen: 'You need the complete detailed reference'
    },

    'PHASE-1-ALL-OPERATIONS.js': {
      description: 'All mv commands in executable format',
      purpose: 'Ready-to-run commands',
      content: ['Phase 1A commands', 'Phase 1B commands', 'Phase 1C commands', 'Phase 1D commands', 'Phase 1E commands', 'Phase 1F commands'],
      readTime: '5 min',
      useWhen: 'You want to generate a bash script with all mv operations'
    },

    'PHASE-1-IMPORT-REQUIREMENTS.js': {
      description: 'File-by-file import analysis (233 lines)',
      purpose: 'Know which files need import updates',
      content: [
        '11 high-probability files (NEEDS UPDATE)',
        '8 low-probability files (LIKELY STANDALONE)',
        'Before/after import examples',
        'Execution steps'
      ],
      readTime: '10 min',
      useWhen: 'You want to know exactly which files need attention'
    },
  },

  executionPath: {
    step1_review: {
      time: '5 min',
      action: 'Read PHASE-1-QUICK-REFERENCE.txt',
      goal: 'Understand the big picture'
    },

    step2_prepare: {
      time: '10 min',
      action: 'Verify directories exist: src/legacy/{engines,systems,utilities,modules,cli,documentation}',
      goal: 'Confirm your machine is ready'
    },

    step3_move_files: {
      time: '30 min',
      action: 'Execute all 96 mv commands from PHASE-1-ALL-OPERATIONS.js',
      goal: 'Move all files to new locations'
    },

    step4_update_imports: {
      time: '2-3 hours',
      action: 'Update import paths in moved files (11 high-probability + others)',
      goal: 'Fix import statements to reflect new file locations',
      reference: 'PHASE-1-IMPORT-REQUIREMENTS.js + PHASE-1-EXAMPLE-UPDATES.js'
    },

    step5_test: {
      time: '1 hour',
      action: 'Verify each moved file still imports correctly',
      goal: 'Catch any import errors before committing'
    },

    step6_commit: {
      time: '5 min',
      action: 'git add . && git commit -m "refactor: Phase 1 - move files and update imports"',
      goal: 'Save your work'
    },

    step7_phase2: {
      time: 'Later',
      action: 'When ready: Move to Phase 2 (Deduplication & Merging)',
      goal: 'Start merging duplicate code'
    }
  },

  importPathRules: {
    rule1: 'If both files move: update path (e.g., ./file → ../category/file)',
    rule2: 'If only source moves: path gets longer (e.g., ./root → ../../../root)',
    rule3: 'If imported file stays in root: path may lengthen',
    rule4: 'Always mark changes with // PATH UPDATE comment',
  },

  keyFiles: [
    'game-engine.js (multiple imports to check)',
    'session-runner.js (image-handler import)',
    'character-creator.js (character-personality, dice)',
    'party-system.js (spell, skill, inventory, dice)',
    'image-handler.js (dalle-images, gemini-images)',
    'dm-memory-system.js (logger, intent-parser)',
  ],

  summary: `
PHASE 1 AT A GLANCE:
═══════════════════════════════════════════════════════════════════════════

WHAT:    Move 96+ files to src/legacy/ + update import paths
HOW:     96 mv commands + update import statements
WHY:     Organize code into clean architecture
RULE:    NO function changes - only moves and import paths
TIME:    ~4 hours total
STATUS:  ✅ Fully documented and ready to execute

DOCUMENTS PROVIDED:
1. Quick reference (1 page)
2. Complete guide (281 lines)
3. All 96 mv operations
4. Import path rules & examples
5. File-by-file analysis
6. Execution checklist

START:   PHASE-1-QUICK-REFERENCE.txt
EXECUTE: 4-step workflow from that document
COMMIT:  When all imports are updated and tested
NEXT:    Phase 2 (Deduplication & Merging)
  `,
};

console.log(documentIndex.summary);
console.log('\nDocuments:');
Object.entries(documentIndex.documents).forEach(([name, info]) => {
  console.log(`\n${name}`);
  console.log(`  └─ ${info.description}`);
  console.log(`     Read time: ${info.readTime}`);
  console.log(`     Use when: ${info.useWhen}`);
});

export { documentIndex };
