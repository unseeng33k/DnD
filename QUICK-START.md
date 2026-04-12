# QUICK START GUIDE - D&D BACKEND SYSTEM

## Bruh, here's how to GET STARTED in 5 minutes:

---

## STEP 1: Create a Module (2 minutes)

### Option A: Interactive (Easiest)
```bash
cd /Users/mpruskowski/.openclaw/workspace/dnd
node create-module.js
```

Follow the prompts to create your module.

### Option B: Programmatic (More Control)
```javascript
import { ModuleBuilder } from './module-builder.js';

const strahd = new ModuleBuilder('curse-of-strahd', 'Curse of Strahd');

strahd.setMetadata({
  description: 'Gothic horror in Barovia',
  level: [3, 10],
  length: 'long',
  themes: ['gothic', 'horror']
});

// Add party members
strahd.addPartyMember({
  name: 'Malice Indarae De\'Baarzzan',
  class: 'Rogue',
  level: 3,
  hp: 24,
  maxHP: 24,
  ac: 16,
  personality: {
    archetype: 'wildcard',
    traits: {
      openness: 3,
      aggressiveness: 7,
      compassion: 2
    },
    catchphrases: ["That's not my problem"],
    voice: { dialect: 'street' }
  },
  goals: { primary: 'Survive' }
});

// Add NPCs
strahd.addNPC({
  id: 'strahd-von-zarovich',
  name: 'Strahd Von Zarovich',
  role: 'Villain',
  goals: ['Control Barovia']
});

// Build the module
await strahd.build();
```

---

## STEP 2: Initialize Campaign (1 minute)

```javascript
import { UnifiedDndEngine } from './unified-dnd-engine.js';

const engine = new UnifiedDndEngine('My Strahd Campaign', 'curse-of-strahd');

// Load your module data
const moduleData = {
  metadata: { /* from your module */ },
  party: { members: [ /* from your module */ ] },
  npcs: [ /* from your module */ ]
};

// Initialize
await engine.initializeCampaign(moduleData);

// Start Session 1
engine.startSession(1);
```

---

## STEP 3: Run Your First Scene (2 minutes)

```javascript
// Party makes a decision
const decision = {
  description: 'Approach the mysterious tavern',
  riskLevel: 5,
  affectsNPCs: ['strahd-von-zarovich']
};

const result = await engine.handlePartyDecision(decision, 'Malice Indarae De\'Baarzzan');

console.log(result.response); // Malice's personality-based response
console.log(result.npcReactions); // How NPCs react
```

---

## THAT'S IT. YOU'RE RUNNING A CAMPAIGN.

---

## CORE COMMANDS

### Handle Party Decision
```javascript
await engine.handlePartyDecision(decision, characterName);
```

### Progress Character Arc
```javascript
engine.progressCharacterArc(characterName, test, passed);
```

### Handle NPC Death
```javascript
engine.handleNPCDeath(npcId, killer);
```

### Handle Party Member Death
```javascript
engine.handlePartyMemberDeath(characterName, killer);
```

### Save Campaign
```javascript
engine.saveCampaignState('/path/to/save.json');
```

### Load Campaign
```javascript
const state = UnifiedDndEngine.loadCampaignState('/path/to/save.json');
```

### Get Campaign Status
```javascript
const status = engine.getGameState();
```

---

## KEY CONCEPTS

### Party Morale
- Starts at 100
- Decreases when bad things happen
- Affects how characters behave
- Below 20: Party breaks
- Above 80: Party invincible

### Character Personality
- Determines how they respond to proposals
- Affects their dialogue
- Changes through character arcs
- Drives decision-making

### NPC Reputation
- -100 to +100 with each NPC
- Broken promises = -50
- Helped NPC = +10
- NPC remembers EVERYTHING
- Different reputation = different attitude

### Consequence Cascades
- One NPC death affects allies
- Secret revelation changes everything
- Party member death affects others
- World state stays consistent

---

## RUNNING A SESSION

```javascript
// 1. Start session
engine.startSession(sessionNumber);

// 2. Describe scene (with cinematic engine + ambiance)
await cinematicEngine.scene('location', description);

// 3. Party makes decisions
await engine.handlePartyDecision(decision, character);

// 4. NPC reactions cascade
// (Automatic - engine handles it)

// 5. Progress character arcs
engine.progressCharacterArc(character, test, result);

// 6. Combat (if needed)
await engine.startEncounter(encounter);

// 7. Save session
engine.saveCampaignState('campaign.json');
```

---

## TESTING IT

Run the complete example:
```bash
node example-campaign.js
```

This shows:
- Module creation
- Campaign initialization
- Party decisions
- Character arc progression
- Campaign state management

---

## WHAT HAPPENS AUTOMATICALLY

✅ **Party morale updates** based on events
✅ **NPC attitudes shift** based on party actions
✅ **Relationships deepen or break** based on interactions
✅ **Character arcs progress** based on tests
✅ **Consequences cascade** through NPC network
✅ **World state persists** between sessions
✅ **Campaign saves** after each session

**You just describe what happens. The system handles the rest.**

---

## THE MAGIC

This isn't a simulation. It's a **STORY ENGINE**.

Every decision matters.
Every NPC remembers.
Every consequence cascades.
Every character grows.

**You get LEGENDARY campaigns.** ✨

---

## TROUBLESHOOTING

**"Module didn't create?"**
→ Check that `/modules` directory exists
→ Run `mkdir -p /Users/mpruskowski/.openclaw/workspace/dnd/modules`

**"Party member not responding?"**
→ Verify they were added with `engine.party.members.get(name)`

**"NPC not remembering?"**
→ Check `npcs.recordPartyInteraction(npcId, action, weight)`

**"Campaign won't load?"**
→ Verify JSON is valid: `node -e "console.log(JSON.parse(require('fs').readFileSync('campaign.json')))"`

---

## NEXT LEVEL

Once you master this, you can:

1. **Extend it**: Add new systems (inventory, crafting, etc.)
2. **Automate it**: Have Claude run campaigns
3. **Scale it**: Multi-party campaigns
4. **Visualize it**: Build a UI on top
5. **Share it**: Run campaigns for friends online

But start here. **Get comfortable with the basics first.**

---

## YOU'RE READY.

Go create a legendary campaign. 🎭✨

