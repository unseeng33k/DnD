# 🎭 OPENCLAW
## AI-Powered D&D Campaign Management System

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **License:** MIT

---

## What Is OpenClaw?

OpenClaw is a **complete, AI-enhanced D&D campaign management system** that handles everything from module loading to chronicle narrative generation.

### Key Features
- 📚 **Module System** — Load pre-defined adventures (TSR, Paizo, custom)
- 🎲 **Combat Engine** — Automated encounter management with logging
- 🎭 **NPC System** — Interaction tracking and relationship management
- 💾 **Session Memory** — Persistent state across sessions
- 📖 **Chronicle Generation** — AI-powered narrative prose (Claude API)
- 🎨 **Ambiance** — Scene descriptions, imagery, music suggestions
- 📊 **Resource Tracking** — Spell slots, hit dice, conditions
- ⚡ **Real-time Features** — Telegram bot integration, image generation

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/openclaw.git
cd openclaw
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. Verify System
```bash
node system-integrity-test.js
```

### 5. Start Gaming
```bash
node play-module.js
```

---

## Core Systems

### 1. Game Master Orchestrator
The unified interface for running campaigns.

```javascript
const gm = new GameMasterOrchestrator('curse-of-strahd');
await gm.loadModule();
await gm.startSession(1);
await gm.loadScene('castle-entrance');
await gm.startEncounter('vampire-ambush');
await gm.endSession();  // Auto-generates chronicle chapter
```

### 2. DM Memory System ✅ NEW
Comprehensive event logging and session state persistence.

**Features:**
- Timeline of all events (exploration, combat, roleplay, discovery)
- NPC interaction tracking with relationship scoring
- Decision & ruling audit trail
- World state modifications
- Combat round logging
- Full session export to JSON

### 3. Narrator Engine ✅ NEWLY INTEGRATED
AI-powered narrative generation that transforms session logs into epic prose.

**Features:**
- Emotional arc analysis
- NPC dialogue extraction
- Claude API integration (George R.R. Martin + Joe Abercrombie style)
- Thematic title generation
- Auto-appending to campaign chronicle.md
- 2,500-4,000 word chapters per session

### 4. Session Ambiance
Atmospheric descriptions, imagery, and mood management.

**Features:**
- Scene library with sensory detail
- DALLE image generation
- Music recommendations
- Mood/lighting/temperature tracking

### 5. Adventure Module System
Load, manage, and play pre-defined D&D modules.

**Features:**
- Module metadata (levels, duration, setting, themes)
- Party templates with character instantiation
- Location definitions with connections
- Encounter definitions with difficulty/rewards
- NPC definitions with personality & plot hooks

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Game Master Orchestrator (Main UI)     │
└──────┬──────────────────────────────────┘
       │
       ├─→ DM Memory System         [Event tracking, persistence]
       ├─→ Session Ambiance          [Imagery, mood, music]
       ├─→ Adventure Module System   [Load modules, NPCs, encounters]
       ├─→ Combat Engine             [Encounter management]
       ├─→ Resource Tracking         [Spell slots, conditions, HD]
       ├─→ Consequence Engine        [Decision persistence]
       └─→ Narrator Engine ✅ NEW    [Chronicle generation]
           │
           └─→ Claude API (Anthropic)
               [Epic prose generation]
```

---

## File Structure

**Critical Files:**
```
├── game-master-orchestrator-v2.js      [Main orchestrator]
├── dm-memory-system.js                 [Session persistence] ✅ NEW
├── session-ambiance-orchestrator.js    [Atmosphere system]
├── adventure-module-system.js          [Module loading]
├── src/systems/narrator/               [Chronicle generation] ✅ NEW
│   ├── narrator-engine.js
│   ├── index.js
│   ├── README.md
│   └── docs/
├── package.json                        [Dependencies]
└── system-integrity-test.js            [Verification] ✅ NEW
```

**Generated During Gameplay:**
```
campaigns/
├── Curse of Strahd/
│   ├── sessions/
│   │   ├── session_001-memory.json
│   │   └── session_002-memory.json
│   └── chronicle.md                    [Auto-generated novel]
```

---

## Deployment Checklist

- ✅ All core systems present and integrated
- ✅ DMMemory class created and tested
- ✅ NarratorEngine fully integrated into orchestrator
- ✅ Package.json updated with dependencies
- ✅ System integrity test suite created
- ✅ Git repository initialized
- ✅ Deployment guide written

**Status:** Ready for immediate deployment

---

## System Integrity

Run verification suite:
```bash
node system-integrity-test.js
```

Expected output:
```
✓ FILE EXISTENCE CHECK - 6/6 files present
✓ IMPORT CHECK - All classes import successfully
✓ DEPENDENCIES CHECK - All required packages available
✓ GIT REPOSITORY CHECK - Repository initialized
✓ CAMPAIGN STRUCTURE CHECK - Ready for gameplay

STATUS: READY FOR GAMEPLAY
```

---

## Usage Example

### Start a Campaign
```javascript
const { GameMasterOrchestrator } = await import('./game-master-orchestrator-v2.js');

const gm = new GameMasterOrchestrator('curse-of-strahd');
await gm.loadModule();
```

### Run a Session
```javascript
// Initialize
await gm.startSession(1);

// Load location
await gm.loadScene('castle-entrance');

// Describe scene
gm.memory.logEvent('narrative', 
  'The party enters the foreboding castle...',
  { location: 'Castle Entrance' }
);

// Run encounter
await gm.startEncounter('vampire-ambush');
gm.combat.rollAttack('Vampire', 'Paladin', { attackBonus: 4 });
gm.combat.damageTarget('Vampire', 15, 'magical', 'Paladin longsword');

// Record decision
gm.assessAndRecord(
  'Allow counterspell to interrupt spell',
  'Counterspell reaction timing rules'
);

// Wrap up
await gm.endSession();
// Automatically:
// 1. Saves session JSON
// 2. Generates chapter via NarratorEngine
// 3. Appends to campaign chronicle
```

### Review Chronicle
```bash
cat campaigns/"Curse of Strahd"/chronicle.md
```

Output:
```markdown
# CURSE OF STRAHD
## A Chronicle of the Descent

---

## BOOK ONE: THE BEGINNING

### CHAPTER 1: The Reckoning Approaches

The evening fog rolled across the Sorrow Vale as the adventurers 
approached the gates of Castle Ravenloft...

[2,500-4,000 words of epic narrative prose]
```

---

## API Reference

### GameMasterOrchestrator
```javascript
// Lifecycle
await gm.loadModule()
await gm.startSession(sessionNum)
await gm.endSession()

// Gameplay
await gm.loadScene(locationId)
await gm.startEncounter(encounterId)
gm.getNPC(npcId)
gm.interactNPC(npcId, action, details)
gm.assessAndRecord(decision, reasoning)

// State
gm.getStatus()
gm.memory.logEvent(type, description, metadata)
gm.memory.recordNPCInteraction(npcName, action, details)
```

### DMMemory
```javascript
// Event logging
logEvent(type, description, metadata)
logNarrativeEvent(text, metadata)
logAction(actor, action, details)
logCombatRound(roundNum, turnOrder)

// NPC interactions
recordNPCInteraction(npcName, action, details)

// Decisions
recordRuling(decision, reasoning, ruleRef)
auditTrail()

// State
setLocation(name)
setEncounter(name, details)
setWorldState(key, value, description)
getRecentEvents(count)

// Persistence
saveSession() → filepath
exportState() → object
```

### NarratorEngine
```javascript
// Generation
generateChapter(sessionNum, logPath, events, party, povChar)
  → { sessionNumber, title, content, arc, povCharacter, ... }

// Persistence
appendToChronicle(campaignName, chapter)
  → { chroniclePath, chapter, title }

// Analytics
getChronicleStats(campaignName)
  → { status, chapters, words, chroniclePath }
```

---

## Dependencies

**Required:**
- `@anthropic-ai/sdk` ^0.24.0 — Chronicle generation via Claude API
- `node-fetch` ^3.3.2 — HTTP client
- `form-data` ^4.0.0 — Multipart form data

**Optional:**
- `dotenv` — Environment variable management
- Express — Web server integration
- Telegram SDK — Bot integration

**Environment Variables:**
```bash
ANTHROPIC_API_KEY=sk-ant-...            # Required for narrator
OPENAI_API_KEY=sk-...                   # Optional for images
TELEGRAM_BOT_TOKEN=...                  # Optional for bot
TELEGRAM_CHAT_ID=...                    # Optional for bot
```

---

## Troubleshooting

### System won't start
```bash
node system-integrity-test.js
```
Check for missing files or import errors.

### Module not found
Ensure module structure exists:
```
modules/[moduleId]/
├── metadata.json
├── party.json
├── locations/
├── encounters/
└── npcs/
```

### Chronicle generation fails
Check `ANTHROPIC_API_KEY` is set:
```bash
echo $ANTHROPIC_API_KEY
```

Session will still save even if narrator fails.

---

## Documentation

- **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** — Complete deployment instructions
- **[SYSTEM-INTEGRITY-AUDIT.md](./SYSTEM-INTEGRITY-AUDIT.md)** — Technical audit and findings
- **[src/systems/narrator/README.md](./src/systems/narrator/README.md)** — Narrator system overview
- **[src/systems/narrator/docs/NARRATOR-INTEGRATION.md](./src/systems/narrator/docs/NARRATOR-INTEGRATION.md)** — Integration architecture

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test with `system-integrity-test.js`
4. Commit with clear messages
5. Push to GitHub

---

## License

MIT License — See LICENSE file for details

---

## Author

Michael Pruskowski  
*Where storytelling meets systems thinking.*

---

## Status

| Component | Status |
|-----------|--------|
| Core Orchestrator | ✅ Production |
| Memory System | ✅ Production |
| Ambiance | ✅ Production |
| Modules | ✅ Production |
| Combat | ✅ Production |
| **Narrator (NEW)** | ✅ **Production** |
| **Documentation** | ✅ **Complete** |
| **Deployment** | ✅ **Ready** |

**The system is production-ready. Clone, install, and start building epics.**

---

**OpenClaw v1.0.0**  
*March 29, 2026*
