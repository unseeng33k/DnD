# CALIBRATION ENGINE INTEGRATION GUIDE

## Quick Start (3 Steps)

### Step 1: Load the Engine in Your Orchestrator

```javascript
// In fiction-first-orchestrator.js or game-master-orchestrator-v2.js

const CalibrationEngine = require('./calibration-engine');

class FictionFirstOrchestrator {
  constructor(worldState, mechanicalState, spotlightScheduler) {
    this.worldState = worldState;
    this.mechanicalState = mechanicalState;
    this.spotlight = spotlightScheduler;
    
    // Initialize calibration with your targets
    this.calibration = new CalibrationEngine({
      fearFrequencyTarget: 0.25,  // 1 in 4 encounters
      attritionTarget: 1,         // 1 PC death per level bracket
      difficultyBandDistribution: {
        victoryLap: 0.25,
        coinFlip: 0.50,
        bossPuzzle: 0.20,
        unwinnable: 0.05
      }
    });
  }

  // ... rest of orchestrator
}
```

### Step 2: Use Calibration to Plan Encounters

```javascript
async planEncounter(context) {
  // Get current party power
  const partyPower = this.calibration.calculatePartyPower(
    this.mechanicalState.getParty()
  );

  // Decide what difficulty you want (can be random or intentional)
  const desiredDifficulty = this.chooseDesiredDifficulty();
  const location = context.location || 'dungeon_corridor';

  // Get the encounter
  const encounter = this.calibration.planEncounter(
    partyPower,
    desiredDifficulty,
    location,
    this.mechanicalState.getAvailableMonsters()
  );

  return encounter;
}

chooseDesiredDifficulty() {
  // Random based on your distribution
  const rand = Math.random();
  if (rand < 0.25) return 'easy';
  if (rand < 0.75) return 'standard';
  if (rand < 0.95) return 'hard';
  return 'deadly';
}
```

### Step 3: Log Telemetry After Combat

```javascript
async resolveCombat(encounter, combatLog) {
  // Run combat (your existing logic)
  const outcome = await this.executeCombat(encounter, combatLog);

  // Log telemetry for calibration
  const telemetry = this.calibration.logTelemetry(encounter, {
    partyPower: this.calibration.calculatePartyPower(
      this.mechanicalState.getParty()
    ),
    durationRounds: combatLog.rounds,
    hpBefore: combatLog.partyHPBefore,
    hpAfter: combatLog.partyHPAfter,
    spellSlotsBurned: combatLog.spellsUsed,
    potionsUsed: combatLog.potionsUsed,
    pcsDropped: combatLog.pcsDroppedTo0 || 0,
    victory: outcome.partyVictory,
    difficultyFelt: this.askPartyDifficulty(), // Ask players
    resourceDrained: combatLog.spellsUsed > 0 || combatLog.potionsUsed > 0
  });

  // Log to file for post-session analysis
  await this.logToFile('telemetry.jsonl', telemetry);

  // Get DM feedback
  console.log(telemetry);
  const recommendation = this.calibration.getRecommendation(telemetry);
  console.log('Recommendation:', recommendation);

  return outcome;
}
```

---

## Adding to Your Nine Pillars

The Calibration Engine fits as a **meta-layer** above #6 Orchestrator:

```
Player Action
    ↓
[CALIBRATION ENGINE] ← NEW
    ↓
[#6 ORCHESTRATOR] (queries calibration for budget)
    ↓
[#1 through #9 Pillars] (execute encounter)
    ↓
[TELEMETRY] → [Calibration logs & iterates] ← FEEDBACK LOOP
```

### What Each Pillar Provides to Calibration:

- **#7 World Graph:** Location/environment for modifier
- **#9 Mechanical State:** Party stats for power calculation, monster stats for TV
- **#1 Heartbeat:** Outcome data (VP lost, rounds, resources burned)
- **#8 Spotlight:** Who should spotlight go to next (fairness not overridden by difficulty)

### What Calibration Provides Back:

- **#6 Orchestrator:** Encounter budget, monster selection
- **#1 Heartbeat:** Expected difficulty (stakes modifier)
- **#5 Legibility:** "This is standard difficulty, you're on track"

---

## Analyzing Your Telemetry (After 10-20 Encounters)

Create a simple analysis script:

```javascript
// analyze-calibration.js

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

  // Overall calibration status
  const status = calibration.getCalibrationStatus();
  console.log('OVERALL STATUS:');
  console.log(`  ${status.recommendation}`);
}

analyzeTelemetry();
```

Run after every session:
```bash
node analyze-calibration.js
```

---

## Expected Telemetry Patterns (By Level Band)

### Levels 1-3 (Survival Horror)
- **Easy encounters:** 5-15% HP loss, 0 PCs dropped
- **Standard encounters:** 20-40% HP loss, occasional PC drops
- **Hard encounters:** 40%+ HP loss, regular PC drops
- **Fear frequency target:** 1 in 4 (yes, 25% should be scary)

### Levels 4-7 (Competency)
- **Easy:** 5-10% HP loss, 0 drops
- **Standard:** 15-35% HP loss, rare drops (once every 4-5)
- **Hard:** 35-55% HP loss, occasional drops
- **Fear frequency target:** Still ~25%

### Levels 8-10 (Warband)
- **Easy:** 3-8% HP loss
- **Standard:** 20-40% HP loss (fewer encounters per day, higher per-encounter stakes)
- **Hard:** 40-60% HP loss
- **Fear frequency target:** 30-40% (slightly higher as fewer encounters total)

---

## Troubleshooting

### "All my encounters feel easy"
- **Check:** Is your Party Power calculation including resource spent?
- **Action:** Increase standard budget multiplier by 10% (`1.0 → 1.1`)
- **Monitor:** Re-test 5 standard encounters

### "My players always nearly TPK"
- **Check:** Are you selecting monsters with high Lethality Factors?
- **Action:** Decrease standard budget by 10% or lower lethality multipliers
- **Monitor:** Re-test 5 standard encounters

### "Players aren't scared (fear frequency too low)"
- **Check:** Are your hard encounters actually hard-difficulty?
- **Action:** Increase hard budget multiplier (`1.5 → 1.7`)
- **Monitor:** Run 1-2 intentional hard encounters per session

### "PCs dying too often (attrition too high)"
- **Check:** Are you running too many hard/deadly encounters?
- **Action:** Adjust distribution (reduce hard from 20% to 10%)
- **Monitor:** Track PC deaths per level bracket

---

## Integration with Your Existing Systems

### Party Manager Integration:
```javascript
// In party-manager.js

getCharacterPower(character) {
  // Return data calibration engine needs
  return {
    level: character.level,
    class: character.class,
    hp: character.hp,
    maxHp: character.maxHp,
    wealth: character.wealth || 0,
    spellSlots: {
      available: character.spellsAvailable || 0,
      total: character.spellSlotMax || 1
    }
  };
}
```

### Mechanical State Integration:
```javascript
// In mechanical-state-engine.js

getMonsterStats(monsterId) {
  // Return data calibration engine needs
  return {
    hd: this.monsters[monsterId].hd,
    role: this.monsters[monsterId].role,  // 'brute' | 'controller' | etc
    lethality: this.monsters[monsterId].lethality  // 'standard' | 'save-or-die' | etc
  };
}
```

---

## Next Session: Try It

1. **Before session:** Calculate your party power
2. **During encounters:** Note how long combat takes
3. **After each fight:** Log telemetry (use the template above)
4. **After session:** Run analysis
5. **Adjust:** Change multipliers if needed

**That's it.** After 2-3 sessions, you'll have real data on how to calibrate encounters for *your* table, *your* party, *your* desired experience.

No guessing. No CR tables. Just math + feedback = coherent difficulty.
