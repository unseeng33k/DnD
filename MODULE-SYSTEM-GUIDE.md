# MODULE & ADVENTURE SYSTEM - COMPLETE GUIDE

## HOW THE SYSTEM NOW HANDLES MODULES

Before: Hardcoded parties, generic scenes, no differentiation between campaigns
After: Full modular system with complete adventure definitions

---

## MODULE ARCHITECTURE

```
modules/
├── curse-of-strahd/
│   ├── metadata.json          # Module info (name, level, duration)
│   ├── party.json             # Pre-configured party template
│   ├── locations/
│   │   ├── castle-ravenloft.json
│   │   ├── village-barovia.json
│   │   └── ... more locations
│   ├── encounters/
│   │   ├── strahd-throne-room.json
│   │   ├── vampire-spawn-lair.json
│   │   └── ... more encounters
│   └── npcs/
│       ├── strahd-von-zarovich.json
│       ├── ireena-kolyana.json
│       └── ... more NPCs
│
├── lost-shrine-tamoachan/
│   ├── metadata.json
│   ├── party.json
│   ├── locations/
│   ├── encounters/
│   └── npcs/
│
└── [any other module]
    ├── metadata.json
    ├── party.json
    ├── locations/
    ├── encounters/
    └── npcs/
```

---

## METADATA.JSON - Module Definition

Defines the entire adventure structure:

```json
{
  "id": "curse-of-strahd",
  "name": "Curse of Strahd",
  "description": "A gothic horror adventure...",
  "level": [3, 10],           // Recommended levels
  "length": "long",           // short, medium, long
  "setting": "Barovia...",
  "themes": ["gothic", "horror", "supernatural"],
  "ruleSet": "AD&D 1e",
  "partySize": [4, 6],
  "estimatedPlayTime": "50-75 sessions"
}
```

---

## PARTY.JSON - Pre-configured Party

Complete party template with all characters, abilities, spells, and story context:

```json
{
  "moduleId": "curse-of-strahd",
  "name": "Curse of Strahd Recommended Party",
  "difficulty": "medium",
  "story": "Why they're together and their motivation",
  "members": [
    {
      "name": "Malice Indarae De'Barazzan",
      "class": "Rogue",
      "level": 3,
      "hp": 24,
      "maxHP": 24,
      "ac": 15,
      "spellSlots": {},
      "hitDice": { "d8": 3 },
      "abilities": ["Sneak Attack", "Cunning Action"],
      "alignment": "Chaotic Good"
    },
    ...more members
  ]
}
```

The system automatically instantiates this party when you start a session.

---

## LOCATIONS - Module Locations with Full Context

Each location file (castle-ravenloft.json) defines:

```json
{
  "id": "castle-ravenloft",
  "name": "Castle Ravenloft",
  "description": "Long description of the location",
  "type": "dungeon|town|wilderness|npc-lair",
  "level": 4,                          // Dungeon level if applicable
  "encounters": ["encounter-id1", "encounter-id2"],  // Available encounters
  "npcs": ["npc-id1", "npc-id2"],      // NPCs at this location
  "connections": ["location-id1"],     // Connected locations
  "atmosphere": "Sensory description for ambiance",
  "music": "YouTube music link",
  "secrets": ["Hidden thing 1", "Hidden thing 2"]
}
```

When you load a location, the system automatically:
- ✅ Lists all NPCs present
- ✅ Lists all available encounters
- ✅ Shows atmospheric description
- ✅ Provides music link
- ✅ Reveals secrets (optionally)

---

## ENCOUNTERS - Pre-defined Combat

Each encounter file (strahd-throne-room.json) defines:

```json
{
  "id": "strahd-throne-room",
  "name": "Strahd's Throne Room",
  "locationId": "castle-ravenloft",
  "difficulty": "trivial|easy|medium|hard|deadly",
  "enemies": [
    {
      "name": "Strahd von Zarovich",
      "type": "Vampire Lord",
      "hp": 144,
      "ac": 16,
      "damage": "2d6+4"
    },
    ...more enemies
  ],
  "objectives": ["Defeat Strahd", "Claim the Heart of Sorrow"],
  "rewards": {
    "xp": 10000,
    "gold": 5000,
    "treasure": ["Ring of Protection", "Longsword +2"]
  },
  "special": "Strahd can move through walls. Special mechanics..."
}
```

When you start an encounter, the system automatically:
- ✅ Loads all enemy stats
- ✅ Calculates difficulty
- ✅ Sets up combat tracking
- ✅ Logs encounter details
- ✅ Prepares rewards

---

## NPCs - Named Characters with Personalities

Each NPC file (strahd-von-zarovich.json) defines:

```json
{
  "id": "strahd-von-zarovich",
  "name": "Strahd von Zarovich",
  "role": "villain|ally|neutral|quest-giver",
  "alignment": "Lawful Evil",
  "class": "Vampire Lord",
  "level": 20,
  "personality": "Describes their temperament and behavior",
  "motives": ["What they want", "What drives them"],
  "plot_hooks": [
    "How to involve in story",
    "Story implications",
    "Consequence if betrayed"
  ],
  "stat_block": {
    "hp": 144,
    "ac": 16,
    ...stats
  }
}
```

When you interact with an NPC, the system:
- ✅ Shows their role and alignment
- ✅ Suggests plot hooks
- ✅ Tracks reputation changes
- ✅ Remembers all interactions
- ✅ Shows consequences of player actions

---

## HOW TO USE - WORKFLOW

### 1. List Available Modules

```javascript
const registry = new ModuleRegistry();
const modules = registry.list();
// Returns all modules in modules/ directory
```

### 2. Load a Module

```javascript
import { GameMasterOrchestrator } from './game-master-orchestrator-v2.js';

const gm = new GameMasterOrchestrator('curse-of-strahd');
await gm.loadModule();

// Output:
// MODULE LOADED: Curse of Strahd
// A gothic horror adventure...
// Recommended Levels: 3-10
// Duration: long
// Locations: 8
// Encounters: 24
// NPCs: 12
```

### 3. Start a Session with Module Party

```javascript
await gm.startSession(1);  // Session 1, uses module's pre-configured party

// Output:
// SESSION 1
// ✅ Party: Malice, Grond, Theron, Sylvara
// ✅ Memory System: READY
// ✅ Combat Engine: READY
// ... all systems
```

### 4. Load a Location from Module

```javascript
await gm.loadScene('castle-ravenloft', 'You approach the gates...');

// Output:
// 📍 Castle Ravenloft
// Ancient stone walls drip with moisture...
// 🎭 NPCs here: Strahd von Zarovich, Rahadin, Vampire Brides
// ⚔️  Possible encounters: Strahd's Throne Room, Vampire Spawn Lair
// 🎵 Music: [YouTube link]
```

### 5. Start an Encounter from Module

```javascript
await gm.startEncounter('strahd-throne-room');

// Output:
// ⚔️  Strahd's Throne Room
// 📊 Difficulty: deadly
// 🎯 Objectives: Defeat Strahd, Claim Heart of Sorrow
// Turn order: Grond → Strahd → Malice...
```

### 6. Interact with Module NPC

```javascript
gm.interactNPC('strahd-von-zarovich', 'Offers the party a deal');

// Output:
// 🎭 Strahd von Zarovich (villain): Offers the party a deal
// [System logs interaction, tracks reputation, records consequences]
```

### 7. End Session - Full Context Preserved

```javascript
await gm.endSession();

// Saves everything:
// - Session timeline
// - NPC interactions
// - Consequences triggered
// - Party state
// - Decisions made
// - Combat encounters
// - Locations visited
```

### 8. Start Session 2 - Continuity Restored

```javascript
await gm.startSession(2);

// 📚 Previous session summary:
// Last location: Castle Ravenloft
// Party status: Malice (24/24 HP), Grond (15/28 HP)
// Unresolved: Strahd's threat, Ireena's safety
```

---

## COMMAND WORKFLOW

```bash
# Start session with module
node start-session-v2.js "curse-of-strahd" 1

GM> loadscene castle-ravenloft
   # Shows location, NPCs, encounters, music

GM> encounter strahd-throne-room
   # Starts combat with full Strahd stats

GM> npc strahd-von-zarovich "Mocks the party"
   # Tracks interaction, faction reputation

GM> end
   # Saves entire session with module context
```

---

## WHAT'S NOW AUTOMATIC

When you load a **Curse of Strahd** module:

✅ All 12+ locations load with full descriptions
✅ All 24+ encounters load with stats and rewards
✅ All NPCs load with personalities and motives
✅ Party is auto-configured for this module
✅ Story context is preserved session-to-session
✅ Locations remember what happened there
✅ NPCs remember interactions with players
✅ Encounters scale to party level
✅ Consequences trigger based on NPC relationships
✅ Secrets can be discovered and tracked

---

## ADDING YOUR OWN MODULES

1. Create directory: `modules/your-module-id/`

2. Create `metadata.json`:
```json
{
  "id": "your-module-id",
  "name": "Your Module Name",
  "description": "...",
  "level": [1, 5],
  "length": "short"
}
```

3. Create `party.json` with your pre-configured party

4. Create `locations/*.json` for each location
5. Create `encounters/*.json` for each encounter
6. Create `npcs/*.json` for each NPC

7. Load it:
```javascript
const gm = new GameMasterOrchestrator('your-module-id');
await gm.loadModule();
```

---

## STATUS

✅ Module system working
✅ Full Curse of Strahd module loaded
✅ Party templates configured
✅ Locations defined (Castle Ravenloft, Village Barovia)
✅ Encounters defined (Strahd's Throne Room, etc)
✅ NPCs defined (Strahd, Ireena, etc)
✅ Session continuity preserved
✅ Campaign persistence working

**Ready to add more modules or expand existing ones.** 🎭✨
