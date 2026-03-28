#!/usr/bin/env node

/**
 * AD&D 1st Edition DMG Skill
 * Quick reference tool for Dungeon Masters
 */

const fs = require('fs');
const path = require('path');

class DMGSkill {
  constructor() {
    this.dmgPath = path.join(__dirname, 'DMG.md');
    this.content = this.loadContent();
    this.tables = this.extractTables();
  }

  loadContent() {
    try {
      return fs.readFileSync(this.dmgPath, 'utf8');
    } catch (e) {
      return '';
    }
  }

  extractTables() {
    const tables = {};
    const lines = this.content.split('\n');
    let currentTable = null;
    let tableContent = [];
    let inTable = false;

    for (const line of lines) {
      if (line.startsWith('|') && line.includes('|')) {
        if (!inTable) {
          inTable = true;
          tableContent = [line];
        } else {
          tableContent.push(line);
        }
      } else if (inTable && line.trim() === '') {
        inTable = false;
        if (tableContent.length > 2) {
          const header = tableContent[0];
          const tableName = this.inferTableName(header);
          if (tableName) {
            tables[tableName] = tableContent.join('\n');
          }
        }
        tableContent = [];
      } else if (inTable) {
        inTable = false;
        tableContent = [];
      }
    }

    return tables;
  }

  inferTableName(header) {
    const lower = header.toLowerCase();
    if (lower.includes('strength')) return 'strength';
    if (lower.includes('intelligence')) return 'intelligence';
    if (lower.includes('wisdom')) return 'wisdom';
    if (lower.includes('dexterity')) return 'dexterity';
    if (lower.includes('constitution')) return 'constitution';
    if (lower.includes('charisma')) return 'charisma';
    if (lower.includes('thac0')) return 'THAC0';
    if (lower.includes('saving')) return 'saving-throws';
    if (lower.includes('armor')) return 'armor-class';
    if (lower.includes('weapon') && lower.includes('damage')) return 'weapon-damage';
    if (lower.includes('cleric') && lower.includes('xp')) return 'cleric-xp';
    if (lower.includes('fighter') && lower.includes('xp')) return 'fighter-xp';
    if (lower.includes('magic-user') && lower.includes('xp')) return 'mage-xp';
    if (lower.includes('thief') && lower.includes('xp')) return 'thief-xp';
    if (lower.includes('treasure') && lower.includes('type')) return 'treasure-types';
    if (lower.includes('gem')) return 'gem-values';
    if (lower.includes('jewelry')) return 'jewelry-values';
    if (lower.includes('alignment')) return 'alignment';
    if (lower.includes('racial') && lower.includes('ability')) return 'racial-requirements';
    if (lower.includes('class') && lower.includes('ability')) return 'class-requirements';
    return null;
  }

  search(term) {
    const lines = this.content.split('\n');
    const results = [];
    let context = [];
    let inMatch = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      const lowerTerm = term.toLowerCase();

      if (lowerLine.includes(lowerTerm)) {
        // Get context (3 lines before and after)
        const start = Math.max(0, i - 3);
        const end = Math.min(lines.length, i + 4);
        const snippet = lines.slice(start, end).join('\n');
        results.push({
          line: i + 1,
          snippet: snippet,
          match: line.trim()
        });
      }
    }

    return results;
  }

  getTable(name) {
    const normalized = name.toLowerCase().replace(/\s+/g, '-');
    
    // Direct lookup
    if (this.tables[normalized]) {
      return this.tables[normalized];
    }

    // Try variations
    const variations = [
      normalized,
      normalized.replace(/-/g, ''),
      normalized.replace(/s$/, ''),
      normalized + 's'
    ];

    for (const variant of variations) {
      if (this.tables[variant]) {
        return this.tables[variant];
      }
    }

    // Search in content for table
    return this.findTableInContent(name);
  }

  findTableInContent(name) {
    const lines = this.content.split('\n');
    let collecting = false;
    let tableLines = [];
    const searchTerm = name.toLowerCase();

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes(searchTerm) && line.startsWith('|')) {
        collecting = true;
        tableLines = [line];
      } else if (collecting) {
        if (line.startsWith('|')) {
          tableLines.push(line);
        } else if (line.trim() === '') {
          break;
        }
      }
    }

    return tableLines.length > 0 ? tableLines.join('\n') : null;
  }

  getRule(section) {
    const sections = {
      'combat': '## Combat',
      'magic': '## Magic',
      'treasure': '## Treasure',
      'alignment': '## Alignment',
      'experience': '## Experience',
      'npcs': '## NPCs',
      'wilderness': '## Wilderness Adventures',
      'dungeon': '## Random Dungeons',
      'dm': '## Dungeon Mastering'
    };

    const header = sections[section.toLowerCase()];
    if (!header) return null;

    const startIdx = this.content.indexOf(header);
    if (startIdx === -1) return null;

    // Find next ## section or end of file
    const nextSection = this.content.indexOf('\n## ', startIdx + header.length);
    const endIdx = nextSection === -1 ? this.content.length : nextSection;

    return this.content.substring(startIdx, endIdx).trim();
  }

  quickRef(topic) {
    const refs = {
      'conditions': this.getConditions(),
      'movement': this.getMovement(),
      'light': this.getLightSources(),
      'saves': this.getSavingThrows(),
      'morale': this.getMoraleRules(),
      'surprise': this.getSurpriseRules()
    };

    return refs[topic.toLowerCase()] || null;
  }

  getConditions() {
    return `
## Common Conditions

**Blinded**: -4 to hit, +4 to AC, no DEX bonus
**Deafened**: -1 to surprise rolls
**Entangled**: Cannot move, -2 to hit, +2 to AC
**Falling**: 1d6 damage per 10 feet
**Grappled**: Cannot move or attack with weapons
**Paralyzed**: Cannot move or act
**Prone**: -4 to hit, +4 to AC vs ranged, -4 AC vs melee
**Stunned**: Cannot act, -2 to AC
**Surprised**: No action for 1 segment
**Unconscious**: Helpless, 0 HP
    `.trim();
  }

  getMovement() {
    return `
## Movement Rates

**Indoor (encounter)**
- Light (0-75#): 12"
- Moderate (76-100#): 9"
- Heavy (101-150#): 6"
- Severe (151-300#): 3"

**Outdoor (miles/day)**
- Clear: 24 (forced: 36)
- Trail: 30 (forced: 45)
- Forest: 16 (forced: 24)
- Rough/Swamp/Mountains: 8 (forced: 12)
- Desert: 16 (forced: 24)
    `.trim();
  }

  getLightSources() {
    return `
## Light Sources

| Source | Duration | Radius |
|--------|----------|--------|
| Torch | 1 hour | 30' |
| Lantern | 4 hours/pint | 30' |
| Candle | 1 hour | 5' |
| Infravision | — | 60' |
    `.trim();
  }

  getSavingThrows() {
    return `
## Saving Throw Categories

**Paralyze, Poison, Death Magic**
**Rod, Staff, Wand**
**Petrification, Polymorph**
**Breath Weapon**
**Spell**

See class tables for specific numbers.
    `.trim();
  }

  getMoraleRules() {
    return `
## Morale Checks (2d6 vs morale score)

Check when:
- First blood drawn
- 25% casualties taken
- 50% casualties taken
- Leader killed
- Facing magic
- Facing obviously superior force

**Modifiers:**
- Excellent treatment: +2
- Good treatment: +1
- Poor treatment: -1
- Abusive treatment: -2
    `.trim();
  }

  getSurpriseRules() {
    return `
## Surprise

Roll d6 for each side:
- 1-2 = Surprised (2 segments)
- 3-6 = Not surprised

**Modifiers:**
- Dexterity reaction adjustment
- Racial bonuses
- Special abilities
- Situation (ambush, etc.)

If both surprised: Normal encounter
If one surprised: Surprised side loses 1-2 segments
    `.trim();
  }

  printSearch(results, term) {
    if (results.length === 0) {
      console.log(`No results found for "${term}"`);
      return;
    }

    console.log(`\n🔍 Found ${results.length} result(s) for "${term}":\n`);
    
    for (const result of results.slice(0, 10)) {
      console.log(`Line ${result.line}:`);
      console.log(result.snippet);
      console.log('—'.repeat(60));
    }

    if (results.length > 10) {
      console.log(`\n... and ${results.length - 10} more results`);
    }
  }

  printTable(name) {
    const table = this.getTable(name);
    if (!table) {
      console.log(`Table "${name}" not found.`);
      console.log('Available tables: strength, intelligence, wisdom, dexterity, constitution, charisma, THAC0, saving-throws, weapon-damage, armor-class, treasure-types, gem-values, jewelry-values');
      return;
    }

    console.log(`\n📊 ${name.toUpperCase()} TABLE\n`);
    console.log(table);
  }

  printRule(section) {
    const rule = this.getRule(section);
    if (!rule) {
      console.log(`Section "${section}" not found.`);
      console.log('Available sections: combat, magic, treasure, alignment, experience, npcs, wilderness, dungeon, dm');
      return;
    }

    console.log(`\n📖 ${section.toUpperCase()}\n`);
    console.log(rule);
  }

  printRef(topic) {
    const ref = this.quickRef(topic);
    if (!ref) {
      console.log(`Quick reference "${topic}" not found.`);
      console.log('Available: conditions, movement, light, saves, morale, surprise');
      return;
    }

    console.log(`\n⚡ ${topic.toUpperCase()}\n`);
    console.log(ref);
  }

  printHelp() {
    console.log(`
📚 AD&D 1st Edition DMG Skill

USAGE:
  node dmg-skill.js <command> [args]

COMMANDS:
  search <term>       Search all DMG content
  table <name>        Display specific table
  rule <section>      Show rule section
  ref <topic>         Quick reference card
  help                Show this help

TABLES:
  strength, intelligence, wisdom, dexterity, constitution, charisma
  THAC0, saving-throws, weapon-damage, armor-class
  cleric-xp, fighter-xp, mage-xp, thief-xp
  treasure-types, gem-values, jewelry-values

RULES:
  combat, magic, treasure, alignment, experience
  npcs, wilderness, dungeon, dm

QUICK REF:
  conditions, movement, light, saves, morale, surprise

EXAMPLES:
  node dmg-skill.js search "THAC0"
  node dmg-skill.js table strength
  node dmg-skill.js rule combat
  node dmg-skill.js ref movement
`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const skill = new DMGSkill();

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
        console.log('Available: strength, intelligence, THAC0, saving-throws, etc.');
        process.exit(1);
      }
      skill.printTable(args[1]);
      break;

    case 'rule':
      if (!args[1]) {
        console.log('Usage: rule <section>');
        console.log('Available: combat, magic, treasure, alignment, experience, npcs, wilderness, dungeon, dm');
        process.exit(1);
      }
      skill.printRule(args[1]);
      break;

    case 'ref':
      if (!args[1]) {
        console.log('Usage: ref <topic>');
        console.log('Available: conditions, movement, light, saves, morale, surprise');
        process.exit(1);
      }
      skill.printRef(args[1]);
      break;

    case 'help':
    default:
      skill.printHelp();
      break;
  }
}

module.exports = DMGSkill;
