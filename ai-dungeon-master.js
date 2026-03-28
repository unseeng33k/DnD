#!/usr/bin/env node

/**
 * AI DUNGEON MASTER (Claude-Powered)
 * 
 * Claude runs the entire campaign:
 * - Narrates scenes
 * - Generates encounters on-the-fly
 * - Makes NPC decisions
 * - Responds to player actions
 * - Tracks world state
 */

import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

class AIDungeonMaster {
  constructor(apiKey, moduleContext) {
    this.apiKey = apiKey;
    this.moduleContext = moduleContext;
    this.conversationHistory = [];
    this.worldState = {
      currentLocation: 'Tavern',
      timeOfDay: 'evening',
      weather: 'clear',
      npcStates: {},
      eventsOccurred: []
    };
  }

  /**
   * Initialize system prompt for DM
   */
  getSystemPrompt() {
    return `You are an expert Dungeons & Dragons 1st Edition Dungeon Master. You:

1. Narrate vivid, atmospheric scenes in 2-3 sentences max
2. Make NPCs memorable with distinct personalities
3. Respond to player actions creatively within AD&D 1e rules
4. Generate encounters that fit the module context
5. Track world state and remember player choices
6. Make tough calls on rules (err on side of player fun)
7. Inject danger AND humor
8. Describe consequences vividly

Module Context: ${JSON.stringify(this.moduleContext, null, 2)}

Current World State: ${JSON.stringify(this.worldState, null, 2)}

Always stay in character. Respond as the DM directly to the party.`;
  }

  /**
   * Call Claude API
   */
  async callClaude(userMessage) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1-20250805',
          max_tokens: 1000,
          system: this.getSystemPrompt(),
          messages: this.conversationHistory
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        return null;
      }

      const dmResponse = data.content[0].text;
      
      // Add to history
      this.conversationHistory.push({
        role: 'assistant',
        content: dmResponse
      });

      return dmResponse;
    } catch (error) {
      console.error('Error calling Claude:', error);
      return null;
    }
  }

  /**
   * Start AI-DM session
   */
  async startSession() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║  🎭 AI DUNGEON MASTER (CLAUDE) 🎭  ║');
    console.log('╚═══════════════════════════════════════╝\n');

    // Opening scene
    const opening = await this.callClaude(
      `We are starting an adventure in this module. Set the opening scene: where are we, what time of day, what do we see? Then ask what the party does.`
    );

    if (opening) {
      console.log(`\n📖 DM:\n${opening}\n`);
    }

    // Play loop
    let playing = true;
    while (playing) {
      const playerAction = await question('\n🎲 What do you do? (or "quit" to exit): ');

      if (playerAction.toLowerCase() === 'quit') {
        playing = false;
        console.log('\n👋 Thanks for playing!');
        break;
      }

      const response = await this.callClaude(playerAction);
      if (response) {
        console.log(`\n📖 DM:\n${response}`);
      } else {
        console.log('Error getting response from AI DM');
      }
    }

    rl.close();
  }

  /**
   * Save session log
   */
  saveSessionLog(filename) {
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify({
      module: this.moduleContext,
      worldState: this.worldState,
      conversation: this.conversationHistory,
      savedAt: new Date().toISOString()
    }, null, 2));
    
    return filename;
  }
}

// Main
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set');
  process.exit(1);
}

const moduleContext = {
  name: process.argv[2] || 'Ravenloft',
  code: process.argv[3] || 'I6',
  level: '7-10',
  theme: 'gothic horror'
};

const dm = new AIDungeonMaster(apiKey, moduleContext);
dm.startSession().catch(console.error);
