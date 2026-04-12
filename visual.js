#!/usr/bin/env node

/**
 * Visual DM System
 * Monster references, environment mood boards, battle scene generation
 */

const fs = require('fs');
const path = require('path');

// Classic AD&D Monster Database with visual references
const MONSTERS = {
  'umber hulk': {
    name: 'Umber Hulk',
    source: 'MM1 p. 95',
    artist: 'David C. Sutherland III',
    description: 'A horrific mix of ape and beetle, roughly 8 feet tall. Powerful mandibles capable of shearing through armor. Four eyes that cause confusion in those who meet their gaze. Burrows through solid rock.',
    habitat: 'Underground, caverns, deep dungeons',
    aiPrompt: 'umber hulk monster, insectoid ape creature, powerful mandibles, four compound eyes, confusing gaze, underground cavern, 1970s D&D art style, ink and watercolor illustration, atmospheric torchlight, menacing pose, David Sutherland art style',
    tags: ['underground', 'confusion', 'tough', 'ambush predator'],
    stats: 'AC 2, HD 8+8, HP 44, THAC0 12, 3d4/3d4/1d10 damage'
  },
  'lizard man': {
    name: 'Lizard Man',
    source: 'MM1 p. 62',
    artist: 'David C. Sutherland III',
    description: 'Bipedal reptilian humanoids, 6-7 feet tall. Scaled hide in mottled greens and browns. Primitive but organized. Fierce warriors, often found in swamps and coastal regions.',
    habitat: 'Swamps, marshes, coastal caves',
    aiPrompt: 'lizard man warrior, bipedal reptile humanoid, scaly green-brown hide, primitive weapons, swamp environment, 1970s D&D art style, ink illustration, atmospheric, tribal warrior, David Sutherland style',
    tags: ['swamp', 'reptile', 'tribal', 'warrior'],
    stats: 'AC 5, HD 2+1, HP 10, THAC0 17, 1d8+1/1d8+1/2d4 damage (claw/claw/bite)'
  },
  'giant spider': {
    name: 'Giant Spider',
    source: 'MM1 p. 88',
    artist: 'Various',
    description: 'Horse-sized arachnids with venomous fangs. Some spin webs, others hunt actively. Eight eyes gleam in darkness. Legs span 8-10 feet.',
    habitat: 'Caves, forests, dungeons, any dark place',
    aiPrompt: 'giant spider monster, horse-sized arachnid, eight gleaming eyes, venomous fangs, massive legs, web-covered dungeon, 1970s D&D art style, horror atmosphere, ink and watercolor, menacing pose',
    tags: ['poison', 'web', 'ambush', 'vermin'],
    stats: 'AC 4, HD 4+4, HP 22, THAC0 15, 1d8 + poison'
  },
  'skeleton': {
    name: 'Skeleton',
    source: 'MM1 p. 86',
    artist: 'Classic',
    description: 'Animated bones of the dead, held together by foul magic. Empty eye sockets burn with unnatural light. Move with jerky, unnatural grace. Vulnerable to blunt weapons.',
    habitat: 'Tombs, crypts, evil temples, anywhere death lingers',
    aiPrompt: 'animated skeleton warrior, bones held by dark magic, empty eye sockets with unholy light, armed with rusted sword, dark tomb interior, 1970s D&D art style, gothic horror atmosphere, ink illustration',
    tags: ['undead', 'mindless', 'skeleton', 'weak to blunt'],
    stats: 'AC 7, HD 1, HP 4, THAC0 19, 1d6 damage'
  },
  'zombie': {
    name: 'Zombie',
    source: 'MM1 p. 102',
    artist: 'Classic',
    description: 'Reanimated corpses, slow but relentless. Flesh rotting, eyes vacant. Feel no pain, no fear. Keep coming until destroyed.',
    habitat: 'Graveyards, crypts, evil temples',
    aiPrompt: 'zombie monster, reanimated corpse, rotting flesh, vacant dead eyes, reaching grasping hands, graveyard or crypt setting, 1970s D&D art style, horror atmosphere, ink and watercolor, shambling pose',
    tags: ['undead', 'slow', 'relentless', 'mindless'],
    stats: 'AC 8, HD 2, HP 9, THAC0 18, 1d8 damage'
  },
  'orc': {
    name: 'Orc',
    source: 'MM1 p. 76',
    artist: 'David C. Sutherland III',
    description: 'Brutish humanoids with pig-like features, green-gray skin, coarse hair. Tribal society, warlike, often serve evil masters. Savage but cunning in groups.',
    habitat: 'Caves, mountains, wastelands, underground',
    aiPrompt: 'orc warrior, pig-faced humanoid, green-gray skin, coarse black hair, savage features, tribal armor and weapons, cave or wasteland setting, 1970s D&D art style, ink illustration, aggressive pose',
    tags: ['humanoid', 'tribal', 'warrior', 'evil'],
    stats: 'AC 6, HD 1, HP 4, THAC0 19, 1d8 damage'
  },
  'goblin': {
    name: 'Goblin',
    source: 'MM1 p. 48',
    artist: 'Classic',
    description: 'Small, wiry humanoids with reddish eyes, flat faces, sharp teeth. Cowardly alone, dangerous in numbers. Hate sunlight. Love traps and ambushes.',
    habitat: 'Caves, dark forests, underground',
    aiPrompt: 'goblin monster, small wiry humanoid, reddish eyes, flat face with sharp teeth, sneaking pose, dark cave setting, 1970s D&D art style, mischievous and menacing, ink illustration',
    tags: ['small', 'cowardly', 'traps', 'ambush'],
    stats: 'AC 6, HD 1-1, HP 3, THAC0 20, 1d6 damage'
  },
  'owlbear': {
    name: 'Owlbear',
    source: 'MM1 p. 77',
    artist: 'David C. Sutherland III',
    description: 'Horrific hybrid of bear and owl, created by mad wizardry. Feathered bear body, owl head with massive beak. Hug attack that crushes victims. Infamous for its ferocity.',
    habitat: 'Forests, caves, wilderness',
    aiPrompt: 'owlbear monster, bear body with owl head, feathered fur hybrid, massive crushing beak, forest setting, 1970s D&D art style, ferocious pose, ink and watercolor, David Sutherland style',
    tags: ['hybrid', 'ferocious', 'hug attack', 'wilderness'],
    stats: 'AC 5, HD 5+2, HP 25, THAC0 15, 1d6/1d6/2d6 damage'
  },
  'rust monster': {
    name: 'Rust Monster',
    source: 'MM1 p. 83',
    artist: 'David C. Sutherland III',
    description: 'Bizarre creature resembling an insectoid armadillo. Two feathery antennae detect metal. Tail can destroy armor and weapons instantly. Feared by all adventurers.',
    habitat: 'Underground, dungeons',
    aiPrompt: 'rust monster, insectoid armadillo creature, feathery antennae, segmented body, underground dungeon, 1970s D&D art style, quirky but threatening, ink illustration, David Sutherland style',
    tags: ['metal eater', 'armor destroyer', 'underground', ' feared'],
    stats: 'AC 2, HD 5, HP 23, THAC0 15, special: rust metal'
  },
  'gelatinous cube': {
    name: 'Gelatinous Cube',
    source: 'MM1 p. 43',
    artist: 'Classic',
    description: 'Transparent cube of acidic protoplasm, perfectly filling 10-foot corridors. Digests organic matter. Nearly invisible until too late. Contains indigestible treasure.',
    habitat: 'Dungeon corridors, clean areas',
    aiPrompt: 'gelatinous cube, transparent acidic cube monster, nearly invisible, filling dungeon corridor, bones and treasure suspended inside, 1970s D&D art style, horror atmosphere, ink illustration',
    tags: ['ooze', 'trap', 'acid', 'transparent'],
    stats: 'AC 8, HD 4, HP 18, THAC0 17, 2d4 damage + paralysis'
  },
  'mimic': {
    name: 'Mimic',
    source: 'MM1 p. 70',
    artist: 'Classic',
    description: 'Amorphous creature that perfectly imitates stone or wood. Waits as a door, chest, or wall. Surprises prey with pseudopod attacks. Adhesive grip.',
    habitat: 'Dungeons, treasure rooms',
    aiPrompt: 'mimic monster, amorphous creature disguised as wooden chest, toothy maw revealed, dungeon setting, 1970s D&D art style, surprise attack moment, horror atmosphere, ink illustration',
    tags: ['shapeshifter', 'trap', 'surprise', 'adhesive'],
    stats: 'AC 7, HD 7-8, HP 32, THAC0 13, 3d4 damage + adhesive'
  },
  'carrion crawler': {
    name: 'Carrion Crawler',
    source: 'MM1 p. 13',
    artist: 'Classic',
    description: 'Huge worm-like creature with eight tentacles around its mouth. Scavenger of dead, but attacks living. Tentacles cause paralysis. Feared by dungeon delvers.',
    habitat: 'Underground, crypts, sewers',
    aiPrompt: 'carrion crawler, huge worm monster, eight paralyzing tentacles around mouth, segmented body, underground tunnel, 1970s D&D art style, horror atmosphere, ink illustration, menacing',
    tags: ['paralysis', 'scavenger', 'worm', 'underground'],
    stats: 'AC 3, HD 3+1, HP 15, THAC0 16, paralysis tentacles'
  },
  'troglodyte': {
    name: 'Troglodyte',
    source: 'MM1 p. 95',
    artist: 'David C. Sutherland III',
    description: 'Reptilian humanoids with chameleon-like skin. Emit horrific stench that weakens enemies. Hate most other creatures, especially humans. Primitive but organized.',
    habitat: 'Caves, underground, caverns',
    aiPrompt: 'troglodyte warrior, reptilian humanoid, chameleon skin texture, primitive weapons, cave setting, 1970s D&D art style, atmospheric, David Sutherland style, aggressive pose',
    tags: ['reptile', 'stench', 'chameleon', 'underground'],
    stats: 'AC 5, HD 2, HP 9, THAC0 17, 1d4+1/1d4+1/1d4+1 + stench'
  },
  'ettercap': {
    name: 'Ettercap',
    source: 'MM1 p. 38',
    artist: 'Classic',
    description: 'Hideous humanoid with spider-like features. Creates deadly traps and snares. Keeps spiders as pets. Cunning and cruel.',
    habitat: 'Forests, dark woods, spider lairs',
    aiPrompt: 'ettercap monster, hideous humanoid with spider features, hunched posture, web-spinning, dark forest setting, 1970s D&D art style, horror atmosphere, ink illustration, cunning pose',
    tags: ['spider', 'trapper', 'cunning', 'forest'],
    stats: 'AC 6, HD 5, HP 23, THAC0 15, 1d4+1/1d4+1/1d8 + poison'
  },
  'hook horror': {
    name: 'Hook Horror',
    source: 'FF p. 51',
    artist: 'Various',
    description: 'Bizarre bipedal creature with hooks for hands, beaked head, insectoid body. Blind, uses echolocation. Terrifying appearance, deadly in combat.',
    habitat: 'Underground, caves',
    aiPrompt: 'hook horror monster, bipedal insectoid creature, hooks for hands, beaked head, eyeless blind face, underground cave, 1970s D&D art style, horror atmosphere, ink illustration, menacing',
    tags: ['underground', 'blind', 'hooks', 'echolocation'],
    stats: 'AC 3, HD 5, HP 23, THAC0 15, 1d6/1d6/2d4 damage'
  }
};

// Environment mood boards
const ENVIRONMENTS = {
  'jungle temple': {
    name: 'Jungle Temple (Tamoachan Style)',
    description: 'Ancient Olman temple lost in the jungle for centuries. Weathered stone carved with geometric patterns and forgotten gods. Humidity so thick it drips. Vegetation battles architecture for dominance.',
    mood: 'Humid, decaying, ancient, overgrown, mysterious',
    colors: ['Deep jungle green', 'Weathered stone gray', 'Moss and lichen', 'Faded gold accents', 'Rotting vegetation brown', 'Dappled sunlight gold'],
    lighting: 'Dappled sunlight through dense canopy, torchlit interiors, deep shadows',
    sounds: ['Parrots and macaws', 'Insects buzzing', 'Distant waterfalls', 'Stone grinding', 'Your own breathing', 'Something moving in the undergrowth'],
    smells: ['Rotting vegetation', 'Sulfur from volcanic vents', 'Stagnant water', 'Ancient dust', 'Exotic flowers', 'Your own sweat'],
    hazards: ['Poisonous plants', 'Unstable floors', 'Ancient traps', 'Disease', 'Predators', 'Heat exhaustion'],
    aiPrompt: 'ancient mayan-style temple overgrown by jungle, weathered stone with geometric carvings, dense vegetation, dappled sunlight, humidity and mist, 1970s D&D module art style, atmospheric, Erol Otus style, ink and watercolor',
    references: ['Palenque ruins', 'Angkor Wat', 'Tikal', 'Coba', 'Bonampak murals']
  },
  'underground cavern': {
    name: 'Underground Cavern',
    description: 'Vast natural cave system, stalactites dripping, underground rivers echoing. Bioluminescent fungi provide ghostly light. The earth itself seems to breathe.',
    mood: 'Vast, echoing, alien, timeless, oppressive',
    colors: ['Absolute black', 'Fungal blue-green', 'Stone gray', 'Water reflection silver', 'Torchlight orange'],
    lighting: 'Bioluminescent fungi, torchlight, total darkness beyond',
    sounds: ['Water dripping', 'Underground rivers', 'Echoes', 'Bats', 'Your footsteps amplified', 'Silence that presses on your ears'],
    smells: ['Wet stone', 'Mold', 'Stagnant water', 'Guano', 'Mineral tang'],
    hazards: ['Falls', 'Drowning', 'Getting lost', 'Bad air', 'Falling rocks', 'Things that hunt in darkness'],
    aiPrompt: 'vast underground cavern, stalactites and stalagmites, bioluminescent fungi, underground river, torchlight, 1970s D&D art style, atmospheric horror, ink illustration, David Sutherland style',
    references: ['Mammoth Cave', 'Carlsbad Caverns', 'Waitomo Glowworm Caves']
  },
  'swamp': {
    name: 'Swamp',
    description: 'Mangrove-choked wetlands, water black as ink, mist hovering at knee height. Trees draped in Spanish moss. Every step could be solid ground or sinking death.',
    mood: 'Suffocating, decaying, treacherous, hiding things',
    colors: ['Stagnant water black-green', 'Rotting vegetation brown', 'Moss gray-green', 'Mist white-gray', 'Sunset orange through haze'],
    lighting: 'Diffused through mist and canopy, flat and shadowless',
    sounds: ['Frogs', 'Insects', 'Something large moving through water', 'Your boots sucking in mud', 'Birds that stop when you approach'],
    smells: ['Rot', 'Sulfur', 'Vegetation decay', 'Your own fear sweat'],
    hazards: ['Quicksand', 'Disease', 'Poisonous creatures', 'Getting lost', 'Waterborne parasites', 'Things beneath the surface'],
    aiPrompt: 'fantasy swamp, black stagnant water, spanish moss on cypress trees, knee-high mist, mangrove roots, 1970s D&D art style, atmospheric horror, ink and watercolor, ominous',
    references: ['Okefenokee', 'Everglades', 'Bayou country']
  },
  'dungeon corridor': {
    name: 'Dungeon Corridor',
    description: 'Flagstone passages carved by ancient hands, dust undisturbed for centuries. Torch smoke stains the ceiling. Every shadow could hide death.',
    mood: 'Claustrophobic, ancient, trapped, expectant',
    colors: ['Stone gray', 'Torch orange', 'Shadow black', 'Rust brown', 'Ancient mortar beige'],
    lighting: 'Flickering torchlight, darkness beyond',
    sounds: ['Your footsteps echoing', 'Torch crackling', 'Distant dripping', 'Stone settling', 'Your heartbeat', 'Something else breathing?'],
    smells: ['Dust', 'Old stone', 'Torch smoke', 'Your own sweat', 'Something rotting (distant)'],
    hazards: ['Traps', 'Ambush', 'Dead ends', 'Pits', 'Secret doors', 'Wandering monsters'],
    aiPrompt: 'dungeon corridor, flagstone floor, flickering torchlight, deep shadows, ancient carved walls, 1970s D&D art style, atmospheric, ink illustration, Trampier style',
    references: ['Classic dungeon maps', 'Stone corridors', 'Medieval cellars']
  },
  'temple interior': {
    name: 'Ancient Temple Interior',
    description: 'Sacred space where gods were worshipped and blood was spilled. Altars stained dark. Statues watch with stone eyes. The air feels heavy with presence.',
    mood: 'Sacred, ominous, charged with history, dangerous',
    colors: ['Stone gray', 'Dried blood brown', 'Gold leaf (faded)', 'Incense smoke blue', 'Shadow purple'],
    lighting: 'Shafts of light from high windows, braziers, candles',
    sounds: ['Echoes of footsteps', 'Wind through high openings', 'Your own breathing', 'Silence that feels like waiting'],
    smells: ['Incense', 'Old blood', 'Stone dust', 'Ozone (magic?)', 'Decay'],
    hazards: ['Traps', 'Guardians', 'Curses', 'Falling masonry', 'Sacred wrath', 'Hidden passages'],
    aiPrompt: 'ancient temple interior, stone altar, faded murals, shafts of light, braziers, ominous statues, 1970s D&D art style, sacred horror atmosphere, ink and watercolor',
    references: ['Egyptian temples', 'Mayan temples', 'Angkor Wat interiors']
  }
};

// Battle scene generator
function generateBattlePrompt(party, enemies, environment, moment) {
  const envData = ENVIRONMENTS[environment] || ENVIRONMENTS['dungeon corridor'];
  
  let prompt = `${party.join(', ')} fighting ${enemies} in ${envData.name}, `;
  prompt += `${envData.lighting.toLowerCase()}, `;
  prompt += `${moment}, `;
  prompt += `1979 D&D module art style, `;
  prompt += `Erol Otus or David Sutherland style, `;
  prompt += `dynamic action pose, `;
  prompt += `atmospheric, `;
  prompt += `ink illustration with watercolor washes, `;
  prompt += `dramatic composition`;
  
  return prompt;
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'monster') {
  const name = args.slice(1).join(' ').toLowerCase();
  const monster = MONSTERS[name];
  
  if (!monster) {
    console.log(`Monster not found: ${name}`);
    console.log('Available:', Object.keys(MONSTERS).join(', '));
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(monster.name.toUpperCase());
  console.log('='.repeat(60));
  console.log(`\n📖 Source: ${monster.source} (Art: ${monster.artist})`);
  console.log(`\n📝 Description:`);
  console.log(monster.description);
  console.log(`\n🏠 Habitat: ${monster.habitat}`);
  console.log(`\n⚔️  Stats: ${monster.stats}`);
  console.log(`\n🏷️  Tags: ${monster.tags.join(', ')}`);
  
  console.log('\n🎨 AI GENERATION PROMPT:');
  console.log(monster.aiPrompt);
  
  console.log('\n🔗 IMAGE SEARCH:');
  const searchQuery = encodeURIComponent(`${monster.name} dnd ad&d art`);
  console.log(`https://www.google.com/search?q=${searchQuery}&tbm=isch`);
  
} else if (command === 'env') {
  const name = args.slice(1).join(' ').toLowerCase();
  const env = ENVIRONMENTS[name];
  
  if (!env) {
    console.log(`Environment not found: ${name}`);
    console.log('Available:', Object.keys(ENVIRONMENTS).join(', '));
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(env.name.toUpperCase());
  console.log('='.repeat(60));
  console.log(`\n📝 ${env.description}`);
  console.log(`\n🎭 Mood: ${env.mood}`);
  console.log(`\n🎨 Colors: ${env.colors.join(', ')}`);
  console.log(`\n💡 Lighting: ${env.lighting}`);
  console.log(`\n🔊 Sounds: ${env.sounds.join(', ')}`);
  console.log(`\n👃 Smells: ${env.smells.join(', ')}`);
  console.log(`\n⚠️  Hazards: ${env.hazards.join(', ')}`);
  
  console.log('\n🎨 AI GENERATION PROMPT:');
  console.log(env.aiPrompt);
  
  console.log('\n📚 References:', env.references.join(', '));
  
} else if (command === 'battle') {
  // Parse battle args
  const party = ['fighter', 'mage', 'thief']; // default
  const enemies = args[1] || 'goblin patrol';
  const env = args[2] || 'dungeon corridor';
  const moment = args[3] || 'surprise round';
  
  const prompt = generateBattlePrompt(party, enemies, env, moment);
  
  console.log('\n' + '='.repeat(60));
  console.log('BATTLE SCENE PROMPT');
  console.log('='.repeat(60));
  console.log(`\nParty: ${party.join(', ')}`);
  console.log(`Enemies: ${enemies}`);
  console.log(`Environment: ${env}`);
  console.log(`Moment: ${moment}`);
  
  console.log('\n🎨 AI PROMPT:');
  console.log(prompt);
  
  console.log('\n💡 Use with:');
  console.log('- Midjourney: /imagine prompt: [above]');
  console.log('- DALL-E: [paste prompt]');
  console.log('- Stable Diffusion: [paste prompt]');
  
} else {
  console.log(`
Visual DM System

Usage:
  node visual.js monster <name>     Show monster reference + AI prompt
  node visual.js env <name>         Show environment mood board
  node visual.js battle             Generate battle scene prompt

Examples:
  node visual.js monster "umber hulk"
  node visual.js monster lizard-man
  node visual.js env "jungle temple"
  node visual.js env swamp

Monsters: ${Object.keys(MONSTERS).join(', ')}
Environments: ${Object.keys(ENVIRONMENTS).join(', ')}
`);
}
