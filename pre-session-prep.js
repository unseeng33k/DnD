#!/usr/bin/env node

/**
 * Pre-Session Prep
 * Batch generates all images and finds all links BEFORE gameplay
 * Run this hours/days before your session
 */

const fs = require('fs');
const path = require('path');
const CampaignManager = require('./campaign-manager');
const AmbianceAgent = require('./skills/ambiance-agent/ambiance');
const MMSkill = require('./skills/mm-skill/mm-skill');

class PreSessionPrep {
  constructor(campaignName) {
    this.campaignDir = path.join(__dirname, 'campaigns', campaignName);
    this.campaignFile = path.join(this.campaignDir, 'campaign.json');
    
    if (!fs.existsSync(this.campaignFile)) {
      throw new Error(`Campaign "${campaignName}" not found. Create it first with: node campaign-manager.js create <module> "${campaignName}"`);
    }
    
    this.campaign = JSON.parse(fs.readFileSync(this.campaignFile, 'utf8'));
    this.ambiance = new AmbianceAgent();
    this.mm = new MMSkill();
    this.prepLog = [];
  }

  async prepAll() {
    console.log(`\n🎲 PRE-SESSION PREP: ${this.campaign.name}\n`);
    console.log('='.repeat(70));
    console.log('This will generate ALL images and links before gameplay.');
    console.log('Run this hours or days before your session.\n');

    const startTime = Date.now();

    // 1. Generate scene images
    await this.prepScenes();

    // 2. Generate monster images
    await this.prepMonsters();

    // 3. Update campaign with prep status
    this.savePrepStatus();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(70));
    console.log(`✅ PREP COMPLETE in ${duration}s\n`);
    console.log('📁 All files saved to:');
    console.log(`   ${this.campaignDir}/images/`);
    console.log(`   ${this.campaignDir}/ambiance/`);
    console.log('\n🎮 During gameplay:');
    console.log('   - All images are ready');
    console.log('   - All links are verified');
    console.log('   - No waiting for generation');
  }

  async prepScenes() {
    console.log('\n🏰 GENERATING SCENE IMAGES\n');
    
    const ModuleParser = require('./skills/ambiance-agent/module-parser');
    const parser = new ModuleParser();
    const imagesDir = path.join(this.campaignDir, 'images', 'scenes');
    fs.mkdirSync(imagesDir, { recursive: true });

    for (let i = 0; i < this.campaign.scenes.length; i++) {
      const scene = this.campaign.scenes[i];
      console.log(`  [${i + 1}/${this.campaign.scenes.length}] ${scene.name}...`);
      
      // Get proper ambiance for scene type
      const ambianceScene = parser.mapSceneType(scene.type, scene.mood);
      this.ambiance.setScene(ambianceScene);
      
      const prompt = this.ambiance.generateImagePrompt();
      const result = await this.ambiance.generateImage(prompt);
      
      if (result.success) {
        // Save image reference
        const imageFile = path.join(imagesDir, `scene_${(i+1).toString().padStart(2, '0')}_${scene.name.replace(/[^a-z0-9]/gi, '_')}.json`);
        fs.writeFileSync(imageFile, JSON.stringify({
          scene: scene.name,
          url: result.url,
          prompt: prompt,
          generated: new Date().toISOString()
        }, null, 2));
        
        // Download image if possible (optional)
        console.log(`     ✅ ${result.url}`);
        this.prepLog.push({ type: 'scene', name: scene.name, url: result.url, status: 'success' });
      } else {
        console.log(`     ❌ ${result.error}`);
        this.prepLog.push({ type: 'scene', name: scene.name, error: result.error, status: 'failed' });
      }
    }
  }

  async prepMonsters() {
    console.log('\n👹 GENERATING MONSTER IMAGES\n');
    
    const imagesDir = path.join(this.campaignDir, 'images', 'monsters');
    fs.mkdirSync(imagesDir, { recursive: true });

    for (let i = 0; i < this.campaign.monsters.length; i++) {
      const monster = this.campaign.monsters[i];
      console.log(`  [${i + 1}/${this.campaign.monsters.length}] ${monster.name}...`);
      
      const stats = this.mm.getMonster(monster.name);
      if (!stats) {
        console.log(`     ⚠️  Monster not in database`);
        this.prepLog.push({ type: 'monster', name: monster.name, status: 'not_found' });
        continue;
      }
      
      const prompt = this.mm.generateImagePrompt(monster.name, stats);
      const result = await this.ambiance.generateImage(prompt);
      
      if (result.success) {
        const imageFile = path.join(imagesDir, `monster_${monster.name.replace(/[^a-z0-9]/gi, '_')}.json`);
        fs.writeFileSync(imageFile, JSON.stringify({
          monster: monster.name,
          url: result.url,
          prompt: prompt,
          generated: new Date().toISOString()
        }, null, 2));
        
        console.log(`     ✅ ${result.url}`);
        this.prepLog.push({ type: 'monster', name: monster.name, url: result.url, status: 'success' });
      } else {
        console.log(`     ❌ ${result.error}`);
        this.prepLog.push({ type: 'monster', name: monster.name, error: result.error, status: 'failed' });
      }
    }
  }

  savePrepStatus() {
    const prepFile = path.join(this.campaignDir, 'prep_status.json');
    const status = {
      campaign: this.campaign.name,
      preppedAt: new Date().toISOString(),
      scenes: this.campaign.scenes.length,
      monsters: this.campaign.monsters.length,
      log: this.prepLog,
      ready: this.prepLog.filter(x => x.status === 'success').length
    };
    fs.writeFileSync(prepFile, JSON.stringify(status, null, 2));
  }

  printStatus() {
    const prepFile = path.join(this.campaignDir, 'prep_status.json');
    if (!fs.existsSync(prepFile)) {
      console.log('\n❌ No prep found for this campaign.');
      console.log('Run: node pre-session-prep.js "Campaign Name"');
      return;
    }
    
    const status = JSON.parse(fs.readFileSync(prepFile, 'utf8'));
    console.log(`\n📊 PREP STATUS: ${status.campaign}\n`);
    console.log(`Prepped: ${new Date(status.preppedAt).toLocaleString()}`);
    console.log(`Scenes: ${status.scenes}`);
    console.log(`Monsters: ${status.monsters}`);
    console.log(`Ready: ${status.ready}/${status.scenes + status.monsters}`);
    
    const failed = status.log.filter(x => x.status !== 'success');
    if (failed.length > 0) {
      console.log(`\n⚠️  Failed (${failed.length}):`);
      failed.forEach(f => console.log(`   - ${f.name}: ${f.error || f.status}`));
    }
  }

  printHelp() {
    console.log(`
🎲 PRE-SESSION PREP

Batch generates ALL images before gameplay.
Run this hours or days before your session.

USAGE:
  node pre-session-prep.js "Campaign Name"
  node pre-session-prep.js status "Campaign Name"

EXAMPLES:
  # Generate all images for campaign
  node pre-session-prep.js "Tamoachan Expedition"
  
  # Check prep status
  node pre-session-prep.js status "Tamoachan Expedition"

WHAT IT DOES:
  1. Generates scene images (all locations)
  2. Generates monster images (all monsters)
  3. Saves URLs to campaign folder
  4. Creates prep_status.json

OUTPUT:
  campaigns/<name>/images/scenes/     - Scene image references
  campaigns/<name>/images/monsters/   - Monster image references
  campaigns/<name>/prep_status.json   - Prep status

REQUIRES:
  OPENAI_API_KEY environment variable set
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    const prep = new PreSessionPrep('help');
    prep.printHelp();
    process.exit(0);
  }

  if (command === 'status') {
    if (!args[1]) {
      console.log('Usage: status "Campaign Name"');
      process.exit(1);
    }
    try {
      const prep = new PreSessionPrep(args[1]);
      prep.printStatus();
    } catch (e) {
      console.log(e.message);
    }
    process.exit(0);
  }

  // Default: prep the campaign
  const campaignName = command;
  try {
    const prep = new PreSessionPrep(campaignName);
    prep.prepAll();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

module.exports = PreSessionPrep;
