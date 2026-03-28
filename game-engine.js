#!/usr/bin/env node

/**
 * D&D Game Engine
 * Main orchestrator for gameplay with PartyManager integration
 * Usage: node game-engine.js [command] [options]
 */

const PartyManager = require('./party_manager');
const CharacterLogger = require('./logger');
const DMGSkill = require('./skills/dmg-skill/dmg-skill');
const fs = require('fs');
const path = require('path');

class GameEngine {
  constructor() {
    this.pm = new PartyManager();
    this.dmg = new DMGSkill();
    this.loggers = {};
    this.activeCharacter = null;

    // Initialize loggers for all party members
    this.initializeLoggers();
  }

  initializeLoggers() {
    if (!this.pm.party || !this.pm.party.members) return;
    
    for (const char of this.pm.party.members) {
      this.loggers[char.character_id] = new CharacterLogger(
        char.name, 
        char.character_id
      );
    }
    
    // Set first active character
    if (this.pm.party.members.length > 0) {
      this.activeCharacter = this.pm.party.members[0].character_id;
    }
  }

  getLogger(charId = null) {
    const id = charId || this.activeCharacter;
    return this.loggers[id];
  }

  // ============ DM COMMANDS ============

  /**
   * Cast a spell (with validation)
   */
  castSpell(spellName, level, spellClass, target = '', effect = '') {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) {
      console.error(`Character ${charId} not found`);
      return false;
    }

    // Check if spell can be cast
    const available = this.pm.getAvailableSpells(charId, spellClass, level);
    if (available <= 0) {
      console.log(`❌ ${char.name} has no level ${level} ${spellClass} spell slots remaining!`);
      return false;
    }

    // Cast the spell
    try {
      this.pm.castSpell(charId, spellName, level, spellClass);
      
      // Log it
      const logger = this.getLogger(charId);
      if (logger) {
        logger.logSpell(spellName, target, effect, spellClass, level);
      }
      
      const remaining = this.pm.getAvailableSpells(charId, spellClass, level);
      console.log(`✨ ${char.name} casts ${spellName}! (${remaining} slots remaining)`);
      return true;
    } catch (e) {
      console.error(`❌ ${e.message}`);
      return false;
    }
  }

  /**
   * Use innate ability
   */
  useInnate(abilityName, description = '') {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) return false;

    this.pm.useInnate(charId, abilityName, description);
    
    const logger = this.getLogger(charId);
    if (logger) {
      logger.logInnateAbility(abilityName, description);
    }
    
    console.log(`🌟 ${char.name} uses ${abilityName}`);
    return true;
  }

  /**
   * Deal damage to character
   */
  damage(amount, source = 'unknown') {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) return null;

    const result = this.pm.updateHP(charId, amount, false);
    
    const logger = this.getLogger(charId);
    if (logger) {
      logger.logDamage(amount, source);
    }
    
    console.log(`💔 ${char.name} takes ${result.change} damage! (${result.new_hp}/${char.hp.max} HP)`);
    
    if (result.new_hp === 0) {
      console.log(`☠️  ${char.name} is unconscious!`);
    }
    
    return result;
  }

  /**
   * Heal character
   */
  heal(amount, source = 'healing') {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) return null;

    const result = this.pm.updateHP(charId, amount, true);
    
    const logger = this.getLogger(charId);
    if (logger) {
      logger.logHealing(result.change, source);
    }
    
    console.log(`💚 ${char.name} heals ${result.change} HP! (${result.new_hp}/${char.hp.max} HP)`);
    return result;
  }

  /**
   * Start combat
   */
  startCombat(enemies) {
    const enemyArray = enemies.map((e, i) => ({
      name: typeof e === 'string' ? e : e.name,
      hp_max: typeof e === 'string' ? 10 : (e.hp || 10),
      xp: typeof e === 'string' ? 10 : (e.xp || 10)
    }));
    
    this.pm.startCombat(enemyArray);
    
    // Log for all characters
    for (const char of this.pm.party.members) {
      const logger = this.getLogger(char.character_id);
      if (logger) {
        logger.startCombat(enemyArray);
      }
    }
    
    console.log(`⚔️  Combat started! Enemies: ${enemyArray.map(e => e.name).join(', ')}`);
  }

  /**
   * Damage an enemy
   */
  damageEnemy(enemyIndex, damage) {
    const hp = this.pm.damageEnemy(enemyIndex, damage);
    if (hp !== null) {
      const enemy = this.pm.session.combat.enemies[enemyIndex];
      console.log(`🗡️  ${enemy.name || 'Enemy'} takes ${damage} damage! (${hp} HP remaining)`);
      
      if (hp === 0) {
        console.log(`💀 ${enemy.name || 'Enemy'} killed!`);
      }
    }
    return hp;
  }

  /**
   * End combat
   */
  endCombat(xpEarned = 0) {
    this.pm.endCombat(xpEarned);
    
    for (const char of this.pm.party.members) {
      const logger = this.getLogger(char.character_id);
      if (logger) {
        logger.endCombat(xpEarned);
      }
    }
    
    console.log(`🏆 Combat ended! ${xpEarned} XP earned`);
  }

  /**
   * Move party to new location
   */
  moveTo(location, description = '') {
    this.pm.moveParty(location, description);
    console.log(`🚶 Party moves to: ${location}`);
    if (description) {
      console.log(`   ${description}`);
    }
  }

  /**
   * Party rests
   */
  rest(hours = 8) {
    this.pm.rest(hours);
    
    for (const char of this.pm.party.members) {
      const logger = this.getLogger(char.character_id);
      if (logger) {
        logger.logRest(this.pm.session.party_location.room, `${hours} hours`, 'varies', 'Rest complete');
      }
    }
    
    console.log(`😴 Party rests for ${hours} hours. Spells refreshed!`);
  }

  /**
   * Add condition to character
   */
  addCondition(condition, duration = null) {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) return;

    this.pm.addCondition(charId, condition, duration);
    
    const logger = this.getLogger(charId);
    if (logger) {
      logger.logCondition(condition, duration);
    }
    
    console.log(`⚠️  ${char.name} gains condition: ${condition}`);
  }

  /**
   * Remove condition from character
   */
  removeCondition(condition) {
    const charId = this.activeCharacter;
    const char = this.pm.getCharacter(charId);
    
    if (!char) return;

    this.pm.removeCondition(charId, condition);
    
    const logger = this.getLogger(charId);
    if (logger) {
      logger.logConditionRemoved(condition);
    }
    
    console.log(`✅ ${char.name} loses condition: ${condition}`);
  }

  /**
   * Switch active character
   */
  setCharacter(charId) {
    if (this.loggers[charId]) {
      this.activeCharacter = charId;
      const char = this.pm.getCharacter(charId);
      console.log(`👤 Active character: ${char.name}`);
      return true;
    }
    console.error(`Character ${charId} not found`);
    return false;
  }

  /**
   * Show party status
   */
  status() {
    this.pm.printStatus();
  }

  /**
   * Show recent events
   */
  events(limit = 10) {
    this.pm.printRecentEvents(limit);
  }

  /**
   * Show spell availability
   */
  spells(charId = null) {
    const id = charId || this.activeCharacter;
    const char = this.pm.getCharacter(id);
    
    if (!char) {
      console.error(`Character not found`);
      return;
    }

    console.log(`\n✨ Spells for ${char.name}:`);
    
    if (char.class.toLowerCase().includes('cleric')) {
      console.log(`  Cleric L1: ${this.pm.getAvailableSpells(id, 'cleric', 1)} available`);
      console.log(`  Cleric L2: ${this.pm.getAvailableSpells(id, 'cleric', 2)} available`);
      console.log(`  Cleric L3: ${this.pm.getAvailableSpells(id, 'cleric', 3)} available`);
    }
    
    if (char.class.toLowerCase().includes('mage')) {
      const l1 = this.pm.getAvailableSpells(id, 'mage', 1);
      console.log(`  Mage L1: ${l1} available (Ring of Wizardry: 2x)`);
      console.log(`  Mage L2: ${this.pm.getAvailableSpells(id, 'mage', 2)} available`);
      console.log(`  Mage L3: ${this.pm.getAvailableSpells(id, 'mage', 3)} available`);
    }
  }
}

// ============ CLI INTERFACE ============

function printHelp() {
  console.log(`
🎲 D&D GAME ENGINE - Party Manager Integration

USAGE:
  node game-engine.js <command> [args]

COMMANDS:
  status                    Show party status
  spells [char-id]          Show spell availability
  events [n]                Show recent events (default 10)
  
  cast <spell> <level> <class> [target]
                            Cast a spell (auto-validates slots)
  innate <ability>          Use innate ability
  
  damage <amount> [source]  Deal damage to active character
  heal <amount> [source]    Heal active character
  
  combat-start <enemies>    Start combat (comma-separated)
  damage-enemy <idx> <dmg>  Damage enemy by index
  combat-end [xp]           End combat
  
  move <location> [desc]    Move party to new location
  rest [hours]              Party rests (refreshes spells)
  
  condition <name> [dur]    Add condition to active character
  condition-remove <name>   Remove condition
  
  char <char-id>            Switch active character

DMG RULES (Source of Truth):
  dmg <search-term>         Search DMG for rule
  dmg table <name>          Show table (strength, THAC0, etc.)
  dmg rule <section>        Show rule section (combat, magic, etc.)
  dmg ref <topic>           Quick reference (movement, saves, etc.)

EXAMPLES:
  node game-engine.js cast "Magic Missile" 1 mage "Orc"
  node game-engine.js damage 5 "Trap"
  node game-engine.js heal 10 "Potion"
  node game-engine.js combat-start "Orc,Orc,Goblin"
  node game-engine.js combat-end 150
  node game-engine.js move "Throne Room" "Ancient stone chamber"
  node game-engine.js innate "Darkness" "60' radius"
  node game-engine.js dmg "saving throws"
  node game-engine.js dmg table strength
  node game-engine.js dmg rule combat
  node game-engine.js dmg ref movement
`);
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  const engine = new GameEngine();

  switch (command) {
    case 'status':
      engine.status();
      break;
    
    case 'spells':
      engine.spells(args[1]);
      break;
    
    case 'events':
      engine.events(parseInt(args[1]) || 10);
      break;
    
    case 'cast':
      if (args.length < 4) {
        console.error('Usage: cast <spell> <level> <class> [target]');
        process.exit(1);
      }
      engine.castSpell(args[1], parseInt(args[2]), args[3], args[4] || '', args[5] || '');
      break;
    
    case 'innate':
      if (args.length < 2) {
        console.error('Usage: innate <ability> [description]');
        process.exit(1);
      }
      engine.useInnate(args[1], args.slice(2).join(' '));
      break;
    
    case 'damage':
      if (args.length < 2) {
        console.error('Usage: damage <amount> [source]');
        process.exit(1);
      }
      engine.damage(parseInt(args[1]), args[2] || 'unknown');
      break;
    
    case 'heal':
      if (args.length < 2) {
        console.error('Usage: heal <amount> [source]');
        process.exit(1);
      }
      engine.heal(parseInt(args[1]), args[2] || 'healing');
      break;
    
    case 'combat-start':
      if (args.length < 2) {
        console.error('Usage: combat-start <enemy1,enemy2,...>');
        process.exit(1);
      }
      const enemies = args[1].split(',').map(e => e.trim());
      engine.startCombat(enemies);
      break;
    
    case 'damage-enemy':
      if (args.length < 3) {
        console.error('Usage: damage-enemy <index> <damage>');
        process.exit(1);
      }
      engine.damageEnemy(parseInt(args[1]), parseInt(args[2]));
      break;
    
    case 'combat-end':
      engine.endCombat(parseInt(args[1]) || 0);
      break;
    
    case 'move':
      if (args.length < 2) {
        console.error('Usage: move <location> [description]');
        process.exit(1);
      }
      engine.moveTo(args[1], args.slice(2).join(' '));
      break;
    
    case 'rest':
      engine.rest(parseInt(args[1]) || 8);
      break;
    
    case 'condition':
      if (args.length < 2) {
        console.error('Usage: condition <name> [duration]');
        process.exit(1);
      }
      engine.addCondition(args[1], args[2]);
      break;
    
    case 'condition-remove':
      if (args.length < 2) {
        console.error('Usage: condition-remove <name>');
        process.exit(1);
      }
      engine.removeCondition(args[1]);
      break;
    
    case 'char':
      if (args.length < 2) {
        console.error('Usage: char <character-id>');
        process.exit(1);
      }
      engine.setCharacter(args[1]);
      break;

    // DMG Integration
    case 'dmg':
    case 'rule':
      if (args.length < 2) {
        console.error('Usage: dmg <search-term>');
        console.error('       dmg table <table-name>');
        console.error('       dmg rule <section>');
        console.error('       dmg ref <topic>');
        process.exit(1);
      }
      const subCmd = args[1];
      if (subCmd === 'table' && args[2]) {
        engine.dmg.printTable(args[2]);
      } else if (subCmd === 'rule' && args[2]) {
        engine.dmg.printRule(args[2]);
      } else if (subCmd === 'ref' && args[2]) {
        engine.dmg.printRef(args[2]);
      } else {
        // Default: search
        const results = engine.dmg.search(args.slice(1).join(' '));
        engine.dmg.printSearch(results, args.slice(1).join(' '));
      }
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

module.exports = GameEngine;
