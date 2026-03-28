# D&D UNIFIED SYSTEM - QUICK REFERENCE CARD

## ONE COMMAND TO START

```bash
node start-session.js "Campaign Name" SessionNumber TelegramChatID
```

Example:
```bash
node start-session.js "Curse of Strahd" 1 123456789
```

---

## INTERACTIVE COMMANDS

### Scenes & Atmosphere
```
scene <name> [description]
  scene "Dark Forest" "Ancient trees, twilight, misty air"
  → Loads image, plays music, logs location
```

### Combat
```
combat <enemies>
  combat "Strahd,Zombies,Servants"
  → Starts combat, rolls initiative, sets turn order

combat next
  → Next round (increments counter, updates timeline)
```

### Attacks & Damage
```
attack <attacker> <target>
  attack Malice Strahd
  → Rolls attack, shows hit/miss, logs action

damage <target> <amount> [type] [source]
  damage Strahd 12 physical "sneak attack"
  → Updates HP, logs damage, deducts resources if needed
```

### Resources
```
spell <character> <spell>
  spell Malice "Magic Missile"
  → Logs spell cast, deducts spell slot

hit-die <character>
  hit-die Grond
  → Rolls and recovers HP with hit die

condition <character> <condition>
  condition Malice poisoned
  → Adds condition, tracks duration
```

### Decisions & Rules
```
decision <ruling>
  decision "Allow bonus action sneak attack after Dash"
  → Shows suggestions, relevant rules, logs with consistency check

rule <name>
  rule sneak attack
  → Quick rule lookup (available mid-game)

npc <name> <action>
  npc Strahd "Offers Malice a deal"
  → Logs interaction, checks consequences, affects reputation
```

### Status & History
```
status
  → Shows current party, resources, combat status, recent events

events [type]
  events combat
  → Shows combat events in timeline

recap
  → Session summary (time, location, major events)

end
  → Save session and exit
```

---

## WHAT HAPPENS AUTOMATICALLY

### When You Load a Scene
- ✅ Image cached & ready
- ✅ Music link generated
- ✅ Sensory details provided
- ✅ Location logged in memory
- ✅ Ready for Telegram delivery

### When You Roll an Attack
- ✅ Roll calculated with bonuses
- ✅ AC checked automatically
- ✅ Hit/miss determined
- ✅ Logged with full context
- ✅ Saved to timeline

### When You Deal Damage
- ✅ HP updated
- ✅ Character status tracked
- ✅ Damage logged (type, source)
- ✅ Resources deducted if applicable
- ✅ Consequences checked

### When You Make a Decision
- ✅ Consistency check performed
- ✅ Relevant rules suggested
- ✅ Similar rulings highlighted
- ✅ Decision recorded with reasoning
- ✅ Saved to audit trail

### When You Record an NPC Interaction
- ✅ Interaction logged
- ✅ NPC relationship updated
- ✅ Faction reputation affected
- ✅ Promises tracked
- ✅ Consequences triggered

### When You End Session
- ✅ All data compiled
- ✅ Session file created
- ✅ Timeline complete
- ✅ Decisions recorded
- ✅ Campaign state updated
- ✅ Ready for next session

---

## KEYBOARD SHORTCUTS (In Interactive Mode)

```
Type directly into prompt:
  scene <n>             Load scene
  combat <e>            Start combat
  attack <c> <t>        Attack
  damage <t> <a>        Deal damage
  decision <r>          Record ruling
  npc <n> <a>           NPC interaction
  status                Show status
  end                   End session
  help                  Show commands
```

---

## MEMORY ACCESS DURING GAME

While session is running:

```bash
# In another terminal, open reference guide
node dm-reference-guide.js

DM> rule sneak attack
  → Full rule description + sources

DM> char Malice sneak attack
  → Malice's ability details

DM> npc Strahd
  → Strahd's interaction history

DM> decision bonus
  → Your previous similar rulings
```

---

## CAMPAIGN CONTINUITY

```
Session 1 ends
  → Saves to: campaigns/Curse of Strahd/sessions/session-1-memory.json

Session 2 starts
  node start-session.js "Curse of Strahd" 2
  → Loads Session 1 context automatically
  → Shows last location, party status, unresolved plot threads
```

---

## EXAMPLE SESSION FLOW

```
$ node start-session.js "Curse of Strahd" 1 123456789

✅ Systems initialized

GM> scene "Castle Entrance" "The gothic structure looms"

📍 Castle Entrance
The gothic structure looms...
✅ Image loaded
🎵 Music: https://...
Sensory: Dark, foreboding, ancient...

GM> combat "Strahd,Zombies"

⚔️ Combat started!
Turn order: Malice → Strahd → Grond → Zombies

GM> attack Malice Strahd

Malice attacks Strahd
Roll: 14 + 3 = 17 vs AC 15
✅ HIT

GM> damage Strahd 8 physical "rapier"

💢 Strahd takes 8 damage (32/40 HP)

GM> combat next

ROUND 2
Malice → Strahd → Grond → Zombies

GM> decision "Allow sneak attack on same turn as bonus action"

💡 SUGGESTION:
   Similar ruling (Session 1): Not yet

📖 RELEVANT RULES:
   PHB p.96 - Sneak attack requires finesse weapon
   PHB p.96 - Cunning Action (bonus action)

✅ Decision recorded

GM> npc Strahd "Laughs menacingly, powers rage"

🎭 Strahd: Laughs menacingly...
⚡ CONSEQUENCES:
   Strahd's rage activated!
   Faction reputation: +5 intensity

GM> end

SESSION 1 COMPLETE
Events logged: 18
Decisions recorded: 3
💾 Saved to: campaigns/Curse of Strahd/sessions/session-1-memory.json
```

---

## TROUBLESHOOTING

### Scene doesn't load images?
→ SessionAmbiance may skip if OpenAI key missing
→ Functionality still works (image loading is optional enhancement)

### Combat not calculating properly?
→ Check attack bonuses in character sheet
→ Verify target AC settings
→ Roll will auto-calculate based on base + modifiers

### Decision not showing suggestions?
→ First ruling of its kind (no precedent)
→ This is normal - still recorded for future reference

### Session not saving?
→ Check if campaigns/ directory exists
→ Manually create: mkdir -p campaigns/CampaignName/sessions
→ Session will auto-save to JSON file

---

## POWER MOVES

### Quick Combat Round
```
attack Malice Strahd
damage Strahd 8
combat next
attack Strahd Malice
damage Malice 5
```
All logged automatically.

### Decision with Full Context
```
decision "Sneak attack counts with adjacent ally per PHB p.96"
→ System shows you've made similar rulings
→ Shows conflicting rules
→ Logs with sources
→ Next time you mention it: Consistency check automatic
```

### Campaign Deep Dive
```
status
→ Shows everything:
  - Party resources
  - Recent events
  - Combat status
  - Unresolved consequences
```

---

## WHAT TO HAVE OPEN

### During Session

**Terminal 1**: Interactive session
```bash
node start-session.js "Campaign" SessionNum ChatID
```

**Terminal 2** (Optional): Reference guide
```bash
node dm-reference-guide.js
```

**Browser**: Campaign HTML guide (if generated)
```
campaigns/Campaign/session_assets/Campaign_guide.html
```

**Discord/Telegram**: Ready to receive images

---

## NEXT SESSION

When you end:
```
GM> end

SESSION SAVED
→ campaigns/Curse of Strahd/sessions/session-1-memory.json
```

Next time:
```bash
node start-session.js "Curse of Strahd" 2 ChatID

✅ Session 1 context loaded automatically
✅ Picks up where you left off
✅ All decisions/NPCs/consequences remembered
```

---

## STATUS: READY ✅

All systems integrated.
One command. Everything works.

**Play now.** 🎭✨
