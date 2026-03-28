const fs = require('fs');
const path = require('path');

const PARTY_FILE = path.join(__dirname, 'party.json');
const SESSION_FILE = path.join(__dirname, 'session_state.json');
const LOG_FILE = path.join(__dirname, 'auto_log.json');

// Spell slots table for AD&D 1e
const SPELL_SLOTS = {
  cleric: {
    1: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 4 },
    2: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 3 },
    3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 2, 8: 2, 9: 3 }
  },
  mage: {
    1: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4 },
    2: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3 },
    3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 2, 7: 2, 8: 2, 9: 3 }
  }
};

class PartyManager {
  constructor() {
    this.party = this.loadParty();
    this.session = this.loadSession();
    this.autoLog = this.loadAutoLog();
  }

  // ============ FILE OPERATIONS ============
  
  loadParty() {
    try {
      return JSON.parse(fs.readFileSync(PARTY_FILE, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  loadSession() {
    try {
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  loadAutoLog() {
    try {
      return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    } catch (e) {
      return { events: [], created: new Date().toISOString() };
    }
  }

  saveParty() {
    fs.writeFileSync(PARTY_FILE, JSON.stringify(this.party, null, 2));
  }

  saveSession() {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(this.session, null, 2));
  }

  saveAutoLog() {
    fs.writeFileSync(LOG_FILE, JSON.stringify(this.autoLog, null, 2));
  }

  // ============ AUTO-LOGGING SYSTEM ============
  
  logEvent(type, data) {
    const event = {
      timestamp: new Date().toISOString(),
      type,
      data,
      session_id: this.session?.session_id || 'unknown'
    };
    this.autoLog.events.push(event);
    this.saveAutoLog();
    return event;
  }

  // ============ CHARACTER MANAGEMENT ============
  
  getCharacter(charId) {
    return this.party?.members?.find(c => c.character_id === charId);
  }

  getSessionCharacter(charId) {
    return this.session?.characters?.[charId];
  }

  // ============ HP MANAGEMENT (AUTO-TRACKED) ============
  
  updateHP(charId, amount, healing = false) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    const oldHP = sessionChar.hp_current;
    
    if (healing) {
      sessionChar.hp_current = Math.min(char.hp.max, sessionChar.hp_current + amount);
    } else {
      sessionChar.hp_current = Math.max(0, sessionChar.hp_current - amount);
    }

    const newHP = sessionChar.hp_current;
    const actualChange = healing ? (newHP - oldHP) : (oldHP - newHP);

    // Auto-log the HP change
    this.logEvent(healing ? 'HP_HEALED' : 'HP_DAMAGE', {
      character_id: charId,
      character_name: char.name,
      old_hp: oldHP,
      new_hp: newHP,
      amount: actualChange,
      max_hp: char.hp.max,
      source: healing ? 'healing' : 'damage'
    });

    // Check for unconscious/death
    if (newHP === 0 && oldHP > 0) {
      this.addCondition(charId, 'unconscious');
      this.logEvent('CHARACTER_UNCONSCIOUS', {
        character_id: charId,
        character_name: char.name
      });
    }

    this.saveSession();
    return {
      old_hp: oldHP,
      new_hp: newHP,
      change: actualChange,
      healing
    };
  }

  // ============ SPELL MANAGEMENT (AUTO-TRACKED) ============
  
  getMaxSpellSlots(charId, spellClass, level) {
    const char = this.getCharacter(charId);
    if (!char) return 0;

    // Parse level from "6/6" format
    const levels = char.level.split('/').map(Number);
    let classLevel = 0;
    
    if (spellClass === 'cleric' && char.class.toLowerCase().includes('cleric')) {
      classLevel = levels[0];
    } else if (spellClass === 'mage' && char.class.toLowerCase().includes('mage')) {
      classLevel = levels[1] || levels[0];
    }

    let slots = SPELL_SLOTS[spellClass]?.[level]?.[classLevel] || 0;

    // Apply Ring of Wizardry (doubles level 1 mage spells)
    if (spellClass === 'mage' && level === 1) {
      const hasRing = this.hasItemEquipped(charId, 'ring_of_wizardry');
      if (hasRing) {
        slots *= 2;
      }
    }

    return slots;
  }

  hasItemEquipped(charId, itemId) {
    const sessionChar = this.getSessionCharacter(charId);
    if (!sessionChar || !sessionChar.equipment) return false;
    
    const eq = sessionChar.equipment;
    return Object.values(eq).some(item => item && item.includes(itemId));
  }

  getAvailableSpells(charId, spellClass, level) {
    const sessionChar = this.getSessionCharacter(charId);
    if (!sessionChar) return 0;

    const maxSlots = this.getMaxSpellSlots(charId, spellClass, level);
    const key = `level_${level}`;
    const used = sessionChar.spells_cast?.[spellClass]?.[key]?.length || 0;
    
    return Math.max(0, maxSlots - used);
  }

  canCastSpell(charId, spellClass, level) {
    return this.getAvailableSpells(charId, spellClass, level) > 0;
  }

  castSpell(charId, spellName, level, spellClass) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    // Validate spell can be cast
    if (!this.canCastSpell(charId, spellClass, level)) {
      const available = this.getAvailableSpells(charId, spellClass, level);
      throw new Error(
        `${char.name} has no level ${level} ${spellClass} spell slots remaining (${available} available)`
      );
    }

    const key = `level_${level}`;
    
    if (!sessionChar.spells_cast[spellClass][key]) {
      sessionChar.spells_cast[spellClass][key] = [];
    }

    const spellRecord = {
      name: spellName,
      level,
      spell_class: spellClass,
      timestamp: new Date().toISOString()
    };
    
    sessionChar.spells_cast[spellClass][key].push(spellRecord);

    // Auto-log the spell cast
    const remaining = this.getAvailableSpells(charId, spellClass, level);
    this.logEvent('SPELL_CAST', {
      character_id: charId,
      character_name: char.name,
      spell_name: spellName,
      level,
      spell_class: spellClass,
      slots_remaining: remaining
    });

    this.saveSession();
    return spellRecord;
  }

  // ============ INNATE ABILITIES (AUTO-TRACKED) ============
  
  useInnate(charId, abilityName, description = '') {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    const innateRecord = {
      ability: abilityName,
      description,
      timestamp: new Date().toISOString()
    };
    
    sessionChar.innate_used.push(innateRecord);

    // Auto-log innate ability use
    this.logEvent('INNATE_ABILITY_USED', {
      character_id: charId,
      character_name: char.name,
      ability: abilityName,
      description,
      times_used_today: sessionChar.innate_used.length
    });

    this.saveSession();
    return innateRecord;
  }

  // ============ ITEM MANAGEMENT (AUTO-TRACKED) ============
  
  acquireItem(charId, item, quantity = 1) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    // Add to character's inventory (would need inventory structure)
    // For now, log the acquisition
    this.logEvent('ITEM_ACQUIRED', {
      character_id: charId,
      character_name: char.name,
      item: typeof item === 'string' ? { name: item } : item,
      quantity
    });

    this.saveSession();
    return item;
  }

  equipItem(charId, itemName, slot) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    const oldItem = sessionChar.equipment?.[slot] || null;
    
    if (!sessionChar.equipment) {
      sessionChar.equipment = {};
    }
    
    sessionChar.equipment[slot] = itemName;

    // Auto-log equipment change
    this.logEvent('ITEM_EQUIPPED', {
      character_id: charId,
      character_name: char.name,
      item: itemName,
      slot,
      previous_item: oldItem
    });

    this.saveSession();
    return { equipped: itemName, previous: oldItem };
  }

  useConsumable(charId, itemName, effect = '') {
    const char = this.getCharacter(charId);
    
    if (!char) {
      throw new Error(`Character ${charId} not found`);
    }

    this.logEvent('CONSUMABLE_USED', {
      character_id: charId,
      character_name: char.name,
      item: itemName,
      effect
    });

    this.saveSession();
  }

  // ============ CONDITIONS (AUTO-TRACKED) ============
  
  addCondition(charId, condition, duration = null) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    if (!sessionChar.conditions) {
      sessionChar.conditions = [];
    }

    if (!sessionChar.conditions.includes(condition)) {
      sessionChar.conditions.push(condition);

      this.logEvent('CONDITION_ADDED', {
        character_id: charId,
        character_name: char.name,
        condition,
        duration
      });

      this.saveSession();
    }

    return sessionChar.conditions;
  }

  removeCondition(charId, condition) {
    const char = this.getCharacter(charId);
    const sessionChar = this.getSessionCharacter(charId);
    
    if (!char || !sessionChar) {
      throw new Error(`Character ${charId} not found`);
    }

    if (sessionChar.conditions) {
      const idx = sessionChar.conditions.indexOf(condition);
      if (idx > -1) {
        sessionChar.conditions.splice(idx, 1);

        this.logEvent('CONDITION_REMOVED', {
          character_id: charId,
          character_name: char.name,
          condition
        });

        this.saveSession();
      }
    }

    return sessionChar.conditions;
  }

  // ============ COMBAT MANAGEMENT (AUTO-TRACKED) ============
  
  startCombat(enemies) {
    this.session.combat.in_combat = true;
    this.session.combat.round = 1;
    this.session.combat.enemies = enemies.map(e => ({
      ...e,
      hp_current: e.hp_max || e.hp || 10
    }));

    this.logEvent('COMBAT_STARTED', {
      enemies: enemies.map(e => e.name || e.type),
      enemy_count: enemies.length
    });

    this.saveSession();
  }

  endCombat(xpEarned = 0) {
    const kills = this.session.combat.enemies.filter(e => (e.hp_current || 0) <= 0).length;
    
    this.session.combat.in_combat = false;
    this.session.combat.round = 0;
    this.session.combat.enemies = [];
    this.session.session_stats.xp_earned += xpEarned;
    this.session.session_stats.kills += kills;

    this.logEvent('COMBAT_ENDED', {
      xp_earned: xpEarned,
      kills,
      total_xp: this.session.session_stats.xp_earned,
      total_kills: this.session.session_stats.kills
    });

    this.saveSession();
  }

  nextRound() {
    if (!this.session.combat.in_combat) return;
    
    this.session.combat.round++;
    
    this.logEvent('COMBAT_ROUND_ADVANCED', {
      round: this.session.combat.round
    });

    this.saveSession();
    return this.session.combat.round;
  }

  damageEnemy(enemyIndex, damage) {
    if (!this.session.combat.in_combat) return null;
    
    const enemy = this.session.combat.enemies[enemyIndex];
    if (!enemy) return null;

    const oldHP = enemy.hp_current || enemy.hp_max || 10;
    enemy.hp_current = Math.max(0, oldHP - damage);

    this.logEvent('ENEMY_DAMAGED', {
      enemy_name: enemy.name || enemy.type,
      enemy_index: enemyIndex,
      damage,
      hp_remaining: enemy.hp_current
    });

    // Check if enemy died
    if (enemy.hp_current === 0 && oldHP > 0) {
      this.logEvent('ENEMY_KILLED', {
        enemy_name: enemy.name || enemy.type,
        xp_value: enemy.xp || 0
      });
    }

    this.saveSession();
    return enemy.hp_current;
  }

  // ============ LOCATION TRACKING (AUTO-TRACKED) ============
  
  moveParty(newLocation, description = '') {
    const oldLocation = this.session.party_location?.room;
    
    this.session.party_location.room = newLocation;
    if (description) {
      this.session.party_location.description = description;
    }

    if (!this.session.discovered_areas.includes(newLocation)) {
      this.session.discovered_areas.push(newLocation);
    }

    this.logEvent('PARTY_MOVED', {
      from: oldLocation,
      to: newLocation,
      description,
      new_area: !this.session.discovered_areas.includes(newLocation)
    });

    this.saveSession();
  }

  // ============ TIME TRACKING (AUTO-TRACKED) ============
  
  advanceTime(hours = 1) {
    // Simple time advancement - could be enhanced
    this.logEvent('TIME_ADVANCED', {
      hours,
      current_time: this.session.time
    });
    
    this.saveSession();
  }

  // ============ PARTY STATUS DISPLAY ============
  
  getPartyStatus() {
    const status = {
      location: this.session.party_location,
      time: this.session.time,
      in_combat: this.session.combat.in_combat,
      characters: []
    };

    for (const char of this.party.members) {
      const sessionChar = this.session.characters[char.character_id];
      if (!sessionChar) continue;

      const charStatus = {
        name: char.name,
        class: char.class,
        hp: `${sessionChar.hp_current}/${char.hp.max}`,
        hp_percent: Math.round((sessionChar.hp_current / char.hp.max) * 100),
        ac: char.ac.total,
        conditions: sessionChar.conditions || [],
        location: char.location,
        spells: {},
        innate_used: sessionChar.innate_used?.length || 0
      };

      // Add spell availability
      if (char.class.toLowerCase().includes('cleric')) {
        charStatus.spells.cleric = {
          1: this.getAvailableSpells(char.character_id, 'cleric', 1),
          2: this.getAvailableSpells(char.character_id, 'cleric', 2),
          3: this.getAvailableSpells(char.character_id, 'cleric', 3)
        };
      }
      
      if (char.class.toLowerCase().includes('mage')) {
        charStatus.spells.mage = {
          1: this.getAvailableSpells(char.character_id, 'mage', 1),
          2: this.getAvailableSpells(char.character_id, 'mage', 2),
          3: this.getAvailableSpells(char.character_id, 'mage', 3)
        };
      }

      status.characters.push(charStatus);
    }

    return status;
  }

  printStatus() {
    const status = this.getPartyStatus();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    PARTY STATUS                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Location: ${status.location.room.padEnd(46)}║`);
    console.log(`║ Time: Day ${status.time.day}, ${status.time.time_of_day.padEnd(40)}║`);
    console.log(`║ Combat: ${(status.in_combat ? 'YES' : 'No').padEnd(48)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    for (const char of status.characters) {
      const hpBar = this.renderHPBar(char.hp_percent);
      console.log(`${char.name} (${char.class})`);
      console.log(`  HP: ${char.hp} ${hpBar}`);
      console.log(`  AC: ${char.ac}`);
      
      if (Object.keys(char.spells).length > 0) {
        console.log('  Spells Available:');
        for (const [cls, levels] of Object.entries(char.spells)) {
          const slots = Object.entries(levels)
            .map(([lvl, count]) => `L${lvl}:${count}`)
            .join(', ');
          console.log(`    ${cls}: ${slots}`);
        }
      }
      
      if (char.innate_used > 0) {
        console.log(`  Innate abilities used today: ${char.innate_used}`);
      }
      
      if (char.conditions.length > 0) {
        console.log(`  Conditions: ${char.conditions.join(', ')}`);
      }
      console.log('');
    }
  }

  renderHPBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percent}%`;
  }

  // ============ SESSION STATS ============
  
  getSessionStats() {
    return {
      ...this.session.session_stats,
      events_logged: this.autoLog.events.length,
      discovered_areas: this.session.discovered_areas.length,
      current_location: this.session.party_location.room
    };
  }

  // ============ AUTO-LOG QUERIES ============
  
  getRecentEvents(limit = 10) {
    return this.autoLog.events.slice(-limit).reverse();
  }

  getEventsByType(type) {
    return this.autoLog.events.filter(e => e.type === type);
  }

  getCharacterEvents(charId, limit = 20) {
    return this.autoLog.events
      .filter(e => e.data?.character_id === charId)
      .slice(-limit)
      .reverse();
  }

  printRecentEvents(limit = 10) {
    const events = this.getRecentEvents(limit);
    console.log(`\n=== RECENT EVENTS (last ${events.length}) ===\n`);
    
    for (const event of events) {
      const time = new Date(event.timestamp).toLocaleTimeString();
      console.log(`[${time}] ${event.type}`);
      
      if (event.data) {
        const details = Object.entries(event.data)
          .filter(([k]) => !['character_id', 'timestamp'].includes(k))
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        if (details) {
          console.log(`  ${details}`);
        }
      }
      console.log('');
    }
  }

  // ============ REST & RECOVERY ============
  
  rest(hours = 8) {
    // Reset spell slots
    for (const charId of Object.keys(this.session.characters)) {
      const sessionChar = this.session.characters[charId];
      
      // Clear spells cast
      sessionChar.spells_cast = {
        cleric: { level_1: [], level_2: [], level_3: [] },
        mage: { level_1: [], level_2: [], level_3: [] }
      };
      
      // Clear innate abilities (daily use)
      sessionChar.innate_used = [];
      
      // Heal some HP (simplified - could use actual rest rules)
      const char = this.getCharacter(charId);
      if (char && sessionChar.hp_current < char.hp.max) {
        const healAmount = Math.floor(hours / 8) * 2; // Simplified healing
        this.updateHP(charId, healAmount, true);
      }
    }

    this.session.time.hours_rested += hours;
    
    this.logEvent('PARTY_RESTED', {
      hours,
      spells_refreshed: true,
      innate_refreshed: true
    });

    this.saveSession();
  }
}

module.exports = PartyManager;

// CLI usage
if (require.main === module) {
  const pm = new PartyManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'status':
      pm.printStatus();
      break;
    case 'spells':
      const charId = process.argv[3] || 'malice_indarae_debarazzan';
      const char = pm.getCharacter(charId);
      if (char) {
        console.log(`\nSpells for ${char.name}:`);
        if (char.class.toLowerCase().includes('cleric')) {
          console.log(`  Cleric L1: ${pm.getAvailableSpells(charId, 'cleric', 1)} available`);
          console.log(`  Cleric L2: ${pm.getAvailableSpells(charId, 'cleric', 2)} available`);
          console.log(`  Cleric L3: ${pm.getAvailableSpells(charId, 'cleric', 3)} available`);
        }
        if (char.class.toLowerCase().includes('mage')) {
          console.log(`  Mage L1: ${pm.getAvailableSpells(charId, 'mage', 1)} available (Ring of Wizardry: 2x)`);
          console.log(`  Mage L2: ${pm.getAvailableSpells(charId, 'mage', 2)} available`);
          console.log(`  Mage L3: ${pm.getAvailableSpells(charId, 'mage', 3)} available`);
        }
      }
      break;
    case 'log':
      const limit = parseInt(process.argv[3]) || 10;
      pm.printRecentEvents(limit);
      break;
    case 'stats':
      console.log('\n=== SESSION STATS ===');
      console.log(pm.getSessionStats());
      break;
    default:
      console.log('Usage: node party_manager.js [status|spells|log|stats]');
      console.log('');
      console.log('Commands:');
      console.log('  status       - Show party status');
      console.log('  spells       - Show spell availability');
      console.log('  log [n]      - Show recent events (default 10)');
      console.log('  stats        - Show session statistics');
  }
}
