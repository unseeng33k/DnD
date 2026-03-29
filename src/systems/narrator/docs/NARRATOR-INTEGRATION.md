# NARRATOR INTEGRATION
## How the Narrative System Fits Into Your D&D Orchestration Architecture

---

## CONTEXT: Your Nine-Pillar Architecture

Your orchestrator uses 9 pillars:
1. **The Heartbeat** — What should happen / stakes / resolution
2. **Persistent World State** — Log events + update entities + cascade consequences
3. **Agency & Spotlight** — Real choices, fair attention
4. **Uncertainty Orchestration** — Roll management, odds, pacing
5. **Legibility** — Clear state + rules + narrative
6. **Fiction-First Orchestrator** — Unified decision layer
7. **World State Graph** — Source of truth (entities, relationships, timeline)
8. **Spotlight Scheduler** — Fair attention allocation
9. **Mechanical State Engine** — Character stats, rules, effects

**Current flow:** Player acts → Orchestrator queries 8+9+7+1+3+4+5 → Heartbeat executes → World State logs → Legibility narrates

---

## WHAT THE CHRONICLE SYSTEM DOES

The Chronicle System **transforms raw session logs into epic narrative prose** (George R.R. Martin + Joe Abercrombie style).

**It is NOT:**
- Real-time narration (happens after session, during write-up)
- A replacement for Legibility pillar (which narrates during play)
- A rules engine or decision system

**It IS:**
- Post-session narrative transformation
- A permanent literary artifact
- A reading experience (novel, not manual)
- Living documentation

---

## WHERE IT FITS: The Narration Pipeline

```
DURING SESSION (Real-Time)
┌────────────────────────────────────────────────┐
│ Player Acts → Orchestrator → Heartbeat → Legibility │
│ (Pillar #5 narrates outcome in-the-moment)    │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
         [#2 Persistent World State]
         Logs all events to timeline
         [memory.timeline.events[]]
         └─ event.type (exploration, combat, roleplay, discovery)
         └─ event.description
         └─ event.metadata (who, what, consequences)
         └─ event.timestamp
                 │
                 ↓
         [SESSION ENDS - File saved]
         /campaigns/[Campaign]/sessions/session_[X].md
         └─ Raw event log from memory
                 │
                 ↓

AFTER SESSION (Post-Processing)
┌────────────────────────────────────────────────┐
│         CHRONICLE NARRATION ENGINE              │
│  (NEW LAYER - transforms logs into prose)       │
└────────────────┬───────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
   [Read Raw Logs]   [Extract NPC Dialogue]
   (session_[X].md)  (from memory system)
        │                 │
        └────────┬────────┘
                 │
                 ↓
         [NARRATOR ENGINE]
         Transform logs → Epic prose
         (Martin + Abercrombie style)
                 │
                 ↓
         [Append to chronicle.md]
         /campaigns/[Campaign]/chronicle.md
         └─ Chapter [X]: [Title]
         └─ Part of growing novel
```

---

## INTEGRATION POINTS (Where to Wire the Narrator)

### Integration Point 1: Session Completion
**File:** `game-master-orchestrator-v2.js` → `endSession()`

**Add integration:**
```javascript
async endSession() {
  const savedFile = this.memory.saveSession();
  
  // NEW: After session saved, trigger narrator
  if (this.narratorEngine) {
    const chronicleChapter = await this.narratorEngine.generateChapter(
      this.sessionNumber,
      savedFile,  // path to session log
      this.memory.timeline.events,  // raw events
      this.activeParty  // character list for POV
    );
    
    // Append to campaign chronicle
    await this.narratorEngine.appendToChronicle(
      this.module.metadata.name,
      chronicleChapter
    );
  }
  
  // ... rest of endSession ...
}
```

**What this provides:**
- Access to raw session events from memory
- Party information for POV selection
- Campaign name for chronicle location
- Session number for chapter numbering

---

## THE NARRATOR ENGINE (New Class)

### Architecture

```javascript
class NarratorEngine {
  constructor(memorySystem, npcDialogueSystem, campaignManager) {
    this.memory = memorySystem;
    this.dialogues = npcDialogueSystem;
    this.campaigns = campaignManager;
  }

  async generateChapter(sessionNumber, sessionLogPath, events, party, selectedPOVCharacter = null) {
    // 1. Read raw session log
    // 2. Analyze events for emotional arc
    // 3. Extract dialogue moments
    // 4. Enrich dialogue with NPC system
    // 5. Generate prose narrative
    // 6. Return structured chapter
  }

  async appendToChronicle(campaignName, chapter) {
    // 1. Verify chronicle.md exists
    // 2. Append chapter
    // 3. Return success status
  }
}
```

---

## FILES AND LOCATION

**Main implementation:**
- `/src/systems/narrator/narrator-engine.js` (440 lines)

**Index exports:**
- `/src/systems/narrator/index.js`

**Documentation:**
- `/src/systems/narrator/docs/` (this directory)

**Integration points:**
- `game-master-orchestrator-v2.js` (4 code changes)

---

## HOW TO WIRE IT IN

### Change 1: Import
```javascript
import { NarratorEngine } from './src/systems/narrator/index.js';
```

### Change 2: Initialize Constructor
```javascript
this.narratorEngine = null;
```

### Change 3: Setup in startSession()
```javascript
this.narratorEngine = new NarratorEngine(
  this.memory,
  this.npcDialogueSystem,
  this.campaign_manager
);
```

### Change 4: Trigger in endSession()
```javascript
if (this.narratorEngine) {
  const chapter = await this.narratorEngine.generateChapter(
    this.sessionNumber,
    savedFile,
    this.memory.timeline.events,
    this.activeParty,
    this.activeParty[0]
  );
  
  await this.narratorEngine.appendToChronicle(
    this.module.metadata.name,
    chapter
  );
}
```

---

## SUMMARY

The **Chronicle Narration Engine** is a **post-session narrative layer** that:
- ✅ Uses your existing memory system (no changes needed)
- ✅ Integrates with NPC dialogue system
- ✅ Wires into orchestrator at session end (4 small changes)
- ✅ Transforms logs into epic prose (Claude API)
- ✅ Grows a campaign novel (appends chapters)
- ✅ Requires NO changes to your 9-pillar architecture

**It's not a replacement for your orchestrator. It's a new layer that uses orchestrator's output.**

---

**Location:** `/src/systems/narrator/`  
**Status:** Production Ready  
**Style:** George R.R. Martin + Joe Abercrombie
