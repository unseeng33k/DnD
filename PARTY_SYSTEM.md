# D&D Party Management System

## Overview

This system tracks multiple characters, their stats, spells, inventory, and session state in real-time with **automatic event logging**.

## Files

### Core Data Files
- `party.json` — Character sheets, NPCs, quest log, shared inventory
- `session_state.json` — Current HP, spells cast, active effects, location, combat state
- `auto_log.json` — Automatically generated event log (created on first use)
- `party_manager.js` — JavaScript class for managing everything with auto-tracking

### Game Engine
- `game-engine.js` — **Main DM interface** — CLI commands for all game actions
- `logger.js` — Character action logger with PartyManager integration

### Character Files
- `characters/malice_indarae_debarazzan.json` — Official character sheet
- `characters/malice_active.md` — Quick reference sheet
- `characters/malice_log.md` — Adventure log
- `characters/malice_live_sheet.md` — Working copy for DM

## Quick Start (DM Commands)

### Check Party Status
```bash
node game-engine.js status
```

### Cast a Spell (auto-validates slots)
```bash
node game-engine.js cast "Magic Missile" 1 mage "Orc"
```

### Deal Damage
```bash
node game-engine.js damage 5 "Trap"
```

### Heal
```bash
node game-engine.js heal 10 "Potion"
```

### Combat
```bash
node game-engine.js combat-start "Orc,Orc,Goblin"
node game-engine.js damage-enemy 0 8    # Damage enemy index 0 for 8 HP
node game-engine.js combat-end 150       # End combat, award 150 XP
```

### Movement
```bash
node game-engine.js move "Throne Room" "Ancient stone chamber"
```

### Rest (refreshes spells)
```bash
node game-engine.js rest 8
```

### View Recent Events
```bash
node game-engine.js events 20
```

## Auto-Tracking Features

Every action is **automatically logged**:
- ✅ Spell casts (with slot validation)
- ✅ HP changes (damage/healing)
- ✅ Innate ability uses
- ✅ Item acquisitions/equipping
- ✅ Combat start/end, enemy deaths
- ✅ Location changes
- ✅ Conditions added/removed
- ✅ Party rests

All events saved to `auto_log.json` with timestamps.

## Usage

### Option 1: Game Engine (Recommended)
```bash
node game-engine.js <command> [args]
```

### Option 2: Party Manager Direct
```bash
node party_manager.js status
node party_manager.js spells
node party_manager.js log 20
```

### Option 3: In Code (JavaScript)
```javascript
const GameEngine = require('./game-engine.js');
const engine = new GameEngine();

// Cast spell (validates slots automatically)
engine.castSpell('Magic Missile', 1, 'mage', 'Orc');

// Damage/heal
engine.damage(5, 'Trap');
engine.heal(10, 'Potion');

// Combat
engine.startCombat(['Orc', 'Goblin']);
engine.damageEnemy(0, 8);  // Kill first enemy
engine.endCombat(150);

// Use innate ability
engine.useInnate('Darkness', '60\' radius');

// Movement
engine.moveTo('Throne Room', 'Ancient chamber');

// Rest (refreshes spells)
engine.rest(8);
```

### Legacy PartyManager (Direct)
```javascript
const PartyManager = require('./party_manager.js');
const pm = new PartyManager();

// Damage a character
pm.updateHP('malice_indarae_debarazzan', 5);

// Heal a character
pm.updateHP('malice_indarae_debarazzan', 6, true);

// Cast a spell (auto-validates)
pm.castSpell('malice_indarae_debarazzan', 'Magic Missile', 1, 'mage');

// Use innate ability
pm.useInnate('malice_indarae_debarazzan', 'Darkness');

// Check available spell slots
const slots = pm.getAvailableSpells('malice_indarae_debarazzan', 'mage', 1);
// Returns: 8 (doubled by Ring of Wizardry)

// Move party
pm.moveParty('tlaloc_chamber', 'Heart of the shrine');

// Start/end combat
pm.startCombat([
  { name: 'Priest of Tlaloc', hp: 30, ac: 6 },
  { name: 'Jaguar Guardian', hp: 45, ac: 4 }
]);
pm.endCombat(500);

// Get full status
pm.printStatus();

// View recent events
pm.printRecentEvents(10);
```

## Features

### ✅ Auto-Tracking (NEW)
Every game action is automatically logged:
- **Spell casts** — validated against available slots, logged with timestamp
- **HP changes** — damage/healing tracked with before/after values
- **Innate abilities** — daily use count tracked
- **Items** — acquisition and equipping logged
- **Combat** — start/end, rounds, enemy deaths, XP earned
- **Movement** — location changes with descriptions
- **Conditions** — added/removed with durations
- **Rest** — spell refresh, healing, innate reset

### Automatic Calculations
- Ring of Wizardry doubles Mage 1st level spells automatically
- HP cannot exceed max or go below 0
- Tracks spells cast per session
- Tracks innate abilities used per day
- Validates spell slots before allowing cast

### Multi-Character Support
- Add any number of PCs to `party.json`
- Each character has their own session state
- Shared party inventory and quest log
- Switch active character with `char <id>`

### Persistence
- All changes saved to JSON files instantly
- Session state preserved between encounters
- Auto-log persists complete event history
- Can resume exactly where you left off

### Combat Tracking
- Initiative order management
- Enemy HP tracking
- Round counter
- XP auto-calculation
- Enemy death detection

## Adding a New Character

1. Add to `party.json` members array
2. Add to `session_state.json` characters object
3. Create character file in `characters/` directory
4. Logger will auto-initialize on first use

## Schema

### party.json
```json
{
  "members": [{
    "character_id": "unique_id",
    "name": "Character Name",
    "class": "Fighter 5",
    "hp": { "max": 50, "current": 50 },
    "abilities": { "str": {"score": 16, "mod": 2}, ... },
    "active": true
  }],
  "npc_companions": [...],
  "quest_log": [...]
}
```

### session_state.json
```json
{
  "characters": {
    "character_id": {
      "hp_current": 50,
      "spells_cast": { "cleric": {}, "mage": {} },
      "innate_used": [],
      "conditions": []
    }
  },
  "combat": { "in_combat": false, ... },
  "discovered_areas": []
}
```

## Integration with Gameplay

### For the DM

**During gameplay, use the game-engine CLI:**
```bash
# Before casting, check spell availability
node game-engine.js spells

# Cast spell (auto-validates and logs)
node game-engine.js cast "Fireball" 3 mage "3 Orcs"

# When damage is dealt
node game-engine.js damage 8 "Orc spear"

# When healing happens
node game-engine.js heal 5 "Cure Light Wounds"

# Start combat
node game-engine.js combat-start "Lizardfolk Shaman,Lizardfolk x2"

# Track enemy damage
node game-engine.js damage-enemy 0 12  # Shaman takes 12 damage

# End combat with XP
node game-engine.js combat-end 450

# Move to new area
node game-engine.js move "Pool Chamber" "Underground cenote with crystal water"

# Check status anytime
node game-engine.js status

# Review what happened
node game-engine.js events 15
```

**In JavaScript code (for automation):**
```javascript
const GameEngine = require('./game-engine');
const engine = new GameEngine();

// Hook into your game flow
function onSpellCast(spell, level, caster) {
  engine.castSpell(spell, level, caster.class, caster.target);
}

function onDamageTaken(character, amount, source) {
  engine.setCharacter(character.id);
  engine.damage(amount, source);
}

function onCombatStart(enemies) {
  engine.startCombat(enemies);
}
```

### Key Principle
**Every action that changes state should go through the game-engine.** This ensures:
- ✅ No tracking errors
- ✅ No forgotten spell slots
- ✅ Complete event history
- ✅ Real-time validation
- ✅ Automatic logging
