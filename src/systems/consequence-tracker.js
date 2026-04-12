/**
 * ConsequenceTracker: Emits mechanical outcome events (critical hits, natural 1s, deaths, damage thresholds)
 * Acts as event source for all other systems to react to combat outcomes
 * Maintains consequence chains and escalation rounds
 */

export class ConsequenceTracker {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.consequenceHistory = [];
    this.escalationRounds = 0;
    this.linkedObjectives = [];
    this.damageThresholds = {
      twentyFivePercent: false,
      fiftyPercent: false,
      seventyFivePercent: false,
      criticalDamage: false,
    };
  }

  /**
   * Track a critical hit and emit event for other systems
   */
  trackCriticalHit(attacker, target, damage, multiplier, roll) {
    const consequence = {
      type: 'CRITICAL_HIT',
      attacker: attacker.name,
      target: target.name,
      damage,
      multiplier,
      roll,
      timestamp: new Date(),
      severity: 'high',
    };

    this.consequenceHistory.push(consequence);
    this.escalationRounds++;

    this.eventBus.emit('mechanical:critical-hit', {
      attacker,
      target,
      damage,
      multiplier,
      roll,
      escalationLevel: this.escalationRounds,
    });

    return consequence;
  }

  /**
   * Track a natural 1 (fumble) and emit event
   */
  trackNaturalOne(actor, action, roll) {
    const consequence = {
      type: 'NATURAL_ONE',
      actor: actor.name,
      action,
      roll,
      timestamp: new Date(),
      severity: 'medium',
    };

    this.consequenceHistory.push(consequence);
    this.escalationRounds++;

    this.eventBus.emit('mechanical:natural-one', {
      actor,
      action,
      roll,
      escalationLevel: this.escalationRounds,
    });

    return consequence;
  }

  /**
   * Track damage threshold breaches (25%, 50%, 75% HP loss)
   */
  trackDamageThreshold(target, currentHP, maxHP, damageAmount) {
    const hpPercent = (currentHP / maxHP) * 100;
    const previousPercent = ((currentHP + damageAmount) / maxHP) * 100;
    const thresholds = [];

    // Check if we crossed into new threshold brackets
    if (previousPercent > 75 && hpPercent <= 75) {
      thresholds.push('SEVENTY_FIVE_PERCENT');
      this.damageThresholds.seventyFivePercent = true;
    }
    if (previousPercent > 50 && hpPercent <= 50) {
      thresholds.push('FIFTY_PERCENT');
      this.damageThresholds.fiftyPercent = true;
    }
    if (previousPercent > 25 && hpPercent <= 25) {
      thresholds.push('TWENTY_FIVE_PERCENT');
      this.damageThresholds.twentyFivePercent = true;
    }
    if (hpPercent < 10) {
      thresholds.push('CRITICAL_DAMAGE');
      this.damageThresholds.criticalDamage = true;
    }

    if (thresholds.length > 0) {
      const consequence = {
        type: 'DAMAGE_THRESHOLD',
        target: target.name,
        thresholdsCrossed: thresholds,
        currentHP,
        maxHP,
        hpPercent: Math.round(hpPercent),
        timestamp: new Date(),
        severity: thresholds.includes('CRITICAL_DAMAGE') ? 'high' : 'medium',
      };

      this.consequenceHistory.push(consequence);

      this.eventBus.emit('mechanical:damage-threshold', {
        target,
        thresholds,
        currentHP,
        maxHP,
        hpPercent: Math.round(hpPercent),
      });

      return consequence;
    }

    return null;
  }

  /**
   * Track character death and emit high-priority event
   */
  trackDeath(character, causeOfDeath) {
    const consequence = {
      type: 'CHARACTER_DEATH',
      character: character.name,
      causeOfDeath,
      timestamp: new Date(),
      severity: 'critical',
      escalationRound: this.escalationRounds,
    };

    this.consequenceHistory.push(consequence);
    this.escalationRounds += 2; // Death escalates severity significantly

    this.eventBus.emit('mechanical:character-death', {
      character,
      causeOfDeath,
      escalationLevel: this.escalationRounds,
    });

    // Death often triggers narrative consequences
    this.eventBus.emit('narrative:dramatic-moment', {
      type: 'death',
      character,
      causeOfDeath,
    });

    return consequence;
  }

  /**
   * Track recovery (healing above thresholds resets them)
   */
  trackRecovery(character, healAmount, currentHP, maxHP) {
    const hpPercent = (currentHP / maxHP) * 100;

    // Reset threshold flags if healed above them
    if (hpPercent > 75) {
      this.damageThresholds.seventyFivePercent = false;
    }
    if (hpPercent > 50) {
      this.damageThresholds.fiftyPercent = false;
    }
    if (hpPercent > 25) {
      this.damageThresholds.twentyFivePercent = false;
    }
    if (hpPercent > 10) {
      this.damageThresholds.criticalDamage = false;
    }

    const consequence = {
      type: 'RECOVERY',
      character: character.name,
      healAmount,
      currentHP,
      maxHP,
      hpPercent: Math.round(hpPercent),
      timestamp: new Date(),
      severity: 'low',
    };

    this.consequenceHistory.push(consequence);

    this.eventBus.emit('mechanical:recovery', {
      character,
      healAmount,
      currentHP,
      maxHP,
      hpPercent: Math.round(hpPercent),
    });

    return consequence;
  }

  /**
   * Constraint: Check if action is prevented by active consequences
   * Returns null if action can proceed, or reason if prevented
   */
  isActionConstrainedByConsequence(actor, actionType) {
    // Death prevents all actions except resurrection-related
    const isDeadConsequence = this.consequenceHistory.some(
      c => c.type === 'CHARACTER_DEATH' && c.character === actor.name
    );

    if (isDeadConsequence && actionType !== 'RESURRECTION') {
      return 'CHARACTER_IS_DEAD';
    }

    // Recent critical damage may constrain movement (optional mechanical rule)
    const recentCriticalDamage = this.consequenceHistory
      .filter(c => c.type === 'DAMAGE_THRESHOLD' && c.thresholdsCrossed.includes('CRITICAL_DAMAGE'))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (recentCriticalDamage && actionType === 'FULL_ROUND_ACTION') {
      const roundsSinceCritical = (new Date() - recentCriticalDamage.timestamp) / 6000; // ~6s per round
      if (roundsSinceCritical < 2) {
        return 'CRITICALLY_DAMAGED_CANNOT_FULL_ROUND';
      }
    }

    return null;
  }

  /**
   * Get recent consequences for narrator/ambiance context
   */
  getRecentConsequences(count = 5) {
    return this.consequenceHistory.slice(-count).reverse();
  }

  /**
   * Get escalation level for ambiance intensity
   */
  getEscalationLevel() {
    return this.escalationRounds;
  }

  /**
   * Reset escalation (end of encounter)
   */
  resetEscalation() {
    this.escalationRounds = 0;
    this.damageThresholds = {
      twentyFivePercent: false,
      fiftyPercent: false,
      seventyFivePercent: false,
      criticalDamage: false,
    };
  }

  /**
   * Link a consequence to narrative objectives (e.g., death triggers revenge arc)
   */
  linkObjective(consequenceType, objective) {
    this.linkedObjectives.push({
      consequence: consequenceType,
      objective,
      createdAt: new Date(),
    });

    this.eventBus.emit('narrative:objective-linked', {
      consequence: consequenceType,
      objective,
    });

    return objective;
  }

  /**
   * Get all linked objectives for narrator
   */
  getLinkedObjectives() {
    return this.linkedObjectives;
  }
}
