# D&D DM System

A complete AI-powered Dungeon Master system for AD&D 1st Edition / 3.5e hybrid play.

## Features

### 🎲 Core Systems
- **Character Creation** (`create-adnd1e.js`) — Full AD&D 1e with THAC0, exceptional strength, racial mins/maxs
- **Party Manager** (`game-engine.js`) — Auto-tracking HP, spells, combat, inventory with validation
- **Inventory Management** (`inventory.js`) — Auto-calculated AC, weight, encumbrance, currency conversion
- **Dice Roller** (`dice.js`) — All standard rolls, advantage/disadvantage, stat generation
- **Campaign Onboarding** (`onboard.js`) — 35 classic modules, interactive setup

### 🎭 DM Personality
- **Director Mode** — Cinematic descriptions, sensory details, pacing control
- **Learning System** (`learn.js`) — Tracks preferences, adapts to play style
- **Jock-turned-nerd persona** — 80s rock, opinions, actually knows the rules, always smoking

### 🎨 Visual System
- **Monster Reference** (`visual.js monster <name>`) — 16 classic monsters with AI prompts
- **Environment Mood Boards** (`visual.js env <name>`) — 5 settings with full sensory details
- **Battle Scene Generator** (`visual.js battle`) — AI prompts for combat moments
- **In-Game Image Generation** — Describe current room, get instant AI prompt
- **DALL-E Integration** (`dalle-images.js`) — Real-time image generation during gameplay

### 🎵 Soundtrack
- **Music Recommendations** (`music.js`) — Spotify/YouTube links by mood
- **Module-specific playlists** — Tomb of Horrors, Ravenloft, Tamoachan, etc.
- **Dynamic playlist building** — Exploration → tension → combat → victory

### 🤖 AI Integration
- **Gemini** (`gemini-images.js`) — Enhanced narration, NPC dialogue
- **DALL-E 3** — Image generation for rooms, monsters, battle scenes
- **OpenAI** — Advanced language processing for immersive descriptions

## Quick Start

```bash
# Create a character
node create-adnd1e.js

# Start a campaign
node onboard.js

# Check party status
node game-engine.js status

# Cast a spell (auto-validates slots)
node game-engine.js cast "Fireball" 3 mage "Orcs"

# Track damage/healing
node game-engine.js damage 8 "Trap"
node game-engine.js heal 10 "Potion"

# Combat tracking
node game-engine.js combat-start "Orc,Orc,Goblin"
node game-engine.js combat-end 150

# Check inventory
node inventory.js <character> sheet

# Get monster reference
node visual.js monster "umber hulk"

# Get music for your scene
node music.js exploration jungle

# Generate an image
node dalle-images.js "your scene description"

# After session, give feedback
node learn.js
```

## In-Game AI Image Generation

During play, ask:
- **"Show me this room"** → Generates image of current location
- **"What does the monster look like?"** → Visual reference + generated image
- **"Generate battle scene"** → Party vs enemies rendered in 1979 D&D art style

### Example Session:
```
DM: You stand at the entrance to the Hidden Shrine of Tamoachan...

Player: Show me this room

DM: [Generates image via DALL-E]
🎨 IMAGE: https://oaidalleapiprodscus.../img-xxx.png
   Ancient Olman temple entrance, vines crawling weathered stone,
   torchlight flickering, stairs descending into darkness
```

## Module Library (35 modules)

- **I-series:** Lizard King, Ravenloft, Forbidden City, Baltron's Beacon, Ravager of Time
- **S-series:** Tomb of Horrors, White Plume Mountain, Lost Caverns of Tsojcanth
- **GDQ:** Against the Giants, Vault of the Drow, Queen of the Demonweb Pits
- **T-series:** Temple of Elemental Evil
- **U-series:** Saltmarsh trilogy
- **UK-series:** 1-6 (Crystal Cave to All That Glitters)
- **WG-series:** Tharizdun, Mordenkainen, Isle of the Ape
- **N-series:** Cult of Reptile God, Forest Oracle, Destiny of Kings
- **Plus:** L-series, R-series, C-series, B-series, 3e starters

## File Structure

```
dnd/
├── README.md              # This file
├── SOUL.md               # DM personality & philosophy
├── DM_DIRECTOR.md        # Cinematic narration guide
├── DM_PERSONA.md         # Detailed DM character
├── LEARNING.md           # Learning system documentation
├── VISUAL.md             # Visual system documentation
├── MUSIC.md              # Soundtrack documentation
├── PARTY_SYSTEM.md       # Party management documentation
├── .gitignore            # Secrets and OS files excluded
├── onboard.js            # Campaign setup
├── create-adnd1e.js      # AD&D 1e character creator
├── create-character.js   # 3.5e character creator
├── game-engine.js        # Main DM interface (auto-tracking)
├── party_manager.js      # Party state management
├── party.json            # Character sheets & party data
├── session_state.json    # Current session state
├── auto_log.json         # Auto-generated event log
├── inventory.js          # Inventory & equipment manager
├── inventory-system.json # Inventory data structure
├── logger.js             # Character action logger
├── dice.js               # Dice roller
├── learn.js              # Post-session feedback system
├── visual.js             # Monster/room/battle references
├── music.js              # Music recommendations
├── dalle-images.js       # DALL-E image generation
├── gemini-images.js      # Gemini integration
├── campaign.json         # Current campaign state
├── log.md                # Session log
├── learning-system.json  # Player preference data
├── feedback.md           # Session feedback log
├── characters/           # Character JSON files
└── api-keys.md           # API keys (gitignored)
```

## API Keys Setup

Copy `api-keys.md.example` to `api-keys.md` and add your keys:

```markdown
## AGENCY — OpenAI (DALL-E)
sk-your-dalle-key-here

## AGENCY — Gemini
AIzaSy-your-gemini-key-here
```

**Note:** `api-keys.md` is in `.gitignore` — your keys stay local and safe.

## Party Management (Auto-Tracking)

The `game-engine.js` provides automatic tracking for all game actions:

```bash
# View party status with HP bars and spell slots
node game-engine.js status

# Cast spells (validates available slots)
node game-engine.js cast "Magic Missile" 1 mage "Target"

# Track HP changes
node game-engine.js damage 10 "Orc attack"
node game-engine.js heal 8 "Cure Light Wounds"

# Combat management
node game-engine.js combat-start "Lizardfolk Shaman,Lizardfolk x2"
node game-engine.js damage-enemy 0 12    # Damage enemy index 0
node game-engine.js combat-end 450       # End combat, award XP

# Movement and rest
node game-engine.js move "Throne Room" "Ancient stone chamber"
node game-engine.js rest 8               # Refreshes spells

# Review session events
node game-engine.js events 20
```

**Auto-tracked events:** Spell casts, HP changes, innate abilities, items, combat, movement, conditions. All saved to `auto_log.json`.

See `PARTY_SYSTEM.md` for full documentation.

## Requirements

- Node.js 14+
- No external dependencies (pure Node.js)
- API keys for image generation features (optional)

## License

MIT — Roll dice and have fun.

---

*"Roll for initiative, nerds!"* 🎲🎸🍺

*DM is smoking a cigarette while describing your impending doom.*
