╔═══════════════════════════════════════════════════════════════════════════╗
║                    DND PROJECT: LEGACY CODE AUDIT                         ║
║                                                                           ║
║  This document identifies OLD code that needs deliberate integration      ║
║  into the NEW clean architecture (src/core, src/systems, src/registries) ║
║                                                                           ║
║  DO NOT AUTO-MERGE. We integrate ONE system at a time.                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
CLEAN ARCHITECTURE (CURRENT STATE)
═════════════════════════════════════════════════════════════════════════════

✅ src/core/
  • event-bus.js - Central event system
  • turn-pipeline.js - Action execution pipeline
  • registry.js - Registration system
  • effect-runtime.js - Effect execution

✅ src/systems/
  • quest-system.js
  • ambiance-system.js
  • mechanic-system.js
  • world-system.js
  • ui-system.js

✅ src/registries/
  • intent-registry.js
  • rule-registry.js
  • ambiance-registry.js
  • effect-registry.js
  • world-registry.js

✅ src/effects/
  • mechanical-effect.js
  • ambiance-effect.js
  • narrative-effect.js
  • world-state-effect.js

═════════════════════════════════════════════════════════════════════════════
LEGACY CODE INVENTORY (ROOT + SKILLS)
═════════════════════════════════════════════════════════════════════════════

PRIORITY 1: MOST VALUABLE (Integration target: NEXT)
───────────────────────────────────────────────────────────────────────────

1. DM-MEMORY-SYSTEM.js (601 lines)
   STATUS: Fully functional, heavily used
   WHAT IT DOES:
     • RuleDatabase - DMG/PHB rule lookups
     • CharacterDatabase - searchable character abilities
     • EventTimeline - session event log (what happened, when, by whom)
     • DecisionTrail - audit log of DM rulings (consistency checking)
     • NPCDatabase - NPC tracking with relationships
   
   CURRENT API:
     - memory.logEvent('combat', description, details)
     - memory.lookupRule('advantage')
     - memory.getCharacterAbility('Malice', 'sneak_attack')
     - memory.recordRuling(decision, reasoning, ruleRef, impact)
     - memory.getNPCQuickRef(name)
   
   NEEDS INTEGRATION INTO:
     • Turn pipeline as event logger (emit to eventBus)
     • Rule registry as lookup system
     • World state for NPC tracking
     • Decision audit trail (new effect type?)
   
   VALUE: HIGH - This is DM's brain. Essential for sessions.

───────────────────────────────────────────────────────────────────────────

2. PARTY-SYSTEM.js (456 lines)
   STATUS: Fully functional, core gameplay
   WHAT IT DOES:
     • Initiative and turn order management
     • Reaction time (DEX-based)
     • HP/damage tracking
     • Combat round management
     • Party composition tracking
   
   CURRENT API:
     - party.rollInitiative()
     - party.startCombat()
     - party.nextTurn()
     - party.damagePartyMember(name, damage)
     - party.getPartyStatus()
   
   NEEDS INTEGRATION INTO:
     • Spotlight scheduler (turn order = spotlight order)
     • Mechanical state (damage/healing)
     • Turn pipeline (each turn is a turn-pipeline.execute())
   
   VALUE: CRITICAL - Without this, no combat works.

───────────────────────────────────────────────────────────────────────────

3. skills/combat-tracker.js (133 lines)
   STATUS: Simplified combat system (subset of party-system)
   WHAT IT DOES:
     • Initiative tracking
     • Round/turn management
     • HP damage & healing
     • Condition tracking
   
   CURRENT API:
     - tracker.startCombat(participants)
     - tracker.damage(name, amount)
     - tracker.nextTurn()
     - tracker.addCondition(name, condition)
   
   NEEDS INTEGRATION INTO:
     • Mechanical-effect.js (damage is an effect)
     • Turn-pipeline (turn order = initiative)
   
   VALUE: MEDIUM - Duplicate of party-system, but simpler. Could be refactored.

───────────────────────────────────────────────────────────────────────────

PRIORITY 2: VALUABLE (Integration target: PHASE 2)
───────────────────────────────────────────────────────────────────────────

4. skills/npc-manager/ (directory)
   STATUS: Unknown - need to inspect
   WHAT IT LIKELY DOES:
     • NPC creation/management
     • Relationship tracking
     • Dialogue/interaction system
   
   NEEDS INTEGRATION INTO:
     • World-system (NPCs are world entities)
     • NPC database in DM-memory
   
   VALUE: HIGH - NPCs are essential to gameplay

───────────────────────────────────────────────────────────────────────────

5. skills/ambiance-agent/ (directory)
   STATUS: Unknown - need to inspect
   WHAT IT LIKELY DOES:
     • Scene setting
     • Music/atmosphere
     • Visual descriptions
   
   NEEDS INTEGRATION INTO:
     • Ambiance-system (already exists)
     • Turn-pipeline (ambiance resolves every turn)
   
   VALUE: HIGH - Makes game immersive

───────────────────────────────────────────────────────────────────────────

PRIORITY 3: USEFUL (Integration target: PHASE 3)
───────────────────────────────────────────────────────────────────────────

6. skills/encounter-generator.js
   STATUS: Unknown
   VALUE: MEDIUM - Creates combat encounters on demand

7. skills/treasure-generator.js
   STATUS: Unknown
   VALUE: MEDIUM - Creates loot

8. skills/quest-generator.js
   STATUS: Unknown
   VALUE: MEDIUM - Generates quests

9. Other skills/ (puzzle-trap, dungeon-gen, monster-ecology, faction-system, etc.)
   STATUS: Unknown
   VALUE: VARIES - Some useful, some dead weight

═════════════════════════════════════════════════════════════════════════════
ROOT-LEVEL LEGACY FILES (NOT IN src/)
═════════════════════════════════════════════════════════════════════════════

⚠️  THESE SHOULD BE MOVED TO archive/ OR CAREFULLY INTEGRATED:

- dm-memory-system.js → INTEGRATE #1
- party-system.js → INTEGRATE #2
- spotlight-pacing-scheduler.js → Merge into Spotlight Scheduler pillar
- mechanical-state-engine.js → Merge into Pillar 1 (Mechanical State)
- world-state-graph.js → Merge into Pillar 7 (World State Graph)
- world-state-query-engine.js → Could be helper for World System
- world-state-updater.js → Helper for World System
- npc-relationship-network.js → Helper for NPC management
- game-engine.js → OLD - compare with src/core
- session-runner.js → OLD - compare with turn-pipeline
- unified-dnd-engine.js → OLD - compare with nine-pillars
- ... (many more)

═════════════════════════════════════════════════════════════════════════════
INTEGRATION STRATEGY
═════════════════════════════════════════════════════════════════════════════

PHASE 1: DM-MEMORY-SYSTEM (NEXT)
────────────────────────────────────────────────────────────────────────────
TARGET: Integrate RuleDatabase + CharacterDatabase + EventTimeline into
        the new architecture

STEPS:
1. Create src/systems/dm-memory-system.js
   - Import RuleDatabase, CharacterDatabase, EventTimeline, NPCDatabase
   - Wrap them in a system that:
     • Emits to eventBus (for event logging)
     • Registers rules in rule-registry
     • Provides queries for turn-pipeline
   
2. Update Turn-Pipeline to use eventBus for session logging
   
3. Update each effect to log to eventBus (events)

4. Update registries to auto-populate from DM-memory

EXAMPLE WIRING:
   OLD:
     memory.logEvent('combat', 'Grond attacks', {...})
   
   NEW:
     eventBus.emit('game:event', {
       type: 'combat',
       actor: 'Grond',
       action: 'attack',
       ...
     })

────────────────────────────────────────────────────────────────────────────

PHASE 2: PARTY-SYSTEM (AFTER PHASE 1)
────────────────────────────────────────────────────────────────────────────
TARGET: Merge into Spotlight Scheduler + Mechanical System

STEPS:
1. Extract initiative logic from party-system
2. Integrate with spotlight-scheduler
3. Integrate damage/healing with mechanical-effect
4. Update turn-pipeline to pull turn order from scheduler

EXAMPLE WIRING:
   OLD:
     party.nextTurn() → returns { actor, round, initiative }
   
   NEW:
     turnPipeline.execute(input) → calls scheduler.getNextActor()
                                → emits 'turn:start' event
                                → scheduler updates spotlight

────────────────────────────────────────────────────────────────────────────

PHASE 3+: SKILLS & GENERATORS
────────────────────────────────────────────────────────────────────────────
TARGET: Convert skills to modular plugins that register with systems

STEPS:
1. Move useful skills to src/plugins/
2. Each plugin registers with appropriate system/registry
3. Dangerous/unused skills go to archive/

═════════════════════════════════════════════════════════════════════════════
ACTION ITEMS
═════════════════════════════════════════════════════════════════════════════

IMMEDIATE (Do this next session):
☐ Create ARCHIVE/ directory
☐ Move unvetted legacy files to archive/ (do NOT delete)
☐ List out exactly which skills are actually used
☐ Inspect npc-manager/ and ambiance-agent/ directories

PHASE 1 (DM-Memory Integration):
☐ Read dm-memory-system.js completely
☐ Create integration plan (detailed code changes)
☐ Build src/systems/dm-memory-adapter.js
☐ Update turn-pipeline to emit events
☐ Test with single session log

PHASE 2 (Party-System Integration):
☐ Read party-system.js completely
☐ Create integration plan (detailed code changes)
☐ Update spotlight-scheduler to use party initiative
☐ Update mechanical-effect to handle party damage
☐ Test with single combat

═════════════════════════════════════════════════════════════════════════════
NOTES
═════════════════════════════════════════════════════════════════════════════

• DO NOT merge files blindly
• Each integration is ONE system at a time
• Archive everything unvetted first
• Show before/after code for each integration
• One integration = one git commit
• Test after each integration

═════════════════════════════════════════════════════════════════════════════
