# CALIBRATION MODULE - CONNECTION POINTS MAP
## Integration Points in Your Nine Pillars Architecture

Your engine is **already structured to accept calibration**. Here are the exact injection points.

---

## OVERVIEW: Where Calibration Lives

```
USER ACTION (Natural Language)
    ↓
#6 FICTION-FIRST ORCHESTRATOR
    ├─ parseIntentFromFiction()
    ├─ consultContextualRules()
    │
    ├→ [CALIBRATION ENGINE QUERIES]  ← INSERTS HERE
    │   └─ calculatePartyPower()
    │   └─ getEncounterBudget()
    │   └─ planEncounter()
    │
    ├─ decideRandomness()
    ├─ executeSubsystems()
    ├─ updateWorldState()
    └─ narrateOutcome()
    
#2 PERSISTENT WORLD STATE
    └─ logTelemetry() ← COLLECTS DATA
    
#9 MECHANICAL STATE ENGINE
    ├─ getCharacterStats()  ← PROVIDES POWER SCORE DATA
    └─ getMonsterStats()    ← PROVIDES TV DATA
```

---

## CONNECTION POINT 1: FICTION-FIRST ORCHESTRATOR
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/fiction-first-orchestrator.js`
**Method:** `consultContextualRules()`
**Current state:**
```javascript
async consultContextualRules(intent, world) {
  const context = {
    intent: intent,
    character: null,
    environment: null,
    npcs: [],
    factions: [],
    applicableRules: [],
    modifiers: [],
    precedents: []
  };
  // ... populates context ...
}
```

**INJECTION POINT:**
```javascript
async consultContextualRules(intent, world) {
  // ... existing code ...
  
  // NEW: Query calibration engine for encounter context
  if (intent.goal.includes('encounter') || intent.goal.includes('combat')) {
    const partyPower = this.calibration.calculatePartyPower(
      this.mechanicalState.getParty()
    );
    
    const budget = this.calibration.getEncounterBudget(
      partyPower,
      intent.desiredDifficulty || 'standard'
    );
    
    context.calibration = {
      partyPower,
      encounteredBudget: budget,
      environmentModifier: this.calibration.getEnvironmentModifier(
        world.location
      )
    };
  }
  
  return context;
}
```

---

## CONNECTION POINT 2: GAME MASTER ORCHESTRATOR V2
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/game-master-orchestrator-v2.js`
**Method:** `loadModule()` and `startSession()`
**Current state:**
```javascript
async startSession(sessionNum, telegramChatId = null) {
  this.memory = new DMMemory(campaignName, sessionNum);
  this.combat = new IntegratedCombatEngine(this.memory, this.resources);
  // ... initializes combat ...
}
```

**INJECTION POINT:**
```javascript
async startSession(sessionNum, telegramChatId = null) {
  // ... existing init code ...
  
  // NEW: Initialize calibration engine
  this.calibration = new CalibrationEngine({
    fearFrequencyTarget: 0.25,
    attritionTarget: 1,
    difficultyBandDistribution: {
      victoryLap: 0.25,
      coinFlip: 0.50,
      bossPuzzle: 0.20,
      unwinnable: 0.05
    }
  });
  
  console.log(`✅ Calibration Engine: READY`);
  console.log(`   Target fear frequency: ${this.calibration.fearFrequencyTarget}`);
  console.log(`   Telemetry tracking: ACTIVE\n`);
  
  return { session: sessionNum, party: this.activeParty.length };
}
```

---

## CONNECTION POINT 3: INTEGRATED COMBAT ENGINE
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/game-master-orchestrator-v2.js` (line ~220)
**Method:** `beginEncounter()`
**Current state:**
```javascript
beginEncounter(encounterName, enemies, partyMembers) {
  this.inCombat = true;
  this.currentRound = 0;
  this.turnOrder = [];
  // ... sets up encounter ...
}
```

**INJECTION POINT:**
```javascript
beginEncounter(encounterName, enemies, partyMembers) {
  this.inCombat = true;
  this.currentRound = 0;
  this.turnOrder = [];
  
  // ... existing setup ...
  
  // NEW: Store encounter budget for later telemetry
  this.currentEncounter = {
    name: encounterName,
    enemies: enemies,
    plannedPartyPower: this.calibration.calculatePartyPower(
      this.resources.getAllResources()
    ),
    startTime: Date.now()
  };
  
  return { encounter: encounterName, participants, turnOrder: this.turnOrder };
}
```

---

## CONNECTION POINT 4: COMBAT END (TELEMETRY LOGGING)
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/game-master-orchestrator-v2.js` (line ~320)
**Method:** `endCombat()`
**Current state:**
```javascript
endCombat(result = 'victory', rewards = {}) {
  this.inCombat = false;

  this.memory.logEvent('combat', `Combat ended - ${result}`, {
    finalRound: this.currentRound,
    result,
    rewards
  });
  
  return {
    roundsTotal: this.currentRound,
    result,
    xp: rewards.xp || 0,
    gold: rewards.gold || 0
  };
}
```

**INJECTION POINT:**
```javascript
endCombat(result = 'victory', rewards = {}) {
  this.inCombat = false;

  // Existing memory logging
  this.memory.logEvent('combat', `Combat ended - ${result}`, {
    finalRound: this.currentRound,
    result,
    rewards
  });
  
  // NEW: Log calibration telemetry
  const combatOutcome = {
    partyPower: this.currentEncounter.plannedPartyPower,
    durationRounds: this.currentRound,
    hpBefore: this.getCombatHPBefore(), // Helper method needed
    hpAfter: this.getCombatHPAfter(),   // Helper method needed
    spellSlotsBurned: this.getSpellsBurned(),
    potionsUsed: this.getPotionsUsed(),
    pcsDropped: this.getPCsDroppedCount(),
    victory: result === 'victory',
    difficultyFelt: 'standard' // Ask players or infer from data
  };
  
  this.calibration.logTelemetry(this.currentEncounter, combatOutcome);
  
  // Print calibration feedback
  const recommendation = this.calibration.getRecommendation(
    this.calibration.telemetryHistory[this.calibration.telemetryHistory.length - 1]
  );
  
  console.log(`\n📊 Calibration Feedback: ${recommendation}`);
  
  return {
    roundsTotal: this.currentRound,
    result,
    xp: rewards.xp || 0,
    gold: rewards.gold || 0
  };
}
```

---

## CONNECTION POINT 5: HEARTBEAT ENGINE
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/the-heartbeat-engine.js`
**Method:** `handlePlayerIntent()`
**Current state:**
```javascript
async handlePlayerIntent(playerStatement, context = {}) {
  const stakes = this.stakesEngine.analyzeStakes(intent, context.npc, intent);
  const resolution = this.stakesEngine.resolveAction(intent, ...);
  return { intent, stakes, resolution, ...};
}
```

**INJECTION POINT:** The Heartbeat doesn't need changes—it uses the Orchestrator which will use Calibration. But if you want direct stakes calculation:

```javascript
async handlePlayerIntent(playerStatement, context = {}) {
  // ... existing parsing ...
  
  // NEW: If this is an encounter decision, consult calibration
  if (context.inCombat && this.orchestrator.calibration) {
    const stakes = this.orchestrator.calibration.calculateExpectedDifficulty(
      context.encounter.adjustedBudget,
      context.partyPower
    );
    
    // Modulate stakes communication based on expected difficulty
    context.stakes.expectedDifficulty = stakes;
  }
  
  return { ... };
}
```

---

## CONNECTION POINT 6: MECHANICAL STATE ENGINE
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/mechanical-state-engine.js`
**Method:** `createCharacter()` (already exists, just needs to expose data)
**Current state:**
```javascript
createCharacter(id, name, classDefinition, raceDefinition, level, choices = {}) {
  const character = { /* ... */ };
  this.characters.set(id, character);
  return character;
}
```

**INJECTION POINT:** Add query methods (no changes to existing code, just additions):

```javascript
// ADD THESE METHODS to MechanicalStateEngine:

getCharacterForCalibration(charId) {
  const char = this.characters.get(charId);
  return {
    level: char.level,
    class: char.classDefinition,
    hp: char.state.hp,
    maxHp: char.state.maxHp,
    wealth: this.calculateWealth(char),
    spellSlots: this.getSpellSlots(charId)
  };
}

getPartyForCalibration() {
  return Array.from(this.characters.values()).map(char => 
    this.getCharacterForCalibration(char.id)
  );
}

getMonsterForCalibration(monsterId) {
  const monster = this.getMonster(monsterId);
  return {
    hd: monster.hd,
    role: monster.role,      // 'brute' | 'controller' | etc
    lethality: monster.lethality  // 'standard' | 'save-or-die' | etc
  };
}
```

---

## CONNECTION POINT 7: RESOURCE TRACKER
**File:** `/Users/mpruskowski/.openclaw/workspace/dnd/game-master-orchestrator-v2.js` (line ~30)
**Current state:**
```javascript
class ResourceTracker {
  registerCharacter(name, characterData) {
    const resources = {
      name,
      spellSlots: characterData.spellSlots || {},
      hitDice: characterData.hitDice || {},
      inspiration: characterData.inspiration || false,
      conditions: [],
      temporaryHP: 0,
      deathSaves: { successes: 0, failures: 0 }
    };
    this.characters.set(name, resources);
    return resources;
  }
}
```

**INJECTION POINT:**
```javascript
// ADD TO ResourceTracker:

getResourceSnapshot() {
  // For pre-combat calibration
  const snapshot = [];
  this.characters.forEach(char => {
    snapshot.push({
      name: char.name,
      hp: char.hp || 0,
      maxHp: char.maxHp || 1,
      spellsAvailable: this.countSpellSlots(char.spellSlots),
      spellsTotal: this.countMaxSpellSlots(char.spellSlots),
      conditions: char.conditions.length
    });
  });
  return snapshot;
}

getResourceMod() {
  // Returns resource modifier (0.4 - 1.0) for Party Power calculation
  let totalPercent = 0;
  let count = 0;
  
  this.characters.forEach(char => {
    const hpPercent = (char.hp || 0) / (char.maxHp || 1);
    const spellPercent = this.countSpellSlots(char.spellSlots) / 
                        this.countMaxSpellSlots(char.spellSlots);
    totalPercent += (hpPercent + spellPercent) / 2;
    count++;
  });
  
  const avgPercent = totalPercent / (count || 1);
  if (avgPercent >= 0.9) return 1.0;
  if (avgPercent >= 0.75) return 0.95;
  if (avgPercent >= 0.5) return 0.85;
  if (avgPercent >= 0.25) return 0.65;
  return 0.4;
}
```

---

## CONNECTION POINT 8: WORLD STATE GRAPH / LOCATION DATA
**File:** Files that track location (context.location in your system)
**Current state:** Locations are tracked but no difficulty modifiers

**INJECTION POINT:** When loading a location, attach environment modifier:

```javascript
// In whatever loads locations (loadScene, etc.):

const location = this.getLocation(locationId);
location.environmentModifier = this.calibration.getEnvironmentModifier(
  location.terrain || 'dungeon_corridor'
);

// Then when planning encounters in that location:
const adjustedBudget = baseBudget * location.environmentModifier;
```

---

## CONNECTION POINT 9: POST-SESSION ANALYSIS
**File:** Create new file or add to existing session logging
**Location:** `/Users/mpruskowski/.openclaw/workspace/dnd/analyze-calibration.js`

**IMPLEMENTATION:**
```javascript
#!/usr/bin/env node

// This file already exists in my guide; just save it here
// to run after each session:
//
// node analyze-calibration.js

const fs = require('fs');
const CalibrationEngine = require('./calibration-engine');

async function analyzeTelemetry() {
  const lines = fs.readFileSync('telemetry.jsonl', 'utf8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => JSON.parse(l));

  const calibration = new CalibrationEngine();
  
  console.log('\n=== CALIBRATION ANALYSIS ===\n');
  
  // Group by difficulty
  const byDifficulty = {
    easy: lines.filter(t => t.expectedDifficulty === 'easy'),
    standard: lines.filter(t => t.expectedDifficulty === 'standard'),
    hard: lines.filter(t => t.expectedDifficulty === 'hard'),
    deadly: lines.filter(t => t.expectedDifficulty === 'deadly')
  };

  for (const [diff, encounters] of Object.entries(byDifficulty)) {
    if (encounters.length === 0) continue;

    const avgHP = encounters.reduce((sum, e) => sum + (e.hpLostPercent * 100), 0) / encounters.length;
    const avgDropped = encounters.reduce((sum, e) => sum + (e.pcsDropped || 0), 0) / encounters.length;
    const scaredCount = encounters.filter(e => e.scaredFactor === 'yes').length;

    console.log(`${diff.toUpperCase()} (n=${encounters.length})`);
    console.log(`  Avg HP Lost: ${avgHP.toFixed(1)}%`);
    console.log(`  Avg PCs Dropped: ${avgDropped.toFixed(2)}`);
    console.log(`  "Scared" Moments: ${scaredCount}/${encounters.length}`);
    console.log('');
  }

  const status = calibration.getCalibrationStatus();
  console.log('OVERALL STATUS:');
  console.log(`  ${status.recommendation}`);
}

analyzeTelemetry();
```

---

## SUMMARY: Integration Checklist

- [ ] **#6 Orchestrator:** Add calibration queries in `consultContextualRules()`
- [ ] **GM Orchestrator V2:** Initialize `CalibrationEngine` in `startSession()`
- [ ] **Combat Engine:** Store encounter budget in `beginEncounter()`
- [ ] **Combat End:** Log telemetry in `endCombat()`
- [ ] **Mechanical State:** Add query methods `getCharacterForCalibration()`, `getMonsterForCalibration()`
- [ ] **Resource Tracker:** Add `getResourceSnapshot()`, `getResourceMod()`
- [ ] **Location Loading:** Attach `environmentModifier` to location data
- [ ] **Post-Session:** Create/run `analyze-calibration.js`
- [ ] **Import:** `const CalibrationEngine = require('./calibration-engine');` in GM Orchestrator V2

---

## Data Flow (Real Example)

```
GM: "Party enters chamber with 4 goblins"
  ↓
GM Orchestrator calls startEncounter('goblin_ambush')
  ↓
Combat Engine.beginEncounter() stores:
  ├─ Party Power: 20.1
  └─ Current Location: 'dark_tunnel' (×1.3 modifier)
  
Calibration Engine.planEncounter() returns:
  ├─ Base Budget: 20.1
  ├─ Adjusted Budget: 26.1
  └─ Selected monsters: 4 goblins (total TV ≈ 26)
  
Combat runs for 7 rounds...
  
GM: "Combat ends, party wins"
  ↓
Combat Engine.endCombat('victory')
  ├─ Logs to memory
  └─ Calls calibration.logTelemetry({
      partyPower: 20.1,
      durationRounds: 7,
      hpBefore: [18, 20, 16],
      hpAfter: [12, 8, 14],
      pcsDropped: 0,
      difficultyFelt: 'standard'
    })
  
Calibration analyzes:
  ├─ 28% avg HP loss
  ├─ 0 PCs dropped
  ├─ No resources burned
  └─ Felt 'standard' to players
  
Recommendation: "Perfect standard encounter; maintain multipliers"
```

---

**This is a true plug-in module.** Your architecture is already designed to accept it. Just wire up the data flows at these 9 connection points.
