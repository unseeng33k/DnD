#!/usr/bin/env node

/**
 * NPC Manager
 * Tracks NPCs and characters with personalities for roleplay
 */

const fs = require('fs');
const path = require('path');

class NPCManager {
  constructor(campaignName) {
    this.campaignDir = path.join(__dirname, '..', '..', 'campaigns', campaignName);
    this.npcsDir = path.join(this.campaignDir, 'npcs');
    this.npcs = {};
    this.loadAll();
  }

  loadAll() {
    if (!fs.existsSync(this.npcsDir)) return;
    
    const files = fs.readdirSync(this.npcsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const npc = JSON.parse(fs.readFileSync(path.join(this.npcsDir, file), 'utf8'));
        this.npcs[npc.name.toLowerCase()] = npc;
      }
    }
  }

  save(npc) {
    if (!fs.existsSync(this.npcsDir)) {
      fs.mkdirSync(this.npcsDir, { recursive: true });
    }
    
    const file = path.join(this.npcsDir, `${npc.name.replace(/[^a-z0-9]/gi, '_')}.json`);
    fs.writeFileSync(file, JSON.stringify(npc, null, 2));
    this.npcs[npc.name.toLowerCase()] = npc;
  }

  create(data) {
    const npc = {
      name: data.name,
      race: data.race || 'Unknown',
      occupation: data.occupation || 'Unknown',
      location: data.location || 'Unknown',
      
      // Personality
      personality: data.personality || 'Neutral',
      motivation: data.motivation || 'Survival',
      fear: data.fear || 'Unknown',
      secret: data.secret || '',
      
      // Interaction
      attitude: data.attitude || 'neutral', // friendly, hostile, neutral, fearful
      disposition: data.disposition || 0, // -10 to +10 scale
      
      // Knowledge
      knows: data.knows || [],
      willShare: data.willShare || [],
      willNotShare: data.willNotShare || [],
      
      // Voice
      speechPattern: data.speechPattern || 'normal',
      mannerisms: data.mannerisms || '',
      catchphrase: data.catchphrase || '',
      
      // Stats (if needed)
      hp: data.hp || 10,
      ac: data.ac || 10,
      
      // Tracking
      met: data.met || false,
      interactions: data.interactions || [],
      notes: data.notes || ''
    };
    
    this.save(npc);
    return npc;
  }

  get(name) {
    return this.npcs[name.toLowerCase()];
  }

  list() {
    return Object.values(this.npcs);
  }

  listByAttitude(attitude) {
    return this.list().filter(n => n.attitude === attitude);
  }

  listByLocation(location) {
    return this.list().filter(n => n.location === location);
  }

  updateDisposition(name, change) {
    const npc = this.get(name);
    if (!npc) return null;
    
    npc.disposition = Math.max(-10, Math.min(10, npc.disposition + change));
    
    // Update attitude based on disposition
    if (npc.disposition >= 7) npc.attitude = 'friendly';
    else if (npc.disposition >= 3) npc.attitude = 'helpful';
    else if (npc.disposition <= -7) npc.attitude = 'hostile';
    else if (npc.disposition <= -3) npc.attitude = 'suspicious';
    else npc.attitude = 'neutral';
    
    this.save(npc);
    return npc;
  }

  logInteraction(name, interaction) {
    const npc = this.get(name);
    if (!npc) return null;
    
    npc.interactions.push({
      date: new Date().toISOString(),
      ...interaction
    });
    
    npc.met = true;
    this.save(npc);
    return npc;
  }

  // Roleplay helpers
  speak(name, message, context = {}) {
    const npc = this.get(name);
    if (!npc) return `[NPC ${name} not found]`;

    let output = `\n🎭 **${npc.name}**`;
    if (npc.occupation) output += ` (${npc.occupation})`;
    output += '\n\n';
    
    // Add mannerism if available
    if (npc.mannerisms && Math.random() > 0.5) {
      output += `*${npc.mannerisms}*\n\n`;
    }
    
    // Format speech based on pattern
    let speech = message;
    switch (npc.speechPattern) {
      case 'stutter':
        speech = this.addStutter(speech);
        break;
      case 'whisper':
        speech = `*whispers* ${speech}`;
        break;
      case 'loud':
        speech = speech.toUpperCase();
        break;
      case 'formal':
        speech = this.makeFormal(speech);
        break;
      case 'broken':
        speech = this.makeBroken(speech);
        break;
    }
    
    output += `"${speech}"`;
    
    if (npc.catchphrase && Math.random() > 0.7) {
      output += `\n\n${npc.catchphrase}`;
    }
    
    return output;
  }

  addStutter(text) {
    return text.split(' ').map(w => {
      if (w.length > 3 && Math.random() > 0.7) {
        return `${w[0]}-${w}`;
      }
      return w;
    }).join(' ');
  }

  makeFormal(text) {
    return text.replace(/\b(you're|you are|don't|do not|can't|cannot)\b/gi, match => {
      const formal = {
        "you're": "thou art",
        "you are": "thou art",
        "don't": "do not",
        "do not": "do not",
        "can't": "cannot",
        "cannot": "cannot"
      };
      return formal[match.toLowerCase()] || match;
    });
  }

  makeBroken(text) {
    return text.replace(/\b(the|a|an|is|are|was|were)\b/gi, '');
  }

  getReaction(name, partyAction) {
    const npc = this.get(name);
    if (!npc) return null;

    const reactions = {
      friendly: ['helps willingly', 'offers advice', 'shares information'],
      helpful: ['assists', 'answers questions', 'gives directions'],
      neutral: ['watches cautiously', 'answers briefly', 'waits to see intent'],
      suspicious: ['questions motives', 'withholds information', 'prepares to flee'],
      hostile: ['refuses cooperation', 'threatens', 'calls for guards'],
      fearful: ['trembles', 'pleads', 'offers anything to be left alone']
    };

    const opts = reactions[npc.attitude] || reactions.neutral;
    return opts[Math.floor(Math.random() * opts.length)];
  }

  printNPC(name) {
    const npc = this.get(name);
    if (!npc) {
      console.log(`NPC "${name}" not found.`);
      return;
    }

    console.log(`\n🎭 ${npc.name.toUpperCase()}\n`);
    console.log(`Race: ${npc.race}`);
    console.log(`Occupation: ${npc.occupation}`);
    console.log(`Location: ${npc.location}`);
    console.log(`\nPersonality: ${npc.personality}`);
    console.log(`Motivation: ${npc.motivation}`);
    console.log(`Fear: ${npc.fear}`);
    if (npc.secret) console.log(`Secret: ${npc.secret}`);
    console.log(`\nAttitude: ${npc.attitude} (${npc.disposition}/10)`);
    console.log(`Speech: ${npc.speechPattern}`);
    if (npc.mannerisms) console.log(`Mannerisms: ${npc.mannerisms}`);
    if (npc.catchphrase) console.log(`Catchphrase: "${npc.catchphrase}"`);
    console.log(`\nMet: ${npc.met ? 'Yes' : 'No'}`);
    console.log(`Interactions: ${npc.interactions.length}`);
  }

  printAll() {
    const npcs = this.list();
    if (npcs.length === 0) {
      console.log('No NPCs found.');
      return;
    }

    console.log('\n🎭 NPCs:\n');
    for (const npc of npcs) {
      const status = npc.met ? '✓' : '○';
      console.log(`  ${status} ${npc.name} - ${npc.occupation} (${npc.attitude})`);
    }
  }

  printHelp() {
    console.log(`
🎭 NPC MANAGER

Manage NPCs with personalities for roleplay.

USAGE:
  node npc-manager.js create <campaign>    Create new NPC
  node npc-manager.js list <campaign>      List all NPCs
  node npc-manager.js show <campaign> <name>  Show NPC details
  node npc-manager.js speak <campaign> <name> <message>  Roleplay speech

EXAMPLES:
  node npc-manager.js create "Tamoachan Expedition"
  node npc-manager.js list "Tamoachan Expedition"
  node npc-manager.js show "Tamoachan Expedition" "Tomas"
  node npc-manager.js speak "Tamoachan Expedition" "Tomas" "Thank you for saving me"
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    const npcm = new NPCManager('help');
    npcm.printHelp();
    process.exit(0);
  }

  if (command === 'create') {
    if (!args[1]) {
      console.log('Usage: create <campaign-name>');
      process.exit(1);
    }
    // Interactive creation would go here
    console.log('Interactive NPC creation not yet implemented.');
    console.log('Create NPCs by editing files in campaigns/<name>/npcs/');
    process.exit(0);
  }

  if (command === 'list') {
    if (!args[1]) {
      console.log('Usage: list <campaign-name>');
      process.exit(1);
    }
    const npcm = new NPCManager(args[1]);
    npcm.printAll();
    process.exit(0);
  }

  if (command === 'show') {
    if (!args[1] || !args[2]) {
      console.log('Usage: show <campaign-name> <npc-name>');
      process.exit(1);
    }
    const npcm = new NPCManager(args[1]);
    npcm.printNPC(args[2]);
    process.exit(0);
  }

  if (command === 'speak') {
    if (!args[1] || !args[2] || !args[3]) {
      console.log('Usage: speak <campaign-name> <npc-name> <message>');
      process.exit(1);
    }
    const npcm = new NPCManager(args[1]);
    console.log(npcm.speak(args[2], args.slice(3).join(' ')));
    process.exit(0);
  }
}

module.exports = NPCManager;
