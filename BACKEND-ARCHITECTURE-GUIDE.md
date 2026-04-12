# COMPLETE BACKEND ARCHITECTURE GUIDE

## How the System Works + What Needs Improvement

---

## PART 1: HOW MODULES ARE CREATED & POPULATED

### Current System

```
modules/
├── curse-of-strahd/
│   ├── metadata.json          (Adventure definition)
│   ├── party.json             (Pre-configured characters)
│   ├── locations/             (Predefined locations)
│   ├── encounters/            (Combat encounters)
│   └── npcs/                  (Named characters)
```

**Current Workflow:**
1. Create `modules/your-module-id/` directory manually
2. Create metadata.json by hand
3. Create party.json with character data
4. Create location JSON files one by one
5. Create encounter files one by one
6. Create NPC files one by one

**Problem:** Manual, tedious, error-prone.

---

## PART 2: MODULE GENERATOR SYSTEM (SOLUTION)

We need a **ModuleBuilder** that automates module creation:

```javascript
class ModuleBuilder {
  constructor(moduleId, moduleName, author = 'DM') {
    this.moduleId = moduleId;           // 'curse-of-strahd'
    this.name = moduleName;             // 'Curse of Strahd'
    this.author = author;
    this.moduleDir = `modules/${moduleId}`;
    this.metadata = {};
    this.party = {};
    this.locations = [];
    this.encounters = [];
    this.npcs = [];
  }

  // Step 1: Define module metadata
  setMetadata(config) {
    this.metadata = {
      id: this.moduleId,
      name: this.name,
      description: config.description,
      level: config.level,           // [3, 10]
      length: config.length,         // 'short', 'medium', 'long'
      setting: config.setting,
      themes: config.themes,
      ruleSet: config.ruleSet || 'AD&D 1e',
      partySize: config.partySize || [4, 6],
      estimatedPlayTime: config.estimatedPlayTime
    };
  }

  // Step 2: Add characters to party
  addPartyMember(character) {
    if (!this.party.members) this.party.members = [];
    this.party.members.push({
      name: character.name,
      class: character.class,
      level: character.level,
      hp: character.hp,
      maxHP: character.maxHP,
      ac: character.ac,
      spellSlots: character.spellSlots || {},
      hitDice: character.hitDice || {},
      abilities: character.abilities || [],
      alignment: character.alignment,
      // NEW: Personality & flavor
      personality: character.personality,
      background: character.background,
      motivations: character.motivations,
      fears: character.fears,
      relationships: character.relationships // With other party members
    });
  }

  // Step 3: Add locations
  addLocation(location) {
    this.locations.push({
      id: location.id,
      name: location.name,
      description: location.description,
      type: location.type,           // dungeon, town, wilderness, npc-lair
      level: location.level,
      encounters: location.encounters || [],
      npcs: location.npcs || [],
      connections: location.connections || [],
      atmosphere: location.atmosphere,
      music: location.music,
      secrets: location.secrets || []
    });
  }

  // Step 4: Add encounters
  addEncounter(encounter) {
    this.encounters.push({
      id: encounter.id,
      name: encounter.name,
      locationId: encounter.locationId,
      difficulty: encounter.difficulty,
      enemies: encounter.enemies,
      objectives: encounter.objectives,
      rewards: encounter.rewards,
      special: encounter.special
    });
  }

  // Step 5: Add NPCs
  addNPC(npc) {
    this.npcs.push({
      id: npc.id,
      name: npc.name,
      role: npc.role,
      alignment: npc.alignment,
      class: npc.class,
      level: npc.level,
      personality: npc.personality,
      motives: npc.motives,
      plot_hooks: npc.plot_hooks,
      // NEW: NPC relationships with other NPCs
      relationships: npc.relationships,
      stat_block: npc.stat_block,
      // NEW: Memory system for NPCs
      memory: npc.memory || {
        interactionsWithParty: [],
        promisesMade: [],
        reputation: 0
      }
    });
  }

  // Step 6: Build and write all files
  async build() {
    // Create directories
    // Write metadata.json
    // Write party.json
    // Write all location files
    // Write all encounter files
    // Write all NPC files
    // Validate everything
    // Return summary
  }
}
```

**Usage:**
```javascript
const module = new ModuleBuilder('curse-of-strahd', 'Curse of Strahd');

// 1. Set module info
module.setMetadata({
  description: 'Gothic horror adventure...',
  level: [3, 10],
  length: 'long',
  themes: ['gothic', 'horror']
});

// 2. Add party members
module.addPartyMember({
  name: 'Malice Indarae De\'Barazzan',
  class: 'Rogue',
  level: 3,
  hp: 24,
  personality: 'Cynical rogue, trusts no one... yet',
  background: 'Orphan from Waterdeep',
  motivations: ['Survival', 'Finding family', 'Redemption'],
  fears: ['Abandonment', 'Becoming evil'],
  relationships: { 'Grond': 'reluctant ally', 'Theron': 'growing trust' }
});

// 3. Add locations
module.addLocation({
  id: 'castle-ravenloft',
  name: 'Castle Ravenloft',
  // ... all location data
});

// 4. Add encounters
module.addEncounter({
  id: 'strahd-throne-room',
  // ... all encounter data
});

// 5. Add NPCs
module.addNPC({
  id: 'strahd-von-zarovich',
  // ... all NPC data with relationships & memory
});

// 6. Build the module
await module.build();
// ✅ Module created and validated
```

---

## PART 3: PARTY SYSTEM - HANDLING MULTIPLE CHARACTERS

### Current Problem
- Party loaded from template
- All characters treated equally
- No personality differentiation
- No inter-party relationships

### Solution: Full Party System

```javascript
class PartyManager {
  constructor() {
    this.members = new Map();
    this.relationships = new Map();      // Party dynamics
    this.morale = 100;                   // Party cohesion
    this.goals = [];                     // Party objectives
    this.secrets = [];                   // Hidden conflicts
  }

  addMember(character) {
    this.members.set(character.name, {
      name: character.name,
      class: character.class,
      level: character.level,
      hp: character.maxHP,
      maxHP: character.maxHP,
      ac: character.ac,
      
      // PERSONALITY & VOICE
      personality: {
        archetype: character.archetype,  // 'hero', 'rogue', 'cleric'
        traits: character.traits,        // 'cynical', 'brave', 'cautious'
        mannerisms: character.mannerisms, // How they speak/act
        humor: character.humor,          // Dry? Sarcastic? Earnest?
        dialect: character.dialect,      // Accent, word choice
        catchphrases: character.catchphrases
      },
      
      // MOTIVATIONS & FEARS
      goals: {
        primary: character.primaryGoal,   // 'Escape Barovia'
        secondary: character.secondaryGoals, // 'Protect Ireena', 'Avenge family'
        hidden: character.hiddenGoal     // Secret agenda
      },
      
      fears: character.fears,            // What scares them
      triggers: character.triggers,      // What angers/saddens them
      
      // RELATIONSHIPS WITH OTHER PARTY MEMBERS
      relationships: character.relationships,
      // { 'Grond': 'respects', 'Theron': 'mistrusts', 'Sylvara': 'attracts' }
      
      // RESOURCES
      spellSlots: character.spellSlots || {},
      hitDice: character.hitDice || {},
      conditions: [],
      items: character.items || [],
      
      // CHARACTER ARC
      arc: {
        startingTrait: character.startingTrait,
        currentTrait: character.currentTrait,
        nextTest: character.nextTest,
        completionPoint: character.arcCompletion
      }
    });
  }

  // Party dynamics: conflict + bonding
  setRelationship(char1, char2, relationship) {
    const key = [char1, char2].sort().join('↔');
    this.relationships.set(key, {
      character1: char1,
      character2: char2,
      relationship: relationship,  // 'trust', 'tension', 'romance', 'rivalry'
      strength: 0,                // -10 to +10 (negative=conflict, positive=bonded)
      history: []                 // Interaction history
    });
  }

  // Update relationship based on events
  recordInteraction(char1, char2, event, emotionalWeight) {
    const key = [char1, char2].sort().join('↔');
    const rel = this.relationships.get(key);
    if (!rel) return;
    
    rel.history.push({
      event,
      timestamp: new Date().toISOString(),
      weight: emotionalWeight
    });
    
    // Adjust strength based on event
    if (event.includes('trust')) rel.strength += emotionalWeight;
    if (event.includes('betrayal')) rel.strength -= emotionalWeight;
  }

  // Party morale affected by combat results, character death, major decisions
  updateMorale(delta) {
    this.morale = Math.max(0, Math.min(100, this.morale + delta));
    
    if (this.morale < 30) {
      return { status: 'broken', effect: 'Party losing hope' };
    } else if (this.morale < 60) {
      return { status: 'wavering', effect: 'Some doubt emerging' };
    } else {
      return { status: 'strong', effect: 'Party cohesion solid' };
    }
  }

  // Get party composition for combat
  getForCombat() {
    return Array.from(this.members.values()).map(m => ({
      name: m.name,
      class: m.class,
      hp: m.hp,
      ac: m.ac
    }));
  }

  // Describe the party as a group (not individuals)
  describeParty() {
    const members = Array.from(this.members.values());
    return {
      size: members.length,
      composition: members.map(m => m.class).join('/'),
      averageLevel: Math.floor(members.reduce((s, m) => s + m.level, 0) / members.length),
      morale: this.morale,
      relationships: Array.from(this.relationships.values())
    };
  }
}
```

---

## PART 4: CHARACTER PERSONALITY & VOICE SYSTEM

### The Real Innovation

Currently: Characters are stat blocks.
Should be: Characters have distinct personalities, speech patterns, goals, fears.

```javascript
class CharacterPersonality {
  constructor(characterData) {
    this.name = characterData.name;
    
    // ARCHETYPE (how they fit in the party)
    this.archetype = characterData.archetype;  // 'leader', 'support', 'wildcard', 'heart'
    
    // PERSONALITY TRAITS
    this.traits = {
      openness: characterData.traits?.openness || 5,    // 1-10: reserved to open
      aggressiveness: characterData.traits?.aggressiveness || 5, // 1-10: passive to aggressive
      humor: characterData.traits?.humor || 'dry',      // 'dry', 'sarcastic', 'earnest', 'dark'
      riskTolerance: characterData.traits?.riskTolerance || 5, // 1-10: cautious to reckless
      compassion: characterData.traits?.compassion || 5  // 1-10: selfish to altruistic
    };
    
    // VOICE & SPEECH
    this.voice = {
      dialect: characterData.voice?.dialect,             // Accent: 'southern', 'noble', 'street'
      mannerisms: characterData.voice?.mannerisms || [], // "Scratches chin when thinking"
      catchphrases: characterData.voice?.catchphrases || [], // "Here's the rub..."
      vocabulary: characterData.voice?.vocabulary,       // 'formal', 'casual', 'poetic'
      speed: characterData.voice?.speed                  // 'fast', 'measured', 'slow'
    };
    
    // MOTIVATIONS & GOALS
    this.motivations = {
      primary: characterData.primaryGoal,                // Main motivation
      secondary: characterData.secondaryGoals || [],     // Supporting goals
      hidden: characterData.hiddenGoal                   // Secret agenda
    };
    
    // FEARS & TRIGGERS
    this.fears = characterData.fears || [];
    this.angers = characterData.angers || [];            // What sets them off
    this.saddens = characterData.saddens || [];          // What hurts them
    
    // RELATIONSHIP TEMPLATES
    this.relationshipStyles = {
      toAuthority: characterData.relationshipStyles?.toAuthority || 'respectful',
      toLowerClasses: characterData.relationshipStyles?.toLowerClasses || 'neutral',
      toElves: characterData.relationshipStyles?.toElves || 'neutral',
      toMagic: characterData.relationshipStyles?.toMagic || 'neutral'
    };
  }

  /**
   * Generate dialogue based on personality
   */
  speak(situation, emotionalState = 'neutral') {
    const scripts = {
      greeting: {
        reserved: "Greetings.",
        open: "Hey there! How goes it?",
        formal: "A pleasure to make your acquaintance.",
        street: "Yo, what's up?"
      },
      fear: {
        courageous: "Let's face this head-on.",
        cautious: "I'm not sure about this...",
        cowardly: "We should retreat immediately!"
      },
      anger: {
        calm: "That was unacceptable.",
        aggressive: "You WHAT?!",
        strategic: "We'll deal with this."
      }
    };
    
    // Select response based on personality traits
    const responseArchetype = this.traits.openness > 7 ? 'open' : 'reserved';
    const emotionalResponse = scripts[situation]?.[emotionalState] || "...";
    
    return emotionalResponse;
  }

  /**
   * Decision-making based on personality
   */
  wouldAgreeWith(proposal) {
    const alignmentScore = 
      (this.traits.aggressiveness > 7 ? +1 : -1) * (proposal.riskLevel || 0) +
      (this.traits.compassion > 7 ? +1 : -1) * (proposal.helpfulnessLevel || 0);
    
    return {
      agrees: alignmentScore > 0,
      confidence: Math.abs(alignmentScore),
      reasoning: this.motivations.primary
    };
  }

  /**
   * Reaction to events
   */
  reactTo(event) {
    if (this.fears.includes(event.type)) {
      return { reaction: 'fear', intensity: 'high' };
    }
    if (this.angers.includes(event.type)) {
      return { reaction: 'anger', intensity: 'high' };
    }
    if (this.saddens.includes(event.type)) {
      return { reaction: 'sadness', intensity: 'high' };
    }
    
    // Neutral response based on personality
    return { reaction: 'neutral', intensity: 'low' };
  }

  /**
   * How character changes over time
   */
  growTrait(trait, direction = 1) {
    this.traits[trait] = Math.max(1, Math.min(10, this.traits[trait] + direction));
    // Character is evolving!
  }
}
```

### Example: Making Malice Feel Real

```javascript
const malice = new CharacterPersonality({
  name: 'Malice Indarae De\'Barazzan',
  archetype: 'wildcard',  // Unpredictable, self-interested → slowly becomes 'heart'
  traits: {
    openness: 3,          // Very reserved
    aggressiveness: 7,    // Quick to attack
    humor: 'dark',        // Gallows humor
    riskTolerance: 8,     // Reckless
    compassion: 2         // Doesn't care... yet
  },
  voice: {
    dialect: 'street',
    mannerisms: [
      "Eyes dart to exits",
      "Fingers tap dagger hilt",
      "Half-smile when nervous"
    ],
    catchphrases: [
      "That's not my problem.",
      "Let's just rob the place.",
      "I've done worse."
    ],
    vocabulary: 'casual',
    speed: 'fast'
  },
  primaryGoal: 'Survive, by any means',
  secondaryGoals: ['Earn enough gold to disappear', 'Find her lost sister'],
  hiddenGoal: 'Prove she\'s not as broken as she thinks',
  fears: ['Abandonment', 'Being caged', 'Becoming evil like her mother'],
  angers: ['Weakness', 'Pity', 'Authority'],
  saddens: ['Children in danger', 'Betrayal by allies']
});

// EARLY CAMPAIGN (Session 1-5)
malice.relationshipStyles.toAuthority = 'defiant';
malice.traits.openness = 3;  // Very closed off

// MID CAMPAIGN (Session 15-20)
// Through interactions, Malice starts to change
malice.growTrait('compassion', +1);  // Cares about party
malice.growTrait('openness', +1);    // Slowly trusting
malice.relationshipStyles.toAuthority = 'respectful';  // Respects Grond now

// CHARACTER ARC COMPLETE (Session 40+)
malice.archetype = 'heart';          // Became the moral center
malice.primaryGoal = 'Protect her companions at any cost';
malice.traits.compassion = 8;        // Now genuinely cares
```

---

## PART 5: NPC RELATIONSHIP SYSTEM

NPCs aren't just stat blocks. They have relationships with:
- Other NPCs
- The party
- Factions
- Hidden agendas

```javascript
class NPCRelationshipNetwork {
  constructor() {
    this.npcs = new Map();
    this.relationships = new Map();  // NPC-to-NPC relationships
    this.factions = new Map();       // Faction allegiances
    this.secrets = [];               // Hidden connections
  }

  addNPC(npc) {
    this.npcs.set(npc.id, {
      name: npc.name,
      role: npc.role,
      personality: npc.personality,
      
      // Relationships with OTHER NPCs
      relationships: npc.relationships || {},
      // { 'strahd': 'fears', 'rahadin': 'servant', 'ireena': 'protects' }
      
      // Relationships with PARTY
      partyReputation: 0,              // -100 to +100
      partyInteractions: [],           // History with party
      
      // Faction allegiances
      factions: npc.factions || {},    // { 'Order of the Silver Hand': 50 }
      
      // Secrets
      secrets: npc.secrets || [        // What they're hiding
        { secret: 'Secretly aligned with Strahd', knownBy: ['Rahadin'] }
      ],
      
      // Motivations
      goals: npc.goals || [],
      fears: npc.fears || [],
      
      // Memory of party interactions
      memory: {
        firstMeeting: null,
        promises: [],
        betrayals: [],
        favorsOwed: []
      }
    });
  }

  // Party does something that affects NPC reputation
  recordPartyInteraction(npcId, partyAction, emotionalWeight) {
    const npc = this.npcs.get(npcId);
    if (!npc) return;
    
    npc.partyReputation += emotionalWeight;
    npc.memory.partyInteractions.push({
      action: partyAction,
      timestamp: new Date().toISOString(),
      weight: emotionalWeight
    });
    
    // If party breaks a promise, NPC REMEMBERS
    if (partyAction === 'broke-promise') {
      npc.memory.betrayals.push({
        promise: 'What they promised',
        when: 'When they broke it',
        consequence: 'NPC becomes enemy OR demands compensation'
      });
      npc.partyReputation -= 50;  // Major hit
    }
  }

  // Get how NPC feels about party NOW
  getNPCFeelingsAboutParty(npcId) {
    const npc = this.npcs.get(npcId);
    if (!npc) return null;
    
    if (npc.partyReputation > 50) return 'allied';
    if (npc.partyReputation > 20) return 'friendly';
    if (npc.partyReputation > -20) return 'neutral';
    if (npc.partyReputation > -50) return 'hostile';
    return 'enemy';
  }

  // NPC network effects: If Strahd is angered, Rahadin comes for party
  checkConsequences(npcStatusChange) {
    const cascades = [];
    
    for (const [npcId, npc] of this.npcs.entries()) {
      if (npc.relationships[npcStatusChange.npcId]) {
        cascades.push({
          npc: npc.name,
          consequence: `${npc.name} hears that ${npcStatusChange.npcId} was ${npcStatusChange.status}`,
          reaction: this.calculateReaction(npc, npcStatusChange)
        });
      }
    }
    
    return cascades;
  }
}
```

---

## PART 6: SYSTEM IMPROVEMENTS NEEDED

### 1. **Module Generation System**
   - [ ] ModuleBuilder class (automates module creation)
   - [ ] CLI tool for creating new modules
   - [ ] Validation system (checks all required files)
   - [ ] Template system (pre-built location/encounter/NPC formats)

### 2. **Party Management**
   - [ ] PartyManager class (tracks all members)
   - [ ] Relationship tracking (who trusts/mistrusts whom)
   - [ ] Party morale system (affects behavior)
   - [ ] Group objectives (shared + personal goals)

### 3. **Character Personality**
   - [ ] CharacterPersonality class (speech, mannerisms, goals)
   - [ ] Personality-based dialogue system
   - [ ] Character arc tracking
   - [ ] Personality changes during campaign
   - [ ] Decision-making based on traits

### 4. **NPC Intelligence**
   - [ ] NPCRelationshipNetwork (who knows/trusts whom)
   - [ ] NPC memory system (remembers player actions)
   - [ ] Consequence cascades (one NPC action affects others)
   - [ ] Secret network (hidden alliances, betrayals)

### 5. **Party Dynamics**
   - [ ] Inter-party conflict system
   - [ ] Romance/rivalry mechanics
   - [ ] Group decision-making (majority rule? consensus?)
   - [ ] Party split scenarios (what if some go left, some go right?)

### 6. **Memory & Consequences**
   - [ ] NPC remembers broken promises
   - [ ] Faction reputation persists
   - [ ] World state changes stick around
   - [ ] Character arc completion unlocks new story branches

---

## PART 7: EXAMPLE - CREATING "LOST SHRINE OF TAMOACHAN"

```javascript
// 1. Create module builder
const tamoachan = new ModuleBuilder('lost-shrine-tamoachan', 'Lost Shrine of Tamoachan');

// 2. Define module
tamoachan.setMetadata({
  description: 'A jungle exploration adventure with temple exploration and puzzle-solving',
  level: [3, 5],
  length: 'medium',
  themes: ['jungle', 'exploration', 'ancient-temple', 'puzzles'],
  partySize: [4, 6],
  estimatedPlayTime: '20-30 sessions'
});

// 3. Add party members
tamoachan.addPartyMember({
  name: 'Theron Ironhammer',
  class: 'Cleric',
  level: 3,
  hp: 26,
  personality: 'Monk-like, patient, wise',
  motivations: ['Understand the ancient temple', 'Protect the weak'],
  relationships: { 'Malice': 'trusts deeply' }
});

// 4. Add locations
tamoachan.addLocation({
  id: 'shrine-entrance',
  name: 'Ancient Temple Entrance',
  description: 'Vines hang from crumbling stone. Carvings cover the walls.',
  type: 'dungeon',
  encounters: ['jungle-guardians', 'trapped-vestibule'],
  npcs: []
});

// 5. Build module
await tamoachan.build();
// ✅ Module created with all structure
```

---

## PART 8: THE VISION

Current system: Rules engine + image delivery
Next level: Character-driven narrative with personality, relationships, consequences

Every character (PC and NPC) has:
- **Personality** (how they think, speak, act)
- **Relationships** (who they trust/hate/love)
- **Goals** (what they want)
- **Secrets** (what they're hiding)
- **Memory** (what they remember about party)

When party makes decision:
- Personality system determines how character reacts
- Relationship system determines alliance shifts
- Consequence system cascades effects through world
- Memory system ensures consistency

**This is what makes campaigns LEGENDARY.**

Not mechanics. Story.
Not rules. Character.
Not simulation. Myth.

---

## NEXT BUILD TASKS (Priority Order)

1. **ModuleBuilder** - Automate module creation
2. **PartyManager** - Track all party members + relationships
3. **CharacterPersonality** - Make each character feel real
4. **NPCRelationshipNetwork** - NPCs are alive, not static
5. **Consequence Cascade System** - One decision affects entire world
6. **CLI Module Creator** - Easy command-line module generation

**Status: Ready to build.** 🎭✨
