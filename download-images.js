#!/usr/bin/env node

/**
 * Download images from prep_status.json to local campaign folder
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadCampaignImages(campaignName) {
  const campaignDir = path.join(__dirname, 'campaigns', campaignName);
  const prepFile = path.join(campaignDir, 'prep_status.json');
  
  if (!fs.existsSync(prepFile)) {
    console.log(`❌ No prep_status.json found for "${campaignName}"`);
    console.log('Run: node pre-session-prep.js "' + campaignName + '" first');
    process.exit(1);
  }
  
  const prepStatus = JSON.parse(fs.readFileSync(prepFile, 'utf8'));
  const successful = prepStatus.log.filter(item => item.status === 'success' && item.url);
  
  console.log(`\n🖼️  DOWNLOADING IMAGES FOR: ${campaignName}\n`);
  console.log('='.repeat(60));
  console.log(`Found ${successful.length} images to download\n`);
  
  const imagesDir = path.join(campaignDir, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });
  
  const scenesDir = path.join(imagesDir, 'scenes');
  const monstersDir = path.join(imagesDir, 'monsters');
  fs.mkdirSync(scenesDir, { recursive: true });
  fs.mkdirSync(monstersDir, { recursive: true });
  
  let downloaded = 0;
  let failed = 0;
  
  for (const item of successful) {
    const isScene = item.type === 'scene';
    const destDir = isScene ? scenesDir : monstersDir;
    const safeName = item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const destPath = path.join(destDir, `${safeName}.png`);
    
    // Skip if already downloaded
    if (fs.existsSync(destPath)) {
      console.log(`  ⏭️  ${item.name} (already exists)`);
      downloaded++;
      continue;
    }
    
    process.stdout.write(`  📥 ${item.name}... `);
    
    try {
      await downloadImage(item.url, destPath);
      console.log('✅');
      downloaded++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Downloaded: ${ downloaded}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  console.log(`\n📁 Images saved to: ${imagesDir}`);
  console.log(`   - Scenes: ${scenesDir}`);
  console.log(`   - Monsters: ${monstersDir}`);
}

// CLI
const campaignName = process.argv[2];

if (!campaignName) {
  console.log(`
🖼️  DOWNLOAD CAMPAIGN IMAGES

Downloads all generated images from prep_status.json to local folders.

USAGE:
  node download-images.js "Campaign Name"

EXAMPLE:
  node download-images.js "Tamoachan Playtest"

OUTPUT:
  campaigns/<name>/images/scenes/     - Scene images
  campaigns/<name>/images/monsters/   - Monster images
`);
  process.exit(1);
}

downloadCampaignImages(campaignName).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
