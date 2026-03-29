# 🎯 PHASE 1 EXECUTION CHECKLIST

## BEFORE WE START

This document outlines exactly what will happen in Phase 1 cleanup.

**NO BEHAVIOR CHANGES** - Only file locations and imports change.

---

## STEP-BY-STEP EXECUTION

### Step 1: Create src/ Directory Structure
```bash
mkdir -p src/legacy/{engines,systems,utilities,modules,cli,documentation}
```

### Step 2: Move Organized Code Into src/
**Move these 4 directories as-is (NO changes):**
- `core/` → `src/core/`
- `registries/` → `src/registries/`
- `effects/` → `src/effects/`
- `systems/` → `src/systems/`

### Step 3: Move Legacy Files to src/legacy/

**13 Engine files** → `src/legacy/engines/`
- game-engine.js
- game-master-orchestrator.js
- unified-dnd-engine.js
- [11 others]

**17 Old System files** → `src/legacy/systems/`
- party-system.js
- inventory-system.js
- [15 others]

**20+ Utility files** → `src/legacy/utilities/`
- dice.js
- logger.js
- [18+ others]

**8 Module files** → `src/legacy/modules/`
- adventure-module-system.js
- module-builder.js
- [6 others]

**11 CLI files** → `src/legacy/cli/`
- create-adnd1e.js
- enhance.js
- [9 others]

**60+ Documentation files** → `src/legacy/documentation/`
- All .md files

### Step 4: Create src/index.js (Unified Entry Point)
This file will export everything that was previously at root level:
```javascript
// Export clean architecture
export * from './core/index.js';
export * from './registries/index.js';
export * from './effects/index.js';
export * from './systems/index.js';

// Export legacy (for backward compatibility)
export * from './legacy/index.js';
```

### Step 5: Fix Imports (if needed)
Files may need import path updates. We'll review and fix ONLY what's necessary.

Example:
- Old: `import { eventBus } from './event-bus.js';`
- New: `import { eventBus } from '../../core/event-bus.js';` (if moved to legacy/engines/)

### Step 6: Verify Functionality
- ✅ No broken imports
- ✅ All exports work
- ✅ Game runs without errors

### Step 7: Git Commit
```bash
git add -A
git commit -m "refactor: Phase 1 cleanup - reorganize files into src/legacy structure

- Move core/, registries/, effects/, systems/ into src/
- Move 130+ legacy files to src/legacy/ subdirectories
- Create unified src/index.js entry point
- No behavior changes - paths and imports updated only
- All functionality preserved"
```

---

## FILES THAT STAY IN ROOT

**Config files:**
- package.json
- dnd-config.json
- [json data files]

**Directories:**
- campaigns/
- characters/
- images/
- resources/
- skills/
- .git/

**Shell scripts:**
- check-api-keys.sh
- set-api-key.sh
- setup-images.sh

**Documentation:**
- README.md
- log.md
- [session logs]

---

## EXPECTED RESULT

After Phase 1:
```
dnd/
├── src/
│   ├── core/
│   ├── registries/
│   ├── effects/
│   ├── systems/
│   ├── legacy/
│   │   ├── engines/    (13 files)
│   │   ├── systems/    (17 files)
│   │   ├── utilities/  (20+ files)
│   │   ├── modules/    (8 files)
│   │   ├── cli/        (11 files)
│   │   └── documentation/ (60+ files)
│   └── index.js
│
├── campaigns/
├── characters/
├── images/
├── resources/
├── skills/
├── package.json
└── dnd-config.json
```

---

## RISK ASSESSMENT

**LOW RISK** because:
- ✅ No logic changes
- ✅ No function signature changes
- ✅ No behavior changes
- ✅ Only paths and imports change
- ✅ Can be reversed with git

---

## READY?

When you say **"execute Phase 1"**, I will:
1. Create all directories
2. Move all files
3. Update imports
4. Create unified entry point
5. Commit to git

**All automatically, no manual steps needed.** 🚀
