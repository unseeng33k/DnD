# NPC & Character Manager

Track NPCs and party members with personalities, motivations, and relationships.

## Usage

```javascript
const NPCManager = require('./npc-manager');
const npcs = new NPCManager('Campaign Name');

// Create an NPC
npcs.create({
  name: 'Tomas',
  race: 'Human',
  occupation: 'Survivor',
  personality: 'Nervous but grateful',
  motivation: 'Escape the shrine and return home',
  secret: 'Knows about the cult but afraid to speak',
  attitude: 'friendly'
});

// Get NPC for roleplay
const tomas = npcs.get('Tomas');
console.log(tomas.speak('The cult... they come at night...'));
```

## Personality Traits

- **Friendly** - Helpful, open, trusting
- **Suspicious** - Wary, questioning, guarded
- **Hostile** - Aggressive, uncooperative, dangerous
- **Neutral** - Practical, self-interested, mercenary
- **Fearful** - Scared, desperate, easily manipulated
- **Arrogant** - Proud, dismissive, overconfident
- **Mysterious** - Secretive, cryptic, hidden agenda

## Voice Guidelines

Each NPC should have:
- Distinct speech pattern
- Mannerisms
- Knowledge they possess
- What they want from the party
- What they fear

## Integration

NPCs are loaded from campaign folder:
- `campaigns/<name>/npcs/<npc-name>.json`

During gameplay, reference the NPC file for consistent personality.
