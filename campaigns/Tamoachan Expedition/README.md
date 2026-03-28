# Tamoachan Expedition

## Hidden Shrine of Tamoachan (C1)

**Edition:** AD&D 1e  
**Created:** 3/28/2026

## Overview

This folder contains everything for the Hidden Shrine of Tamoachan campaign.

## Quick Links

- [Campaign State](campaign.json) - Current progress and tracking
- [Scenes Checklist](scenes_checklist.md) - What has been explored
- [Session Logs](sessions/) - Complete session history

## Scenes (12)

1. Jungle Approach - Dense jungle, ancient trail, overgrown ruins, humid air...
2. Temple Entrance - Overgrown Olman temple entrance, vines crawling weathered st...
3. Entry Hall - Steep stairs descending into darkness, ancient carvings, tra...
4. Chamber of Three Archways - Skull archway (left), Pool archway (center), Tlaloc archway ...
5. Hall of the Glyphs - Walls covered in Olman writing, magical warnings, history of...
6. Pool Chamber - Underground cenote with crystal water, offerings visible bel...
7. Shrine of Tlaloc - Ancient shrine to Tlaloc, blood-stained altar, glowing glyph...
8. Tomb of the Olman King - Sealed tomb, mummified remains, treasure and traps, royal bu...
9. Natural Cavern - Limestone caverns, stalactites, underground river, biolumine...
10. Cultist Quarters - Living area, sleeping mats, cooking fires, evidence of recen...
11. Sacrifice Chamber - Hidden chamber, bloodstained altar, ritual implements, fresh...
12. Treasure Vault - Hidden cache, Olman gold, jade, turquoise, trapped chests...

## Monsters Encountered

- goblin
- skeleton
- zombie
- ghoul
- wight
- lizard man
- giant spider
- basilisk
- mummy
- giant centipede
- poisonous snake
- crocodile
- jaguar

## Key NPCs

- Tomas the Survivor
- Villager Woman
- Cult Leader Xilonen
- The Olman King (mummy)

## Folder Guide

- **sessions/** - Write session logs here after each game
- **maps/** - Save ASCII maps and location diagrams
- **images/** - Store generated images for scenes and monsters
- **logs/** - Combat logs, treasure logs, etc.
- **npcs/** - Notes on NPCs, their motivations, interactions
- **treasure/** - List of found treasure and who has what
- **handouts/** - Anything given to players

## Using the Game Engine

```bash
# Show current campaign status
node game-engine.js campaign status

# Log a session event
node game-engine.js campaign log "Party entered the dungeon"

# Update scene status
node game-engine.js campaign scene "Antechamber" --visited

# Track monster kill
node game-engine.js campaign kill goblin 3

# Add treasure
node game-engine.js campaign treasure "100 gp, +1 sword"

# Award XP
node game-engine.js campaign xp 500
```

---
*Campaign folder created by D&D Campaign Manager*
