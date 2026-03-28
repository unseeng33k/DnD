#!/usr/bin/env node

/**
 * Session Prep Tool
 * Pre-generates all images, ambiance, and sound for a gaming session
 * Run this BEFORE you start playing
 */

const fs = require('fs');
const path = require('path');
const AmbianceAgent = require('./skills/ambiance-agent/ambiance');
const MMSkill = require('./skills/mm-skill/mm-skill');

class SessionPrep {
  constructor() {
    this.ambiance = new AmbianceAgent();
    this.mm = new MMSkill();
    this.sessionDir = path.join(__dirname, 'session_assets');
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  /**
   * Generate all location images for a session
   */
  async generateLocations(locations) {
    console.log('\n🏰 GENERATING LOCATION IMAGES\n');
    const results = [];

    for (const location of locations) {
      console.log(`Generating: ${location.name}...`);
      this.ambiance.setScene(location.scene || location.name);
      
      const imageResult = await this.ambiance.generateImage();
      
      if (imageResult.success) {
        results.push({
          name: location.name,
          url: imageResult.url,
          prompt: imageResult.original_prompt
        });
        console.log(`  ✅ ${location.name}`);
      } else {
        console.log(`  ❌ ${location.name}: ${imageResult.error}`);
        results.push({
          name: location.name,
          prompt: imageResult.prompt,
          error: imageResult.error
        });
      }
    }

    return results;
  }

  /**
   * Generate monster images for the session
   */
  async generateMonsters(monsters) {
    console.log('\n👹 GENERATING MONSTER IMAGES\n');
    const results = [];

    for (const monsterName of monsters) {
      console.log(`Generating: ${monsterName}...`);
      const stats = this.mm.getMonster(monsterName);
      
      if (!stats) {
        console.log(`  ❌ Monster not found: ${monsterName}`);
        continue;
      }

      const prompt = this.mm.generateImagePrompt(monsterName, stats);
      
      // Use ambiance agent to generate with DALL-E
      const imageResult = await this.ambiance.generateImage(prompt);
      
      if (imageResult.success) {
        results.push({
          name: monsterName,
          url: imageResult.url,
          prompt: prompt
        });
        console.log(`  ✅ ${monsterName}`);
      } else {
        console.log(`  ❌ ${monsterName}: ${imageResult.error}`);
        results.push({
          name: monsterName,
          prompt: prompt,
          error: imageResult.error
        });
      }
    }

    return results;
  }

  /**
   * Generate ambiance package for locations
   */
  generateAmbiance(locations) {
    console.log('\n🎭 GENERATING AMBIANCE PACKAGES\n');
    const ambiancePackages = [];

    for (const location of locations) {
      console.log(`Creating ambiance: ${location.name}...`);
      this.ambiance.setScene(location.scene || location.name);
      
      const package_ = {
        name: location.name,
        sensory: this.ambiance.getSensoryDescription(),
        music: this.ambiance.getMusic(),
        imagePrompt: this.ambiance.generateImagePrompt()
      };
      
      ambiancePackages.push(package_);
      console.log(`  ✅ ${location.name}`);
    }

    return ambiancePackages;
  }

  /**
   * Save session prep to file
   */
  saveSession(name, data) {
    const filename = path.join(this.sessionDir, `${name}_prep.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n💾 Saved to: ${filename}`);
    return filename;
  }

  /**
   * Generate HTML session guide
   */
  generateHTML(name, data) {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>${name} - Session Prep</title>
  <style>
    body { font-family: Georgia, serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #e0e0e0; }
    h1 { color: #d4af37; border-bottom: 2px solid #d4af37; }
    h2 { color: #d4af37; margin-top: 30px; }
    .location, .monster { background: #2a2a2a; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .image { max-width: 100%; border: 2px solid #d4af37; margin: 10px 0; }
    .prompt { background: #333; padding: 10px; font-family: monospace; font-size: 0.9em; color: #aaa; }
    .music { background: #1e3a1e; padding: 10px; margin: 5px 0; }
    a { color: #4a9; }
    .error { color: #c44; }
  </style>
</head>
<body>
  <h1>🎲 ${name} - Session Prep</h1>
  
  <h2>🏰 Locations</h2>
`;

    // Locations
    for (const loc of data.locations || []) {
      html += `
  <div class="location">
    <h3>${loc.name}</h3>
    ${loc.url ? `<img class="image" src="${loc.url}" alt="${loc.name}">` : '<p class="error">Image not generated</p>'}
    <div class="prompt">${loc.prompt}</div>
  </div>
`;
    }

    // Monsters
    html += `
  <h2>👹 Monsters</h2>
`;
    for (const mon of data.monsters || []) {
      html += `
  <div class="monster">
    <h3>${mon.name}</h3>
    ${mon.url ? `<img class="image" src="${mon.url}" alt="${mon.name}">` : '<p class="error">Image not generated</p>'}
    <div class="prompt">${mon.prompt}</div>
  </div>
`;
    }

    // Ambiance
    html += `
  <h2>🎭 Ambiance</h2>
`;
    for (const amb of data.ambiance || []) {
      html += `
  <div class="location">
    <h3>${amb.name}</h3>
    <pre>${amb.sensory}</pre>
    <div class="music">${amb.music.replace(/\n/g, '<br>')}</div>
  </div>
`;
    }

    html += `
</body>
</html>
`;

    const filename = path.join(this.sessionDir, `${name}_prep.html`);
    fs.writeFileSync(filename, html);
    console.log(`🌐 HTML guide: ${filename}`);
    return filename;
  }

  /**
   * Full session prep
   */
  async prepSession(name, config) {
    console.log(`\n🎲 PREPPING SESSION: ${name}\n`);
    console.log('=' .repeat(50));

    const data = {
      name,
      date: new Date().toISOString(),
      locations: [],
      monsters: [],
      ambiance: []
    };

    // Generate locations
    if (config.locations) {
      data.locations = await this.generateLocations(config.locations);
    }

    // Generate monsters
    if (config.monsters) {
      data.monsters = await this.generateMonsters(config.monsters);
    }

    // Generate ambiance
    if (config.locations) {
      data.ambiance = this.generateAmbiance(config.locations);
    }

    // Save everything
    this.saveSession(name, data);
    this.generateHTML(name, data);

    console.log('\n' + '='.repeat(50));
    console.log('✅ SESSION PREP COMPLETE!\n');
    console.log('Open the HTML file to see all your images and ambiance.');
    console.log('During gameplay, click the YouTube links for sound.');

    return data;
  }

  printHelp() {
    console.log(`
🎲 SESSION PREP TOOL

Prepares all images and ambiance BEFORE your gaming session.

USAGE:
  node session-prep.js <session-name> [config-file]

EXAMPLE CONFIG (config.json):
{
  "locations": [
    { "name": "Temple Entrance", "scene": "ancient temple" },
    { "name": "Boss Chamber", "scene": "boss battle" },
    { "name": "Treasure Room", "scene": "dark forest" }
  ],
  "monsters": ["goblin", "troll", "dragon"]
}

EXAMPLE:
  node session-prep.js "Tamoachan Session 3" ./my-config.json

WITHOUT CONFIG:
  node session-prep.js "My Session"
  (will use default locations and monsters)

OUTPUT:
  - session_assets/My Session_prep.json (data)
  - session_assets/My Session_prep.html (visual guide)
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const sessionName = args[0];
  const configFile = args[1];

  if (!sessionName) {
    const prep = new SessionPrep();
    prep.printHelp();
    process.exit(1);
  }

  // Load config or use defaults
  let config = {
    locations: [
      { name: "Dungeon Entrance", scene: "ancient temple" },
      { name: "Main Chamber", scene: "underground cavern" },
      { name: "Boss Room", scene: "boss battle" }
    ],
    monsters: ["goblin", "skeleton", "troll"]
  };

  if (configFile && fs.existsSync(configFile)) {
    try {
      config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (e) {
      console.error(`Error loading config: ${e.message}`);
      process.exit(1);
    }
  }

  const prep = new SessionPrep();
  prep.prepSession(sessionName, config);
}

module.exports = SessionPrep;
