# D&D DM System

A complete AI-powered Dungeon Master system for AD&D 1st Edition / 3.5e hybrid play.

## Features

### 🎲 Core Systems
- **Character Creation** (`create-adnd1e.js`) — Full AD&D 1e with THAC0, exceptional strength, racial mins/maxs
- **Inventory Management** (`inventory.js`) — Auto-calculated AC, weight, encumbrance, currency conversion
- **Dice Roller** (`dice.js`) — All standard rolls, advantage/disadvantage, stat generation
- **Campaign Onboarding** (`onboard.js`) — 35 classic modules, interactive setup

### 🎭 DM Personality
- **Director Mode** — Cinematic descriptions, sensory details, pacing control
- **Learning System** (`learn.js`) — Tracks preferences, adapts to play style
- **Jock-turned-nerd persona** — 80s rock, opinions, actually knows the rules

### 🎨 Visual System
- **Monster Reference** (`visual.js monster <name>`) — 16 classic monsters with AI prompts
- **Environment Mood Boards** (`visual.js env <name>`) — 5 settings with full sensory details
- **Battle Scene Generator** (`visual.js battle`) — AI prompts for combat moments
- **In-Game Image Generation** — Describe current room, get instant AI prompt

### 🎵 Soundtrack
- **Music Recommendations** (`music.js`) — Spotify/YouTube links by mood
- **Module-specific playlists** — Tomb of Horrors, Ravenloft, Tamoachan, etc.
- **Dynamic playlist building** — Exploration → tension → combat → victory

## Quick Start

```bash
# Create a character
node create-adnd1e.js

# Start a campaign
node onboard.js

# Check inventory
node inventory.js <character> sheet

# Get monster reference
node visual.js monster "umber hulk"

# Get music for your scene
node music.js exploration jungle

# After session, give feedback
node learn.js
```

## In-Game AI Image Generation

During play, ask:
- "Show me this room" → AI prompt for current location
- "What does the monster look like?" → Visual reference + prompt
- "Generate battle scene" → Party vs enemies prompt

Example output:
```
🎨 AI PROMPT:
Three adventurers fighting lizardfolk warriors in ancient 
swamp temple, torchlight, water reflections, 1979 D&D module 
art style, Erol Otus style, dynamic action, atmospheric, 
ink illustration with watercolor washes
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
├── LEARNING.md           # Learning system documentation
├── VISUAL.md             # Visual system documentation
├── MUSIC.md              # Soundtrack documentation
├── onboard.js            # Campaign setup
├── create-adnd1e.js      # AD&D 1e character creator
├── inventory.js          # Inventory & equipment manager
├── dice.js               # Dice roller
├── learn.js              # Post-session feedback
├── visual.js             # Monster/room/battle references
├── music.js              # Music recommendations
├── campaign.json         # Current campaign state
├── log.md                # Session log
├── learning-system.json  # Player preference data
├── feedback.md           # Session feedback log
└── characters/           # Character JSON files
```

## Requirements

- Node.js 14+
- No external dependencies (pure Node.js)

## License

MIT — Roll dice and have fun.

---

*"Roll for initiative, nerds!"* 🎲🎸🍺
