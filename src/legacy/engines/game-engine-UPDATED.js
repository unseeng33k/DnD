#!/usr/bin/env node

/**
 * D&D Game Engine - PHASE 1 UPDATED
 * Main orchestrator for gameplay with PartyManager integration
 * Usage: node game-engine.js [command] [options]
 * 
 * PHASE 1 CHANGES:
 * - Moved to src/legacy/engines/game-engine.js
 * - Updated imports for moved dependencies
 */

// PATH UPDATE: party_manager moved to src/legacy/systems/
const PartyManager = require('../systems/party_manager');
// PATH UPDATE: logger moved to src/legacy/utilities/
const CharacterLogger = require('../utilities/logger');
const DMGSkill = require('../../../skills/dmg-skill/dmg-skill');
const PHBSkill = require('../../../skills/phb-skill/phb-skill');
const MMSkill = require('../../../skills/mm-skill/mm-skill');
const AmbianceAgent = require('../../../skills/ambiance-agent/ambiance');
const DisneyAmbiance = require('../../../skills/disney-ambiance');
const ASCIIMap = require('../../../skills/ascii-map/ascii-map');
const CombatTracker = require('../../../skills/combat-tracker');
const EncounterGenerator = require('../../../skills/encounter-generator');
const TreasureGenerator = require('../../../skills/treasure-generator');
const NameGenerator = require('../../../skills/name-generator');
const PuzzleTrapGenerator = require('../../../skills/puzzle-trap-generator');
const WeatherSystem = require('../../../skills/weather-system');
const CalendarTracker = require('../../../skills/calendar-tracker');
const QuestGenerator = require('../../../skills/quest-generator');
const DiceRoller = require('../../../skills/dice-roller');
const MoraleSystem = require('../../../skills/morale-system');
const DungeonGenerator = require('../../../skills/dungeon-generator');
const WildernessSystem = require('../../../skills/wilderness-system');
const HenchmanSystem = require('../../../skills/henchman-system');
const StrongholdSystem = require('../../../skills/stronghold-system');
const ResearchSystem = require('../../../skills/research-system');
const DivineIntervention = require('../../../skills/divine-intervention');
const DiseaseSystem = require('../../../skills/disease-system');
const TrainingSystem = require('../../../skills/training-system');
const MonsterEcology = require('../../../skills/monster-ecology');
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

  // ... rest of GameEngine class unchanged ...
}

module.exports = GameEngine;
