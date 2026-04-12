# Rulebook & Character Sheet Integration

This document describes the automatic rulebook and character sheet consultation system built into the D&D game engine.

## Overview

The game engine now automatically consults rule books (PHB, DMG, MM) and loads character sheets **before every encounter**. This ensures:

- All character data is loaded and validated
- Relevant rules are consulted based on encounter type
- Mechanical errors are caught before combat begins
- The DM has all necessary information at their fingertips

## Architecture

### Core Components

```
src/systems/
├── rulebook-consultant/
│   └── index.js          # Character loader & rulebook consultant
└── integrated-game-engine.js  # Enhanced combat engine with consultation

run-encounter.js          # CLI tool for running encounters
```

### Key Classes

#### `CharacterSheetLoader`
Loads and caches character data from JSON or Markdown files.

```javascript
const loader = new CharacterSheetLoader('./characters');
const character = loader.loadCharacter('malice');
const party = loader.loadParty(['malice', 'blackdow', 'dogman']);
```

**Supported Formats:**
- JSON files (e.g., `malice.json`)
- Markdown character sheets (e.g., `malice_character_sheet.md`)
- Case-insensitive lookup ("Black Dow" → `blackdow.json`)

#### `RulebookConsultant`
Consults PHB, DMG, and MM before encounters.

```javascript
const consultant = new RulebookConsultant();
const consultation = await consultant.consultBeforeEncounter(
  { name: 'Goblin Ambush', type: 'combat', enemies: ['goblin'] },
  ['malice', 'blackdow']
);
```

**Consultation includes:**
- Character sheet loading and validation
- PHB rules for combat, magic, etc.
- DMG encounter design guidelines
- MM monster stats
- Recommendations based on party status

#### `IntegratedCombatEngine`
Combat engine with built-in rulebook consultation.

```javascript
const combat = new IntegratedCombatEngine(consultant);
await combat.beginEncounter('Ambush', enemies, party);
combat.executeAttack('malice', 'goblin');
combat.castSpell('malice', 'Magic Missile', 1, 'mage');
```

#### `EnhancedGameMaster`
High-level orchestrator with full integration.

```javascript
const gm = new EnhancedGameMaster();
await gm.initialize(['malice', 'blackdow', 'dogman']);
await gm.startEncounter({ name: 'Test', enemies: [...] });
```

## Usage

### CLI Tool: `run-encounter.js`

#### Validate Character Sheets
```bash
node run-encounter.js --validate
node run-encounter.js --party malice,blackdow --validate
```

#### Run an Encounter
```bash
# Simple encounter
node run-encounter.js --party malice,blackdow --enemies goblin:3

# Named encounter
node run-encounter.js --party malice,blackdow --enemies orc:2,goblin:4 --name "Cave Assault"

# From file
node run-encounter.js --encounter ./encounters/ambush.json

# Interactive mode
node run-encounter.js --party malice,blackdow --enemies goblin:2 --interactive
```

#### Rule Lookup
```bash
node run-encounter.js --lookup phb:THAC0
node run-encounter.js --lookup dmg:encounter
node run-encounter.js --lookup mm:dragon
```

### Interactive Combat Commands

When running in interactive mode:

```
> attack malice goblin      # Make attack roll
> damage goblin 8           # Apply damage
> spell malice fireball 3   # Cast spell
> save malice breath        # Saving throw
> status                    # Show combat status
> next                      # Next round
> end                       # End combat
```

## Character Sheet Parsing

The system automatically parses markdown character sheets for:

- **Basic Info:** Name, race, class, level, alignment
- **Ability Scores:** STR, DEX, CON, INT, WIS, CHA with modifiers
- **Combat Stats:** HP, AC, THAC0, saving throws
- **Spells:** Slots per level, remaining slots
- **Equipment:** Armor, weapons, magic items
- **Conditions:** Current status effects

### Example Parsed Output

```javascript
{
  name: 'malice',
  race: 'Drow (Dark Elf)',
  class: 'Cleric',
  level: 7,
  multiClass: { class: 'Mage', level: 7 },
  abilityScores: {
    str: { score: 15, mod: 1 },
    dex: { score: 15, mod: 1 },
    con: { score: 15, mod: 2 },
    int: { score: 17, mod: 4 },
    wis: { score: 17, mod: 3 },
    cha: { score: 11, mod: 0 }
  },
  hp: { current: 50, max: 50 },
  ac: { total: 4 },
  thac0: 16,
  saves: {
    paralyze: 9,
    rod: 9,
    petrification: 9,
    breath: 11,
    spell: 10
  },
  spells: {
    cleric: {
      '1': { total: 6, used: 0, remaining: 6 },
      '2': { total: 4, used: 0, remaining: 4 }
    },
    mage: {
      '1': { total: 14, used: 0, remaining: 14 },
      '2': { total: 6, used: 0, remaining: 6 }
    }
  },
  magicItems: [
    { name: 'Staff of the Magi', type: 'Legendary Staff' },
    { name: 'Cloak of Twilight', type: 'Wondrous Item' }
  ]
}
```

## Pre-Encounter Consultation

Every encounter starts with automatic consultation:

```
📚 CONSULTING RULEBOOKS AND CHARACTER SHEETS...

Loading character sheets...
✓ Loaded 5 characters
Consulting rule books...
Validating encounter mechanics...
Generating recommendations...

============================================================
RULEBOOK CONSULTATION COMPLETE
============================================================

📋 PARTY STATUS:
  • malice: HP 50/50, AC 4, THAC0 16
  • Black Dow: HP 72/72, AC 3, THAC0 10
  • Dogman: HP 58/58, AC 2, THAC0 12
  • Threetrees: HP 85/85, AC 0, THAC0 8
  • Grond: HP 69/69, AC 0, THAC0 15

✅ All validations passed

💡 RECOMMENDATIONS:
  🟢 Spellcasters with no slots remaining: malice
============================================================
```

## Validation Checks

The system automatically validates:

- **HP:** Characters at 0 HP flagged as unconscious
- **Spell Slots:** Negative slots flagged as error
- **Ability Scores:** Missing stats flagged as warning
- **AC/THAC0:** Defaults provided if missing

## Integration with Existing Systems

The rulebook consultant integrates with:

- **PHB Skill:** Player's Handbook reference
- **DMG Skill:** Dungeon Master's Guide reference
- **MM Skill:** Monster Manual reference
- **ADnDRuleEngine:** Core dice rolling and mechanics
- **GameMasterOrchestrator:** Session management

## Future Enhancements

Planned improvements:

1. **Automatic Rule Application:** Suggest rules based on context
2. **Condition Tracking:** Automatic condition duration tracking
3. **Spell Validation:** Verify spell components, range, duration
4. **Equipment Validation:** Check item usage limits
5. **XP Calculation:** Automatic XP awards based on DMG tables
6. **Treasure Generation:** Consult DMG treasure tables

## File Structure

```
dnd/
├── characters/              # Character sheets
│   ├── malice.json
│   ├── malice_character_sheet.md
│   ├── blackdow.json
│   └── ...
├── skills/
│   ├── phb-skill/
│   │   ├── SKILL.md
│   │   ├── phb-skill.js
│   │   └── PHB.md
│   ├── dmg-skill/
│   └── mm-skill/
├── src/
│   └── systems/
│       ├── rulebook-consultant/
│       │   └── index.js
│       └── integrated-game-engine.js
├── run-encounter.js
└── RULEBOOK_INTEGRATION.md  # This file
```

## Troubleshooting

### Character Not Found
- Check filename matches (case-insensitive: "Black Dow" → `blackdow.json`)
- Verify file is in `characters/` directory
- Try both JSON and Markdown formats

### HP/AC Not Loading
- Check markdown format: `**HP:** 50/50` or `**HP** 50/50`
- Ensure stats are in tables or bullet lists

### Rule Lookup Fails
- Verify skill files exist in `skills/phb-skill/`, `skills/dmg-skill/`, `skills/mm-skill/`
- Check that PHB.md, DMG.md, MM.md files are present

## API Reference

See inline JSDoc comments in:
- `src/systems/rulebook-consultant/index.js`
- `src/systems/integrated-game-engine.js`
