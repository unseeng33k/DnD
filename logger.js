#!/usr/bin/env node

/**
 * Character Action Logger
 * Logs all player decisions, combat, discoveries, and session events
 * INTEGRATED with PartyManager for auto-tracking
 */

const fs = require('fs');
const path = require('path');
const PartyManager = require('./party_manager');

class CharacterLogger {
  constructor(characterName, characterId = null) {
    this.characterName = characterName;
    this.characterId = characterId || characterName.toLowerCase().replace(/\s+/g, '_');
    this.logFile = path.join(__dirname, 'characters', `${characterName.toLowerCase().replace(/\s+/g, '_')}_log.md`);
    this.session = 1;
    this.entryNumber = 0;
    
    // Initialize PartyManager for auto-tracking
    this.pm = new PartyManager();
    
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
    
    // Auto-track in PartyManager
    this.pm.logEvent('ACTION', {
      character_id: this.characterId,
      character_name: this.characterName,
      action,
      details,
      result
    });
    
    return this.entryNumber;
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
    
    // Auto-track combat in PartyManager
    if (result.toLowerCase().includes('victory') || result.toLowerCase().includes('win')) {
      // Extract XP if mentioned
      const xpMatch = result.match(/(\d+)\s*xp/i);
      const xpEarned = xpMatch ? parseInt(xpMatch[1]) : 0;
      this.pm.endCombat(xpEarned);
    }
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
    
    // Auto-track discovery
    this.pm.logEvent('DISCOVERY', {
      character_id: this.characterId,
      character_name: this.characterName,
      found: what,
      location: where,
      significance
    });
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
  
  logSpell(spellName, target, effect, spellClass = 'mage', level = 1) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - SPELL - ${timestamp}
- **Spell:** ${spellName}
- **Target:** ${target}
- **Effect:** ${effect}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track spell cast in PartyManager
    try {
      this.pm.castSpell(this.characterId, spellName, level, spellClass);
    } catch (e) {
      // Spell slot validation failed - log anyway but note it
      console.warn(`Warning: ${e.message}`);
    }
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
    
    // Auto-track rest in PartyManager
    const hours = parseInt(duration) || 8;
    this.pm.rest(hours);
  }

  // ============ PARTY MANAGER INTEGRATED METHODS ============

  /**
   * Log damage taken - auto-updates HP in PartyManager
   */
  logDamage(amount, source, damageType = '') {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - DAMAGE - ${timestamp}
- **Damage:** ${amount}
- **Source:** ${source}${damageType ? `\n- **Type:** ${damageType}` : ''}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track HP change
    const result = this.pm.updateHP(this.characterId, amount, false);
    return result;
  }

  /**
   * Log healing received - auto-updates HP in PartyManager
   */
  logHealing(amount, source) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - HEALING - ${timestamp}
- **Healing:** ${amount}
- **Source:** ${source}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track HP change
    const result = this.pm.updateHP(this.characterId, amount, true);
    return result;
  }

  /**
   * Log innate ability use - auto-tracked in PartyManager
   */
  logInnateAbility(abilityName, description = '') {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - INNATE ABILITY - ${timestamp}
- **Ability:** ${abilityName}${description ? `\n- **Description:** ${description}` : ''}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track innate ability use
    this.pm.useInnate(this.characterId, abilityName, description);
  }

  /**
   * Log item acquisition - auto-tracked in PartyManager
   */
  logItemAcquired(itemName, quantity = 1, itemData = null) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - ITEM ACQUIRED - ${timestamp}
- **Item:** ${itemName}
- **Quantity:** ${quantity}${itemData ? `\n- **Details:** ${JSON.stringify(itemData)}` : ''}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track item acquisition
    this.pm.acquireItem(this.characterId, itemData || { name: itemName }, quantity);
  }

  /**
   * Log item equipped - auto-tracked in PartyManager
   */
  logItemEquipped(itemName, slot) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - ITEM EQUIPPED - ${timestamp}
- **Item:** ${itemName}
- **Slot:** ${slot}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track equipment change
    this.pm.equipItem(this.characterId, itemName, slot);
  }

  /**
   * Log condition gained - auto-tracked in PartyManager
   */
  logCondition(condition, duration = null) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - CONDITION - ${timestamp}
- **Condition:** ${condition}${duration ? `\n- **Duration:** ${duration}` : ''}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track condition
    this.pm.addCondition(this.characterId, condition, duration);
  }

  /**
   * Log condition removed - auto-tracked in PartyManager
   */
  logConditionRemoved(condition) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - CONDITION REMOVED - ${timestamp}
- **Condition:** ${condition}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track condition removal
    this.pm.removeCondition(this.characterId, condition);
  }

  /**
   * Start combat - auto-tracked in PartyManager
   */
  startCombat(enemies) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const enemyList = Array.isArray(enemies) ? enemies.map(e => e.name || e).join(', ') : enemies;
    const entry = `
### Entry ${this.entryNumber} - COMBAT STARTED - ${timestamp}
- **Enemies:** ${enemyList}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track combat start
    const enemyArray = Array.isArray(enemies) ? enemies : [{ name: enemies, hp_max: 10 }];
    this.pm.startCombat(enemyArray);
  }

  /**
   * End combat - auto-tracked in PartyManager
   */
  endCombat(xpEarned = 0) {
    this.entryNumber++;
    const timestamp = new Date().toISOString();
    const entry = `
### Entry ${this.entryNumber} - COMBAT ENDED - ${timestamp}
- **XP Earned:** ${xpEarned}
`;
    
    fs.appendFileSync(this.logFile, entry);
    
    // Auto-track combat end
    this.pm.endCombat(xpEarned);
  }

  /**
   * Get current party status from PartyManager
   */
  getPartyStatus() {
    return this.pm.getPartyStatus();
  }

  /**
   * Print party status to console
   */
  printPartyStatus() {
    this.pm.printStatus();
  }

  /**
   * Get recent events from PartyManager auto-log
   */
  getRecentEvents(limit = 10) {
    return this.pm.getRecentEvents(limit);
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
