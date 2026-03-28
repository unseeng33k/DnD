#!/usr/bin/env node

/**
 * Disney-Style Ambiance Agent
 * Emotional storytelling, magical moments, character themes
 */

class DisneyAmbiance {
  constructor() {
    this.emotionalArc = 'wonder'; // wonder, tension, climax, resolution
    this.emotionalHistory = [];
    this.magicMoments = this.loadMagicMoments();
    this.characterThemes = {};
    this.wowFactorUsed = false;
  }

  loadMagicMoments() {
    return {
      wonder: [
        'A sudden breeze carries flower petals across the scene',
        'Fireflies awaken and dance in spiraling patterns',
        'A rainbow appears through the mist',
        'Butterflies emerge from an old cocoon',
        'A deer watches silently from the shadows, unafraid',
        'Crystal formations hum with soft, musical tones',
        'Bioluminescent moss paints the walls in blues and greens',
        'A shooting star streaks across the sky',
        'Ancient statues seem to smile as you pass',
        'The water reflects stars that aren\'t in the sky'
      ],
      tension: [
        'The wind dies suddenly, leaving unnatural silence',
        'Shadows lengthen though the sun hasn\'t moved',
        'A raven caws three times and falls silent',
        'The temperature drops, breath visible',
        'All insects and birds go quiet at once',
        'A distant howl echoes, answered by another',
        'Torches flicker though there\'s no wind',
        'The sound of dripping water becomes rhythmic',
        'Eyes seem to watch from every shadow',
        'A child\'s laughter echoes from nowhere'
      ],
      hope: [
        'A beam of sunlight breaks through the clouds',
        'A small flower grows from cracks in the stone',
        'A bird lands nearby and sings brightly',
        'The scent of fresh bread wafts from somewhere',
        'A rainbow forms in the mist of a waterfall',
        'Fireflies spell out ancient symbols of protection',
        'A friendly face appears in the crowd',
        'The sound of distant bells brings comfort',
        'A warm breeze carries the scent of home',
        'Stars align in a pattern of good fortune'
      ],
      triumph: [
        'Golden light bathes the victorious scene',
        'Music swells from an unseen source',
        'Confetti of flower petals rains down',
        'A majestic beast bows in respect',
        'The very earth seems to celebrate',
        'Rainbows form in every droplet',
        'Statues weep tears of joy',
        'The sun breaks through darkest clouds',
        'All creatures of good cheer together',
        'Magic sparkles in the air like snow'
      ]
    };
  }

  setEmotionalArc(arc) {
    this.emotionalArc = arc;
    this.emotionalHistory.push({
      arc,
      timestamp: new Date().toISOString()
    });
  }

  suggestNextArc() {
    const arcs = ['wonder', 'tension', 'climax', 'resolution'];
    const currentIndex = arcs.indexOf(this.emotionalArc);
    return arcs[(currentIndex + 1) % arcs.length];
  }

  generateMagicMoment(emotion = null) {
    const targetEmotion = emotion || this.emotionalArc;
    const moments = this.magicMoments[targetEmotion] || this.magicMoments.wonder;
    return moments[Math.floor(Math.random() * moments.length)];
  }

  assignCharacterTheme(characterName, themeType) {
    const themes = {
      heroic: 'Bold brass and soaring strings',
      mysterious: 'Flutes and subtle percussion',
      tragic: 'Minor key strings, haunting melody',
      whimsical: 'Light woodwinds, playful rhythm',
      noble: 'French horns and cellos',
      dark: 'Deep brass, discordant strings'
    };
    
    this.characterThemes[characterName] = {
      type: themeType,
      music: themes[themeType] || themes.heroic,
      leitmotif: this.generateLeitmotif(themeType)
    };
  }

  generateLeitmotif(themeType) {
    const motifs = {
      heroic: 'Dum-da-da-DUM! (triumphant)',
      mysterious: 'Hmm-hmm-hmmm... (questioning)',
      tragic: 'Ooh... ooh... (descending)',
      whimsical: 'Deedle-dee-dee! (playful)',
      noble: 'Dum-dum-DUM-dum (regal)',
      dark: 'Dun-dun-DUNNN (ominous)'
    };
    return motifs[themeType] || motifs.heroic;
  }

  playCharacterTheme(characterName, situation = 'normal') {
    const theme = this.characterThemes[characterName];
    if (!theme) return `${characterName} has no theme yet.`;
    
    const variations = {
      normal: theme.leitmotif,
      action: `${theme.leitmotif} (faster, intense)`,
      victory: `${theme.leitmotif} (triumphant, major key)`,
      danger: `${theme.leitmotif} (minor key, urgent)`,
      sad: `${theme.leitmotif} (slow, melancholy)`
    };
    
    return {
      character: characterName,
      theme: theme.music,
      leitmotif: variations[situation] || variations.normal,
      situation
    };
  }

  generateWowFactor(sceneType) {
    if (this.wowFactorUsed) return null; // Only once per session
    this.wowFactorUsed = true;
    
    const wowMoments = {
      entrance: 'The doors open to reveal a cathedral of crystal, light refracting into impossible colors',
      revelation: 'The villain removes their mask - it\'s someone the party trusted all along',
      victory: 'The defeated foe transforms into light, whispering thanks as they fade',
      discovery: 'An ancient library unfolds like a flower, knowledge glowing on every page',
      betrayal: 'The ally\'s shadow grows wrong, revealing their true monstrous form',
      sacrifice: 'A character\'s sacrifice creates a new constellation in the night sky'
    };
    
    return {
      type: sceneType,
      description: wowMoments[sceneType] || wowMoments.entrance,
      music: 'Full orchestra swells',
      lighting: 'Dramatic, golden hour'
    };
  }

  createAnimatedDescription(baseDescription) {
    const animations = [
      'leaves rustling in an unseen breeze',
      'dust motes dancing in shafts of light',
      'water flowing endlessly over ancient stones',
      'shadows slowly shifting as time passes',
      'fog rolling in from unseen depths',
      'candles flickering though there is no wind',
      'moss slowly pulsing with bioluminescence',
      'spiderwebs shimmering with dew'
    ];
    
    const animation = animations[Math.floor(Math.random() * animations.length)];
    return `${baseDescription}\n\n✨ The scene lives and breathes: ${animation}.`;
  }

  generateWhimsicalEncounter() {
    const encounters = [
      {
        creature: 'A talking fox',
        offer: 'Cryptic advice in riddles',
        wants: 'A shiny object in exchange'
      },
      {
        creature: 'A mysterious old woman',
        offer: 'Fortune telling with surprising accuracy',
        wants: 'A story from your past'
      },
      {
        creature: 'A floating lantern',
        offer: 'Leads to hidden treasure',
        wants: 'To be set free from its curse'
      },
      {
        creature: 'A small dragon',
        offer: 'Magical item in exchange for riddles',
        wants: 'Someone to talk to'
      },
      {
        creature: 'A ghost child',
        offer: 'Warning of danger ahead',
        wants: 'Help finding their lost toy'
      }
    ];
    
    return encounters[Math.floor(Math.random() * encounters.length)];
  }

  trackCharacterArc(characterName, hope, progress) {
    if (!this.characterArcs) this.characterArcs = {};
    
    this.characterArcs[characterName] = {
      hope,
      progress,
      lastUpdated: new Date().toISOString()
    };
    
    if (progress >= 100) {
      return {
        complete: true,
        message: `${characterName}'s arc completes! Their hope is realized.`,
        reward: 'Inspiration and a magical blessing'
      };
    }
    
    return {
      complete: false,
      message: `${characterName} is ${progress}% toward their goal: ${hope}`,
      suggestion: this.suggestArcProgression(characterName, hope)
    };
  }

  suggestArcProgression(characterName, hope) {
    const suggestions = [
      `Have ${characterName} find a clue related to ${hope}`,
      `An NPC offers help with ${hope} but needs something first`,
      `${characterName} dreams of ${hope}, revealing new path`,
      `A sacrifice brings ${characterName} closer to ${hope}`,
      `${characterName} discovers they're not alone in wanting ${hope}`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  generateMusicalSting(event) {
    const stings = {
      discovery: '🎵 Ta-da! (bright, ascending)',
      danger: '🎵 Dun-dun-DUN! (ominous)',
      victory: '🎵 Fanfare! (trumpets, triumphant)',
      mystery: '🎵 Hmm-hmm... (questioning, strings)',
      sadness: '🎵 Ooh... (slow, cello)',
      surprise: '🎵 Ba-da-BUM! (percussion hit)',
      magic: '🎵 Sparkle sound (bells, chimes)',
      comedy: '🎵 Boing! (bassoon, silly)'
    };
    
    return stings[event] || stings.discovery;
  }

  createFamilyFriendlyDarkness(baseScene) {
    // Add hope even in darkness
    const hopeElements = [
      'A single candle burns defiantly in the darkness',
      'A child\'s toy lies unbroken - someone escaped',
      'Graffiti shows resistance symbols',
      'A hidden cache of supplies for the oppressed',
      'A message of hope scratched into the wall',
      'Flowers growing where they shouldn\'t survive',
      'The villain\'s motive stems from pain, not pure evil'
    ];
    
    const hope = hopeElements[Math.floor(Math.random() * hopeElements.length)];
    
    return {
      scene: baseDescription,
      darkness: 'Present but not overwhelming',
      hope,
      message: 'Even here, light persists'
    };
  }

  getInteractiveResponse(object, action) {
    const responses = {
      touch: {
        statue: 'It feels warm, almost alive',
        pool: 'Ripples form patterns that almost look like words',
        tree: 'Leaves rustle though there\'s no wind',
        door: 'Ancient hinges sing a musical note',
        book: 'Pages turn to reveal exactly what you need'
      },
      speak: {
        statue: 'Echoes return in a voice not your own',
        darkness: 'Something answers from the shadows',
        animal: 'It seems to understand and responds',
        stone: 'The earth remembers ancient words'
      },
      listen: {
        wind: 'It carries whispers of long ago',
        water: 'A melody hidden in the flow',
        silence: 'Not empty - full of potential',
        fire: 'Crackling stories of the past'
      }
    };
    
    return responses[action]?.[object] || 'The world responds to your presence.';
  }

  printStatus() {
    console.log('\n🎭 DISNEY AMBIANCE AGENT\n');
    console.log(`Current Arc: ${this.emotionalArc}`);
    console.log(`Suggested Next: ${this.suggestNextArc()}`);
    console.log(`Magic Moment: ${this.generateMagicMoment()}`);
    console.log(`Wow Factor Available: ${!this.wowFactorUsed}`);
    
    if (Object.keys(this.characterThemes).length > 0) {
      console.log('\nCharacter Themes:');
      for (const [name, theme] of Object.entries(this.characterThemes)) {
        console.log(`  ${name}: ${theme.type} - ${theme.music}`);
      }
    }
  }
}

module.exports = DisneyAmbiance;
