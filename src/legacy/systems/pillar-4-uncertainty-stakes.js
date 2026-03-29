#!/usr/bin/env node

/**
 * PILLAR 4: UNCERTAINTY & STAKES
 * 
 * Responsibility: Drama - tension curves, pacing, what's at risk
 * 
 * Handles:
 * - Session pacing (fast/normal/slow)
 * - Tension levels (0-100)
 * - What's at stake (lives, allies, reputation, treasure)
 * - Consequence tracking
 * - Climactic moment building
 */

class UncertaintyStakesPillar {
  constructor() {
    this.name = 'UncertaintyStakes';
    this.sessionIntensity = [];
    this.tableEnergy = 50; // 0-100, how engaged players are
    this.tensionLevel = 20; // 0-100, current intensity
    this.stakesLevel = 'low'; // low, medium, high, critical
    this.consequences = [];
    this.pacing = 'normal'; // slow, normal, fast
  }

  initSession(engine, { party, setting }) {
    this.engine = engine;
    this.party = party;
    this.setting = setting;

    // High-danger settings start with higher tension
    if (setting.danger_level === 'high') {
      this.tensionLevel = 40;
      this.stakesLevel = 'high';
    } else if (setting.danger_level === 'extreme') {
      this.tensionLevel = 60;
      this.stakesLevel = 'critical';
    }

    this.log(`✅ Pacing initialized (Tension: ${this.tensionLevel}, Stakes: ${this.stakesLevel})`);
  }

  /**
   * TENSION MANAGEMENT
   */

  updateTension(round) {
    // Tension increases over time
    const baseTensionIncrease = 1; // +1 per round
    this.tensionLevel += baseTensionIncrease;

    // Cap at 100
    this.tensionLevel = Math.min(100, this.tensionLevel);

    // Adjust table energy
    if (this.tensionLevel > 80) {
      this.tableEnergy -= 5; // High tension exhausts players
    } else if (this.tensionLevel < 30) {
      this.tableEnergy += 3; // Low tension gives them energy
    }

    this.tableEnergy = Math.max(0, Math.min(100, this.tableEnergy));

    if (round % 5 === 0) {
      this.log(`⚡ Tension: ${this.tensionLevel}/100, Table Energy: ${this.tableEnergy}/100`);
    }
  }

  /**
   * PACING CONTROL
   */

  updatePacing(round) {
    // If table energy is low, slow down
    if (this.tableEnergy < 30) {
      this.pacing = 'slow';
      this.log(`⏸️  Pacing slowed (players need a break)`);
    }
    // If tension is high and energy is good, keep fast
    else if (this.tensionLevel > 70 && this.tableEnergy > 60) {
      this.pacing = 'fast';
      this.log(`⚡ Pacing fast (maintaining momentum)`);
    }
    // Otherwise normal
    else {
      this.pacing = 'normal';
    }
  }

  /**
   * STAKES MANAGEMENT
   */

  updateStakes(action, mechanical, consequences) {
    // Higher stakes if:
    // - Character takes damage
    // - An NPC dies
    // - Reputation changes
    // - Mission fails partially

    let stakesDelta = 0;

    if (mechanical.damageDealt > 0) {
      stakesDelta += 5;
    }

    if (consequences.length > 0) {
      for (const consequence of consequences) {
        if (consequence.severity === 'critical') {
          stakesDelta += 20;
        } else if (consequence.severity === 'major') {
          stakesDelta += 10;
        } else if (consequence.severity === 'minor') {
          stakesDelta += 2;
        }
      }
    }

    // Update stakes level
    const currentStakesScore = this.getStakesScore();
    const newScore = currentStakesScore + stakesDelta;

    if (newScore < 20) {
      this.stakesLevel = 'low';
    } else if (newScore < 50) {
      this.stakesLevel = 'medium';
    } else if (newScore < 80) {
      this.stakesLevel = 'high';
    } else {
      this.stakesLevel = 'critical';
    }
  }

  getStakesScore() {
    const scores = {
      'low': 10,
      'medium': 40,
      'high': 70,
      'critical': 90
    };
    return scores[this.stakesLevel] || 10;
  }

  /**
   * CONSEQUENCE RECORDING
   */

  recordConsequence(consequence) {
    this.consequences.push({
      description: consequence.description,
      severity: consequence.severity, // minor, major, critical
      source: consequence.source,
      affectedTarget: consequence.target,
      timestamp: new Date().toISOString()
    });

    this.log(`💥 Consequence: ${consequence.description} (${consequence.severity})`);
  }

  /**
   * CLIMACTIC MOMENTS
   */

  createClimaticMoment() {
    if (this.tensionLevel > 75 && this.tableEnergy > 50) {
      this.log(`\n🎬 CLIMACTIC MOMENT APPROACHING`);
      this.log(`   Tension: ${this.tensionLevel}/100`);
      this.log(`   Stakes: ${this.stakesLevel}`);
      this.log(`   This is when legendary stories are told...`);
      return true;
    }
    return false;
  }

  /**
   * QUERIES
   */

  getTensionLevel() {
    return this.tensionLevel;
  }

  getTableEnergy() {
    return this.tableEnergy;
  }

  getStakesLevel() {
    return this.stakesLevel;
  }

  getPacing() {
    return this.pacing;
  }

  /**
   * SESSION STATS
   */

  getSessionStats() {
    return {
      tension: this.tensionLevel,
      energy: this.tableEnergy,
      stakes: this.stakesLevel,
      pacing: this.pacing,
      totalConsequences: this.consequences.length,
      criticalConsequences: this.consequences.filter(c => c.severity === 'critical').length
    };
  }

  /**
   * LOGGING
   */

  log(msg) {
    console.log(`[Pillar4-Stakes] ${msg}`);
  }
}

export { UncertaintyStakesPillar };
