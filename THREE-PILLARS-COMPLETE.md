# THREE PILLARS: THE COMPLETE D&D ENGINE

## WHAT YOU NOW HAVE

### Pillar #1: THE HEARTBEAT (1,649 lines)
**"How outcomes are decided"**
- Intent Parser: understands what players want
- Stakes Engine: makes consequences legible  
- Resolution Engine: produces fair, interesting results
- Heartbeat Orchestrator: ties it together

### Pillar #2: PERSISTENT WORLD (886 lines)
**"How what just happened changes everything later"**
- Entity Graph: NPCs with identity & history
- Causal History: every event has WHY
- Memory Surfacing: brings facts back into play
- Autonomous World: evolves without players

### Pillar #3: AGENCY & SPOTLIGHT (1,040 lines)
**"Who gets to be the protagonist"**
- Choice Architecture: genuine options that matter
- Spotlight Tracking: fairness regulator (no permanent NPCs)
- Agency Respect: rewards ingenuity, never says "you can't"

---

## HOW THEY WORK TOGETHER

### The Complete Loop

```
┌─────────────────────────────────────────────────────────┐
│                   PLAYER ACTION                         │
│         "I want to charm the guard..."                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  PILLAR #3: AGENCY       │
        │  Choice Architecture     │
        │  Is this a real choice?  │
        │  ✓ Yes, genuine fork     │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  PILLAR #1: HEARTBEAT    │
        │  Intent → Stakes →       │
        │  Resolution → Update     │
        │                          │
        │  Roll d20 + CHA mod      │
        │  vs DC 12                │
        │  SUCCEED                 │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  PILLAR #2: PERSISTENT   │
        │  World State Update      │
        │                          │
        │  Guard.attitude=friendly │
        │  Guard remembers this    │
        │  Open loop: favor owed   │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │  PILLAR #3: SPOTLIGHT    │
        │  Track who acted         │
        │  Record: Rogue spoke     │
        │  (Fighter was last choice│
        │   → Cleric up next)      │
        └──────────────┬───────────┘
                       │
                       ▼
            "Guard nods slowly...
             (Continues to next decision point)"
```

---

## CONCRETE EXAMPLE: THE 20-SESSION ARC

### Sessions 1-3: Character Establishment

**Pillar #1 (Heartbeat):** Fighter gets first major decision—pursue enemy or help allies. Chooses pursuit. Stakes clear, resolution fair.

**Pillar #3 (Agency):** Fighter felt that choice mattered. They're protagonist.

**Pillar #2 (Persistent):** Enemy remembers being pursued. Seeks revenge later.

---

### Sessions 4-7: Rogue's Arc

**Pillar #3 (Spotlight Tracking):** Engine notices:
- Fighter: 45% of decisions
- Cleric: 20% of decisions
- Rogue: 15% of decisions (underrepresented)
- Wizard: 5% of decisions (very underrepresented)

**Recommendation:** Next choice should go to Rogue.

**Pillar #1 (Heartbeat):** Scene presents Rogue with genuine fork:
- Steal the artifact (risky, fast)
- Negotiate with collector (slower, uncertain)
- Find another copy (time-consuming, safe)

Rogue chooses steal. Stakes clear. Roll happens.

**Pillar #3 (Agency Respect):** Rogue tries something creative: "What if I steal while they're distracted by the party?" 

Engine parses: Uses party as misdirection. DEX check gets +1 bonus (clever).

Rogue succeeds spectacularly.

**Pillar #2 (Persistent):** Collector now knows who stole from him. Becomes recurring antagonist. Open loop: "Revenge on the Rogue."

Spotlight now rebalanced.

---

### Sessions 8-12: Cleric's Downfall

**Pillar #3 (Spotlight Tracking):** Cleric still needs narrative spotlight. Wizard too.

**Pillar #1 (Heartbeat):** Scene: Cleric's orphanage (from backstory) is under attack.

Cleric gets genuine choice:
- Abandon party to save orphans (split party)
- Ask party for help (risky for orphans, dependent)
- Use forbidden magic to save everyone (breaks vow)
- Negotiate with attackers (long shot)

**Pillar #3 (Agency):** Whatever Cleric chooses, consequences are real. Not pre-scripted.

Cleric chooses: Use forbidden magic. Saves orphans but BREAKS OATH.

**Pillar #2 (Persistent):** Oath-god notices. Open loop created: "Divine retribution pending." Carries for 30+ sessions.

Cleric is now 40% of spotlight. Wizard still needs moment.

---

### Sessions 13-15: Wizard's Reckoning

**Pillar #3 (Spotlight Tracking):** Wizard has only cast spells. No narrative moments. Spotlight at 8%.

Engine surfaces unused hook: Wizard's lost spellbook (from backstory, never addressed).

**Pillar #1 (Heartbeat):** Scene: Enemies have the spellbook.

Wizard gets genuine choice:
- Steal it back (dangerous)
- Destroy it (sacrifice, final)
- Make deal with enemies for access (compromise)
- Learn new magic elsewhere (exploration)
- Something creative (open-ended)

Wizard chooses something creative: "What if I offer to help the enemy mage understand MY spellbook's unique notation... so they stop trying to use it wrong and summon something terrible?"

**Pillar #3 (Agency Respect):** Engine loves this. CHA check (unusual for Wizard) with +2 bonus (ingenuity). 

Succeeds. Enemy mage becomes morally gray ally.

**Pillar #2 (Persistent):** New NPC relationship formed. Open loop: "Enemy mage alliance—will it hold?"

Wizard now 35% of spotlight. Party balanced.

---

### Sessions 16-20: Convergence

**Pillar #2 (Persistent):** World has evolved:
- Enemy from Session 1 is now major threat
- Cleric's broken oath is overdue for consequences
- Rogue's stolen artifact has unintended consequences
- Wizard's enemy mage is now complex ally
- Orphanage is now safe haven (changes world state)

**Pillar #1 (Heartbeat):** Final confrontation presents all PCs with choices that matter.

**Pillar #3 (Agency):** Each PC's prior actions cascade into final moment.
- Fighter's old enemy returns
- Rogue's theft led to this
- Cleric's oath-breaking summoned something
- Wizard's mage provides unexpected aid

Each player FEELS their choices echo through the campaign. The story isn't something that happened to them—it's something they CAUSED.

---

## CODE TOTALS

```
PILLAR #1: HEARTBEAT               1,649 lines
  intent-parser.js                   295
  stakes-resolution-engine.js        400
  world-state-updater.js             374
  the-heartbeat-engine.js            203
  ascii-map-generator.js             377

PILLAR #2: PERSISTENT WORLD          886 lines
  persistent-world-state-engine.js   497
  memory-surfacing-engine.js         389

PILLAR #3: AGENCY & SPOTLIGHT      1,040 lines
  choice-architecture-engine.js      342
  spotlight-tracking-engine.js       334
  agency-respect-engine.js           364

OTHER SYSTEMS                      2,513 lines
  character-creator.js               409
  party-system.js                    457
  skill-system.js                    296
  experience-leveling-system.js      377
  adnd-rule-engine.js                315
  inventory-system.js                195
  spell-system.js                    215
  trap-puzzle-system.js              289
  (+ 8 more files)

───────────────────────────────────────────
THREE PILLAR CORE:                 3,575 lines

COMPLETE SYSTEM:                  11,000+ lines
  (+ documentation, modules, data)
```

---

## WHAT THIS MEANS

You don't have a **rules engine that feels soulless**.
You don't have a **world database that forgets**.
You don't have a **game where players are passive observers**.

You have a system where:

✅ **Outcomes feel fair** (Pillar #1: The Heartbeat)
✅ **The world remembers** (Pillar #2: Persistent State)
✅ **Players feel they caused it** (Pillar #3: Agency)

From a design brain: 
- Pillar #1 = "product performance" (mechanics work)
- Pillar #2 = "brand memory" (world is coherent)
- Pillar #3 = "mental availability + perceived control" (player feels protagonist)

It's the difference between:
- ❌ "That was a cool scene"
- ✅ **"I did that. I changed the story. That was MY moment."**

---

## THE FINAL INSIGHT

People don't tell stories about balanced mechanics.

People tell stories about moments when they were the protagonist.

Your engine's job is to **manufacture those moments on schedule**.

With three pillars, you just did.

---

**Status: THREE PILLARS COMPLETE**

**Pillar #1: Intent → Stakes → Resolution ✅**
**Pillar #2: Persistent World Memory ✅**
**Pillar #3: Agency & Spotlight ✅**

**The D&D engine that doesn't just run the game—it makes players feel like they're inside a story they're writing.**

🎭✨ **LEGENDARY**
