# NPC DIALOGUE SYSTEM - DND PROJECT
## Using Existing Character Data for Dialogue Generation

**Status:** Design Document  
**Scope:** This D&D project only  
**Integration Target:** Reads from existing character JSON files in `/dnd/characters/`

---

## OVERVIEW

This system generates contextual NPC dialogue by **extracting data that already exists** in character JSON files. No new files needed.

The system:
- Reads `speech_pattern`, `personality`, `relationships` from existing character JSON
- Queries interaction history from `dm-memory-system.js`
- Generates dialogue based on current context
- Logs interactions back to memory
- Integrates with game-master-orchestrator-v2.js

**No new character files.** Just wire the existing data into the dialogue pipeline.

---

## PART 1: WHAT DATA ALREADY EXISTS

### In `/dnd/characters/[npc_name].json`

Character files already contain dialogue-relevant data:

```json
{
  "name": "Character Name",
  "personality": {
    "alignment": "Neutral Evil",
    "speech_pattern": "Sharp-tongued, economical with words, cutting wit",
    "loyalty": "Transactional",
    "morale": { "personal": "Very high", "moral": "Very low" }
  },
  
  "lore": {
    "background": "Ruthless member of...",
    "current_role": "Protector of the North",
    "reputation": "Killed more men than winter; rules through ruthlessness",
    "enemies": "The Dogman (former companion, now sworn enemy)"
  },
  
  "relationships": {
    "logen_ninefingers": { "status": "BETRAYED", "nature": "..." },
    "the_dogman": { "status": "BITTER ENEMY", "nature": "..." }
  },
  
  "combat_tactics": {
    "opening": "Brutal charge at most dangerous opponent",
    "psychology": "Lets weaker men die first to identify strength"
  }
}
```

**All of this is already dialogue data.** The system just needs to read it and use it.

---

## PART 2: HOW THE SYSTEM WORKS

### Step 1: GM Requests Dialogue

```javascript
await gm.generateNPCDialogue('blackdow', 'greeting', { 
  location: 'tavern' 
});
```

### Step 2: System Loads Character File

```
Load /dnd/characters/blackdow.json
Extract: 
  - personality.speech_pattern
  - personality.alignment
  - lore.background
  - lore.current_role
  - relationships
  - combat_tactics (reveals how they think)
```

### Step 3: Load Interaction Memory

```
Query dm-memory-system.js:
  - Last time this NPC met party?
  - Relationship score?
  - Previous outcomes?
```

### Step 4: Build Dialogue Prompt

Send to Claude API:
```
You are Black Dow from the existing character sheet.

PERSONALITY:
- Speech: "Sharp-tongued, economical with words, cutting wit"
- Alignment: Neutral Evil
- Nature: "Pragmatic, ruthless, not cackling"

BACKGROUND:
- "Ruthless member of Logen's band"
- "Betrayed Logen, clawed his way to throne"
- "Rules through fear and pragmatism"

RELATIONSHIPS:
- The Dogman: "Former friend, NOW BITTER ENEMY"
- Logen: "Former companion, BETRAYED"

RIGHT NOW:
- Situation: Greeting in tavern
- With party: Relationship score -15 (enemies)
- Your mood: Confident (on home ground)

Generate 1-2 sentences of dialogue that sounds like you.
```

### Step 5: Get Dialogue & Log It

Claude returns:
```
"Well. The fools who couldn't recognize opportunity walk back in. 
 Sharp enough to survive, not smart enough to profit from it."
```

Log to memory. Return to game.

---

## PART 3: INTEGRATION POINTS

### In `game-master-orchestrator-v2.js`

Add this method:

```javascript
async generateNPCDialogue(npcId, actionType, context = {}) {
  // Load character file
  const charPath = path.join(__dirname, 'characters', `${npcId}.json`);
  const npcData = JSON.parse(fs.readFileSync(charPath, 'utf8'));
  
  // Get interaction history
  const history = this.memory.getNPCHistory(npcId);
  const relationshipScore = this.memory.getRelationshipScore(npcId);
  
  // Build dialogue prompt using existing character data
  const prompt = this.buildDialoguePrompt({
    npcId,
    npcData,
    actionType,
    context,
    history,
    relationshipScore
  });
  
  // Generate dialogue via Claude
  const dialogue = await this.callDialogueAPI(prompt);
  
  // Log to memory
  this.memory.logNPCInteraction(npcId, actionType, dialogue);
  
  return dialogue;
}
```

### In `dm-memory-system.js`

Add NPC tracking methods:

```javascript
getNPCHistory(npcId) {
  // Return array of interactions
  return this.npcMemory[npcId]?.interactions || [];
}

getRelationshipScore(npcId) {
  // Return -100 to +100 score
  return this.npcMemory[npcId]?.relationshipScore || 0;
}

logNPCInteraction(npcId, actionType, dialogue) {
  // Log interaction and update relationship
  if (!this.npcMemory[npcId]) {
    this.npcMemory[npcId] = { 
      interactions: [], 
      relationshipScore: 0 
    };
  }
  
  this.npcMemory[npcId].interactions.push({
    session: this.sessionNumber,
    action: actionType,
    dialogue: dialogue.dialogue,
    timestamp: new Date().toISOString()
  });
  
  // Update relationship if dialogue indicates shift
  this.npcMemory[npcId].relationshipScore += (dialogue.relationshipShift || 0);
}
```

---

## PART 4: WHAT TO EXTRACT FROM CHARACTER JSON

### For Dialogue Generation

From each NPC JSON file, extract:

| Field | Use |
|-------|-----|
| `personality.speech_pattern` | How they speak |
| `personality.alignment` | Core values |
| `personality.loyalty` | What they care about |
| `personality.morale` | Confidence level |
| `lore.background` | Who they are |
| `lore.reputation` | How others see them |
| `lore.current_role` | What they're doing now |
| `relationships.*` | Who matters to them |
| `combat_tactics.*` | How they think under pressure |

### Dialogue Prompt Template

```
You are [name] from a D&D campaign.

YOUR CORE SELF:
- Alignment: [alignment]
- Speech: "[speech_pattern]"
- Role: "[current_role]"
- Reputation: "[reputation]"
- Nature: "[personality description]"

YOUR BACKGROUND:
[Full lore section - who you are, what you've done]

RELATIONSHIPS THAT MATTER:
[Key relationships from relationships section]

HOW YOU THINK:
[Combat tactics - reveals decision-making]

RIGHT NOW:
- Situation: [action_type]
- With this group: [relationship_score interpretation]
- Last interaction: [last interaction summary]
- Your mood: [emotional_state assessment]
- Context: [location, threat level, etc]

Generate 1-2 sentences of dialogue that sounds exactly like you.
Return as JSON:
{
  "dialogue": "what you say",
  "tone": "menacing|cheerful|calculating|etc",
  "emotional_state": "confident|scared|etc",
  "relationship_shift": -5 to +5
}
```

---

## PART 5: ACTION TYPES

### `greeting`
When NPC meets party (first time or reunion)
- Context: location, time since last meeting
- Expected tone: varies based on relationship

### `negotiation`
Party proposes deal or terms
- Context: proposal details, stakes
- Expected tone: calculating, testing

### `combat_opening`
Combat starts
- Context: enemy count, odds
- Expected tone: menacing, aggressive

### `consequence`
NPC learns of broken promise or betrayal
- Context: what was promised, how broken
- Expected tone: angry, cold, calculating

### `ambient`
NPC speaks without being prompted (tavern scene, walking, etc)
- Context: location mood, time, surrounding events
- Expected tone: reflective, observational

### `npc_interaction`
Two NPCs encounter each other
- Context: who the other NPC is, history between them
- Expected tone: varies (warm if allies, hostile if enemies)

---

## PART 6: IMPLEMENTATION CHECKLIST

### Phase 1: Extend Memory System
- [ ] Add `getNPCHistory(npcId)` to DMMemory
- [ ] Add `getRelationshipScore(npcId)` to DMMemory
- [ ] Add `logNPCInteraction(npcId, actionType, dialogue)` to DMMemory
- [ ] Add `npcMemory` object to track interactions

### Phase 2: Add Dialogue Generator
- [ ] Add `generateNPCDialogue()` method to GameMasterOrchestrator
- [ ] Add `buildDialoguePrompt()` helper method
- [ ] Add `callDialogueAPI()` method for Claude API

### Phase 3: Wire Into Existing Methods
- [ ] Call in `loadScene()` for NPC greetings
- [ ] Call in `beginEncounter()` for combat opening dialogue
- [ ] Optional: Call in `interactNPC()` for response dialogue

### Phase 4: Test
- [ ] Generate greeting for Black Dow
- [ ] Generate combat dialogue for Black Dow
- [ ] Verify memory logging works
- [ ] Check dialogue quality and consistency

---

## PART 7: EXAMPLE: BLACK DOW GREETING

### Character Data Available
```json
{
  "name": "Black Dow",
  "personality": {
    "speech_pattern": "Sharp-tongued, economical with words, cutting wit",
    "alignment": "Neutral Evil",
    "loyalty": "Transactional"
  },
  "lore": {
    "background": "Ruthless member of Logen's band",
    "current_role": "Protector of the North",
    "reputation": "Killed more men than winter; rules through fear and pragmatism"
  },
  "relationships": {
    "the_dogman": {
      "status": "Former friend - NOW BITTER ENEMY",
      "nature": "Fights against Dow in Union service"
    }
  }
}
```

### Request
```javascript
generateNPCDialogue('blackdow', 'greeting', { 
  location: 'tavern', 
  lastMeeting: 'session_3_negotiation_failed' 
})
```

### Memory Query Returns
```
relationship_score: -15 (enemies)
last_interaction: { session: 3, outcome: 'hostile_negotiation' }
```

### Prompt Built & Sent to Claude
```
You are Black Dow from a D&D campaign.

CORE SELF:
- Alignment: Neutral Evil
- Speech: "Sharp-tongued, economical with words, cutting wit"
- Role: "Protector of the North"
- Reputation: "Killed more men than winter; rules through fear and pragmatism"

BACKGROUND: Ruthless member of Logen's band. Betrayed Logen, 
clawed his way to throne of the North.

KEY RELATIONSHIPS: The Dogman is my bitter enemy.

HOW I THINK: I charge the most dangerous opponent, use terrain and 
fear as weapons. I'm pragmatic and ruthless.

RIGHT NOW:
- Situation: greeting in tavern
- With this group: -15 relationship (enemies from failed negotiation)
- Last time: session 3, we tried to deal and they refused
- Your mood: confident (this is my territory, my city)
- Context: You enter the tavern and spot them

Generate 1-2 sentences that sound like you.
```

### Claude Returns
```json
{
  "dialogue": "Well. The fools who couldn't recognize opportunity walk back in. Sharp enough to survive, not smart enough to profit from it.",
  "tone": "menacing",
  "emotional_state": "confident",
  "relationship_shift": 0
}
```

### System Logs
```
Memory update:
- session_X, action: greeting, location: tavern
- dialogue logged
- relationship_score: -15 (no change)
```

### Game Output
```
🎭 Black Dow: "Well. The fools who couldn't recognize opportunity walk back in. 
Sharp enough to survive, not smart enough to profit from it."
[tone: menacing]
```

---

## PART 8: NO NEW FILES NEEDED

✅ Character JSON files already exist with dialogue data  
✅ Memory system needs extension (new methods, not new files)  
✅ Orchestrator needs method (new method, not new file)  
✅ No separate dialogue profile files required  

All data is **already in the project**. Just wire it together.

---

## NEXT STEPS

1. **Extend dm-memory-system.js** — Add three NPC tracking methods
2. **Add dialogue generator** — One method in GameMasterOrchestrator
3. **Build dialogue prompt** — Using existing character data
4. **Test with Black Dow** — Verify it works
5. **Wire into game flow** — Call when needed

That's it. The character data already exists. We're just using it.
