# ENCOUNTER CALIBRATION SYSTEM
## Difficulty Dosing Algorithm for D&D Engine

Your Nine Pillars architecture is the *delivery mechanism*. This document is the *scaling algorithm*.

**Core Principle:** You're not asking "what CR do I use." You're asking "in my engine, how do I algorithmically serve earned difficulty without random TPKs or boring steamrolls."

---

## SECTION 1: DEFINE NORMAL (YOUR CALIBRATION TARGETS)

### Start Here: Write Down Your Answers

**Question 1: How often should players be scared they might die?**
- Write a number: 1 in X fights
- Example: "I want them scared every 1 in 4 standard encounters"
- This is your **fear frequency target**

**Question 2: How often should they actually lose a PC?**
- Write a number: Once per Y levels
- Example: "One PC death per level bracket (1-3, 4-6, 7-10)"
- This is your **attrition target**

**Question 3: What's your victory lap ratio?**
- Victory lap (trivial, <5 min): __%
- Coin flip (tense, real stakes): __%
- Boss puzzle (deadly, smart play wins): __%
- Unwinnable spike (rare, intentional): __%
- Total must = 100%
- This is your **difficulty band distribution**

---

## SECTION 2: PARTY POWER SCORE (Your Invisible ELO)

Instead of just using Level, calculate a **single scalar** that says "how hard is this group right now?"

### Formula:

```
Party Power = Σ (Character Power)

Character Power = Level × Role Modifier × Gear Modifier × Resource Modifier

Where:
  Role Modifier:
    - Full caster (clerics, mages): 1.3x
    - Half-caster (rangers, paladins): 1.1x
    - Melee frontliner (fighters, barbarians): 1.2x
    - Pure skill monkey (thieves, monks): 0.8x
    - Balanced hybrid: 1.0x
  
  Gear Modifier:
    - Monty Haul (wealth >> DMG): 1.3x
    - Standard (wealth ≈ DMG): 1.0x
    - Undergeared (wealth < DMG): 0.7x
  
  Resource Modifier:
    - Full (fresh, all spells): 1.0x
    - 75% (light skirmish): 0.95x
    - 50% (decent fight): 0.85x
    - 25% (heavily spent): 0.65x
    - Critical (<5 HP, no spells): 0.4x
```

### Example Calculation:

**Party:** 3 PCs, level 6
1. Mage (6 × 1.3 × 1.0 × 1.0) = 7.8
2. Fighter (6 × 1.2 × 1.0 × 0.95) = 6.84
3. Cleric (6 × 1.3 × 0.7 × 1.0) = 5.46

**Party Power = 20.1**

---

## SECTION 3: ENCOUNTER BUDGET (Scale by Composition, Not Just Stats)

### Step 1: Convert Each Monster to Threat Value (TV)

```
TV = (HD or CR) × Role Factor × Lethality Factor

Role Factor:
  - Brute (high HP, high dmg): 1.0x
  - Skirmisher (mobile, flanking): 1.2x
  - Controller (battlefield distortion): 1.4x
  - Artillery (ranged punishment): 1.1x
  - Chaff (low threat): 0.6x

Lethality Factor:
  - Standard damage: 1.0x
  - Save-or-die (level drain, petrification, charm): 1.5x
  - At-will stun/paralyze: 1.3x
  - Flying vs mostly melee: 1.5x
  - Armor Class penalty to party: 1.2x per -1 AC average
```

### Step 2: Calculate Your Encounter Budget

```
Easy Budget:    0.5 × Party Power
Standard Budget: 1.0 × Party Power
Hard Budget:    1.5 × Party Power
Deadly Spike:   2.0 × Party Power (rare, intentional)
```

### Step 3: Fill Budget with Monsters

Choose monster mix whose **total TV ≈ Budget**.

Example:
- Party Power = 20.1
- Target: Standard encounter (Budget = 20.1)
- Fill it with:
  - 2 × Orc (2 HD, brute): 2 × (2 × 1.0 × 1.0) = 4.0
  - 1 × Orc Shaman (3 HD, controller): 1 × (3 × 1.4 × 1.0) = 4.2
  - 3 × Goblin (1 HD, chaff): 3 × (1 × 0.6 × 1.0) = 1.8
  - 1 × Wyvern (6 HD, flyer, lethality): 1 × (6 × 1.5 × 1.3) = 11.7
  - **Total TV = 21.7** ✓ Close to budget

---

## SECTION 4: ENVIRONMENT AS FIRST-CLASS SCALING KNOB

**Same monsters, different context = different difficulty levels (±1-2).**

### Environment Modifiers:

```
Advantageous terrain for monsters:      Difficulty × 1.2–1.5
Example: Wolves in blizzard + night + deep snow

Ambush/surprise likelihood high:        Difficulty × 1.3
Example: Party entering kill box unaware

Monsters on home ground with prep:      Difficulty × 1.5–2.0
Example: Dragon in lair vs dragon in open field

Choke points/corridors (favors monsters): × 1.3
Example: Narrow dungeon pass

Open field (favors ranged parties):     × 0.8

Water advantage (for aquatic monsters): × 1.2

Darkness (for creatures with darkvision): × 1.3 vs standard

High ground (ranged monsters elevated): × 1.2
```

### How to Use:

1. **Base encounter budget = 20.1 (standard)**
2. **Environment modifier = 1.3 (ambush in dark tunnel)**
3. **Adjusted budget = 20.1 × 1.3 = 26.1**
4. **Fill 26.1 TV with monsters**

---

## SECTION 5: HANDLE SPIKY MECHANICS (Don't Trust CR)

Some mechanics are more dangerous than their HD suggests:

```
Has save-or-die (level drain, petrify, disintegrate): TV × 1.5
Has charm/dominate:                                   TV × 1.4
Can fly and attack from range (vs melee-heavy party): TV × 1.5
Gaze attack with save-or-effect:                      TV × 1.3
Invisible (ambush):                                   TV × 1.2
Healing/regeneration:                                 TV × 1.2
Battlefield control (web, stinking cloud, wall):      TV × 1.3
Teleportation:                                        TV × 1.1
```

### Example:

- Medusa (8 HD, petrification gaze)
- Base TV = 8 × 1.0 (controller) × 1.3 (lethality)
- But she has **save-or-petrify gaze** = × 1.5
- **Actual TV = 8 × 1.0 × 1.3 × 1.5 = 15.6**
- One Medusa in a corridor ≠ "just another 8 HD"

---

## SECTION 6: CALIBRATE WITH POST-FIGHT TELEMETRY

You're building an engine, not DMing by gut alone. Treat every fight as UX data.

### Log After Each Encounter:

```json
{
  "encounter_id": "orc_ambush_session_3",
  "budget_type": "standard",
  "party_power": 20.1,
  "encounter_budget": 20.1,
  "actual_tv": 21.7,
  "environment_modifier": 1.0,
  "duration_rounds": 8,
  "party_hp_before": [18, 20, 16],
  "party_hp_after": [12, 8, 14],
  "pcs_dropped": 1,
  "resources_burned": {
    "mage_slots_used": [1, 1, 0],
    "cleric_slots_used": [2, 1],
    "potions": 2
  },
  "pcs_dropped_to_0": 1,
  "outcome": "victory",
  "difficulty_felt": "standard",
  "difficulty_math": 1.08,
  "adjustments": "Medusa gaze had no save option; should TV × 1.8"
}
```

### Iterate:

- If "standard" fights consistently leave everyone >50% HP → Party Power is too low or monster TV is too low
- If "standard" fights regularly kill a PC → Party Power is too high or monster TV is too high
- If resources are never burned → Increase standard budget
- If you never use hard encounters → Standard budget is too hard

Adjust internal multipliers until **telemetry matches your target experience**.

---

## SECTION 7: CAMPAIGN-LEVEL SCALING (Step, Don't Slope)

Humans don't feel gradual changes; they feel *moments*.

Use **steps**, not a gentle linear curve:

```
LEVELS 1-3: Survival Horror
├─ Every fight is sharp
├─ Death is real and common
├─ Difficulty: 70% standard, 20% easy, 10% hard
├─ Goal: "We might die" every session
└─ Example: Kobold ambush kills a PC

LEVELS 4-7: Competency Phase
├─ They feel powerful
├─ Encounter complexity rises (more mixed monsters)
├─ Difficulty: 50% standard, 20% easy, 20% hard, 10% deadly spike
├─ Goal: Tactical puzzles emerge
└─ Example: Coordinated orc war band

LEVELS 8-10: Warband Leaders
├─ Fewer encounters per day
├─ Encounters are battles, not skirmishes
├─ Difficulty: 40% standard, 10% easy, 30% hard, 20% deadly spike
├─ Goal: Politics, faction conflict, large-scale war
└─ Example: Castle siege, dragon lair raid

LEVELS 11+: Mythic Moments
├─ Maybe 1-2 encounters per session
├─ Each is a story beat, not just combat
├─ Difficulty: 20% standard, 10% easy, 40% hard, 30% deadly spike
├─ Goal: Each encounter changes the campaign
└─ Example: God-like beings, planar incursions, final confrontation
```

When they **cross a band** (4→5, 8→9), consciously change the **type** of threats, not just the numbers.

---

## SECTION 8: INTEGRATION WITH NINE PILLARS

### Where Calibration Lives in Your Architecture:

```
Orchestrator (#6) queries Calibration Engine:
  "Given party power 20.1 and want 'standard' difficulty,
   what's my encounter budget?"
  → Returns 20.1

Calibration Engine then queries:
  #7 World Graph: "What's the location? Terrain?"
  → Gets environment modifier (e.g., 1.3)
  → Adjusts budget to 20.1 × 1.3 = 26.1

Orchestrator uses 26.1 to select from monster library:
  #9 Mechanical State: "What are valid monsters? Their TV?"
  → Selects monsters totaling ~26.1 TV

#1 Heartbeat:
  → Runs combat with selected monsters
  → Logs telemetry after fight

Calibration Engine iterates:
  "Did this 'standard' encounter feel standard?
   Adjust multipliers if not."
```

### Pseudocode in Your Orchestrator:

```javascript
// In fiction-first-orchestrator.js

async function planEncounter(partyPower, desiredDifficulty, location) {
  
  // Step 1: Get base budget
  const baseBudget = this.calibration.getBudget(
    partyPower,
    desiredDifficulty  // "easy" | "standard" | "hard" | "deadly"
  );
  
  // Step 2: Modify by environment
  const envMod = this.worldState.getEnvironmentModifier(location);
  const adjustedBudget = baseBudget * envMod;
  
  // Step 3: Get available monsters with TV
  const monsterPool = this.mechanical.getMonstersByTV(
    adjustedBudget,
    { variance: 0.1 }  // Allow ±10% variance
  );
  
  // Step 4: Compose encounter
  const encounter = this.composeEncounter(monsterPool, adjustedBudget);
  
  // Return to #1 Heartbeat for execution
  return encounter;
}

// Post-fight telemetry logging
async function logEncounterTelemetry(encounter, outcome, resources) {
  const telemetry = {
    encounter_id: encounter.id,
    budget_type: encounter.desiredDifficulty,
    party_power: outcome.partyPowerAtTime,
    actual_difficulty_felt: outcome.pcsDropped === 0 ? "easy" : 
                           outcome.pcsDropped === 1 ? "standard" :
                           "hard",
    adjustments: this.calibration.analyzeDeviation(
      encounter.expectedDifficulty,
      outcome.actualDifficulty
    )
  };
  
  // Adjust multipliers based on deviation
  this.calibration.iterate(telemetry);
}
```

---

## SECTION 9: PRACTICAL EXAMPLE (Your First CALIBRATION)

### Scenario: Bruh's Tamoachan Game, Session 3

**Party:**
- Malice Indarae De'Barazzan (Cleric 6/Mage 5) — assume 6 effective level
- Two companions (average level 5)
- Party Power = (6×1.3×1.0×1.0) + (5×1.2×1.0×0.9) + (5×1.0×1.0×0.8) = **16.9**

**You want:** Standard encounters with 1 in 4 "scare" moments

**Your calibration targets:**
- Standard budget = 16.9 × 1.0
- Hard budget = 16.9 × 1.5 = 25.4 (for scare moments)
- Easy budget = 16.9 × 0.5 = 8.5 (for pacing recovery)

**Encounter idea:** "Cultist-held shrine with ambush"
- Environment: Dark, ambush-heavy, cultists prepped = × 1.4 modifier
- Adjusted budget = 16.9 × 1.4 = 23.7

**Fill 23.7 TV:**
- 4 × Cultist (1 HD, chaff): 4 × (1 × 0.6 × 1.0) = 2.4
- 1 × Cultist Leader (3 HD, controller/caster): 1 × (3 × 1.4 × 1.2) = 5.04
- 1 × Pale Serpent (3 HD, brute, save-or-die bite): 1 × (3 × 1.0 × 1.5) = 4.5
- 2 × Mummified Guardian (3 HD, undead): 2 × (3 × 1.0 × 1.2) = 7.2
- **Total = 19.14**

**Adjust:** Add 1 more cultist: Total = 20.54 ✓ Close to 23.7

**Post-fight telemetry shows:**
- Malice took 8 damage (45% HP lost)
- No one dropped to 0
- Mage slots: 3 of 8 burned
- Cleric slots: 2 of 5 burned
- Felt "easy" to players

**Analysis:**
- Expected "standard" (16.9 budget), felt "easy"
- Likely: Your "standard" budget should be 16.9 × 1.2 = 20.3, not 16.9
- **Adjust:** Next standard encounter, target budget 20.3

---

## SECTION 10: What This Actually Does

This is **difficulty scaling without the randomness**.

```
No randomness = no random TPKs
Calibrated = tailored to your table, your pace, your campaign

Before: "Is this a CR 5 encounter? Shrug."
After:  Party Power: 20.1
        Standard Budget: 20.1
        Environment: Dark tunnel (×1.3)
        Adjusted Budget: 26.1
        Selected monsters TV: 26.3 ✓ MATCH
        Post-fight: "28% HP loss. Recommendation: perfect standard encounter"
```

You're now **dosing difficulty with precision**.

---

## NEXT STEPS

1. **Write down your calibration targets** (fear frequency, attrition rate, victory lap %)
2. **Calculate your first Party Power score** using the formula
3. **Log telemetry after 5-10 encounters**
4. **Adjust multipliers based on deviation**
5. **Iterate until telemetry matches targets**

Then you have an **invisible ELO system** that keeps encounters **scary but fair, challenging but winnable**.

*No random TPKs. No boring steamrolls. Just earned danger.*
