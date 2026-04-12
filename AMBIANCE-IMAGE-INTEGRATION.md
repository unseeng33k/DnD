# D&D Image System ↔ Ambiance Agent Integration

## The Architecture

You have **two systems** that need to talk to each other:

```
AMBIANCE AGENT                          IMAGE HANDLER
┌─────────────────┐                   ┌──────────────────┐
│ Pre-session prep│                   │ Runtime generation│
│ (HTML guide)    │  ─── Images ──→  │ (Telegram send)  │
│ (Music links)   │                   │                  │
│ (Sensory descs) │                   │ (Local caching)  │
└─────────────────┘                   └──────────────────┘
        ↓                                      ↓
   Generates HTML              Sends to Telegram during
   scene guide with            gameplay with captions
   static images &
   music links
```

---

## Current State

### Ambiance Agent
- ✅ Generates HTML prep guides with images
- ✅ Curates YouTube music links
- ✅ Provides sensory descriptions
- ❌ Images are DALLE URLs (expire in 1 hour)
- ❌ No real-time Telegram integration

### Image Handler (NEW)
- ✅ DALLE-3 image generation
- ✅ Local persistence (never expires)
- ✅ Smart caching (no duplicate API calls)
- ✅ Telegram send (real-time delivery)
- ❌ Doesn't know about scenes/ambiance context
- ❌ No pre-session prep workflow

---

## Three Integration Levels

### Level 1: SWAP Images (Minimal)
Replace ambiance-agent's DALLE URLs with image-handler's persistent files.

```javascript
// In ambiance.js
const { generateAndSendImage } = require('../image-handler.js');

// Before: return DALLE URL (expires)
// After: return local file path (persistent)
async generateSceneImage(sceneName, sceneDetails) {
  const result = await generateAndSendImage(
    sceneDetails.imagePrompt,
    null  // Don't send yet, just generate & cache
  );
  return result.filepath;  // Local file, never expires
}
```

**Result**: Ambiance HTML guide has persistent images instead of expired URLs.

---

### Level 2: SEND + AMBIANCE (Better)
Ambiance agent generates, image-handler sends to Telegram with context.

```javascript
// In ambiance.js
async prepSessionWithTelegram(sessionName, chatId) {
  const scenes = this.loadScenes();
  
  for (const scene of scenes) {
    // Generate with ambiance context
    const result = await this.generateFullScene(scene);
    
    // Send to Telegram with rich caption
    const caption = `
🏛️ *${scene.name}*
${scene.mood.toUpperCase()}

🎵 Music: ${scene.musicLink}
🔊 Sounds: ${scene.sounds}
👃 Smell: ${scene.smells}
❄️ Temperature: ${scene.temperature}
    `;
    
    await imageHandler.sendImageToTelegram(
      result.imagePath,
      chatId,
      caption
    );
  }
}
```

**Result**: Ambiance data (mood, music, sensory) flows into Telegram with images.

---

### Level 3: UNIFIED SYSTEM (Best - Recommended)
Create a master orchestrator that owns the entire experience.

```javascript
// New file: session-ambiance-orchestrator.js

class SessionAmbiance {
  constructor(sessionName, chatId) {
    this.session = sessionName;
    this.chatId = chatId;
    this.ambiance = new AmbianceAgent();
    this.images = new ImageHandler();
    this.runner = new DndSessionRunner(sessionName, chatId);
  }

  /**
   * Pre-session prep: Generate HTML + cache all images
   */
  async prepSession(config) {
    const htmlGuide = [];
    
    for (const location of config.locations) {
      // Generate with ambiance
      const sceneData = this.ambiance.getScene(location.scene);
      
      // Cache image locally
      const imageResult = await this.images.generateImageDALLE(
        sceneData.imagePrompt
      );
      
      // Build rich HTML card
      htmlGuide.push({
        name: location.name,
        imageFile: imageResult.filepath,  // Local, persistent
        music: sceneData.musicLink,
        sensory: sceneData.sensoryDescription,
        telegramButton: `Send to chat: ${location.name}`
      });
    }
    
    // Save HTML guide
    await this.saveHTMLGuide(htmlGuide);
  }

  /**
   * During gameplay: Load ambiance + send to Telegram
   */
  async startScene(sceneName) {
    const sceneData = this.ambiance.getScene(sceneName);
    const cachedImage = this.images.cacheGet(sceneName);
    
    // Send to Telegram with full ambiance context
    const caption = this.buildCaption(sceneData);
    await this.images.sendImageToTelegram(
      cachedImage.filepath,
      this.chatId,
      caption
    );
    
    // Log to session
    await this.runner.startScene(
      sceneName,
      sceneData.environment,
      sceneData.lighting
    );
  }

  buildCaption(sceneData) {
    return `
🎲 *${sceneData.name}*
Mood: *${sceneData.mood.toUpperCase()}*

🎵 *Music*: [${sceneData.musicTitle}](${sceneData.musicLink})
🔊 *Sounds*: ${sceneData.sounds}
👃 *Smell*: ${sceneData.smells}
❄️ *Temperature*: ${sceneData.temperature}
👆 *Touch*: ${sceneData.textures}
💡 *Lighting*: ${sceneData.lighting}
    `.trim();
  }
}
```

**Result**: Unified experience where ambiance data flows seamlessly into images and Telegram.

---

## Workflow Comparison

### Before (Current Ambiance Agent Only)
```
Session prep
  → Generate HTML guide
  → Shows DALLE URLs (expire)
  → YouTube links for music
  → Read sensory text
  
During gameplay
  → Open HTML guide
  → Click expired image links (broken)
  → Click music link
  → Read descriptions from file
```

### After (With Integration)
```
Session prep (new: session-ambiance-orchestrator.js)
  → Load ambiance config
  → Generate & cache ALL images
  → Build rich HTML with persistent images
  → Pre-load Telegram with scene images
  
During gameplay
  → Click in HTML to send scene to Telegram
  → Image arrives immediately (cached)
  → Caption includes music link + sensory data
  → Session tracked with images
```

---

## Implementation Roadmap

### Phase 1: Swap Images (1-2 hours)
1. Extract `generateImageDALLE` call from ambiance.js
2. Use image-handler.js instead
3. Replace URLs with local file paths in HTML
4. Test: HTML guide loads persistent images

### Phase 2: Send + Ambiance (2-3 hours)
1. Add `sendImageToTelegram` calls to ambiance prep
2. Build rich captions from ambiance data
3. Pre-load Telegram with all session images
4. Test: Images arrive in Telegram with mood/music/sensory data

### Phase 3: Unified Orchestrator (3-4 hours)
1. Create session-ambiance-orchestrator.js
2. Merge ambiance + image-handler + session-runner
3. One command to prep entire session
4. One command during gameplay to load scenes
5. Test: Full workflow from prep to play

---

## What You Already Have (Reuse)

From **ambiance.js**:
- Scene definitions (lighting, sounds, smells, textures, moods)
- Music links (YouTube curated for each scene)
- Sensory descriptions for DMs
- HTML generation pipeline

From **image-handler.js**:
- DALLE-3 image generation
- Local caching (persistent)
- Telegram send
- Session tracking

---

## Key Files to Create/Modify

### New: `session-ambiance-orchestrator.js`
- Master class that owns the full experience
- Coordinates ambiance + images + sessions
- Handles prep and runtime workflows

### Modify: `ambiance.js`
- Import image-handler functions
- Replace DALLE URL generation with local file paths
- Add sendImageToTelegram calls

### Modify: `image-handler.js`
- Add ambiance context awareness
- Accept scene data for better captions
- Integrate with ambiance agent's scene definitions

---

## Benefits of Integration

| Feature | Before | After |
|---------|--------|-------|
| Image persistence | URLs expire in 1 hour | Local files, never expire |
| Pre-session prep | HTML with broken images | HTML with clickable Telegram send |
| During gameplay | Manual image search | Images already in Telegram |
| Sensory context | Text descriptions only | Images + music + text in chat |
| Session tracking | Ambiance data lost | Full session history with images |
| API efficiency | Regenerates on prep reload | Smart caching, no waste |

---

## Quick Start: Level 1 (Swap Images)

```javascript
// In ambiance.js, replace generateSceneImage:

async generateSceneImage(sceneKey) {
  const { generateImageDALLE } = require('../image-handler.js');
  const scene = this.scenes[sceneKey];
  
  const result = await generateImageDALLE(scene.imagePrompt);
  
  if (result.success) {
    return result.filepath;  // Local file, NOT URL
  }
  return null;
}
```

Then in the HTML generation loop, use `filepath` instead of `url`.

Done. Your HTML guide now has persistent images.

---

## Next: Decide Integration Level

1. **Level 1 (Easiest)**: Just swap URLs for persistent files
2. **Level 2 (Better)**: Add Telegram sends with ambiance context  
3. **Level 3 (Best)**: Build unified orchestrator

Which level do you want to build first?

