#!/usr/bin/env node

/**
 * DM Reference Guide - Interactive CLI for live gameplay lookup
 * 
 * During gameplay, the DM needs instant access to:
 * - Character abilities & spells
 * - Rule lookups (DMG, PHB)
 * - NPC quick references
 * - Decision history (for consistency)
 * - Session timeline (what happened)
 * 
 * This is a real-time query system the DM uses at the table.
 * 
 * Usage:
 *   node dm-reference-guide.js
 *   
 * Commands:
 *   rule <name>            - Look up a rule
 *   char <name> <ability>  - Check character ability
 *   npc <name>             - Quick NPC reference
 *   decision <keyword>     - Check decision history
 *   events <type>          - See recent events
 *   recap                  - Quick session recap
 */

import { DMMemory } from './dm-memory-system.js';
import readline from 'readline';

class DMReferenceGuide {
  constructor(campaignName = 'Curse of Strahd', sessionNumber = 1) {
    this.memory = new DMMemory(campaignName, sessionNumber);
    this.campaign = campaignName;
    this.session = sessionNumber;
    this.running = true;
  }

  /**
   * Rule lookup with formatting
   */
  showRule(ruleName) {
    const rule = this.memory.lookupRule(ruleName);

    if (rule.error) {
      console.log(`\n❌ ${rule.error}`);
      console.log(`\nAvailable rules: ${this.memory.listAvailableRules().join(', ')}`);
      return;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📖 ${ruleName.toUpperCase()}`);
    console.log('═'.repeat(60));
    console.log(`\n${rule.description}`);

    if (rule.sources) {
      console.log(`\nSources: ${rule.sources.join(', ')}`);
    }

    if (rule.options) {
      console.log(`\nOptions:`);
      rule.options.forEach(o => console.log(`  • ${o}`));
    }

    if (rule.requirements) {
      console.log(`\nRequirements:`);
      rule.requirements.forEach(r => console.log(`  • ${r}`));
    }

    if (rule.stacks === false) {
      console.log(`\n⚠️  Does NOT stack with other bonuses`);
    }

    if (rule.note) {
      console.log(`\n📌 Note: ${rule.note}`);
    }

    console.log(`\n${'═'.repeat(60)}\n`);
  }

  /**
   * Character ability lookup
   */
  showCharacterAbility(charName, abilityName) {
    const ability = this.memory.getCharacterAbility(charName, abilityName);

    if (ability.error) {
      console.log(`\n❌ ${ability.error}`);
      console.log(`\nAvailable characters: ${this.memory.characters.listCharacters().join(', ')}`);
      return;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${ability.character.toUpperCase()} - ${ability.name.toUpperCase()}`);
    console.log('═'.repeat(60));

    Object.entries(ability).forEach(([key, value]) => {
      if (key !== 'name' && key !== 'character') {
        console.log(`${this.formatKey(key)}: ${this.formatValue(value)}`);
      }
    });

    console.log(`\n${'═'.repeat(60)}\n`);
  }

  /**
   * NPC quick reference
   */
  showNPCQuickRef(npcName) {
    const ref = this.memory.getNPCQuickRef(npcName);

    if (!ref) {
      console.log(`\n❌ NPC "${npcName}" not found`);
      console.log(`\nKnown NPCs: ${this.memory.npcs.listNPCs().join(', ')}`);
      return;
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎭 ${ref.name.toUpperCase()}`);
    console.log('─'.repeat(60));
    console.log(`Role: ${ref.role}`);
    console.log(`Disposition: ${ref.disposition}`);
    console.log(`Last seen: ${ref.lastSeen}`);

    if (ref.recentInteractions.length > 0) {
      console.log(`\nRecent interactions:`);
      ref.recentInteractions.forEach(i => {
        console.log(`  • ${i.description}`);
      });
    }

    console.log(`\n${'─'.repeat(60)}\n`);
  }

  /**
   * Decision history lookup
   */
  showDecisionHistory(keyword = null) {
    const trail = this.memory.auditTrail();

    if (trail.length === 0) {
      console.log('\nNo decisions logged yet.\n');
      return;
    }

    let filtered = trail;
    if (keyword) {
      filtered = trail.filter(d => 
        d.decision.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📋 DECISION HISTORY${keyword ? ` (${keyword})` : ''}`);
    console.log('═'.repeat(60));

    filtered.forEach(d => {
      console.log(`\n[${d.timestamp}]`);
      console.log(`Decision: ${d.decision}`);
      console.log(`Reasoning: ${d.reasoning}`);
      
      if (d.ruleReference) {
        console.log(`Rule: ${d.ruleReference}`);
      }
      
      if (d.precedent) {
        console.log(`⚠️  Similar ruling: "${d.precedent.decision}" (${d.precedent.timestamp})`);
      }
      
      console.log('---');
    });

    console.log(`\n${'═'.repeat(60)}\n`);
  }

  /**
   * Session event timeline
   */
  showEventTimeline(category = null) {
    const events = category 
      ? this.memory.timeline.getEventsByCategory(category)
      : this.memory.timeline.getRecentEvents(10);

    if (events.length === 0) {
      console.log('\nNo events logged yet.\n');
      return;
    }

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📅 SESSION TIMELINE${category ? ` (${category})` : ''}`);
    console.log('═'.repeat(60));

    events.forEach(e => {
      console.log(`\nRound ${e.round} | ${e.category.toUpperCase()}`);
      console.log(`${e.description}`);
      
      if (Object.keys(e.details).length > 0) {
        console.log(`Details: ${JSON.stringify(e.details, null, 2)}`);
      }
    });

    console.log(`\n${'═'.repeat(60)}\n`);
  }

  /**
   * Quick session recap
   */
  showSessionRecap() {
    const summary = this.memory.getSessionSummary();

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SESSION ${summary.session} RECAP - ${summary.campaign}`);
    console.log('═'.repeat(60));

    console.log(`\nStarted: ${new Date(summary.startedAt).toLocaleString()}`);
    console.log(`Duration: ${Math.floor(summary.duration / 1000 / 60)} minutes`);
    console.log(`Location: ${summary.location || 'Unknown'}`);
    console.log(`Active Encounter: ${summary.activeEncounter || 'None'}`);

    console.log(`\nStats:`);
    console.log(`  • Events logged: ${summary.eventCount}`);
    console.log(`  • Decisions recorded: ${summary.decisionsLogged}`);
    console.log(`  • Party size: ${Object.keys(summary.partyStatus).length}`);

    if (Object.keys(summary.partyStatus).length > 0) {
      console.log(`\nParty Status:`);
      Object.entries(summary.partyStatus).forEach(([name, status]) => {
        console.log(`  • ${name}: ${status}`);
      });
    }

    if (summary.recentEvents.length > 0) {
      console.log(`\nRecent Events:`);
      summary.recentEvents.forEach(e => {
        console.log(`  • ${e.description}`);
      });
    }

    console.log(`\n${'═'.repeat(60)}\n`);
  }

  /**
   * Helper formatting
   */
  formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  formatValue(value) {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  /**
   * Help menu
   */
  showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════╗
║           DM REFERENCE GUIDE - COMMANDS                ║
╚════════════════════════════════════════════════════════╝

📖 RULES & MECHANICS
  rule <name>              Look up a rule (e.g., "rule sneak attack")
  rules                    List all available rules

👤 CHARACTERS
  char <name> <ability>    Check character ability
  chars                    List all characters

🎭 NPCs
  npc <name>               Quick NPC reference
  npcs                     List all known NPCs

🗂️  DECISIONS & HISTORY
  decision <keyword>       Find similar rulings
  decisions                Show all decisions
  events <type>            Show events by category (combat, roleplay, discovery)
  recap                    Quick session summary

🎮 GAMEPLAY LOGGING
  log combat               Start combat round
  log npc <name> <action>  Record NPC interaction
  log event <description>  Record major event

⚙️  SYSTEM
  help                     Show this menu
  status                   Quick session status
  exit/quit                Exit guide

════════════════════════════════════════════════════════

TIP: Use "rule inspiration" to lookup rules, "char Malice sneak attack"
     for abilities, or "npc Strahd" for NPC info during gameplay.
    `);
  }

  /**
   * Interactive CLI
   */
  async start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const prompt = () => {
      rl.question('DM> ', (input) => {
        if (!input.trim()) {
          prompt();
          return;
        }

        this.processCommand(input.trim());
        prompt();
      });
    };

    console.log(`\n🎲 DM Reference Guide - ${this.campaign} Session ${this.session}`);
    console.log(`Type "help" for commands\n`);

    prompt();
  }

  /**
   * Command processor
   */
  processCommand(input) {
    const [command, ...args] = input.toLowerCase().split(/\s+/);
    const fullInput = input;

    switch (command) {
      case 'rule':
        if (args.length === 0) {
          console.log(`\nAvailable rules:\n${this.memory.listAvailableRules().map(r => `  • ${r}`).join('\n')}\n`);
        } else {
          this.showRule(args.join(' '));
        }
        break;

      case 'rules':
        console.log(`\nAvailable rules:\n${this.memory.listAvailableRules().map(r => `  • ${r}`).join('\n')}\n`);
        break;

      case 'char':
        if (args.length < 2) {
          console.log('\nUsage: char <character name> <ability name>\n');
        } else {
          const charName = args[0];
          const abilityName = args.slice(1).join(' ');
          this.showCharacterAbility(charName, abilityName);
        }
        break;

      case 'chars':
        console.log(`\nCharacters:\n${this.memory.characters.listCharacters().map(c => `  • ${c}`).join('\n')}\n`);
        break;

      case 'npc':
        if (args.length === 0) {
          console.log('\nUsage: npc <name>\n');
        } else {
          this.showNPCQuickRef(args.join(' '));
        }
        break;

      case 'npcs':
        console.log(`\nNPCs:\n${this.memory.npcs.listNPCs().map(n => `  • ${n}`).join('\n')}\n`);
        break;

      case 'decision':
        this.showDecisionHistory(args.join(' ') || null);
        break;

      case 'decisions':
        this.showDecisionHistory();
        break;

      case 'events':
        this.showEventTimeline(args[0] || null);
        break;

      case 'recap':
        this.showSessionRecap();
        break;

      case 'status':
        this.showSessionRecap();
        break;

      case 'log':
        if (args[0] === 'combat') {
          console.log('\n✅ Combat round logged (use game engine for full logging)\n');
        } else {
          console.log('\nLogging from CLI not yet implemented - use game engine\n');
        }
        break;

      case 'help':
        this.showHelp();
        break;

      case 'exit':
      case 'quit':
        console.log('\n👋 Goodbye!\n');
        process.exit(0);
        break;

      default:
        console.log(`\n❌ Unknown command: ${command}\nType "help" for available commands\n`);
    }
  }
}

// Start the guide
const guide = new DMReferenceGuide('Curse of Strahd', 1);
guide.start();

export { DMReferenceGuide };
