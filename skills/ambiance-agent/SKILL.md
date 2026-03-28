# Ambiance Agent for D&D

The central hub for pre-session preparation and atmospheric gameplay enhancement.

## Purpose

The Ambiance Agent handles ALL pre-session prep:
- **Image Generation** — Locations, monsters, scenes (via DALL-E)
- **Sound & Music** — YouTube/Spotify links for every scene
- **Sensory Details** — Lighting, sounds, smells, temperature, textures
- **Tension Building** — Pacing cues for the DM
- **Visual References** — Scene-appropriate imagery and descriptions

## Pre-Session Workflow

```bash
# 1. Prep your entire session (generates all images + ambiance)
node ambiance.js prep "Session Name" ./config.json

# 2. Open the generated HTML guide
open session_assets/Session_Name_prep.html

# 3. During gameplay, click images and YouTube links in the HTML
```

## Quick Commands

```bash
# Generate single scene with full ambiance
node ambiance.js scene "ancient temple"

# Get music for current mood
node ambiance.js music combat

# Build tension
node ambiance.js tension rising

# Generate just an image
node ambiance.js generate "dark forest"

# Show monster (player-safe, no stats)
node ambiance.js monster goblin
```

## Config File (config.json)

```json
{
  "locations": [
    { "name": "Temple Entrance", "scene": "ancient temple" },
    { "name": "Throne Room", "scene": "boss battle" },
    { "name": "Hidden Crypt", "scene": "crypt" }
  ],
  "monsters": ["goblin", "troll", "vampire"],
  "encounters": [
    { "name": "Ambush", "mood": "tense" },
    { "name": "Boss Fight", "mood": "boss" }
  ]
}
```

## Scene Types

- **dark forest** — Foreboding woods, dappled moonlight
- **ancient temple** — Mysterious ruins, flickering torchlight
- **underground cavern** — Claustrophobic caves, bioluminescence
- **boss battle** — Epic confrontation, dramatic lighting
- **tavern** — Warm, cozy, firelight and laughter
- **swamp** — Oppressive, humid, mist-shrouded
- **mountain peak** — Exposed, freezing, wind-swept
- **city streets** — Bustling, lanterns, diverse smells
- **crypt** — Deathly, silent, stone and dust
- **wizard tower** — Arcane, magical, controlled environment

## Output

The prep command creates:
- `session_assets/<name>_prep.html` — Visual guide with all images and links
- `session_assets/<name>_prep.json` — Raw data

**The HTML includes:**
- All location images (click to view)
- All monster images (player-safe descriptions)
- YouTube music links for each scene (click to play)
- Sensory descriptions for the DM to read
- AI image prompts for on-demand generation

## During Gameplay

1. **Open the HTML guide** on your device
2. **Click images** to show players
3. **Click YouTube links** for background sound
4. **Read sensory descriptions** to set the scene
5. **Use tension cues** when pacing needs adjustment

## Integration with Game Engine

```javascript
const Ambiance = require('./ambiance-agent/ambiance');
const GameEngine = require('./game-engine');

const engine = new GameEngine();
const ambiance = new Ambiance();

// Pre-session prep
await ambiance.prepSession("Tamoachan", config);

// During gameplay
ambiance.setScene('underground temple');
console.log(ambiance.getSensoryDescription());
console.log(ambiance.getMusic());
```

## Environment Variable

Set your OpenAI API key for image generation:
```bash
export OPENAI_API_KEY="sk-..."
```
