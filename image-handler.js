#!/usr/bin/env node

/**
 * D&D Telegram Image Handler
 * Generates DALLE-3 images, persists them locally, sends to Telegram
 * 
 * Usage:
 *   node image-handler.js "A dragon in a stone chamber" [chatId] [caption]
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8552323205:AAHUOPhywiY_Xx-envETYzpd72Al_xJOysI';
const IMAGES_DIR = path.join(__dirname, 'images', 'generated');
const CACHE_FILE = path.join(__dirname, 'images', 'image-cache.json');

// Ensure directories exist
[IMAGES_DIR, path.dirname(CACHE_FILE)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Cache system - prevent regenerating the same image
 */
class ImageCache {
  constructor() {
    this.cache = this.load();
  }

  load() {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }

  save() {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cache, null, 2));
  }

  getKey(prompt) {
    return crypto.createHash('md5').update(prompt).digest('hex');
  }

  has(prompt) {
    return this.cache[this.getKey(prompt)] !== undefined;
  }

  get(prompt) {
    const key = this.getKey(prompt);
    const entry = this.cache[key];
    if (entry && fs.existsSync(entry.filepath)) {
      return entry;
    }
    // Remove stale cache entry
    delete this.cache[key];
    this.save();
    return null;
  }

  set(prompt, filepath, metadata = {}) {
    const key = this.getKey(prompt);
    this.cache[key] = {
      prompt,
      filepath,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.save();
  }
}

/**
 * Download image from URL and save locally
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGES_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

/**
 * Generate image using DALLE-3
 */
async function generateImageDALLE(prompt) {
  const cache = new ImageCache();
  
  // Check cache first
  const cached = cache.get(prompt);
  if (cached) {
    console.log(`✅ Cache hit: ${cached.filepath}`);
    return cached;
  }

  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OPENAI_API_KEY not set in environment'
    };
  }

  const fullPrompt = `${prompt}. 1979 D&D module art style, Erol Otus or David Sutherland illustration style, ink and watercolor, atmospheric lighting, vintage TSR aesthetic`;
  
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

    if (!data.data || !data.data[0]) {
      return {
        success: false,
        error: data.error?.message || 'Unknown error'
      };
    }

    const url = data.data[0].url;
    const timestamp = Date.now();
    const filename = `dalle-${crypto.randomBytes(4).toString('hex')}-${timestamp}.png`;

    console.log(`📥 Downloading image: ${filename}`);
    const filepath = await downloadImage(url, filename);

    // Cache it
    cache.set(prompt, filepath, {
      source: 'dalle',
      revised_prompt: data.data[0].revised_prompt
    });

    return {
      success: true,
      filepath,
      filename,
      url: `file://${filepath}`,
      original_prompt: prompt,
      revised_prompt: data.data[0].revised_prompt
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send image to Telegram
 */
async function sendImageToTelegram(filepath, chatId, caption = '') {
  if (!fs.existsSync(filepath)) {
    return {
      success: false,
      error: 'File not found: ' + filepath
    };
  }

  const fileStream = fs.createReadStream(filepath);
  const formData = new FormData();
  
  formData.append('chat_id', chatId);
  formData.append('photo', fileStream);
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      }
    );

    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        message_id: data.result.message_id,
        chat_id: chatId
      };
    }

    return {
      success: false,
      error: data.description || 'Unknown Telegram error'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Main function: Generate and send image
 */
async function generateAndSendImage(prompt, chatId, caption = '') {
  console.log(`\n🎨 Generating image for: "${prompt.substring(0, 50)}..."`);

  // Generate
  const imageResult = await generateImageDALLE(prompt);

  if (!imageResult.success) {
    console.error(`❌ Image generation failed: ${imageResult.error}`);
    return imageResult;
  }

  console.log(`✅ Image generated: ${imageResult.filepath}`);

  // Send to Telegram
  if (chatId) {
    const telegramResult = await sendImageToTelegram(imageResult.filepath, chatId, caption);
    
    if (telegramResult.success) {
      console.log(`✅ Sent to Telegram: chat ${chatId}, message ${telegramResult.message_id}`);
    } else {
      console.error(`❌ Telegram send failed: ${telegramResult.error}`);
    }

    return {
      ...imageResult,
      telegram: telegramResult
    };
  }

  return imageResult;
}

/**
 * Wrapper functions for different scene types
 */
async function generateRoomImage(roomDescription, chatId, environment = '', lighting = '') {
  const prompt = `${roomDescription}, ${environment}, ${lighting}, ancient dungeon`;
  const caption = `🏛️ *${roomDescription}*`;
  return generateAndSendImage(prompt, chatId, caption);
}

async function generateMonsterImage(monsterName, chatId, description = '', habitat = '') {
  const prompt = `${monsterName}: ${description}, ${habitat}`;
  const caption = `👹 *${monsterName}*\n_${description}_`;
  return generateAndSendImage(prompt, chatId, caption);
}

async function generateBattleImage(party, chatId, enemies = '', environment = '', action = '') {
  const prompt = `${party} fighting ${enemies} in ${environment}, ${action}, dynamic combat pose`;
  const caption = `⚔️ *COMBAT INITIATIVE*\n_${enemies} appear!_`;
  return generateAndSendImage(prompt, chatId, caption);
}

// CLI test
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2] || 'Ancient Olman temple entrance overgrown by jungle, weathered stone doorway with geometric carvings, thick vines, torchlight, stairs descending into darkness';
  const chatId = process.argv[3] || null;

  console.log('🎮 D&D Image Handler');
  console.log('===================');
  console.log(`Prompt: ${prompt}`);
  if (chatId) console.log(`Chat ID: ${chatId}`);

  generateAndSendImage(prompt, chatId, `🏛️ *Scene Generated*`)
    .then(result => {
      if (result.success) {
        console.log('\n✅ Success!');
        console.log(`File: ${result.filepath}`);
        if (result.telegram?.success) {
          console.log(`Telegram Message ID: ${result.telegram.message_id}`);
        }
      } else {
        console.log(`\n❌ Failed: ${result.error}`);
      }
      process.exit(result.success ? 0 : 1);
    });
}

export {
  generateImageDALLE,
  generateAndSendImage,
  generateRoomImage,
  generateMonsterImage,
  generateBattleImage,
  sendImageToTelegram,
  downloadImage,
  ImageCache
};
