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
          { name: 'Jungle Entrance', type: 'outdoor', mood: 'exploration', description: 'Overgrown Olman temple entrance, vines crawling weathered stone' },
          { name: 'Temple Stairs', type: 'dungeon', mood: 'tense', description: 'Steep stairs descending into darkness, ancient carvings' },
          { name: 'Antechamber', type: 'dungeon', mood: 'mysterious', description: 'Chamber with three archways: skull, pool, and Tlaloc' },
          { name: 'Pool Chamber', type: 'dungeon', mood: 'dangerous', description: 'Underground cenote with crystal water, offerings visible below' },
          { name: 'Shrine Room', type: 'dungeon', mood: 'sacred', description: 'Ancient shrine to Tlaloc, blood-stained altar, glowing glyphs' },
          { name: 'Tomb of the Olman King', type: 'dungeon', mood: 'deathly', description: 'Sealed tomb, mummified remains, treasure and traps' },
          { name: 'Natural Cavern', type: 'cave', mood: 'claustrophobic', description: 'Limestone caverns, stalactites, underground river' },
          { name: 'Cultist Sacrifice Chamber', type: 'dungeon', mood: 'evil', description: 'Hidden chamber, recent sacrifices, cultist presence' }
        ],
        monsters: [
          'goblin', 'skeleton', 'zombie', 'ghoul', 'wight', 
          'lizard man', 'giant spider', 'basilisk', 'mummy'
        ],
        keyNPCs: ['Tomas', 'Villager Woman', 'Cult Leader'],
        soundtrack: ['mesoamerican', 'jungle', 'tense']
      },
      'tomb of horrors': {
        name: 'Tomb of Horrors',
        code: 'S1',
        edition: 'AD&D 1e',
        scenes: [
          { name: 'Hill Entrance', type: 'outdoor', mood: 'foreboding', description: 'Skull-shaped hill, black granite, evil aura' },
          { name: 'Great Hall of Spheres', type: 'dungeon', mood: 'trapped', description: 'Four colored spheres, pit traps, false exits' },
          { name: 'Gargoyle Lair', type: 'dungeon', mood: 'dangerous', description: 'Chapel area, gargoyles, desecrated altar' },
          { name: 'Acereraks Tomb', type: 'dungeon', mood: 'deathly', description: 'Final chamber, demilich, treasure hoard' }
        ],
        monsters: [
          'gargoyle', 'ghoul', 'zombie', 'wraith', 'spectre', 
          'lich', 'mummy', 'green slime', 'trap'
        ],
        keyNPCs: ['Acererak'],
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
          { name: 'Village of Barovia', type: 'village', mood: 'gothic', description: 'Misty village, frightened villagers, gothic architecture' },
          { name: 'Castle Ravenloft', type: 'castle', mood: 'horror', description: 'Gothic castle, spiral towers, vampire lair' },
          { name: 'Crypts', type: 'dungeon', mood: 'deathly', description: 'Ancient crypts, vampire spawn, Strahds brides' },
          { name: 'Strahds Throne Room', type: 'boss', mood: 'boss', description: 'Throne of the vampire lord, final confrontation' }
        ],
        monsters: [
          'vampire', 'vampire spawn', 'wolf', 'dire wolf', 
          'werewolf', 'zombie', 'skeleton', 'ghost', 'banshee'
        ],
        keyNPCs: ['Strahd von Zarovich', 'Ireena Kolyana', 'Madame Eva'],
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
