#!/usr/bin/env node

/**
 * Ambiance Agent for D&D
 * Generates atmosphere, sensory details, music recommendations, and AI images
 */

const fs = require('fs');
const path = require('path');

// DALL-E integration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

class AmbianceAgent {
  constructor() {
    this.currentScene = null;
    this.currentMood = 'exploration';
    this.scenes = this.loadScenes();
    this.music = this.loadMusic();
  }

  loadScenes() {
    return {
      'dark forest': {
        lighting: 'Dappled moonlight filtering through twisted branches',
        sounds: 'Rustling leaves, snapping twigs, distant howls, hooting owls',
        smells: 'Damp earth, rotting vegetation, pine resin',
        temperature: 'Cool, clammy air that clings to your skin',
        textures: 'Moss-covered bark, slick mud, sharp thorns',
        mood: 'foreboding',
        music: 'dark_forest'
      },
      'ancient temple': {
        lighting: 'Flickering torchlight casting dancing shadows on stone walls',
        sounds: 'Dripping water, distant chanting, stone grinding, echoes',
        smells: 'Incense, dust, old stone, something metallic',
        temperature: 'Cool and dry, with occasional drafts',
        textures: 'Weathered stone, carved reliefs, dust-covered floors',
        mood: 'mysterious',
        music: 'ancient_temple'
      },
      'underground cavern': {
        lighting: 'Bioluminescent fungi casting eerie blue-green glow',
        sounds: 'Water dripping, distant rumbling, bat wings, echoes',
        smells: 'Stagnant water, minerals, damp earth',
        temperature: 'Cold and damp, breath visible',
        textures: 'Slick limestone, sharp stalactites, loose gravel',
        mood: 'claustrophobic',
        music: 'underground'
      },
      'boss battle': {
        lighting: 'Dramatic, shifting shadows, perhaps magical glow',
        sounds: 'Heavy breathing, weapon clashes, heartbeat, ominous music',
        smells: 'Ozone, blood, sweat, fear',
        temperature: 'Hot, adrenaline-fueled',
        textures: 'Trembling ground, scattered debris, tension',
        mood: 'epic',
        music: 'boss_battle'
      },
      'tavern': {
        lighting: 'Warm firelight, smoking oil lamps, cozy shadows',
        sounds: 'Murmured conversations, clinking tankards, laughter, bard playing',
        smells: 'Roasting meat, ale, pipe smoke, wood fire',
        temperature: 'Warm and comfortable',
        textures: 'Worn wooden tables, sticky floors, rough tankards',
        mood: 'cozy',
        music: 'tavern'
      },
      'swamp': {
        lighting: 'Mist-shrouded, dim, filtered through hanging moss',
        sounds: 'Buzzing insects, croaking frogs, bubbling mud, splashing',
        smells: 'Decay, sulfur, stagnant water, vegetation',
        temperature: 'Humid and oppressive',
        textures: 'Sucking mud, cypress knees, sharp reeds',
        mood: 'oppressive',
        music: 'swamp'
      },
      'mountain peak': {
        lighting: 'Bright, clear, wind-swept, perhaps snow glare',
        sounds: 'Howling wind, eagle cries, loose stones falling',
        smells: 'Thin air, ice, clean stone',
        temperature: 'Freezing, biting wind',
        textures: 'Sharp rocks, ice, loose scree',
        mood: 'exposed',
        music: 'mountain'
      },
      'city streets': {
        lighting: 'Lanterns, neon signs, shadows between buildings',
        sounds: 'Footsteps, carriage wheels, distant bells, merchants calling',
        smells: 'Cooking food, horses, refuse, perfume',
        temperature: 'Varies by district and season',
        textures: 'Cobblestones, brick walls, wooden signs',
        mood: 'bustling',
        music: 'city'
      },
      'crypt': {
        lighting: 'Darkness, occasional torch, shadows everywhere',
        sounds: 'Silence, then sudden skittering, stone on stone',
        smells: 'Dust, old bones, preservation herbs, earth',
        temperature: 'Cold, still air that feels heavy',
        textures: 'Smooth stone sarcophagi, dust, cobwebs',
        mood: 'deathly',
        music: 'crypt'
      },
      'wizard tower': {
        lighting: 'Magical glow, floating lights, ever-burning candles',
        sounds: 'Crackling energy, fluttering pages, distant thunder',
        smells: 'Ozone, old books, exotic incense, chemicals',
        temperature: 'Unnaturally controlled, perhaps slightly warm',
        textures: 'Smooth stone, velvet, polished wood, glass',
        mood: 'arcane',
        music: 'wizard_tower'
      }
    };
  }

  loadMusic() {
    return {
      'dark_forest': {
        youtube: [
          { title: 'Dark Forest Ambience', url: 'https://youtube.com/watch?v=8Z3Q3Jd3d3w' },
          { title: 'Haunted Woods', url: 'https://youtube.com/watch?v=4D5E6F7G8H9' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX8Ugs9TgZgU1'
      },
      'ancient_temple': {
        youtube: [
          { title: 'Temple Ambience', url: 'https://youtube.com/watch?v=5E6F7G8H9I0' },
          { title: 'Sacred Ruins', url: 'https://youtube.com/watch?v=6F7G8H9I0J1' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j'
      },
      'combat': {
        youtube: [
          { title: 'Epic Battle Music', url: 'https://youtube.com/watch?v=I0r1J0K3L4' },
          { title: 'Combat Intense', url: 'https://youtube.com/watch?v=J1K2L3M4N5' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo'
      },
      'boss_battle': {
        youtube: [
          { title: 'Boss Battle Epic', url: 'https://youtube.com/watch?v=K2L3M4N5O6' },
          { title: 'Final Boss', url: 'https://youtube.com/watch?v=L3M4N5O6P7' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX8Ugs9TgZgU1'
      },
      'exploration': {
        youtube: [
          { title: 'Exploration Music', url: 'https://youtube.com/watch?v=M4N5O6P7Q8' },
          { title: 'Adventure Awaits', url: 'https://youtube.com/watch?v=N5O6P7Q8R9' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j'
      },
      'tense': {
        youtube: [
          { title: 'Suspense Building', url: 'https://youtube.com/watch?v=O6P7Q8R9S0' },
          { title: 'Tension Rising', url: 'https://youtube.com/watch?v=P7Q8R9S0T1' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo'
      },
      'tavern': {
        youtube: [
          { title: 'Medieval Tavern', url: 'https://youtube.com/watch?v=Q8R9S0T1U2' },
          { title: 'Inn Ambience', url: 'https://youtube.com/watch?v=R9S0T1U2V3' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX5trt9i14X7j'
      },
      'rest': {
        youtube: [
          { title: 'Peaceful Rest', url: 'https://youtube.com/watch?v=S0T1U2V3W4' },
          { title: 'Campfire Ambience', url: 'https://youtube.com/watch?v=T1U2V3W4X5' }
        ],
        spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo'
      }
    };
  }

  setScene(sceneName, customDetails = null) {
    const baseScene = this.scenes[sceneName.toLowerCase()] || this.generateGenericScene(sceneName);
    this.currentScene = { ...baseScene, ...customDetails };
    this.currentMood = this.currentScene.mood || 'exploration';
    return this.currentScene;
  }

  setMood(mood) {
    this.currentMood = mood;
  }

  generateGenericScene(name) {
    return {
      lighting: 'Dim, uncertain light',
      sounds: 'Indistinct noises, perhaps wind or distant movement',
      smells: 'Earthy, neutral scents',
      temperature: 'Comfortable, perhaps slightly cool',
      textures: 'Various surfaces underfoot',
      mood: 'neutral',
      music: 'exploration'
    };
  }

  getSensoryDescription() {
    if (!this.currentScene) {
      return 'No scene set. Use setScene() first.';
    }

    const s = this.currentScene;
    return `
🎭 ATMOSPHERE

👁️  **Lighting:** ${s.lighting}
👂 **Sounds:** ${s.sounds}
👃 **Smells:** ${s.smells}
🌡️  **Temperature:** ${s.temperature}
✋ **Textures:** ${s.textures}

**Mood:** ${s.mood}
`;
  }

  getMusic() {
    const musicKey = this.currentScene?.music || this.currentMood;
    const music = this.music[musicKey] || this.music['exploration'];
    
    let output = '\n🎵 MUSIC RECOMMENDATIONS\n\n';
    
    if (music.youtube) {
      output += '📺 YouTube:\n';
      music.youtube.forEach(m => {
        output += `   • ${m.title}: ${m.url}\n`;
      });
    }
    
    if (music.spotify) {
      output += `\n🎧 Spotify: ${music.spotify}\n`;
    }
    
    return output;
  }

  getTensionCue(level) {
    const cues = {
      'low': [
        'A gentle breeze carries the scent of pine.',
        'Birds chirp in the distance.',
        'Sunlight filters through the trees.',
        'Everything seems calm.'
      ],
      'rising': [
        'The wind picks up, rustling leaves aggressively.',
        'A twig snaps somewhere nearby.',
        'The temperature drops suddenly.',
        'Silence falls, too abruptly.',
        'Shadows seem to lengthen.'
      ],
      'high': [
        'Your heart pounds in your ears.',
        'Every shadow holds potential danger.',
        'The air feels charged, electric.',
        'You sense you are being watched.',
        'A low growl rumbles from the darkness.'
      ],
      'peak': [
        'Time seems to slow.',
        'Adrenaline surges through your veins.',
        'This is the moment of truth.',
        'Everything hangs in the balance.'
      ]
    };

    const levelCues = cues[level] || cues['low'];
    return levelCues[Math.floor(Math.random() * levelCues.length)];
  }

  generateImagePrompt() {
    if (!this.currentScene) {
      return 'Fantasy scene, dramatic lighting, 1979 D&D art style';
    }

    const s = this.currentScene;
    return `${this.currentMood} fantasy scene, ${s.lighting}, ${s.textures}, ${s.mood} atmosphere, 1979 D&D art style, detailed illustration`;
  }

  async generateImage(prompt = null) {
    const imagePrompt = prompt || this.generateImagePrompt();
    const fullPrompt = `${imagePrompt}. 1979 D&D module art style, Erol Otus or David Sutherland illustration style, ink and watercolor, atmospheric lighting, vintage TSR aesthetic`;
    
    if (!OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OPENAI_API_KEY not set. Set environment variable or add to script.',
        prompt: fullPrompt
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: fullPrompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });
      
      const data = await response.json();
      
      if (data.data && data.data[0]) {
        return {
          success: true,
          url: data.data[0].url,
          revised_prompt: data.data[0].revised_prompt,
          original_prompt: imagePrompt
        };
      }
      
      return { 
        success: false, 
        error: data.error?.message || 'Unknown error',
        prompt: fullPrompt 
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.message,
        prompt: fullPrompt 
      };
    }
  }

  async generateSceneImage(sceneName = null) {
    if (sceneName) {
      this.setScene(sceneName);
    }
    return await this.generateImage();
  }

  printScene() {
    console.log(this.getSensoryDescription());
    console.log(this.getMusic());
    console.log('\n🎨 AI IMAGE PROMPT:');
    console.log(this.generateImagePrompt());
  }

  printHelp() {
    console.log(`
🎭 AMBIANCE AGENT for D&D

USAGE:
  node ambiance.js scene <scene-name>    Set scene and show atmosphere
  node ambiance.js music <mood>          Get music recommendations
  node ambiance.js sense                 Show sensory details
  node ambiance.js tension <level>       Get tension cue (low/rising/high/peak)
  node ambiance.js image                 Get AI image prompt
  node ambiance.js generate [scene]      Generate AI image with DALL-E

SCENES:
  dark forest, ancient temple, underground cavern
  boss battle, tavern, swamp, mountain peak
  city streets, crypt, wizard tower

MOODS:
  exploration, combat, tense, rest, boss

EXAMPLES:
  node ambiance.js scene "dark forest"
  node ambiance.js music combat
  node ambiance.js tension rising
  node ambiance.js generate "ancient temple"
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const agent = new AmbianceAgent();

  switch (command) {
    case 'scene':
      if (!args[1]) {
        console.log('Usage: scene <scene-name>');
        console.log('Scenes: dark forest, ancient temple, underground cavern, boss battle, tavern, swamp, mountain peak, city streets, crypt, wizard tower');
        process.exit(1);
      }
      agent.setScene(args.slice(1).join(' '));
      agent.printScene();
      break;

    case 'music':
      if (!args[1]) {
        console.log('Usage: music <mood>');
        console.log('Moods: exploration, combat, tense, rest, boss');
        process.exit(1);
      }
      agent.setMood(args[1]);
      console.log(agent.getMusic());
      break;

    case 'sense':
      console.log(agent.getSensoryDescription());
      break;

    case 'tension':
      if (!args[1]) {
        console.log('Usage: tension <level>');
        console.log('Levels: low, rising, high, peak');
        process.exit(1);
      }
      console.log('\n⚡ TENSION CUE:\n');
      console.log(agent.getTensionCue(args[1]));
      break;

    case 'image':
      console.log('\n🎨 AI IMAGE PROMPT:\n');
      console.log(agent.generateImagePrompt());
      break;

    case 'generate':
      console.log('\n🎨 Generating AI image...\n');
      const sceneForImage = args.slice(1).join(' ') || null;
      if (sceneForImage) {
        agent.setScene(sceneForImage);
      }
      agent.generateImage().then(result => {
        if (result.success) {
          console.log('✅ Image generated!\n');
          console.log(`URL: ${result.url}\n`);
          console.log(`Prompt: ${result.original_prompt}`);
        } else {
          console.log('❌ Failed to generate image:');
          console.log(result.error);
          console.log('\nPrompt that would have been used:');
          console.log(result.prompt);
        }
      });
      break;

    case 'help':
    default:
      agent.printHelp();
      break;
  }
}

module.exports = AmbianceAgent;
