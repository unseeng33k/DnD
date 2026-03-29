#!/usr/bin/env node

/**
 * PHASE 2 IMPORT FIX SCRIPT
 * 
 * This script fixes all broken imports by updating engines to import
 * from src/legacy/systems/ instead of src/legacy/engines/
 * 
 * Usage: node fix-phase2-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Files to update and their import patterns
const updates = {
  'grond-malice-adventure.js': [
    {
      old: "import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';",
      new: "// PATH UPDATE: spotlight-pacing-scheduler moved to systems\nimport { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';"
    },
    {
      old: "import { MechanicalStateEngine } from './mechanical-state-engine.js';",
      new: "// PATH UPDATE: mechanical-state-engine moved to systems\nimport { MechanicalStateEngine } from '../systems/mechanical-state-engine.js';"
    }
  ],
  'grond-malice-adventure-v2.js': [
    {
      old: "import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';",
      new: "// PATH UPDATE: spotlight-pacing-scheduler moved to systems\nimport { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';"
    }
  ],
  'malice-bridge-combat.js': [
    {
      old: "import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';",
      new: "// PATH UPDATE: spotlight-pacing-scheduler moved to systems\nimport { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';"
    },
    {
      old: "import { MechanicalStateEngine } from './mechanical-state-engine.js';",
      new: "// PATH UPDATE: mechanical-state-engine moved to systems\nimport { MechanicalStateEngine } from '../systems/mechanical-state-engine.js';"
    }
  ],
  'playtest-narrative.js': [
    {
      old: "import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';",
      new: "// PATH UPDATE: spotlight-pacing-scheduler moved to systems\nimport { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';"
    },
    {
      old: "import { MechanicalStateEngine } from './mechanical-state-engine.js';",
      new: "// PATH UPDATE: mechanical-state-engine moved to systems\nimport { MechanicalStateEngine } from '../systems/mechanical-state-engine.js';"
    }
  ],
  'playtest-runner.js': [
    {
      old: "import { SpotlightPacingScheduler } from './spotlight-pacing-scheduler.js';",
      new: "// PATH UPDATE: spotlight-pacing-scheduler moved to systems\nimport { SpotlightPacingScheduler } from '../systems/spotlight-pacing-scheduler.js';"
    },
    {
      old: "import { MechanicalStateEngine } from './mechanical-state-engine.js';",
      new: "// PATH UPDATE: mechanical-state-engine moved to systems\nimport { MechanicalStateEngine } from '../systems/mechanical-state-engine.js';"
    }
  ],
  'adventure-with-full-ambiance.js': [
    {
      old: "import { ImageGenerator } from './image-generator.js';",
      new: "// PATH UPDATE: image-generator moved to systems\nimport { ImageGenerator } from '../systems/image-generator.js';"
    }
  ],
  'quest-engine-with-ambiance.js': [
    {
      old: "import { ImageGenerator } from './image-generator.js';",
      new: "// PATH UPDATE: image-generator moved to systems\nimport { ImageGenerator } from '../systems/image-generator.js';"
    }
  ]
};

async function fixImports() {
  const enginesDir = path.join(__dirname, 'src/legacy/engines');
  let fixed = 0;
  let errors = 0;

  for (const [filename, replacements] of Object.entries(updates)) {
    const filepath = path.join(enginesDir, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  File not found: ${filename}`);
      errors++;
      continue;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    for (const { old, new: newImport } of replacements) {
      if (content.includes(old)) {
        content = content.replace(old, newImport);
        modified = true;
        console.log(`✅ Fixed import in ${filename}`);
        fixed++;
      }
    }

    if (modified) {
      fs.writeFileSync(filepath, content, 'utf8');
    }
  }

  console.log(`\n📊 PHASE 2 IMPORT FIX SUMMARY:`);
  console.log(`✅ Fixed: ${fixed} imports`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📍 Location: src/legacy/engines/`);
  console.log(`📁 Systems: src/legacy/systems/`);
}

fixImports().catch(console.error);
