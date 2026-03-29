# CAMPAIGN CHRONICLE SYSTEM
## Transform Session Logs Into Epic Narrative Prose

**Status:** Design Document  
**Scope:** Each campaign in `/campaigns/[Campaign Name]/`  
**Output:** `chronicle.md` — A novel-length narrative of the entire adventure

---

## OVERVIEW

For each campaign, maintain a **master chronicle** that reads like a George R.R. Martin novel. This file:
- Grows with each session
- Transforms raw session logs into vivid prose
- Captures emotion, tension, character development
- Uses multiple POV chapters
- Includes dialogue, descriptions, internal thoughts
- Creates a cohesive narrative arc
- Can be read years later as a complete story

---

## DIRECTORY STRUCTURE

```
/campaigns/[Campaign Name]/
├── chronicle.md              ← MAIN FILE: The novel (grows each session)
├── sessions/
│   ├── session_001.md        (raw session notes)
│   ├── session_002.md
│   └── session_003.md
├── characters_met.md         (NPC summary + encounters)
└── [other files]
```

### Chronicle File Location
**File:** `/campaigns/[Campaign Name]/chronicle.md`

**Size:** Grows with each session (multi-chapter document)

**Format:** Markdown, structured as a novel with:
- Prologue
- Books (by campaign arc)
- Chapters (by session)
- Interludes (between sessions)
- Epilogue (when campaign ends)

---

## PART 1: CHRONICLE STRUCTURE

### Example: Tamoachan Expedition

```markdown
# THE TAMOACHAN EXPEDITION
## A Chronicle of the Descent

### PROLOGUE: The Summons

In the waning days of [month], as [season] descended upon the realm...

---

## BOOK ONE: INTO THE JADE TEMPLE

### CHAPTER I: The Jungle Approach

The jungle was alive with hunger.

Green canopy pressed down like the palm of some ancient god, 
suffocating the light, swallowing sound. Malice Indarae De'Barazzan, 
a drow of cool intellect and sharper tongue, stood at the jungle's 
edge and felt the weight of five centuries of exile press against her shoulders...

[Detailed narrative of Session 1]

---

### CHAPTER II: The First Descent

As darkness fell on their second day in the temple's shadow...

[Detailed narrative of Session 2]

---

### INTERLUDE: The Weight of Choices

While the party rested, the jungle kept its vigil. And in distant places, 
others learned of their descent...

---

### CHAPTER III: [Session 3 title]

[Detailed narrative of Session 3]

---

## BOOK TWO: [Next Arc Title]

### CHAPTER IV: [Session 4 title]

[And so on...]
```

---

## PART 2: WRITING GUIDELINES (George R.R. Martin Style)

### POV Structure
Write chapters from character perspectives. Each chapter focuses on one character's experience:
- "Malice" chapter: Her thoughts, magic, observations
- "Grond" chapter: His combat perspective, doubts, honor
- Party as ensemble: When all experience something together

### Prose Elements

**Opening Lines (hook the reader):**
```
"The temple had been waiting for them for three hundred years."

"Malice knew the difference between fear and caution. 
This was both."

"The stairs descended into darkness that seemed to have 
weight and texture."
```

**Dialogue Integration:**
- Use dialogue sparingly, but when it appears, it reveals character
- "Sharp enough blade there," Black Dow had said once, eyes cold as winter. 
  "Won't be worth much once you're using it to dig your own grave."

**Internal Monologue:**
- Show character thoughts during tense moments
- Reveal fears, hopes, calculations

**Consequence Emphasis:**
- When party breaks a promise: describe the emotional weight
- When NPC learns of betrayal: show their reaction through narrative
- When relationship shifts: manifest it in dialogue and action

**Environmental Description:**
- Make locations feel alive and dangerous
- Use sensory details: sounds, smells, the feel of air
- Connect environment to emotion

### Example Passage

```
The corridor reeked of age and something else—something that might have 
been incense once, or blood, or the slow rot of centuries. Malice's 
darkvision painted the walls in shades of gray, and the carved faces of 
forgotten gods seemed to track their passage with stone eyes that held 
no mercy.

Her hand found the leather cord that held her holy symbol—Lloth's eternal 
truth, distant now but still hers. The magic here felt... wrong. Older 
than old. Older than Lloth's first plot against the surface.

Behind her, Grond's breathing echoed off the stone. The fighter was tense, 
his hand on his sword pommel. He could smell fear on the air, though whether 
it came from the party or the tomb itself, Malice could not say.

"The spider watches," she murmured, more to herself than to her companions.

"What?" Grond's voice was sharp, suspicious.

"Just a prayer," she said. But it wasn't. It was a warning.
```

---

## PART 3: CONTENT FOR EACH SESSION

### What to Extract from Session Notes

**From `session_[X].md`:**
- Opening scene → Chronicle opening
- Key moments → Chronicle turning points
- Combat encounters → Chronicle action scenes
- NPC interactions → Chronicle dialogue and character moments
- Discoveries → Chronicle mystery/revelation
- Session end → Chronicle chapter conclusion

### What the Dialogue System Provides

The NPC dialogue system generates:
- NPC dialogue (contextual, consistent)
- Tone and emotional state
- Relationship shifts

**Chronicle uses this by:**
- Embedding actual dialogue into narrative
- Showing emotional reactions through prose
- Describing NPC body language while speaking
- Tracking how relationships change visibly

**Example:**

Raw dialogue from system:
```
"Well. The fools who couldn't recognize opportunity walk back in. 
Sharp enough to survive, not smart enough to profit from it."
(tone: menacing, emotional_state: confident, relationship_shift: 0)
```

In Chronicle:
```
Black Dow's eyes, cold as a winter that had seen ten thousand deaths, 
fixed on the party as they entered his hall. A smile cut across his 
weathered face—not a smile of welcome, but of a predator recognizing 
prey that had somehow managed to escape once before.

"Well," he said, his voice like a blade drawn slowly from a sheath. 
"The fools who couldn't recognize opportunity walk back in."

He rose from his throne with deliberate slowness, the weight of 
sovereignty settling on his shoulders like a fur-lined cloak. 
"Sharp enough to survive, not smart enough to profit from it."

The party had been enemies to him since they refused his offer in 
Tamoachan. That had not changed. The smile suggested he still found 
them more amusing than threatening. For now.
```

---

## PART 4: CHRONICLE BUILDING WORKFLOW

### After Each Session

**Step 1: GM Reviews Session Notes**
- Read `session_[X].md` 
- Identify key scenes, dialogue, outcomes
- Note emotional beats and character arcs

**Step 2: Extract Dialogue**
- Pull NPC dialogue from memory logs
- Get emotional metadata from dialogue system
- Note relationship changes

**Step 3: Write Chronicle Chapter**
- Transform raw notes into vivid prose
- Use session structure as outline
- Embed dialogue naturally
- Show consequences and relationships shifting
- Write 2,000-5,000 words per chapter

**Step 4: Append to `chronicle.md`**
- Add new chapter to appropriate "Book"
- Update chapter numbering
- Add to table of contents

**Step 5: Reread Entire Chronicle**
- Ensure consistency
- Verify relationships are tracked
- Check that consequences carry forward
- Verify NPC personalities remain consistent

---

## PART 5: EXAMPLE CHRONICLE START

For Tamoachan Expedition, a beginning might be:

```markdown
# THE TAMOACHAN EXPEDITION
## A Chronicle of the Descent into Jade and Darkness

---

## PROLOGUE: The Letter

The letter arrived on a grey morning, sealed with wax that had never 
been common. Malice Indarae De'Barazzan recognized the mark before she 
broke the seal—the symbol of a scholar-sage who had died sixty years 
prior, according to the most reliable gossip in the city.

Yet here was her hand, unmistakable, in the careful script:

*"If you read this, I am dead, and what I feared has come to pass. 
The Jade Temple calls. You must answer. You must go. Come alone, or 
bring only those you trust with your unlife."*

That was a laugh. Malice trusted no one. But she had learned, in her 
centuries, that sometimes the choice between bad options was the only 
choice available at all.

She had assembled a party.

---

## BOOK ONE: THE SUMMONS

### CHAPTER I: The Gathering

Grond was the first to arrive at the waystation...

[etc.]
```

---

## PART 6: TRACKING ELEMENTS ACROSS SESSIONS

### Relationship Arc Tracking
```
Session 1: Black Dow encountered, negotiation failed → Relationship: -10
Session 2: Party discovered Dow's true plan → Relationship: -5 (slightly less hostile)
Session 3: Party defeats Dow's minions → Relationship: 0 (now neutral enemies)
Session 4: [Next shift...]

Chronicle must SHOW these shifts through Dow's dialogue and body language
```

### Character Development
Track how each character changes across sessions:
- Malice's faith in Lloth: strengthening or wavering?
- Grond's honor code: being tested, confirmed, or broken?
- Party unity: growing tighter or fracturing?

Chronicle reflects these arcs through:
- Internal monologue
- How characters interact
- Dialogue that shows growth
- Decisions that reveal change

### Consequence Threads
Track promises made and broken:
- Session 1: "We'll protect the village"
- Session 3: Party ignores village crisis
- Session 4: Chronicle shows villagers' reaction, NPC anger
- Session 5: Relationship with NPC is now hostile

Chronicle makes consequences *feel* real through narrative impact.

---

## PART 7: WRITING CHECKLIST FOR EACH CHAPTER

For each session's chronicle chapter:

- [ ] Opening line hooks the reader
- [ ] Setting is vivid (sensory details)
- [ ] Character POV is clear and consistent
- [ ] Dialogue is embedded naturally
- [ ] NPC emotions/tones are shown (not told)
- [ ] Combat scenes have tension, not just dice rolls
- [ ] Discoveries feel like real revelations
- [ ] Consequences from previous sessions carry forward
- [ ] Relationship changes are visible in interaction
- [ ] Chapter ends with a beat that makes reader want next chapter
- [ ] Tone is consistent with George R.R. Martin (not anime, not D&D manual)
- [ ] Character voice is distinct per POV chapter

---

## PART 8: WHAT THIS CREATES

Over time, as sessions accumulate:

- **After 5 sessions:** A compelling 20-30k word novella
- **After 10 sessions:** A full novel (60-80k words)
- **Campaign end:** A complete story you can read start to finish
- **Years later:** A record of the adventure, preserving not just what happened, but how it felt

The chronicle becomes a **permanent artifact** of your D&D experience—something to hand to a friend and say, "Read this. This is the story of our adventure."

---

## IMPLEMENTATION

To use this system:

1. **Create `chronicle.md`** in each campaign folder
2. **After each session**, write a chapter (2,000-5,000 words)
3. **Append to the main chronicle file**
4. **Reread periodically** to catch inconsistencies
5. **Keep session notes** as reference, not the final form

The chronicle is the **canonical narrative**. Session notes are just scaffolding.

---

## TONE & VOICE REFERENCE

Read these passages for inspiration:
- George R.R. Martin's POV chapters (A Clash of Kings)
- Joe Abercrombie's First Law series (sharp dialogue, dark humor)
- N.K. Jemisin's Broken Earth trilogy (emotional depth, world-building)

Write with:
- Specificity (not "they fought" but detailed combat)
- Interiority (character thoughts matter)
- Consequence (actions have weight)
- Dialogue that reveals character, not plot
