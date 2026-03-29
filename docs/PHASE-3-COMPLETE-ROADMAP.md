╔═══════════════════════════════════════════════════════════════════════════╗
║       PHASE 3: COMPLETE NINE PILLARS ENGINE - FULL ROADMAP                ║
║                                                                           ║
║  STATUS: Comprehensive plan laid out for entire Phase 3                  ║
║  COMPLETION: Architecture defined, implementation path clear             ║
║  NEXT: Execute pillar by pillar according to this plan                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
PHASE 3 ARCHITECTURE - THE COMPLETE VISION
═════════════════════════════════════════════════════════════════════════════

BEFORE (17 SEPARATE ENGINES):
  Each adventure had its own copy of:
    • Spotlight tracking
    • Combat mechanics
    • Character state
    • World state
    • Action resolution
  Result: MASSIVE DUPLICATION, HARD TO MAINTAIN

AFTER (ONE UNIFIED ENGINE):
  One engine (nine-pillars-engine.js) coordinates 8 systems (pillars):

    HEARTBEAT (nine-pillars-engine.js)
         ↓
    Coordinates all 9 pillars:
    ├─ Pillar 1: Mechanical State
    ├─ Pillar 2: Persistent World
    ├─ Pillar 3: Agency & Spotlight
    ├─ Pillar 4: Uncertainty & Stakes
    ├─ Pillar 5: Legibility
    ├─ Pillar 6: Orchestrator
    ├─ Pillar 7: World State Graph
    └─ Pillar 8: Spotlight Scheduler

  All adventures use THIS SAME ENGINE:
    • Grond-Malice
    • Quest-Framework
    • Town-Thornhearth
    • Playtest scenarios
    • Etc.

═════════════════════════════════════════════════════════════════════════════
THE 9 PILLARS: COMPLETE SPECIFICATIONS
═════════════════════════════════════════════════════════════════════════════

PILLAR 1: MECHANICAL STATE ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: All mechanics - stats, combat, spells, conditions
File: src/legacy/systems/pillar-1-mechanical-state.js

Core Functions:
  ✅ createCharacter(charData) - Create PC/NPC with full AD&D stats
  ✅ calculateTHAC0(class, level) - To-Hit AC0 progression
  ✅ getSavingThrows(class) - Saving throw values
  ✅ takeDamage(charId, amount) - Apply damage, check death
  ✅ heal(charId, amount) - Restore HP
  ✅ addCondition(charId, condition) - Apply status effects
  ✅ removeCondition(charId, condition) - Remove status effects
  ✅ castSpell(charId, spell, level, class) - Use spell slot
  ✅ getAvailableSpells(charId, class, level) - How many slots left
  ✅ shortRest(duration) - Recover some resources
  ✅ longRest(duration) - Full recovery
  ✅ addItem(charId, item) - Inventory management
  ✅ removeItem(charId, itemName) - Drop item
  ✅ awardExperience(charId, amount) - Give XP
  ✅ levelUp(charId) - Increase level, gain HP
  ✅ getEffectiveAC(charId) - AC with modifiers

Data Structure:
  Character {
    id, name, race, class, level, alignment,
    abilities: {str, dex, con, int, wis, cha},
    hp: {current, max},
    ac, thac0, initiative,
    saves: {deathRay, wand, paralysis, breathWeapon, spell, rodStaffWand},
    spells: {available, cast},
    conditions: [],
    effects: [],
    experience, gold,
    equipment: [],
    inventory: []
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 2: PERSISTENT WORLD ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: The world - locations, NPCs, time, consequences
File: src/legacy/systems/pillar-2-persistent-world.js

Core Functions:
  • initSession(engine, {party, setting})
  • createLocation(name, description, type)
  • movePartyTo(location)
  • advanceTime(rounds, hours, days)
  • getTime() - Current game time
  • createNPC(name, role, alignment)
  • updateNPCState(npcId, newState)
  • applyConsequences(consequences) - Update world based on events
  • discoverArea(x, y) - Mark area as discovered
  • getLocationDescription(locationId)
  • getTravelTime(from, to)
  • getAvailableLocations() - Where can party go

Data Structure:
  Location {
    id, name, description, type (dungeon/town/wilderness),
    discovered, visited,
    npcs: [], items: [], 
    connections: {locationId: travelTime},
    state: {}, consequences: []
  }

  NPC {
    id, name, role, alignment,
    hp, ac, level,
    location, allegiance (PC/neutral/enemy),
    relationships: {npcId: disposition},
    state: {}, notes: []
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 3: AGENCY & SPOTLIGHT ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Fair play - spotlight balance, meaningful choices
File: src/legacy/systems/pillar-3-agency-spotlight.js

Core Functions:
  ✅ initSession(engine, {party, setting})
  ✅ recordMoment(charId, momentType, description) - Mechanical/narrative/decision
  ✅ checkSpotlightBalance(characters) - Is it fair?
  ✅ getSpotlightBalance() - Get status of all chars
  ✅ getSpotlightStatus(score, average) - UNDERFED/BALANCED/HOGGING
  ✅ ensureAgency(roundActions) - Did players have real choices?
  ✅ preventHogging(charId) - Suggest spotlight shift
  ✅ rebalanceSpotlight() - End-of-round rebalancing

Data Structure:
  CharacterSpotlight {
    charId,
    score: number,
    mechanical: count, narrative: count, decisions: count,
    lastSpotlight: date,
    status: UNDERFED | BALANCED | HOGGING
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 4: UNCERTAINTY & STAKES ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Drama - tension, pacing, what's at risk
File: src/legacy/systems/pillar-4-uncertainty-stakes.js

Core Functions:
  • initSession(engine, {party, setting})
  • updateStakes(action, mechanical, consequences) - What changed
  • updateTension(round) - Adjust intensity
  • updatePacing(round) - Fast/slow/normal pacing
  • getStakesLevel() - What's at risk (low/medium/high)
  • getTensionCurve() - Curve of intensity over session
  • recordConsequence(consequence) - Track impact of actions
  • propagateConsequences() - How does this ripple through world

Data Structure:
  Stakes {
    partyStakes: (lives, resources, allies, reputation),
    worldStakes: (locations, factions, timeline),
    severity: low | medium | high | critical,
    consequences: [],
    tensionLevel: 0-100,
    pacingSpeed: slow | normal | fast
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 5: LEGIBILITY ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Clarity - rules, state visibility, understanding
File: src/legacy/systems/pillar-5-legibility.js

Core Functions:
  • initSession(engine, {party, setting})
  • validateAction(actor, action) - Is this legal?
  • getActionOptions(actor) - What can they do?
  • getRuleReference(topic) - Look up AD&D rules
  • getCharacterSheet(charId) - What do they see?
  • getWorldStatus() - What do they know about world?
  • explainOutcome(action, result) - Why did this happen?
  • getModifiers(action) - Why is this +2 to roll?

Data Structure:
  RuleLegibility {
    rules: {topic: {description, source, examples}},
    characterSheets: {charId: visibleStats},
    worldKnowledge: {charId: knownFacts},
    consequences: {actionId: explanation}
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 6: ORCHESTRATOR ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Narrative - story coherence, ambiance, DM voice
File: src/legacy/systems/pillar-6-orchestrator.js

Core Functions:
  • initSession(engine, {party, setting})
  • narrateOutcome(action, mechanical) - How to describe it
  • setScene(description, ambiance, imagery)
  • generateImage(prompt) - Create visual
  • generateAmbiance(mood, intensity) - Music/atmosphere
  • getDMVoice() - Consistent narrator tone
  • coordinateNarrative(round) - How do scenes connect?
  • createClimaticMoment() - Build to crescendo

Data Structure:
  Narration {
    scenes: [{name, description, atmosphere, imagery}],
    dmVoice: {tone, vocabulary, patterns},
    imagery: {prompt, generated_url},
    ambiance: {music, soundscape, lighting},
    emotionalArc: (rising_action, climax, resolution),
    narrative: string
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 7: WORLD STATE GRAPH ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Consequences - relationships, cause/effect, rumors
File: src/legacy/systems/pillar-7-world-state-graph.js

Core Functions:
  • initSession(engine, {party, setting})
  • calculateConsequences(action, mechanical) - What ripples result?
  • addRelationship(entity1, entity2, type) - Create connection
  • updateReputation(faction, delta) - Change standing
  • spreadRumor(rumor, originLocation) - Information flow
  • resolveConsequences() - Apply consequences to world
  • getEntityRelationships(entityId) - Who/what is connected?
  • predictConsequence(action) - "This will anger faction X"

Data Structure:
  Graph {
    entities: {id: {type, state}},
    relationships: {id1-id2: {type, strength, history}},
    rumors: [{content, origin, spread_speed, truth_value}],
    reputations: {faction-id: {party: value, npcs: values}},
    consequences: [{action, ripple, target, severity}]
  }

═════════════════════════════════════════════════════════════════════════════

PILLAR 8: SPOTLIGHT SCHEDULER ENGINE
─────────────────────────────────────────────────────────────────────────────
Responsibility: Turn order - initiative, rounds, spotlight allocation
File: src/legacy/systems/pillar-8-spotlight-scheduler.js

Core Functions:
  • initSession(engine, {party, setting})
  • calculateInitiative(characters) - Roll for order
  • getTurnOrder() - Who goes when?
  • getNextActor() - Whose turn is it?
  • recordTurn(actor, action) - Mark this turn taken
  • startRound(roundNumber) - New initiative?
  • endRound(roundNumber) - Round is over
  • getSpotlightThisRound() - Who got turns?
  • rebalanceTurns() - Ensure fairness in turn order

Data Structure:
  Schedule {
    round: number,
    turn: number,
    initiative: [{charId, initiative_roll, order}],
    turnOrder: [charId],
    turnLog: [{actor, action, result}],
    combatActive: boolean,
    spotlightThisRound: {charId: turnCount}
  }

═════════════════════════════════════════════════════════════════════════════

THE HEARTBEAT: NINE-PILLARS-ENGINE.JS
─────────────────────────────────────────────────────────────────────────────
Responsibility: ORCHESTRATE all 9 pillars into unified system
File: src/legacy/systems/nine-pillars-engine.js

Core Lifecycle:
  startSession(party, setting) → Initialize all pillars
    ├─ Create character entries (Pillar 1)
    ├─ Set up locations (Pillar 2)
    ├─ Initialize spotlight (Pillar 3)
    ├─ Set stakes (Pillar 4)
    ├─ Prepare rules (Pillar 5)
    ├─ Set narrative tone (Pillar 6)
    ├─ Create consequence graph (Pillar 7)
    └─ Calculate initiative (Pillar 8)

  startRound() → Prepare all pillars for new round
    ├─ Pillar 8: Calculate initiative
    ├─ Pillar 3: Check spotlight balance
    ├─ Pillar 4: Update pacing
    └─ Pillar 2: Advance time

  executeAction(actor, action) → THE CORE LOOP
    ├─ Pillar 5: Validate (is this legal?)
    ├─ Pillar 1: Resolve mechanics (what happens?)
    ├─ Pillar 6: Narrate (how to describe?)
    ├─ Pillar 7: Calculate consequences (what ripples?)
    ├─ Pillar 2: Update world (apply changes)
    ├─ Pillar 3: Record spotlight (who had moment?)
    └─ Pillar 4: Update stakes (what changed?)

  endRound() → Resolve all round effects
    ├─ Pillar 7: Resolve consequences
    ├─ Pillar 4: Update tension
    └─ Pillar 3: Rebalance spotlight

  endSession() → Wrap up
    └─ Generate session summary

═════════════════════════════════════════════════════════════════════════════
HOW TO BUILD EACH PILLAR (EXECUTION GUIDE)
═════════════════════════════════════════════════════════════════════════════

PATTERN FOR EACH PILLAR:

1. Create file: src/legacy/systems/pillar-N-name.js

2. Define class structure:
   class PillarName {
     constructor() {
       this.name = 'PillarName';
       // Initialize any internal state
     }
     
     initSession(engine, {party, setting}) {
       // Called when session starts
     }
     
     // ... core methods ...
   }

3. Export:
   export { PillarName };

4. Update nine-pillars-engine.js:
   import { PillarName } from './pillar-N-name.js';
   
   In constructor:
     this.pillar_var = new PillarName();
   
   In appropriate method:
     this.pillar_var.methodCall();

5. Test:
   Run nine-pillars-demo.js to verify integration

═════════════════════════════════════════════════════════════════════════════
IMPLEMENTATION SCHEDULE
═════════════════════════════════════════════════════════════════════════════

ALREADY DONE:
  ✅ Pillar 1: Mechanical State (371 lines)
  ✅ Pillar 3: Agency & Spotlight (240 lines)
  ✅ Heartbeat Engine (468 lines)

NEXT PRIORITY (in this order):

1. PILLAR 8: SPOTLIGHT SCHEDULER (1 hour)
   Why first: Initiative/turn order needed for combat
   What: Initiative rolls, turn tracking, round management
   
2. PILLAR 2: PERSISTENT WORLD (1.5 hours)
   Why: Locations, NPCs, travel needed for adventures
   What: World state, NPC tracking, consequences
   
3. PILLAR 4: UNCERTAINTY & STAKES (1.5 hours)
   Why: Tension curves, pacing essential for drama
   What: Tension management, consequence tracking
   
4. PILLAR 7: WORLD STATE GRAPH (1 hour)
   Why: Rumor spreading, faction reputation
   What: Relationship tracking, consequence propagation
   
5. PILLAR 6: ORCHESTRATOR (1.5 hours)
   Why: Narration, images, ambiance
   What: Scene management, image generation, DM voice
   
6. PILLAR 5: LEGIBILITY (1 hour)
   Why: Rules clarity, state visibility
   What: Rule lookup, action validation

INTEGRATION & TESTING (2 hours)
  • Verify all pillars coordinate through Heartbeat
  • Test grond-malice adventure with new engine
  • Full playtest end-to-end
  • Documentation

TOTAL: ~11 hours remaining (vs 19 hour estimate)

═════════════════════════════════════════════════════════════════════════════
SUCCESS CRITERIA FOR PHASE 3
═════════════════════════════════════════════════════════════════════════════

✅ All 9 pillars implemented
✅ Heartbeat successfully coordinates them
✅ Can run grond-malice adventure with unified engine
✅ All imports resolve correctly
✅ No code duplication across engines
✅ Tests pass for all mechanics
✅ DM can start session and play end-to-end
✅ Spotlight is balanced across party
✅ World state persists correctly
✅ Consequences propagate properly
✅ Images generate on demand
✅ Narration is coherent

═════════════════════════════════════════════════════════════════════════════

🎭 COMPLETE PHASE 3 ROADMAP IS NOW DEFINED

Next step: Pick a pillar from the priority list and build it.
Recommend starting with Pillar 8 (turn order) - it's critical for combat.

═════════════════════════════════════════════════════════════════════════════
