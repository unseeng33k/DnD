#!/usr/bin/env node

/**
 * PILLAR 3: AGENCY & SPOTLIGHT
 * 
 * Responsible for:
 * - Tracking spotlight across the party
 * - Ensuring balanced mechanical wins (combat successes)
 * - Ensuring balanced narrative moments (story beats)
 * - Ensuring balanced decision gates (player choices)
 * - Managing player agency (meaningful choices)
 * - Preventing spotlight hogging
 */

class AgencySpotlightPillar {
  constructor() {
    this.name = 'AgencySpotlight';
    this.party = [];
    this.spotlightBalance = {};
    this.mechanicalWins = {};
    this.narrativeWins = {};
    this.decisionGates = {};
    this.sessionNumber = 0;
  }

  initSession(engine, { party, setting }) {
    this.engine = engine;
    this.party = party;

    // Initialize tracking for each party member
    for (const char of party) {
      this.spotlightBalance[char.id] = {
        score: 0,
        mechanical: 0,
        narrative: 0,
        decisions: 0,
        lastSpotlight: null
      };
    }

    this.log(`✅ Initialized spotlight tracking for ${party.length} characters`);
  }

  /**
   * RECORD A MOMENT
   * When a character does something notable, record it here
   */

  recordMoment(charId, momentType, description = '') {
    if (!this.spotlightBalance[charId]) {
      this.log(`⚠️  Character ${charId} not in party`);
      return;
    }

    const spotlight = this.spotlightBalance[charId];

    switch (momentType) {
      case 'mechanical_win':
        spotlight.mechanical++;
        spotlight.score += 3; // Mechanical wins worth more
        this.log(`⚔️  ${charId} gets mechanical win: ${description}`);
        break;

      case 'narrative_moment':
        spotlight.narrative++;
        spotlight.score += 2;
        this.log(`📖 ${charId} gets narrative moment: ${description}`);
        break;

      case 'decision_gate':
        spotlight.decisions++;
        spotlight.score += 2.5;
        this.log(`🚪 ${charId} gets decision: ${description}`);
        break;

      default:
        this.log(`⚠️  Unknown moment type: ${momentType}`);
    }

    spotlight.lastSpotlight = new Date();
  }

  /**
   * CHECK SPOTLIGHT BALANCE
   * Called at start of round to assess balance
   */

  checkSpotlightBalance(characters) {
    const balances = this.getSpotlightBalance();

    let maxScore = 0;
    let minScore = Infinity;
    let maxChar = null;
    let minChar = null;

    for (const [charId, balance] of Object.entries(balances)) {
      if (balance.score > maxScore) {
        maxScore = balance.score;
        maxChar = charId;
      }
      if (balance.score < minScore) {
        minScore = balance.score;
        minChar = charId;
      }
    }

    const imbalance = maxScore - minScore;
    const threshold = 5; // Allow 5 points of imbalance

    if (imbalance > threshold) {
      this.log(`⚠️  Spotlight imbalance detected!`);
      this.log(`   ${maxChar} is HOGGING (${maxScore} points)`);
      this.log(`   ${minChar} is UNDERFED (${minScore} points)`);
      
      // Recommendation to DM
      this.log(`   💡 Suggestion: Give ${minChar} a spotlight moment soon`);

      return {
        imbalanced: true,
        maxChar,
        minChar,
        maxScore,
        minScore,
        imbalance
      };
    }

    return { imbalanced: false };
  }

  /**
   * GET SPOTLIGHT STATUS for all characters
   */

  getSpotlightBalance() {
    const balance = {};
    const totalSpotlight = Object.values(this.spotlightBalance)
      .reduce((sum, s) => sum + s.score, 0);
    const avgSpotlight = totalSpotlight / this.party.length || 1;

    for (const char of this.party) {
      const spotlight = this.spotlightBalance[char.id];
      const percentOfTotal = totalSpotlight > 0
        ? (spotlight.score / totalSpotlight * 100).toFixed(1)
        : 0;

      balance[char.id] = {
        name: char.name,
        spotlightScore: spotlight.score,
        mechanical: spotlight.mechanical,
        narrative: spotlight.narrative,
        decisions: spotlight.decisions,
        percentOfPartyTotal: `${percentOfTotal}%`,
        status: this.getSpotlightStatus(spotlight.score, avgSpotlight),
        lastMoment: spotlight.lastSpotlight
      };
    }

    return balance;
  }

  getSpotlightStatus(score, average) {
    const threshold = average * 0.7;
    const hogThreshold = average * 1.3;

    if (score < threshold) return '🟠 UNDERFED';
    if (score > hogThreshold) return '🔴 HOGGING';
    return '🟢 BALANCED';
  }

  /**
   * ENSURE PLAYER AGENCY
   * Did the players have meaningful choices this round?
   */

  ensureAgency(roundActions) {
    let agencyMoments = 0;

    for (const action of roundActions) {
      // Action has agency if:
      // 1. Multiple valid outcomes were possible
      // 2. Player choice affected the outcome
      // 3. Outcome has meaningful consequences

      if (action.agency_level && action.agency_level > 0) {
        agencyMoments++;
      }
    }

    const agencyRatio = roundActions.length > 0
      ? (agencyMoments / roundActions.length * 100).toFixed(0)
      : 0;

    if (agencyRatio < 50) {
      this.log(`⚠️  Low agency round! Only ${agencyRatio}% of actions had meaningful choice`);
      this.log(`   💡 Suggestion: Offer more player choices next round`);
    }

    return { agencyRatio, agencyMoments };
  }

  /**
   * REBALANCE AT END OF ROUND
   */

  rebalanceSpotlight() {
    const balance = this.getSpotlightBalance();

    for (const [charId, status] of Object.entries(balance)) {
      if (status.status === '🟠 UNDERFED') {
        this.log(`⭐ Prioritize ${status.name} for next scene`);
      }
    }
  }

  /**
   * PREVENT SPOTLIGHT HOGGING
   * Called when someone is getting too much
   */

  preventHogging(charId) {
    const spotlight = this.spotlightBalance[charId];
    if (!spotlight) return;

    this.log(`⏸️  Spotlight check on ${charId}`);
    this.log(`   Current score: ${spotlight.score}`);
    this.log(`   💡 Consider shifting spotlight to another character`);
  }

  /**
   * LOGGING
   */

  log(msg) {
    console.log(`[Pillar3-Agency] ${msg}`);
  }
}

export { AgencySpotlightPillar };
