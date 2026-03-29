# 🏗️ PHASE 1: FOLDER CLEANUP PLAN

**Goal:** Reorganize files WITHOUT changing any behavior, logic, or function signatures.

## Target Structure

```
dnd/
├── src/
│   ├── core/              (MOVE from root)
│   │   ├── event-bus.js
│   │   ├── registry.js
│   │   ├── effect-runtime.js
│   │   ├── turn-pipeline.js
│   │   └── index.js
│   ├── registries/        (MOVE from root)
│   ├── effects/           (MOVE from root)
│   ├── systems/           (MOVE from root)
│   ├── legacy/            (NEW - contains old scattered code)
│   │   ├── engines/       (game-engine.js, unified-dnd-engine.js, etc.)
│   │   ├── systems/       (old system files - will be deprecated)
│   │   ├── utilities/     (dice.js, logger.js, helpers)
│   │   ├── modules/       (module-related code)
│   │   ├── cli/           (CLI tools)
│   │   └── documentation/ (ALL .md files)
│   └── index.js           (NEW - unified entry point)
│
├── campaigns/             (STAYS)
├── characters/            (STAYS)
├── images/                (STAYS)
├── resources/             (STAYS)
├── skills/                (STAYS)
│
├── package.json           (STAYS)
├── dnd-config.json        (STAYS)
└── .git/                  (STAYS)
```

## Files to Move

### Core/Registries/Effects/Systems (ALREADY IN ROOT, MOVE TO src/)
- ✅ core/ → src/core/
- ✅ registries/ → src/registries/
- ✅ effects/ → src/effects/
- ✅ systems/ → src/systems/

### Legacy Code → src/legacy/engines/
Game engines and orchestrators:
- game-engine.js
- game-master-orchestrator.js
- game-master-orchestrator-v2.js
- unified-dnd-engine.js
- fiction-first-orchestrator.js
- integrated-dnd-system.js
- integrated-cinematic-ambiance.js
- ai-dungeon-master.js
- session-runner.js
- session-runner-enhanced.js

### Legacy Code → src/legacy/systems/
Old system files (will be deprecated when new systems/ is complete):
- party-system.js
- inventory-system.js
- spell-system.js
- skill-system.js
- roll-arbitration-engine.js
- mechanical-state-engine.js
- [others]

### Legacy Code → src/legacy/utilities/
Helper utilities:
- dice.js
- logger.js
- intent-parser.js
- item.js
- music.js
- playlist.js
- scenes.js
- visual.js
- etc.

### Legacy Code → src/legacy/modules/
Module and encounter related:
- adventure-module-system.js
- complete-module-extractor.js
- module-builder.js
- pdf-backed-module-system.js
- pdf-module-reader.js
- create-module.js
- extract-all-modules.js
- play-module.js

### Legacy Code → src/legacy/cli/
Command-line tools:
- create-adnd1e.js
- create-character.js
- dnd-images-cli.js
- enhance.js
- learn.js
- onboard.js
- start-session.js
- session-prep.js
- pre-session-prep.js
- [others]

### Documentation → src/legacy/documentation/
ALL markdown files (60+):
- AMBIANCE-IMAGE-INTEGRATION.md
- ARCHITECTURE-NINE-PILLARS.md
- [all others]

## Step-by-Step Execution

1. ✅ Create src/ directory structure
2. ✅ Move core/, registries/, effects/, systems/ into src/
3. ✅ Create src/legacy/ subdirectories
4. ✅ Move legacy files to appropriate subdirectories
5. ✅ Create src/index.js (unified entry point)
6. ✅ Update imports in moved files (if necessary)
7. ✅ Verify all functionality works
8. ✅ Git commit with "Phase 1 cleanup complete"

## Import Strategy

**No files change behavior.** Only paths change.

If a file at `src/legacy/engines/game-engine.js` imports from `../../../core/`, it will become:
```javascript
import { eventBus } from '../../../core/event-bus.js';
```

This is a **path update only**, no logic changes.

## Test Plan

After reorganization:
- ✅ All files are where they should be
- ✅ No broken imports
- ✅ Same exports from index.js
- ✅ Game runs without errors

---

**Ready to execute Phase 1?** 🏗️
