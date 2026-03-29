# NARRATOR SYSTEM - UPDATED INTEGRATION GUIDE
## Narrator System Now in `/src/systems/narrator/`

---

## The 4 Code Changes (UPDATED PATHS)

All changes go in `game-master-orchestrator-v2.js`

### Change 1: Add Import (Line ~18)
```javascript
import { NarratorEngine } from './src/systems/narrator/index.js';
```

### Change 2: Add to Constructor
```javascript
this.narratorEngine = null;
```

### Change 3: Initialize in startSession() (After ambiance init)
```javascript
// Initialize narrator for chronicle generation
this.narratorEngine = new NarratorEngine(
  this.memory,
  null,  // npcDialogueSystem - wire up when available
  this.campaign_manager
);
```

### Change 4: Trigger in endSession() (Before final return)
```javascript
// NARRATOR ENGINE - Generate and append chronicle chapter
if (this.narratorEngine) {
  try {
    console.log(`\n📖 Generating chronicle chapter...`);
    
    const chapter = await this.narratorEngine.generateChapter(
      this.sessionNumber,
      savedFile,
      this.memory.timeline.events,
      this.activeParty,
      this.activeParty[0]
    );
    
    const appendResult = await this.narratorEngine.appendToChronicle(
      this.module.metadata.name,
      chapter
    );
    
    console.log(`\n✅ Chronicle updated:`);
    console.log(`   Path: ${appendResult.chroniclePath}`);
    console.log(`   Chapter: ${appendResult.chapter}`);
    console.log(`   Title: "${appendResult.title}"`);
  } catch (narratorError) {
    console.error(`\n⚠️  Chronicle generation failed:`, narratorError.message);
    console.log(`   (Session saved, but chapter not appended)`);
  }
}
```

---

## File Locations

**Narrator System:**
- `/src/systems/narrator/narrator-engine.js` (440 lines)
- `/src/systems/narrator/index.js` (exports)
- `/src/systems/narrator/README.md`

**Documentation:**
- `/src/systems/narrator/docs/NARRATOR-INTEGRATION.md`
- `/src/systems/narrator/REORGANIZATION-SUMMARY.md`

---

## Testing

### Verify Import Works
```javascript
import { NarratorEngine } from './src/systems/narrator/index.js';
console.log(NarratorEngine);  // Should show class definition
```

### Run a Session
```javascript
const gm = new GameMasterOrchestrator('tamoachan-expedition');
await gm.loadModule();
await gm.startSession(1);
// ... play ...
await gm.endSession();  // Should trigger narrator
```

---

## Directory Structure

```
dnd/
├── src/
│   └── systems/
│       ├── narrator/               ← NEW LOCATION
│       │   ├── narrator-engine.js
│       │   ├── index.js
│       │   ├── README.md
│       │   ├── REORGANIZATION-SUMMARY.md
│       │   └── docs/
│       │       └── NARRATOR-INTEGRATION.md
│       ├── ambiance-system.js
│       ├── calibration-engine.js
│       ├── cinematic-ambiance-orchestrator.js
│       └── ... (other systems)
├── game-master-orchestrator-v2.js
├── campaigns/
│   └── Tamoachan Expedition/
│       └── chronicle.md
└── ... (rest of project)
```

---

## What's Ready

✅ Narrator engine implemented (440 lines, 6 classes)  
✅ System properly organized in `/src/systems/`  
✅ Documentation in `docs/` subfolder  
✅ README with overview  
✅ Integration guide (this document)  

---

## Next Steps

1. Update import in `game-master-orchestrator-v2.js` to new path
2. Make the 4 code changes
3. Test with a session
4. Watch chronicle grow

**You're ready to build epics!**
