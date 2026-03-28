# AD&D 1st Edition Player's Handbook Skill

Quick reference for player character creation, abilities, classes, equipment, and spells.

## Usage

```bash
# Search the PHB
node phb-skill.js search "strength"
node phb-skill.js search "THAC0"

# Get specific table
node phb-skill.js table strength
node phb-skill.js table "spell progression"

# Get class info
node phb-skill.js class fighter
node phb-skill.js class cleric

# Get equipment
node phb-skill.js equipment armor
node phb-skill.js equipment weapons
```

## Available Tables

- **Abilities**: strength, intelligence, wisdom, dexterity, constitution, charisma
- **Combat**: THAC0, saving-throws, attack-matrix
- **Classes**: class-requirements, spell-progression
- **Equipment**: armor, weapons, gear

## Available Classes

- cleric, druid, fighter, paladin, ranger
- magic-user, illusionist, thief, assassin, monk

## Integration

Use with the D&D Game Engine:

```javascript
const PHB = require('./phb-skill/phb-skill');
const phb = new PHB();

// Look up ability score during character creation
const strTable = phb.getTable('strength');

// Check class requirements
const canBePaladin = phb.checkClassRequirements(stats);
```
