# HEARTBEAT.md - D&D Random Encounter System

## Overview

Automated random encounter checks that run on a schedule. The DM checks periodically and alerts when encounters trigger.

## How It Works

**Check Frequency:** Every 30 minutes of real time = 2 hours of game time

**When to Check:**
- Party is traveling (jungle, dungeon, wilderness)
- Party is resting/camping
- Party is exploring (10% chance every 2 hours)

**Encounter Tables by Terrain:**

### Jungle (d12)
1. 2d6 Giant Leeches
2. 1d4+1 Lizardfolk patrol
3. 1 Giant Constrictor Snake
4. 2d6 Stirges
5. 1 Jaguar
6. 1d6 Giant Spiders
7. Poisonous plant (save or 1d6 dmg)
8. Quicksand (DEX check or trapped)
9. Ancient shrine (may have treasure)
10. Friendly explorer (needs help)
11. Nothing
12. Nothing

### Dungeon (d12)
1. 2d6 Giant Rats
2. 1d6 Skeletons
3. 1d4 Zombies
4. 1 Gelatinous Cube
5. 1d6 Goblins
6. 1d4 Hobgoblins
7. 1 Gray Ooze
8. 1 Rust Monster
9. Wandering merchant (sells gear)
10. Other adventurers (hostile or friendly)
11. Nothing
12. Nothing

### Swamp (d12)
1. 2d6 Giant Leeches
2. 1d4+2 Lizardfolk
3. 1 Giant Crocodile
4. 1d6 Troglodytes
5. 1 Shambling Mound
6. 1d4 Will-o-Wisps
7. Quicksand
8. Disease (save or sick for 1d4 days)
9. Abandoned boat (supplies?)
10. Swamp hermit (knows secrets)
11. Nothing
12. Nothing

## Current Game State

**Location:** Jungle Temple (Tamoachan)
**Terrain:** Jungle
**Party Status:** Wounded, camped at temple entrance
**Time:** Day 2, morning
**Last Check:** None

## Next Check

**When:** 30 minutes from now (or when DM prompts)
**Terrain:** Jungle
**Chance:** 1 in 6 (16.7%)

## If Encounter Triggers

1. Roll d12 on Jungle table
2. Describe approach (sounds, smells, visual)
3. Determine surprise (2d6: 2 = party surprised, 3-5 = encounter surprised, 6+ = neither)
4. Roll initiative
5. Play out encounter

## Special Notes

- **Night encounters:** +1 to encounter roll (more dangerous)
- **Camping without watch:** Party automatically surprised
- **Loud activities:** +1 to encounter chance
- **Stealth movement:** -1 to encounter chance

## Time & Resource Tracking

### Spell Durations
**Active Spells:**
- Find Traps (Malice) - Cast: Hour 7, **EXPIRES: Hour 13** (6 rounds remaining)

**Spell Duration Rules:**
- 1 turn = 10 minutes
- 1 hour = 6 turns
- DM alerts player 2 turns before expiration
- When spell expires, effects end immediately

**Common Spell Durations:**
- Find Traps: 3 turns (30 minutes)
- Detect Magic: 2 turns (20 minutes)
- Light: 6 turns + 1/level (1+ hours)
- Invisibility: 24 hours or until attack
- Shield: 5 rounds/level (30 min at 6th level)
- Mirror Image: 6 turns (1 hour)
- Fireball: Instant
- Magic Missile: Instant
- Cure Light Wounds: Instant

### Torch & Light Tracking
**Active Light Sources:**
- Torch (Malice) - Lit: Hour 7, **BURNS OUT: Hour 8** (60 min remaining)

**Light Source Rules:**
- Torch: 1 hour duration
- Lantern (oil): 4 hours per pint
- Candle: 30 minutes
- Light spell: 1+ hours (see spells)
- Darkvision: Unlimited (racial ability)

**DM Alerts:**
- 15 minutes left: "Your torch flickers"
- 5 minutes left: "Your torch gutters, about to die"
- Expired: "Your torch goes out. Darkness."

### Supply Tracking
**Current Supplies (Malice):**
- Torches: 7 (1 burning, 6 packed)
- Rations: 9 days
- Waterskins: 2 (1 full, 1 empty)
- Oil (lantern): 0 pints

**Consumption Rules:**
- Rations: 1/day per person
- Water: 1 waterskin/day per person (jungle = +1 for humidity)
- Torch: 1/hour of dungeon exploration
- Rest without food: -1 HP per day, cumulative
- Rest without water: -2 HP per day, cumulative

**DM Alerts:**
- 3 days rations left: "Supplies running low"
- 1 day rations left: "Last day of food"
- No rations: "Starvation begins"

### Time of Day Tracking
**Current Time:** Day 2, Hour 13 (1:00 PM)
- Sunrise: Hour 6
- Sunset: Hour 18
- Night: Hours 18-6

**Time Effects:**
- Daylight: Normal vision, -1 Drow attack in bright sun
- Twilight: -1 to spot checks
- Night: Darkvision active, torches needed for humans
- Dungeon: Always dark, always need light (unless Drow)

### Exhaustion & Rest
**Current Status (Malice):**
- Rest: 4 hours (insufficient)
- Exhaustion level: 0

**Rest Rules:**
- Full rest: 8 hours, restores HP (1/day)
- Short rest: 1 hour, no HP, recover breath
- No rest: -1 to all rolls per day without sleep
- Forced march: +50% distance, -2 HP, save or exhaustion

**DM Alerts:**
- 24 hours no sleep: "You feel sluggish, reactions slow"
- 48 hours no sleep: "Hallucinations begin, -2 all rolls"
- 72 hours no sleep: "Collapse, automatic exhaustion"

## Integration

This file is read by the DM during heartbeat checks. Update terrain and location as party moves.

---

*The jungle is always watching.*
