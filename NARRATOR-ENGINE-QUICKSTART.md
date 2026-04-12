# NARRATOR ENGINE - QUICK START
## Get Your First Chapter Generated in 5 Minutes

---

## WHAT YOU JUST GOT

- ✅ **narrator-engine.js** (461 lines) — Full implementation
- ✅ **NARRATOR-INTEGRATION.md** — Architecture overview
- ✅ **NARRATOR-INTEGRATION-IMPLEMENTATION.md** — Wiring guide

---

## THE 4 CHANGES YOU NEED TO MAKE

### 1. Add Import (1 line)
**File:** `game-master-orchestrator-v2.js` - Line 18 (top imports)

```javascript
import { NarratorEngine } from './narrator-engine.js';
```

### 2. Add to Constructor (1 line)
**File:** `game-master-orchestrator-v2.js` - GameMasterOrchestrator constructor

```javascript
this.narrator = null;
```

### 3. Initialize in startSession() (6 lines)
**File:** `game-master-orchestrator-v2.js` - After `this.ambiance = ...` line

```javascript
  // Initialize narrator (FOR CHRONICLE GENERATION)
  this.narrator = new NarratorEngine(
    this.memory,
    null,
    this.campaign_manager
  );
```

### 4. Trigger in endSession() (20 lines)
**File:** `game-master-orchestrator-v2.js` - Before final return statement

```javascript
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
```

---

## HOW IT WORKS (High Level)

```
You call endSession()
        ↓
Memory saves raw events
        ↓
Narrator engine kicks in
├─ Analyzes emotional arc
├─ Extracts NPC dialogue moments
├─ Calls Claude API with context
└─ Generates 2,500-4,000 word chapter
        ↓
Chapter appended to chronicle.md
        ↓
Console shows: ✅ Chronicle updated
```

---

## WHAT HAPPENS TO YOUR CHRONICLE.MD

### Before (First Session)
```
# TAMOACHAN EXPEDITION
## A Chronicle of the Descent into Jade and Darkness

---

## BOOK ONE: THE SUMMONS

### CHAPTER I: The Jungle Approach

The jungle was alive with hunger...
[your prologue content]

---
```

### After endSession() (Session 2)
```
# TAMOACHAN EXPEDITION
## A Chronicle of the Descent into Jade and Darkness

---

## BOOK ONE: THE SUMMONS

### CHAPTER I: The Jungle Approach

The jungle was alive with hunger...
[your prologue content]

---

### CHAPTER II: Blood on Stone

[AUTO-GENERATED CHAPTER FROM SESSION 2]
Malice descended deeper into darkness...

---
```

**Each session automatically adds a new chapter.**

---

## TESTING IT

### Quick Test Script
```javascript
import { GameMasterOrchestrator } from './game-master-orchestrator-v2.js';

// 1. Load module
const gm = new GameMasterOrchestrator('tamoachan-expedition');
await gm.loadModule();

// 2. Start session
await gm.startSession(1);

// 3. Log some dummy events (or play normally)
gm.memory.logEvent('exploration', 'Party enters temple', {
  location: 'Temple Entrance'
});
gm.memory.logEvent('discovery', 'Ancient stone tablet found', {
  description: 'Warnings in ancient language'
});

// 4. End session (THIS TRIGGERS NARRATOR)
await gm.endSession();

// 5. Check chronicle
const fs = require('fs');
const chronicle = fs.readFileSync(
  '/Users/mpruskowski/.openclaw/workspace/dnd/campaigns/Tamoachan Expedition/chronicle.md',
  'utf8'
);
console.log(chronicle.substring(0, 500));  // Show first 500 chars
```

**Expected output:**
```
📖 Generating chronicle chapter...
✅ Chronicle updated:
   Path: /Users/mpruskowski/.openclaw/workspace/dnd/campaigns/Tamoachan Expedition/chronicle.md
   Chapter: 1
   Title: "[Generated Title]"
```

---

## KEY FEATURES

### 1. Automatic Title Generation
Based on session events, the narrator generates thematic titles:
- Combat-heavy: "Blood on Stone", "The Reckoning"
- Discovery-heavy: "The Truth Revealed", "Secrets Unearthed"
- Betrayal-heavy: "Broken Promises", "The Knife in the Back"

### 2. Emotional Arc Analysis
Narrator analyzes:
- What was explored
- What was discovered
- What combat happened
- What roleplay occurred
- Overall tone (dark, cynical, tense, etc.)

### 3. George R.R. Martin + Joe Abercrombie Style
- Multiple POV chapters (defaults to first party member)
- Internal monologue and introspection
- Specific sensory details (not generic)
- Dark humor and cynicism
- Moral ambiguity
- Consequence weight

### 4. No Manual Work Required
- Play the session normally
- Call `endSession()`
- Chapter auto-generates and appends
- Done

---

## WHAT IT REQUIRES

### Anthropic API Key
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Must be set before running.

### Memory System Must Have Events
Narrator reads from:
```javascript
this.memory.timeline.events[]
```

This is already populated by your orchestrator during play.

---

## CUSTOMIZATION POINTS

If you want to change behavior:

### Change POV Character
In `endSession()`, change:
```javascript
this.activeParty[0]  // First party member
```

To:
```javascript
selectedCharacter  // Or any party member by name
```

### Change Prose Style
Edit the prompt in `ChapterComposer.buildPrompt()` method.

### Change Title Generation
Edit `ChapterTitleGenerator` class methods.

### Change Emotional Tone Detection
Edit `EmotionalArcAnalyzer.determineTone()` method.

---

## PERFORMANCE

- **API Call Time:** 30-60 seconds (Claude generates prose)
- **File Operations:** < 1 second
- **Total endSession() Time:** ~40-70 seconds with narrator

**Recommendation:** Narrator runs automatically, but you can disable it by commenting out the narrator trigger in `endSession()` if you need faster session completion.

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Add import at top of orchestrator |
| "NarratorEngine is not defined" | Restart Node process |
| API timeout (>60s) | Increase max_tokens or reduce event context |
| Chronicle file not created | Check campaign directory exists |
| No chapter appended | Check memory.timeline.events has content |
| Poor prose quality | Adjust prompt in ChapterComposer.buildPrompt() |

---

## NEXT: GENERATE TAMOACHAN SESSION 2

Ready to generate your first auto-chapter?

Here's what happens:

1. You update `Tamoachan Expedition/sessions/session_002.md` with raw notes
2. You call `endSession(2)`
3. Narrator engine:
   - Reads your session notes
   - Analyzes events
   - Calls Claude API
   - Generates epic prose
   - Appends to chronicle.md
4. You now have Chapter II of your novel

**Chronicle grows with each session.**

---

## FILES YOU HAVE

- ✅ `narrator-engine.js` — Ready to use (461 lines)
- ✅ `NARRATOR-INTEGRATION.md` — Full architecture
- ✅ `NARRATOR-INTEGRATION-IMPLEMENTATION.md` — Implementation steps
- ✅ `NARRATOR-ENGINE-QUICKSTART.md` — This file

---

## YOU'RE READY

Make the 4 changes to orchestrator, then your next `endSession()` call will:

🎭 Generate epic prose  
📖 Append to chronicle  
✨ Create a legendary campaign narrative  

**Let's build your D&D epic.**
