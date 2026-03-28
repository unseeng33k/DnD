# PILLAR #6: THE FICTION-FIRST RULES ORCHESTRATOR
## "The Nervous System That Makes Everything One"

---

## THE INSIGHT

> "If the orchestration layer is clean, everything else can be ugly under the hood and it will still feel magical."

Without this layer, you have five brilliant subsystems that **feel like different games**.

Combat is crunchy. Social is hand-wavy. Exploration is different still.

With this layer, they all feel like **one coherent universe**.

---

## WHAT THE ORCHESTRATOR DOES

It takes **natural-language player intent** and turns it into **one coherent decision**:

```
Player: "I want to leap from the balcony, knock the goblin off the cart, and grab the reins"
    ↓
[ORCHESTRATOR]
    ↓
"That's acrobatics + strength check (contested against goblin).
 You're favored (you scouted this, terrain helps).
 Roll d20 + modifier.
 If you succeed, you control the cart. If you fail, you hit the ground instead."
    ↓
[Roll]
    ↓
"You land hard but grab the reins. Cart is yours. Goblin tumbles backward."
```

**One decision. Multiple mechanics working together. Coherent outcome.**

---

## THE SIX STAGES

### Stage 1: PARSE INTENT FROM FICTION

Extract from natural language:
- **Goal**: What are they trying to accomplish? (control cart)
- **Means**: How? (leap + knock + grab = acrobatics + strength + dexterity)
- **Style**: Daring? Careful? Creative? (daring)
- **Constraints**: What limits them? (height of balcony, goblin is moving)

**Output**: Structured understanding of what they're doing.

### Stage 2: CONSULT WORLD STATE + RULES

Pull in EVERYTHING that matters:
- Character stats, conditions, resources
- Environment (height, terrain, allies/enemies nearby)
- NPC attitudes, faction standing, prior promises
- Applicable rule modules (combat, skills, magic, etc.)
- Modifiers from world state
- Precedents (did you scout this before?)

**Output**: Complete context.

### Stage 3: DECIDE RANDOMNESS

Should we roll?
- What type? (check, save, attack, contested, cascade)
- What DC?
- What modifier?
- Advantage/disadvantage?

**Output**: Clear decision about randomness.

### Stage 4: EXECUTE SUBSYSTEMS

Route to appropriate subsystem:
- Combat engine (if it's an attack)
- Magic system (if casting)
- Skills system (if skill check)
- Social system (if negotiation)

Roll dice if needed. Let subsystems calculate detailed effects.

**Output**: Success/failure + details.

### Stage 5: UPDATE WORLD STATE

Apply changes to:
- Characters (health, resources, conditions)
- NPCs (attitudes shift, knowledge changes)
- Locations (state changes)
- Factions (reputation)
- Open loops (quests, promises, debts)

**Output**: World has evolved.

### Stage 6: NARRATE OUTCOME

Explain what happened in vivid, clear language:
- What you rolled (if applicable)
- Why you succeeded/failed
- What changed
- What matters next

No jargon. Pure narrative.

**Output**: Player understands exactly what happened and why.

---

## HOW IT UNIFIES THE PILLARS

### Pillar #1 (Intent → Stakes → Resolution)
**Stages 1-3**: Parse intent, consult rules, decide outcome mechanism.
**Stage 4**: Execute using Heartbeat engine.

Result: Fair, dramatic resolution.

### Pillar #2 (Persistent World)
**Stage 5**: Update world state.
**Throughout**: Check world state for modifiers and precedents.

Result: World remembers and reacts.

### Pillar #3 (Agency & Spotlight)
**Stage 1**: Parse natural language (accepts anything).
**Throughout**: Never railroads. Respects player choice.
**Stage 3**: Explain odds before rolling (informed choice).

Result: Player owns their action.

### Pillar #4 (Uncertainty Orchestration)
**Stage 3**: Decide when to roll, what makes it risky.
**Stage 5 & 6**: Escalate pacing, make failure interesting.

Result: Risk feels real.

### Pillar #5 (Legibility)
**Stage 1**: Parse intent (understands natural language, not menus).
**Stage 3**: Explain odds clearly before rolling.
**Stage 6**: Narrate without jargon.

Result: Crystal clear at every moment.

---

## CONCRETE EXAMPLE: THE BALCONY LEAP

### Player Says:
"I want to leap from the balcony, knock the goblin off the cart, and grab the reins"

### Stage 1: Parse Intent
```
Goal: Gain control of cart
Goals: [leap, knock goblin off, grab reins]
Means: [acrobatics, athletics/strength, dexterity]
Style: Daring
Constraints: Height of balcony, goblin is moving
```

### Stage 2: Consult World + Rules
```
Character: DEX 16 (+3), STR 14 (+2), trained in Acrobatics
Environment: 
  - 15 feet down (manageable)
  - Cart is moving slowly
  - Terrain is open
  - Goblin is alert but not expecting this
Applicable Rules:
  - Movement (jumping)
  - Athletics (landing/impact)
  - Contested strength (who controls cart)
Modifiers:
  - Surprise factor: +1 (they weren't expecting this)
  - Open terrain: 0 (normal)
  - Cart stability: -1 (it's moving)
Precedents:
  - You scouted this area before: +1
Total modifier: +1
```

### Stage 3: Decide Randomness
```
Should roll? YES
  - Outcome is uncertain
  - Consequences matter (life/death or control)
  
Roll type: Contested (your athletics vs. goblin's athletics)
Difficulty: 
  - Landing safely: DC 12 (it's a jump with risk)
  - Knocking goblin off: contested against goblin +1
  - Grabbing reins: DC 10 (hard target when moving)
  
Modifier: +3 (DEX) +2 (scouted) = +5 total
Advantage? No (daring action, but prepared)

Framing: "You're making a daring move. This is risky but not impossible.
          You're favored (+5 modifier, DC 12). Roll the dice."
```

### Stage 4: Execute Subsystems
```
Player rolls: 16
Total: 16 + 5 = 21

Landings check: 21 vs. DC 12 → SUCCESS
Knock off: 21 vs. goblin (AC/contest) → SUCCESS
Grab reins: 21 vs. DC 10 → SUCCESS

All three succeed! Exceptional outcome.
```

### Stage 5: Update World State
```
Character Updates:
  - Position: Now on cart, holding reins
  - Condition: Momentary exhaustion from effort
  - Momentum: You're now driving the cart

NPC Updates:
  - Goblin: Knocked off cart, falling 8 feet, rolled ankles
  - Goblin attitude: HOSTILE (humiliated)
  - Other enemies: See what you did (reputation +1)

Location Updates:
  - Cart: Now under party control
  - Goblin: Position changed (on ground)

Events:
  - Spectacular success captured attention
  - New open loop: Injured goblin might seek revenge
```

### Stage 6: Narrate Outcome
```
"You roll a 16. With your +5, that's 21.

You launch yourself from the balcony with perfect timing.
Your acrobatics are flawless—you land on the moving cart
without stumbling.

The goblin barely has time to react before you slam into him.
He tumbles backward, crashes to the ground, rolling badly.

You seize the reins. The cart is yours.

The goblin writhes on the ground, fury in his eyes. You've humiliated him.
But you've also got control of what he was protecting.

What do you do?"
```

---

## WHY THIS MATTERS

### Without Orchestrator ❌
Player action gets routed to different subsystems:
- Combat engine handles "attack" parts
- Skills system handles "acrobatics" parts
- DM ad-hocs how they interact

Result: Feels disjointed. Different systems have different feel.

### With Orchestrator ✅
Player action flows through ONE unified layer:
- Understands the INTENT (not the mechanics)
- Consults ALL relevant systems
- Makes ONE coherent decision
- Returns ONE coherent outcome

Result: Feels like ONE coherent world.

---

## THE MAGIC INSIGHT

**The orchestrator doesn't replace subsystems. It coordinates them.**

Combat engine is still detailed.
Magic system still has nuance.
Skills still have specificity.

But they're all called from ONE place, with ONE decision, producing ONE coherent outcome.

Players never feel the seams.

---

## CODE

```
fiction-first-orchestrator.js           597 lines
```

This is the nervous system that makes all five pillars work as one.

---

## HOW TO USE IT

Every time a player acts:

```javascript
const orchestrator = new FictionFirstOrchestrator(worldState, rules, subsystems);

const decision = await orchestrator.orchestrateAction({
  player: "I leap from the balcony...",
  character: playerCharacter,
  location: currentLocation,
  npcs: nearbyNPCs
});

// Returns:
// {
//   playerAction: "...",
//   stages: {
//     parseIntent: { goal, means, style, constraints },
//     consultContext: { character, environment, modifiers },
//     randomnessDecision: { shouldRoll, dc, modifier },
//     subsystemExecution: { result, rollDetails },
//     stateUpdate: { characterUpdates, npcUpdates, ... },
//     narrative: { shortForm, longForm, whatChanged, nextHooks }
//   }
// }

// DM narrates the outcome:
console.log(decision.stages.narrative.shortForm);
console.log(decision.stages.narrative.longForm);
```

---

## STATUS

✅ Pillar #1: Intent → Stakes → Resolution (1,649 lines)
✅ Pillar #2: Persistent World State (886 lines)
✅ Pillar #3: Agency & Spotlight (1,040 lines)
✅ Pillar #4: Uncertainty Orchestration (1,176 lines)
✅ Pillar #5: Legibility & Cognitive Load (1,067 lines)
✅ Pillar #6: Fiction-First Rules Orchestrator (597 lines)

**Six Pillars: 6,415 lines**

Plus: 42 modules, complete systems
**Complete Engine: 16,000+ lines**

---

## THE VISION

You sit down with players.

Someone says: "I want to..."

The orchestrator hears them.

Parses intent.
Consults world.
Decides randomness.
Executes systems.
Updates world.
Narrates outcome.

All in ONE coherent flow.

**Players don't see the machinery. They just see the world responding to them, consistently, fairly, vividly.**

That's when it stops feeling like a game system.

**That's when it feels like magic.**

🎭✨
