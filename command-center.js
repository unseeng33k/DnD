#!/usr/bin/env node

/**
 * D&D COMMAND CENTER
 * 
 * Master CLI that orchestrates ALL systems:
 * - Character creation
 * - Inventory
 * - Spells
 * - Traps & Puzzles
 * - Module play
 * - AI DM
 * - Images
 * - Rules enforcement
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { CharacterCreator } from './character-creator.js';
import { InventorySystem } from './inventory-system.js';
import { SpellSystem } from './spell-system.js';
import { TrapMechanics, PuzzleEngine } from './trap-puzzle-system.js';
import { ADnDRuleEngine } from './adnd-rule-engine.js';
import { CliImageDisplay } from './cli-image-display.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

class DndCommandCenter {
  constructor() {
    this.character = null;
    this.inventory = null;
    this.spells = null;
    this.traps = null;
    this.puzzles = new PuzzleEngine();
    this.rules = new ADnDRuleEngine();
    this.images = new CliImageDisplay(process.env.OPENAI_API_KEY);
    this.currentModule = null;
  }

  /**
   * Main menu
   */
  async mainMenu() {
    console.clear();
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  🎭 D&D COMMAND CENTER 🎭               ║');
    console.log('║            Complete AD&D 1e Campaign System             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    let running = true;
    while (running) {
      console.log('\n📋 MAIN MENU:\n');
      console.log('  [1] Create Character');
      console.log('  [2] Manage Character (Inventory, Spells, etc)');
      console.log('  [3] Play Module (Interactive)');
      console.log('  [4] AI Dungeon Master (Claude Runs Game)');
      console.log('  [5] Rules Reference');
      console.log('  [6] Load Saved Character');
      console.log('  [7] View Scene');
      console.log('  [8] Exit\n');

      const choice = await question('Choose option (1-8): ');

      switch (choice) {
        case '1':
          await this.createCharacter();
          break;
        case '2':
          await this.manageCharacter();
          break;
        case '3':
          await this.playModule();
          break;
        case '4':
          await this.aiDungeonMaster();
          break;
        case '5':
          await this.rulesReference();
          break;
        case '6':
          await this.loadCharacter();
          break;
        case '7':
          await this.viewScene();
          break;
        case '8':
          running = false;
          console.log('\n👋 Thanks for playing!\n');
          break;
        default:
          console.log('Invalid option');
      }
    }

    rl.close();
  }

  /**
   * Create character
   */
  async createCharacter() {
    console.clear();
    const creator = new CharacterCreator();
    // Note: Original creator has synchronous create() that prompts user
    // We'll need to integrate this differently
    console.log('\n⚠️  Please run: node character-creator.js');
    console.log('\nThen load the saved character in this menu.');
    await question('\nPress Enter to continue...');
  }

  /**
   * Manage character
   */
  async manageCharacter() {
    if (!this.character) {
      console.log('\n❌ No character loaded. Create or load a character first.');
      await question('Press Enter...');
      return;
    }

    let managing = true;
    while (managing) {
      console.clear();
      console.log(`\n⚔️  CHARACTER: ${this.character.character.name}`);
      console.log('═════════════════════════════════════════\n');
      console.log('  [1] View Character Sheet');
      console.log('  [2] Inventory Management');
      console.log('  [3] Spells');
      console.log('  [4] Traps & Puzzles');
      console.log('  [5] Back\n');

      const choice = await question('Choose option (1-5): ');

      switch (choice) {
        case '1':
          this.displayCharacterSheet();
          await question('\nPress Enter...');
          break;
        case '2':
          await this.manageInventory();
          break;
        case '3':
          await this.manageSpells();
          break;
        case '4':
          await this.manageTraps();
          break;
        case '5':
          managing = false;
          break;
      }
    }
  }

  /**
   * Display character sheet
   */
  displayCharacterSheet() {
    const char = this.character;
    console.clear();
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║            CHARACTER SHEET                  ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    console.log(`Name: ${char.character.name.padEnd(25)} Race: ${char.character.race}`);
    console.log(`Class: ${char.character.class.padEnd(23)} Level: ${char.character.level}`);
    console.log(`HP: ${char.character.hitPoints.toString().padEnd(27)} XP: ${char.character.experience}`);
    console.log(`Alignment: ${char.character.alignment}\n`);

    console.log('ABILITY SCORES:');
    for (const [ability, score] of Object.entries(char.abilityScores)) {
      const mod = char.abilityModifiers[ability];
      console.log(`  ${ability}: ${score} (${mod >= 0 ? '+' : ''}${mod})`);
    }

    console.log(`\nTHAC0: ${char.thac0}`);
    
    const saves = char.savingThrows;
    console.log('\nSaving Throws:');
    console.log(`  Par: ${saves.paralysis}  Poi: ${saves.poison}  Death: ${saves.death}`);
    console.log(`  Rod: ${saves.rod}  Breath: ${saves.breath}  Spell: ${saves.spell}`);
  }

  /**
   * Manage inventory
   */
  async manageInventory() {
    console.clear();
    this.inventory.getSummary();

    let managing = true;
    while (managing) {
      console.log('\n  [1] Add Item');
      console.log('  [2] Remove Item');
      console.log('  [3] Add Gold');
      console.log('  [4] Remove Gold');
      console.log('  [5] Back\n');

      const choice = await question('Choose option (1-5): ');

      switch (choice) {
        case '1':
          const itemName = await question('Item name: ');
          const qty = parseInt(await question('Quantity: '));
          this.inventory.addItem(itemName, qty);
          break;
        case '2':
          const removeItem = await question('Item to remove: ');
          this.inventory.removeItem(removeItem);
          break;
        case '3':
          const addGold = parseInt(await question('Gold to add: '));
          this.inventory.addGold(addGold);
          break;
        case '4':
          const removeGold = parseInt(await question('Gold to remove: '));
          this.inventory.removeGold(removeGold);
          break;
        case '5':
          managing = false;
          break;
      }

      console.clear();
      this.inventory.getSummary();
    }
  }

  /**
   * Manage spells
   */
  async manageSpells() {
    console.clear();
    console.log('\n🔮 SPELL SYSTEM\n');

    if (!this.spells) {
      console.log('This character cannot cast spells.');
      await question('Press Enter...');
      return;
    }

    let managing = true;
    while (managing) {
      console.log('  [1] Learn Spell');
      console.log('  [2] Memorize Spell');
      console.log('  [3] Cast Spell');
      console.log('  [4] List Spells');
      console.log('  [5] Back\n');

      const choice = await question('Choose option (1-5): ');

      switch (choice) {
        case '1':
          const learnName = await question('Spell to learn: ');
          const result = this.spells.learnSpell(learnName);
          console.log(`\n${result.message}`);
          break;
        case '2':
          const memName = await question('Spell to memorize: ');
          const memResult = this.spells.memorizeSpell(memName);
          console.log(`\n${memResult.message}`);
          break;
        case '3':
          const castName = await question('Spell to cast: ');
          const castResult = this.spells.castSpell(castName);
          console.log(`\n${castResult.message}`);
          if (castResult.effect) {
            console.log(`Effect: ${castResult.effect}`);
          }
          break;
        case '4':
          this.spells.listMemorizedSpells();
          break;
        case '5':
          managing = false;
          break;
      }

      if (choice !== '5') await question('\nPress Enter...');
      console.clear();
    }
  }

  /**
   * Manage traps
   */
  async manageTraps() {
    console.clear();
    console.log('\n⚠️  TRAP MECHANICS\n');

    let managing = true;
    while (managing) {
      console.log('  [1] Detect Trap');
      console.log('  [2] Disable Trap');
      console.log('  [3] Solve Puzzle');
      console.log('  [4] Get Puzzle Hint');
      console.log('  [5] Back\n');

      const choice = await question('Choose option (1-5): ');

      switch (choice) {
        case '1':
          const trapName = await question('Trap name: ');
          const detectResult = this.traps.detectTrap(trapName);
          console.log(`\n${detectResult.message}`);
          break;
        case '2':
          const disableName = await question('Trap name: ');
          const disableResult = this.traps.disableTrap(disableName);
          console.log(`\n${disableResult.message}`);
          break;
        case '3':
          const puzzleName = await question('Puzzle name: ');
          const puzzle = this.puzzles.getPuzzle(puzzleName);
          if (puzzle.success) {
            console.log(`\n${puzzle.question}`);
            const answer = await question('\nYour answer: ');
            const checkResult = this.puzzles.checkSolution(puzzleName, answer);
            console.log(`\n${checkResult.message}`);
          }
          break;
        case '4':
          const hintPuzzle = await question('Puzzle name: ');
          const hintLevel = parseInt(await question('Hint level (1-3): '));
          const hintResult = this.puzzles.giveHint(hintPuzzle, hintLevel);
          if (hintResult.success) {
            console.log(`\n💡 HINT ${hintResult.hintNumber}/${hintResult.totalHints}:`);
            console.log(hintResult.hint);
          }
          break;
        case '5':
          managing = false;
          break;
      }

      if (choice !== '5') await question('\nPress Enter...');
      console.clear();
    }
  }

  /**
   * Play module
   */
  async playModule() {
    console.log('\n▶️  Module play coming soon!');
    console.log('Run: node play-module.js "module-name"');
    await question('\nPress Enter...');
  }

  /**
   * AI Dungeon Master
   */
  async aiDungeonMaster() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('\n❌ ANTHROPIC_API_KEY environment variable not set');
      await question('Press Enter...');
      return;
    }

    console.log('\n🤖 Starting AI Dungeon Master...');
    console.log('Run: ANTHROPIC_API_KEY=your_key node ai-dungeon-master.js');
    await question('\nPress Enter...');
  }

  /**
   * Rules reference
   */
  async rulesReference() {
    console.clear();
    console.log('\n📖 AD&D 1E RULES REFERENCE\n');

    let viewing = true;
    while (viewing) {
      console.log('  [1] Attack Roll');
      console.log('  [2] Saving Throw');
      console.log('  [3] Damage Roll');
      console.log('  [4] Skill Check');
      console.log('  [5] Experience');
      console.log('  [6] Morale Check');
      console.log('  [7] Back\n');

      const choice = await question('Choose option (1-7): ');

      switch (choice) {
        case '1':
          const atkBonus = parseInt(await question('Attack bonus: '));
          const ac = parseInt(await question('Target AC: '));
          const atkResult = this.rules.attackRoll(atkBonus, ac);
          console.log(`\n${atkResult.message}`);
          break;
        case '2':
          console.log('\n💀 Saving throw (see character sheet)');
          break;
        case '3':
          const dmgFormula = await question('Damage formula (e.g., 1d8+2): ');
          const dmgResult = this.rules.damageRoll(dmgFormula);
          console.log(`\n${dmgResult.message}`);
          break;
        case '7':
          viewing = false;
          break;
      }

      if (choice !== '7') await question('\nPress Enter...');
      console.clear();
      console.log('\n📖 AD&D 1E RULES REFERENCE\n');
    }
  }

  /**
   * Load character
   */
  async loadCharacter() {
    console.clear();
    const charFiles = fs.readdirSync('.').filter(f => f.endsWith('.json') && !f.includes('state'));
    
    if (charFiles.length === 0) {
      console.log('\n❌ No saved characters found.');
      await question('Press Enter...');
      return;
    }

    console.log('\n📋 Saved Characters:\n');
    charFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f.replace('.json', '')}`));

    const choice = parseInt(await question('\nLoad character (number): ')) - 1;
    if (choice >= 0 && choice < charFiles.length) {
      const charData = JSON.parse(fs.readFileSync(charFiles[choice], 'utf-8'));
      this.character = charData;
      this.inventory = new InventorySystem(charData.character);
      
      if (['mage', 'cleric'].includes(charData.character.class)) {
        this.spells = new SpellSystem(charData.character);
      }

      this.traps = new TrapMechanics(charData.character);

      console.log(`\n✅ Loaded ${charData.character.name}!`);
    }

    await question('Press Enter...');
  }

  /**
   * View scene
   */
  async viewScene() {
    const sceneName = await question('\nScene name (e.g., castle, tavern, forest): ');
    const description = await question('Scene description: ');
    
    console.log('\n🖼️  Generating scene image...\n');
    await this.images.displayScene(sceneName, description);

    await question('Press Enter...');
  }
}

// Run
const center = new DndCommandCenter();
center.mainMenu().catch(console.error);
