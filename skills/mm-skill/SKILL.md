# AD&D 1st Edition Monster Manual Skill

Quick reference for monsters, their stats, and special abilities.

## Usage

```bash
# Search for a monster
node mm-skill.js search "dragon"
node mm-skill.js search "undead"

# Get specific monster
node mm-skill.js monster goblin
node mm-skill.js monster dragon

# List monsters by HD
node mm-skill.js hd 5
node mm-skill.js hd 8

# List monsters by type
node mm-skill.js type undead
node mm-skill.js type dragon
```

## Available Commands

- `search <term>` — Search all monsters
- `monster <name>` — Get specific monster stats
- `hd <number>` — List monsters by hit dice
- `type <type>` — List monsters by type (undead, dragon, giant, etc.)
- `ability <ability>` — Find monsters with specific ability (poison, regeneration, etc.)

## Monster Types

- **Undead**: Skeleton, Zombie, Ghoul, Wight, Wraith, Spectre, Vampire, Lich, Mummy
- **Dragons**: Black, Blue, Green, Red, White (by age category)
- **Giants**: Hill, Stone, Fire, Frost, Cloud, Storm
- **Humanoids**: Goblin, Orc, Hobgoblin, Gnoll, Bugbear, Kobold
- **Magical**: Basilisk, Cockatrice, Gorgon, Medusa, Chimera
- **Planar**: Demon, Devil, Invisible Stalker, Rakshasa

## Integration

Use with the D&D Game Engine:

```javascript
const MM = require('./mm-skill/mm-skill');
const mm = new MM();

// Look up monster during encounter
const goblinStats = mm.getMonster('goblin');

// Find appropriate challenge
const hd5Monsters = mm.getByHD(5);
```
