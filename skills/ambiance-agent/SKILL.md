# Ambiance Agent for D&D

An agent that runs alongside the DM to build atmosphere and sensory immersion during gameplay.

## Purpose

The Ambiance Agent enhances the gaming experience by providing:
- **Sensory descriptions** — Smells, sounds, lighting, temperature
- **Music recommendations** — Spotify/YouTube links by mood
- **Weather and environment** — Dynamic conditions
- **Tension building** — Pacing cues for the DM
- **Visual references** — Scene-appropriate imagery

## Usage

```bash
# Start ambiance for a scene
node ambiance.js scene "dark forest"
node ambiance.js scene "boss battle"
node ambiance.js scene "ancient temple"

# Get music for current mood
node ambiance.js music tense
node ambiance.js music combat
node ambiance.js music exploration

# Generate sensory details
node ambiance.js sense "underground cavern"

# Build tension
node ambiance.js tension rising
node ambiance.js tension peak
```

## Scene Types

- **exploration** — Discovery, wonder, caution
- **combat** — Action, danger, adrenaline
- **tense** — Suspense, dread, anticipation
- **social** — NPC interaction, diplomacy
- **rest** — Safety, recovery, planning
- **boss** — Epic, climactic, dangerous

## Integration

The Ambiance Agent works with the Game Engine:

```javascript
const Ambiance = require('./ambiance-agent/ambiance');
const GameEngine = require('./game-engine');

const engine = new GameEngine();
const ambiance = new Ambiance();

// When party enters new area
ambiance.setScene('underground temple', {
  lighting: 'torchlight',
  sounds: 'dripping water, distant drums',
  smell: 'incense and decay'
});

// During combat
ambiance.setMood('combat');
console.log(ambiance.getMusic());
```
