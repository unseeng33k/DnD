#!/usr/bin/env node

/**
 * Steve Jobs-Style D&D Interface
 * Simple, elegant, "It Just Works"
 */

const fs = require('fs');
const path = require('path');
const PartyManager = require('./party_manager');
const CombatTracker = require('./skills/combat-tracker');
const DiceRoller = require('./skills/dice-roller');
const ASCIIMap = require('./skills/ascii-map/ascii-map');
const DisneyAmbiance = require('./skills/disney-ambiance');

class SimpleDND {
  constructor() {
    this.pm = new PartyManager();
    this.combat = new CombatTracker();
    this.dice = new DiceRoller();
    this.map = new ASCIIMap();
    this.ambiance = new DisneyAmbiance();
    this.state = this.loadState();
  }

  loadState() {
    const stateFile = path.join(__dirname, '.dnd-state.json');
    try {
      return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (e) {
      return {
        lastCampaign: null,
        lastScene: null,
        favorites: {
          monsters: [],
          scenes: [],
          music: []
        },
        shortcuts: {}
      };
    }
  }

  saveState() {
    const stateFile = path.join(__dirname, '.dnd-state.json');
    fs.writeFileSync(stateFile, JSON.stringify(this.state, null, 2));
  }

  // Main entry - the "One Button"
  start() {
    console.clear();
    this.printHeader();
    
    if (this.state.lastCampaign) {
      this.showContinueScreen();
    } else {
      this.showWelcomeScreen();
    }
  }

  printHeader() {
    console.log('\n  🎲  D&D\n');
  console.log('  ─────────────────────\n');
  }

  showContinueScreen() {
    const party = this.pm.party;
    const location = this.pm.session?.party_location?.room || 'Unknown';
    
    console.log(`  Welcome back, Dungeon Master.\n`);
    console.log(`  Your party is in ${location}.`);
    
    if (party?.members) {
      const names = party.members.map(m => m.name).join(', ');
      console.log(`  ${names} are ready for adventure.\n`);
    }
    
    // Smart suggestion based on state
    const suggestion = this.getSmartSuggestion();
    if (suggestion) {
      console.log(`  💡 ${suggestion}\n`);
    }
    
    console.log('  [1] Continue Session');
    console.log('  [2] New Scene');
    console.log('  [3] Combat');
    console.log('  [4] Rest');
    console.log('  [5] Settings');
    console.log('  [q] Quit\n');
  }

  showWelcomeScreen() {
    console.log('  Welcome to D&D.\n');
    console.log('  Everything you need to run a game,');
    console.log("  nothing you don't.\n");
    console.log('  [1] Start New Campaign');
    console.log('  [2] Load Campaign');
    console.log('  [q] Quit\n');
  }

  getSmartSuggestion() {
    // Check if combat is active
    if (this.combat.active) {
      return `Combat in progress! It's ${this.combat.initiative[this.combat.currentTurn]?.name}'s turn.`;
    }
    
    // Check if party is low on HP
    const injured = this.pm.party?.members?.filter(m => {
      const sessionChar = this.pm.session?.characters?.[m.character_id];
      return sessionChar && sessionChar.hp_current < m.hp.max * 0.5;
    });
    
    if (injured?.length > 0) {
      return `${injured.map(i => i.name).join(', ')} are injured. Consider resting.`;
    }
    
    // Check time since last session
    if (this.state.lastScene) {
      return `Last scene: ${this.state.lastScene}. Ready to continue?`;
    }
    
    return null;
  }

  // Natural language processing
  processCommand(input) {
    const cmd = input.toLowerCase().trim();
    
    // Combat commands
    if (cmd.includes('combat') || cmd.includes('fight')) {
      return this.handleCombat(cmd);
    }
    
    // Rest commands
    if (cmd.includes('rest') || cmd.includes('sleep') || cmd.includes('camp')) {
      return this.handleRest();
    }
    
    // Show commands
    if (cmd.includes('show') || cmd.includes('look')) {
      return this.handleShow(cmd);
    }
    
    // Movement
    if (cmd.includes('go') || cmd.includes('move') || cmd.includes('enter')) {
      return this.handleMove(cmd);
    }
    
    // Roll dice
    if (cmd.includes('roll') || cmd.match(/\d+d\d+/)) {
      return this.handleRoll(cmd);
    }
    
    // Map
    if (cmd.includes('map')) {
      this.map.printMap();
      return;
    }
    
    // Help
    if (cmd.includes('help')) {
      this.showHelp();
      return;
    }
    
    console.log('  Try: "combat starts", "we rest", "show goblin", "roll 2d6"');
  }

  handleCombat(cmd) {
    if (cmd.includes('start') || cmd.includes('begin')) {
      // Extract enemy names
      const enemies = cmd.replace(/.*(?:with|against|vs)/, '').trim();
      const enemyList = enemies.split(/,|\s+and\s+/).filter(e => e.length > 0);
      
      if (enemyList.length === 0) {
        console.log('  Who are you fighting? (e.g., "combat starts with 3 goblins")');
        return;
      }
      
      const combatants = enemyList.map((e, i) => ({
        name: e.trim(),
        hp: 10,
        ac: 10,
        initiative: Math.floor(Math.random() * 20) + 1
      }));
      
      this.combat.startCombat(combatants);
      console.log('\n  ⚔️  Combat begins!\n');
      console.log(this.combat.getStatus());
      
      this.state.lastScene = 'Combat';
      this.saveState();
      return;
    }
    
    if (cmd.includes('next') || cmd.includes('turn')) {
      const turn = this.combat.nextTurn();
      console.log(`\n  🎯 ${turn.name}'s turn!\n`);
      console.log(this.combat.getStatus());
      return;
    }
    
    if (cmd.includes('end') || cmd.includes('stop')) {
      this.combat.endCombat();
      console.log('  Combat ended.');
      return;
    }
    
    if (cmd.includes('status')) {
      console.log(this.combat.getStatus());
      return;
    }
    
    console.log('  Combat commands: start, next, end, status');
  }

  handleRest() {
    console.log('\n  😴 The party rests...\n');
    
    // Refresh spells
    for (const charId of Object.keys(this.pm.session?.characters || {})) {
      const sessionChar = this.pm.session.characters[charId];
      if (sessionChar) {
        sessionChar.spells_cast = {
          cleric: { level_1: [], level_2: [], level_3: [] },
          mage: { level_1: [], level_2: [], level_3: [] }
        };
        sessionChar.innate_used = [];
      }
    }
    
    // Heal some HP
    const char = this.pm.party?.members?.[0];
    if (char) {
      const sessionChar = this.pm.session?.characters?.[char.character_id];
      if (sessionChar) {
        const healAmount = 2;
        sessionChar.hp_current = Math.min(char.hp.max, sessionChar.hp_current + healAmount);
        console.log(`  Everyone heals ${healAmount} HP.`);
      }
    }
    
    // Advance time
    this.pm.session.time.hours_rested += 8;
    
    console.log('  Spells refreshed. Ready to continue!\n');
    this.pm.saveSession();
    
    this.state.lastScene = 'Rest';
    this.saveState();
  }

  handleShow(cmd) {
    const target = cmd.replace(/.*(?:show|look at)/, '').trim();
    
    // Try to find as monster
    const MMSkill = require('./skills/mm-skill/mm-skill');
    const mm = new MMSkill();
    const monster = mm.getMonster(target);
    
    if (monster) {
      mm.printMonster(target, false, true); // Player view
      return;
    }
    
    // Try as scene
    this.ambiance.setScene(target);
    this.ambiance.showSceneForChat(target);
    
    this.state.lastScene = target;
    this.saveState();
  }

  handleMove(cmd) {
    const destination = cmd.replace(/.*(?:go|move|enter|to)/, '').trim();
    console.log(`\n  🚶 Party moves to ${destination}...\n`);
    
    this.ambiance.setScene(destination);
    this.ambiance.showSceneForChat(destination);
    
    this.pm.moveParty(destination);
    
    this.state.lastScene = destination;
    this.saveState();
  }

  handleRoll(cmd) {
    const match = cmd.match(/(\d+d\d+(?:\+\d+)?)/);
    if (match) {
      const result = this.dice.roll(match[1]);
      console.log(this.dice.printRoll(result));
    } else {
      console.log('  Roll what? (e.g., "roll 2d6+3")');
    }
  }

  showHelp() {
    console.log(`
  NATURAL LANGUAGE COMMANDS:
  
  "combat starts with goblins"
  "combat next"
  "combat ends"
  
  "we rest" or "party rests"
  
  "show goblin"
  "look at dark forest"
  
  "go to temple"
  "move room 5"
  
  "roll 2d6+3"
  "roll 1d20 for attack"
  
  "map" - show current map
  "status" - party status
  "quit" - save and exit
  
  Or use numbers from the menu.
`);
  }

  // Interactive mode
  async interactive() {
    this.start();
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n  > '
    });

    rl.prompt();

    rl.on('line', (line) => {
      const cmd = line.trim();
      
      if (cmd === 'q' || cmd === 'quit') {
        console.log('\n  Saving...\n');
        this.saveState();
        rl.close();
        return;
      }
      
      if (cmd === '1' || cmd === 'continue') {
        this.showContinueScreen();
      } else if (cmd === '2' || cmd === 'scene') {
        console.log('\n  Where to? (e.g., "ancient temple", "dark forest")');
      } else if (cmd === '3' || cmd === 'combat') {
        console.log('\n  Who do you fight? (e.g., "combat starts with 3 goblins")');
      } else if (cmd === '4' || cmd === 'rest') {
        this.handleRest();
      } else if (cmd === '5' || cmd === 'settings') {
        console.log('\n  Settings: Not implemented yet.');
      } else if (cmd === 'help') {
        this.showHelp();
      } else {
        this.processCommand(cmd);
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n  Goodbye, Dungeon Master.\n');
      process.exit(0);
    });
  }
}

// CLI
if (require.main === module) {
  const dnd = new SimpleDND();
  dnd.interactive();
}

module.exports = SimpleDND;
