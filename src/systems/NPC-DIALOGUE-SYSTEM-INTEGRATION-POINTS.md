# NPC DIALOGUE SYSTEM - INTEGRATION ARCHITECTURE
## Mapping Natural Dialogue Generation into Existing Engine

### EXECUTIVE SUMMARY
The OpenClaw engine has **natural integration points** for NPC dialogue generation. Rather than a separate module, dialogue should function as a **capability layer** above existing NPC data and ambiance systems.

**No deletions required.** This is additive.

---

## PART 1: EXISTING INFRASTRUCTURE WE'LL LEVERAGE

### Layer 1: NPC Character Data Structure
**Location:** `/Users/mpruskowski/.openclaw/workspace/dnd/characters/`
**Files:** `[npcname].json`, `[npcname]_log.md`, `[npcname]_active.md`

**What we have:**
- ✅ Rich personality profiles (alignment, speech pattern, morale, loyalty)
- ✅ Relationship mapping (who knows who, tension points)
- ✅ Combat tactics (reveals decision-making under stress)
- ✅ Lore & background (foundational knowledge)
- ✅ Campaign hooks (usage context)

**What we need to add:**
- `[npcname]_dialogue.json` — Dialogue patterns, voice, verbal tics, conversation starters
- `[npcname]_memory.md` — Interaction history with party and other NPCs

**Example: Black Dow**
```json
{
  "dialogue_profile": {
    "voice": "Sharp-tongued, economical, cutting wit",
    "verbal_tics": ["sharp enough", "cost is", "only the dead"],
    "topics_avoid": ["weakness", "sentimentality"],
    "topics_provoke": ["betrayal", "power", "survival"],
    "speech_tempo": "Slow, deliberate, menacing pauses",
    "formality": "Informal with allies, coldly formal with enemies"
  },
  "relationship_dialogue_triggers": {
    "logen_ninefingers": "Contemptuous, dismissive, justifies betrayal",
    "the_dogman": "Hostile, taunting, references old times to wound",
    "northern_clans": "Commanding, transactional, expects obedience"
  }
}
```

### Layer 2: Memory System
**Location:** `/Users/mpruskowski/.openclaw/workspace/dnd/dm-memory-system.js` (implied)
**Tracks:** Events, NPC interactions, decisions, timeline

**What we can hook:**
- NPC interaction log (party → NPC)
- NPC meeting history (who's seen who, when)
- Consequence triggers (broken promises, faction shifts)
- Emotional temperature (is this NPC angry/scared/confident?)

### Layer 3: Ambiance System
**Location:** `/Users/mpruskowski/.openclaw/workspace/dnd/src/systems/ambiance-system.js`

**Current responsibility:**
- Scene music, image prompts, sensory evocation

**How dialogue fits:**
- Dialogue IS part of ambiance (character voice, tone, feeling)
- Both tap the same **narrative intent** engine
- Ambiance triggers dialogue (walking into tavern → NPC reacts)

### Layer 4: Combat Engine
**Location:** In `game-master-orchestrator-v2.js`
**Class:** `IntegratedCombatEngine`

**Dialogue moments in combat:**
- Turn-based banter (taunts during combat)
- Morale calls (leadership dialogue that affects performance)
- Surrender negotiations (NPC dialogue when losing)
- Alliance offers (mid-combat dialogue to shift dynamics)

### Layer 5: Consequence Engine
**Location:** In `game-master-orchestrator-v2.js`
**Class:** `ConsequenceEngine`

**Dialogue triggers:**
- NPC has learned about broken promise → responds in dialogue
- Faction reputation changes → NPC treats party differently (dialogue reflects this)
- World state changed → NPC dialogue acknowledges new reality

### Layer 6: Event Bus / Event Pipeline
**Location:** `/Users/mpruskowski/.openclaw/workspace/dnd/src/core/`
**Files:** `event-bus.js`, `turn-pipeline.js`

**Dialogue events:**
- `npc:dialogue-request` — GM asks NPC for response
- `npc:dialogue-generated` — Dialogue system outputs text
- `dialogue:consequence-triggered` — NPC reacts to consequence

---

## PART 2: NPC DIALOGUE SYSTEM ARCHITECTURE

### Conceptual Flow

```
PARTY ACTION (natural language)
    ↓
[GAME MASTER ORCHESTRATOR V2]
    ├─ Check: Which NPC involved?
    ├─ Query: NPC's memory of party
    └─ Emit: npc:dialogue-request
    
↓↓↓

[NPC DIALOGUE SYSTEM] ← NEW
    ├─ Load: NPC character file (.json)
    ├─ Load: NPC dialogue profile (.json)
    ├─ Load: Interaction history (_memory.md)
    ├─ Load: Party context from Memory System
    ├─ Load: Consequence state (is trust broken?)
    ├─ Load: Emotional temperature (scared? angry? confident?)
    ├─ Consult: Relationship map (how does NPC feel about each party member?)
    ├─ Generate: Dialogue context prompt
    └─ Return: Dialogue + metadata
    
↓↓↓

[AMBIANCE SYSTEM] (optional voice/music adjustment)
    └─ Emit: Sensory layer to match dialogue tone

↓↓↓

[GAME MASTER receives dialogue]
    └─ Print to console/chat with NPC context
```

### System Components

#### Component 1: NPC Dialogue Engine
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/src/systems/npc-dialogue-engine.js` (NEW)

**Responsibility:** Generate contextual dialogue from NPC profile + situation

**Input:**
- NPC ID (e.g., "blackdow")
- Action type (greeting, combat, reaction, negotiation)
- Context (who's present, what just happened, emotional stakes)
- Party relationship state (trusted, enemy, neutral)

**Output:**
```javascript
{
  npcId: "blackdow",
  dialogue: "Sharp enough blade there. Won't be worth much once you're using it to dig your own grave.",
  tone: "menacing",
  emotional_state: "confident",
  action_implied: "sizes up party for threat",
  followup_options: [
    { trigger: "intimidation_check", response: "laughs coldly" },
    { trigger: "attack", response: "Finally" }
  ]
}
```

#### Component 2: NPC Context Builder
**Part of:** NPC Dialogue Engine (internal method)

**Queries:**
1. **Memory System:** "What has this NPC experienced with the party?"
   - Last interaction date
   - Previous actions by party
   - Promises made/broken
   - Violence between them

2. **Relationship Map:** "How does this NPC feel about each party member?"
   - Respect? Fear? Contempt?
   - Previous shared history?
   - Does NPC have allies or enemies in party?

3. **Consequence State:** "What external facts does NPC know?"
   - Has reputation changed?
   - Did a promise get fulfilled/broken?
   - Did NPC's patron gain/lose power?

4. **Ambiance/Location:** "Where are they talking?"
   - Tavern (less formal) vs Castle (formal) vs Combat field (tense)?
   - Is NPC on home ground?
   - Are they alone or observed?

5. **Combat Status** (if in combat):
   - Is NPC winning or losing?
   - Are allies nearby or dead?
   - What's the morale like?

#### Component 3: NPC Dialogue Profile (Data Structure)
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/characters/[npcname]_dialogue.json` (NEW, created per NPC)

**Example:**
```json
{
  "npcId": "blackdow",
  "base_personality": {
    "voice": "Sharp-tongued, economical, cutting wit",
    "speech_tempo": "Slow, deliberate, menacing pauses",
    "vocabulary": "Northern warrior dialect, archaic, brutal metaphors",
    "verbal_tics": [
      "sharp enough",
      "only the dead",
      "cost is high",
      "spine enough"
    ],
    "laugh_style": "Cold, clinical, mocking",
    "silence_meaning": "Contempt or calculation"
  },
  
  "dialogue_by_relationship": {
    "neutral": {
      "greeting": "Who's asking? Speak quick.",
      "challenge": "Sharp enough blade there. Won't be worth much once you're using it to dig your own grave.",
      "alliance_offer": "What makes you think I'd want *you* at my back?"
    },
    "enemy": {
      "greeting": "I should've killed you when I had the chance.",
      "taunt": "[laughs coldly] You actually think you can *win*? I've killed more men than winter.",
      "mercy_plea": "Nothing you say interests me."
    },
    "ally": {
      "greeting": "Still breathing. Good.",
      "approval": "That took spine. Not many have it.",
      "request": "Do this right, and I won't forget."
    }
  },
  
  "dialogue_by_context": {
    "first_meeting": {
      "opener": "New faces. State your business before I decide you're not worth the air.",
      "tone": "Sizing them up, calculating threat level"
    },
    "negotiation": {
      "pattern": "Demands concession upfront, tests resolve, offers cold alliance",
      "break_point": "If party shows weakness, dismisses negotiation entirely"
    },
    "combat_opening": {
      "phrase": "Now we settle this.",
      "action": "Charges most dangerous opponent"
    },
    "combat_winning": {
      "taunt": "Is this all you have? Disappointing.",
      "offering_surrender": "Crawl away and I might let you live. Might."
    },
    "combat_losing": {
      "response": "Smart enough to know when it's done. I'll remember this.",
      "triggers_betrayal": "Will stab allies to escape if losing badly"
    }
  },
  
  "emotional_volatility": {
    "confidence_high": "Contemptuous, mocking, takes unnecessary risks",
    "confidence_low": "Dangerous, calculating escape, paranoid",
    "trust_broken": "Cold rage, dismissive, may attempt revenge"
  },
  
  "forbidden_topics": [
    "weakness (his own)",
    "sentimentality",
    "mercy (perceived as weakness)"
  ],
  
  "provocation_topics": [
    "betrayal (both ways)",
    "power dynamics",
    "survival",
    "legacy/being remembered"
  ]
}
```

#### Component 4: NPC Interaction Logger
**File:** New methods in `DMMemory` class

**Tracks per NPC:**
```javascript
{
  "blackdow": {
    "first_meeting": "session_3",
    "interaction_count": 4,
    "last_interaction": "session_5_combat",
    "relationship_score": -15, // -100 (enemy) to +100 (devoted ally)
    "interactions": [
      {
        "session": 3,
        "action": "party_refused_blackdow's_offer",
        "consequence": "reputation -10"
      },
      {
        "session": 4,
        "action": "party_humiliated_blackdow's_men",
        "consequence": "reputation -15"
      },
      {
        "session": 5,
        "action": "combat_with_blackdow",
        "outcome": "draw",
        "consequence": "reputation +5 for respecting his strength"
      }
    ]
  }
}
```

---

## PART 3: INJECTION POINTS (WHERE IT HOOKS)

### Injection Point 1: GameMasterOrchestrator.interactNPC()
**File:** `game-master-orchestrator-v2.js` (line ~290-310)
**Current:**
```javascript
interactNPC(npcId, action, details = {}) {
  const npc = this.getNPC(npcId);
  // ... logs interaction, checks consequences
  console.log(`\n🎭 ${npc.name} (${npc.role}): ${action}\n`);
  // ...
}
```

**INJECTION:**
```javascript
interactNPC(npcId, action, details = {}) {
  const npc = this.getNPC(npcId);
  
  // NEW: Generate dialogue response
  const dialogueResult = await this.npcDialogueEngine.generateDialogue({
    npcId,
    actionType: 'interaction',
    partyAction: action,
    context: {
      location: this.memory.getLocation(),
      presentNPCs: this.module.getNPCsForLocation(this.memory.getLocation()),
      partyRelationship: this.memory.getNPCRelationship(npcId),
      interactionHistory: this.memory.getNPCInteractionHistory(npcId)
    }
  });
  
  // Log interaction + dialogue
  this.memory.recordNPCInteraction(npc.name, action, {
    dialogue: dialogueResult.dialogue,
    tone: dialogueResult.tone,
    emotionalState: dialogueResult.emotional_state
  });
  
  console.log(`\n🎭 ${npc.name} (${npc.role}):`);
  console.log(`   "${dialogueResult.dialogue}"\n`);
  console.log(`   [${dialogueResult.tone}]\n`);
  
  // ... rest of existing logic
}
```

### Injection Point 2: AMbianceSystem → Dialogue Ambiance
**File:** `src/systems/ambiance-system.js` (new event listener)

**ADD:**
```javascript
setupListeners() {
  // ... existing listeners ...
  
  // NEW: Listen for dialogue requests
  this.eventBus.on('npc:dialogue-generated', (event) => {
    this.handleDialogueAmbiance(event.data.dialogue, event.data.tone);
  });
}

handleDialogueAmbiance(dialogue, tone) {
  // Adjust scene ambiance to match dialogue tone
  const toneMap = {
    'menacing': { music: 'tense_strings', lighting: 'red_shadow' },
    'conspiratorial': { music: 'whisper_ambient', lighting: 'dim_candlelight' },
    'joyful': { music: 'tavern_cheer', lighting: 'warm_firelight' },
    'grim': { music: 'funeral_march', lighting: 'grey_overcast' }
  };
  
  const ambiance = toneMap[tone] || toneMap['neutral'];
  this.eventBus.emit('ambiance:dialogue-context', ambiance);
}
```

### Injection Point 3: IntegratedCombatEngine → Combat Banter
**File:** `game-master-orchestrator-v2.js` (in combat engine methods)

**ADD combat dialogue hooks:**
```javascript
beginEncounter(encounterName, enemies, partyMembers) {
  // ... existing setup ...
  
  // NEW: Generate opening dialogue for key enemies
  enemies.forEach(enemy => {
    if (typeof enemy === 'object' && enemy.dialogue_enabled) {
      const openingLine = await this.npcDialogueEngine.generateDialogue({
        npcId: enemy.id,
        actionType: 'combat_opening',
        context: { combatOpening: true }
      });
      console.log(`⚔️  ${enemy.name}: "${openingLine.dialogue}"`);
    }
  });
}

rollAttack(attacker, target, bonuses = {}) {
  // ... existing attack logic ...
  
  // NEW: If attacker is NPC, generate combat dialogue
  if (this.combatants.get(attacker).type === 'npc') {
    const taunt = await this.npcDialogueEngine.generateDialogue({
      npcId: attacker,
      actionType: 'combat_action',
      target: target,
      result: hit ? 'hit' : 'miss'
    });
    console.log(`   "${taunt.dialogue}"`);
  }
}
```

### Injection Point 4: ConsequenceEngine → Dialogue Response
**File:** `game-master-orchestrator-v2.js` (in ConsequenceEngine class)

**ADD dialogue to consequences:**
```javascript
checkConsequences(situation) {
  const triggered = [];
  
  this.promises.forEach(p => {
    if (p.status === 'pending' && situation.includes(p.promisee)) {
      // NEW: Generate NPC reaction dialogue to broken promise
      const npcReaction = await this.dialogueEngine.generateDialogue({
        npcId: p.promisee,
        actionType: 'consequence_broken_promise',
        context: { promise: p.promiseText }
      });
      
      triggered.push({
        type: 'broken_promise',
        promisee: p.promisee,
        dialogue: npcReaction.dialogue,
        emotionalShift: npcReaction.relationship_change
      });
    }
  });
  
  return triggered;
}
```

### Injection Point 5: LoadScene() → NPC Dialogue on Arrival
**File:** `game-master-orchestrator-v2.js` (in loadScene method)

**ENHANCEMENT:**
```javascript
async loadScene(locationId, description = '') {
  // ... existing location loading ...
  
  const npcsHere = this.module.getNPCsForLocation(locationId);
  
  // NEW: Generate greeting dialogue from NPCs
  for (const npc of npcsHere) {
    const greeting = await this.npcDialogueEngine.generateDialogue({
      npcId: npc.id,
      actionType: 'location_greeting',
      context: {
        partyEntering: true,
        npcTerritoryType: location.type, // tavern, lair, castle, etc
        lastMeeting: this.memory.getLastNPCMeeting(npc.id)
      }
    });
    
    console.log(`\n🎭 ${npc.name}: "${greeting.dialogue}"`);
  }
}
```

---

## PART 4: DATA FLOW (CONCRETE EXAMPLE)

### Scenario: Party enters tavern where Black Dow is drinking

**1. GM calls:**
```javascript
await gm.loadScene('tavern-crossroads', 'You push through the tavern door...');
```

**2. System flow:**
```
loadScene()
  → getNPCsForLocation('tavern-crossroads')
  → Returns: [Black Dow, tavern keeper, 2 mercenaries]
  
  → For each NPC:
    → npcDialogueEngine.generateDialogue({
        npcId: 'blackdow',
        actionType: 'location_greeting',
        context: {
          partyEntering: true,
          npcTerritory: 'tavern',
          lastMeeting: { date: 'session_3', outcome: 'hostile_negotiation' },
          relationshipScore: -15,
          npcMood: 'confident' (he's on home ground)
        }
      })
      
  → Engine loads:
    - blackdow.json (stats, background, relationships)
    - blackdow_dialogue.json (voice, speech patterns)
    - Memory (interaction history with party)
    - Emotional state from context
    
  → Generates context prompt for Claude:
    "You are Black Dow, a ruthless Northman fighter. The party previously 
     refused your offer. Your reputation with them is -15 (enemies). 
     You're in a tavern (your territory). You spot them entering.
     Generate your immediate reaction in 1-2 short sentences.
     Voice: Sharp-tongued, economical, cutting wit.
     Tone should be: menacing confidence"
    
  → Returns dialogue:
    {
      dialogue: "Well. The fools who couldn't recognize opportunity walk back in. 
                 Sharp enough to survive, not smart enough to profit from it.",
      tone: "menacing",
      relationship_shift: 0,
      followup_triggers: [
        'negotiations',
        'combat',
        'alliance_offer'
      ]
    }
    
  → Logged to memory system
  → Printed to console:
    "🎭 Black Dow: 'Well. The fools who couldn't recognize opportunity walk back in...'"
    
  → Ambiance system adjusts scene music (tense strings)
```

### Scenario 2: Party proposes alliance with Black Dow

**GM calls:**
```javascript
await gm.interactNPC('blackdow', 'we_want_to_work_with_you', { 
  proposed_goal: 'defeat_rival_faction' 
});
```

**System flow:**
```
interactNPC()
  → Calls npcDialogueEngine.generateDialogue({
      npcId: 'blackdow',
      actionType: 'negotiation',
      partyAction: 'alliance_proposal',
      context: {
        relationshipScore: -15,
        partyStrength: 'moderate',
        proposedGoal: 'defeat_rival_faction',
        npcGoals: ['consolidate_power', 'eliminate_rivals'],
        isNPCStrongPoint: true  // blackdow wants this
      }
    })
    
  → Engine considers:
    - Is this alliance useful to Black Dow?
    - Does he trust the party? (No, score is -15)
    - Does he respect their strength? (Possibly)
    - What's his leverage? (He's stronger)
    
  → Generates response:
    {
      dialogue: "You think you can help me? Prove it. Kill the warlord 
                 at Stonehold. Come back with his head, and I'll consider 
                 you less useless.",
      tone: "calculating",
      negotiation_stance": "testing",
      consequence: relationshipScore could improve to -10 if party completes task,
      relationship_shift_pending: +5 (if objectives met)
    }
    
  → Logs to memory: "Black Dow proposed: kill warlord at Stonehold"
  → Next time party meets, if they've done it, dialogue acknowledges it
```

---

## PART 5: WHAT NOT TO DELETE

**KEEP EVERYTHING:**
- ✅ GameMasterOrchestrator structure
- ✅ Memory system (we extend it, don't replace)
- ✅ Combat engine (we inject dialogue, don't restructure)
- ✅ Ambiance system (we add listener, don't remove)
- ✅ Character JSON files (we add `_dialogue.json` sibling files)
- ✅ Consequence engine (we call into it from dialogue)

**ONLY ADD:**
- `npc-dialogue-engine.js` (new system file)
- `[npcname]_dialogue.json` files (one per NPC)
- New methods in `DMMemory` class (for tracking NPC interactions)
- Event listeners in existing systems
- Injection points in existing orchestrator methods

---

## PART 6: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Safe to attempt first)
1. Create NPC Dialogue Profile template (`_dialogue.json`)
2. Create Black Dow dialogue profile (test case)
3. Create Dogman dialogue profile (test case)
4. Add NPC interaction tracking methods to DMMemory

### Phase 2: Engine Creation
1. Build `npc-dialogue-engine.js` skeleton
2. Implement context builder (queries memory, relationships)
3. Implement dialogue generation (hooks to Claude API or local LLM)
4. Test with Black Dow / Dogman standalone

### Phase 3: Integration
1. Add dialogue hooks to `interactNPC()`
2. Add dialogue hooks to `loadScene()`
3. Add dialogue hooks to combat engine
4. Connect to ambiance system

### Phase 4: Refinement
1. Tune dialogue profiles based on play testing
2. Add NPC-to-NPC dialogue (when multiple NPCs interact)
3. Add dialogue consequence tracking (NPC "learns" what party did via dialogue)
4. Polish tone + voice consistency

---

## NEXT STEPS (What's Safe to Do Now)

**Before building the engine:**
1. Review existing NPC files to understand current data depth
2. Design `_dialogue.json` schema (based on character personality already in `name].json`)
3. Map out which NPCs need dialogue profiles first (start with Black Dow, Dogman, Threetrees)
4. Plan how "NPC-to-NPC dialogue" will work (Dogman & Threetrees meet, what do they say?)
5. Decide: Single Claude LLM call per dialogue, or pre-generated responses?

**No code changes needed yet.**
