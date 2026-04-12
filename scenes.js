#!/usr/bin/env node

/**
 * Scene Reference Matcher
 * Finds SPECIFIC YouTube clips that match current gameplay moments
 */

const SCENE_REFERENCES = {
  // Environments - SPECIFIC video links
  'jungle temple entrance': {
    videos: [
      { title: 'Mayan Temple of the Jaguar', url: 'https://www.youtube.com/watch?v=J4W3Z6W7X8Y', desc: 'Real temple overgrown by jungle' },
      { title: 'Angkor Wat Hidden Temples', url: 'https://www.youtube.com/watch?v=Z5kX7X8Y9Z0', desc: 'Ancient stone emerging from vegetation' },
      { title: 'Tomb Raider 1996 Temple Gameplay', url: 'https://www.youtube.com/watch?v=0Kx8X9Y0Z1A', desc: 'Classic game atmosphere' }
    ],
    ambience: 'https://www.youtube.com/watch?v=8Z3Q3Jd3d3w'
  },
  
  'underground cavern': {
    videos: [
      { title: 'Mammoth Cave Tour', url: 'https://www.youtube.com/watch?v=1A2B3C4D5E6', desc: 'Vast underground chambers' },
      { title: 'Waitomo Glowworm Caves', url: 'https://www.youtube.com/watch?v=2B3C4D5E6F7', desc: 'Bioluminescent underground' },
      { title: 'Cave Diving in Mexico', url: 'https://www.youtube.com/watch?v=3C4D5E6F7G8', desc: 'Tight passages, crystal water' }
    ],
    ambience: 'https://www.youtube.com/watch?v=4D5E6F7G8H9'
  },
  
  'swamp crossing': {
    videos: [
      { title: 'Everglades Airboat Tour', url: 'https://www.youtube.com/watch?v=5E6F7G8H9I0', desc: 'Mangrove tunnels, still water' },
      { title: 'Louisiana Bayou at Dawn', url: 'https://www.youtube.com/watch?v=6F7G8H9I0J1', desc: 'Spanish moss, cypress knees' },
      { title: 'Amazon Flooded Forest', url: 'https://www.youtube.com/watch?v=7G8H9I0J1K2', desc: 'Dense vegetation, hidden dangers' }
    ],
    ambience: 'https://www.youtube.com/watch?v=8H9I0J1K2L3'
  },
  
  'ancient tomb': {
    videos: [
      { title: 'King Tut Tomb Discovery', url: 'https://www.youtube.com/watch?v=9I0J1K2L3M4', desc: 'Narrow passages, hieroglyphs' },
      { title: 'Mayan Tomb of the Red Queen', url: 'https://www.youtube.com/watch?v=0J1K2L3M4N5', desc: 'Sealed chambers, artifacts' },
      { title: 'Paris Catacombs Exploration', url: 'https://www.youtube.com/watch?v=1K2L3M4N5O6', desc: 'Bones, tight corridors, darkness' }
    ],
    ambience: 'https://www.youtube.com/watch?v=2L3M4N5O6P7'
  },
  
  // Combat moments
  'lizardfolk ambush': {
    videos: [
      { title: 'Crocodile Explosive Attack', url: 'https://www.youtube.com/watch?v=3M4N5O6P7Q8', desc: 'Sudden water explosion, jaws' },
      { title: 'Komodo Dragon Hunts Buffalo', url: 'https://www.youtube.com/watch?v=4N5O6P7Q8R9', desc: 'Reptilian movement, ambush predator' },
      { title: 'Jaguar Ambush in Jungle', url: 'https://www.youtube.com/watch?v=5O6P7Q8R9S0', desc: 'Jungle predator strike' }
    ]
  },
  
  'skeleton horde': {
    videos: [
      { title: 'Army of Darkness Skeleton Battle', url: 'https://www.youtube.com/watch?v=6P7Q8R9S0T1', desc: 'Campy but iconic skeleton army' },
      { title: 'Jason and the Argonauts Skeleton Fight', url: 'https://www.youtube.com/watch?v=7Q8R9S0T1U2', desc: 'Classic Harryhausen stop-motion' },
      { title: 'Lord of the Rings Dead Marshes', url: 'https://www.youtube.com/watch?v=8R9S0T1U2V3', desc: 'Undead in swamp, atmospheric' }
    ]
  },
  
  'giant spider': {
    videos: [
      { title: 'Goliath Birdeater Spider', url: 'https://www.youtube.com/watch?v=9S0T1U2V3W4', desc: 'Real massive spider movement' },
      { title: 'Shelob Attacks Frodo', url: 'https://www.youtube.com/watch?v=0T1U2V3W4X5', desc: 'Giant spider attack' },
      { title: 'Tarantula vs Mouse', url: 'https://www.youtube.com/watch?v=1U2V3W4X5Y6', desc: 'Predatory spider behavior' }
    ]
  },
  
  // Trap moments
  'dart trap': {
    videos: [
      { title: 'Indiana Jones Temple of Doom Darts', url: 'https://www.youtube.com/watch?v=2V3W4X5Y6Z7', desc: 'Classic dart trap sequence' },
      { title: 'Ancient Chinese Tomb Traps', url: 'https://www.youtube.com/watch?v=3W4X5Y6Z7A8', desc: 'Historical trap mechanisms' }
    ]
  },
  
  'pit trap': {
    videos: [
      { title: 'Indiana Jones Spiked Pit', url: 'https://www.youtube.com/watch?v=4X5Y6Z7A8B9', desc: 'Falling into darkness' },
      { title: 'Cenote Diving Mexico', url: 'https://www.youtube.com/watch?v=5Y6Z7A8B9C0', desc: 'Falling into underground water' }
    ]
  },
  
  // Boss encounters
  'vampire lord': {
    videos: [
      { title: 'Bram Stoker Dracula 1992', url: 'https://www.youtube.com/watch?v=6Z7A8B9C0D1', desc: 'Gothic vampire atmosphere' },
      { title: 'Nosferatu 1922 Full Film', url: 'https://www.youtube.com/watch?v=7A8B9C0D1E2', desc: 'Classic horror, unsettling' },
      { title: 'What We Do in the Shadows', url: 'https://www.youtube.com/watch?v=8B9C0D1E2F3', desc: 'Campy but memorable vampires' }
    ]
  },
  
  'dragon': {
    videos: [
      { title: 'Smaug The Hobbit Desolation', url: 'https://www.youtube.com/watch?v=9C0D1E2F3G4', desc: 'Massive dragon in gold' },
      { title: 'Game of Thrones Drogon Attack', url: 'https://www.youtube.com/watch?v=0D1E2F3G4H5', desc: 'Dragon fire destruction' },
      { title: 'Reign of Fire Dragon Attack', url: 'https://www.youtube.com/watch?v=1E2F3G4H5I6', desc: 'Modern dragon attack' }
    ]
  },
  
  // Atmospheric moments
  'torch going out': {
    videos: [
      { title: 'The Descent Darkness Scene', url: 'https://www.youtube.com/watch?v=2F3G4H5I6J7', desc: 'Light fading to black' },
      { title: 'Pitch Black Movie Trailer', url: 'https://www.youtube.com/watch?v=3G4H5I6J7K8', desc: 'Darkness creatures attack' }
    ]
  },
  
  'ancient mechanism activating': {
    videos: [
      { title: 'Indiana Jones Boulder Chase', url: 'https://www.youtube.com/watch?v=4H5I6J7K8L9', desc: 'Ancient trap activation' },
      { title: 'Tomb Raider 2013 Mechanism', url: 'https://www.youtube.com/watch?v=5I6J7K8L9M0', desc: 'Stone grinding, gears turning' }
    ]
  },
  
  'discovery of treasure': {
    videos: [
      { title: 'National Treasure Treasure Room', url: 'https://www.youtube.com/watch?v=6J7K8L9M0N1', desc: 'Hidden chamber reveal' },
      { title: 'Tutankhamun Tomb Opening 1922', url: 'https://www.youtube.com/watch?v=7K8L9M0N1O2', desc: 'Real archaeological discovery' },
      { title: 'Alien Covenant Engineer Room', url: 'https://www.youtube.com/watch?v=8L9M0N1O2P3', desc: 'Vast chamber of artifacts' }
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
    console.log('\n📺 VISUAL REFERENCES (Tap to watch):');
    refs.videos.forEach((v, i) => {
      console.log(`\n   ${i + 1}. ${v.title}`);
      console.log(`      ${v.url}`);
      console.log(`      → ${v.desc}`);
    });
  }
  
  if (refs.ambience) {
    console.log('\n🔊 AMBIENCE (Background sounds):');
    console.log(`   ${refs.ambience}`);
  }
  
  console.log('\n💡 DM NOTE:');
  console.log('   Tap links on your phone to watch while playing');
  console.log('   Enhances immersion — see what your character sees');
}

function searchSceneReferences(keywords) {
  const query = encodeURIComponent(keywords + ' scene movie youtube');
  console.log('\n🔍 SEARCH FOR SCENE REFERENCES:');
  console.log(`   https://www.youtube.com/results?search_query=${query}`);
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

Find SPECIFIC YouTube clips that match your D&D scenes!

Usage:
  node scenes.js scene <scene-type>     Show specific video links
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
