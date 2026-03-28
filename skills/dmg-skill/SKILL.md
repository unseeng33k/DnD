# AD&D 1st Edition DMG Skill

Quick reference for Advanced Dungeons & Dragons 1st Edition rules from the Dungeon Master's Guide.

## Usage

```bash
# Search the DMG
node dmg-skill.js search "THAC0"
node dmg-skill.js search "saving throws"

# Get specific table
node dmg-skill.js table "strength"
node dmg-skill.js table "experience"

# Get rule section
node dmg-skill.js rule "combat"
node dmg-skill.js rule "magic"

# Quick reference
node dmg-skill.js ref "weapon damage"
node dmg-skill.js ref "treasure types"
```

## Available Commands

- `search <term>` — Search all DMG content
- `table <name>` — Display specific table (strength, intelligence, etc.)
- `rule <section>` — Show rule section (combat, magic, etc.)
- `ref <topic>` — Quick reference card
- `help` — Show all available topics

## Available Tables

- **Abilities**: strength, intelligence, wisdom, dexterity, constitution, charisma
- **Combat**: THAC0, saving-throws, weapon-damage, armor-class
- **Classes**: class-requirements, spell-progression
- **Races**: racial-abilities, racial-requirements
- **Experience**: xp-tables, xp-awards
- **Treasure**: treasure-types, gem-values, jewelry-values

## Available Rules

- **The Game**: dice, alignment, creating-characters
- **Combat**: combat-sequence, initiative, morale
- **Magic**: spell-components, spell-failure, memorization
- **Dungeon Mastering**: adventure-design, encounter-design, world-building
- **Treasure**: treasure-types, magic-items
- **Wilderness**: movement, getting-lost, weather

## Quick Reference Topics

- `conditions` — List of conditions and effects
- `movement` — Indoor/outdoor movement rates
- `light` — Light sources and duration
- `saves` — Saving throw categories
- `morale` — When to check morale
- `surprise` — Surprise rules

## Data Source

Based on the Advanced Dungeons & Dragons Dungeon Masters Guide (1st Edition) by Gary Gygax, published 1979 by TSR Games.

## Integration

Use with the D&D Game Engine for complete gameplay support:

```javascript
const DMG = require('./dmg-skill/dmg-skill');
const GameEngine = require('./game-engine');

const dmg = new DMG();
const engine = new GameEngine();

// Look up rule during play
const strengthTable = dmg.getTable('strength');

// Check if action is valid per rules
const canCast = dmg.checkSpellRequirements(spell, caster);
```
