#!/usr/bin/env node

/**
 * CLI WITH IMAGES
 * 
 * Display scene images in terminal using:
 * - DALL-E 3 generated images
 * - ASCII art fallback
 * - Image caching for offline play
 */

import fs from 'fs';
import path from 'path';

class CliImageDisplay {
  constructor(dalleApiKey) {
    this.dalleApiKey = dalleApiKey;
    this.cacheDir = '/Users/mpruskowski/.openclaw/workspace/dnd/image-cache';
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate or retrieve scene image
   */
  async getSceneImage(sceneName, sceneDescription) {
    const cacheKey = sceneName.replace(/\s+/g, '-').toLowerCase();
    const cachePath = path.join(this.cacheDir, `${cacheKey}.txt`);

    // Check cache first
    if (fs.existsSync(cachePath)) {
      return fs.readFileSync(cachePath, 'utf-8');
    }

    // Try to generate with DALL-E
    if (this.dalleApiKey) {
      const imageUrl = await this.generateWithDALLE(sceneDescription);
      if (imageUrl) {
        // Save URL to cache
        fs.writeFileSync(cachePath, imageUrl);
        return imageUrl;
      }
    }

    // Fallback to ASCII art
    const asciiArt = this.getASCIIArtForScene(sceneName);
    fs.writeFileSync(cachePath, asciiArt);
    return asciiArt;
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateWithDALLE(description) {
    if (!this.dalleApiKey) return null;

    try {
      const prompt = `D&D scene: ${description}. Art style: fantasy, detailed, atmospheric. 1024x1024.`;

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.dalleApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });

      if (!response.ok) {
        console.error('DALL-E error:', await response.text());
        return null;
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('Error calling DALL-E:', error);
      return null;
    }
  }

  /**
   * ASCII Art Database
   */
  getASCIIArtForScene(sceneName) {
    const scenes = {
      'castle': this.castleASCII(),
      'tavern': this.tavernASCII(),
      'forest': this.forestASCII(),
      'dungeon': this.dungeonASCII(),
      'village': this.villageASCII(),
      'tomb': this.tombASCII(),
      'cave': this.caveASCII(),
      'mountain': this.mountainASCII()
    };

    // Find matching scene
    const key = Object.keys(scenes).find(k => sceneName.toLowerCase().includes(k));
    return scenes[key] ? scenes[key] : this.genericSceneASCII();
  }

  /**
   * ASCII Art Scenes
   */
  castleASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║          CASTLE RAVENLOFT         ║
    ║                                   ║
    ║   ╔════════════════════╗          ║
    ║   ║                    ║          ║
    ║   ║    /\\\\\\\\\\\\\\\\\\\\\\\\\\\\        ║
    ║   ║   /  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\       ║
    ║   ║  |    TOWER      |      ║
    ║   ║  |               |      ║
    ║   ║  |    _____      |      ║
    ║   ║  |   |     |     |      ║
    ║   ║  |   |_____|     |      ║
    ║   ║                  |      ║
    ║   ║ |\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\|      ║
    ║   ╚═╪══════════════════╪═╝      ║
    ║     |                  |        ║
    ║     |   GRAND FOYER    |        ║
    ║     |                  |        ║
    ║     ╚══════════════════╝        ║
    ║                                   ║
    ║  Mist rolls across the courtyard  ║
    ╚═══════════════════════════════════╝
    `;
  }

  tavernASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║         THE LOST TAVERN           ║
    ║                                   ║
    ║    ┌─────────────────────┐        ║
    ║    │  🍺 THE DRAGON INN  │        ║
    ║    │                     │        ║
    ║    │  ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱   │        ║
    ║    │  ║ Fireplace   ║   │        ║
    ║    │  ║             ║   │        ║
    ║    │  ║    🔥 🔥    ║   │        ║
    ║    │  ╲╲╲╲╲╲╲╲╲╲╲╲╲╲╲   │        ║
    ║    │                     │        ║
    ║    │  ┌──┐  ┌──┐  ┌──┐  │        ║
    ║    │  │TB│  │ TB│  │TB│  │        ║
    ║    │  └──┘  └──┘  └──┘  │        ║
    ║    │    (TABLES)         │        ║
    ║    │                     │        ║
    ║    │  [BAR]              │        ║
    ║    │                     │        ║
    ║    └─────────────────────┘        ║
    ║                                   ║
    ║  Warm ale. Warm fire. Secrets.    ║
    ╚═══════════════════════════════════╝
    `;
  }

  forestASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║        DARK FOREST                ║
    ║                                   ║
    ║    🌲      🌲        🌲      🌲   ║
    ║      🌲  🌲  🌲    🌲            ║
    ║    🌲  🌲    🌲  🌲  🌲  🌲     ║
    ║      🌲  🌲  🌲    🌲    🌲      ║
    ║    🌲    🌲  🌲      🌲  🌲      ║
    ║      🌲  🌲    🌲  🌲  🌲  🌲    ║
    ║                                   ║
    ║       ░░░ Misty Path ░░░          ║
    ║                                   ║
    ║    🌲  🌲    🌲  🌲  🌲  🌲     ║
    ║      🌲  🌲  🌲    🌲    🌲      ║
    ║    🌲    🌲  🌲      🌲  🌲      ║
    ║      🌲  🌲    🌲  🌲  🌲  🌲    ║
    ║    🌲      🌲        🌲      🌲   ║
    ║                                   ║
    ║  You hear only your footsteps...  ║
    ╚═══════════════════════════════════╝
    `;
  }

  dungeonASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║         DUNGEON PASSAGE           ║
    ║                                   ║
    ║  ╔═══════════════════════════╗    ║
    ║  ║░░░░░░░░░░░░░░░░░░░░░░░░░░║    ║
    ║  ║░░░ STONE CORRIDOR ░░░░░░░║    ║
    ║  ║░░░░░░░░░░░░░░░░░░░░░░░░░░║    ║
    ║  ║                           ║    ║
    ║  ║    ╔───────────┐          ║    ║
    ║  ║    │ [TORCH]   │          ║    ║
    ║  ║    │    🔥     │          ║    ║
    ║  ║    └───────────┘          ║    ║
    ║  ║                           ║    ║
    ║  ║  ╭─────────┬─────────╮   ║    ║
    ║  ║  │ DOOR?   │ DOOR?   │   ║    ║
    ║  ║  ╰─────────┴─────────╯   ║    ║
    ║  ║                           ║    ║
    ║  ║░░░░░░░░░░░░░░░░░░░░░░░░░░║    ║
    ║  ║░░░ DARKNESS AHEAD ░░░░░░░║    ║
    ║  ║░░░░░░░░░░░░░░░░░░░░░░░░░░║    ║
    ║  ╚═══════════════════════════╝    ║
    ║                                   ║
    ║  Dripping water echoes above...   ║
    ╚═══════════════════════════════════╝
    `;
  }

  villageASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║       VILLAGE OF BAROVIA          ║
    ║                                   ║
    ║  ╱\\\\\\\\\\\\\\\\\\\\\\\\\\\\  ╱\\\\\\\\\\\\\\\\\\\\\\\\\\\\  ║
    ║ / HOUSE \\\\   / HOUSE \\\\           ║
    ║|_________|   |_________|          ║
    ║                                   ║
    ║     ▲                  ▲           ║
    ║    / \\\\  CHURCH      / \\\\         ║
    ║   /   \\\\            /   \\\\        ║
    ║  |SPIRE |          |SPIRE |       ║
    ║  |_____|          |_____|        ║
    ║                                   ║
    ║  ╱\\\\\\\\\\\\\\\\\\\\\\\\\\\\  ╱\\\\\\\\\\\\\\\\\\\\\\\\\\\\  ║
    ║ / SHOP  \\\\   / TAVERN \\\\         ║
    ║|_________|   |_________|          ║
    ║                                   ║
    ║   MAIN STREET                     ║
    ║                                   ║
    ║  Fog hangs thick over the town... ║
    ╚═══════════════════════════════════╝
    `;
  }

  tombASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║       TOMB OF HORRORS             ║
    ║                                   ║
    ║         ╱╲╱╲╱╲╱╲╱╲╱╲             ║
    ║        ╱ ╔═════════╗ ╲            ║
    ║       ╱  ║  TOMB   ║  ╲           ║
    ║       ║  ║  OF     ║   ║          ║
    ║       ║  ║ HORRORS ║   ║          ║
    ║       ║  ║         ║   ║          ║
    ║       ║  ║ ░░░░░░  ║   ║          ║
    ║       ║  ║░░░⚰️░░░░║   ║          ║
    ║       ║  ║░░░░░░░░║   ║          ║
    ║       ║  ║░░ ⚱️  ░░║   ║          ║
    ║       ║  ║░░░░░░░░║   ║          ║
    ║       ║  ╚═════════╝   ║          ║
    ║        ╲ ╱╲╱╲╱╲╱╲╱╲╱╲ ╱           ║
    ║         ╲╱╲╱╲╱╲╱╲╱╲╱╱            ║
    ║                                   ║
    ║  Nothing stirs. Nothing breathes. ║
    ╚═══════════════════════════════════╝
    `;
  }

  caveASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║      CAVERN OF THE UNKNOWN        ║
    ║                                   ║
    ║  ╭─────────────────────────────╮  ║
    ║ ╱                               ╲  ║
    ║│  ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ║
    ║│  ░░░  VAST DARKNESS  ░░░░░░  │  ║
    ║│  ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ║
    ║│                                │  ║
    ║│  ~~~~~~~~~~~~~~~~~~    ~~~     │  ║
    ║│   (UNDERGROUND      (LAKE)     │  ║
    ║│    RIVER)                      │  ║
    ║│                                │  ║
    ║│  Stalagmites jut from the      │  ║
    ║│  darkness like teeth.          │  ║
    ║│                                │  ║
    ║│  ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ║
    ║ ╲                               ╱   ║
    ║  ╰─────────────────────────────╯   ║
    ║                                   ║
    ║  Water echoes. Eyes gleam red.   ║
    ╚═══════════════════════════════════╝
    `;
  }

  mountainASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║     MOUNTAIN OF THE ANCIENTS      ║
    ║                                   ║
    ║              △ △                  ║
    ║             △   △               ║
    ║            △  ▲  △              ║
    ║           △  ╱ ╲  △             ║
    ║          △  ╱   ╲  △            ║
    ║         △  ╱ PEAK ╲  △          ║
    ║        △  ╱_______╲  △         ║
    ║       △  ╱         ╲  △        ║
    ║      △  ╱  TEMPLE   ╲  △      ║
    ║     △  ╱  OF STONE   ╲  △    ║
    ║    △  ╱_____________╲  △   ║
    ║   △                   △  △  ║
    ║  △                     △   △ ║
    ║ △                       △   ║
    ║                           △  ║
    ║  ROCKY                       ║
    ║  SLOPES                      ║
    ║                                   ║
    ║  Snow falls. Gods watch.        ║
    ╚═══════════════════════════════════╝
    `;
  }

  genericSceneASCII() {
    return `
    ╔═══════════════════════════════════╗
    ║          UNKNOWN PLACE            ║
    ║                                   ║
    ║                                   ║
    ║          ~ MYSTERY ~              ║
    ║                                   ║
    ║     What do you see around        ║
    ║          you?                     ║
    ║                                   ║
    ║                                   ║
    ╚═══════════════════════════════════╝
    `;
  }

  /**
   * Display scene with image
   */
  async displayScene(sceneName, sceneDescription) {
    const image = await this.getSceneImage(sceneName, sceneDescription);
    console.clear();
    console.log(image);
    console.log('\n');
  }

  /**
   * List cached images
   */
  listCachedImages() {
    const files = fs.readdirSync(this.cacheDir);
    console.log(`\n🖼️  Cached scene images: ${files.length}\n`);
    files.forEach(f => console.log(`  - ${f.replace('.txt', '')}`));
  }
}

export { CliImageDisplay };
