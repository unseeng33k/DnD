# CHRONICLE NARRATION ENGINE INTEGRATION
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
└────────────────────┬───────────────────────────┘
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
└────────────────────┬───────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
   [Read Raw Logs]         [Extract NPC Dialogue]
   (session_[X].md)        (from memory system)
        │                         │
        └────────────┬────────────┘
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

**Current code:**
```javascript
async endSession() {
  const savedFile = this.memory.saveSession();
  // Logs events, decides, consequences, etc.
  // Returns: { session, eventsLogged, savedFile }
}
```

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

### Integration Point 2: Memory System Access
**File:** `dm-memory-system.js`

**The narrator needs:**
- `timeline.events[]` — Raw event log (type, description, metadata)
- `npcInteractions[]` — NPC dialogue and relationship changes
- `decisions[]` — Rulings made during session
- `entities` — Character/NPC/faction data

**Current structure (your memory already has this):**
```javascript
class DMMemory {
  timeline = {
    events: [
      {
        timestamp,
        type: 'combat' | 'exploration' | 'roleplay' | 'discovery',
        description,
        metadata: { who, what, consequences }
      }
    ]
  };
  
  npcInteractions = [
    {
      npcName,
      action,
      timestamp,
      relationshipShift
    }
  ];
}
```

**Narrator uses this via:**
```javascript
// In NarratorEngine
const events = memory.timeline.events;  // All session events
const npcDialogues = memory.npcInteractions;  // Who said what
const decisions = memory.decisions;  // Rulings made
```

**No changes needed** — your memory structure already provides everything.

---

### Integration Point 3: NPC Dialogue System Integration
**File:** `npc-dialogue-system.md` (which we designed last session)

**The narrator needs:**
```javascript
async generateNPCDialogue(npcId, actionType, context) {
  // Returns: { dialogue, tone, emotional_state, relationship_shift }
}
```

**How narrator uses it:**
```javascript
// When narrating NPC interaction from session log:
const npcLine = await dialogueSystem.generateNPCDialogue(
  npcId,
  'combat_opening',
  {
    relationship_score: -15,
    previous_interactions: 3,
    party_actions: ['refused_offer', 'avoided_alliance']
  }
);

// Embed into prose:
// "Black Dow smiled—that thin, dangerous smile. 
//  His eyes, cold as winter, fixed on the party.
//  '{npcLine.dialogue}'
//  His tone was {npcLine.tone}, confidence radiating like heat."
```

**Wire it in:**
```javascript
// NarratorEngine constructor
constructor(memorySystem, npcDialogueSystem) {
  this.memory = memorySystem;
  this.dialogues = npcDialogueSystem;
}
```

---

### Integration Point 4: Campaign Manager
**File:** Already in `game-master-orchestrator-v2.js`

**The narrator needs:**
```javascript
const campaignDir = `/campaigns/${campaignName}/`;
const chronicleFile = `${campaignDir}chronicle.md`;
const sessionFile = `${campaignDir}sessions/session_${sessionNum}.md`;
```

**Narrator uses this for:**
- Reading raw session logs
- Appending chapters to chronicle
- Tracking campaign-wide narrative arcs

**Already available via:**
```javascript
// In GameMasterOrchestrator:
this.campaign_manager = new CampaignManager(campaignName);

// Narrator accesses:
const sessionLog = this.campaign_manager.loadSessionContext(sessionNum);
```

---

## THE NARRATOR ENGINE (New Class to Add)

### Architecture

```javascript
class NarratorEngine {
  constructor(memorySystem, npcDialogueSystem, campaignManager) {
    this.memory = memorySystem;
    this.dialogues = npcDialogueSystem;
    this.campaigns = campaignManager;
  }

  /**
   * Generate one chapter from session log
   * Called after endSession() in orchestrator
   */
  async generateChapter(
    sessionNumber,
    sessionLogPath,
    events,
    party,
    selectedPOVCharacter = null  // Optional: pick who narrates this chapter
  ) {
    // 1. Read raw session log
    const sessionLog = readSessionLog(sessionLogPath);
    
    // 2. Analyze events for emotional arc
    const arc = this.analyzeEmotionalArc(events);
    
    // 3. Extract dialogue moments
    const dialogues = this.extractDialogueMoments(events);
    
    // 4. Enrich dialogue with NPC system
    const enrichedDialogues = await Promise.all(
      dialogues.map(d => 
        this.dialogues.generateNPCDialogue(d.npcId, d.actionType, d.context)
      )
    );
    
    // 5. Generate prose narrative
    const chapter = await this.composeChapter(
      sessionNumber,
      arc,
      events,
      enrichedDialogues,
      selectedPOVCharacter || party[0]
    );
    
    return chapter;
  }

  /**
   * Append chapter to campaign chronicle.md
   */
  async appendToChronicle(campaignName, chapter) {
    const chronicleFile = this.campaigns.campaignDir + '/chronicle.md';
    
    // If first chapter, create file with header
    if (!fileExists(chronicleFile)) {
      this.createChronicleHeader(campaignName);
    }
    
    // Append chapter
    fs.appendFileSync(chronicleFile, chapter);
  }

  /**
   * Analyze emotional arc of session
   * Returns: { opening, climax, resolution, tone }
   */
  analyzeEmotionalArc(events) {
    const explorations = events.filter(e => e.type === 'exploration');
    const combats = events.filter(e => e.type === 'combat');
    const discoveries = events.filter(e => e.type === 'discovery');
    
    // Identify turning points, stakes, consequences
    // Used to structure narrative flow
    
    return {
      opening: explorations[0],
      climax: combats.length > 0 ? combats[combats.length - 1] : discoveries[0],
      resolution: events[events.length - 1],
      tone: this.determineTone(events)
    };
  }

  /**
   * Extract dialogue-heavy moments from session
   */
  extractDialogueMoments(events) {
    return events
      .filter(e => e.type === 'roleplay' && e.metadata.npcId)
      .map(e => ({
        npcId: e.metadata.npcId,
        sessionContext: e,
        actionType: this.inferActionType(e.metadata),
        context: e.metadata
      }));
  }

  /**
   * Compose chapter prose (Claude API call)
   * Sends all context to Claude, gets back epic prose
   */
  async composeChapter(sessionNum, arc, events, dialogues, povChar) {
    const prompt = `
    You are writing a chapter for an epic fantasy novel 
    (George R.R. Martin meets Joe Abercrombie style).
    
    Session ${sessionNum} - Chapter Title: [derived from events]
    POV Character: ${povChar.name}
    
    Raw Events:
    ${events.map(e => e.description).join('\n')}
    
    NPC Dialogues (with tone):
    ${dialogues.map(d => `
      ${d.npcName}: "${d.dialogue}" (tone: ${d.tone})
    `).join('\n')}
    
    Emotional Arc:
    - Opening: ${arc.opening.description}
    - Climax: ${arc.climax.description}
    - Resolution: ${arc.resolution.description}
    
    Write a 2,500-4,000 word chapter that:
    1. Opens with a hook
    2. Shows ${povChar.name}'s perspective throughout
    3. Embeds dialogue naturally with context
    4. Includes sensory detail and internal thought
    5. Shows consequences from prior sessions
    6. Closes with a beat that makes reader want next chapter
    7. Uses Martin's introspection + Abercrombie's cynicism
    
    Return ONLY the chapter prose (no chapter heading, no session notes).
    `;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.content[0].text;
  }
}
```

---

## HOW TO WIRE IT IN (3 Changes)

### Change 1: Import in orchestrator
```javascript
// game-master-orchestrator-v2.js - top of file
import { NarratorEngine } from './narrator-engine.js';
```

### Change 2: Initialize in orchestrator
```javascript
// In GameMasterOrchestrator.constructor()
this.narrator = null;

// In GameMasterOrchestrator.startSession()
this.narrator = new NarratorEngine(
  this.memory,
  this.npcDialogueSystem,  // already exist or create
  this.campaign_manager
);
```

### Change 3: Trigger at session end
```javascript
// In GameMasterOrchestrator.endSession()
// After this.memory.saveSession()

if (this.narrator) {
  const chapter = await this.narrator.generateChapter(
    this.sessionNumber,
    savedFile,
    this.memory.timeline.events,
    this.activeParty,
    this.activeParty[0]  // POV = first party member
  );
  
  await this.narrator.appendToChronicle(
    this.module.metadata.name,
    chapter
  );
  
  console.log(`📖 Chapter appended to chronicle.md`);
}
```

---

## DATA FLOW SUMMARY

```
SESSION PLAYS
     ↓
[Orchestrator runs - all 9 pillars work]
     ↓
[Legibility pillar narrates during play (Pillar #5)]
     ↓
[Persistent World State logs events (Pillar #2)]
     ↓
endSession() called
     ↓
[Memory saved to sessions/session_[X].md]
     ↓
[NARRATOR ENGINE triggered]
     ├─ Reads raw session log
     ├─ Queries NPC dialogue system
     ├─ Analyzes emotional arc
     ├─ Generates epic prose (Claude API)
     └─ Appends chapter to chronicle.md
     ↓
[CHRONICLE GROWS]
     ↓
[By campaign end: Complete novel]
```

---

## WHAT THE ORCHESTRATOR PROVIDES

| Data | Source | Narrator Uses For |
|------|--------|------------------|
| Events | `memory.timeline.events[]` | Plot structure, turning points |
| NPC Info | `memory.npcInteractions[]` | Dialogue enrichment, relationships |
| Party Data | `this.activeParty[]` | POV selection, character voices |
| Campaign Name | `this.module.metadata.name` | Chronicle file location |
| Session Number | `this.sessionNumber` | Chapter numbering |
| Decisions | `memory.decisions[]` | Consequence tracking |
| Combat Log | `this.combat.getCombatStatus()` | Action scene detail |
| Rulings | `memory.auditTrail()` | Narrative consistency |

**Everything already exists in your orchestrator.**

---

## WHAT THE NARRATOR ADDS

- **Post-session prose generation** (Claude API call)
- **Literary transformation** (logs → epic narrative)
- **Chronicle persistence** (growing novel)
- **NPC enrichment** (dialogue system integration)
- **Emotional arc analysis** (structure prose accordingly)

**No changes to game mechanics. Pure narrative layer.**

---

## FILES TO CREATE

1. **`narrator-engine.js`** — Main narration class
2. **`narrator-templates.md`** — Chapter structure templates, prose guidelines
3. **`narrator-integration-checklist.md`** — Implementation steps

---

## SUMMARY

The **Chronicle Narration Engine** is a **post-session narrative layer** that:
- ✅ Uses your existing memory system (no changes needed)
- ✅ Integrates with NPC dialogue system (designed last session)
- ✅ Wires into orchestrator at session end (3 small changes)
- ✅ Transforms logs into epic prose (Claude API)
- ✅ Grows a campaign novel (appends chapters)
- ✅ Requires NO changes to your 9-pillar architecture

**It's not a replacement for your orchestrator. It's a new layer that uses orchestrator's output.**

---

**Ready to design the narrator-engine.js implementation?**
