# Session Ambiance Orchestrator - Level 3 Integration Guide

## What This Is

A **unified master system** that coordinates everything:

- **Ambiance Agent** (scenes, moods, sensory data)
- **Image Handler** (DALLE generation, caching, persistence)
- **Session Runner** (campaign tracking)
- **Telegram Bot** (real-time delivery)

One system. One workflow. Everything wired together.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│   SessionAmbiance Orchestrator (Master)             │
├─────────────────────────────────────────────────────┤
│                                                       │
│  PHASE 1: PRE-SESSION PREP                          │
│  ├─ Load locations                                  │
│  ├─ For each location:                              │
│  │  ├─ Generate image (cached)                      │
│  │  ├─ Build caption (mood + sensory + music)       │
│  │  ├─ Send to Telegram                             │
│  │  └─ Save to HTML guide                           │
│  └─ Generate HTML prep guide                        │
│                                                       │
│  PHASE 2: DURING GAMEPLAY                           │
│  ├─ Load scene                                      │
│  ├─ Get cached image                                │
│  ├─ Send to Telegram with rich caption              │
│  ├─ Track in session state                          │
│  └─ Return sensory summary for DM                   │
│                                                       │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
   Image Handler                  Ambiance Agent
   (persistence)                  (context)
         ↓                              ↓
   Telegram Bot                   HTML Guide
   (delivery)                      (prep)
```

---

## Usage

### Pre-Session Prep (One Command)

```javascript
import { SessionAmbiance } from './session-ambiance-orchestrator.js';

const session = new SessionAmbiance(
  'Curse of Strahd',           // Campaign name
  '123456789'                  // Telegram chat ID (optional)
);

const locations = [
  { name: 'Castle Entrance', scene: 'ancient temple' },
  { name: 'Dark Forest', scene: 'dark forest' },
  { name: 'Underground Caves', scene: 'underground cavern' },
  { name: 'Safe Haven Tavern', scene: 'tavern' },
  { name: 'Final Boss', scene: 'boss battle' }
];

// ONE LINE: Generates images + builds HTML + sends to Telegram
const result = await session.prepSession(locations);

console.log(result);
// {
//   success: true,
//   locations: 5,
//   images: 5,
//   guideFile: '/path/to/Curse_of_Strahd_guide.html'
// }
```

**What happens:**
- Generates images for all locations (uses cache if available)
- Pre-loads to Telegram (so images are there when session starts)
- Builds rich captions with mood, sensory data, music links
- Generates HTML guide with persistent images
- Saves session state

---

### During Gameplay

```javascript
// Start a scene
const sceneResult = await session.startScene('ancient temple');

// Returns:
// {
//   success: true,
//   scene: "Ancient Temple",
//   imageFile: "/path/to/image.png",
//   sensorySummary: "...full sensory description...",
//   musicLink: "https://youtube.com/...",
//   musicTitle: "Ancient Temple Ambiance"
// }

// Print sensory summary for DM
console.log(sceneResult.sensorySummary);

// Image is already in Telegram chat
// Music link ready to click
```

**What happens:**
- Loads scene from library
- Gets cached image (or generates if new)
- Sends to Telegram with caption
- Returns sensory summary for DM to read
- Tracks in session history

---

## Scenes Available

Built-in scenes:
- `ancient temple` - Mysterious ruins, flickering torchlight
- `dark forest` - Foreboding woods, dappled moonlight
- `underground cavern` - Claustrophobic caves, bioluminescence
- `tavern` - Warm, cozy, firelight
- `boss battle` - Epic confrontation, dramatic lighting

Add more in `SceneLibrary.constructor()`:
```javascript
this.scenes['your-scene'] = {
  name: 'Your Scene Name',
  imagePrompt: '...',
  mood: 'calm',
  lighting: '...',
  sounds: '...',
  smells: '...',
  temperature: '...',
  textures: '...',
  musicLink: 'https://youtube.com/...',
  musicTitle: 'Music Title'
};
```

---

## HTML Guide Output

After `prepSession()`, opens `Curse_of_Strahd_guide.html` with:

- **Scene cards** with cached images (no expired URLs!)
- **Mood badge** for each location
- **Sensory details** (sounds, smells, temperature, textures)
- **Music links** (click to play on YouTube)
- **Full image links** (click to enlarge)

Everything in one place. No broken links. All local images.

---

## Session State

Automatically saved to `{campaign}_state.json`:

```json
{
  "campaign": "Curse of Strahd",
  "startedAt": "2026-03-28T...",
  "scenes": [
    { "name": "Castle Entrance", "scene": "ancient temple" },
    ...
  ],
  "images": [
    { "location": "Castle Entrance", "filepath": "...", "timestamp": "..." },
    ...
  ],
  "lastScene": {
    "name": "Castle Entrance",
    "startedAt": "...",
    "imagePath": "..."
  }
}
```

Lets you:
- Track which scenes were prepped
- See which images were generated
- Know what scene was last played
- Rebuild the session later

---

## CLI Usage

```bash
# Prep session with Telegram send
TELEGRAM_CHAT_ID=123456789 node session-ambiance-orchestrator.js "Curse of Strahd"

# Prep without Telegram (just generate images + HTML)
node session-ambiance-orchestrator.js "Curse of Strahd"
```

---

## Integration with Game Engine

```javascript
// In your game-engine.js
import { SessionAmbiance } from './session-ambiance-orchestrator.js';

class GameEngine {
  constructor() {
    this.session = new SessionAmbiance('Curse of Strahd', TELEGRAM_CHAT_ID);
  }

  async loadCampaign(sessionNum) {
    // Pre-session: Load and prep entire session
    const locations = this.loadSessionLocations(sessionNum);
    await this.session.prepSession(locations);
  }

  async enterScene(sceneKey) {
    // Runtime: Load scene + send to Telegram
    const result = await this.session.startScene(sceneKey);
    
    // Use sensory summary
    this.narrate(result.sensorySummary);
    
    // Play music
    this.playMusic(result.musicLink);
  }
}
```

---

## What Gets Built

After running `prepSession()`:

```
session_assets/
├── Curse_of_Strahd_guide.html      ← Open this in browser
└── Curse_of_Strahd_state.json      ← Session history

images/
└── generated/
    ├── dalle-abc123-1234567890.png  ← Cached images
    ├── dalle-def456-1234567891.png
    ├── dalle-ghi789-1234567892.png
    └── image-cache.json             ← Cache index
```

---

## Workflow

### Before Session

```bash
# 1. Set up
export OPENAI_API_KEY="sk-proj-..."
export TELEGRAM_CHAT_ID="123456789"

# 2. Prep everything
node session-ambiance-orchestrator.js "Curse of Strahd"

# 3. Wait for images to generate (~30-60 seconds per image)
# 4. Open HTML guide in browser
# 5. Check Telegram - all images should be there
```

### During Session

```javascript
// Load first scene
await session.startScene('ancient temple');

// Image appears in Telegram immediately
// Sensory summary returned for DM
// Music link provided
```

---

## Benefits vs. Old System

| Feature | Before | After |
|---------|--------|-------|
| Image persistence | URLs expire | Local files, never expire |
| Pre-session | Generate on-demand | All pre-generated, pre-loaded to Telegram |
| During gameplay | Manual image search | Images already in chat |
| Ambiance context | Lost between sessions | Tracked & saved |
| Music links | Text descriptions | Clickable YouTube links |
| HTML guide | Broken image links | All persistent images |
| Session tracking | No history | Full state saved |

---

## Performance

| Operation | Time |
|-----------|------|
| Generate single image | 30-60 seconds |
| Pre-session (5 locations) | 2-5 minutes (cached after) |
| Start scene (cached) | <1 second |
| Telegram send | 2-5 seconds |
| HTML generation | <1 second |

First prep is slow. Every subsequent prep is instant (cached images).

---

## Customization

### Add Custom Scenes

```javascript
// In SceneLibrary constructor
this.scenes['throne room'] = {
  name: 'Grand Throne Room',
  imagePrompt: 'A vast circular chamber with a high vaulted ceiling, columns supporting stone arches, a massive throne at the far end on steps, guards flanking...',
  mood: 'intimidating',
  lighting: '...',
  sounds: '...',
  smells: '...',
  temperature: '...',
  textures: '...',
  musicLink: 'https://youtube.com/...',
  musicTitle: 'Throne Room Ambiance'
};
```

### Modify Captions

Edit `buildCaption()` method to change how Telegram captions are formatted.

### Custom HTML Styling

Edit the HTML template in `generateHTMLGuide()` to match your aesthetics.

---

## Troubleshooting

### Images not generating
```bash
node diagnose-images.js
# Check OPENAI_API_KEY
```

### Not sending to Telegram
```bash
TELEGRAM_CHAT_ID=123456789 node session-ambiance-orchestrator.js "Test"
# Check chat ID from @userinfobot
```

### HTML guide broken images
- Check `images/generated/` has files
- Check `image-cache.json` has entries
- Try: `rm images/image-cache.json && npm install`

---

## Next Steps

1. **Set environment variables**
2. **Run prep**: `node session-ambiance-orchestrator.js "Your Campaign"`
3. **Open HTML guide** in browser
4. **Check Telegram** for images
5. **Integrate into game engine**
6. **Add custom scenes** as needed

---

**Status**: ✅ Production Ready
**Integration**: Level 3 (Unified)
**Deploy**: Ready now

🎭 Your D&D experience is now unified, persistent, and Telegram-ready.
