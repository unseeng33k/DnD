#!/usr/bin/env node

/**
 * D&D Session Runner with Image Integration
 * 
 * This module handles:
 * - Loading campaign sessions
 * - Generating scene images
 * - Sending to Telegram
 * - Tracking player actions
 * 
 * Usage:
 *   import { DndSessionRunner } from './session-runner.js';
 *   const runner = new DndSessionRunner('Curse of Strahd', TELEGRAM_CHAT_ID);
 *   await runner.loadSession(sessionNumber);
 *   await runner.startScene(sceneDescription);
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAndSendImage, generateRoomImage, generateMonsterImage, generateBattleImage } from './image-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DndSessionRunner {
  constructor(campaignName, telegramChatId) {
    this.campaignName = campaignName;
    this.chatId = telegramChatId;
    this.campaignDir = path.join(__dirname, 'campaigns', campaignName);
    this.sessionState = null;
    this.currentScene = null;
    this.imageLog = [];
  }

  /**
   * Load a session from campaign files
   */
  async loadSession(sessionNumber) {
    const sessionFile = path.join(this.campaignDir, 'sessions', `session-${sessionNumber}.json`);
    
    if (!fs.existsSync(sessionFile)) {
      console.log(`❌ Session file not found: ${sessionFile}`);
      return { success: false, error: 'Session not found' };
    }

    try {
      this.sessionState = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      console.log(`✅ Loaded session ${sessionNumber} from ${this.campaignName}`);
      return { success: true, session: this.sessionState };
    } catch (err) {
      console.log(`❌ Failed to load session: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate and send opening scene image
   */
  async startScene(sceneDescription, environment = '', lighting = 'torchlight') {
    if (!this.chatId) {
      console.log('⚠️  No Telegram chat ID set. Skipping image send.');
    }

    const result = await generateRoomImage(
      sceneDescription,
      this.chatId,
      environment,
      lighting
    );

    if (result.success) {
      this.currentScene = {
        description: sceneDescription,
        imageFile: result.filepath,
        timestamp: new Date().toISOString()
      };
      this.imageLog.push(result);
      console.log(`✅ Scene image sent: ${result.filepath}`);
    } else {
      console.log(`❌ Scene image failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Generate encounter image
   */
  async startEncounter(monsterName, description, habitat) {
    if (!this.chatId) {
      console.log('⚠️  No Telegram chat ID set. Skipping image send.');
    }

    const result = await generateMonsterImage(monsterName, this.chatId, description, habitat);

    if (result.success) {
      this.imageLog.push(result);
      console.log(`✅ Monster image sent: ${result.filepath}`);
    } else {
      console.log(`❌ Monster image failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Generate combat scene
   */
  async startBattle(partyDescription, enemies, environment, action) {
    if (!this.chatId) {
      console.log('⚠️  No Telegram chat ID set. Skipping image send.');
    }

    const result = await generateBattleImage(partyDescription, this.chatId, enemies, environment, action);

    if (result.success) {
      this.imageLog.push(result);
      console.log(`✅ Battle image sent: ${result.filepath}`);
    } else {
      console.log(`❌ Battle image failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Custom image generation
   */
  async generateCustomImage(prompt, caption = '') {
    if (!this.chatId) {
      console.log('⚠️  No Telegram chat ID set. Skipping image send.');
    }

    const result = await generateAndSendImage(prompt, this.chatId, caption || prompt);

    if (result.success) {
      this.imageLog.push(result);
    }

    return result;
  }

  /**
   * Save session state including image log
   */
  saveSessionState() {
    const stateFile = path.join(this.campaignDir, `session-state-${Date.now()}.json`);
    
    const state = {
      campaign: this.campaignName,
      session: this.sessionState,
      currentScene: this.currentScene,
      imageLog: this.imageLog,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log(`✅ Session state saved: ${stateFile}`);
    return stateFile;
  }

  /**
   * Get all images from this session
   */
  getImages() {
    return this.imageLog.map(img => ({
      filepath: img.filepath,
      prompt: img.original_prompt || img.prompt,
      timestamp: img.timestamp || img.telegram?.timestamp
    }));
  }
}

export { DndSessionRunner };
