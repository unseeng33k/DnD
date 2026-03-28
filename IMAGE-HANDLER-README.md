# D&D Image System - Telegram Integration Fix

## THE PROBLEM

You have **two image generation scripts** (`dalle-images.js` and `gemini-images.js`), but they're **not wired into your Telegram bot**. Here's what's broken:

### 1. **DALLE URLs Expire** 
- `dalle-images.js` returns a URL like `https://oaidalleapiprodpus.blob.core.windows.net/...`
- OpenAI URLs are **temporary and expire in 1 hour**
- Telegram needs actual files, not links

### 2. **Gemini Doesn't Generate Images**
- `gemini-images.js` uses `gemini-pro-vision` 
- That model **analyzes** images, doesn't **create** them
- Google's image generation API is separate (Imagen)

### 3. **No Telegram Integration**
- Neither script connects to Telegram
- Images are generated but never sent to your chat
- The bot doesn't know images even exist

---

## THE SOLUTION

### New File: `image-handler.js`

This is the **definitive image system** for your D&D campaigns. It:

✅ **Generates images with DALLE-3** (same style prompts as before)  
✅ **Downloads & caches locally** (no expired URLs)  
✅ **Sends directly to Telegram** with captions  
✅ **Prevents regeneration** of duplicate scenes  

### How It Works

```javascript
// In your game engine or session prep:
const imageHandler = require('./image-handler');

// Generate a room image and send to Telegram
await imageHandler.generateRoomImage(
  'Grand throne room with ancient tapestries',
  CHAT_ID,  // Your Telegram chat ID
  'dust-filled, candlelit',
  'dim torchlight casting long shadows'
);

// Or a monster encounter
await imageHandler.generateMonsterImage(
  'Beholder',
  CHAT_ID,
  'floating orb with eye stalks and central eye',
  'ruins of lost civilization'
);

// Or a combat scene
await imageHandler.generateBattleImage(
  'Your party of 4 adventurers',
  CHAT_ID,
  'an ancient frost dragon and its dragonlings',
  'frozen temple',
  'claws and magic missiles clash'
);
```

---

## SETUP REQUIRED

### 1. Install Dependencies

```bash
cd /Users/mpruskowski/.openclaw/workspace/dnd
npm install node-fetch form-data
```

### 2. Set Environment Variables

```bash
export OPENAI_API_KEY="your-actual-key-here"
export TELEGRAM_BOT_TOKEN="8552323205:AAHUOPhywiY_Xx-envETYzpd72Al_xJOysI"
```

Or add to your `.env` or OpenClaw setup.

### 3. Test It

```bash
# Basic test
node image-handler.js "A wizard casting fireball in a dark cave"

# With Telegram send (replace with real chat ID)
CHAT_ID="your-chat-id" node image-handler.js \
  "Ancient library with dusty tomes" \
  "123456789"
```

Check for output:
- `./images/generated/dalle-*.png` — local cached images
- `./images/image-cache.json` — avoids duplicate generation

---

## INTEGRATION WITH YOUR BOT

### Option A: In Your Game Engine

```javascript
// game-engine.js or simple-dnd.js
const ImageHandler = require('./image-handler');

// When a new scene loads:
const result = await ImageHandler.generateRoomImage(
  scene.description,
  this.telegramChatId,
  scene.environment,
  scene.lighting
);

if (result.success && result.telegram?.success) {
  console.log(`✅ Sent image #${result.telegram.message_id} to Telegram`);
}
```

### Option B: Add a Command to Your Bot

```javascript
// In your Telegram bot handler
bot.onText(/\/visualize (.+)/, async (msg, match) => {
  const prompt = match[1];
  const result = await ImageHandler.generateAndSendImage(
    prompt,
    msg.chat.id,
    `🎨 ${prompt}`
  );
  
  if (!result.success) {
    bot.sendMessage(msg.chat.id, `❌ Error: ${result.error}`);
  }
});
```

---

## FILE STRUCTURE

```
dnd/
├── image-handler.js          ← NEW: Main image system
├── diagnose-images.js        ← NEW: Diagnostic tool
├── images/
│   ├── generated/            ← Local cached images
│   ├── tamoachan/            ← Existing images
│   └── image-cache.json      ← Cache index
├── dalle-images.js           ← OLD: Deprecated
├── gemini-images.js          ← OLD: Deprecated
└── game-engine.js            ← Update to use image-handler
```

---

## DEBUGGING

If images aren't showing up in Telegram:

### 1. Run diagnostic
```bash
node diagnose-images.js
```

### 2. Check OpenAI key
```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### 3. Test image generation directly
```bash
node -e "const ih = require('./image-handler'); \
ih.generateImageDALLE('test dragon').then(r => console.log(r))"
```

### 4. Check file permissions
```bash
ls -la images/generated/
file images/generated/dalle-*.png  # Should be PNG image
```

---

## PERFORMANCE NOTES

- **First generation**: ~30-60 seconds (DALLE-3 is slow)
- **Cache hit**: Instant (same prompt reuses local file)
- **Telegram send**: ~2 seconds (file upload)
- **Disk usage**: ~5MB per 1024x1024 PNG image

---

## WHAT TO DEPRECATE

Delete or archive:
- `dalle-images.js` (replaced by image-handler)
- `gemini-images.js` (Gemini can't generate images)

Keep the **styled prompts** logic from them—it's good.

---

## NEXT: Hook Into Your Sessions

Each session in your D&D campaign should:

1. Load the current scene description
2. Call `ImageHandler.generateRoomImage()`
3. Display image in Telegram before describing
4. Cache prevents regeneration for same rooms

This makes your gameplay **cinematic and visual** without the friction of manual image searches.
