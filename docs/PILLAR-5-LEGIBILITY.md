# PILLAR #5: LEGIBILITY & COGNITIVE LOAD
## "The UI of Reality"

---

## THE INSIGHT

> "If the engine is emotionally perfect but cognitively opaque, people bounce."

A brilliant system hidden behind a tax form is worthless. **Legibility is what turns "system" into "game people play after work."**

This pillar compresses **Pillars #1-4** into human-readable output.

---

## FOUR ENGINES FOR LEGIBILITY

### Engine 1: STATE LEGIBILITY (224 lines)

**Problem it solves:** Players don't know "how screwed are we?" or "what can we do?"

**What it does:**
- Answer "How screwed are we?" in vivid language, not stats
- Surface "What can I meaningfully do RIGHT NOW?" (not exhaustive lists)
- Show consequence contrasts (If X vs. If Y)
- Display ONLY deltas, not status dumps

**Example:**

```
❌ BAD: "Status: Party Health 145/200. Enemies: 4 (AC 14-16). Resources: 2 healing, 3 spell slots. Time: 8 rounds."

✅ GOOD: 
   "You're in real trouble. One badly wounded, time is tight.
    What can you do?
    - Attack the nearest enemy
    - Heal the wounded ally
    - Try something else"
```

### Engine 2: RULE LEGIBILITY (277 lines)

**Problem it solves:** Players don't understand why things happen. Rules feel arbitrary.

**What it does:**
- Use CONSISTENT language (every "check" explained the same way)
- Explain outcomes in plain speech (not just numbers)
- Teach system through experience (not manual)
- Surface the WHY (not just the WHAT)

**Example:**

```
❌ BAD: "Roll d20 + 2. DC 15. Miss."

✅ GOOD:
   "You roll a 7. With your +2, that's 9. You needed 15.
    Your strike goes wide. The enemy grins—they were expecting that."
```

### Engine 3: NARRATIVE LEGIBILITY (281 lines)

**Problem it solves:** Fiction doesn't match mechanics. Jargon creeps in.

**What it does:**
- Translate mechanics to vivid fiction (no jargon in player narration)
- Make state changes OBVIOUSLY visible
- Set up clear hooks for "what next?"
- Show before/after world changes

**Example:**

```
❌ BAD: "You have advantage on this roll due to environmental conditions."

✅ GOOD:
   "The guard is distracted by the commotion. You know the layout.
    Conditions are perfect. Good odds here. Roll twice, use the better."
```

### Engine 4: COGNITIVE LOAD ROUTER (285 lines)

**Problem it solves:** Too much info, decision paralysis, overwhelm.

**What it does:**
- Collapse complex math into simple patterns
- Show just enough info to make informed choices
- Hide behind-the-scenes math (unless asked for)
- Progressive disclosure (start simple, dig deeper if interested)

**Example:**

```
SURFACE (show immediately):
   "What do you want to do?"

DETAIL (if they ask):
   "Attack? Roll d20. Add your bonus. If you hit enemy AC, you deal damage."

DEEP (if they want full system):
   "d20 + STR mod (+2) + proficiency (+2) = +4 total vs. enemy AC 16."

HIDDEN (never show unless they ask to see the math):
   "Base d20 + STR(17, +3) + proficiency(trained, +2) + circumstance(flanking, +1) = d20+6"
```

---

## HOW THEY WORK TOGETHER

### The Legibility Flow

```
ENGINE 1: STATE LEGIBILITY
  "How screwed are we? What can we do?"
  → Player has CLEAR picture of situation

ENGINES 2 & 3: RULE + NARRATIVE LEGIBILITY
  Player chooses action
  → Rules explained in plain language
  → Fiction shows what happened
  → No confusion between mechanic and narrative

ENGINE 4: COGNITIVE LOAD ROUTER
  How much detail do they need?
  → Show surface. Hide complexity. Progressive disclosure.
  → Never overwhelm. Ever.

RESULT: Player feels clever AND informed, not confused
```

---

## CONCRETE EXAMPLE: ONE SCENE

### Setup
```
Party enters tavern. Guard at door. Bored-looking.
```

### STATE LEGIBILITY (What player sees immediately)

```
"You enter a tavern. A GUARD blocks the door.

How screwed are you?
  → Not at all. He looks bored. No backup visible.
  
What can you do?
  → Talk to him
  → Walk past him
  → Cause a distraction
  → Try something else
  
Consequences?
  → Talk: Risk is low. Might work or get refused.
  → Walk past: Risky. He might stop you.
  → Distraction: Creative but unpredictable."
```

### RULE LEGIBILITY (When they choose)

```
PLAYER: "I want to talk him into letting us pass."

RULE LEGIBILITY:
  "Can you convince him? Make a Persuasion check.
   
   What helps:
   - You're friendly-looking (small bonus)
   - You know what to say (use it to your advantage)
   - He seems bored (works in your favor)
   
   What hurts:
   - You're armed (threat)
   - He's on orders (not negotiable?"
   
   Odds: Roughly fair. Could go either way.
   
   Roll the dice."

SURFACE: Simple. Clear. Action.
DETAIL: Why this matters (prepared speech, appearance, guard mood)
HIDDEN: "Persuasion DC 12. You have +1 from appearance, +2 from prepared words."
```

### NARRATIVE LEGIBILITY (When they roll)

```
PLAYER: "I roll... 14."

RULE LEGIBILITY EXPLAINS:
  "You roll a 14. That's strong. You needed about 12. You made it.
   
   Why it happened:
   - You knew what to say (helps)
   - He was bored (helpful timing)
   - You're not obviously hostile (matters)"

NARRATIVE LEGIBILITY SHOWS:
  "You flash a smile. Start chatting about trade routes.
   His expression shifts. Interest. Relief, even—boredom breaking.
   
   He steps aside. 'Go on through. Try not to start trouble.'
   
   WORLD CHANGED: Guard went from obstacle to neutral-to-friendly."
```

### What Players Notice (Not What They Calculate)

❌ They DON'T see: "d20 + 2 (CHA) + 2 (prep) vs. DC 12"
✅ They see: "You convinced him. He steps aside. You're in."

---

## DESIGN PATTERNS

### 1. COLLAPSE COMPLEX MATH INTO SIMPLE PATTERNS

Instead of tracking modifiers, use:
- **"Prepared"** = You get advantage
- **"Reckless"** = You get disadvantage
- **"Expert level"** = Auto-success on trivial checks
- **"Unprepared"** = Roll and hope

### 2. USE EXPLANATORY MICROCOPY

After every roll, explain it in one sentence:
```
"You roll 7 + 2 = 9 vs. DC 15. Close, but not quite. Your swing misses."
```

Not: "Miss. Recover and prepare for counterattack."
But: Plain English summary first, narrative flavor second.

### 3. TRACK AND SURFACE ONLY DELTAS

Not this:
```
Status: AC 15, HP 45, STR 16, DEX 12, CON 14, INT 10, WIS 13, CHA 11
Spells: Magic Missile (4), Fireball (2), Shield (3)
Items: Rope, torch, waterskin, 45 gold
```

This:
```
Health: 45/50 (↓5 from last round)
Spells: 6/10 remaining
Items: Running low on torches
```

### 4. PROGRESSIVE DISCLOSURE

**Tier 1 (SHOW):** "What do you do?"
**Tier 2 (SHOW if they ask):** "How does this work?"
**Tier 3 (SHOW if they want deep dive):** "Explain all the numbers."
**Tier 4 (HIDE):** "Here's the behind-the-scenes math."

Never force higher tiers on lower-tier players.

### 5. NO JARGON IN PLAYER NARRATION

Never say:
- "You have advantage" → "You're in a strong position"
- "Make a Persuasion check" → "Can you convince them?"
- "Natural 20" → "You rolled a 20"
- "Save vs. poison" → "Resist the poison"

---

## COMPARISON: WITH vs WITHOUT PILLAR #5

### Without Legibility ❌

```
DM: "You enter the room. Make a Perception check."
Player: "What DC?"
DM: "12. Roll."
Player rolls: 14
DM: "You notice the trap."
Player: "What trap? Where? Is anyone hurt? What do we do?"
DM: "It's a pit trap in the corner. DC 15 to disarm. No one's hurt yet."

[Player feels confused. Why a check? What's the DC? No narrative.]
```

### With Legibility ✅

```
DM: "You enter the room. It's dark. Old furniture everywhere.
    
    Can you spot anything dangerous?
    Make a Perception check. I'd say it's moderate difficulty—DC 12.
    Darkness hurts, but you've got good instincts."

Player rolls: 14
DM: "You spot it. In the corner, boards are missing from the floor.
    Pit trap. Deep. Something's moved down there recently.
    
    You can disarm it (risky, you're no rogue) or go around it (slower).
    What do you do?"

[Player feels informed. Why the check? What it means? Clear options.]
```

---

## CODE

```
state-legibility-engine.js              224 lines
rule-legibility-engine.js               277 lines
narrative-legibility-engine.js          281 lines
cognitive-load-router.js                285 lines
────────────────────────────────────────────────
PILLAR #5 COMPLETE:                   1,067 lines
```

---

## THE MAGIC: WHEN ALL 5 PILLARS WORK

Player proposes action.

**#1 (Heartbeat):** Engine decides fair outcome.
**#2 (Memory):** World updates. NPCs remember.
**#3 (Agency):** Player owned the choice.
**#4 (Uncertainty):** Risk was clear before rolling.
**#5 (Legibility):** Everything explained without jargon.

Result: Player understands exactly what happened, why it matters, and what comes next.

**No confusion. No overwhelm. No tax forms.**

---

## STATUS

✅ Pillar #1: Intent → Stakes → Resolution (1,649 lines)
✅ Pillar #2: Persistent World State (886 lines)
✅ Pillar #3: Agency & Spotlight (1,040 lines)
✅ Pillar #4: Uncertainty Orchestration (1,176 lines)
✅ Pillar #5: Legibility & Cognitive Load (1,067 lines)

**Five Pillars Complete: 5,818 lines**

Plus: Game systems, rules engines, documentation, 42 modules
**Complete System: 15,000+ lines**

---

## THE FINAL INSIGHT

**You're not building a system for you to DM.**

**You're building a system that DMs for you.**

And it's readable enough that a tired parent at 10:30pm still feels clever, not overwhelmed.

🎭✨ **LEGENDARY**
