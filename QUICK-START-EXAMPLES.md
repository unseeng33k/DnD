# QUICK START GUIDE - COMPLETE SYSTEM

## START HERE

### Step 1: Extract All Modules (One Time)
```bash
cd /Users/mpruskowski/.openclaw/workspace/dnd
node complete-module-extractor.js
```

Output: Creates `/modules/A1/`, `/modules/I6/`, etc. (42 total)

### Step 2: Create a Character
```bash
node character-creator.js
```

Output: Saves character as `character-name.json`

### Step 3: Start Playing
```bash
node integrated-dnd-system.js
```

Then:
- [1] Create party
- [2] Load character into party
- [3] Select module (I6 Ravenloft, S1 Tomb of Horrors, etc.)
- [4] Begin adventure

---

## EXAMPLE SESSION

### Setup

```
Party: "The Brave Company"
Members:
  - Malice (Rogue, Level 3)
  - Grond (Fighter, Level 3)
  - Theron (Cleric, Level 3)
  - Sylvara (Mage, Level 3)
```

### Initiative for Combat

```
ROLLING INITIATIVE for enemy encounter...

Malice (DEX 16):   d10=7 + 3 (DEX mod) = 10 ✅ FIRST
Grond (DEX 10):    d10=4 + 0 (DEX mod) = 4
Theron (DEX 12):   d10=9 + 1 (DEX mod) = 10 ✅ TIED
Sylvara (DEX 13):  d10=2 + 1 (DEX mod) = 3

TURN ORDER:
1. Malice (10) - DEX 16 = Can INTERRUPT opponent
2. Theron (10) - DEX 12 = Can react after declaration
3. Grond (4) - DEX 10 = Normal turn
4. Sylvara (3) - DEX 13 = Can react after declaration

REACTION TIME:
Malice:  2 rounds until next reaction (very fast)
Theron:  3 rounds (normal)
Grond:   4 rounds (slow for fighter)
Sylvara: 3 rounds (normal)
```

### Combat Round 1

```
ROUND 1 (10 seconds)

Malice's turn:
  Action: Attack goblin with dagger
  Roll: d20 + 3 (DEX bonus) = 18
  vs AC 12 (goblin) = HIT
  Damage: d4 + 1 = 4 damage to goblin

Theron's turn:
  Action: Cast cure light wounds on Grond (who took 2 damage earlier)
  Healing: 1d8 + 1 = 6 HP to Grond
  Grond: 24 → 30 HP (full)

Grond's turn:
  Action: Attack with longsword
  Roll: d20 + 2 (STR bonus) = 16
  vs AC 11 (enemy warrior) = HIT
  Damage: 1d8 + 2 = 7 damage

Sylvara's turn:
  Action: Cast magic missile at enemy mage
  Missiles: 3 (level 3 spell)
  Damage: 1d4+1 × 3 = 5, 3, 4 = 12 total damage
```

### Reaction: Enemy Attacks Theron

```
Enemy warrior attacks Theron during Theron's turn!

THERON (DEX 12):
Can react after declaration? YES
Action: DODGE (DEX check)
Roll: d20 + 1 (DEX mod) = 14
vs DC 12 (to dodge) = SUCCESS
Result: Half damage from incoming attack
```

---

## EXAMPLE: SKILL CHECK

### Malice Attempts to Pick Lock

```
Malice (Thief, Level 3):
Skill: Pick Locks
Base Chance: 15%
Level Bonus: +5% × 3 = +15%
Total Chance: 30%

Roll: d100 = 22
Result: 22 ≤ 30% = SUCCESS ✓

Malice picks the lock open!
```

### Sylvara Makes Intelligence Check

```
Sylvara (Mage, Level 3):
Ability: INT 16
Modifier: +3
Skill Check: Arcane Knowledge (DC 13)

Roll: d20 + 3 = 8 + 3 = 11
vs DC 13 = FAILED ✗

She knows something is magical, but can't identify it.
```

### Grond Makes Strength Check (Jump)

```
Grond (Fighter, Level 3):
Ability: STR 17
Modifier: +3
Skill: Jump (DC 12)

Roll: d20 + 3 = 15 + 3 = 18
vs DC 12 = SUCCESS ✓

Jump distance: STR mod × 3 + 3 = 3 × 3 + 3 = 12 feet
Grond jumps 12 feet across the chasm!
```

---

## EXAMPLE: EXPERIENCE & LEVELING

### Party Defeats Goblin Warband

```
Encounter: 8 Goblins (CR 1/8 each)
Total XP Value: 200 XP
Difficulty: HARD (×1.5 multiplier)
Adjusted: 200 × 1.5 = 300 XP total

Party Size: 4
XP Per Character: 300 ÷ 4 = 75 XP each

Distribution:
  - Malice: 75 XP (Total: 1,325)
  - Grond: 75 XP (Total: 1,325)
  - Theron: 75 XP (Total: 1,325)
  - Sylvara: 75 XP (Total: 1,325)
```

### After Defeating the Temple of Elemental Evil

```
Major Encounter: Cult Leaders (CR 5)
Base XP: 900 XP
Difficulty: DEADLY (×2 multiplier)
Adjusted: 900 × 2 = 1,800 XP

XP Per Character: 1,800 ÷ 4 = 450 XP each

Malice: 1,325 + 450 = 1,775 XP
Thief Level 3 XP threshold: 2,500
To Level 4: 2,500 - 1,775 = 725 XP remaining

Grond: 1,325 + 450 = 1,775 XP
Fighter Level 3 XP threshold: 8,000
To Level 4: 8,000 - 1,775 = 6,225 XP remaining
```

### Malice Reaches Level 4!

```
LEVEL UP! 🎉

Old: Level 3 (1,775 XP)
New: Level 4 (2,500+ XP)

BONUSES APPLIED:
✅ HP: d6 + 1 (DEX mod) = 4 + 1 = 5 HP gain
   Total: 18 → 23 HP

✅ Ability Score: No improvement this level (next at 4×4)

✅ Thief Skills: +5% all skills
   Pick Locks: 30% → 35%
   Find Traps: 15% → 20%
   All others: +5%

✅ Unlockedfeature:None at level 4 (next at 5)

THAC0 improved from 19 → 18 (1-point better)
Saving throws: All improved by 1
```

---

## EXAMPLE: MODULE PLAY - RAVENLOFT

### Setup
```bash
node integrated-dnd-system.js

[3] Play Module
> I6 Ravenloft

Loading: Ravenloft (Recommended Level: 7-10)
Current party level: 3

⚠️  WARNING: Party is low level for this module!
Continue? (y/n): y

Module loaded: 64 pages
Areas: 50+
Encounters: 20+
NPCs: 15+
Treasures: 30+
```

### First Encounter: Entering Castle Ravenloft

```
🎭 DM NARRATION:

As you approach the castle gates, fog swirls around your feet.
The air grows cold. An oppressive darkness seems to emanate from within.
Two zombies guard the gatehouse, unmoving until you near.

ENEMIES:
- Zombie Guard #1: 8 HP, AC 8, unarmed
- Zombie Guard #2: 7 HP, AC 8, unarmed

YOUR OPTIONS:
[1] Attack immediately
[2] Attempt persuasion
[3] Try stealth
[4] Cast a spell
[5] Other

> [1] Attack immediately

COMBAT INITIATED!

Initiative (rolling for all 6 combatants):
Your Party:  Malice=12, Grond=7, Theron=9, Sylvara=5
Zombies:     Zombie1=3, Zombie2=2

TURN ORDER:
1. Malice (12)
2. Theron (9)
3. Grond (7)
4. Sylvara (5)
5. Zombie Guard #1 (3)
6. Zombie Guard #2 (2)

Round 1 begins...
```

---

## EXAMPLE: TRAP ENCOUNTER

### Detect Trap Check

```
You enter a corridor. There's a pressure plate on the floor.

Malice (Thief):
Skill: Find Traps
Detection DC: 12
Roll: d20 + 3 (DEX bonus) + 3 (Thief bonus) = 7 + 3 + 3 = 13

13 ≥ 12 = SUCCESS ✓

You notice a faint groove in the floor ahead.
It looks like a pressure plate trap!

TRAP: Poison Darts (1d6 + poison damage)
Disable DC: 14
```

### Disable Trap

```
Malice attempts to disarm the trap...
Roll: d20 + 5 (DEX + Thief) = 11 + 5 = 16

16 ≥ 14 = SUCCESS ✓

You carefully work the mechanism...
Click.
The trap is disarmed safely!
```

---

## EXAMPLE: PUZZLE SOLVING

### The Riddle

```
You enter a chamber. A stone guardian speaks:

"I have cities but no houses, forests but no trees, 
water but no fish. What am I?"

[1] Guess answer
[2] Get hint (Level 1)
[3] Get hint (Level 2)
[4] Get hint (Level 3)

> [2] Get hint (Level 1)

💡 HINT: "Think about what contains these things..."
```

### Answer

```
> [1] Guess answer
> A map

🎉 CORRECT!

The guardian nods and steps aside.
The way forward is revealed!

Reward: 100 XP to party
Treasure Chest Found: Unlocked and accessible
```

---

## STATUS: READY TO PLAY

Everything works. Everything is integrated. You can now:

1. **Create any AD&D 1e character**
2. **Build a multiplayer party**
3. **Run combat with proper DEX-based reactions**
4. **Track skills, checks, and saves**
5. **Award XP and auto-level characters**
6. **Play any of 42 classic modules**
7. **Run with AI Dungeon Master**
8. **Manage inventory, spells, traps, puzzles**

**One command. Infinite adventure.**

```bash
node integrated-dnd-system.js
```

🎭✨
