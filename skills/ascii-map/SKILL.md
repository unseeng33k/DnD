# ASCII Map Skill for D&D

Simple, clear dungeon maps that show party location at a glance.

## Purpose

The ASCII Map Skill:
- Generates clean, readable dungeon maps
- Shows party location clearly
- Updates automatically as party moves
- Works with any dungeon layout

## Usage

```bash
# Show current map
node ascii-map.js show

# Update party location
node ascii-map.js move "Room 3"

# Add discovered room
node ascii-map.js discover "Room 5"

# Create new dungeon
node ascii-map.js create "temple" 5x5

# Export for session
node ascii-map.js export
```

## Map Symbols

```
# = Wall          . = Floor          @ = Party location
+ = Door          ^ = Stairs up      v = Stairs down
~ = Water         ^ = Trap           ? = Unexplored
```

## Integration

The skill auto-invokes when DM says:
- "Show me the map"
- "Where are we?"
- "Draw the map"

## Map Style

Simple grid format:
```
    1 2 3 4 5
  A # # # # #
  B # . @ . #
  C # + # + #
  D # . . . #
  E # # # # #
```

Party location (@) always visible.
