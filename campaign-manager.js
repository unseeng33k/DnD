#!/usr/bin/env node

/**
 * Campaign Manager
 * Creates and manages separate folders for each module/campaign
 */

const fs = require('fs');
const path = require('path');
const ModuleParser = require('./skills/ambiance-agent/module-parser');

class CampaignManager {
  constructor() {
    this.campaignsDir = path.join(__dirname, 'campaigns');
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.campaignsDir)) {
      fs.mkdirSync(this.campaignsDir, { recursive: true });
    }
  }

  /**
   * Create a new campaign folder structure
   */
  createCampaign(moduleName, campaignName = null) {
    const parser = new ModuleParser();
    const module = parser.getModule(moduleName);
    
    if (!module) {
      console.log(`Module "${moduleName}" not found.`);
      console.log('Available:');
      parser.listModules().forEach(m => console.log(`  - ${m.name} (${m.code})`));
      return null;
    }

    const name = campaignName || `${module.name.replace(/[^a-z0-9]/gi, '_')}_Campaign`;
    const campaignDir = path.join(this.campaignsDir, name);
    
    if (fs.existsSync(campaignDir)) {
      console.log(`Campaign "${name}" already exists at:`);
      console.log(campaignDir);
      return campaignDir;
    }

    // Create folder structure
    const folders = [
      '',
      'sessions',
      'maps',
      'images',
      'logs',
      'npcs',
      'treasure',
      'handouts'
    ];

    for (const folder of folders) {
      fs.mkdirSync(path.join(campaignDir, folder), { recursive: true });
    }

    // Create campaign.json
    const campaignData = {
      name: name,
      module: module.name,
      moduleCode: module.code,
      edition: module.edition,
      created: new Date().toISOString(),
      currentSession: 1,
      partyLocation: module.scenes[0]?.name || 'Start',
      scenes: module.scenes.map(s => ({
        name: s.name,
        visited: false,
        cleared: false,
        notes: ''
      })),
      monsters: module.monsters.map(m => ({
        name: m,
        encountered: 0,
        killed: 0
      })),
      npcs: module.keyNPCs.map(n => ({
        name: n,
        met: false,
        attitude: 'unknown',
        notes: ''
      })),
      treasure: {
        found: [],
        totalValue: 0
      },
      xp: {
        total: 0,
        perCharacter: {}
      }
    };

    fs.writeFileSync(
      path.join(campaignDir, 'campaign.json'),
      JSON.stringify(campaignData, null, 2)
    );

    // Create session log template
    fs.writeFileSync(
      path.join(campaignDir, 'sessions', 'session_001.md'),
      this.generateSessionTemplate(1, module.scenes[0]?.name)
    );

    // Create README
    fs.writeFileSync(
      path.join(campaignDir, 'README.md'),
      this.generateReadme(name, module)
    );

    // Create scenes checklist
    fs.writeFileSync(
      path.join(campaignDir, 'scenes_checklist.md'),
      this.generateScenesChecklist(module)
    );

    console.log(`\n✅ Campaign created: ${name}\n`);
    console.log(`📁 Location: ${campaignDir}\n`);
    console.log('Folder structure:');
    console.log('  📂 sessions/    - Session logs and notes');
    console.log('  📂 maps/        - ASCII maps and dungeon layouts');
    console.log('  📂 images/      - Generated images for scenes/monsters');
    console.log('  📂 logs/        - Combat logs and event tracking');
    console.log('  📂 npcs/        - NPC notes and interactions');
    console.log('  📂 treasure/     - Found treasure and loot');
    console.log('  📂 handouts/     - Player handouts');
    console.log('\nFiles created:');
    console.log('  📄 campaign.json     - Campaign state and tracking');
    console.log('  📄 README.md         - Campaign overview');
    console.log('  📄 scenes_checklist.md - Scene completion tracker');
    console.log('  📄 sessions/session_001.md - First session log');

    return campaignDir;
  }

  generateSessionTemplate(sessionNum, startingLocation) {
    return `# Session ${sessionNum.toString().padStart(3, '0')}

**Date:** ${new Date().toLocaleDateString()}  
**Starting Location:** ${startingLocation || 'TBD'}  
**Party Level:** 

## Session Goals
- [ ] 
- [ ] 
- [ ] 

## Events

### Opening Scene


### Key Moments


### Combat Encounters


### Discoveries


### NPC Interactions


## Session End
**Ending Location:**  
**XP Earned:**  
**Treasure Found:**  
**Next Session Preview:** 

## Notes for Next Time


---
*Logged: ${new Date().toISOString()}*
`;
  }

  generateReadme(name, module) {
    return `# ${name}

## ${module.name} (${module.code})

**Edition:** ${module.edition}  
**Created:** ${new Date().toLocaleDateString()}

## Overview

This folder contains everything for the ${module.name} campaign.

## Quick Links

- [Campaign State](campaign.json) - Current progress and tracking
- [Scenes Checklist](scenes_checklist.md) - What has been explored
- [Session Logs](sessions/) - Complete session history

## Scenes (${module.scenes.length})

${module.scenes.map((s, i) => `${i + 1}. ${s.name} - ${s.description.substring(0, 60)}...`).join('\n')}

## Monsters Encountered

${module.monsters.map(m => `- ${m}`).join('\n')}

## Key NPCs

${module.keyNPCs.map(n => `- ${n}`).join('\n')}

## Folder Guide

- **sessions/** - Write session logs here after each game
- **maps/** - Save ASCII maps and location diagrams
- **images/** - Store generated images for scenes and monsters
- **logs/** - Combat logs, treasure logs, etc.
- **npcs/** - Notes on NPCs, their motivations, interactions
- **treasure/** - List of found treasure and who has what
- **handouts/** - Anything given to players

## Using the Game Engine

\`\`\`bash
# Show current campaign status
node game-engine.js campaign status

# Log a session event
node game-engine.js campaign log "Party entered the dungeon"

# Update scene status
node game-engine.js campaign scene "Antechamber" --visited

# Track monster kill
node game-engine.js campaign kill goblin 3

# Add treasure
node game-engine.js campaign treasure "100 gp, +1 sword"

# Award XP
node game-engine.js campaign xp 500
\`\`\`

---
*Campaign folder created by D&D Campaign Manager*
`;
  }

  generateScenesChecklist(module) {
    return `# Scenes Checklist - ${module.name}

${module.scenes.map((s, i) => `
## ${i + 1}. ${s.name}

**Type:** ${s.type}  
**Mood:** ${s.mood}

${s.description}

- [ ] Visited
- [ ] Cleared of threats
- [ ] Looted
- [ ] Notes recorded

**Notes:**


---
`).join('')}
`;
  }

  listCampaigns() {
    const campaigns = [];
    const entries = fs.readdirSync(this.campaignsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const campaignFile = path.join(this.campaignsDir, entry.name, 'campaign.json');
        if (fs.existsSync(campaignFile)) {
          const data = JSON.parse(fs.readFileSync(campaignFile, 'utf8'));
          campaigns.push({
            name: entry.name,
            module: data.module,
            created: data.created,
            currentSession: data.currentSession,
            partyLocation: data.partyLocation
          });
        }
      }
    }
    
    return campaigns;
  }

  printCampaigns() {
    const campaigns = this.listCampaigns();
    
    if (campaigns.length === 0) {
      console.log('No campaigns found.');
      console.log('Create one with: node campaign-manager.js create <module>');
      return;
    }

    console.log('\n📚 Active Campaigns:\n');
    for (const c of campaigns) {
      console.log(`📁 ${c.name}`);
      console.log(`   Module: ${c.module}`);
      console.log(`   Session: ${c.currentSession}`);
      console.log(`   Location: ${c.partyLocation}`);
      console.log(`   Created: ${new Date(c.created).toLocaleDateString()}`);
      console.log('');
    }
  }

  printHelp() {
    console.log(`
📚 CAMPAIGN MANAGER

Create and manage separate folders for each module.

USAGE:
  node campaign-manager.js create <module> [name]   Create new campaign
  node campaign-manager.js list                      List all campaigns
  node campaign-manager.js info <name>               Show campaign details

MODULES:
  tamoachan          - Hidden Shrine of Tamoachan
  tomb of horrors    - Tomb of Horrors
  ravenloft          - Ravenloft
  temple of elemental evil - Temple of Elemental Evil
  against the giants - Against the Giants
  white plume mountain - White Plume Mountain

EXAMPLES:
  node campaign-manager.js create tamoachan
  node campaign-manager.js create ravenloft "Curse of Strahd"
  node campaign-manager.js list

FOLDER STRUCTURE:
  📂 sessions/    - Session logs and notes
  📂 maps/        - ASCII maps
  📂 images/      - Generated images
  📂 logs/        - Combat and event logs
  📂 npcs/        - NPC notes
  📂 treasure/    - Found treasure
  📂 handouts/    - Player handouts
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new CampaignManager();

  switch (command) {
    case 'create':
      if (!args[1]) {
        console.log('Usage: create <module> [campaign-name]');
        console.log('Example: create tamoachan "Jungle Expedition"');
        process.exit(1);
      }
      manager.createCampaign(args[1], args[2]);
      break;

    case 'list':
      manager.printCampaigns();
      break;

    case 'help':
    default:
      manager.printHelp();
      break;
  }
}

module.exports = CampaignManager;
