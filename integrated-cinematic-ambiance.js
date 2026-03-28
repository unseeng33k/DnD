#!/usr/bin/env node

/**
 * INTEGRATED CINEMATIC AMBIANCE SYSTEM
 * 
 * BRIDGES cinematic-engine.js and session-ambiance-orchestrator.js
 * 
 * Before: Cinematic engine = narrative guidance
 *         Ambiance orchestrator = images/music/atmosphere
 *         NO CONNECTION = fragmented experience
 * 
 * After: Every narrative beat TRIGGERS sensory delivery
 *        Every image/music REINFORCES emotional beat
 *        Every scene ORCHESTRATES all senses at once
 * 
 * The difference: It's the difference between reading a description
 * and EXPERIENCING it with your whole being.
 */

import { CinematicNarrative, ViscerralCombat, NarrativeMomentum } from './cinematic-engine.js';
import { SessionAmbiance } from './session-ambiance-orchestrator.js';

/**
 * CINEMATIC BEAT - Links narrative to sensory experience
 * When DM describes something, this triggers ALL associated sensory elements
 */
class CinematicBeat {
  constructor(cinematicEngine, ambianceEngine) {
    this.cinema = cinematicEngine; // Narrative guidance
    this.ambiance = ambianceEngine; // Sensory delivery
  }

  /**
   * MOMENT 1: DM narrates a scene
   * System automatically triggers matching ambiance
   * 
   * Example:
   *   DM: "You approach Castle Ravenloft at sunset..."
   *   System: (automatically)
   *   - Loads castle image
   *   - Starts gothic music
   *   - Delivers sensory data (cold stone, fading light, dread)
   *   - Sends to Telegram with full atmospheric context
   */
  async deliverScene(sceneKey, narrativeDescription) {
    // 1. GET narrative guidance from cinematic engine
    const narrativeGuidance = this.cinema.buildSceneWithDepth(
      sceneKey,
      narrativeDescription.foreground || 'You see...',
      narrativeDescription.midground || 'Behind that...',
      narrativeDescription.background || 'In the distance...'
    );

    // 2. GET sensory data from cinematic engine
    const sensoryLayer = this.cinema.immersiveSenses(sceneKey);

    // 3. TRIGGER ambiance orchestrator with full context
    const ambianceResult = await this.ambiance.startScene(sceneKey);

    if (!ambianceResult.success) {
      return { error: 'Failed to load scene ambiance' };
    }

    // 4. MERGE everything into unified experience
    const integratedScene = {
      narrative: narrativeGuidance,
      sensory: sensoryLayer,
      imageFile: ambianceResult.imageFile,
      musicLink: ambianceResult.musicLink,
      musicTitle: ambianceResult.musicTitle,
      deliveryMethod: 'unified cinematic experience'
    };

    // 5. DELIVER to DM and players
    return this.formatForDelivery(integratedScene);
  }

  /**
   * MOMENT 2: Combat starts
   * Cinematic engine provides choreography
   * Ambiance engine delivers sensory combat experience
   */
  async deliverCombatRound(roundNum, enemyName, actions, environmental) {
    // 1. GET cinematic choreography from combat engine
    const combatChoreography = this.cinema.describeRound(
      roundNum,
      actions.map(a => ({
        actor: a.actor,
        description: a.description,
        cinematic_angle: this.getCinematicAngle(a.type),
        physical_movement: a.movement || 'standard attack',
        sensory_consequence: this.getSensoryConsequence(a.type, a.damage)
      })),
      environmental
    );

    // 2. GET sensory combat details
    const combatSensory = {
      sounds: this.getCombatSounds(roundNum, actions, enemyName),
      smells: this.getCombatSmells(roundNum, actions),
      tactile: this.getCombatTactile(roundNum, actions),
      visual: this.getCombatVisual(roundNum, enemyName)
    };

    // 3. MERGE choreography + sensory into combat experience
    const integratedCombat = {
      round: roundNum,
      cinematicChoreography: combatChoreography,
      sensoryCombat: combatSensory,
      timing: `Round ${roundNum}: ${actions.length} actions, approx ${actions.length * 6} seconds elapsed`
    };

    return integratedCombat;
  }

  /**
   * MOMENT 3: Injury happens
   * Cinematic engine describes it viscerally
   * Ambiance engine triggers sensory response
   */
  async deliverInjury(character, damage, damageType, source) {
    // 1. GET cinematic injury description
    const injuryNarrative = this.cinema.describeInjury(character, damage, damageType, source);

    // 2. GET sensory response to injury
    const injurySensory = {
      sound: this.getInjurySound(damageType, damage),
      smell: this.getInjurySmell(damageType),
      visual: this.getInjuryVisual(damageType, character.name),
      tactile: this.getInjuryTactile(damageType)
    };

    // 3. COMBINE into unified injury moment
    const integratedInjury = {
      character: character.name,
      damage,
      damageType,
      narrative: injuryNarrative.narrative,
      sensory: injurySensory,
      consequence: injuryNarrative.consequence,
      playerExperience: 'visceral, immediate, unforgettable'
    };

    return integratedInjury;
  }

  /**
   * MOMENT 4: Death
   * The most cinematic moment of all
   */
  async deliverDeath(character, killer, lastWords) {
    // 1. GET cinematic death moment
    const deathNarrative = this.cinema.handleDeath(character, killer, lastWords);

    // 2. GET silence as sound design
    const deathSensory = {
      beforeDeath: {
        sound: 'Everything suddenly QUIET',
        visual: 'Time slows. World goes gray.',
        duration: '2-3 seconds of real silence'
      },
      deathMoment: {
        sound: 'Final breath. Nothing else.',
        smell: 'Copper and fear',
        visual: 'Body crumples',
        tactile: 'Cold settles over the table'
      },
      afterDeath: {
        sound: 'Absolute silence at the table',
        duration: '10-30 seconds of real time',
        purpose: 'Let it sink in. This is REAL.'
      }
    };

    // 3. COMBINE into THE moment that defines the campaign
    const integratedDeath = {
      character: character.name,
      killer,
      lastWords,
      narrative: deathNarrative,
      sensory: deathSensory,
      emotional_impact: 'Catastrophic. Campaign changes forever.',
      memorial_guidance: 'Let table go silent. Let people grieve. This matters.'
    };

    return integratedDeath;
  }

  /**
   * MOMENT 5: The Beat (silence as power)
   * Most important: NOTHING happens, but everything changes
   */
  async deliverTheBeat(whatJustHappened, whatIsAboutToHappen) {
    // 1. GET narrative beat from cinematic engine
    const beatNarrative = this.cinema.theBeat(whatJustHappened, whatIsAboutToHappen);

    // 2. SENSORY: Silence and tension
    const beatSensory = {
      sound: 'Complete silence',
      duration: '3-10 seconds of real time',
      purpose: 'Let weight of moment sink in',
      psychological: 'Anticipation, dread, wonder',
      physicality: 'Players hold breath, eyes on DM',
      purpose_deep: 'Creates MEMORY. This becomes legendary.'
    };

    // 3. INTEGRATE into the most powerful moment in D&D
    const integratedBeat = {
      current: whatJustHappened,
      incoming: whatIsAboutToHappen,
      narrative: beatNarrative,
      sensory: beatSensory,
      guidance: 'Do NOT fill the silence. Let it be. Count to 10 in your head. Then continue.',
      impact: 'Players will talk about THIS EXACT MOMENT for years'
    };

    return integratedBeat;
  }

  /**
   * HELPER: Get cinematic camera angle for action
   */
  getCinematicAngle(actionType) {
    const angles = {
      'attack': 'Over-the-shoulder, slow-motion',
      'spell': 'Wide shot showing spell effect area',
      'dodge': 'Quick cut to multiple perspectives',
      'damage': 'Close-up on point of impact',
      'defend': 'Behind character, threat approaching',
      'special': 'Dramatic angle emphasizing uniqueness'
    };
    return angles[actionType] || 'Dynamic, following action';
  }

  /**
   * HELPER: Get sensory consequence of action
   */
  getSensoryConsequence(actionType, damage) {
    const consequences = {
      'attack': `Sound of impact. Smell of blood. Heat from exertion.`,
      'spell': `Magical hum. Ozone smell. Flash of energy.`,
      'dodge': `Wind of near-miss. Relief. Adrenaline.`,
      'damage': `Pain sensation. Smell of injury. Shock.`,
      'defend': `Vibration up arm from block. Strain. Focus.`,
      'special': `Intense: all senses simultaneously affected`
    };
    return consequences[actionType] || 'Sensory impact of action';
  }

  /**
   * HELPER: Combat sounds
   */
  getCombatSounds(roundNum, actions, enemyName) {
    const sounds = [
      'Metal clashing with metal',
      'Grunts of effort',
      'Footsteps moving across ground',
      `${enemyName}'s roar/cry`,
      'Magic crackling',
      'Objects breaking',
      'Heavy breathing'
    ];
    return sounds.join('. ') + '. All layered, building intensity.';
  }

  /**
   * HELPER: Combat smells
   */
  getCombatSmells(roundNum, actions) {
    return 'Blood. Sweat. Fear. Dust. Sometimes sulfur/ozone if magic involved.';
  }

  /**
   * HELPER: Combat tactile
   */
  getCombatTactile(roundNum, actions) {
    return 'Vibration in ground from impacts. Heat from exertion. Cold from fear. Texture of weapons.';
  }

  /**
   * HELPER: Combat visual
   */
  getCombatVisual(roundNum, enemyName) {
    return `Everything moves at combat speed. ${enemyName} is the focal point. Environment shifts as battle evolves.`;
  }

  /**
   * HELPER: Injury sounds
   */
  getInjurySound(damageType, damage) {
    const sounds = {
      'crushing': 'Wet crunch. Gasp of pain.',
      'slashing': 'Sound of tearing. Hiss of pain through teeth.',
      'piercing': 'Shick. Deep grunt.',
      'necrotic': 'Sickening squelch. Scream.',
      'psychic': 'No sound. Worse: silence of shock.'
    };
    return sounds[damageType] || 'Sound of impact and pain';
  }

  /**
   * HELPER: Injury smells
   */
  getInjurySmell(damageType) {
    const smells = {
      'crushing': 'Iron and pain',
      'slashing': 'Blood, fear-sweat',
      'piercing': 'Copper, organ',
      'necrotic': 'Rot, decay, existential dread',
      'psychic': 'Ozone, the smell of madness'
    };
    return smells[damageType] || 'Blood and fear';
  }

  /**
   * HELPER: Injury visual
   */
  getInjuryVisual(damageType, characterName) {
    const visuals = {
      'crushing': `${characterName} collapses, body deformed`,
      'slashing': `Blood floods the air. Gaping wound.`,
      'piercing': `Weapon enters, exits. Blood follows.`,
      'necrotic': `Flesh ROTS. Visible decay spreading.`,
      'psychic': `${characterName} convulses. Eyes roll back. No visible wound, but worse.`
    };
    return visuals[damageType] || 'Visible injury, clear pain';
  }

  /**
   * HELPER: Injury tactile
   */
  getInjuryTactile(damageType) {
    return 'Pain sharp enough to distract. Dull ache of trauma. Numbness from shock.';
  }

  /**
   * FORMAT for delivery to table
   */
  formatForDelivery(integratedScene) {
    return {
      ...integratedScene,
      instructions: {
        toOtherPlayers: 'Everyone looks at this. Everyone feels this.',
        toPlayers: 'You are HERE. Your senses overwhelmed with THIS.',
        timeToDeliver: 'Deliver in one sustained moment, not fragments'
      }
    };
  }
}

/**
 * INTEGRATION MANAGER
 * Brings everything together into a UNIFIED experience
 */
class IntegratedCinematicAmbiance {
  constructor(cinematicEngine, ambianceEngine, memory, combat) {
    this.cinema = cinematicEngine;
    this.ambiance = ambianceEngine;
    this.memory = memory;
    this.combat = combat;
    this.beat = new CinematicBeat(cinematicEngine, ambianceEngine);
  }

  /**
   * Main entry point: Scene delivery
   */
  async scene(sceneKey, description) {
    return this.beat.deliverScene(sceneKey, description);
  }

  /**
   * Combat round with full cinematic integration
   */
  async combatRound(roundNum, enemyName, actions, environmental) {
    return this.beat.deliverCombatRound(roundNum, enemyName, actions, environmental);
  }

  /**
   * Injury with cinematic impact
   */
  async injury(character, damage, damageType, source) {
    return this.beat.deliverInjury(character, damage, damageType, source);
  }

  /**
   * Death - the ultimate cinematic moment
   */
  async death(character, killer, lastWords) {
    return this.beat.deliverDeath(character, killer, lastWords);
  }

  /**
   * The Beat - silence as power
   */
  async theBeat(whatJustHappened, whatIsAboutToHappen) {
    return this.beat.deliverTheBeat(whatJustHappened, whatIsAboutToHappen);
  }

  /**
   * Scene with quiet moment (Ghibli principle)
   */
  async quietMoment(sceneKey, characters, activity) {
    const scene = await this.ambiance.startScene(sceneKey);
    const narrative = this.cinema.quietMoment(sceneKey, characters, activity);

    return {
      scene: scene.imageFile,
      narrative,
      guidance: 'This moment has no pressure. Let it breathe. Let characters connect.',
      value: 'More important than combat: this is where bonds form'
    };
  }

  /**
   * Character arc moment - links narrative progression to sensory experience
   */
  async characterArcMoment(character, arcData, sceneKey) {
    const scene = await this.ambiance.startScene(sceneKey);
    const arcTracking = this.cinema.trackCharacterGrowth(
      character,
      arcData.startingTrait,
      arcData.currentTrait,
      arcData.nextTest
    );

    return {
      character,
      arc: arcTracking,
      scene: scene.imageFile,
      guidance: 'This moment defines who they ARE BECOMING',
      emotional_weight: 'This arc decision will echo through rest of campaign'
    };
  }
}

export { IntegratedCinematicAmbiance, CinematicBeat };
