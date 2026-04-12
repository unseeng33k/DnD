#!/usr/bin/env node

/**
 * RULEBOOK CONSULTANT SYSTEM
 * 
 * Automatically consults rule books and character sheets before every encounter.
 * This system ensures the game engine has all relevant mechanical information
 * loaded and validated before combat or skill challenges begin.
 * 
 * Key Features:
 * - Pre-encounter rule validation
 * - Character sheet loading and caching
 * - Automatic rule lookups based on encounter type
 * - Integration with PHB, DMG, and MM skills
 * - Real-time mechanical validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CharacterSheetLoader - Loads and caches character data
 */
export class CharacterSheetLoader {
  constructor(charactersDir) {
    this.charactersDir = charactersDir || path.join(process.cwd(), 'characters');
    this.cache = new Map();
    this.watchers = new Map();
  }

  /**
   * Load a character from JSON or Markdown sheet
   */
  loadCharacter(name) {
    const cached = this.cache.get(name);
    if (cached && !this.hasFileChanged(name)) {
      return cached;
    }

    // Normalize name for file lookup (lowercase, remove spaces)
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');

    // Try JSON first (check both original and normalized names)
    const jsonPaths = [
      path.join(this.charactersDir, `${name}.json`),
      path.join(this.charactersDir, `${normalizedName}.json`)
    ];
    
    for (const jsonPath of jsonPaths) {
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        this.cache.set(name, data);
        this.trackFile(name, jsonPath);
        return data;
      }
    }

    // Try markdown character sheet (check both original and normalized names)
    const baseNames = [name, normalizedName];
    const mdPaths = [];
    for (const base of baseNames) {
      mdPaths.push(
        path.join(this.charactersDir, `${base}_character_sheet.md`),
        path.join(this.charactersDir, `${base}_character_sheet_current.md`),
        path.join(this.charactersDir, `${base}_active.md`),
        path.join(this.charactersDir, `${base}_live_sheet.md`)
      );
    }

    for (const mdPath of mdPaths) {
      if (fs.existsSync(mdPath)) {
        const data = this.parseMarkdownSheet(fs.readFileSync(mdPath, 'utf8'), name);
        this.cache.set(name, data);
        this.trackFile(name, mdPath);
        return data;
      }
    }

    throw new Error(`Character "${name}" not found in ${this.charactersDir}`);
  }

  /**
   * Parse markdown character sheet into structured data
   */
  parseMarkdownSheet(content, name) {
    const character = {
      name,
      source: 'markdown',
      abilityScores: {},
      hp: { current: 0, max: 0 },
      ac: { total: 10 },
      thac0: 20,
      saves: {},
      spells: { cleric: {}, mage: {} },
      equipment: [],
      magicItems: [],
      conditions: [],
      notes: []
    };

    // Extract ability scores
    const abilityPattern = /\*\*(STR|INT|WIS|DEX|CON|CHA)\*\*[:\s]+(\d+)/gi;
    let match;
    while ((match = abilityPattern.exec(content)) !== null) {
      const stat = match[1].toLowerCase();
      const score = parseInt(match[2]);
      character.abilityScores[stat] = {
        score,
        mod: this.calculateModifier(score)
      };
    }

    // Also try table format
    const tableAbilityPattern = /\|\s*(STR|INT|WIS|DEX|CON|CHA)\s*\|\s*(\d+)\s*\|/gi;
    while ((match = tableAbilityPattern.exec(content)) !== null) {
      const stat = match[1].toLowerCase();
      const score = parseInt(match[2]);
      if (!character.abilityScores[stat]) {
        character.abilityScores[stat] = {
          score,
          mod: this.calculateModifier(score)
        };
      }
    }

    // Extract HP - handle various formats
    const hpPatterns = [
      /\*\*HP:\*\*\s*(\d+)\/(\d+)/i,
      /\*\*HP\*\*[:\s]+(\d+)\/(\d+)/i,
      /\*\*HP[:\s]+(\d+)\/(\d+)/i,
      /HP[:\s]+(\d+)\/(\d+)/i
    ];
    
    for (const pattern of hpPatterns) {
      const hpMatch = content.match(pattern);
      if (hpMatch) {
        character.hp.current = parseInt(hpMatch[1]);
        character.hp.max = parseInt(hpMatch[2]);
        break;
      }
    }

    // Extract AC
    const acPattern = /\*\*AC\*\*[:\s]+(\d+)/i;
    const acMatch = content.match(acPattern);
    if (acMatch) {
      character.ac.total = parseInt(acMatch[1]);
    }

    // Extract THAC0
    const thac0Pattern = /\*\*THAC0.*?\*\*[:\s]+(\d+)/i;
    const thac0Match = content.match(thac0Pattern);
    if (thac0Match) {
      character.thac0 = parseInt(thac0Match[1]);
    }

    // Extract saves from table
    const savePatterns = [
      { name: 'paralyze', pattern: /Paralyzation\/Poison\/Death\s*\|\s*(\d+)/i },
      { name: 'rod', pattern: /Rod\/Staff\/Wand\s*\|\s*(\d+)/i },
      { name: 'petrification', pattern: /Petrification\/Polymorph\s*\|\s*(\d+)/i },
      { name: 'breath', pattern: /Breath Weapon\s*\|\s*(\d+)/i },
      { name: 'spell', pattern: /Spell\s*\|\s*(\d+)/i }
    ];

    for (const save of savePatterns) {
      const saveMatch = content.match(save.pattern);
      if (saveMatch) {
        character.saves[save.name] = parseInt(saveMatch[1]);
      }
    }

    // Extract spell slots
    const spellSlotPattern = /\|\s*(\d+)(?:st|nd|rd|th)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/gi;
    while ((match = spellSlotPattern.exec(content)) !== null) {
      const level = match[1];
      const total = parseInt(match[2]);
      const used = parseInt(match[3]);
      const remaining = parseInt(match[4]);
      
      // Determine if cleric or mage based on context
      if (content.indexOf('Cleric Spells') < content.indexOf('Mage Spells')) {
        if (match.index < content.indexOf('Mage Spells')) {
          character.spells.cleric[level] = { total, used, remaining };
        } else {
          character.spells.mage[level] = { total, used, remaining };
        }
      }
    }

    // Extract magic items
    const magicItemPattern = /###\s+([^\n]+)\n\*\*Type\*\*:\s*([^\n]+)/gi;
    while ((match = magicItemPattern.exec(content)) !== null) {
      character.magicItems.push({
        name: match[1].trim(),
        type: match[2].trim()
      });
    }

    // Extract class and level
    const classPatterns = [
      /\*\*Class:\*\*\s*([\w\s\/]+?)(?:\n|\r|$)/i,
      /\*\*Class\*\*[:\s]+([\w\s\/]+?)(?:\n|\r|$)/i
    ];
    
    for (const pattern of classPatterns) {
      const classMatch = content.match(pattern);
      if (classMatch) {
        const classInfo = classMatch[1].trim();
        // Parse "Cleric 7 / Mage 7" format
        const multiClassPattern = /(\w+)\s+(\d+)(?:\s*\/\s*(\w+)\s+(\d+))?/i;
        const multiMatch = classInfo.match(multiClassPattern);
        if (multiMatch) {
          character.class = multiMatch[1];
          character.level = parseInt(multiMatch[2]);
          if (multiMatch[3]) {
            character.multiClass = {
              class: multiMatch[3],
              level: parseInt(multiMatch[4])
            };
          }
        }
        break;
      }
    }

    // Extract race
    const racePattern = /\*\*Race\*\*[:\s]+([^\n]+)/i;
    const raceMatch = content.match(racePattern);
    if (raceMatch) {
      character.race = raceMatch[1].trim();
    }

    // Extract alignment
    const alignPattern = /\*\*Alignment\*\*[:\s]+([^\n]+)/i;
    const alignMatch = content.match(alignPattern);
    if (alignMatch) {
      character.alignment = alignMatch[1].trim();
    }

    return character;
  }

  calculateModifier(score) {
    if (score >= 18) return 3;
    if (score >= 16) return 2;
    if (score >= 13) return 1;
    if (score >= 9) return 0;
    if (score >= 6) return -1;
    if (score >= 4) return -2;
    return -3;
  }

  trackFile(name, filePath) {
    try {
      const stats = fs.statSync(filePath);
      this.watchers.set(name, { path: filePath, mtime: stats.mtime });
    } catch (e) {
      // Ignore errors
    }
  }

  hasFileChanged(name) {
    const watcher = this.watchers.get(name);
    if (!watcher) return true;

    try {
      const stats = fs.statSync(watcher.path);
      return stats.mtime > watcher.mtime;
    } catch (e) {
      return true;
    }
  }

  /**
   * Load entire party
   */
  loadParty(partyNames) {
    return partyNames.map(name => {
      try {
        return this.loadCharacter(name);
      } catch (e) {
        console.warn(`Warning: Could not load character "${name}": ${e.message}`);
        return null;
      }
    }).filter(Boolean);
  }

  /**
   * Get all available characters
   */
  listCharacters() {
    try {
      const files = fs.readdirSync(this.charactersDir);
      const characters = new Set();

      for (const file of files) {
        // Extract character name from file
        const match = file.match(/^([^.]+?)(?:_.*)?\.(json|md)$/);
        if (match) {
          characters.add(match[1]);
        }
      }

      return Array.from(characters);
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.watchers.clear();
  }
}

/**
 * RulebookConsultant - Consults rule books before encounters
 */
export class RulebookConsultant {
  constructor(options = {}) {
    this.skillsDir = options.skillsDir || path.join(process.cwd(), 'skills');
    this.characterLoader = new CharacterSheetLoader(options.charactersDir);
    this.ruleCache = new Map();
    this.consultationLog = [];
  }

  /**
   * Main consultation method - called before every encounter
   */
  async consultBeforeEncounter(encounterData, partyNames) {
    const consultation = {
      timestamp: new Date().toISOString(),
      encounter: encounterData,
      party: [],
      rules: {},
      validations: [],
      recommendations: []
    };

    console.log('\n📚 CONSULTING RULEBOOKS AND CHARACTER SHEETS...\n');

    // 1. Load all party members
    console.log('Loading character sheets...');
    consultation.party = this.characterLoader.loadParty(partyNames);
    console.log(`✓ Loaded ${consultation.party.length} characters`);

    // 2. Consult rule books based on encounter type
    console.log('Consulting rule books...');
    consultation.rules = await this.consultRuleBooks(encounterData);

    // 3. Validate party against encounter
    console.log('Validating encounter mechanics...');
    consultation.validations = this.validateEncounter(consultation.party, encounterData);

    // 4. Generate recommendations
    console.log('Generating recommendations...');
    consultation.recommendations = this.generateRecommendations(consultation);

    // Log consultation
    this.consultationLog.push(consultation);

    // Print summary
    this.printConsultationSummary(consultation);

    return consultation;
  }

  /**
   * Consult relevant rule books based on encounter type
   */
  async consultRuleBooks(encounterData) {
    const rules = {
      phb: {},
      dmg: {},
      mm: {}
    };

    const encounterType = encounterData.type || 'combat';

    // Consult PHB for character-related rules
    if (encounterType === 'combat') {
      rules.phb.combat = await this.queryPHB('combat');
      rules.phb.thac0 = await this.queryPHB('THAC0');
      rules.phb.savingThrows = await this.queryPHB('saving throws');
    }

    if (encounterType === 'magic' || encounterData.involvesMagic) {
      rules.phb.spells = await this.queryPHB('spell casting');
      rules.phb.spellProgression = await this.queryPHB('spell progression');
    }

    // Consult DMG for encounter rules
    rules.dmg.encounterDesign = await this.queryDMG('encounter design');
    rules.dmg.morale = await this.queryDMG('morale');
    rules.dmg.xpAwards = await this.queryDMG('XP awards');

    // Consult MM for monster rules
    if (encounterData.enemies) {
      rules.mm.monsters = [];
      for (const enemy of encounterData.enemies) {
        const monsterName = typeof enemy === 'string' ? enemy : enemy.name;
        const monsterData = await this.queryMM(monsterName);
        if (monsterData) {
          rules.mm.monsters.push(monsterData);
        }
      }
    }

    return rules;
  }

  /**
   * Query PHB skill
   */
  async queryPHB(topic) {
    const cacheKey = `phb:${topic}`;
    if (this.ruleCache.has(cacheKey)) {
      return this.ruleCache.get(cacheKey);
    }

    try {
      const phbPath = path.join(this.skillsDir, 'phb-skill', 'PHB.md');
      if (!fs.existsSync(phbPath)) {
        return null;
      }

      const content = fs.readFileSync(phbPath, 'utf8');
      
      // Search for topic
      const lines = content.split('\n');
      const results = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(topic.toLowerCase())) {
          const start = Math.max(0, i - 3);
          const end = Math.min(lines.length, i + 10);
          results.push(lines.slice(start, end).join('\n'));
        }
      }

      const result = results.length > 0 ? results.join('\n---\n') : null;
      this.ruleCache.set(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    }
  }

  /**
   * Query DMG skill
   */
  async queryDMG(topic) {
    const cacheKey = `dmg:${topic}`;
    if (this.ruleCache.has(cacheKey)) {
      return this.ruleCache.get(cacheKey);
    }

    try {
      const dmgPath = path.join(this.skillsDir, 'dmg-skill', 'DMG.md');
      if (!fs.existsSync(dmgPath)) {
        return null;
      }

      const content = fs.readFileSync(dmgPath, 'utf8');
      
      // Search for topic
      const lines = content.split('\n');
      const results = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(topic.toLowerCase())) {
          const start = Math.max(0, i - 3);
          const end = Math.min(lines.length, i + 10);
          results.push(lines.slice(start, end).join('\n'));
        }
      }

      const result = results.length > 0 ? results.join('\n---\n') : null;
      this.ruleCache.set(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    }
  }

  /**
   * Query MM skill
   */
  async queryMM(monsterName) {
    const cacheKey = `mm:${monsterName}`;
    if (this.ruleCache.has(cacheKey)) {
      return this.ruleCache.get(cacheKey);
    }

    try {
      const mmPath = path.join(this.skillsDir, 'mm-skill', 'MM.md');
      if (!fs.existsSync(mmPath)) {
        return null;
      }

      const content = fs.readFileSync(mmPath, 'utf8');
      
      // Search for monster
      const monsterPattern = new RegExp(`###\\s*${monsterName}[^#]*`, 'i');
      const match = content.match(monsterPattern);
      
      const result = match ? match[0].trim() : null;
      this.ruleCache.set(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    }
  }

  /**
   * Validate party against encounter
   */
  validateEncounter(party, encounterData) {
    const validations = [];

    // Check party HP
    for (const character of party) {
      if (character.hp && character.hp.current <= 0) {
        validations.push({
          type: 'warning',
          message: `${character.name} has ${character.hp.current} HP and should be unconscious`,
          character: character.name
        });
      }
    }

    // Check spell slots
    for (const character of party) {
      if (character.spells) {
        for (const [level, slots] of Object.entries(character.spells.cleric || {})) {
          if (slots.remaining < 0) {
            validations.push({
              type: 'error',
              message: `${character.name} has negative cleric spell slots at level ${level}`,
              character: character.name
            });
          }
        }
        for (const [level, slots] of Object.entries(character.spells.mage || {})) {
          if (slots.remaining < 0) {
            validations.push({
              type: 'error',
              message: `${character.name} has negative mage spell slots at level ${level}`,
              character: character.name
            });
          }
        }
      }
    }

    // Check for required ability scores
    for (const character of party) {
      if (!character.abilityScores || Object.keys(character.abilityScores).length === 0) {
        validations.push({
          type: 'warning',
          message: `${character.name} has no ability scores loaded`,
          character: character.name
        });
      }
    }

    return validations;
  }

  /**
   * Generate recommendations based on consultation
   */
  generateRecommendations(consultation) {
    const recommendations = [];

    // Check for missing character data
    const missingData = consultation.party.filter(c => 
      !c.abilityScores || Object.keys(c.abilityScores).length === 0
    );
    if (missingData.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `Update character sheets for: ${missingData.map(c => c.name).join(', ')}`
      });
    }

    // Check for low HP
    const lowHP = consultation.party.filter(c => 
      c.hp && c.hp.current / c.hp.max < 0.25 && c.hp.current > 0
    );
    if (lowHP.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: `Consider healing before encounter: ${lowHP.map(c => `${c.name} (${c.hp.current}/${c.hp.max})`).join(', ')}`
      });
    }

    // Check for spellcasters with no slots
    const noSpells = consultation.party.filter(c => {
      if (!c.spells) return false;
      const clericSlots = Object.values(c.spells.cleric || {}).reduce((sum, s) => sum + (s.remaining || 0), 0);
      const mageSlots = Object.values(c.spells.mage || {}).reduce((sum, s) => sum + (s.remaining || 0), 0);
      return clericSlots === 0 && mageSlots === 0 && (c.class?.toLowerCase().includes('cleric') || c.class?.toLowerCase().includes('mage'));
    });
    if (noSpells.length > 0) {
      recommendations.push({
        priority: 'low',
        message: `Spellcasters with no slots remaining: ${noSpells.map(c => c.name).join(', ')}`
      });
    }

    return recommendations;
  }

  /**
   * Print consultation summary
   */
  printConsultationSummary(consultation) {
    console.log('\n' + '='.repeat(60));
    console.log('RULEBOOK CONSULTATION COMPLETE');
    console.log('='.repeat(60));

    // Party summary
    console.log('\n📋 PARTY STATUS:');
    for (const character of consultation.party) {
      const hp = character.hp ? `${character.hp.current}/${character.hp.max}` : '?';
      const ac = character.ac?.total || '?';
      const thac0 = character.thac0 || '?';
      console.log(`  • ${character.name}: HP ${hp}, AC ${ac}, THAC0 ${thac0}`);
    }

    // Validations
    if (consultation.validations.length > 0) {
      console.log('\n⚠️  VALIDATION ISSUES:');
      for (const v of consultation.validations) {
        const icon = v.type === 'error' ? '❌' : '⚠️';
        console.log(`  ${icon} ${v.message}`);
      }
    } else {
      console.log('\n✅ All validations passed');
    }

    // Recommendations
    if (consultation.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      for (const r of consultation.recommendations) {
        const icon = r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${icon} ${r.message}`);
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Get consultation history
   */
  getConsultationLog() {
    return this.consultationLog;
  }

  /**
   * Clear consultation log
   */
  clearLog() {
    this.consultationLog = [];
  }
}

/**
 * IntegratedGameEngine - Game engine with built-in rulebook consultation
 */
export class IntegratedGameEngine {
  constructor(options = {}) {
    this.consultant = new RulebookConsultant(options);
    this.currentEncounter = null;
    this.party = [];
  }

  /**
   * Initialize with party
   */
  async initialize(partyNames) {
    console.log('Initializing Integrated Game Engine...');
    this.party = this.consultant.characterLoader.loadParty(partyNames);
    console.log(`Loaded ${this.party.length} party members`);
    return this.party;
  }

  /**
   * Start encounter with automatic rulebook consultation
   */
  async startEncounter(encounterData) {
    // Always consult rulebooks before encounter
    const consultation = await this.consultant.consultBeforeEncounter(
      encounterData,
      this.party.map(p => p.name)
    );

    this.currentEncounter = {
      ...encounterData,
      consultation,
      startTime: new Date().toISOString()
    };

    return this.currentEncounter;
  }

  /**
   * Get character data during encounter
   */
  getCharacter(name) {
    return this.consultant.characterLoader.loadCharacter(name);
  }

  /**
   * Update character data
   */
  updateCharacter(name, updates) {
    const character = this.getCharacter(name);
    if (!character) return null;

    // Apply updates
    Object.assign(character, updates);

    // In a real implementation, this would save back to file
    // For now, just update cache
    this.consultant.characterLoader.cache.set(name, character);

    return character;
  }

  /**
   * End current encounter
   */
  endEncounter(result) {
    if (!this.currentEncounter) return null;

    const summary = {
      encounter: this.currentEncounter,
      result,
      endTime: new Date().toISOString(),
      duration: Date.now() - new Date(this.currentEncounter.startTime).getTime()
    };

    this.currentEncounter = null;
    return summary;
  }
}

// Export for use as module
export default { CharacterSheetLoader, RulebookConsultant, IntegratedGameEngine };

// CLI usage
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const command = args[0];

  const consultant = new RulebookConsultant();

  switch (command) {
    case 'consult':
      const encounterFile = args[1];
      const partyList = args[2]?.split(',') || ['malice', 'blackdow', 'dogman', 'threetrees', 'grond'];
      
      let encounterData = { type: 'combat', name: 'Test Encounter' };
      if (encounterFile && fs.existsSync(encounterFile)) {
        encounterData = JSON.parse(fs.readFileSync(encounterFile, 'utf8'));
      }
      
      consultant.consultBeforeEncounter(encounterData, partyList);
      break;

    case 'load':
      const charName = args[1];
      if (!charName) {
        console.log('Usage: load <character-name>');
        process.exit(1);
      }
      const char = consultant.characterLoader.loadCharacter(charName);
      console.log(JSON.stringify(char, null, 2));
      break;

    case 'list':
      const chars = consultant.characterLoader.listCharacters();
      console.log('Available characters:');
      chars.forEach(c => console.log(`  - ${c}`));
      break;

    default:
      console.log(`
Rulebook Consultant CLI

Usage:
  node rulebook-consultant.js consult [encounter-file] [party-names]
  node rulebook-consultant.js load <character-name>
  node rulebook-consultant.js list

Examples:
  node rulebook-consultant.js consult
  node rulebook-consultant.js consult encounter.json malice,blackdow
  node rulebook-consultant.js load malice
  node rulebook-consultant.js list
`);
  }
}
