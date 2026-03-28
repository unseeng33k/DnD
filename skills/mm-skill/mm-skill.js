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

  printMonster(name) {
    const stats = this.getMonster(name);
    if (!stats) {
      console.log(`Monster "${name}" not found.`);
      return;
    }

    console.log(`\n👹 ${name.toUpperCase()}\n`);
    console.log(stats);
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
  search <term>       Search monsters
  monster <name>      Show monster stats
  hd <number>         List monsters by hit dice
  type <type>         List monsters by type

TYPES:
  undead, dragon, giant, demon, humanoid

EXAMPLES:
  node mm-skill.js search "poison"
  node mm-skill.js monster goblin
  node mm-skill.js monster dragon
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
        process.exit(1);
      }
      skill.printMonster(args[1]);
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
