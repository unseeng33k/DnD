# Curse of Strahd

## Ravenloft (I6)

**Edition:** AD&D 1e  
**Created:** 3/28/2026

## Overview

This folder contains everything for the Ravenloft campaign.

## Quick Links

- [Campaign State](campaign.json) - Current progress and tracking
- [Scenes Checklist](scenes_checklist.md) - What has been explored
- [Session Logs](sessions/) - Complete session history

## Scenes (15)

1. Village of Barovia - Misty village, frightened villagers, gothic architecture, bl...
2. Blood on the Vine Tavern - Warm fire, locals whispering, fear in the air, Arik the bart...
3. Church of St. Andral - Holy ground, Father Donavich praying, Doru trapped in baseme...
4. Madame Evas Camp - Vistani camp outside village, tarokka card reading, prophecy...
5. Old Svalich Road - Misty road through the woods, wolf howls, carriage ruts...
6. Gates of Ravenloft - Iron gates, raven statues, thunder crashes, castle looming a...
7. Castle Courtyard - Overgrown garden, crumbling statues, fountain with red water...
8. Castle Entrance Hall - Massive staircase, portraits of Strahd, suits of armor...
9. K78 Dining Hall - Dusty feast, rotting food, phantom servants, organ music...
10. K67 Chapel - Desecrated altar, unholy symbols, Strahds place of power...
11. K88 Crypts - Ancient crypts, vampire spawn, Strahds brides, sarcophagi...
12. K87 Strahds Tomb - Final resting place, Strahds coffin, confrontation with the ...
13. K20 Library - Dusty tomes, magical research, history of Barovia...
14. K34 Treasury - Gold and jewels, trapped chests, artifacts...
15. K50 Tower Peak - Highest tower, lightning rod, view of Barovia, heart of sorr...

## Monsters Encountered

- vampire
- vampire spawn
- wolf
- dire wolf
- werewolf
- zombie
- skeleton
- ghost
- banshee
- ghoul
- wight
- wraith
- spectre
- hell hound
- bat
- rat
- swarm
- animated armor
- flying sword

## Key NPCs

- Strahd von Zarovich
- Ireena Kolyana
- Madame Eva
- Father Donavich
- Ismark Kolyanovich
- Rahadin
- Escher
- Patrina Velikovna

## Folder Guide

- **sessions/** - Write session logs here after each game
- **maps/** - Save ASCII maps and location diagrams
- **images/** - Store generated images for scenes and monsters
- **ambiance/** - Scene ambiance descriptions and YouTube links
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
