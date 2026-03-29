# PILLAR #2: PERSISTENT WORLD STATE
## "How What Just Happened Changes Everything Later"

## THE INSIGHT

> "A brilliant rules engine that doesn't nail intent→stakes→resolution will feel like a rules lawyer."
> "A brilliant intent→stakes→resolution engine that has goldfish memory will feel like a slot machine."
> **"But nail BOTH pillars—the loop + the sticky world—and you get something that FEELS like a true DM."**

---

## TWO PILLARS OF A REAL D&D ENGINE

### PILLAR #1: THE HEARTBEAT (Already Built)
```
Player Intent → System Understanding → Stakes Analysis
    ↓
Resolution (fair & interesting) → World State Update
    ↓
Next Decision Point
```

### PILLAR #2: PERSISTENT MEMORY (NEW - 2 Files)
```
Every action leaves fingerprints in the world
Every consequence cascades to related entities
Every promise/debt/secret gets tracked
Every NPC remembers what the party did
Every promise can come back to haunt you at level 9
```

---

## ARCHITECTURE: PERSISTENT WORLD STATE ENGINE

### Layer 1: Entity Graph (not just "Guard #7")

```javascript
Sergeant Marlow
├── Identity: "veteran, gruff, protective of subordinates"
├── History:
│   ├── Day 1: "Party bribed me to let them pass"
│   ├── Day 3: "Party defended my subordinate from bandits"
│   ├── Day 7: "Party betrayed my sister's location to enemies"
├── Attitude: "cautious but indebted"
├── Trust: 40 (mixed)
├── Fear: 10 (not scared)
├── Debt: 15 (owes party a favor)
├── Memory of Player:
│   ├── "They paid gold to get past, not asking first"
│   ├── "Then they saved Private Chen from death"
│   ├── "Then they sold out my sister"
└── Open Promises:
    └── "Will help party if they prove they've changed"
```

Not a static NPC. A **living entity** whose attitude shifts as the party interacts.

---

## HOW CONSEQUENCES PERSIST

### The Guard Example

**Session 1: First Encounter**
```
PLAYER ACTION: "I want to bribe the guard to let us pass."
RESOLUTION: SUCCESS. Guard takes 50 gold.
WORLD UPDATE:
  - Marlow.trust += 5 (you paid him honorably)
  - Marlow.attitude = "transactional"
  - Open Loop created: "Marlow now expects party will pay for passage in future"
```

**Session 3: Second Encounter**
```
PLAYER ACTION: "We defend Marlow's subordinate from bandits."
RESOLUTION: SUCCESS. Private Chen saved.
WORLD UPDATE:
  - Marlow.attitude = "grateful"
  - Marlow.trust += 15
  - Marlow.debt += 20 (major favor owed)
  - Chen becomes ally of party
  - Open Loop: "Chen's life debt to party"
```

**Session 7: Return to Area**
```
SETTING: Party passes through Marlow's territory.
ENGINE SURFACES:
  "Sergeant Marlow. You paid him 50g for passage. Then you saved his subordinate's life.
   He's grateful but also cautious—he's expecting you to someday call in that debt.
   Trust: 55. Attitude: friendly. Owes you: major favor."

MARLOW: "You saved Chen. I won't forget that. When you need help, come find me."
```

**Session 15: Party Betrays Marlow's Sister**
```
PLAYER ACTION: "We tell the enemy where Marlow's sister is hiding."
RESOLUTION: Betrayal confirmed.
WORLD UPDATE:
  - Marlow.attitude = "HOSTILE"
  - Marlow.trust = -80
  - Marlow.debt = 0 (canceled)
  - Open Loop created: "Revenge quest - find party & settle accounts"
  - Cascade: Sister dies → Chen seeks revenge → garrison becomes hostile
```

**Session 22: Party Returns to Region**
```
ENGINE SURFACES:
  "Sergeant Marlow. The man who was once your ally.
   
   You remember: You saved Private Chen. Marlow owed you everything.
   
   Then you betrayed his sister to the enemy. She died.
   
   Marlow is now HOSTILE (-80 trust). Chen leads a revenge party.
   If you encounter them, they will attack on sight.
   
   ⚠️  OPEN LOOP: Revenge quest still active. Pressure: CRITICAL."

MARLOW (if encountered): "You got my sister killed. Now you die."
```

---

## THE STICKY WORLD: WHAT GETS TRACKED

### 1. ENTITY GRAPH
- **NPCs** with identity, history, personality
- **Factions** with reputation dials
- **Locations** with state & memory
- **Items** with provenance (who had it? how did it get here?)
- **Quests** with causal links to events

### 2. RELATIONSHIPS (Directed, Weighted)
```
Marlow → Party: "benefactor" (strength: 60)
Party → Marlow: "ally" (strength: 50)
Chen → Party: "saviors" (strength: 95)
Marlow's Sister → Party: "enemy" (strength: -100)
```

### 3. CAUSAL HISTORY
```
Event: "Party bribed Marlow"
  Type: transaction
  Actor: Party
  Target: Marlow
  Moral alignment: pragmatic
  Consequence: Marlow now expects payment in future
  Witnesses: Chen, other guards
```

Not just "bribe happened"—**why** it happened, **who saw**, and **what it means**.

---

## OPEN LOOPS: THE HANGING THREADS

### Promise
```
"Party promised to defend the village for 10 sessions"
Created: Session 3
Deadline: Session 13 (now overdue)
Pressure: CRITICAL
Affects: Village elder, party, bandits
If unfulfilled: Village burns, elder seeks revenge
```

### Debt
```
"Marlow owes party a major favor"
Created: Session 3
Creditor: Party
Debtor: Marlow
Amount: 20 (major)
Pressure: HIGH (it's been 19 sessions)
```

### Revenge
```
"Marlow's sister is dead. Chen and Marlow seek revenge on party"
Created: Session 15
Target: Party
Created by: Marlow
Pressure: CRITICAL (active threat)
```

### Mystery
```
"Where is the wizard's missing spellbook?"
Created: Session 1
Still unresolved: Session 22
The book is in the tower you fled from
Pressure: MEDIUM (threat still exists)
```

---

## WORLD TIME PASSAGE (The World Doesn't Wait)

When players ignore a threat or skip time:

```javascript
advanceTime(3); // 3 sessions pass

// What happens?
// 1. Cult grows (ignored threat)
// 2. Marlow pursues his revenge goals
// 3. Open loops age and pressure increases
// 4. NPC goals progress independently
// 5. Consequences creep forward
```

**Example:**
```
Party ignores cult for 8 sessions.

During those 8 sessions, AUTONOMOUSLY:
  - Cult recruits 50 new members (was 20)
  - Cult steals artifact (was just planning)
  - Cult summons lesser demon (was just ritual prep)
  - 3 villages fall under cult influence
  - Pressure on open loop: "Stop the cult" → CRITICAL

When party finally returns:
  World has evolved. Cult is now a major threat.
  The world didn't wait for them.
```

---

## MEMORY SURFACING: HOW IT WORKS

### At NPC Encounter

```
ENGINE SURFACES for Marlow:

1. RECENT INTERACTION
   "You met Marlow last session. He was friendly but wary."

2. ATTITUDE SHIFT (if one happened)
   "The last time you interacted, he learned you betrayed his sister.
    His attitude shifted from grateful to hostile."

3. UNRESOLVED PROMISES
   "Marlow promised to help you 'when you need it.' But that was before
    the betrayal. That promise is now null."

4. DEBTS
   "Marlow owes you a favor, but given the betrayal, he likely won't pay it."

5. SECRETS HE KNOWS
   "Marlow knows you were bribed by the enemy. He could leverage this."
```

Not information overload. **Prioritized by relevance.** Most important facts first.

---

## EXAMPLE: THE 4-HOUR ARC

### Session 1 (Game Time: Day 1)
Player bends rules to save an innocent from execution.
```
CONSEQUENCE:
  - Guard (Kellan) witnesses mercy
  - Kellan.attitude = "impressed"
  - Kellan.trust += 30
  - Open Loop: "Kellan is in party's debt"
```

### Session 8 (Game Time: Day 8)
Party encounters different guard who is Kellan's friend.
```
ENGINE SURFACES:
  "This guard, Torvin, is friends with Kellan.
   Kellan told him you saved an innocent when the law said execute.
   Torvin is curious about you—not hostile, but testing.
   
   If you're merciful here too, Torvin becomes ally.
   If you're cruel, word gets back to Kellan and breaks that trust."
```

### Session 15 (Game Time: Day 15)
Party is hunted by authorities. Kellan has chance to turn them in.
```
ENGINE SURFACES:
  "Kellan remembers: you showed mercy when you didn't have to.
   
   That was 7 sessions ago. He's thought about it every day.
   
   Now he has a choice: turn you in (safe, profitable) or help you (risky, honorable).
   
   He chooses to help. Mercy paid off."
```

The **same seed planted in Session 1** blooms as a full arc of consequences.

---

## TWO SYSTEMS WORKING TOGETHER

### THE HEARTBEAT LOOP (Pillar 1)
```
Intent: "I want to show mercy to this prisoner"
Stakes: "If you do, you defy the authority. If you don't, the innocent dies."
Resolution: Roll, succeed, prisoner freed.
World Update: Kellan watches. Trust increases.
Next Decision: "You've escaped with the prisoner. Now what?"
```

### PERSISTENT WORLD (Pillar 2)
```
Kellan's memory: "This party shows mercy. I'll remember that."
7 sessions later: "Should I turn them in or help them?"
Because of memory: "I'll help them. They earned it."
Arc closure: Mercy from Session 1 creates safe passage in Session 15
```

**Together:** The world feels **coherent, alive, and reactive**.

---

## COMPARISON: WITH vs WITHOUT PILLAR #2

### Without Persistent Memory ❌
```
Session 1: "You spare the prisoner. Guard sees. +10 trust with guard."
[Guard object stores this, but it doesn't matter in implementation]

Session 15: "You encounter a guard."
[New guard. No memory of Session 1.]

Session 1's action had ZERO lasting consequence. The world has goldfish memory.
```

### With Persistent Memory ✅
```
Session 1: "You spare the prisoner. Kellan watches, remembers, is impressed."
[Kellan.memoryOfPlayer stores: "Showed mercy when could have been cruel"]

Session 8: "You meet Torvin, Kellan's friend."
[Engine surfaces: "Torvin knows Kellan talks about you. He's curious."]

Session 15: "You need escape. Kellan has the chance."
[Engine surfaces: "Kellan remembers. He helps you.]

Session 1's mercy CHANGED THE STORY across 14 sessions of play.
```

---

## WHAT GETS STORED

### Complete Entity Record
- Name, description, role
- Attitudes (how they feel)
- Trust (will they believe you?)
- Fear (are they scared of you?)
- Debt (do they owe you?)
- Memory of interactions
- Goals (what do they want?)
- Secrets (what do they know?)
- Relationships (who do they know?)
- History (complete log of events)

### Causal Events
- What happened
- Who did it
- Who witnessed
- What changed as a result
- Moral alignment (was it merciful? cruel? selfish?)

### Open Loops
- Promises (spoken or implied)
- Debts (favors, money, blood)
- Revenge (unresolved grievances)
- Mysteries (unsolved questions)
- Threats (ongoing dangers)
- Quests (unfinished business)

**All trackable. All surfaceable. All exploitable by players.**

---

## THE MAGIC MOMENT

Player: "Wait—didn't we meet Kellan in Session 1?"

Engine: "Yes. You spared a prisoner. Kellan was the guard. He was impressed."

Player: "Can we ask him for help?"

Engine: "You approach Kellan. He recognizes you immediately. 'You're the ones who spared the prisoner instead of executing them, despite the law. I've thought about that a lot.' He nods. 'Yeah. I'll help you.'"

**That's when it clicks.** The engine remembered something the player said 14 sessions ago. Remembered it accurately. And brought it back at exactly the right moment. The world feels alive because **it actually remembers.**

---

## CODE: 2 NEW SYSTEMS

```
persistent-world-state-engine.js      497 lines
memory-surfacing-engine.js             389 lines
───────────────────────────────────────────────
PILLAR #2 COMPLETE:                   886 lines
```

Combined with Pillar #1 (1,649 lines), you now have:

```
HEARTBEAT (Intent→Stakes→Resolution):  1,649 lines
PERSISTENT WORLD (Sticky memories):      886 lines
───────────────────────────────────────────────
CORE D&D ENGINE:                       2,535 lines
```

The two pillars that make D&D feel like D&D.

---

## STATUS

✅ Pillar #1: Intent→Stakes→Resolution Loop
✅ Pillar #2: Persistent World State
✅ Memory Surfacing (brings relevant facts to DM)
✅ Causal History (every event has WHY)
✅ Open Loops (promises, debts, revenge tracked)
✅ Autonomous NPCs (world doesn't wait)
✅ Time Progression (world evolves)

**The engine now remembers what you did. And it will make you pay for it (or reward you) later.**

🎭✨
