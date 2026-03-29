# CAMPAIGN CHRONICLE SYSTEM - OPERATIONAL GUIDE
## Write Every Campaign Like George R.R. Martin Meets Joe Abercrombie

**For:** Every campaign in `/campaigns/[Campaign Name]/`  
**Output:** `chronicle.md` — Grows with each session  
**Style:** Gritty, cynical, character-driven, consequence-heavy

---

## YOUR VOICE AS CHRONICLER

### George R.R. Martin Elements
- **Multiple POV chapters** (different character perspectives per chapter)
- **Introspection and internal conflict** (what characters think vs. what they say)
- **Consequence threads** that carry forward
- **Specific sensory detail** (not generic descriptions)
- **Dialogue that reveals character**
- **Foreshadowing through small details**
- **Political/social complexity** (nothing is simple)

### Joe Abercrombie Elements
- **Sharp, cynical humor** (dark and cutting)
- **Gritty realism** (blood, mud, exhaustion matter)
- **Flawed protagonists** (everyone has ugliness)
- **Betrayal and self-interest** (trust is rare)
- **Moral ambiguity** (no clear heroes/villains)
- **Terse, economical prose** (no flowery language)
- **Action sequences with weight** (fighting is messy and costs something)

---

## OPENING LINE EXAMPLES (Your Style)

**Opening your chapters with hooks like these:**

- "The jungle was alive with hunger."
- "Trust is what fools trade for gold."
- "Blood on stone is just a beginning."
- "She knew better than to believe in prophecies. But then again, she knew better than most things, and look where it had gotten her."
- "The temple had been waiting three hundred years. It could wait a little longer. But Malice could not."

---

## CHAPTER STRUCTURE (Per Session)

### Before Writing
1. Review raw session notes
2. Pull NPC dialogue from memory system
3. Identify emotional beats and turning points
4. Note consequences that carry forward

### The Chapter Itself
- **Opening:** Hook that grabs (1-2 paragraphs)
- **Setting:** Sensory details, mood (2-3 paragraphs)
- **Character POV:** Establish whose perspective this is
- **Action/Dialogue:** The session events, embedded naturally
- **Internal Thought:** What the character really thinks/fears
- **Closing beat:** Something that makes reader want next chapter

### Length
- **Target:** 2,500-4,000 words per chapter
- **Minimum:** 1,500 words (but lean toward longer)

---

## SPECIFIC RULES FOR YOUR STYLE

### Rule 1: Dialogue Is Sparse But Deadly
Don't transcribe every conversation. Pick the lines that reveal character and embed them with context:

```
WRONG:
"We should explore the north," Grond said.
"That's stupid," Malice replied.
"Why?" asked Grond.
"Because the ancients are north," Malice said.

RIGHT:
Grond wanted to push north. Malice had other ideas.
"The ancients carved their tombs into the northern stone," she said, 
her fingers tracing the carved wall before her. "We'd be walking into 
their hunger."
Grond's hand tightened on his sword pommel. He didn't like admitting 
when she was right. "Then west?"
"West, then north. If we're lucky."
"And if we're not?"
Malice smiled—that thin, dangerous smile that made even other drow 
nervous. "Then at least we'll die knowing who killed us."
```

### Rule 2: Show Physical Reaction, Not Just Emotion
```
WRONG: Grond was scared.

RIGHT: Grond's jaw tightened. His sword hand trembled, just slightly, 
the kind of tremor that came not from fear but from the body knowing 
what the mind refused to admit: they were walking toward something that 
wanted to kill them.
```

### Rule 3: Consequences Have Weight
Track what carried forward from previous sessions:
- "Black Dow had not forgotten their refusal three weeks prior"
- "The villagers' hatred had teeth. Malice could taste it in the air"
- "The oath they'd sworn in Session Two haunted everything they did now"

### Rule 4: No One Is Innocent
Even your heroes have ugliness. Show it:
- Grond's honor code warred with his self-interest
- Malice's faith in Lloth was complicated by actual doubt
- The party made hard choices and lived with consequences

---

## SESSION-TO-CHRONICLE WORKFLOW

### After You Play a Session

**Step 1: Log Raw Notes** (10 min)
- Update `sessions/session_[X].md`
- What happened, discoveries, combat, NPC interactions
- Dialogue fragments (raw)
- Emotional beats

**Step 2: Extract Dialogue** (5 min)
- Run dialogue system to get NPC responses
- Note tone, emotional state, relationship shifts

**Step 3: Write Chapter** (45-90 min)
- Transform notes into prose
- Embed dialogue naturally
- Show consequences carrying forward
- Use sensory detail and internal thought
- Make it readable as standalone fiction

**Step 4: Append to `chronicle.md`** (5 min)
- Add chapter to right "Book"
- Update chapter numbering
- Update table of contents

**Step 5: Reread** (15 min)
- Ensure consistency with prior chapters
- Verify relationships/consequences are tracked
- Check NPC voices remain consistent

---

## WHAT A CHAPTER LOOKS LIKE

### Template Structure
```
### CHAPTER III: [Title - Usually a thematic phrase, not "Session 3"]

[Opening hook paragraph - 1-2 sentences that grab]

[Setting and mood - sensory details]

[POV character introduction - whose perspective?]

[Main action/events of the session - embedded naturally with dialogue]

[Internal conflict/thought]

[Closing beat that makes reader want more]

---

*Session Three: [Scene Title] - Date: [Date]*
```

---

## BOOK STRUCTURE (How Sessions Organize Into Books)

**Book One:** Gathering and Descent (Sessions 1-3)
**Book Two:** Deeper Into Darkness (Sessions 4-6)
**Book Three:** Confrontation (Sessions 7-9)
**Book Four:** Consequence and Aftermath (Sessions 10+)

You decide where books break based on *thematic* arcs, not arbitrary count.

---

## TONE MARKERS (Checklist per Chapter)

✓ **Sharp dialogue** (not wordy, reveals character)  
✓ **Sensory detail** (smell, sound, texture, not just sight)  
✓ **Internal contradiction** (character wants X but fears Y)  
✓ **Consequence tracking** (callbacks to previous choices)  
✓ **Physical reaction** (body shows what mind won't admit)  
✓ **Dark humor** (if appropriate for tone)  
✓ **No info-dumping** (show the world through action, not explanation)  
✓ **Specific nouns** (not "the city" but "Waterdeep's grey stone")  
✓ **Ending beat** (paragraph that makes reader want to turn the page)

---

## STARTING EACH NEW CAMPAIGN

When you start a new campaign:

1. **Create the campaign folder** with subdirectories
2. **Create `chronicle.md`** in the campaign root
3. **Start with a Prologue** (how I did for Tamoachan)
4. **Then add chapters** after each session

---

## EXAMPLE: Campaign Folder Structure (Complete)

```
/campaigns/[Campaign Name]/
├── chronicle.md              ← THE NOVEL (you write this)
├── sessions/
│   ├── session_001.md        (raw notes)
│   ├── session_002.md
│   └── session_003.md
├── characters_met.md         (NPC summaries)
├── campaign.json
├── maps/
├── images/
├── npcs/
├── treasure/
└── handouts/
```

---

## STANDING COMMITMENT

**From now on, for every campaign you play:**
- Create `chronicle.md` from day one
- Write a chapter after each session
- Keep it in your preferred style (Martin/Abercrombie)
- Let it grow into a complete novel by campaign end
- Archive it when campaign finishes

This is your **permanent record** of every adventure. Not mechanical logs. **Stories.**

---

## YOUR STYLE CHECKLIST (Before Publishing Each Chapter)

- [ ] Opening line grabs (would I keep reading?)
- [ ] POV is clear (whose head am I in?)
- [ ] Dialogue reveals character (not exposition)
- [ ] Internal conflict shown (character wrestling with something)
- [ ] Sensory detail present (I can smell/hear/feel this)
- [ ] Consequences carried forward (last session matters)
- [ ] No info-dumping (world revealed through action)
- [ ] Dark tone consistent (gritty, cynical where appropriate)
- [ ] Physical reactions described (body language)
- [ ] Closing beat lands (I want the next chapter)
- [ ] NPC voices distinct (can I tell them apart?)
- [ ] Relationship shifts visible (character dynamics changed)

---

**You're not documenting sessions anymore.**  
**You're writing an epic.**  
**Make it legendary.**
