#!/usr/bin/env node

/**
 * CINEMATIC ADVENTURE ENGINE
 * 
 * Makes D&D visceral, cinematic, and unforgettable.
 * 
 * Inspired by:
 * - Akira Kurosawa: Depth of field, tension, shadow/light contrast
 * - Walt Disney: Emotional beats, story structure, character arcs
 * - Studio Ghibli: Atmosphere, wonder, sensory detail, quiet moments
 * 
 * This system transforms mechanics into EXPERIENCE.
 */

class CinematicNarrative {
  constructor(memory) {
    this.memory = memory;
    this.currentScene = null;
    this.atmosphere = null;
    this.emotionalBeat = null;
  }

  /**
   * KUROSAWA: Deep Focus Cinematography
   * Show foreground, middle ground, background with depth
   */
  buildSceneWithDepth(location, immediate, middle, distant) {
    return {
      foreground: {
        description: immediate,
        tension: 'high', // What's closest is most threatening/interesting
        focus: true
      },
      midground: {
        description: middle,
        tension: 'medium',
        details: 'secondary action'
      },
      background: {
        description: distant,
        tension: 'atmospheric',
        purpose: 'dread / wonder / mystery'
      },
      lighting: 'Natural progression creates depth', // Kurosawa would approve
      composition: 'Diagonal lines draw eye through scene'
    };
  }

  /**
   * DISNEY: Three-Act Emotional Structure
   * Setup → Confrontation → Resolution with CHARACTER growth
   */
  structureEmotionalBeat(act, beat, characterEffect) {
    const beats = {
      setup: {
        description: 'Establish stakes and character motivation',
        example: 'Ireena reveals she\'s dying of Strahd\'s curse',
        playerFeeling: 'concern, obligation, urgency'
      },
      confrontation: {
        description: 'Character faces what they\'re afraid of',
        example: 'Strahd appears, offers to spare Ireena if Malice surrenders',
        playerFeeling: 'tension, impossible choice, desperation'
      },
      resolution: {
        description: 'Character grows or falls - consequence is REAL',
        example: 'Character makes choice, world changes because of it',
        playerFeeling: 'triumph, regret, transformation, catharsis'
      }
    };

    return {
      act,
      beat: beats[beat],
      characterEffect,
      dramaticWeight: 'This moment matters. Players will remember it.'
    };
  }

  /**
   * GHIBLI: Sensory Immersion - All Five Senses
   */
  immersiveSenses(scene) {
    return {
      visual: {
        color: 'Deep purples and blacks with crimson accents',
        lighting: 'Torchlight flickers, creating dancing shadows',
        composition: 'The castle dominates - players are tiny',
        symbolism: 'Gothic beauty mixed with decay'
      },
      auditory: {
        ambient: 'Wind howling through cracks in stone',
        presence: 'Distant screams (never close enough to identify)',
        heartbeat: 'Low bass rumble underlies everything (dread)',
        music: 'Orchestral, minor key, builds toward crescendo'
      },
      olfactory: {
        primary: 'Mold and decay',
        secondary: 'Incense burned to mask the rot',
        trigger: 'Occasional whiff of copper (blood)',
        psychological: 'Smell triggers primal fear'
      },
      tactile: {
        temperature: 'Bone-chilling cold from stone',
        texture: 'Wet walls, moss-covered surfaces',
        physical: 'Cold air on exposed skin',
        discomfort: 'Bodies ache from the chill'
      },
      gustatory: {
        primary: 'Metallic taste (fear, blood in air)',
        secondary: 'Dust and old stone',
        psychological: 'Taste makes danger feel REAL'
      }
    };
  }

  /**
   * KUROSAWA: Silence as Tension
   * Empty space = power. Not every moment needs sound/action.
   */
  silentTension(duration_seconds = 10) {
    return {
      description: 'A beat of complete silence falls over the scene',
      purpose: 'Let players feel the weight of what just happened',
      effect: 'More powerful than any description',
      actionItems: [
        'Strahd just offered the deal. Party doesn\'t respond.',
        'Seconds stretch like hours.',
        '10 seconds of silence at the table.',
        'Then: "What do you do?"'
      ],
      result: 'Players will remember this more than any combat'
    };
  }

  /**
   * DISNEY: Character Arc Tracking
   * How is each character CHANGING through this adventure?
   */
  trackCharacterGrowth(characterName, startingTrait, currentTrait, nextTest) {
    return {
      character: characterName,
      arc: {
        start: startingTrait, // "Malice: cynical rogue, trusts no one"
        current: currentTrait, // "Malice: beginning to trust her companions"
        direction: currentTrait.length > startingTrait.length ? 'deepening' : 'challenged'
      },
      nextTest: nextTest, // "Will she trust Theron with her life?"
      consequence: 'If she fails this test, her arc reverses'
    };
  }

  /**
   * GHIBLI: Quiet Moments of Beauty
   * Not every scene is action. Rest scenes are STORY too.
   */
  quietMoment(location, characters, activity) {
    return {
      type: 'quiet moment - story happens in stillness',
      location,
      characters,
      activity, // "Preparing a meal", "Watching the sunset", "Grieving"
      narrative: {
        noPressure: 'No combat, no danger, no time limit',
        characterFocus: 'This is where bonds form, secrets emerge',
        emotionalTone: 'Bittersweet, hopeful, or melancholic'
      },
      example: {
        scene: 'Evening in the tavern. Grond is sharpening his sword.',
        moment: 'Malice sits across from him in silence for 5 minutes.',
        revelation: 'She talks about losing her family. First time.',
        impact: 'That conversation changes everything that follows.'
      }
    };
  }

  /**
   * KUROSAWA: Composition Rules
   * How to frame each moment for maximum impact
   */
  composeScene(rule) {
    const rules = {
      rule_of_thirds: 'Important elements at intersections, not center',
      depth_layering: 'Multiple planes of action - foreground, mid, back',
      leading_lines: 'Roads, walls, shadows draw eye through scene',
      framing_elements: 'Trees, doors, archways frame what matters',
      negative_space: 'Emptiness is as important as what fills it',
      symmetry_breaking: 'Perfect symmetry is unsettling; good for horror',
      vignetting: 'Shadows at edges pull focus to center'
    };

    return {
      principle: rule,
      description: rules[rule],
      application: 'Use in scene description to guide player FOCUS',
      example: 'Strahd stands centered in his throne room, but the camera pulls back to show the MASSIVE empty space around him - he\'s alone, isolated by his own power'
    };
  }

  /**
   * DISNEY + KUROSAWA: The Beat
   * The moment before something huge happens.
   */
  theBeat(whatJustHappened, whatIsAboutToHappen) {
    return {
      dramaticMoment: true,
      description: 'After the action stops, before the consequence hits',
      current: whatJustHappened,
      incoming: whatIsAboutToHappen,
      narrativeSpace: 'DM pauses. Nobody speaks. Players feel it.',
      guidanceForDM: {
        duration: '3-10 seconds of real time silence',
        purpose: 'Let weight of moment sink in',
        effect: 'Creates MEMORY. Players will talk about this moment for years.'
      },
      examples: [
        'Malice pulls the dagger from the vampire spawn. Blood drips. Silence. Then distant screams from deeper in the castle.',
        'Party offers Strahd a bargain. He smiles. One second. Two seconds. Then: "I accept... but understand the PRICE."',
        'Ireena falls. The party watches her fall. No one reacts yet. Then chaos.'
      ]
    };
  }
}

/**
 * VISCERAL COMBAT SYSTEM
 * Combat isn't just mechanics - it's PHYSICAL, EXHAUSTING, TERRIFYING
 */
class ViscerralCombat {
  constructor(memory) {
    this.memory = memory;
  }

  /**
   * Before combat even starts, build DREAD
   */
  buildDreadBeforeCombat(enemy, partySize) {
    return {
      phase: 'pre-combat',
      purpose: 'Create fear BEFORE initiative rolls',
      stages: [
        {
          stage: 'Awareness',
          description: `The party becomes aware of ${enemy.name}. What do they FEEL?`,
          sensory: enemy.senorryPresence, // See them, hear them, smell them
          psychology: 'Fight or flight response triggers'
        },
        {
          stage: 'Recognition',
          description: `They realize the danger. How outmatched are they?`,
          comparison: `Party: ${partySize} adventurers. Enemy: ${enemy.name} (CR ${enemy.cr})`,
          emotional: 'Dread solidifies into REAL fear'
        },
        {
          stage: 'Choice',
          description: 'Fight, flee, negotiate, or surrender?',
          consequence: 'This choice shapes the entire encounter',
          memory: 'Party will remember this decision point forever'
        }
      ]
    };
  }

  /**
   * Combat rounds as CHOREOGRAPHY
   * Not just dice rolls - physical movement, positioning, exhaustion
   */
  describeRound(roundNum, actions, environmental) {
    return {
      round: roundNum,
      narrative: {
        opening: `ROUND ${roundNum}: Initiative count ${20 - roundNum + 1}`,
        pacing: 'Time slows. Each action lasts seconds but feels eternal.'
      },
      actions: actions.map((action, index) => ({
        order: index + 1,
        actor: action.actor,
        action: action.description,
        // Choreograph the ACTION
        cinematography: {
          cameraAngle: action.cinematic_angle || 'Over-the-shoulder',
          movement: action.physical_movement,
          impact: action.sensory_consequence // Sound of blow, spray of blood, etc
        }
      })),
      environmental: {
        elements: environmental,
        changes: 'Environment shifts as combat evolves',
        usefulness: 'Rubble to hide behind, pillars to break, chandeliers to fall'
      }
    };
  }

  /**
   * Injury = CONSEQUENCE
   * Not "you take 8 damage". It's "your shoulder dislocates from the 400-lb vampire's grip"
   */
  describeInjury(character, damage, damageType, source) {
    const injuries = {
      crushing: [
        `${character.name} feels ribs cracking inward`,
        `Breath becomes fire. Each inhale agony`,
        `Vision blurs from pain shock`
      ],
      slashing: [
        `Blood floods their vision - the cut is DEEP`,
        `They feel the wind on exposed muscle`,
        `Each movement pulls the wound open`
      ],
      piercing: [
        `The blade enters clean. Pulls out messy`,
        `Something VITAL feels punctured`,
        `Breathing becomes labored`
      ],
      necrotic: [
        `Flesh ROTS before their eyes. They watch it decay.`,
        `Smell their own putrefaction`,
        `Existential terror: "Will I become undead?"`,
      ],
      psychic: [
        `Reality fractures. Up becomes down.`,
        `They hear voices that aren't there`,
        `Consciousness fragments`
      ]
    };

    return {
      character,
      damage,
      mechanics: `${damage} damage, ${character.currentHP - damage} HP remaining`,
      narrative: injuries[damageType] ? injuries[damageType][Math.floor(Math.random() * injuries[damageType].length)] : 'Severe pain',
      consequence: {
        mechanical: `CON save or ${character.name} is vulnerable`,
        narrative: 'Pain is a distraction. Next action is harder.',
        psychological: 'The party watches their friend suffer in REAL time'
      }
    };
  }

  /**
   * Death = FINALITY
   * When a character dies, it's not a stat. It's the END of their story.
   */
  handleDeath(character, killer, lastWords) {
    return {
      character,
      killer,
      finality: 'This is REAL. No resurrection without consequence.',
      moment: {
        physical: `${character.name} falls. Blood pools. Breath stops.`,
        emotional: `The party watches. Helpless.`,
        silence: 'The table goes quiet. Someone cries.'
      },
      lastWords,
      narrative: {
        arc: 'This character\'s story is OVER',
        partyResponse: 'Everyone else\'s story now includes this death',
        consequence: 'Revenge? Grief? Suicidal charge? Surrender?'
      },
      memorial: {
        suggestion: 'Let the party take time to mourn. IN CHARACTER.',
        time: 'Real silence at the table. 2-3 minutes.',
        purpose: 'This death will haunt them for the rest of the campaign'
      }
    };
  }
}

/**
 * NARRATIVE MOMENTUM
 * Every scene should push toward CLIMAX
 */
class NarrativeMomentum {
  constructor(memory) {
    this.memory = memory;
    this.acts = {
      inciting: [],
      rising: [],
      climax: null,
      falling: [],
      resolution: []
    };
  }

  /**
   * Track story momentum
   * Sagging? Add complications. Peaking? Drive toward resolution.
   */
  assessMomentum(sessionNumber, eventsThisSession) {
    const momentum = eventsThisSession.length;
    const intensity = eventsThisSession.reduce((sum, e) => sum + (e.emotionalWeight || 0), 0) / eventsThisSession.length;

    return {
      sessions: sessionNumber,
      eventCount: momentum,
      averageIntensity: intensity,
      diagnosis: intensity < 5 ? 'SAGGING - Add complications' :
                 intensity > 8 ? 'PEAKING - Drive toward resolution' :
                 'BALANCED - Good pacing',
      recommendation: intensity < 5 ? 'Introduce a new threat. Complicate the mission.' :
                      intensity > 8 ? 'The climax is close. Build toward final confrontation.' :
                      'Develop character moments. Let players breathe between action.'
    };
  }

  /**
   * Three-Act Structure Guide
   */
  guideActStructure(currentAct) {
    const structure = {
      act1: {
        goal: 'Hook the players. Make them CARE.',
        duration: 'Sessions 1-10',
        milestones: ['Meet Ireena', 'Encounter Strahd', 'Understand the curse'],
        emotional: 'Wonder turning to dread',
        endingPoint: 'Party knows they\'re trapped. Can\'t leave Barovia.'
      },
      act2: {
        goal: 'Test everything. Make them SUFFER.',
        duration: 'Sessions 11-40',
        milestones: ['Explore Barovia', 'Face horrors', 'Lose something important'],
        emotional: 'Despair, determination, grief',
        endingPoint: 'Party finds the Heart of Sorrow. Knows how to win.'
      },
      act3: {
        goal: 'Final confrontation. REMEMBER THIS FOREVER.',
        duration: 'Sessions 41+',
        milestones: ['Assault on Ravenloft', 'Face Strahd', 'Break the curse or become it'],
        emotional: 'Epic, cathartic, bittersweet',
        endingPoint: 'The curse is broken. Barovia is free. But the cost...'
      }
    };

    return {
      act: currentAct,
      guidance: structure[currentAct],
      reminder: 'You are not just playing D&D. You are creating MYTH.'
    };
  }
}

export { CinematicNarrative, ViscerralCombat, NarrativeMomentum };
