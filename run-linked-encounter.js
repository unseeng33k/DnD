#!/usr/bin/env node

/**
 * RUN LINKED ENCOUNTER - CLI Tool
 * 
 * Run D&D encounters with deep character-rule linkage.
 * Every roll, save, and spell factors in abilities, items, conditions, and racial traits.
 * 
 * Usage:
 *   ./run-linked-encounter.js --party malice,blackdow --enemies goblin:3
 *   ./run-linked-encounter.js --interactive
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LinkedGameMaster } from './src/systems/linked-game-master.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║      LINKED D&D ENCOUNTER RUNNER v2.0                    ║
║  Deep Character-Rule Integration for Combat & RP         ║
╚══════════════════════════════════════════════════════════╝

USAGE:
  node run-linked-encounter.js [options]

OPTIONS:
  --party <names>        Comma-separated party member names
  --enemies <list>       Enemy list (e.g., goblin:3,orc:1)
  --name <name>          Encounter name
  --interactive          Run in interactive mode
  --roleplay             Test roleplay action linkage
  --help                 Show this help

EXAMPLES:
  # Run encounter with full linkage
  node run-linked-encounter.js --party malice,blackdow --enemies goblin:3

  # Interactive combat
  node run-linked-encounter.js --party malice,blackdow --enemies orc:2 --interactive

  # Test roleplay linkage
  node run-linked-encounter.js --party malice --roleplay "sneak past guards"
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    party: ['malice', 'blackdow', 'dogman', 'threetrees', 'grond'],
    enemies: [],
    name: 'Linked Encounter',
    interactive: false,
    roleplay: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--party':
        options.party = args[++i].split(',').map(s => s.trim());
        break;
      case '--enemies':
        const enemyList = args[++i].split(',');
        for (const enemy of enemyList) {
          const [name, count] = enemy.split(':');
          const num = parseInt(count) || 1;
          for (let j = 0; j < num; j++) {
            options.enemies.push(name);
          }
        }
        break;
      case '--name':
        options.name = args[++i];
        break;
      case '--interactive':
        options.interactive = true;
        break;
      case '--roleplay':
        options.roleplay = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

async function runLinkedEncounter(options) {
  const gm = new LinkedGameMaster({
    charactersDir: path.join(__dirname, 'characters'),
    skillsDir: path.join(__dirname, 'skills')
  });

  // Initialize party
  await gm.initialize(options.party);

  // Handle roleplay test
  if (options.roleplay) {
    console.log('\n🎭 TESTING ROLEPLAY LINKAGE\n');
    for (const name of options.party) {
      gm.processRoleplayAction(name, options.roleplay, { lighting: 'dark' });
      console.log();
    }
    return;
  }

  // Start encounter
  console.log('\n🎲 STARTING LINKED ENCOUNTER...\n');
  
  const encounter = await gm.startEncounter({
    name: options.name,
    enemies: options.enemies.map(e => ({
      name: e,
      hp: 7,
      ac: 6,
      thac0: 20
    }))
  });

  return { gm, encounter };
}

async function runInteractive(gm) {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const combat = gm.getCombat();

  console.log('\n🎮 INTERACTIVE LINKED COMBAT MODE');
  console.log('='.repeat(60));
  console.log('Commands:');
  console.log('  attack <attacker> <target>  - Attack with all modifiers');
  console.log('  damage <target> <amount>    - Apply damage');
  console.log('  spell <caster> <name> <lvl> - Cast spell (validated)');
  console.log('  save <char> <type>          - Saving throw with mods');
  console.log('  condition <target> <cond>   - Apply condition');
  console.log('  remove <target> <cond>      - Remove condition');
  console.log('  status                      - Show combat status');
  console.log('  next                        - Next round');
  console.log('  end                         - End combat');
  console.log('='.repeat(60) + '\n');

  function prompt() {
    rl.question('> ', async (input) => {
      const parts = input.trim().split(' ');
      const command = parts[0].toLowerCase();

      try {
        switch (command) {
          case 'attack':
            if (parts.length < 3) {
              console.log('Usage: attack <attacker> <target>');
            } else {
              combat.executeAttack(parts[1], parts[2]);
            }
            break;

          case 'damage':
            if (parts.length < 3) {
              console.log('Usage: damage <target> <amount>');
            } else {
              combat.applyDamage(parts[1], parseInt(parts[2]));
            }
            break;

          case 'spell':
            if (parts.length < 4) {
              console.log('Usage: spell <caster> <spell-name> <level>');
            } else {
              combat.castSpell(parts[1], parts[2], parseInt(parts[3]));
            }
            break;

          case 'save':
            if (parts.length < 3) {
              console.log('Usage: save <character> <save-type>');
            } else {
              combat.makeSave(parts[1], parts[2]);
            }
            break;

          case 'condition':
            if (parts.length < 3) {
              console.log('Usage: condition <target> <condition>');
            } else {
              combat.applyCondition(parts[1], parts[2]);
            }
            break;

          case 'remove':
            if (parts.length < 3) {
              console.log('Usage: remove <target> <condition>');
            } else {
              combat.removeCondition(parts[1], parts[2]);
            }
            break;

          case 'status':
            console.log('\n📊 COMBAT STATUS:');
            console.log(JSON.stringify(combat.getCombatStatus(), null, 2));
            break;

          case 'next':
            combat.nextRound();
            break;

          case 'end':
            combat.endCombat('manual');
            rl.close();
            return;

          case 'help':
            console.log('\nCommands:');
            console.log('  attack <attacker> <target>');
            console.log('  damage <target> <amount>');
            console.log('  spell <caster> <name> <level>');
            console.log('  save <char> <type>');
            console.log('  condition <target> <cond>');
            console.log('  remove <target> <cond>');
            console.log('  status, next, end, help');
            break;

          default:
            console.log('Unknown command. Type "help" for available commands.');
        }
      } catch (e) {
        console.error(`Error: ${e.message}`);
      }

      prompt();
    });
  }

  prompt();
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    return;
  }

  try {
    const result = await runLinkedEncounter(options);

    if (options.interactive && result?.gm) {
      await runInteractive(result.gm);
    } else if (!options.roleplay) {
      console.log('\n✅ Linked encounter initialized');
      console.log('Use --interactive flag for combat mode');
    }
  } catch (e) {
    console.error(`\n❌ Error: ${e.message}`);
    console.error(e.stack);
    process.exit(1);
  }
}

main();
