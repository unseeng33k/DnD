#!/usr/bin/env node

/**
 * D&D Game Engine
 * Main orchestrator for gameplay with PartyManager integration
 * Usage: node game-engine.js [command] [options]
 */

const PartyManager = require('./party_manager');
const CharacterLogger = require('./logger');
const DMGSkill = require('./skills/dmg-skill/dmg-skill');
const PHBSkill = require('./skills/phb-skill/phb-skill');
const MMSkill = require('./skills/mm-skill/mm-skill');
const AmbianceAgent = require('./skills/ambiance-agent/ambiance');
const DisneyAmbiance = require('./skills/disney-ambiance');
const ASCIIMap = require('./skills/ascii-map/ascii-map');
const CombatTracker = require('./skills/combat-tracker');
const EncounterGenerator = require('./skills/encounter-generator');
const TreasureGenerator = require('./skills/treasure-generator');
const NameGenerator = require('./skills/name-generator');
const PuzzleTrapGenerator = require('./skills/puzzle-trap-generator');
const WeatherSystem = require('./skills/weather-system');
const CalendarTracker = require('./skills/calendar-tracker');
const QuestGenerator = require('./skills/quest-generator');
const DiceRoller = require('./skills/dice-roller');
const MoraleSystem = require('./skills/morale-system');
const DungeonGenerator = require('./skills/dungeon-generator');
const WildernessSystem = require('./skills/wilderness-system');
const HenchmanSystem = require('./skills/henchman-system');
const StrongholdSystem = require('./skills/stronghold-system');
const ResearchSystem = require('./skills/research-system');
const DivineIntervention = require('./skills/divine-intervention');
const DiseaseSystem = require('./skills/disease-system');
const TrainingSystem = require('./skills/training-system');
const MonsterEcology = require('./skills/monster-ecology');
const fs = require('fs');
const path = require('path');

class GameEngine {
  constructor() {
    this.pm = new PartyManager();
    this.dmg = new DMGSkill();
    this.phb = new PHBSkill();
    this.mm = new MMSkill();
    this.ambiance = new AmbianceAgent();
    this.disney = new DisneyAmbiance();
    this.map = new ASCIIMap();
    this.combat = new CombatTracker();
    this.encounter = new EncounterGenerator();
    this.treasure = new TreasureGenerator();
    this.names = new NameGenerator();
    this.puzzles = new PuzzleTrapGenerator();
    this.weather = new WeatherSystem();
    this.calendar = new CalendarTracker();
    this.quests = new QuestGenerator();
    this.dice = new DiceRoller();
    this.morale = new MoraleSystem();
    this.dungeon = new DungeonGenerator();
    this.wilderness = new WildernessSystem();
    this.henchman = new HenchmanSystem();
    this.stronghold = new StrongholdSystem();
    this.research = new ResearchSystem();
    this.divine = new DivineIntervention();
    this.disease = new DiseaseSystem();
    this.training = new TrainingSystem();
    this.ecology = new MonsterEcology();
    this.names = new NameGenerator();
    this.puzzles = new PuzzleTrapGenerator();
    this.weather = new WeatherSystem();
    this.calendar = new CalendarTracker();
    this.quests = new QuestGenerator();
    this.dice = new DiceRoller();
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

RULEBOOKS (Source of Truth):
  dmg <search-term>         Search DMG for rule
  dmg table <name>          Show table (strength, THAC0, etc.)
  dmg rule <section>        Show rule section (combat, magic, etc.)
  dmg ref <topic>           Quick reference (movement, saves, etc.)
  
  phb <search-term>         Search Player's Handbook
  phb table <name>          Show PHB table (strength, spells, etc.)
  
  mm <monster>              Show monster stats (DM only)
  show <monster>            Show monster to players (no stats)
  image <monster>           Generate actual monster image with DALL-E
  mm search <term>          Search monsters
  mm hd <number>            List monsters by hit dice
  mm type <type>            List monsters by type (undead, dragon, etc.)

MAP (ASCII Dungeon Maps):
  map                       Show current dungeon map
  move <x> <y>              Move party on map
  move room <room-id>       Move to specific room
  discover <x> <y>          Reveal area on map
  load-map <name>           Load dungeon (tamoachan)

SESSION PREP (Run BEFORE playing):
  prep                      Show prep instructions
  session-prep.js <name>    Full session prep with images
  
AMBIANCE (During gameplay):
  ambiance <scene>          Scene atmosphere + YouTube music links
  ambiance music <mood>     Music for mood (combat, tense, rest)
  ambiance tension <level>  Tension cues (low, rising, high, peak)
  generate <scene>          Generate AI image with DALL-E 3
  
  Scenes: dark forest, ancient temple, underground cavern, boss battle,
          tavern, swamp, mountain peak, city streets, crypt, wizard tower

GAMEPLAY SYSTEMS:
  combat start <enemies>    Start combat tracking
  combat next               Next turn
  combat damage <t> <dmg>   Deal damage in combat
  combat heal <t> <amt>     Heal in combat
  combat status             Show combat status
  combat end                End combat
  
  encounter <terrain> [time] Random encounter (jungle, dungeon, road)
  treasure [level]          Generate treasure hoard
  
  name <type> [count]       Generate names (human, elf, dwarf, tavern)
  riddle                    Generate a riddle
  trap [type]               Generate trap (mechanical, magical, complex)
  
  weather [region] [season] Generate weather
  date [advance <days>]     Show/advance date
  quest [level]             Generate quest hook
  
  roll <dice> [reason]      Roll dice (e.g., 2d6+3)
  roll stats                Show roll statistics

GYGAXIAN SYSTEMS:
  morale check <monster>    Check monster morale
  morale reaction           NPC reaction roll
  dungeon [level] [rooms]   Generate random dungeon
  forage <terrain> [wis]    Forage for food/water
  lost <terrain>            Check if party gets lost
  hire <type>               Generate hireling
  build <structure>         Calculate stronghold costs
  research <level>          Calculate spell research
  pray <level>              Attempt divine intervention
  disease check <source>    Check for infection
  disease                   Random disease
  train <level>             Calculate training costs
  ecology <monster>         Show monster ecology

DM TOOLS:
  check [campaign]          Pre-game character check
  prep                      Show prep instructions

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
      const dmgCmd = args[1];
      if (dmgCmd === 'table' && args[2]) {
        engine.dmg.printTable(args[2]);
      } else if (dmgCmd === 'rule' && args[2]) {
        engine.dmg.printRule(args[2]);
      } else if (dmgCmd === 'ref' && args[2]) {
        engine.dmg.printRef(args[2]);
      } else {
        // Default: search
        const results = engine.dmg.search(args.slice(1).join(' '));
        engine.dmg.printSearch(results, args.slice(1).join(' '));
      }
      break;

    // PHB Integration
    case 'phb':
      if (args.length < 2) {
        console.error('Usage: phb <search-term>');
        console.error('       phb table <table-name>');
        process.exit(1);
      }
      const phbCmd = args[1];
      if (phbCmd === 'table' && args[2]) {
        engine.phb.printTable(args[2]);
      } else {
        // Default: search
        const results = engine.phb.search(args.slice(1).join(' '));
        engine.phb.printSearch(results, args.slice(1).join(' '));
      }
      break;

    // Monster Manual Integration
    case 'mm':
    case 'monster':
    case 'show':
      if (args.length < 2) {
        console.error('Usage: mm <monster-name>              (DM view - with stats)');
        console.error('       show <monster-name>            (Player view - image only)');
        console.error('       image <monster-name>           (Generate actual image)');
        console.error('       mm search <term>');
        console.error('       mm hd <number>');
        console.error('       mm type <type>');
        process.exit(1);
      }
      const mmCmd = args[1];
      if (mmCmd === 'search' && args[2]) {
        const results = engine.mm.search(args.slice(2).join(' '));
        engine.mm.printSearch(results, args.slice(2).join(' '));
      } else if (mmCmd === 'hd' && args[2]) {
        engine.mm.printByHD(parseInt(args[2]));
      } else if (mmCmd === 'type' && args[2]) {
        engine.mm.printByType(args[2]);
      } else {
        // Default: get monster
        // "show" command = player view (no stats)
        // "mm" command = DM view (with stats)
        // "image" command = generate actual image
        const monsterName = (command === 'show' || command === 'image') ? args.slice(1).join(' ') : args[1];
        const showStats = command !== 'show' && command !== 'image';
        const generateImage = command === 'image';
        engine.mm.printMonster(monsterName, showStats, true, generateImage);
      }
      break;

    // ASCII Map Integration
    case 'map':
    case 'show-map':
      engine.map.printMap();
      break;

    case 'move':
      if (args.length < 2) {
        console.error('Usage: move <x> <y>  or  move room <room-id>');
        process.exit(1);
      }
      if (args[1] === 'room' && args[2]) {
        if (engine.map.moveToRoom(args[2])) {
          console.log(`Party moved to ${args[2]}.`);
          engine.map.printMap();
        } else {
          console.log('Room not found.');
        }
      } else if (args.length >= 3) {
        if (engine.map.moveParty(parseInt(args[1]), parseInt(args[2]))) {
          console.log('Party moved.');
          engine.map.printMap();
        } else {
          console.log('Invalid coordinates.');
        }
      } else {
        console.error('Usage: move <x> <y>  or  move room <room-id>');
        process.exit(1);
      }
      break;

    case 'discover':
      if (args.length < 3) {
        console.error('Usage: discover <x> <y>');
        process.exit(1);
      }
      engine.map.discover(parseInt(args[1]), parseInt(args[2]));
      console.log('Area discovered.');
      engine.map.printMap();
      break;

    case 'load-map':
      if (!args[1]) {
        console.error('Usage: load-map <dungeon-name>');
        console.error('Available: tamoachan');
        process.exit(1);
      }
      if (args[1] === 'tamoachan') {
        engine.map.createTamoachan();
        console.log('Loaded: Hidden Shrine of Tamoachan');
        engine.map.printMap();
      } else {
        console.log('Dungeon not found. Available: tamoachan');
      }
      break;

    // Ambiance Agent Integration
    case 'ambiance':
    case 'atmosphere':
    case 'scene':
      if (args.length < 2) {
        console.error('Usage: ambiance <scene-name>');
        console.error('       ambiance music <mood>');
        console.error('       ambiance tension <level>');
        console.error('       ambiance image          (get prompt)');
        console.error('       disney <scene>          (Disney-style magic)');
        console.error('Scenes: dark forest, ancient temple, underground cavern, boss battle, tavern, swamp, mountain peak, city streets, crypt, wizard tower');
        process.exit(1);
      }
      const ambianceCmd = args[1];
      if (ambianceCmd === 'music' && args[2]) {
        engine.ambiance.setMood(args[2]);
        console.log(engine.ambiance.getMusic());
      } else if (ambianceCmd === 'tension' && args[2]) {
        console.log('\n⚡ TENSION CUE:\n');
        console.log(engine.ambiance.getTensionCue(args[2]));
      } else if (ambianceCmd === 'image') {
        console.log('\n🎨 AI IMAGE PROMPT:\n');
        console.log(engine.ambiance.generateImagePrompt());
      } else {
        // Set scene
        engine.ambiance.setScene(args.slice(1).join(' '));
        engine.ambiance.printScene();
      }
      break;

    // Disney Ambiance
    case 'disney':
    case 'magic':
      if (!args[1]) {
        console.log('\n✨ DISNEY AMBIANCE\n');
        console.log('Usage:');
        console.log('  disney scene <name>       - Set scene with magic moment');
        console.log('  disney moment             - Random magic moment');
        console.log('  disney theme <char> <type> - Assign character theme');
        console.log('  disney play <char>        - Play character theme');
        console.log('  disney wow <type>         - Generate wow factor');
        console.log('  disney whimsical          - Whimsical encounter');
        console.log('  disney arc <char> <hope>  - Track character arc');
        return;
      }
      
      const disneyCmd = args[1];
      if (disneyCmd === 'scene' && args[2]) {
        engine.disney.setEmotionalArc('wonder');
        const moment = engine.disney.generateMagicMoment();
        console.log(`\n✨ ${args.slice(2).join(' ').toUpperCase()}\n`);
        console.log(moment);
        console.log('\n🎵 Music swells with wonder and possibility...');
      } else if (disneyCmd === 'moment') {
        console.log('\n✨ ' + engine.disney.generateMagicMoment());
      } else if (disneyCmd === 'theme' && args[2] && args[3]) {
        engine.disney.assignCharacterTheme(args[2], args[3]);
        console.log(`\n🎵 ${args[2]} now has a ${args[3]} theme!`);
      } else if (disneyCmd === 'play' && args[2]) {
        const theme = engine.disney.playCharacterTheme(args[2], 'normal');
        console.log(`\n🎵 ${theme.character}'s Theme:`);
        console.log(`   ${theme.leitmotif}`);
      } else if (disneyCmd === 'wow' && args[2]) {
        const wow = engine.disney.generateWowFactor(args[2]);
        if (wow) {
          console.log('\n🌟 WOW FACTOR 🌟\n');
          console.log(wow.description);
          console.log(`\n🎵 ${wow.music}`);
        } else {
          console.log('Wow factor already used this session.');
        }
      } else if (disneyCmd === 'whimsical') {
        const enc = engine.disney.generateWhimsicalEncounter();
        console.log('\n🦊 WHIMSICAL ENCOUNTER\n');
        console.log(`A ${enc.creature} approaches!`);
        console.log(`It offers: ${enc.offer}`);
        console.log(`It wants: ${enc.wants}`);
      } else if (disneyCmd === 'arc' && args[2] && args[3]) {
        const arc = engine.disney.trackCharacterArc(args[2], args[3], 25);
        console.log(`\n💖 ${arc.message}`);
      } else {
        console.log('Unknown disney command. Try: disney (no args) for help');
      }
      break;

    // AI Image Generation
    case 'generate':
    case 'image-gen':
      if (args.length < 2) {
        console.error('Usage: generate <scene-name>');
        console.error('       generate "dark forest"');
        console.error('       generate "boss battle"');
        process.exit(1);
      }
      console.log('\n🎨 Generating AI image with DALL-E 3...\n');
      engine.ambiance.setScene(args.slice(1).join(' '));
      engine.ambiance.generateImage().then(result => {
        if (result.success) {
          console.log('✅ Image generated!\n');
          console.log(`🖼️  URL: ${result.url}\n`);
          console.log(`📝 Prompt: ${result.original_prompt}`);
        } else {
          console.log('❌ Failed to generate image:');
          console.log(result.error);
          console.log('\n📝 Prompt that would have been used:');
          console.log(result.prompt);
        }
      });
      break;

    // Quick Session Prep
    case 'prep':
      console.log('\n🎲 QUICK SESSION PREP\n');
      console.log('Run this BEFORE your session to generate all images.\n');
      console.log('For full prep with custom locations/monsters:');
      console.log('  node session-prep.js "Session Name" ./config.json\n');
      console.log('Quick ambiance for common scenes:');
      console.log('  ambiance dark forest     - Forest atmosphere + music');
      console.log('  ambiance ancient temple  - Temple atmosphere + music');
      console.log('  ambiance boss battle     - Boss room atmosphere + music');
      console.log('\nQuick monster images:');
      console.log('  show goblin    - Shows monster (copy prompt to DALL-E)');
      console.log('  show dragon    - Shows monster (copy prompt to DALL-E)');
      console.log('\nDuring gameplay, click YouTube links for sound.');
      break;

    // Combat System
    case 'combat':
      if (args[1] === 'start') {
        const enemies = args.slice(2).map(e => ({ name: e, hp: 10, ac: 10, initiative: Math.floor(Math.random() * 20) + 1 }));
        engine.combat.startCombat(enemies);
        console.log(engine.combat.getStatus());
      } else if (args[1] === 'next') {
        const turn = engine.combat.nextTurn();
        console.log(`\n🎯 ${turn.name}'s turn!`);
        console.log(engine.combat.getStatus());
      } else if (args[1] === 'damage') {
        const target = args[2];
        const dmg = parseInt(args[3]);
        engine.combat.damage(target, dmg);
        console.log(engine.combat.getStatus());
      } else if (args[1] === 'heal') {
        const target = args[2];
        const heal = parseInt(args[3]);
        engine.combat.heal(target, heal);
        console.log(engine.combat.getStatus());
      } else if (args[1] === 'status') {
        console.log(engine.combat.getStatus());
      } else if (args[1] === 'end') {
        engine.combat.endCombat();
        console.log('Combat ended!');
      } else {
        console.log('Usage: combat start <enemy1> <enemy2>...');
        console.log('       combat next');
        console.log('       combat damage <target> <amount>');
        console.log('       combat heal <target> <amount>');
        console.log('       combat status');
        console.log('       combat end');
      }
      break;

    // Encounter Generator
    case 'encounter':
      const terrain = args[1] || 'jungle';
      const time = args[2] || 'day';
      const result = engine.encounter.generate(terrain, time);
      console.log('\n👹 RANDOM ENCOUNTER\n');
      console.log(`Terrain: ${result.terrain}`);
      console.log(`Time: ${result.timeOfDay}`);
      console.log(`Encounter: ${result.encounter}`);
      if (result.weatherEffect) console.log(`Weather Effect: ${result.weatherEffect}`);
      break;

    // Treasure Generator
    case 'treasure':
      const level = parseInt(args[1]) || 1;
      const hoard = engine.treasure.generateHoard(level);
      console.log(engine.treasure.formatHoard(hoard));
      break;

    // Name Generator
    case 'name':
      const type = args[1] || 'human';
      const count = parseInt(args[2]) || 5;
      const names = engine.names.generateMultiple(type, count);
      console.log(`\n📝 ${type.toUpperCase()} NAMES:\n`);
      names.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
      break;

    // Puzzle/Trap Generator
    case 'riddle':
      const riddle = engine.puzzles.generateRiddle();
      console.log('\n🧩 RIDDLE\n');
      console.log(riddle.question);
      console.log(`\n💡 Hint: ${riddle.hint}`);
      console.log(`\n✅ Answer: ${riddle.answer}`);
      break;

    case 'trap':
      const trapType = args[1] || 'random';
      const trap = engine.puzzles.generateTrap(trapType);
      console.log('\n⚠️  TRAP\n');
      console.log(`Name: ${trap.name || trap.description}`);
      if (trap.trigger) console.log(`Trigger: ${trap.trigger}`);
      if (trap.effect) console.log(`Effect: ${trap.effect}`);
      if (trap.detect) console.log(`Detect: ${trap.detect}`);
      if (trap.disarm) console.log(`Disarm: ${trap.disarm}`);
      if (trap.solution) console.log(`Solution: ${trap.solution}`);
      break;

    // Weather System
    case 'weather':
      const wRegion = args[1] || 'temperate';
      const wSeason = args[2] || 'spring';
      const weather = engine.weather.generate(wRegion, wSeason);
      console.log('\n🌤️  WEATHER\n');
      console.log(`Weather: ${weather.weather}`);
      console.log(`Temperature: ${weather.temperature}`);
      console.log(`Wind: ${weather.wind}`);
      console.log(`Effect: ${weather.effect}`);
      break;

    // Calendar
    case 'date':
      if (args[1] === 'advance') {
        const days = parseInt(args[2]) || 1;
        engine.calendar.advanceDay(days);
      }
      engine.calendar.printStatus();
      break;

    // Quest Generator
    case 'quest':
      const qLevel = parseInt(args[1]) || 1;
      const quest = engine.quests.generate(qLevel);
      console.log(engine.quests.formatQuest(quest));
      break;

    // Dice Roller
    case 'roll':
      if (!args[1]) {
        console.log('Usage: roll <dice> [reason]');
        console.log('       roll 2d6+3 "attack"');
        console.log('       roll stats');
        process.exit(1);
      }
      if (args[1] === 'stats') {
        console.log(engine.dice.printStats());
      } else {
        const rollResult = engine.dice.roll(args[1], args.slice(2).join(' '));
        console.log(engine.dice.printRoll(rollResult));
      }
      break;

    // Morale System
    case 'morale':
      if (args[1] === 'check') {
        const monster = args[2] || 'goblin';
        const baseMorale = engine.morale.getMonsterMorale(monster);
        const result = engine.morale.checkMorale(baseMorale, { leaderPresent: true });
        console.log(`\n🎲 ${monster.toUpperCase()} MORALE CHECK\n`);
        console.log(`Base Morale: ${baseMorale}`);
        console.log(`Roll: ${result.roll} + Modifier: ${result.modifier} = ${result.total}`);
        console.log(`Result: ${result.result}`);
      } else if (args[1] === 'reaction') {
        const reaction = engine.morale.checkReaction();
        console.log(`\n🎲 REACTION ROLL\n`);
        console.log(`Result: ${reaction.result}`);
      } else {
        console.log('Usage: morale check <monster>');
        console.log('       morale reaction');
      }
      break;

    // Dungeon Generator
    case 'dungeon':
      const dungeon = engine.dungeon.generateDungeon(parseInt(args[1]) || 1, parseInt(args[2]) || 10);
      console.log(engine.dungeon.printDungeon(dungeon));
      break;

    // Wilderness Survival
    case 'forage':
      const forageResult = engine.wilderness.forage(args[1] || 'forest', parseInt(args[2]) || 10);
      console.log('\n🌿 FORAGING\n');
      console.log(`Success: ${forageResult.success}`);
      console.log(`Food: ${forageResult.food} days`);
      console.log(`Water: ${forageResult.water} days`);
      console.log(forageResult.description);
      break;

    case 'lost':
      const lost = engine.wilderness.checkLost(args[1] || 'forest');
      console.log('\n🧭 NAVIGATION\n');
      if (lost.lost) {
        console.log(`❌ LOST! Walking ${lost.direction}`);
      } else {
        console.log(`✅ ${lost.reason}`);
      }
      break;

    // Henchmen
    case 'hire':
      const hireType = args[1] || 'mercenary';
      const hireling = engine.henchman.generateHireling(hireType);
      console.log('\n👤 HIRELING\n');
      console.log(`Name: ${hireling.name}`);
      console.log(`Type: ${hireling.type}`);
      console.log(`HP: ${hireling.hp}, AC: ${hireling.ac}`);
      console.log(`Wage: ${hireling.wage} gp/day`);
      break;

    // Stronghold
    case 'build':
      if (!args[1]) {
        console.log('Usage: build <structure>');
        console.log('Structures: keep, castle, tower, smallCastle, fortifiedMonastery');
        return;
      }
      const build = engine.stronghold.calculateConstruction(args[1]);
      if (build.error) {
        console.log(build.error);
      } else {
        console.log(`\n🏰 ${args[1].toUpperCase()}\n`);
        console.log(`Cost: ${build.cost.toLocaleString()} gp`);
        console.log(`Time: ${build.time}`);
        console.log(`Garrison: ${build.garrison}`);
        console.log(`Monthly Upkeep: ${build.monthlyUpkeep} gp`);
      }
      break;

    // Research
    case 'research':
      const spellLevel = parseInt(args[1]) || 1;
      const research = engine.research.calculateResearchCost(spellLevel, { intelligence: 16 });
      console.log(`\n📚 RESEARCH SPELL LEVEL ${spellLevel}\n`);
      console.log(`Cost: ${research.cost} gp`);
      console.log(`Time: ${research.time}`);
      console.log(`Success Chance: ${research.successChance}%`);
      break;

    // Divine Intervention
    case 'pray':
      const clericLevel = parseInt(args[1]) || 5;
      const intervention = engine.divine.attempt(clericLevel, 5);
      console.log(`\n🙏 DIVINE INTERVENTION (Level ${clericLevel})\n`);
      console.log(`Roll: ${intervention.roll} vs ${intervention.chance}%`);
      console.log(`Result: ${intervention.success ? 'SUCCESS!' : 'No response'}`);
      if (intervention.intervention) {
        console.log(`Miracle: ${intervention.intervention}`);
        console.log(`Consequence: ${intervention.consequence}`);
      }
      break;

    // Disease
    case 'disease':
      if (args[1] === 'check') {
        const infection = engine.disease.checkInfection(args[2] || 'giant rat bite');
        console.log('\n🦠 INFECTION CHECK\n');
        console.log(`Source: ${args[2] || 'giant rat bite'}`);
        console.log(`Infected: ${infection.infected ? 'YES!' : 'No'}`);
        if (infection.disease) {
          console.log(`Disease: ${infection.disease.name}`);
          console.log(`Onset: ${infection.disease.onset}`);
          console.log(`Cure: ${infection.disease.cure}`);
        }
      } else {
        const disease = engine.disease.generateRandomDisease();
        console.log('\n🦠 DISEASE\n');
        console.log(`Name: ${disease.name}`);
        console.log(`Onset: ${disease.onset}`);
        console.log(`Symptoms: ${disease.symptoms}`);
        console.log(`Cure: ${disease.cure}`);
      }
      break;

    // Training
    case 'train':
      const trainLevel = parseInt(args[1]) || 1;
      const training = engine.training.calculateTrainingCost('fighter', trainLevel);
      console.log(`\n📖 TRAINING TO LEVEL ${training.nextLevel}\n`);
      console.log(`Cost: ${training.cost} gp`);
      console.log(`Time: ${training.time}`);
      console.log(`HP Gain: 1d${training.nextLevel <= 9 ? 10 : 3}`);
      break;

    // Monster Ecology
    case 'ecology':
      if (!args[1]) {
        console.log('Usage: ecology <monster>');
        return;
      }
      console.log(engine.ecology.printEcology(args[1]));
      break;

    // Pre-Game Check
    case 'check':
    case 'pregame':
      const PregameCheck = require('./pregame-check');
      const campaignCheck = args[1] || 'Tamoachan Playtest';
      const pgChecker = new PregameCheck(campaignCheck);
      const pgReady = pgChecker.checkAll();
      
      // Save to campaign logs
      const campaignCheckDir = path.join(__dirname, 'campaigns', campaignCheck);
      if (fs.existsSync(campaignCheckDir)) {
        pgChecker.saveReport(campaignCheckDir);
      }
      
      process.exit(pgReady ? 0 : 1);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

module.exports = GameEngine;
