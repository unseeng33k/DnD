#!/usr/bin/env node

/**
 * CHARACTER PERSONALITY SYSTEM
 * 
 * Makes each character feel ALIVE with distinct personality,
 * speech patterns, goals, fears, and evolution over time.
 * 
 * This is what transforms a stat block into a CHARACTER.
 */

class CharacterPersonality {
  constructor(characterData) {
    this.name = characterData.name;
    this.class = characterData.class;
    this.level = characterData.level;

    // ARCHETYPE: How character fits in the party
    this.archetype = characterData.archetype || 'undefined';
    // 'leader', 'support', 'wildcard', 'heart', 'brain', 'muscle'

    // PERSONALITY TRAITS (1-10 scale)
    this.traits = {
      openness: characterData.traits?.openness || 5,
      aggressiveness: characterData.traits?.aggressiveness || 5,
      humor: characterData.traits?.humor || 'dry',
      riskTolerance: characterData.traits?.riskTolerance || 5,
      compassion: characterData.traits?.compassion || 5,
      caution: characterData.traits?.caution || 5,
      honesty: characterData.traits?.honesty || 5
    };

    // VOICE & SPEECH PATTERNS
    this.voice = {
      dialect: characterData.voice?.dialect || 'neutral',
      mannerisms: characterData.voice?.mannerisms || [],
      catchphrases: characterData.voice?.catchphrases || [],
      vocabulary: characterData.voice?.vocabulary || 'casual',
      speed: characterData.voice?.speed || 'measured',
      tone: characterData.voice?.tone || 'neutral'
    };

    // MOTIVATIONS & GOALS
    this.motivations = {
      primary: characterData.motivations?.primary,
      secondary: characterData.motivations?.secondary || [],
      hidden: characterData.motivations?.hidden
    };

    // FEARS & TRIGGERS
    this.fears = characterData.fears || [];
    this.angers = characterData.angers || [];
    this.saddens = characterData.saddens || [];
    this.disgusts = characterData.disgusts || [];

    // RELATIONSHIPS
    this.relationshipStyles = {
      toAuthority: characterData.relationshipStyles?.toAuthority || 'neutral',
      toLowerClasses: characterData.relationshipStyles?.toLowerClasses || 'neutral',
      toOppositeGender: characterData.relationshipStyles?.toOppositeGender || 'neutral',
      toMagic: characterData.relationshipStyles?.toMagic || 'neutral',
      toDeath: characterData.relationshipStyles?.toDeath || 'fearful'
    };

    // CHARACTER ARC
    this.arc = {
      startingTrait: characterData.arc?.startingTrait,
      currentTrait: characterData.arc?.currentTrait || characterData.arc?.startingTrait,
      nextTest: characterData.arc?.nextTest,
      completionPoint: characterData.arc?.completionPoint,
      evolution: []
    };

    // BELIEFS & VALUES
    this.beliefs = characterData.beliefs || [];
    this.codes = characterData.codes || [];
    this.secrets = characterData.secrets || [];

    // MEMORY & LEARNING
    this.memory = {
      importantEvents: [],
      lessons: [],
      trusts: [],
      betrayals: []
    };
  }

  /**
   * Generate dialogue based on personality and situation
   */
  speak(situation, emotionalState = 'neutral') {
    let response = this.buildResponse(situation, emotionalState);
    response = this.applySpeechPattern(response);
    return response;
  }

  /**
   * Build response based on personality traits
   */
  buildResponse(situation, emotionalState) {
    const scripts = {
      greeting: {
        reserved: 'Greetings.',
        open: 'Hey there! How goes it?',
        formal: 'A pleasure to make your acquaintance.',
        street: 'Yo, what\'s up?'
      },
      discovery: {
        cautious: 'Hmm. Something feels off about this.',
        curious: 'Fascinating! Let\'s investigate further.',
        suspicious: 'I don\'t trust this one bit.',
        nonchalant: 'Whatever. Let\'s move on.'
      },
      danger: {
        brave: 'Let\'s face this head-on.',
        cautious: 'I\'m not sure about this...',
        cowardly: 'We should get out of here NOW.',
        calculated: 'This is risky. But I see the play.'
      },
      loss: {
        compassionate: 'I\'m so sorry. That\'s... that\'s awful.',
        stoic: 'Death comes for us all.',
        angry: 'This is unforgivable!',
        selfInterested: 'Well, that complicates things.'
      }
    };

    const openness = this.traits.openness > 7 ? 'open' : this.traits.openness < 3 ? 'reserved' : 'neutral';
    const archetype = this.archetype;

    return scripts[situation]?.[emotionalState] || scripts[situation]?.['neutral'] || '...';
  }

  /**
   * Apply speech pattern to response
   */
  applySpeechPattern(baseResponse) {
    let response = baseResponse;

    // Add mannerisms
    if (this.voice.mannerisms.length > 0) {
      const mannerism = this.voice.mannerisms[Math.floor(Math.random() * this.voice.mannerisms.length)];
      response = `[${mannerism}] ${response}`;
    }

    // Add catchphrase sometimes
    if (Math.random() < 0.3 && this.voice.catchphrases.length > 0) {
      const catchphrase = this.voice.catchphrases[Math.floor(Math.random() * this.voice.catchphrases.length)];
      response = `${response} ${catchphrase}`;
    }

    return response;
  }

  /**
   * Determine if character would agree with proposal
   */
  wouldAgreeWith(proposal) {
    let alignmentScore = 0;

    // Risk preference
    if (proposal.riskLevel > 7 && this.traits.riskTolerance > 6) alignmentScore += 2;
    if (proposal.riskLevel > 7 && this.traits.riskTolerance < 4) alignmentScore -= 2;

    // Helps others
    if (proposal.helpsWeaklings && this.traits.compassion > 7) alignmentScore += 2;
    if (proposal.helpsWeaklings && this.traits.compassion < 3) alignmentScore -= 1;

    // Moral alignment
    if (proposal.moral && this.traits.honesty > 7) alignmentScore += 1;
    if (!proposal.moral && this.traits.honesty < 3) alignmentScore += 1;

    // Check motivations
    if (this.motivations.primary === proposal.goal) alignmentScore += 3;
    if (this.fears.some(f => proposal.involves?.includes(f))) alignmentScore -= 2;

    return {
      agrees: alignmentScore > 0,
      confidence: Math.abs(alignmentScore),
      reasoning: this.motivations.primary,
      likelyResponse: this.speak(proposal.situation || 'decision', alignmentScore > 0 ? 'agree' : 'disagree')
    };
  }

  /**
   * How character reacts to events
   */
  reactTo(event) {
    if (this.fears.includes(event.type)) {
      return { reaction: 'fear', intensity: 'high', visible: true };
    }
    if (this.angers.includes(event.type)) {
      return { reaction: 'anger', intensity: 'high', visible: true };
    }
    if (this.saddens.includes(event.type)) {
      return { reaction: 'sadness', intensity: 'high', visible: true };
    }
    if (this.disgusts.includes(event.type)) {
      return { reaction: 'disgust', intensity: 'high', visible: true };
    }

    // Default reaction based on personality
    if (this.traits.compassion > 7) {
      return { reaction: 'empathy', intensity: 'medium', visible: false };
    }

    return { reaction: 'neutral', intensity: 'low', visible: false };
  }

  /**
   * Character grows/changes over campaign
   */
  growTrait(traitName, direction = 1) {
    if (this.traits[traitName] !== undefined) {
      const newValue = Math.max(1, Math.min(10, this.traits[traitName] + direction));
      this.traits[traitName] = newValue;

      this.arc.evolution.push({
        trait: traitName,
        oldValue: this.traits[traitName],
        newValue,
        timestamp: new Date().toISOString(),
        catalyst: 'Character growth'
      });

      return newValue;
    }
  }

  /**
   * Character learns from experience
   */
  recordExperience(event, lesson) {
    this.memory.importantEvents.push({
      event,
      lesson,
      timestamp: new Date().toISOString()
    });

    this.memory.lessons.push(lesson);

    // Some lessons might affect personality
    if (event.includes('trust')) {
      this.growTrait('compassion', 1);
    }
    if (event.includes('betrayal')) {
      this.growTrait('caution', 1);
    }
  }

  /**
   * Character's trust in someone
   */
  trustLevel(targetName) {
    const trusts = this.memory.trusts.filter(t => t.name === targetName);
    if (trusts.length === 0) return 0;

    const total = trusts.reduce((sum, t) => sum + t.weight, 0);
    return Math.max(-100, Math.min(100, total));
  }

  /**
   * Get personality snapshot
   */
  getSnapshot() {
    return {
      name: this.name,
      class: this.class,
      level: this.level,
      archetype: this.archetype,
      traits: this.traits,
      motivations: this.motivations,
      fears: this.fears,
      arc: {
        startingTrait: this.arc.startingTrait,
        currentTrait: this.arc.currentTrait,
        evolution: this.arc.evolution.length
      },
      memory: {
        importantEvents: this.memory.importantEvents.length,
        lessons: this.memory.lessons.length
      }
    };
  }
}

export { CharacterPersonality };
