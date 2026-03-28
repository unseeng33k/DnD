# PILLAR #7: THE PERSISTENT WORLD-STATE GRAPH
## "The Source of Truth for Everything That Exists"

---

## THE INSIGHT

> "The orchestrator decides 'what happens now.' The world-state graph makes sure 'this matters later.'"

Without this graph, the world is **static and forgetful**.

With it, the world is **living and connected**—every action leaves a permanent mark that changes future possibilities.

---

## WHAT THE GRAPH STORES

### Entities (Everything That Exists)
- **PCs**: Player characters with stats, inventory, history
- **NPCs**: Non-player characters with psychology, relationships, ambitions
- **Factions**: Groups with power, goals, members, resources
- **Locations**: Places with inhabitants, resources, hazards, ownership
- **Items**: Objects with history and provenance
- **Monsters**: Creatures encountered and remembered
- **Rumors**: Information spreading through the world
- **Scenes**: Significant moments from the campaign

**Each entity is a node with:**
- Identity (name, description, type)
- Psychology (attitudes, fears, ambitions, secrets)
- State (current condition, resources, relationships)
- History (everything that's happened to them)

### Relationships (How Everything Connects)
Typed, directional relationships between entities:
- **member_of** - "Ella is member of the Thieves' Guild"
- **owes_debt** - "Guard owes party a favor"
- **sworn_enemy** - "Barbarian sworn enemy of the Death Cult"
- **controls** - "Faction A controls this town"
- **destroyed_by** - "The mill was destroyed by the party"
- **promised_to** - "NPC promised to help party escape"
- **fears** - "Cleric fears spiders"
- **loves** - "NPC loves the bard's music"

Each relationship has:
- Type (what kind of connection)
- Strength (0-100, intensity)
- History (how it evolved)
- Metadata (type-specific data)

### Events (The Campaign Timeline)
Every significant action becomes an event node:
- **Timestamp** (what day/session)
- **Actor** (who did it)
- **Target** (who/what was affected)
- **Type** (action, consequence, discovery, betrayal, death, etc.)
- **Narrative** (story description)
- **Significance** (minor, moderate, major, campaign-defining)
- **Consequences** (what changed)
- **Moral weight** (merciful, cruel, selfish, heroic)
- **Opens/closes loops** (what questions does this create/resolve?)

**Events are PERMANENT.** The world remembers everything.

### Psychology (What Entities Want & Fear)
Each entity has:
- **Attitudes** - How they feel about other entities (−100 to +100)
- **Fears** - What scares them
- **Ambitions** - What they want
- **Secrets** - What they're hiding
- **Strengths** - What they're good at
- **Weaknesses** - What they struggle with

**Psychology drives NPC behavior** and explains why they react the way they do.

### Faction State (Power & Evolution)
Factions track:
- **Power** (0-100, influence level)
- **Resources** (what they control)
- **Members** (who's part of it)
- **Goals** (what they want)
- **Threats** (what threatens them)

**Power shifts** when members die, resources are destroyed, or goals are blocked.

---

## HOW IT WORKS: CONCRETE EXAMPLE

### Session 1: The Guard

**Party meets Guard Kellan.**
```
Entity created:
  id: kellan
  type: npc
  name: "Sergeant Kellan"
  psychology.attitudes[party] = 0 (neutral)
  psychology.fears = ["abandonment", "loss of order"]
  psychology.ambitions = ["promotion to captain", "protect subordinates"]
```

### Session 3: Party Spares Prisoner

**Party shows mercy Kellan didn't expect.**
```
Event logged:
  actor: party
  target: innocent_prisoner
  type: action (show mercy)
  moral: merciful
  consequence: kellan_impressed
  cascadeTo: [kellan]

Graph updates:
  kellan.psychology.attitudes[party] += 20 → 20 (grateful)
  Event added to kellan.history
```

### Session 8: Different Town

**Party needs help. Kellan might help if asked.**
```
Query: "Who in this region knows the party and might help?"
  ↓
Graph checks:
  - Kellan history: "Impressed by their mercy (5 sessions ago)"
  - Kellan.attitudes[party] = 20
  - Kellan.psychology.ambitions: Can party help achieve this?
  ↓
Returns: "Kellan would help (modified by time decay but still positive)"
```

**Party approaches Kellan.**
```
Query: "What should happen?"
  ↓
Graph remembers:
  - They showed Kellan mercy
  - Kellan's fears involve loyalty/betrayal
  - Kellan wants to be captain
  ↓
Orchestrator decides: "Kellan helps, and mentions: party earned his trust by showing mercy"
```

### Session 15: Crisis

**Kellan's sister dies (unrelated to party).**
```
Event logged:
  actor: fate/accident
  target: kellan_sister
  type: death
  cascadeTo: [kellan]

Graph cascades:
  - Kellan.psychology.fears["abandonment"] triggered
  - Kellan.psychology.attitudes[party] unchanged (they didn't cause this)
  - New ambition: "Protect what's left of my family"
  - Sister's death event logged in kellan.history
```

**Party visits Kellan later.**
```
Query: "How does Kellan react to party?"
  ↓
Graph returns:
  - Attitudes: Still positive (20) from Session 3
  - Recent tragedy: Sister died 2 sessions ago
  - Current state: Grieving, vulnerable
  ↓
Orchestrator decides: "Kellan is sad but not hostile. Party's past kindness matters."
```

---

## THE SMART QUERIES

### "Who Should React?"
```javascript
graph.queryMostRelevantNPCs(location, "crime")
↓
Returns NPCs ranked by:
- Are they in a faction that cares about crime?
- Do their secrets involve similar crimes?
- Have they experienced similar events?
↓
Top 3 most relevant NPCs
```

### "What Hooks Can I Surface?"
```javascript
graph.queryNearbyHooks(location)
↓
Returns:
- Unresolved events at location
- Open loops from past actions
- NPC ambitions not yet pursued
↓
"The innkeeper mentioned needing help. That's still hanging."
```

### "Who Would Betray the Party?"
```javascript
graph.queryPotentialBetrayals(location)
↓
Checks for:
- NPCs with fears party triggers
- NPCs with debts that conflict with party
- NPCs with ambitions party blocks
↓
Returns list ranked by motive strength
```

### "What's the Political Situation?"
```javascript
graph.getFactionBalance()
↓
Returns current power:
- Faction A: Power 65, 12 members, growing
- Faction B: Power 40, 8 members, declining
- Faction C: Power 55, 10 members, stable
↓
Orchestrator can see how dynamics shifted
```

### "What Echoes From the Past?"
```javascript
graph.queryHistoricalEchoes(event_type)
↓
Finds similar past events
Shows how they resolved
Suggests patterns
↓
"Last time party burned a building, the faction sought revenge"
```

---

## THE MAGIC: DYNAMIC WORLD EVOLUTION

### Kill a Duke
```
Event: Duke dies
Cascades to:
  - Three power-hungry nobles (all have ambition: "become duke")
  - All get attitude boost toward each other (competition)
  - All get ambition updated: "Seize power"

Without graph: NPCs never care
With graph: Three new antagonists automatically emerge
```

### Stupid Joke in Session 1
```
Party: "I tell Merchant his goods are terrible"
Graph logs: type: "insult", target: merchant, moral: "cruel"

Session 20 (19 sessions later):
Merchant is now a legend: "The one group that mocked my wares, 
then years later saved my life."

Without graph: Merchant forgot
With graph: Deep, weird relationship evolved over entire campaign
```

### Two Parties Touch Same World
```
Group A burns the mill (Session 5)
Group B arrives (their Session 1) - they don't know about the mill
Group A arrives later - mill is burned

Graph maintains:
  - Mill state: burned
  - Faction A suspicion: +10 (toward Group A)
  - Faction B suspicion: 0 (toward Group B)
  - Hook available for Group B: "Who burned the mill?"

Without graph: Impossible to track multiple parties
With graph: Both groups have consistent world
```

---

## CODE

```
world-state-graph.js                    468 lines
world-state-query-engine.js             293 lines
────────────────────────────────────────────────
PILLAR #7 COMPLETE:                     761 lines
```

---

## HOW IT CONNECTS TO ORCHESTRATOR

### Orchestrator asks questions, Graph answers

```
Player: "I want to betray the cult and warn the village"

Orchestrator queries:
  "queryWhatShouldHappen(actor=party, location=village, action=warn, type=betrayal)"
  ↓
Graph returns:
  - Most relevant NPCs to react
  - Which factions care about cults
  - Who might seek revenge on betrayer
  - What rumors might spread
  ↓
Orchestrator decides: Who reacts and how
```

### Graph updates, World evolves

```
Action resolved (party warned village, cult leader escaped)

Graph logs:
  - Event: "Party betrayed cult, warned village"
  - Consequence: Cult leader.attitude[party] = -100
  - Consequence: Village.attitude[party] = +50
  - Opens loop: "Cult leader seeks revenge"
  - Closes loop: "Cult infiltration"
  ↓
Next session: Everything changed because graph remembers
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

**Seven Pillars: 7,176 lines**

Plus: 42 modules, complete systems
**Complete Engine: 16,700+ lines**

---

## THE VISION

**You have a D&D engine that doesn't just play the game.**

**It remembers everything.**

Player burns the mill in Session 1.
Session 20: "That mill you burned... the town is still rebuilding from that."

NPCs don't reset.
Guard met once remembers you forever.

Factions evolve.
Kill one leader → two new contenders fight for power.

Multiple parties can share one world.
Group A's actions create situations for Group B.

**That's what a living campaign feels like.**

🎭✨ **LEGENDARY**
