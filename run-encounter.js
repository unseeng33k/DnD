#!/usr/bin/env node

/**
 * RUN ENCOUNTER - CLI Tool
 * 
 * Run D&D encounters with automatic rulebook and character sheet consultation.
 * This tool ensures every encounter is validated against the rules before combat begins.
 * 
 * Usage:
 *   ./run-encounter.js --party malice,blackdow,dogman --enemies goblin:3,orc:1
 *   ./run-encounter.js --encounter encounter.json
 *   ./run-encounter.js --interactive
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnhancedGameMaster } from './src/systems/integrated-game-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           D&D ENCOUNTER RUNNER v1.0                      ║
║    With Automatic Rulebook & Character Consultation      ║
╚══════════════════════════════════════════════════════════╝

USAGE:
  node run-encounter.js [options]

OPTIONS:
  --party <names>        Comma-separated party member names
  --enemies <list>       Enemy list (e.g., goblin:3,orc:1)
  --encounter <file>     Load encounter from JSON file
  --name <name>          Encounter name
  --interactive          Run in interactive mode
  --lookup <book:topic>  Quick rule lookup (phb/dmg/mm)
  --validate             Validate party character sheets
  --help                 Show this help

EXAMPLES:
  # Run a simple encounter
  node run-encounter.js --party malice,blackdow --enemies goblin:2

  # Load encounter from file
  node run-encounter.js --encounter ./encounters/ambush.json

  # Interactive mode
  node run-encounter.js --interactive

  # Quick rule lookup
  node run-encounter.js --lookup phb:THAC0
  node run-encounter.js --lookup mm:goblin

  # Validate all character sheets
  node run-encounter.js --party malice,blackdow,dogman,threetrees,grond --validate
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    party: ['malice', 'blackdow', 'dogman', 'threetrees', 'grond'],
    enemies: [],
    encounter: null,
    name: 'Unnamed Encounter',
    interactive: false,
    lookup: null,
    validate: false,
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
      case '--encounter':
        options.encounter = args[++i];
        break;
      case '--name':
        options.name = args[++i];
        break;
      case '--interactive':
        options.interactive = true;
        break;
      case '--lookup':
        options.lookup = args[++i];
        break;
      case '--validate':
        options.validate = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

async function runEncounter(options) {
  const gm = new EnhancedGameMaster({
    charactersDir: path.join(__dirname, 'characters'),
    skillsDir: path.join(__dirname, 'skills')
  });

  // Initialize party
  await gm.initialize(options.party);

  // Prepare encounter data
  let encounterData = {
    name: options.name,
    type: 'combat',
    enemies: options.enemies.map(e => ({
      name: e,
      hp: 7,
      ac: 6,
      thac0: 20
    }))
  };

  // Load from file if specified
  if (options.encounter && fs.existsSync(options.encounter)) {
    const fileData = JSON.parse(fs.readFileSync(options.encounter, 'utf8'));
    encounterData = { ...encounterData, ...fileData };
  }

  // Start encounter
  console.log('\n🎲 STARTING ENCOUNTER...\n');
  const encounter = await gm.startEncounter(encounterData);

  return { gm, encounter };
}

async function runInteractive(gm) {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const combat = gm.getCombat();

  console.log('\n🎮 INTERACTIVE MODE');
  console.log('Commands: attack <attacker> <target>, damage <target> <amount>,');
  console.log('          spell <caster> <spell> <level>, save <char> <type>,');
  console.log('          status, next, end, help\n');

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

          case 'status':
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
            console.log(`
Commands:
  attack <attacker> <target>     Make an attack roll
  damage <target> <amount>       Apply damage to target
  spell <caster> <name> <level>  Cast a spell
  save <char> <type>             Make a saving throw
  status                         Show combat status
  next                           Start next round
  end                            End combat
  help                           Show this help
`);
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

async function validateParty(gm, partyNames) {
  console.log('\n📋 VALIDATING PARTY CHARACTER SHEETS\n');

  const issues = [];

  for (const name of partyNames) {
    try {
      const char = gm.getCharacter(name);
      console.log(`✓ ${name}: Loaded successfully`);

      // Check for required fields
      if (!char.abilityScores || Object.keys(char.abilityScores).length === 0) {
        issues.push(`${name}: Missing ability scores`);
      }
      if (!char.hp || char.hp.max === 0) {
        issues.push(`${name}: Missing HP data`);
      }
      if (!char.ac || char.ac.total === undefined) {
        issues.push(`${name}: Missing AC data`);
      }
      if (!char.thac0) {
        issues.push(`${name}: Missing THAC0`);
      }
    } catch (e) {
      issues.push(`${name}: ${e.message}`);
    }
  }

  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach(i => console.log(`  • ${i}`));
  } else {
    console.log('\n✅ All character sheets valid');
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    return;
  }

  // Handle rule lookup
  if (options.lookup) {
    const [book, topic] = options.lookup.split(':');
    if (!book || !topic) {
      console.log('Usage: --lookup <book:topic> (e.g., phb:THAC0)');
      process.exit(1);
    }

    const gm = new EnhancedGameMaster();
    const result = await gm.lookupRule(book, topic);
    console.log(result || 'No results found');
    return;
  }

  // Handle validation
  if (options.validate) {
    const gm = new EnhancedGameMaster();
    await validateParty(gm, options.party);
    return;
  }

  // Run encounter
  try {
    const { gm, encounter } = await runEncounter(options);

    if (options.interactive) {
      await runInteractive(gm);
    } else {
      console.log('\n✅ Encounter initialized successfully');
      console.log('Use --interactive flag for interactive combat mode');
    }
  } catch (e) {
    console.error(`\n❌ Error: ${e.message}`);
    process.exit(1);
  }
}

main();
