# Loot & Treasure Tracking System

## Purpose
Track all items, treasure, and loot acquired by characters with session details.

## File Structure
```
campaigns/<campaign>/
  loot/
    acquisition_log.json    - All items acquired
    identified_items.json   - Items that have been identified
    pending_id.json         - Unidentified items waiting for ID
```

## Acquisition Log Format
```json
{
  "acquisitions": [
    {
      "date": "2026-03-28",
      "session": "Session 1",
      "character": "Malice Indarae De'Barazzan",
      "item": "Armor of the Sunken King",
      "type": "armor",
      "bonus": "+3",
      "identified": true,
      "identified_by": "Detect Magic + Legend Lore",
      "location": "Tomb of the Olman King",
      "source": "Treasure hoard",
      "value_gp": 15000,
      "notes": "Ancient Olman armor with water breathing power"
    }
  ]
}
```

## Daily Memory Integration
After each session, update memory/YYYY-MM-DD.md with:
- All loot acquired
- Items identified
- GP/XP earned
- Important discoveries

## Character Sheet Updates
When items are acquired:
1. Add to character sheet immediately
2. Mark as "(Unidentified)" if not yet ID'd
3. Update with full details once identified
4. Include acquisition notes (where/when found)

## Pre-Game Check Integration
The pregame-check.js should verify:
- All items on sheet match acquisition log
- No unidentified items marked as identified
- Values are correct
- Special abilities are documented
