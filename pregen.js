#!/usr/bin/env node

/**
 * Pre-generate location images for modules
 * Run before session to build image library
 */

const { generateImage } = require('./dalle-images');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images', 'tamoachan');

const SCENES = [
  {
    name: 'temple_entrance',
    prompt: 'Ancient Olman temple entrance overgrown by jungle, weathered stone doorway with geometric carvings, thick vines, torchlight, stairs descending into darkness, humid atmosphere, 1979 D&D module art style, Erol Otus, atmospheric'
  },
  {
    name: 'chamber_of_serpents',
    prompt: 'Ancient temple chamber, 30 foot vaulted space, stone basin in center, three serpent archways, walls with faded murals of feathered headdresses, torchlight, 1979 D&D module art style, atmospheric, ominous'
  },
  {
    name: 'dark_corridor',
    prompt: 'Ancient stone corridor in jungle temple, rough-hewn walls, tight passage, darkvision grayscale, torch marks on walls, 1979 D&D module art style, atmospheric, mysterious'
  },
  {
    name: 'abandoned_camp',
    prompt: 'Small chamber in ancient temple, abandoned camp with bedrolls, cold ashes, crude map on stone, darkvision grayscale, 1979 D&D module art style, atmospheric'
  },
  {
    name: 'jungle_dawn',
    prompt: 'Dawn at jungle temple entrance, misty morning, ancient stone ruins, adventurer camp, vines and vegetation, 1979 D&D module art style, atmospheric, mysterious'
  },
  {
    name: 'side_entrance',
    prompt: 'Collapsed side entrance to jungle temple, tumbled stone blocks, narrow gap, recent bootprints in dust, overgrown vines, 1979 D&D module art style, hidden entrance'
  },
  {
    name: 'lizardfolk_chamber',
    prompt: 'Underground temple chamber flooded with water, three pale lizardfolk warriors emerging, stone serpent archway, torchlight, 1979 D&D module art style, combat atmosphere'
  },
  {
    name: 'trap_room',
    prompt: 'Ancient temple room with obvious traps, pressure plates, dart holes in walls, skeletal remains, 1979 D&D module art style, dangerous atmosphere'
  },
  {
    name: 'treasure_vault',
    prompt: 'Hidden temple vault, ancient gold artifacts, jade masks, feathered headdresses, torchlight, 1979 D&D module art style, treasure discovery'
  },
  {
    name: 'underground_lake',
    prompt: 'Underground lake in ancient temple, black water, stalactites, small boat, bioluminescent fungi, 1979 D&D module art style, mysterious atmosphere'
  }
];

async function preGenerateImages() {
  console.log('🎨 Pre-generating Tamoachan location images...\n');
  
  for (const scene of SCENES) {
    const imagePath = path.join(IMAGES_DIR, `${scene.name}.png`);
    
    // Skip if already exists
    if (fs.existsSync(imagePath)) {
      console.log(`✓ ${scene.name} - already exists`);
      continue;
    }
    
    console.log(`Generating: ${scene.name}...`);
    
    try {
      const result = await generateImage(scene.prompt);
      
      if (result.success) {
        // Download and save image
        const response = await fetch(result.url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(buffer));
        
        console.log(`✓ ${scene.name} - saved`);
        
        // Save metadata
        const metaPath = path.join(IMAGES_DIR, `${scene.name}.json`);
        fs.writeFileSync(metaPath, JSON.stringify({
          name: scene.name,
          prompt: scene.prompt,
          generated: new Date().toISOString(),
          url: result.url
        }, null, 2));
        
        // Rate limit - wait between requests
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.log(`✗ ${scene.name} - failed: ${result.error}`);
      }
    } catch (err) {
      console.log(`✗ ${scene.name} - error: ${err.message}`);
    }
  }
  
  console.log('\n✅ Done! Images saved to images/tamoachan/');
}

// Show available images
function listImages() {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'));
  console.log('\n📁 Available Images:\n');
  files.forEach(f => console.log(`  ${f}`));
}

// CLI
const command = process.argv[2];

if (command === 'generate') {
  preGenerateImages();
} else if (command === 'list') {
  listImages();
} else {
  console.log(`
🎨 IMAGE PRE-GENERATOR

Usage:
  node pregen.js generate    Generate all missing images
  node pregen.js list        Show available images

Images saved to: images/tamoachan/
`);
}
