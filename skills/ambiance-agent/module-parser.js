#!/usr/bin/env node

/**
 * Module Parser for Ambiance Agent
 * Reads adventure modules and extracts scenes, monsters, and locations
 */

const fs = require('fs');
const path = require('path');

class ModuleParser {
  constructor() {
    this.modulesDir = path.join(__dirname, '..', 'resources', 'modules');
    this.knownModules = this.loadModuleIndex();
  }

  loadModuleIndex() {
    // Built-in knowledge of classic modules
    return {
      'tamoachan': {
        name: 'Hidden Shrine of Tamoachan',
        code: 'C1',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Jungle Approach', type: 'outdoor', mood: 'exploration', description: 'Dense jungle, ancient trail, overgrown ruins, humid air' },
          { name: 'Temple Entrance', type: 'outdoor', mood: 'discovery', description: 'Overgrown Olman temple entrance, vines crawling weathered stone, carved serpents' },
          { name: 'Entry Hall', type: 'dungeon', mood: 'tense', description: 'Steep stairs descending into darkness, ancient carvings, trapped steps' },
          { name: 'Chamber of Three Archways', type: 'dungeon', mood: 'mysterious', description: 'Skull archway (left), Pool archway (center), Tlaloc archway (right), glowing glyphs' },
          { name: 'Hall of the Glyphs', type: 'dungeon', mood: 'arcane', description: 'Walls covered in Olman writing, magical warnings, history of the shrine' },
          { name: 'Pool Chamber', type: 'dungeon', mood: 'dangerous', description: 'Underground cenote with crystal water, offerings visible below, something moves in depths' },
          { name: 'Shrine of Tlaloc', type: 'dungeon', mood: 'sacred', description: 'Ancient shrine to Tlaloc, blood-stained altar, glowing glyphs, rain god statue' },
          { name: 'Tomb of the Olman King', type: 'dungeon', mood: 'deathly', description: 'Sealed tomb, mummified remains, treasure and traps, royal burial chamber' },
          { name: 'Natural Cavern', type: 'cave', mood: 'claustrophobic', description: 'Limestone caverns, stalactites, underground river, bioluminescent fungi' },
          { name: 'Cultist Quarters', type: 'dungeon', mood: 'evil', description: 'Living area, sleeping mats, cooking fires, evidence of recent occupation' },
          { name: 'Sacrifice Chamber', type: 'dungeon', mood: 'evil', description: 'Hidden chamber, bloodstained altar, ritual implements, fresh sacrifices' },
          { name: 'Treasure Vault', type: 'vault', mood: 'treasure', description: 'Hidden cache, Olman gold, jade, turquoise, trapped chests' }
        ],
        monsters: [
          'goblin', 'skeleton', 'zombie', 'ghoul', 'wight', 
          'lizard man', 'giant spider', 'basilisk', 'mummy',
          'giant centipede', 'poisonous snake', 'crocodile', 'jaguar'
        ],
        keyNPCs: ['Tomas the Survivor', 'Villager Woman', 'Cult Leader Xilonen', 'The Olman King (mummy)'],
        soundtrack: ['mesoamerican', 'jungle', 'tense']
      },
      'tomb of horrors': {
        name: 'Tomb of Horrors',
        code: 'S1',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'The Green Devil Face', type: 'outdoor', mood: 'foreboding', description: 'Skull-shaped hill, black granite entrance, evil aura, the Great Green Devil Face' },
          { name: 'Entrance Corridor', type: 'dungeon', mood: 'trapped', description: 'Spiked pit, false doors, teleporter traps, deadly from the start' },
          { name: 'The Great Hall of Spheres', type: 'dungeon', mood: 'trapped', description: 'Four colored spheres, pit traps, false exits, gargoyle observation' },
          { name: 'The Chapel of Evil', type: 'dungeon', mood: 'profane', description: 'Desecrated chapel, pews, altar, pit to lower levels' },
          { name: 'The Laboratory', type: 'dungeon', mood: 'arcane', description: 'Acereraks workshop, experiments, constructs, magical traps' },
          { name: 'The Crypt of Acererak', type: 'dungeon', mood: 'deathly', description: 'Final chamber, demilich skull, treasure hoard, the ultimate trap' },
          { name: 'The Forsaken Prison', type: 'dungeon', mood: 'hopeless', description: 'Trapped adventurers, starvation, madness, warning to others' },
          { name: 'The Maze of Death', type: 'dungeon', mood: 'confusing', description: 'Twisting corridors, dead ends, teleport traps, no way out' }
        ],
        monsters: [
          'gargoyle', 'ghoul', 'zombie', 'wraith', 'spectre', 
          'lich', 'mummy', 'green slime', 'gelatinous cube',
          'shadow', 'wraith', 'ghost', 'animated statue'
        ],
        keyNPCs: ['Acererak the Demilich', 'The Green Devil'],
        soundtrack: ['death', 'dungeon', 'boss']
      },
      'temple of elemental evil': {
        name: 'Temple of Elemental Evil',
        code: 'T1-4',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Village of Hommlet', type: 'village', mood: 'suspicious', description: 'Quiet village, secret cultists, inn and trading post' },
          { name: 'Moathouse', type: 'ruins', mood: 'dangerous', description: 'Crumbling keep, bandits, dungeon entrance' },
          { name: 'Temple Grounds', type: 'outdoor', mood: 'evil', description: 'Blackened spires, elemental chaos, cultist patrols' },
          { name: 'Elemental Nodes', type: 'dungeon', mood: 'elemental', description: 'Four elemental planes, keys to temple' },
          { name: 'Inner Sanctum', type: 'dungeon', mood: 'boss', description: 'Zuggtmoys prison, elemental chaos, final battle' }
        ],
        monsters: [
          'goblin', 'orc', 'hobgoblin', 'gnoll', 'bugbear',
          'ogre', 'troll', 'giant', 'demon', 'elemental'
        ],
        keyNPCs: ['Zuggtmoy', 'Iuz', 'Lareth the Beautiful'],
        soundtrack: ['evil', 'tense', 'combat']
      },
      'against the giants': {
        name: 'Against the Giants',
        code: 'G1-3',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Steading of the Hill Giant Chief', type: 'fortress', mood: 'siege', description: 'Wooden fortress, hill giants, ogres, dire wolves' },
          { name: 'Glacial Rift of the Frost Giant Jarl', type: 'cave', mood: 'freezing', description: 'Ice caverns, frost giants, winter wolves' },
          { name: 'Hall of the Fire Giant King', type: 'dungeon', mood: 'inferno', description: 'Volcanic halls, fire giants, hell hounds, salamanders' }
        ],
        monsters: [
          'hill giant', 'frost giant', 'fire giant', 'ogre', 
          'troll', 'dire wolf', 'winter wolf', 'hell hound'
        ],
        keyNPCs: ['Nosnra', 'Grugnur', 'Snurre Iron Belly'],
        soundtrack: ['combat', 'epic', 'boss']
      },
      'ravenloft': {
        name: 'Ravenloft',
        code: 'I6',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Village of Barovia', type: 'village', mood: 'gothic', description: 'Misty village, frightened villagers, gothic architecture, blood on the cobblestones' },
          { name: 'Blood on the Vine Tavern', type: 'tavern', mood: 'suspicious', description: 'Warm fire, locals whispering, fear in the air, Arik the bartender' },
          { name: 'Church of St. Andral', type: 'church', mood: 'sanctuary', description: 'Holy ground, Father Donavich praying, Doru trapped in basement' },
          { name: 'Madame Evas Camp', type: 'camp', mood: 'mysterious', description: 'Vistani camp outside village, tarokka card reading, prophecy' },
          { name: 'Old Svalich Road', type: 'road', mood: 'foreboding', description: 'Misty road through the woods, wolf howls, carriage ruts' },
          { name: 'Gates of Ravenloft', type: 'gate', mood: 'ominous', description: 'Iron gates, raven statues, thunder crashes, castle looming above' },
          { name: 'Castle Courtyard', type: 'courtyard', mood: 'exposed', description: 'Overgrown garden, crumbling statues, fountain with red water' },
          { name: 'Castle Entrance Hall', type: 'castle', mood: 'grand', description: 'Massive staircase, portraits of Strahd, suits of armor' },
          { name: 'K78 Dining Hall', type: 'hall', mood: 'decadent', description: 'Dusty feast, rotting food, phantom servants, organ music' },
          { name: 'K67 Chapel', type: 'chapel', mood: 'profane', description: 'Desecrated altar, unholy symbols, Strahds place of power' },
          { name: 'K88 Crypts', type: 'dungeon', mood: 'deathly', description: 'Ancient crypts, vampire spawn, Strahds brides, sarcophagi' },
          { name: 'K87 Strahds Tomb', type: 'boss', mood: 'boss', description: 'Final resting place, Strahds coffin, confrontation with the vampire lord' },
          { name: 'K20 Library', type: 'library', mood: 'arcane', description: 'Dusty tomes, magical research, history of Barovia' },
          { name: 'K34 Treasury', type: 'vault', mood: 'treasure', description: 'Gold and jewels, trapped chests, artifacts' },
          { name: 'K50 Tower Peak', type: 'tower', mood: 'exposed', description: 'Highest tower, lightning rod, view of Barovia, heart of sorrow' }
        ],
        monsters: [
          'vampire', 'vampire spawn', 'wolf', 'dire wolf', 
          'werewolf', 'zombie', 'skeleton', 'ghost', 'banshee',
          'ghoul', 'wight', 'wraith', 'spectre', 'hell hound',
          'bat', 'rat', 'swarm', 'animated armor', 'flying sword'
        ],
        keyNPCs: ['Strahd von Zarovich', 'Ireena Kolyana', 'Madame Eva', 'Father Donavich', 'Ismark Kolyanovich', 'Rahadin', 'Escher', 'Patrina Velikovna'],
        soundtrack: ['gothic', 'horror', 'boss']
      },
      'white plume mountain': {
        name: 'White Plume Mountain',
        code: 'S2',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Volcano Entrance', type: 'cave', mood: 'dangerous', description: 'Active volcano, steam vents, sulfurous smell' },
          { name: 'The Frigidarium', type: 'dungeon', mood: 'freezing', description: 'Frozen chamber, slippery ice, cold creatures' },
          { name: 'The Boiling Bubble', type: 'dungeon', mood: 'inferno', description: 'Boiling water, steam, fire creatures' },
          { name: 'The Gamma Garden', type: 'dungeon', mood: 'weird', description: 'Mutated plants, strange radiation, bizarre flora' }
        ],
        monsters: [
          'giant crab', 'manticore', 'wyvern', 'grell', 
          'kelpie', 'giant crocodile', 'vampire', 'golem'
        ],
        keyNPCs: ['Keraptis', 'Ctenmiir', 'Nix', 'Sheldon'],
        soundtrack: ['weird', 'dungeon', 'combat']
      }
    };
  }

  getModule(name) {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.knownModules[key] || null;
  }

  listModules() {
    return Object.keys(this.knownModules).map(key => ({
      key,
      ...this.knownModules[key]
    }));
  }

  parseModule(name) {
    const module = this.getModule(name);
    if (!module) {
      return null;
    }

    // Convert module scenes to ambiance config
    const config = {
      name: module.name,
      code: module.code,
      edition: module.edition,
      locations: module.scenes.map(scene => ({
        name: scene.name,
        scene: this.mapSceneType(scene.type, scene.mood),
        description: scene.description,
        type: scene.type,
        mood: scene.mood
      })),
      monsters: module.monsters,
      npcs: module.keyNPCs,
      soundtrack: module.soundtrack
    };

    return config;
  }

  mapSceneType(type, mood) {
    // Map module scene types to ambiance scene types
    const mappings = {
      'outdoor': 'dark forest',
      'dungeon': 'ancient temple',
      'cave': 'underground cavern',
      'boss': 'boss battle',
      'village': 'tavern',
      'ruins': 'ancient temple',
      'castle': 'wizard tower',
      'fortress': 'boss battle',
      'crypt': 'crypt'
    };

    // Override by mood if needed
    const moodMappings = {
      'gothic': 'crypt',
      'horror': 'crypt',
      'freezing': 'mountain peak',
      'inferno': 'boss battle',
      'evil': 'crypt'
    };

    return moodMappings[mood] || mappings[type] || 'ancient temple';
  }

  generatePrepConfig(moduleName) {
    const parsed = this.parseModule(moduleName);
    if (!parsed) {
      return null;
    }

    return {
      module: parsed.name,
      locations: parsed.locations,
      monsters: parsed.monsters,
      soundtrack: parsed.soundtrack
    };
  }

  printModuleInfo(name) {
    const module = this.getModule(name);
    if (!module) {
      console.log(`Module "${name}" not found.`);
      console.log('Available modules:');
      this.listModules().forEach(m => console.log(`  - ${m.name} (${m.code})`));
      return;
    }

    console.log(`\n📖 ${module.name} (${module.code})\n`);
    console.log(`Edition: ${module.edition}`);
    console.log(`\n🏰 Scenes (${module.scenes.length}):`);
    module.scenes.forEach(s => console.log(`  • ${s.name} (${s.type})`));
    console.log(`\n👹 Monsters (${module.monsters.length}):`);
    module.monsters.forEach(m => console.log(`  • ${m}`));
    console.log(`\n🎭 Key NPCs:`);
    module.keyNPCs.forEach(n => console.log(`  • ${n}`));
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const parser = new ModuleParser();

  switch (command) {
    case 'list':
      console.log('\n📚 Available Modules:\n');
      parser.listModules().forEach(m => {
        console.log(`  ${m.code}: ${m.name} (${m.edition})`);
      });
      break;

    case 'info':
      if (!args[1]) {
        console.log('Usage: info <module-name>');
        process.exit(1);
      }
      parser.printModuleInfo(args[1]);
      break;

    case 'config':
      if (!args[1]) {
        console.log('Usage: config <module-name>');
        process.exit(1);
      }
      const config = parser.generatePrepConfig(args[1]);
      if (config) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(`Module "${args[1]}" not found.`);
      }
      break;

    default:
      console.log(`
📚 Module Parser for Ambiance Agent

USAGE:
  node module-parser.js list              List available modules
  node module-parser.js info <name>       Show module details
  node module-parser.js config <name>     Generate prep config

EXAMPLES:
  node module-parser.js list
  node module-parser.js info tamoachan
  node module-parser.js config ravenloft
`);
  }
}

module.exports = ModuleParser;
