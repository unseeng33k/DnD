# Visual DM System

## Overview

Every encounter gets visual reference. Every environment has mood imagery. Every monster has a face you can see before it eats yours.

## Features

### 1. Monster Reference Library

Searchable database of classic AD&D monsters with:
- Official TSR art references
- Descriptive tags for image search
- AI generation prompts
- Stat block summaries

**Usage:**
```
node visual.js monster "umber hulk"
→ Shows description + image search links + AI prompt
```

### 2. Environment Mood Boards

Every common dungeon/jungle/temple environment:
- Reference photos
- Color palettes
- Lighting notes
- Soundscape suggestions

**Usage:**
```
node visual.js env "jungle temple"
→ Curated reference images + atmosphere notes
```

### 3. Battle Scene Generation

Generate AI prompts for key combat moments:
- Party composition
- Enemy types
- Environment
- Lighting/weather
- Action moment

**Usage:**
```
node visual.js battle --party="fighter,mage,thief" --enemies="6 lizardfolk" --env="swamp temple" --moment="ambush"
→ Detailed prompt for AI image generation
```

### 4. Session Visual Log

Auto-generates visual references for each session:
- Locations visited
- Monsters encountered
- Key NPCs met
- Epic moments

## Image Sources

**Official References:**
- AD&D Monster Manual illustrations
- Module artwork (when available)
- Classic TSR artist styles (Trampier, Otus, Dee, etc.)

**Web Search:**
- "[monster name] dnd art"
- "[environment] fantasy landscape"
- "[description] rpg battle scene"

**AI Generation:**
- Optimized prompts for Midjourney, DALL-E, Stable Diffusion
- Style references: "1970s TSR module art style"
- Mood keywords: "atmospheric, torchlit, ominous"

## Example Outputs

**Monster: Umber Hulk**
```
TSR Reference: MM1 p. 95, Trampier illustration
Web Search: https://www.google.com/search?q=umber+hulk+dnd+art&tbm=isch
AI Prompt: "Umber hulk monster, insectoid ape creature, mandibles, 
confusing gaze, underground cavern, 1970s D&D art style, 
ink and watercolor, atmospheric lighting"
```

**Environment: Jungle Temple (Tamoachan)**
```
Mood: Humid, decaying, ancient, overgrown
Colors: Deep greens, weathered stone grays, moss, gold accents
Lighting: Dappled sunlight through canopy, torchlit interiors
Sounds: Parrots, insects, distant waterfalls, stone grinding
References: Mayan ruins, Angkor Wat, Palenque
```

**Battle Scene:**
```
AI Prompt: "Three adventurers fighting lizardfolk warriors in 
ancient swamp temple, torchlight, water reflections, 
1979 D&D module art style, Erol Otus style, dynamic action, 
atmospheric, ink illustration with watercolor washes"
```

## Integration

During gameplay, DM can call:
- "Show me what a gibbering mouther looks like"
- "Generate a battle scene of this fight"
- "What's the vibe of the next room?"

Visuals appear as:
- Text descriptions for immersion
- Search links for quick reference
- AI prompts for generated artwork

## The Goal

You see what your character sees. The umber hulk isn't just stats — it's mandibles and confusion and that moment of "what the hell IS that thing?" The jungle temple isn't just "Room 12" — it's humidity and decay and the feeling that something ancient is watching.

Every scene gets a face. Every monster gets teeth. Every moment gets visual weight.

*Now roll for initiative, and picture this...*
