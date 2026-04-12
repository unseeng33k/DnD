#!/usr/bin/env node

/**
 * MEMORY SURFACING ENGINE
 * 
 * When the world is sticky with history, the engine must know:
 * "What should the DM remind themselves of RIGHT NOW?"
 * 
 * This surfaces:
 * - NPC memories of the party
 * - Unresolved promises coming due
 * - Related past events
 * - Secrets that could matter
 * - Consequences creeping into play
 */

class MemorySurfacingEngine {
  constructor(worldState) {
    this.world = worldState;
    this.surfaceThreshold = 0.6; // Relevance threshold
  }

  /**
   * SURFACE MEMORIES FOR NPC ENCOUNTER
   * 
   * Player: "We approach the guard we met 5 sessions ago"
   * 
   * Engine should whisper: "Sergeant Marlow. He still remembers you bribed him.
   *                        He owes you a favor. His attitude toward you is cautious."
   */
  surfaceNPCMemory(npcId, context = {}) {
    const npc = this.world.entities.get(npcId);
    if (!npc || npc.type !== 'npc') return null;

    const surfaced = {
      npc: {
        name: npc.name,
        description: npc.description,
        attitude: npc.attitude,
        trust: npc.trust,
        fear: npc.fear,
        debt: npc.debt
      },
      memories: [],
      relevantLoops: [],
      worldState: null,
      reminders: [] // Actionable reminders for DM
    };

    // Gather memories in order of relevance
    const memories = [];

    // 1. MOST RECENT INTERACTION (very relevant)
    const recentMemory = npc.memoryOfPlayer.slice(-1)[0];
    if (recentMemory) {
      memories.push({
        type: 'recent_interaction',
        time: recentMemory.time,
        event: recentMemory.event,
        impact: recentMemory.impact,
        relevance: 0.95,
        ageInSessions: this.world.currentTime - recentMemory.time
      });
    }

    // 2. MEANINGFUL MOMENTS (moments that changed attitude)
    const attitudeShifts = npc.memoryOfPlayer.filter(m => 
      m.event.includes('trust') || m.event.includes('betrayal') || m.event.includes('mercy')
    );
    
    attitudeShifts.forEach(shift => {
      memories.push({
        type: 'attitude_shift',
        time: shift.time,
        event: shift.event,
        newAttitude: shift.impact,
        relevance: 0.8,
        ageInSessions: this.world.currentTime - shift.time
      });
    });

    // 3. UNRESOLVED PROMISES (these hang in the air)
    const npcPromises = this.world.openLoops.filter(loop =>
      loop.type === 'promise' &&
      (loop.maker === npcId || loop.promisee === npcId) &&
      !loop.resolved
    );

    npcPromises.forEach(promise => {
      memories.push({
        type: 'unresolved_promise',
        loop: promise,
        relevance: 0.9 + (promise.ageInSessions * 0.1), // Older promises are MORE relevant
        ageInSessions: promise.ageInSessions,
        pressure: promise.pressure
      });
    });

    // 4. DEBTS (money, favors, blood debts)
    if (npc.debt !== 0) {
      memories.push({
        type: 'debt',
        amount: npc.debt,
        direction: npc.debt > 0 ? 'npc_owes_player' : 'player_owes_npc',
        relevance: 0.7,
        actionable: true
      });
    }

    // 5. SECRETS NPC KNOWS ABOUT PLAYER
    if (npc.secrets && npc.secrets.length > 0) {
      npc.secrets.forEach(secret => {
        memories.push({
          type: 'secret',
          secret: secret.text || secret,
          relevance: 0.85,
          canLeverage: true
        });
      });
    }

    // Sort by relevance
    memories.sort((a, b) => b.relevance - a.relevance);

    // Keep top 5 most relevant
    surfaced.memories = memories.slice(0, 5);

    // Find related open loops (quests, mysteries that affect this NPC)
    const relatedLoops = this.world.openLoops.filter(loop =>
      loop.affectsEntities.includes(npcId) &&
      !loop.resolved &&
      loop.pressure !== 'low'
    );

    surfaced.relevantLoops = relatedLoops.slice(0, 3);

    // Generate DM REMINDERS
    surfaced.reminders = this.generateNPCReminders(npc, surfaced.memories, surfaced.relevantLoops);

    return surfaced;
  }

  /**
   * SURFACE LOCATION MEMORY
   * 
   * Player: "We return to the castle"
   * 
   * Engine: "The last time you were here, the lord was angry at you for
   *          killing his guard. Has anything changed? His son now rules."
   */
  surfaceLocationMemory(locationId) {
    const location = this.world.entities.get(locationId);
    if (!location || location.type !== 'location') return null;

    const surfaced = {
      location: {
        name: location.name,
        description: location.description,
        state: location.state
      },
      history: [],
      partyInteractions: [],
      npcsPresent: [],
      threats: [],
      opportunities: [],
      changes: []
    };

    // What events happened here?
    const locationEvents = this.world.events.filter(e =>
      e.description.includes(location.name) || e.target === locationId
    );

    surfaced.history = locationEvents.slice(-5); // Last 5 events at location

    // What changed since last visit?
    const lastVisit = location.memoryOfPlayer ? location.memoryOfPlayer.slice(-1)[0] : null;
    if (lastVisit && lastVisit.time < this.world.currentTime - 1) {
      surfaced.changes.push({
        type: 'time_passed',
        sessions: this.world.currentTime - lastVisit.time,
        message: `${this.world.currentTime - lastVisit.time} sessions have passed since you were last here`
      });
    }

    // Who's here now that wasn't before?
    // (Would need location occupancy tracking in full system)

    return surfaced;
  }

  /**
   * SURFACE PROMISE/DEBT (coming due)
   * 
   * Player: *traveling through region*
   * 
   * Engine: "You remember: you promised the village elder aid within 10 days.
   *          It's been 8. The wedding is in 2 days. The bandits are still active."
   */
  surfaceOpenLoop(loopId) {
    const loop = this.world.openLoops.find(l => l.id === loopId);
    if (!loop || loop.resolved) return null;

    const surfaced = {
      loop,
      ageInSessions: loop.ageInSessions,
      daysUntilDeadline: loop.deadline ? loop.deadline - loop.ageInSessions : null,
      pressure: loop.pressure,
      affectedEntities: loop.affectsEntities.map(id => {
        const entity = this.world.entities.get(id);
        return entity ? { name: entity.name, id, attitude: entity.attitude } : null;
      }).filter(e => e),
      isComingDue: loop.ageInSessions > (loop.deadline * 0.8) || loop.pressure === 'critical',
      narrativeReminder: this.generateLoopReminder(loop)
    };

    return surfaced;
  }

  /**
   * GENERATE NPC REMINDER (what the DM should remember)
   */
  generateNPCReminders(npc, memories, loops) {
    const reminders = [];

    if (memories.length === 0) {
      reminders.push(`${npc.name} has no memory of you. To them, you're strangers.`);
    }

    // Attitude
    if (npc.attitude === 'hostile') {
      reminders.push(`⚠️  ${npc.name} is HOSTILE toward you.`);
    } else if (npc.attitude === 'friendly') {
      reminders.push(`✓ ${npc.name} is FRIENDLY toward you.`);
    } else if (npc.attitude === 'indifferent') {
      reminders.push(`${npc.name} is indifferent. You'll need to give them reason to care.`);
    }

    // Trust
    if (npc.trust > 50) {
      reminders.push(`${npc.name} TRUSTS you (${npc.trust}). They'll believe you.`);
    } else if (npc.trust < -50) {
      reminders.push(`${npc.name} DISTRUSTS you (${npc.trust}). They won't believe you.`);
    }

    // Debt
    if (npc.debt > 0) {
      reminders.push(`${npc.name} OWES you a favor (value: ${npc.debt}). They know it.`);
    } else if (npc.debt < 0) {
      reminders.push(`You OWE ${npc.name} a favor (value: ${Math.abs(npc.debt)}). They'll collect.`);
    }

    // Recent betrayal
    const recentBetrayals = memories.filter(m => m.event && m.event.includes('betray'));
    if (recentBetrayals.length > 0) {
      reminders.push(`⚡ RECENT: ${npc.name} remembers you betrayed them ${recentBetrayals[0].ageInSessions} sessions ago.`);
    }

    // Unresolved promises
    if (loops.length > 0) {
      loops.forEach(loop => {
        if (loop.pressure === 'critical') {
          reminders.push(`🔥 CRITICAL: ${npc.name} is waiting for you to ${loop.description}. It's overdue.`);
        } else {
          reminders.push(`${npc.name} expects: ${loop.description} (${loop.ageInSessions} sessions since promise)`);
        }
      });
    }

    return reminders;
  }

  /**
   * GENERATE LOOP REMINDER
   */
  generateLoopReminder(loop) {
    const ageText = loop.ageInSessions === 1 ? '1 session' : `${loop.ageInSessions} sessions`;
    
    if (loop.type === 'promise') {
      return `${loop.createdBy} promised to ${loop.description}. That was ${ageText} ago. Status: ${loop.resolved ? 'fulfilled' : 'unfulfilled'}.`;
    }
    
    if (loop.type === 'debt') {
      return `There's an outstanding debt: ${loop.description}. Created ${ageText} ago.`;
    }
    
    if (loop.type === 'revenge') {
      return `A debt of blood: ${loop.description}. ${loop.createdBy} hasn't forgotten.`;
    }
    
    if (loop.type === 'mystery') {
      return `A mystery remains: ${loop.description}. Still unsolved after ${ageText}.`;
    }

    return `Unresolved: ${loop.description}`;
  }

  /**
   * PROACTIVE MEMORY SURFACE
   * 
   * Called at start of each session: "What should the players remember?"
   */
  surfaceSessionOpening(partyLocation = null) {
    const surfaced = {
      immediateThreats: [],
      upcominMoments: [],
      wakeupCalls: [],
      opportunities: []
    };

    // What critical loops are coming due?
    const criticalLoops = this.world.openLoops.filter(l =>
      !l.resolved &&
      (l.pressure === 'critical' || (l.deadline && l.ageInSessions > l.deadline * 0.7))
    );

    surfaced.immediateThreats = criticalLoops.map(loop => ({
      loop: loop,
      days: loop.deadline ? loop.deadline - loop.ageInSessions : 'unknown',
      action: `The ${loop.description} is coming due. You have limited time.`
    }));

    // What autonomous actions happened while you slept?
    const recentAutonomousActions = this.world.events.filter(e =>
      e.type === 'autonomous_action' &&
      e.timestamp > this.world.currentTime - 2
    );

    surfaced.wakeupCalls = recentAutonomousActions.map(e => ({
      actor: this.world.entities.get(e.actor)?.name || e.actor,
      action: e.action,
      consequence: e.consequence
    }));

    // What opportunities are nearby?
    const nearbyLoops = this.world.openLoops.filter(l =>
      !l.resolved &&
      l.pressure === 'medium'
    );

    surfaced.opportunities = nearbyLoops.slice(0, 3);

    return surfaced;
  }

  /**
   * MEMORY TRIGGER (when something reminds party of something else)
   * 
   * Player: "We meet another guard"
   * Engine: "That reminds you: Sergeant Marlow, the first guard you met, is still expecting you..."
   */
  triggerAssociatedMemory(triggerType, triggerEntity) {
    const triggered = [];

    // Find similar entities
    const similar = Array.from(this.world.entities.values()).filter(e =>
      e.type === triggerEntity.type &&
      e.id !== triggerEntity.id
    );

    for (const entity of similar) {
      // Do they have a relationship?
      const rel = this.world.getRelationship(triggerEntity.id, entity.id);
      if (rel && rel.type === 'rival') {
        triggered.push({
          type: 'rival_memory',
          entity: entity,
          reminder: `This ${triggerType} reminds you of ${entity.name}—your old rival.`
        });
      }

      // Do they share goals?
      const sharedGoal = triggerEntity.goals.find(g => entity.goals.includes(g));
      if (sharedGoal) {
        triggered.push({
          type: 'shared_goal',
          entity: entity,
          goal: sharedGoal,
          reminder: `${entity.name} is also pursuing the same goal: ${sharedGoal.text}`
        });
      }
    }

    return triggered;
  }
}

export { MemorySurfacingEngine };
