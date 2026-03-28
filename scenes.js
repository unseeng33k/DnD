#!/usr/bin/env node

/**
 * Scene Reference Matcher
 * Finds YouTube clips that match current gameplay moments
 */

const SCENE_REFERENCES = {
  // Environments - visual/audio references
  'jungle temple entrance': {
    videos: [
      { title: 'Mayan Temple Exploration', url: 'https://www.youtube.com/results?search_query=mayan+temple+exploration+documentary', desc: 'Real temple overgrown by jungle' },
      { title: 'Angkor Wat Sunrise', url: 'https://www.youtube.com/results?search_query=angkor+wat+sunrise+jungle', desc: 'Ancient stone emerging from vegetation' },
      { title: 'Tomb Raider Temple Vibes', url: 'https://www.youtube.com/results?search_query=tomb+raider+1996+gameplay+temple', desc: 'Classic game atmosphere' }
    ],
    ambience: 'https://www.youtube.com/results?search_query=jungle+temple+ambience+rain+sounds'
  },
  
  'underground cavern': {
    videos: [
      { title: 'Cave Exploration', url: 'https://www.youtube.com/results?search_query=cave+exploration+documentary', desc: 'Real cave systems, tight passages' },
      { title: 'Waitomo Glowworm Caves', url: 'https://www.youtube.com/results?search_query=waitomo+glowworm+caves', desc: 'Bioluminescent underground' },
      { title: 'Mammoth Cave Tour', url: 'https://www.youtube.com/results?search_query=mammoth+cave+tour', desc: 'Vast underground chambers' }
    ],
    ambience: 'https://www.youtube.com/results?search_query=cave+ambience+water+dripping+dark'
  },
  
  'swamp crossing': {
    videos: [
      { title: 'Florida Everglades', url: 'https://www.youtube.com/results?search_query=everglades+airboat+swamp', desc: 'Mangrove tunnels, still water' },
      { title: 'Louisiana Bayou', url: 'https://www.youtube.com/results?search_query=louisiana+bayou+swamp+boat', desc: 'Spanish moss, cypress knees' },
      { title: 'Amazon Flooded Forest', url: 'https://www.youtube.com/results?search_query=amazon+flooded+forest', desc: 'Dense vegetation, hidden dangers' }
    ],
    ambience: 'https://www.youtube.com/results?search_query=swamp+ambience+frogs+night'
  },
  
  'ancient tomb': {
    videos: [
      { title: 'Egyptian Tomb Exploration', url: 'https://www.youtube.com/results?search_query=egyptian+tomb+exploration+valley+of+kings', desc: 'Narrow passages, hieroglyphs' },
      { title: 'Mayan Tomb Discovery', url: 'https://www.youtube.com/results?search_query=mayan+tomb+discovery+palenque', desc: 'Sealed chambers, ancient artifacts' },
      { title: 'Catacombs of Paris', url: 'https://www.youtube.com/results?search_query=paris+catacombs+tour', desc: 'Bones, tight corridors, darkness' }
    ],
    ambience: 'https://www.youtube.com/results?search_query=tomb+ambience+ancient+dark'
  },
  
  // Combat moments
  'lizardfolk ambush': {
    videos: [
      { title: 'Crocodile Attack', url: 'https://www.youtube.com/results?search_query=crocodile+attack+water+explosive', desc: 'Sudden water explosion, jaws' },
      { title: 'Komodo Dragon Hunt', url: 'https://www.youtube.com/results?search_query=komodo+dragon+hunting', desc: 'Reptilian movement, ambush predator' },
      { title: 'Jaguar Ambush', url: 'https://www.youtube.com/results?search_query=jaguar+ambush+jungle', desc: 'Jungle predator strike' }
    ]
  },
  
  'skeleton horde': {
    videos: [
      { title: 'Army of Darkness Skeletons', url: 'https://www.youtube.com/results?search_query=army+of+darkness+skeleton+battle', desc: 'Campy but iconic skeleton army' },
      { title: 'Jason and the Argonauts', url: 'https://www.youtube.com/results?search_query=jason+argonauts+skeleton+fight', desc: 'Classic Harryhausen stop-motion' },
      { title: 'Lord of the Rings Dead Marshes', url: 'https://www.youtube.com/results?search_query=lord+of+the+rings+dead+marshes', desc: 'Undead in swamp, atmospheric' }
    ]
  },
  
  'giant spider': {
    videos: [
      { title: 'Tarantula in Web', url: 'https://www.youtube.com/results?search_query=tarantula+web+close+up', desc: 'Massive spider movement' },
      { title: 'Lord of the Rings Shelob', url: 'https://www.youtube.com/results?search_query=shelob+spider+lord+of+the+rings', desc: 'Giant spider attack' },
      { title: 'Giant Spider Documentary', url: 'https://www.youtube.com/results?search_query=goliath+birdeater+spider', desc: 'Real massive spiders' }
    ]
  },
  
  // Trap moments
  'dart trap': {
    videos: [
      { title: 'Indiana Jones Temple Traps', url: 'https://www.youtube.com/results?search_query=indiana+jones+temple+of+doom+traps', desc: 'Classic dart trap sequence' },
      { title: 'Ancient Chinese Traps', url: 'https://www.youtube.com/results?search_query=ancient+chinese+booby+traps', desc: 'Historical trap mechanisms' }
    ]
  },
  
  'pit trap': {
    videos: [
      { title: 'Indiana Jones Spiked Pit', url: 'https://www.youtube.com/results?search_query=indiana+jones+spiked+pit', desc: 'Falling into darkness' },
      { title: 'Cenote Diving', url: 'https://www.youtube.com/results?search_query=cenote+diving+mexico', desc: 'Falling into underground water' }
    ]
  },
  
  // Boss encounters
  'vampire lord': {
    videos: [
      { title: 'Bram Stoker\'s Dracula', url: 'https://www.youtube.com/results?search_query=bram+stoker+dracula+gary+oldman', desc: 'Gothic vampire atmosphere' },
      { title: 'What We Do in the Shadows', url: 'https://www.youtube.com/results?search_query=what+we+do+in+the+shadows+viago', desc: 'Campy but memorable vampires' },
      { title: 'Nosferatu', url: 'https://www.youtube.com/results?search_query=nosferatu+1922', desc: 'Classic horror, unsettling' }
    ]
  },
  
  'dragon': {
    videos: [
      { title: 'Smaug The Hobbit', url: 'https://www.youtube.com/results?search_query=smaug+the+hobbit+desolation', desc: 'Massive dragon in gold' },
      { title: 'Game of Thrones Dragons', url: 'https://www.youtube.com/results?search_query=game+of+thrones+drogon+attack', desc: 'Dragon fire destruction' },
      { title: 'Reign of Fire', url: 'https://www.youtube.com/results?search_query=reign+of+fire+dragon+attack', desc: 'Modern dragon attack' }
    ]
  },
  
  // Atmospheric moments
  'torch going out': {
    videos: [
      { title: 'Darkness Falls', url: 'https://www.youtube.com/results?search_query=pitch+black+darkness+scene', desc: 'Light fading to black' },
      { title: 'The Descent', url: 'https://www.youtube.com/results?search_query=the+descent+movie+trailer', desc: 'Underground horror, darkness' }
    ]
  },
  
  'ancient mechanism activating': {
    videos: [
      { title: 'Indiana Jones Boulder Chase', url: 'https://www.youtube.com/results?search_query=indiana+jones+boulder+chase', desc: 'Ancient trap activation' },
      { title: 'Tomb Raider Mechanisms', url: 'https://www.youtube.com/results?search_query=tomb+raider+ancient+mechanism', desc: 'Stone grinding, gears turning' }
    ]
  },
  
  'discovery of treasure': {
    videos: [
      { title: 'Alien Covenant Gold Room', url: 'https://www.youtube.com/results?search_query=alien+covenant+engineer+room', desc: 'Vast chamber of artifacts' },
      { title: 'National Treasure Discovery', url: 'https://www.youtube.com/results?search_query=national+treasure+treasure+room', desc: 'Hidden chamber reveal' },
      { title: 'Tutankhamun Tomb Opening', url: 'https://www.youtube.com/results?search_query=tutankhamun+tomb+opening+documentary', desc: 'Real archaeological discovery' }
    ]
  }
};

function findSceneReferences(sceneType) {
  const refs = SCENE_REFERENCES[sceneType.toLowerCase()];
  
  if (!refs) {
    console.log(`Scene type not found: ${sceneType}`);
    console.log('Available:', Object.keys(SCENE_REFERENCES).join(', '));
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎬 SCENE: ${sceneType.toUpperCase()}`);
  console.log('='.repeat(60));
  
  if (refs.videos) {
    console.log('\n📺 VISUAL REFERENCES:');
    refs.videos.forEach((v, i) => {
      console.log(`\n   ${i + 1}. ${v.title}`);
      console.log(`      ${v.url}`);
      console.log(`      → ${v.desc}`);
    });
  }
  
  if (refs.ambience) {
    console.log('\n🔊 AMBIENCE:');
    console.log(`   ${refs.ambience}`);
  }
  
  console.log('\n💡 DM NOTE:');
  console.log('   Share these links during the scene to enhance immersion');
  console.log('   Player watches on phone while you describe the action');
}

function searchSceneReferences(keywords) {
  const query = encodeURIComponent(keywords + ' scene movie');
  console.log('\n🔍 SEARCH FOR SCENE REFERENCES:');
  console.log(`   https://www.youtube.com/results?search_query=${query}`);
  console.log(`   https://www.google.com/search?q=${query}&tbm=vid`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'scene') {
  findSceneReferences(args.slice(1).join(' ') || 'jungle temple entrance');
} else if (command === 'search') {
  searchSceneReferences(args.slice(1).join(' '));
} else {
  console.log(`
🎬 SCENE REFERENCE MATCHER

Find YouTube clips that match your D&D scenes!

Usage:
  node scenes.js scene <scene-type>     Show references for known scene
  node scenes.js search <keywords>      Search for new references

Known scenes:
  ${Object.keys(SCENE_REFERENCES).join(', ')}

Examples:
  node scenes.js scene "jungle temple entrance"
  node scenes.js scene "lizardfolk ambush"
  node scenes.js scene "pit trap"
  node scenes.js search "swamp boat foggy"
`);
}
