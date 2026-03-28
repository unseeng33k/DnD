#!/usr/bin/env node

/**
 * Ambiance Agent for D&D
 * Central hub for pre-session prep and atmospheric gameplay
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

  /**
   * Full session prep - generates all images and ambiance
   */
  async prepSession(name, config = null) {
    const fs = require('fs');
    const path = require('path');
    
    const defaultConfig = {
      locations: [
        { name: "Dungeon Entrance", scene: "ancient temple" },
        { name: "Main Chamber", scene: "underground cavern" },
        { name: "Boss Room", scene: "boss battle" }
      ],
      monsters: ["goblin", "skeleton", "troll"]
    };
    
    const cfg = config || defaultConfig;
    const sessionDir = path.join(process.cwd(), 'session_assets');
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    console.log(`\n🎲 AMBIANCE AGENT: Prepping "${name}"\n`);
    console.log('='.repeat(60));

    const data = {
      name,
      date: new Date().toISOString(),
      locations: [],
      monsters: []
    };

    // Generate location images
    if (cfg.locations) {
      console.log('\n🏰 Generating Location Images...\n');
      for (const loc of cfg.locations) {
        console.log(`  📍 ${loc.name}...`);
        this.setScene(loc.scene || loc.name);
        const result = await this.generateImage();
        data.locations.push({
          name: loc.name,
          scene: loc.scene || loc.name,
          ...result,
          ambiance: {
            sensory: this.getSensoryDescription(),
            music: this.getMusic(),
            prompt: this.generateImagePrompt()
          }
        });
        if (result.success) {
          console.log(`     ✅ Image generated`);
        } else {
          console.log(`     ⚠️  ${result.error}`);
        }
      }
    }

    // Generate monster images
    if (cfg.monsters) {
      console.log('\n👹 Generating Monster Images...\n');
      const MMSkill = require('../mm-skill/mm-skill');
      const mm = new MMSkill();
      
      for (const monsterName of cfg.monsters) {
        console.log(`  👹 ${monsterName}...`);
        const stats = mm.getMonster(monsterName);
        if (stats) {
          const prompt = mm.generateImagePrompt(monsterName, stats);
          const result = await this.generateImage(prompt);
          data.monsters.push({
            name: monsterName,
            ...result,
            prompt
          });
          if (result.success) {
            console.log(`     ✅ Image generated`);
          } else {
            console.log(`     ⚠️  ${result.error}`);
          }
        }
      }
    }

    // Save JSON
    const jsonFile = path.join(sessionDir, `${name.replace(/\s+/g, '_')}_prep.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));

    // Generate HTML
    const htmlFile = path.join(sessionDir, `${name.replace(/\s+/g, '_')}_prep.html`);
    const html = this.generateHTML(name, data);
    fs.writeFileSync(htmlFile, html);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SESSION PREP COMPLETE!\n');
    console.log(`📁 Files saved to: ${sessionDir}/`);
    console.log(`📄 JSON data: ${path.basename(jsonFile)}`);
    console.log(`🌐 HTML guide: ${path.basename(htmlFile)}`);
    console.log('\n🎮 During gameplay:');
    console.log('   1. Open the HTML file');
    console.log('   2. Click images to show players');
    console.log('   3. Click YouTube links for sound');
    console.log('   4. Read sensory descriptions aloud');

    return { jsonFile, htmlFile, data };
  }

  generateHTML(name, data) {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${name} - Session Guide</title>
  <style>
    body { font-family: Georgia, serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #e0e0e0; }
    h1 { color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
    h2 { color: #d4af37; margin-top: 40px; border-left: 4px solid #d4af37; padding-left: 15px; }
    h3 { color: #daa520; }
    .location, .monster { background: #2a2a2a; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #444; }
    .image { max-width: 100%; border: 3px solid #d4af37; margin: 15px 0; border-radius: 4px; }
    .prompt { background: #1a1a1a; padding: 15px; font-family: monospace; font-size: 0.85em; color: #888; border-left: 3px solid #555; }
    .music { background: #1e3a1e; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .music a { color: #7f7; text-decoration: none; }
    .music a:hover { text-decoration: underline; }
    .sensory { background: #2a2a3a; padding: 15px; margin: 10px 0; border-radius: 4px; white-space: pre-wrap; }
    a { color: #4a9; }
    .error { color: #c44; background: #3a1a1a; padding: 10px; border-radius: 4px; }
    .no-image { background: #3a3a1a; padding: 20px; text-align: center; color: #aa5; }
  </style>
</head>
<body>
  <h1>🎲 ${name}</h1>
  <p style="color: #888;">Generated: ${new Date().toLocaleString()}</p>
  
  <h2>🏰 Locations</h2>
`;

    for (const loc of data.locations || []) {
      html += `
  <div class="location">
    <h3>${loc.name}</h3>
    ${loc.url ? `<img class="image" src="${loc.url}" alt="${loc.name}" onclick="window.open('${loc.url}', '_blank')" style="cursor: pointer;" title="Click to view full size">` : '<div class="no-image">🎨 Image not generated - copy prompt to DALL-E</div>'}
    <div class="sensory">${loc.ambiance?.sensory || ''}</div>
    <div class="music">${(loc.ambiance?.music || '').replace(/\n/g, '<br>')}</div>
    <div class="prompt">${loc.ambiance?.prompt || loc.prompt || ''}</div>
  </div>
`;
    }

    html += `
  <h2>👹 Monsters</h2>
`;
    for (const mon of data.monsters || []) {
      html += `
  <div class="monster">
    <h3>${mon.name}</h3>
    ${mon.url ? `<img class="image" src="${mon.url}" alt="${mon.name}" onclick="window.open('${mon.url}', '_blank')" style="cursor: pointer;" title="Click to view full size">` : '<div class="no-image">🎨 Image not generated - copy prompt to DALL-E</div>'}
    <div class="prompt">${mon.prompt}</div>
  </div>
`;
    }

    html += `
</body>
</html>
`;
    return html;
  }

  printHelp() {
    console.log(`
🎭 AMBIANCE AGENT for D&D - Central Hub for Session Prep

PRE-SESSION PREP (Run this BEFORE playing):
  node ambiance.js prep "Session Name" --module <module>
  node ambiance.js prep "Session Name" [config.json]

  Generates from module:
    - All location images from the adventure
    - All monster images from the module
    - Ambiance for every scene
    - HTML guide with everything

AVAILABLE MODULES:
  tamoachan          - Hidden Shrine of Tamoachan (C1)
  tomb of horrors    - Tomb of Horrors (S1)
  ravenloft          - Ravenloft (I6)
  temple of elemental evil - Temple of Elemental Evil (T1-4)
  against the giants - Against the Giants (G1-3)
  white plume mountain - White Plume Mountain (S2)

DURING GAMEPLAY:
  node ambiance.js scene <scene>      Full atmosphere for a scene
  node ambiance.js music <mood>       Get music links
  node ambiance.js tension <level>    Get tension cue
  node ambiance.js monster <name>     Show monster (player-safe)

EXAMPLES:
  node ambiance.js prep "Tamoachan Session 3" --module tamoachan
  node ambiance.js scene "dark forest"
  node ambiance.js monster goblin
  node ambiance.js music combat
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

    case 'prep':
      if (!args[1]) {
        console.log('Usage: prep "Session Name" [config.json]');
        console.log('       prep "Session Name" --module <module-name>');
        console.log('Example: node ambiance.js prep "Tamoachan Session 3" --module tamoachan');
        process.exit(1);
      }
      let config = null;
      
      // Check for --module flag
      const moduleIndex = args.indexOf('--module');
      if (moduleIndex !== -1 && args[moduleIndex + 1]) {
        const ModuleParser = require('./module-parser');
        const parser = new ModuleParser();
        config = parser.generatePrepConfig(args[moduleIndex + 1]);
        if (!config) {
          console.log(`Module "${args[moduleIndex + 1]}" not found.`);
          console.log('Available modules:');
          parser.listModules().forEach(m => console.log(`  - ${m.name} (${m.code})`));
          process.exit(1);
        }
        // Remove --module and module name from args for session name
        args.splice(moduleIndex, 2);
      } else if (args[2] && fs.existsSync(args[2])) {
        config = JSON.parse(fs.readFileSync(args[2], 'utf8'));
      }
      
      agent.prepSession(args[1], config);
      break;

    case 'monster':
      if (!args[1]) {
        console.log('Usage: monster <name>');
        process.exit(1);
      }
      const MMSkill = require('../mm-skill/mm-skill');
      const mm = new MMSkill();
      mm.printMonster(args[1], false); // Player view - no stats
      break;

    case 'help':
    default:
      agent.printHelp();
      break;
  }
}

module.exports = AmbianceAgent;
