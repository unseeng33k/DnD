# PILLAR #8: SPOTLIGHT & PACING SCHEDULER
## "The Fair Attention Allocator"

---

## THE INSIGHT

> "The orchestrator decides what happens. The graph remembers what exists. The spotlight scheduler decides who's next and why."

Without this system, the loudest/most optimization-brained player becomes the main character.

With it, every player gets meaningful moments, and the campaign rhythm stays alive instead of sludging.

---

## WHAT IT TRACKS

### Per-Player Spotlight Allocation
For each PC:
- **Mechanical wins** (their build mattered) - How many? When was the last one?
- **Narrative moments** (their backstory/identity mattered) - How many? When?
- **Decision gates** (they gated the party's path) - How many? When?

**Spotlight Score**: Points accumulate when they get moments, decay over time

### Session-Level Pacing
- **Intensity curve**: Is it alive or dead?
- **Scene types**: Combat/social/exploration distribution
- **Consecutive combats**: Three in a row = fatigue
- **Stakes freshness**: When did stakes last shift?
- **Table energy**: 0-100, how amped/tired are people?

### Rhythm Detection
- **Combat fatigue**: Three fights in a row → need palette cleanser
- **Exposition coma**: Too much talking → need action
- **Energy crash**: Table is exhausted → shift to character moments
- **Stale stakes**: Nothing surprising recently → introduce complication

---

## THE CONCRETE FLOW

### Session Start
```
DM: "What should happen next?"

Scheduler analyzes:
  - Ella (Rogue): Last mechanical win 4 sessions ago
  - Zoe (Wizard): Last narrative moment 2 sessions ago
  - Tucker (Barbarian): Last decision gate 1 session ago
  
  Verdict: Ella is significantly underfed
  
  - Combat fatigue: 0 (good, can handle action)
  - Table energy: 65 (engaged but not exhausted)
  - Stakes freshness: Stale (nothing changed last 3 sessions)

Recommendation:
  "Spotlight Ella with a mechanical moment.
   Type: Combat (table energy supports it).
   Situation: Use her rogue skills uniquely.
   Intensity: 6-7 (build toward climax, stakes shift)."
```

### DM Uses This
```
DM: "You enter a heavily guarded fortress.
    Guards are patrolling in a specific pattern.
    Ella, this is made for you."

Ella: "I want to scout ahead and find a weakness."

Orchestrator (biased by scheduler):
  - Checks: Is this a mechanical spotlight for Ella? YES
  - Biases roll difficulty toward "fair but winnable"
  - If success: Rewards Ella's cleverness
  - Records: Mechanical win for Ella
```

### After Scene
```
DM: "Ella successfully sneaks past guards undetected.
    She finds a weakness in the defenses."

Scheduler records:
  - Ella: Mechanical win at Session 8, Scene 12
  - Scene type: Exploration + stealth
  - Intensity: 6
  - Table energy: Increased (Ella's success was cool)
```

### Next Session
```
Scheduler now shows:
  - Ella: Last mechanical 1 session ago (good)
  - Zoe: Last narrative 3 sessions ago (OVERDUE)
  - Tucker: Last decision 2 sessions ago (ok)
  
  Table energy: 72 (still amped)
  Stakes: Shifted (Ella found fortress weakness)
  
Recommendation:
  "Spotlight Zoe with narrative moment.
   Type: Social (give Zoe time to breathe, match Ella's energy)
   Intensity: 4 (decompression after action)
   Situation: Hook related to Zoe's backstory."

DM: "The fortress commander offers a deal...
    He mentions something only Zoe's character would care about."

Zoe leans in...
```

---

## THE SMART MECHANICS

### Spotlight Scoring System
```
Mechanical Win:        +3 points (your build mattered)
Narrative Moment:      +2 points (your story mattered)
Decision Gate:        +2.5 points (you changed the party's path)

Points decay by 5% each session
(Older moments matter less)

Status tiers:
  Spotlight < 70% of average = UNDERFED
  Spotlight > 130% of average = HOGGING
  70-130% of average = BALANCED
```

### Pacing Analysis
```
Consecutive combats > 2?
  → "Combat fatigue. Players tired. Next: social or exploration."

Table energy < 30?
  → "Exhausted. Shift to roleplay or downtime."

Stakes unchanged > 4 sessions?
  → "Stale. Introduce complication or surprise."

Table energy > 75?
  → "Amped. Can handle climax or big set piece."
```

### Scene Type Distribution
```
If distribution is:
  - 80% combat, 10% social, 10% exploration
    → "Combat-heavy. Diversify."
  
  - 30% combat, 50% social, 20% exploration
    → "Healthy balance. Continue."
  
  - 10% combat, 80% shopping/exposition, 10% exploration
    → "Sludge. Need action."
```

---

## FAILURE MODES IT PREVENTS

### ❌ The Loudest Player Problem
```
Without spotlight scheduler:
  Optimization-brained player finds exploit
  Suddenly all scenes revolve around them
  Quiet player becomes NPC
  Campaign is no longer fun
  
With spotlight scheduler:
  Tracks that quiet player is underfed
  Next scene biased toward their hooks
  Their moment comes
  All players feel like protagonists
```

### ❌ The Pacing Sludge
```
Without:
  DM doesn't notice 3 combats in a row
  Table is exhausted but there's another fight
  Attention dies
  
With:
  "Consecutive combats > 2. Next: social or exploration."
  DM shifts to downtime scene
  Table recovers
```

### ❌ The Exposition Coma
```
Without:
  DM delivers 45 minutes of backstory
  Table is dead inside
  
With:
  "Table energy < 30. Shift to roleplay."
  DM makes it interactive
  Table stays engaged
```

---

## HOW IT CONNECTS TO OTHER PILLARS

### With Orchestrator (#6)
```
Orchestrator asks: "What should happen?"
Scheduler answers: "Make it about Ella's mechanical skills, 
                    with 6-7 intensity, social follow-up."
Orchestrator: "Understood. Creating scene..."
```

### With World Graph (#7)
```
Scheduler: "Ella is underfed. Need mechanical spotlight."
Graph: "Here are Ella's unresolved hooks and backstory threads."
Scheduler: "Perfect. Use those in the scene."
```

### With Heartbeat (#1)
```
Heartbeat: "Determining stakes and resolution for this action."
Scheduler: "Remember—this should showcase Ella's rogue skills."
Heartbeat: "Adjusting difficulty to be fair-but-winnable."
```

---

## CODE

```
spotlight-pacing-scheduler.js           397 lines
orchestrator-spotlight-integration.js   194 lines
────────────────────────────────────────────────
PILLAR #8 COMPLETE:                     591 lines
```

---

## THE REAL MAGIC

### Without This System
```
Session 1: Everyone has fun
Session 3: Loudest player starting to hog
Session 5: Quiet player checking phone
Session 8: Campaign feels one-sided
Session 12: Quiet player stops coming
```

### With This System
```
Session 1: Everyone has fun
Session 3: Scheduler notices imbalance
Session 4: Next scene biased toward quiet player
Session 5: Quiet player gets big moment
Session 8: Spotlight is balanced
Session 12: Everyone still wants to play
```

---

## PRACTICAL USE

### Before Session
```javascript
const bias = scheduler.getBias();
// {
//   pcBias: "Ella",
//   pcName: "Ella",
//   sceneTypeBias: "exploration",
//   intensityBias: 6,
//   reasoning: "Spotlight to Ella. Pacing: Combat fatigue...",
//   howToImplement: {
//     searchForHooks: "Hooks about Ella's backstory",
//     mechanicalWeaponry: "Scene using Ella's rogue skills",
//     narrativeThreads: "Unresolved arcs from Ella's past"
//   }
// }

// DM uses this to plan the session
```

### During Session
```javascript
// After each scene
scheduler.recordScene('combat', intensity=6, duration=40);

// After each player moment
scheduler.recordMoment('ella_id', 'mechanical_win', 'sneaked past guards');

// Check health
const status = scheduler.displaySpotlightStatus();
// Shows: Ella is now balanced, table energy is 72, good pacing
```

### Between Sessions
```javascript
const nextRec = scheduler.recommendNextSpotlight();
// "Zoe is underfed. Last narrative moment 4 sessions ago."

const pacingRec = scheduler.recommendNextSceneType();
// "Social or roleplay. Table energy recovered."
```

---

## STATUS

✅ Pillar #1: Intent → Stakes → Resolution (1,649 lines)
✅ Pillar #2: Persistent World State (886 lines)
✅ Pillar #3: Agency & Spotlight (1,040 lines)
✅ Pillar #4: Uncertainty Orchestration (1,176 lines)
✅ Pillar #5: Legibility & Cognitive Load (1,067 lines)
✅ Pillar #6: Fiction-First Rules Orchestrator (597 lines)
✅ Pillar #7: World-State Graph (761 lines)
✅ Pillar #8: Spotlight & Pacing Scheduler (591 lines)

**Eight Pillars: 7,767 lines**

Plus: 42 modules, complete systems
**Complete Engine: 17,300+ lines**

---

## THE VISION

You have a D&D engine that doesn't just play fairly.

**It actively ensures fairness.**

- Loudest player doesn't accidentally become main character
- Quiet player's moment always comes
- Campaign rhythm stays alive, never sludges
- Table energy is monitored and managed
- Every player feels like the protagonist of their own story

The orchestrator decides WHAT happens.
The graph remembers WHAT EXISTS.
The spotlight scheduler ensures EVERYONE gets their turn.

🎭✨ **LEGENDARY**
