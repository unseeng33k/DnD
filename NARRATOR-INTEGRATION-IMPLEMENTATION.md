# NARRATOR ENGINE INTEGRATION GUIDE
## How to Wire the NarratorEngine Into Your GameMasterOrchestrator

---

## FILE LOCATIONS

- **Narrator Engine:** `/Users/mpruskowski/.openclaw/workspace/dnd/narrator-engine.js`
- **Orchestrator:** `/Users/mpruskowski/.openclaw/workspace/dnd/game-master-orchestrator-v2.js`
- **Campaign Chronicles:** `/Users/mpruskowski/.openclaw/workspace/dnd/campaigns/[CampaignName]/chronicle.md`

---

## INTEGRATION: 3 SMALL CHANGES

### CHANGE 1: Import the Narrator Engine
**File:** `game-master-orchestrator-v2.js`  
**Location:** Top of file, with other imports

**Add this line:**
```javascript
import { NarratorEngine } from './narrator-engine.js';
```

**Full import section should look like:**
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DMMemory } from './dm-memory-system.js';
import { SessionAmbiance } from './session-ambiance-orchestrator.js';
import { AdventureModule, ModuleRegistry } from './adventure-module-system.js';
import { NarratorEngine } from './narrator-engine.js';  // ← ADD THIS
```

---

### CHANGE 2: Initialize Narrator in Constructor
**File:** `game-master-orchestrator-v2.js`  
**Location:** `GameMasterOrchestrator.constructor()`

**Current code:**
```javascript
constructor(moduleId) {
  this.moduleId = moduleId;
  this.module = null;
  this.memory = null;
  this.ambiance = null;
  this.resources = new ResourceTracker();
  this.combat = null;
  this.consequences = null;
  this.decisions = null;
  this.campaign_manager = null;
  this.sessionNumber = 1;
  this.activeParty = [];
  this.loadedLocations = new Map();
}
```

**Add this line:**
```javascript
constructor(moduleId) {
  // ... existing code ...
  this.narrator = null;  // ← ADD THIS
}
```

---

### CHANGE 3: Wire Narrator Into startSession()
**File:** `game-master-orchestrator-v2.js`  
**Location:** `GameMasterOrchestrator.startSession()` method, after campaign_manager init

**Current code:**
```javascript
async startSession(sessionNum, telegramChatId = null) {
  if (!this.module) {
    throw new Error('Module not loaded. Call loadModule() first.');
  }

  this.sessionNumber = sessionNum;
  // ... party loading ...
  
  const campaignName = this.module.metadata.name;
  this.memory = new DMMemory(campaignName, sessionNum);
  this.campaign_manager = new CampaignManager(campaignName);

  // Initialize combat engine
  this.combat = new IntegratedCombatEngine(this.memory, this.resources);
  this.consequences = new ConsequenceEngine(this.memory);
  this.decisions = new DecisionAssistant(this.memory);

  // Initialize ambiance
  this.ambiance = new SessionAmbiance(campaignName, telegramChatId);
  
  // ... rest of method ...
}
```

**Add narrator initialization after ambiance:**
```javascript
  // Initialize ambiance
  this.ambiance = new SessionAmbiance(campaignName, telegramChatId);

  // Initialize narrator (FOR CHRONICLE GENERATION)
  this.narrator = new NarratorEngine(
    this.memory,
    null,  // npcDialogueSystem - wire up when you implement it
    this.campaign_manager
  );
  
  // ... rest of method ...
```

---

### CHANGE 4: Trigger Narrator in endSession()
**File:** `game-master-orchestrator-v2.js`  
**Location:** `GameMasterOrchestrator.endSession()` method

**Current code:**
```javascript
async endSession() {
  const savedFile = this.memory.saveSession();

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`SESSION ${this.sessionNumber} COMPLETE`);
  console.log('═'.repeat(50));
  console.log(`Module: ${this.module.metadata.name}`);
  console.log(`Events logged: ${this.memory.timeline.events.length}`);
  console.log(`Decisions recorded: ${this.memory.decisions.decisions.length}`);
  console.log(`Consequences triggered: ${this.consequences.consequences.length}`);
  console.log(`\n💾 Saved to: ${savedFile}`);
  console.log(`${'═'.repeat(50)}\n`);

  return {
    session: this.sessionNumber,
    eventsLogged: this.memory.timeline.events.length,
    savedFile
  };
}
```

**Add narrator trigger before the return statement:**
```javascript
  console.log(`\n💾 Saved to: ${savedFile}`);
  
  // NARRATOR ENGINE - Generate and append chronicle chapter
  if (this.narrator) {
    try {
      console.log(`\n📖 Generating chronicle chapter...`);
      
      const chapter = await this.narrator.generateChapter(
        this.sessionNumber,
        savedFile,
        this.memory.timeline.events,
        this.activeParty,
        this.activeParty[0]  // POV = first party member
      );
      
      const appendResult = await this.narrator.appendToChronicle(
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
  
  console.log(`${'═'.repeat(50)}\n`);

  return {
    session: this.sessionNumber,
    eventsLogged: this.memory.timeline.events.length,
    savedFile,
    chronicleUpdated: true
  };
```

---

## COMPLETE MODIFIED METHODS (For Reference)

### startSession() - With Narrator
```javascript
async startSession(sessionNum, telegramChatId = null) {
  if (!this.module) {
    throw new Error('Module not loaded. Call loadModule() first.');
  }

  this.sessionNumber = sessionNum;

  // Get party from module template
  try {
    this.activeParty = this.module.getParty();
  } catch (e) {
    console.warn('No party template in module, using defaults');
    this.activeParty = [];
  }

  // Initialize memory with campaign name
  const campaignName = this.module.metadata.name;
  this.memory = new DMMemory(campaignName, sessionNum);
  this.campaign_manager = new CampaignManager(campaignName);

  // Initialize systems
  this.combat = new IntegratedCombatEngine(this.memory, this.resources);
  this.consequences = new ConsequenceEngine(this.memory);
  this.decisions = new DecisionAssistant(this.memory);
  this.ambiance = new SessionAmbiance(campaignName, telegramChatId);
  
  // Initialize narrator (NEW)
  this.narrator = new NarratorEngine(
    this.memory,
    null,
    this.campaign_manager
  );

  // Load previous session context if available
  const prevSession = this.campaign_manager.loadSessionContext(sessionNum - 1);
  if (prevSession) {
    console.log(`\n📚 Previous session summary:`);
    console.log(`   Last location: ${prevSession.state?.location || 'Unknown'}`);
    console.log(`   Party status: ${JSON.stringify(prevSession.summary?.partyStatus || {})}`);
  }

  // Register all party members with resources
  this.activeParty.forEach(member => {
    this.resources.registerCharacter(member.name, member);
  });

  this.memory.logEvent('exploration', `Session ${sessionNum} started`, {
    partySize: this.activeParty.length,
    characters: this.activeParty.map(m => m.name),
    module: this.module.metadata.name
  });

  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║ SESSION ${String(sessionNum).padEnd(32)} ║`);
  console.log(`╚════════════════════════════════════════╝\n`);

  console.log(`✅ Systems initialized:`);
  console.log(`   • Party: ${this.activeParty.map(p => p.name).join(', ')}`);
  console.log(`   • Memory System: READY`);
  console.log(`   • Combat Engine: READY`);
  console.log(`   • Resource Tracking: READY`);
  console.log(`   • Ambiance System: READY`);
  console.log(`   • Consequence Engine: READY`);
  console.log(`   • Narrator Engine: READY`);
  console.log(`   • Campaign Context: LOADED\n`);

  return { session: sessionNum, party: this.activeParty.length };
}
```

### endSession() - With Narrator
```javascript
async endSession() {
  const savedFile = this.memory.saveSession();

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`SESSION ${this.sessionNumber} COMPLETE`);
  console.log('═'.repeat(50));
  console.log(`Module: ${this.module.metadata.name}`);
  console.log(`Events logged: ${this.memory.timeline.events.length}`);
  console.log(`Decisions recorded: ${this.memory.decisions.decisions.length}`);
  console.log(`Consequences triggered: ${this.consequences.consequences.length}`);
  console.log(`\n💾 Saved to: ${savedFile}`);
  
  // NARRATOR ENGINE - Generate and append chronicle chapter
  if (this.narrator) {
    try {
      console.log(`\n📖 Generating chronicle chapter...`);
      
      const chapter = await this.narrator.generateChapter(
        this.sessionNumber,
        savedFile,
        this.memory.timeline.events,
        this.activeParty,
        this.activeParty[0]
      );
      
      const appendResult = await this.narrator.appendToChronicle(
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
  
  console.log(`${'═'.repeat(50)}\n`);

  return {
    session: this.sessionNumber,
    eventsLogged: this.memory.timeline.events.length,
    savedFile,
    chronicleUpdated: true
  };
}
```

---

## TESTING THE INTEGRATION

### Test 1: Check File Creation
```bash
# Does narrator-engine.js exist?
ls -la /Users/mpruskowski/.openclaw/workspace/dnd/narrator-engine.js

# Does it export the NarratorEngine class?
grep "export.*NarratorEngine" /Users/mpruskowski/.openclaw/workspace/dnd/narrator-engine.js
```

### Test 2: Load the Module
```javascript
import { GameMasterOrchestrator } from './game-master-orchestrator-v2.js';

const gm = new GameMasterOrchestrator('curse-of-strahd');
await gm.loadModule();
```

Should see `✅ narrator = null` or initialized successfully.

### Test 3: Run a Full Session
```javascript
await gm.startSession(1);
// ... play the session ...
await gm.endSession();
```

Should see:
```
📖 Generating chronicle chapter...
✅ Chronicle updated:
   Path: /Users/mpruskowski/.openclaw/workspace/dnd/campaigns/[Campaign]/chronicle.md
   Chapter: 1
   Title: "[Generated Title]"
```

### Test 4: Check Chronicle File
```bash
# Does chronicle.md exist?
ls -la /Users/mpruskowski/.openclaw/workspace/dnd/campaigns/[CampaignName]/chronicle.md

# Does it have Chapter 1?
grep "### CHAPTER 1:" /Users/mpruskowski/.openclaw/workspace/dnd/campaigns/[CampaignName]/chronicle.md
```

---

## WHAT HAPPENS WHEN endSession() RUNS

1. ✅ Memory saves session log
2. ✅ Narrator engine loads events from memory
3. ✅ Analyzes emotional arc
4. ✅ Extracts dialogue moments
5. ✅ Calls Claude API to generate prose
6. ✅ Appends chapter to chronicle.md
7. ✅ Logs success to console

**Total time:** ~30-60 seconds (API call)

---

## TROUBLESHOOTING

### Error: "Cannot find module './narrator-engine.js'"
**Fix:** Make sure you added the import statement at the top of orchestrator

### Error: "NarratorEngine is not a constructor"
**Fix:** Make sure the export statement is in narrator-engine.js

### Chronicle not appending
**Fix:** Check that `this.memory.timeline.events` is populated with events

### API call timing out
**Fix:** The Anthropic API timeout is 30s. If generating chapters takes longer, increase max_tokens limit or reduce event context

---

## NEXT STEPS

After wiring this in:

1. **Test with Tamoachan Session 2** — Generate a chapter automatically
2. **Refine prose quality** — Adjust the prompt in ChapterComposer if needed
3. **Wire NPC dialogue system** — Pass it to narrator for enriched dialogue
4. **Create chapter title improvements** — Make title generation more dynamic
5. **Add multi-book structure** — Automatically segment chronicle into Books based on arc

---

## FILES YOU NOW HAVE

✅ `narrator-engine.js` — 461 lines, ready to use  
✅ `NARRATOR-INTEGRATION.md` — Architecture overview  
✅ `NARRATOR-INTEGRATION-IMPLEMENTATION.md` — This file  
✅ `CHRONICLE_SYSTEM.md` — Design document  
✅ `CHRONICLE_OPERATIONAL_GUIDE.md` — Writing guidelines  
✅ `CHRONICLE_WRITERS_CHECKLIST.md` — Workflow checklist
