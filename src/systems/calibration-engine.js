/**
 * CALIBRATION ENGINE (PILLAR META-LAYER)
 * 
 * Encounter difficulty scaling algorithm integrated with Nine Pillars architecture.
 * Treats every fight as UX data for iterative improvement.
 * 
 * Lives in: src/systems/
 * 
 * Usage in Orchestrator:
 *   const CalibrationEngine = require('./src/systems/calibration-engine');
 *   const calibration = new CalibrationEngine(partyStats, targetExperience);
 *   const budget = calibration.getEncounterBudget('standard', environment);
 *   const encounter = calibration.planEncounter(monsterPool, budget);
 *   calibration.logTelemetry(encounter, outcome);
 */

class CalibrationEngine {
  constructor(options = {}) {
    // Calibration Targets (user defines these once)
    this.fearFrequencyTarget = options.fearFrequencyTarget || 0.25; // 1 in 4
    this.attritionTarget = options.attritionTarget || 1; // 1 PC per level bracket
    this.difficultyBandDistribution = options.difficultyBandDistribution || {
      victoryLap: 0.25,    // 25% easy
      coinFlip: 0.50,      // 50% standard
      bossPuzzle: 0.20,    // 20% hard
      unwinnable: 0.05     // 5% deadly
    };

    // Multiplier state (starts at 1.0, adjusts with telemetry)
    this.multipliers = {
      roleModifier: {
        fullCaster: 1.3,
        halfCaster: 1.1,
        meleeHeavy: 1.2,
        skillMonkey: 0.8,
        balanced: 1.0
      },
      gearModifier: {
        montyHaul: 1.3,
        standard: 1.0,
        undergeared: 0.7
      },
      threatValue: {
        brute: 1.0,
        skirmisher: 1.2,
        controller: 1.4,
        artillery: 1.1,
        chaff: 0.6
      },
      lethality: {
        standard: 1.0,
        saveOrDie: 1.5,
        atWillCC: 1.3,
        flying: 1.5,
        invisible: 1.2
      },
      environmentMod: {}
    };

    // Telemetry history for iteration
    this.telemetryHistory = [];
  }

  /**
   * STEP 1: Calculate Party Power Score
   * 
   * Party Power = Σ (Character Power)
   * Character Power = Level × Role Mod × Gear Mod × Resource Mod
   */
  calculatePartyPower(party) {
    return party.reduce((sum, char) => {
      const baseLevel = char.level;
      const roleMod = this.getRoleModifier(char.class);
      const gearMod = this.getGearModifier(char);
      const resourceMod = this.getResourceModifier(char);

      return sum + (baseLevel * roleMod * gearMod * resourceMod);
    }, 0);
  }

  getRoleModifier(charClass) {
    const roleMap = {
      'cleric': 1.3,
      'mage': 1.3,
      'wizard': 1.3,
      'ranger': 1.1,
      'paladin': 1.1,
      'fighter': 1.2,
      'barbarian': 1.2,
      'thief': 0.8,
      'rogue': 0.8,
      'monk': 0.8,
      'bard': 1.0
    };
    return roleMap[charClass.toLowerCase()] || 1.0;
  }

  getGearModifier(character) {
    // Compares character wealth to DMG standard for their level
    const expectedWealth = character.level * 1000; // DMG baseline
    const actualWealth = character.wealth || 0;
    const ratio = actualWealth / expectedWealth;

    if (ratio > 1.3) return 1.3;      // Monty Haul
    if (ratio < 0.7) return 0.7;      // Undergeared
    return 1.0;                        // Standard
  }

  getResourceModifier(character) {
    const hpPercent = (character.hp || character.maxHp) / (character.maxHp || 1);
    const spellsAvailable = (character.spellSlots?.available || 0) / 
                           (character.spellSlots?.total || 1);
    
    // Average of HP and spell availability
    const resourcePercent = (hpPercent + spellsAvailable) / 2;

    if (resourcePercent >= 0.9) return 1.0;   // Full
    if (resourcePercent >= 0.75) return 0.95; // Light skirmish
    if (resourcePercent >= 0.5) return 0.85;  // Decent fight
    if (resourcePercent >= 0.25) return 0.65; // Heavily spent
    return 0.4;                                // Critical
  }

  /**
   * STEP 2: Get Encounter Budget
   * 
   * Easy: 0.5 × Party Power
   * Standard: 1.0 × Party Power
   * Hard: 1.5 × Party Power
   * Deadly: 2.0 × Party Power
   */
  getEncounterBudget(partyPower, difficulty = 'standard') {
    const budgetMap = {
      'easy': 0.5,
      'standard': 1.0,
      'hard': 1.5,
      'deadly': 2.0
    };
    const multiplier = budgetMap[difficulty] || 1.0;
    return partyPower * multiplier;
  }

  /**
   * STEP 3: Calculate Threat Value for a Monster
   * 
   * TV = HD × Role Factor × Lethality Factor
   */
  calculateThreatValue(monster) {
    const { hd, role, lethality } = monster;
    const roleFactor = this.multipliers.threatValue[role] || 1.0;
    const lethalityFactor = this.multipliers.lethality[lethality] || 1.0;

    return hd * roleFactor * lethalityFactor;
  }

  /**
   * STEP 4: Adjust Budget by Environment
   */
  getEnvironmentModifier(location) {
    const envMap = {
      'open_field': 0.8,
      'forest': 1.0,
      'dungeon_corridor': 1.3,
      'lair_prepared': 1.5,
      'ambush_dark': 1.4,
      'water_advantage': 1.2,
      'high_ground': 1.2,
      'blizzard_night': 1.4
    };
    return envMap[location] || 1.0;
  }

  /**
   * STEP 5: Plan Encounter
   */
  planEncounter(partyPower, difficulty, environment, monsterPool) {
    // Get base budget
    const baseBudget = this.getEncounterBudget(partyPower, difficulty);
    
    // Adjust by environment
    const envMod = this.getEnvironmentModifier(environment);
    const adjustedBudget = baseBudget * envMod;

    // Select monsters totaling ~adjustedBudget
    const encounter = this.selectMonsters(monsterPool, adjustedBudget);

    return {
      adjustedBudget,
      monsters: encounter.monsters,
      totalTV: encounter.totalTV,
      difficulty,
      environment,
      expectedDifficulty: this.calculateExpectedDifficulty(
        adjustedBudget,
        partyPower
      )
    };
  }

  selectMonsters(pool, budget, tolerance = 0.15) {
    // Simple greedy selection (can be improved with better algorithms)
    const selected = [];
    let totalTV = 0;

    // Sort by TV descending for better packing
    const sorted = [...pool].sort((a, b) => 
      this.calculateThreatValue(b) - this.calculateThreatValue(a)
    );

    for (const monster of sorted) {
      const tv = this.calculateThreatValue(monster);
      if (totalTV + tv <= budget * (1 + tolerance)) {
        selected.push(monster);
        totalTV += tv;
      }
      if (totalTV >= budget * (1 - tolerance)) break;
    }

    return {
      monsters: selected,
      totalTV
    };
  }

  calculateExpectedDifficulty(adjustedBudget, partyPower) {
    const ratio = adjustedBudget / partyPower;
    if (ratio < 0.7) return 'easy';
    if (ratio < 1.2) return 'standard';
    if (ratio < 1.8) return 'hard';
    return 'deadly';
  }

  /**
   * STEP 6: Log Telemetry (Post-Fight)
   */
  logTelemetry(encounter, outcome) {
    const telemetry = {
      timestamp: Date.now(),
      encounterID: encounter.id || `enc_${Date.now()}`,
      expectedDifficulty: encounter.expectedDifficulty,
      expectedBudget: encounter.adjustedBudget,
      actualTV: encounter.totalTV,
      partyPowerAtTime: outcome.partyPower,
      duration: outcome.durationRounds,
      
      // Resource tracking
      hpBefore: outcome.hpBefore,
      hpAfter: outcome.hpAfter,
      hpLostPercent: this.calculateHPLoss(outcome.hpBefore, outcome.hpAfter),
      spellSlotsBurned: outcome.spellSlotsBurned,
      potionsUsed: outcome.potionsUsed,
      
      // Outcome
      pcsDropped: outcome.pcsDropped || 0,
      victory: outcome.victory !== false,
      
      // Player perception vs math
      difficultyFelt: outcome.difficultyFelt, // 'easy' | 'standard' | 'hard' | 'deadly'
      scaredFactor: outcome.pcsDropped > 0 ? 'yes' : 'no',
      
      // Analysis
      resourceDrained: outcome.resourceDrained || false,
      combatTooShort: outcome.durationRounds < 3,
      combatTooLong: outcome.durationRounds > 15
    };

    this.telemetryHistory.push(telemetry);
    this.analyzeDeviation(telemetry);
    
    return telemetry;
  }

  calculateHPLoss(before, after) {
    if (!before || !after) return 0;
    const totalBefore = before.reduce((a, b) => a + b, 0);
    const totalAfter = after.reduce((a, b) => a + b, 0);
    return 1 - (totalAfter / totalBefore);
  }

  /**
   * STEP 7: Analyze Deviation & Iterate
   */
  analyzeDeviation(telemetry) {
    const expectedRatio = telemetry.expectedBudget / telemetry.partyPowerAtTime;
    const actualRatio = telemetry.actualTV / telemetry.partyPowerAtTime;

    const hpLossPercent = telemetry.hpLostPercent * 100;
    const scoreHit = (telemetry.pcsDropped > 0) ? 'yes' : 'no';

    // Decision logic for multiplier adjustment
    if (telemetry.expectedDifficulty === 'standard') {
      // Standard should drain 15-40% HP, drop 0-1 PCs rarely
      if (hpLossPercent < 10 && scoreHit === 'no') {
        // TOO EASY: Increase standard budget
        console.log(`✓ Standard felt easy. Increasing budget multiplier.`);
        this.multipliers.budgetStandard = (this.multipliers.budgetStandard || 1.0) + 0.05;
      }
      if (hpLossPercent > 50 && telemetry.pcsDropped > 0) {
        // TOO HARD: Decrease standard budget
        console.log(`✗ Standard felt hard. Decreasing budget multiplier.`);
        this.multipliers.budgetStandard = (this.multipliers.budgetStandard || 1.0) - 0.05;
      }
    }

    return {
      adjusted: true,
      recommendation: this.getRecommendation(telemetry),
      nextAdjustment: this.multipliers
    };
  }

  getRecommendation(telemetry) {
    const hpLoss = telemetry.hpLostPercent * 100;
    
    if (hpLoss < 5) return 'Encounter was trivial; increase next standard budget by 10%';
    if (hpLoss < 15 && telemetry.pcsDropped === 0) return 'Encounter felt easy; standard budget OK, maybe increase 5%';
    if (hpLoss >= 25 && hpLoss <= 45 && telemetry.pcsDropped === 0) return 'Perfect standard encounter; maintain multipliers';
    if (hpLoss >= 45 && telemetry.pcsDropped <= 1) return 'Hard but fair; good for occasional scare moments';
    if (hpLoss > 50 || telemetry.pcsDropped > 1) return 'Encounter was TOO HARD; decrease standard budget by 5-10%';
    
    return 'Encounter within expected range; continue monitoring';
  }

  /**
   * Get calibration status for DM reference
   */
  getCalibrationStatus() {
    const recent = this.telemetryHistory.slice(-10);
    if (recent.length === 0) return { status: 'No data yet', telemetryCount: 0 };

    const avgHPLoss = recent.reduce((sum, t) => sum + (t.hpLostPercent * 100), 0) / recent.length;
    const fearMoments = recent.filter(t => t.scaredFactor === 'yes').length;
    const fearFrequency = fearMoments / recent.length;

    return {
      telemetryCount: this.telemetryHistory.length,
      recentAvgHPLoss: avgHPLoss.toFixed(1) + '%',
      fearFrequency: (fearFrequency * 100).toFixed(0) + '%',
      recommendation: fearFrequency < this.fearFrequencyTarget ? 'Encounters too easy; increase difficulty' : 
                     fearFrequency > this.fearFrequencyTarget ? 'Encounters too hard; decrease difficulty' :
                     'Perfect calibration maintained'
    };
  }
}

module.exports = CalibrationEngine;