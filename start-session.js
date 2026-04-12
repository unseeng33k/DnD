#!/usr/bin/env node

/**
 * UNIFIED D&D SESSION STARTER
 * 
 * One command. Everything ready. All systems online.
 * 
 * Usage:
 *   node start-session.js "Curse of Strahd" 1 123456789
 * 
 * Arguments:
 *   campaign    - Campaign name
 *   session     - Session number
 *   chatId      - Telegram chat ID (optional, for image delivery)
 */

import { GameMasterOrchestrator } from './game-master-orchestrator.js';
import readline from 'readline';

class SessionStarter {
  constructor(campaignName, sessionNum, telegramChatId = null) {
    this.gm = new GameMasterOrchestrator(campaignName);
    this.sessionNum = sessionNum;
    this.telegramChatId = telegramChatId;
    this.partyMembers = [];
  }

  async initialize() {
    // For testing/demo, use sample party
    const sampleParty = [
      {
        name: 'Malice Indarae De\'Barazzan',
        hp: 24,
        maxHP: 24,
        class: 'Rogue',
        level: 3,
        spellSlots: {},
        hitDice: { d8: 3 }
      },
      {
        name: 'Grond',
        hp: 28,
        maxHP: 28,
        class: 'Fighter',
        level: 3,
        spellSlots: {},
        hitDice: { d10: 3 }
      }
    ];

    await this.gm.startSession(this.sessionNum, sampleParty, this.telegramChatId);
    this.partyMembers = sampleParty;
    return sampleParty;
  }

  async interactive() {
    await this.initialize();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\nGM> '
    });

    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║  D&D UNIFIED SESSION - INTERACTIVE MODE           ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    console.log('Available commands:');
    console.log('  scene <name> [desc]         Load a scene');
    console.log('  combat <enemies>            Start combat');
    console.log('  combat next                 Next round');
    console.log('  attack <char> <target>      Attack roll');
    console.log('  damage <target> <amount>    Deal damage');
    console.log('  decision <text>             Record decision');
    console.log('  npc <name> <action>         Record NPC interaction');
    console.log('  spell <char> <spell>        Cast spell');
    console.log('  status                      Show status');
    console.log('  end                         End session');
    console.log('  help                        Show this menu\n');

    rl.prompt();

    rl.on('line', async (line) => {
      const parts = line.trim().split(/\s+/);
      const command = parts[0];
      const args = parts.slice(1);

      switch (command) {
        case 'scene':
          if (args.length === 0) {
            console.log('Usage: scene <name> [description]');
            break;
          }
          const sceneName = args[0];
          const sceneDesc = args.slice(1).join(' ');
          try {
            const result = await this.gm.loadScene(sceneName, sceneDesc);
            console.log(`✅ Scene loaded. Music: ${result.musicLink}`);
          } catch (e) {
            console.log(`Scene loading (skipping image generation for demo)`);
          }
          break;

        case 'combat':
          if (args.length === 0 || args[0] === 'next') {
            const round = this.gm.combat.nextRound();
            console.log(`Round ${round.round} - ${round.firstTurnOrder}'s turn`);
          } else {
            const enemies = args.join(' ').split(',').map(e => e.trim());
            const partyNames = this.gm.activeParty.map(p => p.name);
            const result = this.gm.combat.beginEncounter('Combat', enemies, partyNames);
            console.log(`⚔️  Combat started!`);
            console.log(`Turn order: ${result.turnOrder.join(' → ')}`);
          }
          break;

        case 'attack':
          if (args.length < 2) {
            console.log('Usage: attack <attacker> <target>');
            break;
          }
          const attacker = args[0];
          const target = args[1];
          const atkResult = this.gm.combat.rollAttack(attacker, target);
          console.log(`${attacker} attacks ${target}`);
          console.log(`Roll: ${atkResult.roll} + bonuses = ${atkResult.total} vs AC ${atkResult.ac}`);
          console.log(`Result: ${atkResult.hit ? '✅ HIT' : '❌ MISS'}`);
          break;

        case 'damage':
          if (args.length < 2) {
            console.log('Usage: damage <target> <amount>');
            break;
          }
          const dmgTarget = args[0];
          const amount = parseInt(args[1]);
          const dmgResult = this.gm.combat.damageTarget(dmgTarget, amount);
          if (dmgResult.error) {
            console.log(`❌ ${dmgResult.error}`);
          } else {
            console.log(`💢 ${dmgTarget} takes ${amount} damage (${dmgResult.hpRemaining} HP remaining)`);
          }
          break;

        case 'decision':
          if (args.length === 0) {
            console.log('Usage: decision <description>');
            break;
          }
          const decision = args.join(' ');
          const assessment = this.gm.assessAndRecord(decision, 'DM ruling');
          break;

        case 'npc':
          if (args.length < 2) {
            console.log('Usage: npc <name> <action>');
            break;
          }
          const npcName = args[0];
          const npcAction = args.slice(1).join(' ');
          const npcResult = this.gm.interactNPC(npcName, npcAction);
          break;

        case 'spell':
          if (args.length < 2) {
            console.log('Usage: spell <character> <spell>');
            break;
          }
          const spellChar = args[0];
          const spellName = args.slice(1).join(' ');
          const spellResult = this.gm.memory.logNarrativeEvent(`${spellChar} casts ${spellName}`, {
            character: spellChar,
            spell: spellName
          });
          console.log(`✨ ${spellChar} casts ${spellName}`);
          break;

        case 'status':
          const status = this.gm.getStatus();
          console.log(`\n📊 SESSION STATUS`);
          console.log(`Campaign: ${status.campaign}`);
          console.log(`Session: ${status.session}`);
          console.log(`Party: ${status.party.map(p => p.name).join(', ')}`);
          console.log(`Events logged: ${status.recentEvents.length}`);
          if (status.combatStatus.inCombat) {
            console.log(`Combat: Round ${status.combatStatus.round}`);
          }
          break;

        case 'end':
          await this.gm.endSession();
          rl.close();
          process.exit(0);
          break;

        case 'help':
          console.log('\nAvailable commands:');
          console.log('  scene <name> [desc]         Load a scene');
          console.log('  combat <enemies>            Start combat');
          console.log('  combat next                 Next round');
          console.log('  attack <char> <target>      Attack roll');
          console.log('  damage <target> <amount>    Deal damage');
          console.log('  decision <text>             Record decision');
          console.log('  npc <name> <action>         Record NPC interaction');
          console.log('  spell <char> <spell>        Cast spell');
          console.log('  status                      Show status');
          console.log('  end                         End session');
          break;

        case '':
          // Empty command
          break;

        default:
          console.log(`Unknown command: ${command}`);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nGoodbye!\n');
      process.exit(0);
    });
  }
}

// Main
const args = process.argv.slice(2);
const campaign = args[0] || 'Curse of Strahd';
const sessionNum = parseInt(args[1]) || 1;
const chatId = args[2] || null;

const starter = new SessionStarter(campaign, sessionNum, chatId);
starter.interactive();

export { SessionStarter };
