# D&D Telegram Image System - Complete Integration Guide

## Overview

This system generates DALLE-3 images for your D&D campaigns and sends them directly to your Telegram bot. It includes:

- ✅ **Automated image generation** - DALLE-3 styled for 1979 D&D
- ✅ **Local caching** - No expired URLs, images persist
- ✅ **Telegram integration** - Images appear in your chat automatically
- ✅ **Session management** - Track images with campaign sessions
- ✅ **CLI tools** - Generate images from command line
- ✅ **Game engine integration** - Hook into your game loop

---

## Installation

### 1. Install Dependencies
```bash
cd /Users/mpruskowski/.openclaw/workspace/dnd
npm install
```

### 2. Set Environment Variables
```bash
export OPENAI_API_KEY="sk-proj-..."  # Get from https://platform.openai.com/api-keys
export TELEGRAM_CHAT_ID="123456789"  # Get from @userinfobot on Telegram
```

### 3. Configure (Optional)
Edit `dnd-config.json` to set your Telegram chat ID permanently:
```json
{
  "telegram": {
    "chatId": "123456789"
  }
}
```

---

## Quick Start

### Test Image Generation (No Telegram)
```bash
node image-handler.js "A dragon in a stone chamber"
```

### Send Image to Telegram
```bash
TELEGRAM_CHAT_ID=123456789 node image-handler.js "An ancient library"
```

### Run Full Diagnostic
```bash
node diagnose-images.js
```

---

## Usage Examples

### Option 1: Direct CLI Tool

```bash
# Generate a room
node dnd-images-cli.js room "Grand throne room" "dusty, candlelit" "dim torchlight"

# Generate a monster
node dnd-images-cli.js monster "Beholder" "floating orb with eye stalks" "ancient ruins"

# Generate a battle scene
node dnd-images-cli.js battle "4 adventurers" "frost dragon and dragonlings" "frozen temple" "magic missiles clash"

# Custom prompt
node dnd-images-cli.js custom "A wizard casting fireball in a dark cave" --caption "Magic incoming"
```

### Option 2: Programmatic Use

```javascript
import { generateRoomImage, generateMonsterImage, generateBattleImage } from './image-handler.js';

const CHAT_ID = '123456789'; // Your Telegram chat ID

// Generate a scene
const roomResult = await generateRoomImage(
  'Ancient library with dusty tomes',
  CHAT_ID,
  'candlelit, stone columns',
  'soft torchlight'
);

if (roomResult.success) {
  console.log('Image sent! File:', roomResult.filepath);
}

// Generate an encounter
const monsterResult = await generateMonsterImage(
  'Beholder',
  CHAT_ID,
  'floating orb with eye stalks',
  'ancient ruins'
);

// Generate a battle
const battleResult = await generateBattleImage(
  'Your party of 4',
  CHAT_ID,
  'ancient frost dragon',
  'frozen temple',
  'claws and magic missiles clash'
);
```

### Option 3: Session-Based Integration

```javascript
import { DndSessionRunner } from './session-runner.js';

const CHAT_ID = '123456789';
const runner = new DndSessionRunner('Curse of Strahd', CHAT_ID);

// Load a session
await runner.loadSession(5);

// Start a scene with an image
await runner.startScene(
  'The walls of Castle Ravenloft loom before you',
  'gothic, imposing',
  'moonlit, ominous'
);

// Encounter
await runner.startEncounter(
  'Strahd von Zarovich',
  'vampire lord, pale skin, red eyes',
  'castle throne room'
);

// Combat
await runner.startBattle(
  'Your party of 4 heroes',
  'Strahd and his vampire brides',
  'grand castle courtyard',
  'blades clash, spells fly'
);

// Save everything
runner.saveSessionState();
```

### Option 4: Game Engine Integration

```javascript
// In your game-engine.js or simple-dnd.js
import { DndSessionRunner } from './session-runner.js';

class GameEngine {
  constructor() {
    this.runner = new DndSessionRunner(
      'Curse of Strahd',
      process.env.TELEGRAM_CHAT_ID
    );
  }

  async loadCampaignSession(sessionNum) {
    const session = await this.runner.loadSession(sessionNum);
    if (session.success) {
      // Generate opening scene image
      await this.runner.startScene(
        session.session.opening_description,
        'dramatic, atmospheric',
        'candlelit'
      );
    }
  }

  async encounterMonster(monsterData) {
    // When party encounters a monster
    await this.runner.startEncounter(
      monsterData.name,
      monsterData.description,
      this.currentLocation
    );
  }

  async startCombat(enemies) {
    await this.runner.startBattle(
      'Your party',
      enemies.join(' and '),
      this.currentLocation,
      'initiative rolls!'
    );
  }
}
```

---

## File Structure

```
dnd/
├── image-handler.js           ← Core image generation
├── session-runner.js          ← Session & campaign integration
├── dnd-images-cli.js          ← Command-line interface
├── diagnose-images.js         ← Diagnostic tool
├── setup-images.sh            ← Installation script
├── dnd-config.json            ← Configuration (chat ID, settings)
├── package.json               ← Dependencies
├── images/
│   ├── generated/             ← Downloaded images (persistent)
│   ├── image-cache.json       ← Cache index (no duplicates)
│   └── tamoachan/             ← Existing images
└── campaigns/
    ├── Curse of Strahd/
    │   └── sessions/
    └── Tamoachan Expedition/
        └── sessions/
```

---

## Configuration Reference

### Environment Variables
```bash
OPENAI_API_KEY         # Required: Your OpenAI API key
TELEGRAM_CHAT_ID       # Optional: Your Telegram chat ID (override config)
TELEGRAM_BOT_TOKEN     # Optional: Custom bot token (defaults to @PruskowskiBot)
```

### dnd-config.json
```json
{
  "telegram": {
    "chatId": "123456789",     // Your chat ID
    "enabled": true
  },
  "openai": {
    "model": "dall-e-3",
    "imageSize": "1024x1024",
    "quality": "standard"
  },
  "imageGeneration": {
    "cacheEnabled": true,      // Prevent duplicate generation
    "outputPath": "images/generated"
  }
}
```

---

## How Caching Works

The system prevents you from wasting API calls:

1. **First generation**: Prompt → DALLE-3 → Download → Cache
2. **Second generation** (same prompt): Load from cache instantly
3. **Cache index**: `images/image-cache.json` tracks all cached images
4. **No expiration**: Local files never expire (unlike OpenAI URLs)

### Clear Cache (if needed)
```bash
rm images/image-cache.json
```

---

## Troubleshooting

### Images Not Showing in Telegram?

1. Check diagnostic:
   ```bash
   node diagnose-images.js
   ```

2. Verify your chat ID:
   - Open Telegram
   - Message @userinfobot
   - Get your chat ID
   - Update `TELEGRAM_CHAT_ID=123456789`

3. Test image generation:
   ```bash
   node image-handler.js "Test prompt"
   # Should create file in images/generated/
   ```

4. Check OpenAI key:
   ```bash
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models | grep dalle
   ```

### Node Modules Issues?

```bash
rm -rf node_modules package-lock.json
npm install
```

### Cache Corruption?

```bash
rm images/image-cache.json
node image-handler.js "A test image"
```

---

## Performance Notes

- **First generation**: 30-60 seconds (DALLE-3 is slow)
- **Cache hit**: <1 second (loads from disk)
- **Telegram send**: 2-5 seconds (file upload)
- **Disk space**: ~5MB per image (1024x1024 PNG)

---

## Integration Tips

### Tip 1: Add to Game Loop
```javascript
// Every time you load a new scene
if (newScene) {
  await sessionRunner.startScene(
    scene.description,
    scene.environment,
    scene.lighting
  );
  // Then describe to players
  describeScene(scene);
}
```

### Tip 2: Batch Generation
Pre-generate images for known encounters:
```bash
node image-handler.js "Strahd's throne room"
node image-handler.js "Ancient tomb interior"
node image-handler.js "Dragon lair gold hoard"
# All cached, no delays during gameplay
```

### Tip 3: Custom Prompts
Use the flexible image system for anything:
```javascript
await generateAndSendImage(
  "Your custom prompt here",
  CHAT_ID,
  "⚔️ Custom Scene"
);
```

---

## Next Steps

1. **Get Telegram Chat ID**
   - Message @userinfobot
   - Copy your ID to `TELEGRAM_CHAT_ID` or `dnd-config.json`

2. **Test Full Flow**
   ```bash
   node diagnose-images.js
   node image-handler.js "Test dragon"
   ```

3. **Integrate with Your Game**
   - Choose integration method (CLI, programmatic, or session-based)
   - Update your game engine
   - Test with first session

4. **Optimize**
   - Pre-cache common locations
   - Batch-generate for sessions
   - Track image quality and adjust prompts

---

## Support

For issues:
1. Run `node diagnose-images.js` first
2. Check environment variables
3. Verify OpenAI API key is active
4. Confirm Telegram chat ID is correct
5. Review error messages in console

---

**Built for your D&D campaigns. Magic included.** ✨🐉
