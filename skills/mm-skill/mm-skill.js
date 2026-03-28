#!/usr/bin/env node

/**
 * AD&D 1st Edition Monster Manual Skill
 * Monster stats and abilities quick reference
 */

const fs = require('fs');
const path = require('path');

class MMSkill {
  constructor() {
    this.mmPath = path.join(__dirname, 'MM.md');
    this.content = this.loadContent();
    this.monsters = this.parseMonsters();
  }

  loadContent() {
    try {
      return fs.readFileSync(this.mmPath, 'utf8');
    } catch (e) {
      return '';
    }
  }

  parseMonsters() {
    const monsters = {};
    const lines = this.content.split('\n');
    let currentMonster = null;
    let monsterText = [];

    for (const line of lines) {
      if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
        // Save previous monster
        if (currentMonster) {
          monsters[currentMonster.toLowerCase()] = monsterText.join('\n');
        }
        // Start new monster
        currentMonster = line.replace(/\*\*/g, '').trim();
        monsterText = [line];
      } else if (currentMonster) {
        monsterText.push(line);
      }
    }

    // Save last monster
    if (currentMonster) {
      monsters[currentMonster.toLowerCase()] = monsterText.join('\n');
    }

    return monsters;
  }

  search(term) {
    const results = [];
    const lowerTerm = term.toLowerCase();

    for (const [name, stats] of Object.entries(this.monsters)) {
      if (name.includes(lowerTerm) || stats.toLowerCase().includes(lowerTerm)) {
        results.push({ name, stats });
      }
    }

    return results;
  }

  getMonster(name) {
    return this.monsters[name.toLowerCase()] || null;
  }

  getByHD(hd) {
    const results = [];
    const hdPattern = new RegExp(`HD.*?:.*${hd}[+\\-]?`, 'i');

    for (const [name, stats] of Object.entries(this.monsters)) {
      if (hdPattern.test(stats)) {
        results.push({ name, stats });
      }
    }

    return results;
  }

  getByType(type) {
    const typePatterns = {
      'undead': /undead|skeleton|zombie|ghoul|wight|wraith|spectre|vampire|lich|mummy/i,
      'dragon': /dragon/i,
      'giant': /giant/i,
      'demon': /demon/i,
      'humanoid': /goblin|orc|hobgoblin|gnoll|bugbear|kobold/i
    };

    const pattern = typePatterns[type.toLowerCase()];
    if (!pattern) return [];

    const results = [];
    for (const [name, stats] of Object.entries(this.monsters)) {
      if (pattern.test(name) || pattern.test(stats)) {
        results.push({ name, stats });
      }
    }

    return results;
  }

  async printMonster(name, showStats = true, chatFormat = true, generateImage = false) {
    const stats = this.getMonster(name);
    if (!stats) {
      console.log(`Monster "${name}" not found.`);
      return;
    }

    console.log(`\n👹 ${name.toUpperCase()}\n`);
    
    // Generate AI image prompt
    const imagePrompt = this.generateImagePrompt(name, stats);
    
    if (showStats) {
      // DM view - show everything
      if (chatFormat) {
        // Chat-friendly format
        const lines = stats.split('\n');
        for (const line of lines) {
          if (line.includes('AC:')) console.log(`🛡️  ${line.trim()}`);
          else if (line.includes('HD:')) console.log(`❤️  ${line.trim()}`);
          else if (line.includes('Move:')) console.log(`🏃 ${line.trim()}`);
          else if (line.includes('Attacks:')) console.log(`⚔️  ${line.trim()}`);
          else if (line.includes('Special:')) console.log(`✨ ${line.trim()}`);
          else if (line.includes('XP:')) console.log(`💎 ${line.trim()}`);
        }
      } else {
        console.log(stats);
      }
    } else {
      // Player view - show only description
      const description = this.getPlayerDescription(name, stats);
      console.log(description);
    }
    
    // Generate actual image if requested
    if (generateImage) {
      console.log('\n🎨 Generating image...');
      const AmbianceAgent = require('../ambiance-agent/ambiance');
      const ambiance = new AmbianceAgent();
      const result = await ambiance.generateImage(imagePrompt);
      
      if (result.success) {
        console.log(`\n🖼️  IMAGE: ${result.url}`);
      } else {
        console.log(`\n⚠️  Could not generate image: ${result.error}`);
        console.log('\n🎨 PROMPT (copy to generate manually):');
        console.log(imagePrompt);
      }
    } else {
      console.log('\n🎨 AI IMAGE PROMPT:');
      console.log(imagePrompt);
    }
  }

  getPlayerDescription(name, stats) {
    const descriptions = {
      'goblin': 'A small, ugly humanoid with green skin and sharp teeth. It wears crude leather armor and carries a rusty weapon.',
      'orc': 'A muscular humanoid with gray-green skin and pig-like features. It wears mismatched armor and wields a crude weapon.',
      'skeleton': 'A bleached human skeleton, animated by dark magic. Empty eye sockets glow with faint light.',
      'zombie': 'A reanimated corpse with rotting flesh. It shambles forward with arms outstretched.',
      'troll': 'A large green humanoid with rubbery skin and long arms. It has clawed hands and wild hair.',
      'dragon': 'A massive winged reptile with gleaming scales. Smoke curls from its nostrils as it guards its treasure.',
      'vampire': 'A pale figure in elegant dark clothing. Red eyes gleam with malevolent intelligence.',
      'owlbear': 'A bizarre creature with the body of a bear and the head of an owl. Feathers mix with fur on its body.',
      'rust monster': 'A strange insect-like creature with a propeller tail and two long feathery antennae.',
      'umber hulk': 'A massive humanoid with mandibles and multifaceted eyes. Its powerful claws can dig through stone.',
      'medusa': 'A figure with snakes for hair. Her gaze can turn flesh to stone.',
      'basilisk': 'A large lizard-like creature with eight legs and a crown of horns.',
      'mimic': 'What appears to be a treasure chest is actually a creature with pseudopods and teeth.',
      'giant': 'A huge humanoid, towering over 12 feet tall, wielding a massive weapon.',
      'demon': 'A winged humanoid with horns and claws. An aura of evil surrounds it.',
      'wraith': 'A spectral figure in a hooded cloak with glowing eyes. It seems barely solid.',
      'mummy': 'A figure wrapped in ancient bandages. One eye is visible through the wrappings.'
    };

    return descriptions[name.toLowerCase()] || `A ${name} stands before you.`;
  }

  generateImagePrompt(name, stats) {
    const prompts = {
      'goblin': 'A small, ugly humanoid with leathery green skin, large pointed ears, sharp yellow teeth, wearing crude leather armor, holding a rusty sword, crouching in a dark cave, 1979 D&D art style, fantasy illustration',
      'orc': 'A muscular humanoid with gray-green skin, pig-like snout, tusks, wearing mismatched armor, wielding a crude axe, aggressive stance, dungeon setting, 1979 D&D art style, fantasy illustration',
      'skeleton': 'Animated human skeleton, bleached bones, empty eye sockets glowing with faint light, armed with sword and shield, tattered remnants of clothing, dark dungeon corridor, 1979 D&D art style, fantasy illustration',
      'zombie': 'Reanimated human corpse, rotting flesh, vacant staring eyes, arms outstretched, tattered clothing, shambling pose, graveyard or dungeon setting, 1979 D&D art style, horror fantasy',
      'ghoul': 'Gaunt humanoid with sharp claws and teeth, gray skin, feral eyes, hunched posture, ragged clothing, cemetery or crypt setting, 1979 D&D art style, horror fantasy',
      'troll': 'Large green humanoid with rubbery skin, long arms, clawed hands, wild hair, regenerating wounds visible, cave or swamp setting, 1979 D&D art style, fantasy illustration',
      'dragon': 'Massive winged reptile, scales gleaming, sharp claws, long neck, smoke curling from nostrils, treasure hoard beneath, cave entrance, dramatic lighting, 1979 D&D art style, epic fantasy',
      'vampire': 'Pale aristocratic humanoid, red eyes, sharp fangs, elegant dark clothing, cape billowing, gothic castle interior, menacing pose, 1979 D&D art style, gothic horror fantasy',
      'lich': 'Skeletal figure in ornate robes, glowing eyes, crown or headdress, magical energy surrounding hands, dark wizard tower, undead horror, 1979 D&D art style, dark fantasy',
      'owlbear': 'Bizarre hybrid creature with bear body and owl head, feathered fur, sharp beak, massive claws, forest setting, aggressive stance, 1979 D&D art style, fantasy illustration',
      'rust monster': 'Strange insect-like creature with propeller tail, two long feathery antennae, armored plates, metallic sheen, dungeon corridor, 1979 D&D art style, fantasy illustration',
      'gelatinous cube': 'Transparent cube-shaped ooze, visible debris and bones suspended inside, dungeon corridor, sliding along floor, 1979 D&D art style, fantasy horror',
      'umber hulk': 'Massive humanoid with mandibles, multifaceted eyes, powerful claws, chitinous armor, underground cavern, digging through stone, 1979 D&D art style, fantasy horror',
      'medusa': 'Humanoid female with snakes for hair, scaly skin, reptilian eyes, holding bow, stone statues in background, dark temple setting, 1979 D&D art style, greek myth fantasy',
      'basilisk': 'Large lizard-like creature with eight legs, crown of horns, glowing eyes, stone fragments around feet, dark dungeon, 1979 D&D art style, fantasy illustration',
      'mimic': 'Amorphous creature disguised as treasure chest, pseudopods emerging, teeth visible, dungeon room, surprise attack pose, 1979 D&D art style, fantasy horror',
      'giant': 'Huge humanoid, 12+ feet tall, crude clothing, massive club or sword, mountain or hill setting, threatening pose, 1979 D&D art style, epic fantasy',
      'demon': 'Winged humanoid with horns, claws, fangs, red or black skin, fire and brimstone background, terrifying presence, 1979 D&D art style, dark fantasy horror',
      'wraith': 'Spectral humanoid figure, hooded cloak, glowing eyes, ethereal form, ghostly trail, dark cemetery, 1979 D&D art style, gothic horror',
      'mummy': 'Wrapped in ancient bandages, desiccated body, one eye visible, outstretched arms, Egyptian tomb setting, 1979 D&D art style, horror fantasy'
    };

    // Try exact match first
    let prompt = prompts[name.toLowerCase()];
    
    // If no exact match, try to extract from stats
    if (!prompt) {
      const lowerStats = stats.toLowerCase();
      
      if (lowerStats.includes('undead')) {
        prompt = `Undead creature, ${name}, decaying flesh, dark magic aura, dungeon or graveyard setting, 1979 D&D art style, horror fantasy`;
      } else if (lowerStats.includes('dragon')) {
        prompt = `Dragon, ${name}, scaled wings, reptilian, treasure hoard, cave entrance, dramatic lighting, 1979 D&D art style, epic fantasy`;
      } else if (lowerStats.includes('giant')) {
        prompt = `Giant humanoid, ${name}, massive size, primitive clothing, weapon, outdoor setting, 1979 D&D art style, epic fantasy`;
      } else if (lowerStats.includes('demon') || lowerStats.includes('devil')) {
        prompt = `Fiendish creature, ${name}, horns, claws, evil aura, hellish background, 1979 D&D art style, dark fantasy horror`;
      } else {
        // Generic fantasy monster prompt
        prompt = `Fantasy monster, ${name}, dungeon setting, threatening pose, detailed illustration, 1979 D&D art style, classic fantasy RPG artwork`;
      }
    }

    return prompt;
  }

  printSearch(results, term) {
    if (results.length === 0) {
      console.log(`No monsters found for "${term}"`);
      return;
    }

    console.log(`\n🔍 Found ${results.length} monster(s) for "${term}":\n`);
    
    for (const result of results) {
      console.log(`• ${result.name}`);
    }
    
    console.log('\nUse "monster <name>" to see full stats');
  }

  printByHD(hd) {
    const results = this.getByHD(hd);
    if (results.length === 0) {
      console.log(`No monsters found with ${hd} HD`);
      return;
    }

    console.log(`\n🎲 Monsters with ~${hd} HD:\n`);
    
    for (const result of results) {
      console.log(`• ${result.name}`);
    }
  }

  printByType(type) {
    const results = this.getByType(type);
    if (results.length === 0) {
      console.log(`No monsters found of type "${type}"`);
      return;
    }

    console.log(`\n👹 ${type.toUpperCase()} MONSTERS:\n`);
    
    for (const result of results) {
      console.log(`• ${result.name}`);
    }
  }

  printHelp() {
    console.log(`
👹 AD&D 1st Edition Monster Manual Skill

USAGE:
  node mm-skill.js <command> [args]

COMMANDS:
  search <term>              Search monsters
  monster <name>             Show monster stats
  monster <name> --image     Show monster + generate actual image
  image <name>               Generate monster image (player view)
  hd <number>                List monsters by hit dice
  type <type>                List monsters by type

TYPES:
  undead, dragon, giant, demon, humanoid

EXAMPLES:
  node mm-skill.js search "poison"
  node mm-skill.js monster goblin
  node mm-skill.js monster goblin --image
  node mm-skill.js image dragon
  node mm-skill.js hd 5
  node mm-skill.js type undead
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const skill = new MMSkill();

  switch (command) {
    case 'search':
      if (!args[1]) {
        console.log('Usage: search <term>');
        process.exit(1);
      }
      const results = skill.search(args.slice(1).join(' '));
      skill.printSearch(results, args.slice(1).join(' '));
      break;

    case 'monster':
      if (!args[1]) {
        console.log('Usage: monster <name>');
        console.log('       monster <name> --image    (generate actual image)');
        process.exit(1);
      }
      const generateMonsterImage = args.includes('--image');
      skill.printMonster(args[1], true, true, generateMonsterImage);
      break;

    case 'image':
      if (!args[1]) {
        console.log('Usage: image <monster-name>');
        process.exit(1);
      }
      skill.printMonster(args[1], false, true, true);
      break;

    case 'hd':
      if (!args[1]) {
        console.log('Usage: hd <number>');
        process.exit(1);
      }
      skill.printByHD(parseInt(args[1]));
      break;

    case 'type':
      if (!args[1]) {
        console.log('Usage: type <type>');
        console.log('Types: undead, dragon, giant, demon, humanoid');
        process.exit(1);
      }
      skill.printByType(args[1]);
      break;

    case 'help':
    default:
      skill.printHelp();
      break;
  }
}

module.exports = MMSkill;
