#!/usr/bin/env node

/**
 * Character Action Logger
 * Logs all player decisions, combat, discoveries, and session events
 */

const fs = require('fs');
const path = require('path');

class CharacterLogger {
  constructor(characterName) {
    this.characterName = characterName;
    this.logFile = path.join(__dirname, 'characters', `${characterName.toLowerCase().replace(/\s+/g, '_')}_log.md`);
    this.session = 1;
    this.entryNumber = 0;
    
    // Initialize log if doesn't exist
    if (!fs.existsSync(this.logFile)) {
      this.initializeLog();
    }
  }
  
  initializeLog() {
    const header = `# ${this.characterName} - Adventure Log

## Character Information
- **Name:** ${this.characterName}
- **Created:** ${new Date().toISOString()}

---

## Adventure Log

`;
    fs.writeFileSync(this.logFile, header);
  }
  
  logAction(action, details, result = '') {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - ${timestamp}
- **Action:** ${action}
- **Details:** ${details}${result ? `\n- **Result:** ${result}` : ''}
`;
    
    fs.appendFileSync(this.logFile, entry);
    return entryNumber;
  }
  
  logCombat(enemies, initiative, actions, damageDealt, damageTaken, result) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - COMBAT - ${timestamp}
- **Enemies:** ${enemies}
- **Initiative:** ${initiative}
- **Actions:** ${actions}
- **Damage Dealt:** ${damageDealt}
- **Damage Taken:** ${damageTaken}
- **Result:** ${result}
`;
    
    fs.appendFileSync(this.logFile, entry);
  }
  
  logDiscovery(what, where, significance) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - DISCOVERY - ${timestamp}
- **Found:** ${what}
- **Location:** ${where}
- **Significance:** ${significance}
`;
    
    fs.appendFileSync(this.logFile, entry);
  }
  
  logDecision(options, choice, reasoning) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - DECISION - ${timestamp}
- **Options:** ${options.join(', ')}
- **Choice:** ${choice}
- **Reasoning:** ${reasoning}
`;
    
    fs.appendFileSync(this.logFile, entry);
  }
  
  logSpell(spellName, target, effect) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - SPELL - ${timestamp}
- **Spell:** ${spellName}
- **Target:** ${target}
- **Effect:** ${effect}
`;
    
    fs.appendFileSync(this.logFile, entry);
  }
  
  logRest(location, duration, hpRecovered, notes) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - REST - ${timestamp}
- **Location:** ${location}
- **Duration:** ${duration}
- **HP Recovered:** ${hpRecovered}
- **Notes:** ${notes}
`;
    
    fs.appendFileSync(this.logFile, entry);
  }
  
  getSummary() {
    const content = fs.readFileSync(this.logFile, 'utf8');
    const entries = content.split('### Entry').length - 1;
    
    return {
      character: this.characterName,
      totalEntries: entries,
      logFile: this.logFile
    };
  }
}

// Example usage
if (require.main === module) {
  const logger = new CharacterLogger('Test Character');
  
  logger.logAction('Entered dungeon', 'Through main entrance', 'Found torchlit corridor');
  logger.logDecision(['Fight', 'Flee', 'Hide'], 'Fight', 'Party has advantage');
  logger.logCombat('3 Goblins', 'Player 15, Goblins 12', 'Attacked with sword', 8, 3, 'Victory');
  logger.logDiscovery('Secret door', 'Behind tapestry', 'Leads to treasure room');
  
  console.log('Log created:', logger.getSummary());
}

module.exports = CharacterLogger;
