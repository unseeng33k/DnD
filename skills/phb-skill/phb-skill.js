#!/usr/bin/env node

/**
 * AD&D 1st Edition PHB Skill
 * Player's Handbook quick reference
 */

const fs = require('fs');
const path = require('path');

class PHBSkill {
  constructor() {
    this.phbPath = path.join(__dirname, 'PHB.md');
    this.content = this.loadContent();
  }

  loadContent() {
    try {
      return fs.readFileSync(this.phbPath, 'utf8');
    } catch (e) {
      return '';
    }
  }

  search(term) {
    const lines = this.content.split('\n');
    const results = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(term.toLowerCase())) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 3);
        results.push({
          line: i + 1,
          snippet: lines.slice(start, end).join('\n')
        });
      }
    }

    return results;
  }

  getTable(name) {
    const tables = {
      'strength': /### Strength Table[\s\S]*?(?=###|$)/,
      'intelligence': /### Intelligence Table[\s\S]*?(?=###|$)/,
      'wisdom': /### Wisdom Table[\s\S]*?(?=###|$)/,
      'dexterity': /### Dexterity Table[\s\S]*?(?=###|$)/,
      'constitution': /### Constitution Table[\s\S]*?(?=###|$)/,
      'charisma': /### Charisma Table[\s\S]*?(?=###|$)/,
      'thac0': /## THAC0 by Level[\s\S]*?(?=##|$)/,
      'class-requirements': /## Class Requirements[\s\S]*?(?=##|$)/,
      'spell-progression': /## Spell Progression[\s\S]*?(?=##|$)/,
      'cleric-spells': /### Cleric Spells[\s\S]*?(?=###|$)/,
      'mage-spells': /### Magic-User Spells[\s\S]*?(?=###|$)/,
      'armor': /### Armor[\s\S]*?(?=###|$)/,
      'weapons': /### Weapons[\s\S]*?(?=###|$)/,
      'combat': /## Combat[\s\S]*?(?=##|$)/
    };

    const pattern = tables[name.toLowerCase()];
    if (!pattern) return null;

    const match = this.content.match(pattern);
    return match ? match[0].trim() : null;
  }

  printSearch(results, term) {
    if (results.length === 0) {
      console.log(`No results found for "${term}"`);
      return;
    }

    console.log(`\n📖 Found ${results.length} result(s) for "${term}":\n`);
    
    for (const result of results.slice(0, 10)) {
      console.log(result.snippet);
      console.log('—'.repeat(50));
    }
  }

  printTable(name) {
    const table = this.getTable(name);
    if (!table) {
      console.log(`Table "${name}" not found.`);
      console.log('Available: strength, intelligence, wisdom, dexterity, constitution, charisma, THAC0, class-requirements, spell-progression, armor, weapons');
      return;
    }

    console.log(`\n📊 ${name.toUpperCase()}\n`);
    console.log(table);
  }

  printHelp() {
    console.log(`
📚 AD&D 1st Edition PHB Skill

USAGE:
  node phb-skill.js <command> [args]

COMMANDS:
  search <term>       Search PHB content
  table <name>        Display specific table

TABLES:
  strength, intelligence, wisdom, dexterity, constitution, charisma
  THAC0, class-requirements, spell-progression
  cleric-spells, mage-spells, armor, weapons

EXAMPLES:
  node phb-skill.js search "strength"
  node phb-skill.js table strength
  node phb-skill.js table THAC0
  node phb-skill.js table armor
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const skill = new PHBSkill();

  switch (command) {
    case 'search':
      if (!args[1]) {
        console.log('Usage: search <term>');
        process.exit(1);
      }
      const results = skill.search(args.slice(1).join(' '));
      skill.printSearch(results, args.slice(1).join(' '));
      break;

    case 'table':
      if (!args[1]) {
        console.log('Usage: table <name>');
        process.exit(1);
      }
      skill.printTable(args[1]);
      break;

    case 'help':
    default:
      skill.printHelp();
      break;
  }
}

module.exports = PHBSkill;
