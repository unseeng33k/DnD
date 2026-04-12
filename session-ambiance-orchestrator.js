#!/usr/bin/env node

/**
 * Session Ambiance Orchestrator - Level 3 Integration
 * 
 * Unified system that owns the ENTIRE D&D experience:
 * - Ambiance Agent (scenes, moods, sensory data)
 * - Image Handler (DALLE generation, caching, persistence)
 * - Session Runner (campaign tracking)
 * - Telegram Bot (real-time delivery)
 * 
 * Usage:
 *   import { SessionAmbiance } from './session-ambiance-orchestrator.js';
 *   const session = new SessionAmbiance('Curse of Strahd', '123456789');
 *   await session.prepSession(config);
 *   await session.startScene('ancient temple');
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  generateImageDALLE, 
  sendImageToTelegram 
} from './image-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scene definitions with full ambiance context
 */
class SceneLibrary {
  constructor() {
    this.scenes = {
      'ancient temple': {
        name: 'Ancient Temple',
        imagePrompt: 'Flickering torchlight casting dancing shadows on weathered stone walls, ancient carvings half-obscured by dust, stairs descending into darkness',
        mood: 'mysterious',
        lighting: 'Flickering torchlight casting dancing shadows on stone walls',
        sounds: 'Dripping water, distant chanting, stone grinding, echoes',
        smells: 'Incense, dust, old stone, something metallic',
        temperature: 'Cool and dry, with occasional drafts',
        textures: 'Weathered stone, carved reliefs, dust-covered floors',
        musicLink: 'https://www.youtube.com/watch?v=o5DKHmFVgLQ',
        musicTitle: 'Ancient Temple Ambiance',
        syrinscapeLink: 'https://app.syrinscape.com/#/?element=18',
        syrinscapeTitle: 'Temple of Evil'
      },
      'dark forest': {
        name: 'Dark Forest',
        imagePrompt: 'Dappled moonlight filtering through twisted branches, dense undergrowth, moss-covered trees, fog weaving between trunks, hint of movement in shadows',
        mood: 'foreboding',
        lighting: 'Dappled moonlight filtering through twisted branches',
        sounds: 'Rustling leaves, snapping twigs, distant howls, hooting owls',
        smells: 'Damp earth, rotting vegetation, pine resin',
        temperature: 'Cool, clammy air that clings to your skin',
        textures: 'Moss-covered bark, slick mud, sharp thorns',
        musicLink: 'https://www.youtube.com/watch?v=7H2s_dLtFQU',
        musicTitle: 'Dark Forest Ambiance',
        syrinscapeLink: 'https://app.syrinscape.com/#/?element=72',
        syrinscapeTitle: 'Deep Forest'
      },
      'underground cavern': {
        name: 'Underground Cavern',
        imagePrompt: 'Bioluminescent fungi casting eerie blue-green glow on limestone formations, stalactites dripping above, underground lake reflecting strange light, echoing darkness',
        mood: 'claustrophobic',
        lighting: 'Bioluminescent fungi casting eerie blue-green glow',
        sounds: 'Water dripping, distant rumbling, bat wings, echoes',
        smells: 'Stagnant water, minerals, damp earth',
        temperature: 'Cold and damp, breath visible',
        textures: 'Slick limestone, sharp stalactites, loose gravel',
        musicLink: 'https://www.youtube.com/watch?v=REG5J0d8jpc',
        musicTitle: 'Underground Cave Ambiance',
        syrinscapeLink: 'https://app.syrinscape.com/#/?element=45',
        syrinscapeTitle: 'Dripstone Caverns'
      },
      'tavern': {
        name: 'Tavern',
        imagePrompt: 'Warm candlelight and firelight illuminating a cozy tavern, wooden beams, tankards on tables, smoke curling through air, patrons in the shadows',
        mood: 'relaxed',
        lighting: 'Warm candlelight and firelight',
        sounds: 'Laughter, clinking tankards, crackling fire, background chatter',
        smells: 'Ale, bread, roasted meat, pipe smoke',
        temperature: 'Warm and comfortable',
        textures: 'Smooth wooden tables, soft cushions, cold metal tankards',
        musicLink: 'https://www.youtube.com/watch?v=5kJZXcfICjc',
        musicTitle: 'Tavern Ambiance',
        syrinscapeLink: 'https://app.syrinscape.com/#/?element=89',
        syrinscapeTitle: 'Busy Tavern'
      },
      'boss battle': {
        name: 'Boss Battle',
        imagePrompt: 'Epic confrontation scene, dramatic lighting, ancient architecture crumbling, magical energy crackling in the air, an imposing figure emerging from shadows',
        mood: 'climactic',
        lighting: 'Dramatic, with magical energy crackling',
        sounds: 'Booming voice, magical hum, stone cracking, thunder',
        smells: 'Sulfur, ozone, dust from destruction',
        temperature: 'Hot and electric',
        textures: 'Rough crumbling stone, heat, vibration in the air',
        musicLink: 'https://www.youtube.com/watch?v=P8a7iSQJnSE',
        musicTitle: 'Epic Boss Battle Music',
        syrinscapeLink: 'https://app.syrinscape.com/#/?element=156',
        syrinscapeTitle: 'Epic Combat'
      }
    };
  }

  get(sceneKey) {
    return this.scenes[sceneKey] || null;
  }

  list() {
    return Object.keys(this.scenes);
  }
}

/**
 * Main orchestrator - coordinates everything
 */
class SessionAmbiance {
  constructor(campaignName, telegramChatId = null) {
    this.campaign = campaignName;
    this.chatId = telegramChatId;
    this.sceneLibrary = new SceneLibrary();
    this.sessionState = {
      campaign: campaignName,
      startedAt: new Date().toISOString(),
      scenes: [],
      images: [],
      lastScene: null
    };
    this.cacheDir = path.join(__dirname, 'images', 'generated');
    this.assetsDir = path.join(__dirname, 'session_assets');
    
    // Create directories
    [this.cacheDir, this.assetsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * PHASE 1: Pre-session prep
   * Generate all images + build HTML guide + pre-load Telegram
   */
  async prepSession(locationsList, sendToTelegram = true) {
    console.log(`\n🎮 Prepping session: ${this.campaign}`);
    console.log(`📍 Locations: ${locationsList.length}`);
    console.log(`📲 Telegram: ${this.chatId ? 'Yes' : 'No'}\n`);

    const htmlCards = [];
    const sessionImages = [];

    for (const location of locationsList) {
      const scene = this.sceneLibrary.get(location.scene);
      if (!scene) {
        console.log(`⚠️  Unknown scene: ${location.scene}`);
        continue;
      }

      console.log(`📍 ${location.name}...`);

      // Generate image (will use cache if available)
      const imageResult = await generateImageDALLE(scene.imagePrompt);

      if (!imageResult.success) {
        console.log(`   ❌ Image failed: ${imageResult.error}`);
        continue;
      }

      console.log(`   ✅ Image generated`);

      // Pre-load to Telegram (if enabled)
      if (sendToTelegram && this.chatId) {
        const caption = this.buildCaption(location.name, scene);
        const telegramResult = await sendImageToTelegram(
          imageResult.filepath,
          this.chatId,
          caption
        );

        if (telegramResult.success) {
          console.log(`   ✅ Sent to Telegram`);
        } else {
          console.log(`   ⚠️  Telegram send failed: ${telegramResult.error}`);
        }
      }

      // Build HTML card
      htmlCards.push({
        name: location.name,
        imagePath: imageResult.filepath,
        imageFile: path.basename(imageResult.filepath),
        scene: location.scene,
        ...scene
      });

      sessionImages.push({
        location: location.name,
        filepath: imageResult.filepath,
        timestamp: new Date().toISOString()
      });
    }

    // Save session state
    this.sessionState.scenes = locationsList;
    this.sessionState.images = sessionImages;
    this.saveSessionState();

    // Generate HTML guide
    await this.generateHTMLGuide(htmlCards);

    console.log(`\n✅ Session prep complete!`);
    console.log(`📄 Guide: ${path.join(this.assetsDir, `${this.campaign}_guide.html`)}`);
    console.log(`💾 State: ${path.join(this.assetsDir, `${this.campaign}_state.json`)}`);

    return {
      success: true,
      locations: locationsList.length,
      images: sessionImages.length,
      guideFile: path.join(this.assetsDir, `${this.campaign}_guide.html`)
    };
  }

  /**
   * PHASE 2: During gameplay
   * Load scene + send to Telegram with full context
   */
  async startScene(sceneKey) {
    const scene = this.sceneLibrary.get(sceneKey);
    if (!scene) {
      return { success: false, error: 'Scene not found' };
    }

    console.log(`\n🎭 Starting scene: ${scene.name}`);

    // Generate image if not cached
    const imageResult = await generateImageDALLE(scene.imagePrompt);

    if (!imageResult.success) {
      console.log(`❌ Image generation failed: ${imageResult.error}`);
      return imageResult;
    }

    console.log(`✅ Image ready`);

    // Send to Telegram
    if (this.chatId) {
      const caption = this.buildCaption(scene.name, scene);
      const telegramResult = await sendImageToTelegram(
        imageResult.filepath,
        this.chatId,
        caption
      );

      if (telegramResult.success) {
        console.log(`✅ Sent to Telegram`);
      } else {
        console.log(`⚠️  Telegram send failed: ${telegramResult.error}`);
      }
    }

    // Track in session
    this.sessionState.lastScene = {
      name: scene.name,
      startedAt: new Date().toISOString(),
      imagePath: imageResult.filepath
    };
    this.saveSessionState();

    return {
      success: true,
      scene: scene.name,
      imageFile: imageResult.filepath,
      sensorySummary: this.buildSensorySummary(scene),
      musicLink: scene.musicLink,
      musicTitle: scene.musicTitle
    };
  }

  /**
   * Build rich Telegram caption
   */
  buildCaption(sceneName, scene) {
    const syrinscapeLine = scene.syrinscapeLink
      ? `🎧 *Syrinscape*: [${scene.syrinscapeTitle}](${scene.syrinscapeLink})`
      : '';

    return `
🎲 *${sceneName}*
*Mood: ${scene.mood.toUpperCase()}*

🎵 *Music*: [${scene.musicTitle}](${scene.musicLink})
${syrinscapeLine}
🔊 *Sounds*: ${scene.sounds}
👃 *Smell*: ${scene.smells}
❄️ *Temperature*: ${scene.temperature}
👆 *Touch*: ${scene.textures}
💡 *Lighting*: ${scene.lighting}
    `.trim();
  }

  /**
   * Build sensory summary for DM
   */
  buildSensorySummary(scene) {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scene.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 MOOD: ${scene.mood}

💡 LIGHTING:
${scene.lighting}

🔊 SOUNDS:
${scene.sounds}

👃 SMELL:
${scene.smells}

❄️ TEMPERATURE:
${scene.temperature}

👆 TEXTURES:
${scene.textures}

🎵 MUSIC:
${scene.musicTitle}
${scene.musicLink}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * Generate HTML prep guide
   */
  async generateHTMLGuide(cards) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.campaign} - Session Guide</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px; 
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    h1 { font-size: 32px; margin-bottom: 5px; }
    .subtitle { font-size: 14px; color: #888; }
    .grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
      gap: 20px;
    }
    .card { 
      background: #1a1a1a; 
      border: 1px solid #333; 
      border-radius: 8px; 
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 8px 16px rgba(255,255,255,0.1);
    }
    .card-image { 
      width: 100%; 
      aspect-ratio: 16/9; 
      background: #000; 
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .card-image img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover;
      transition: transform 0.3s;
    }
    .card-image:hover img { transform: scale(1.05); }
    .card-image-overlay {
      position: absolute;
      top: 0; left: 0;
      right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .card-image:hover .card-image-overlay {
      opacity: 1;
    }
    .card-image-overlay-text {
      color: white;
      font-size: 24px;
    }
    .card-content { padding: 16px; }
    .card-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    .card-mood { 
      display: inline-block;
      background: #333;
      color: #ffd700;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
    }
    .sensory { 
      font-size: 12px; 
      color: #aaa;
      margin-bottom: 12px;
    }
    .sensory-item { margin-bottom: 6px; }
    .sensory-label { font-weight: 600; color: #ddd; }
    .buttons { 
      display: flex; 
      gap: 8px; 
      margin-top: 12px;
    }
    .btn { 
      flex: 1;
      padding: 8px 12px; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
      transition: background 0.2s;
    }
    .btn-music {
      background: #1a5f7a;
      color: white;
    }
    .btn-music:hover { background: #0f3d52; }
    .btn-syrinscape {
      background: #7a1a5f;
      color: white;
    }
    .btn-syrinscape:hover { background: #520f3d; }
    .btn-image {
      background: #5a2a2a;
      color: white;
    }
    .btn-image:hover { background: #3d1d1d; }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎲 ${this.campaign}</h1>
    <p class="subtitle">Session Preparation Guide</p>
  </div>
  
  <div class="grid">
    ${cards.map(card => this.renderCard(card)).join('')}
  </div>
  
  <div class="footer">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>All images cached locally • Music links are YouTube ambiance</p>
  </div>
</body>
</html>
    `.trim();

    const filename = path.join(this.assetsDir, `${this.campaign}_guide.html`);
    fs.writeFileSync(filename, htmlContent);
  }

  /**
   * Render HTML card for a scene
   */
  renderCard(card) {
    const syrinscapeButton = card.syrinscapeLink
      ? `<a href="${card.syrinscapeLink}" target="_blank" class="btn btn-syrinscape">🎧 Syrinscape</a>`
      : '';

    return `
      <div class="card">
        <div class="card-image">
          <img src="file://${card.imagePath}" alt="${card.name}">
          <div class="card-image-overlay">
            <div class="card-image-overlay-text">🔍 Click to enlarge</div>
          </div>
        </div>
        <div class="card-content">
          <div class="card-title">${card.name}</div>
          <div class="card-mood">${card.mood.toUpperCase()}</div>

          <div class="sensory">
            <div class="sensory-item">
              <span class="sensory-label">🔊 Sounds:</span> ${card.sounds}
            </div>
            <div class="sensory-item">
              <span class="sensory-label">👃 Smell:</span> ${card.smells}
            </div>
            <div class="sensory-item">
              <span class="sensory-label">❄️ Temperature:</span> ${card.temperature}
            </div>
            <div class="sensory-item">
              <span class="sensory-label">💡 Lighting:</span> ${card.lighting}
            </div>
          </div>

          <div class="buttons">
            <a href="${card.musicLink}" target="_blank" class="btn btn-music">🎵 Music</a>
            ${syrinscapeButton}
            <a href="file://${card.imagePath}" target="_blank" class="btn btn-image">🖼️ Full Image</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Save session state
   */
  saveSessionState() {
    const stateFile = path.join(this.assetsDir, `${this.campaign}_state.json`);
    fs.writeFileSync(stateFile, JSON.stringify(this.sessionState, null, 2));
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const campaign = process.argv[2] || 'Curse of Strahd';
  const chatId = process.argv[3] || process.env.TELEGRAM_CHAT_ID;

  const session = new SessionAmbiance(campaign, chatId);

  // Example prep
  const locations = [
    { name: 'Castle Entrance', scene: 'ancient temple' },
    { name: 'Dark Forest', scene: 'dark forest' },
    { name: 'Underground Caves', scene: 'underground cavern' },
    { name: 'Safe Haven Tavern', scene: 'tavern' },
    { name: 'Final Confrontation', scene: 'boss battle' }
  ];

  session.prepSession(locations, !!chatId)
    .then(result => {
      console.log('\n' + JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

export { SessionAmbiance, SceneLibrary };
