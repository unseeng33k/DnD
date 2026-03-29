╔═══════════════════════════════════════════════════════════════════════════╗
║          DND LEGACY CODE DEPENDENCY AUDIT                                ║
║                                                                           ║
║  Which legacy files call OLD functions?                                  ║
║  What's the NEW orchestrator API they should use instead?                ║
║  Which ones need adapters, which are dead weight?                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
ORCHESTRATOR API (The "new normal" in src/)
═════════════════════════════════════════════════════════════════════════════

The clean architecture provides these public APIs:

📍 src/core/event-bus.js
   • eventBus.emit(eventName, data) — emit events
   • eventBus.on(eventName, callback) — listen for events
   • eventBus.off(eventName, callback) — stop listening

📍 src/core/turn-pipeline.js
   • pipeline.execute(turnData) — run a single turn
   • turnData = { action, actor, target, context }
   • Returns: { success, result, worldStateChanges, narrative }

📍 src/registries/index.js
   • ruleRegistry.get(ruleName) — look up game rules
   • intentRegistry.get(intentName) — get action intents
   • ambianceRegistry.get(sceneType) — get scene atmosphere
   • worldRegistry.get(entityId) — query world state

📍 src/systems/world-system.js
   • worldSystem.queryWorldState(query) — ask about world
   • worldSystem.applyAction(action) — apply player action
   • worldSystem.getLocation(name) — find location
   • worldSystem.getNPC(name) — find NPC

═════════════════════════════════════════════════════════════════════════════
LEGACY CODE AUDIT
═════════════════════════════════════════════════════════════════════════════

FILE: dm-memory-system.js
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ memory.logEvent(category, description, details)
  ✗ memory.lookupRule(ruleName)
  ✗ memory.getCharacterAbility(charName, abilityName)
  ✗ memory.recordRuling(decision, reasoning, ruleRef, impact)
  ✗ memory.getNPCQuickRef(npcName)
  ✗ memory.saveSession()

DEPENDENCY ANALYSIS:
  • STANDALONE - doesn't import anything
  • Uses fs/path for file I/O (for session saves)
  • NO dependencies on turn-pipeline, old game-engine, etc.
  • PROBLEM: Not integrated with eventBus (events are siloed)

INTEGRATION NEEDED:
  • Must emit events to eventBus when things happen
  • Must populate rule-registry at startup
  • Must listen to turn-pipeline events

ADAPTER APPROACH:
  Create: src/adapters/dm-memory-adapter.js
  • Wraps DMMemory (import from dm-memory-system.js)
  • Listens to eventBus for turn:* events
  • Logs events to timeline
  • Exposes query API to turn-pipeline
  • Provides rule lookups via registry

VALUE: ⭐⭐⭐⭐⭐ CRITICAL
  RuleDatabase, CharacterDatabase, EventTimeline are actively used
  SessionSave functionality is valuable for continuity

INTEGRATION PRIORITY: #1 (DO THIS FIRST)

═════════════════════════════════════════════════════════════════════════════

FILE: party-system.js
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ party.addMember(characterData)
  ✗ party.rollInitiative()
  ✗ party.startCombat()
  ✗ party.nextTurn()
  ✗ party.damagePartyMember(name, damage)
  ✗ party.getPartyStatus()

DEPENDENCY ANALYSIS:
  • STANDALONE - doesn't import anything
  • Manages turn order independently
  • PROBLEM: Duplicates spotlight-scheduler pillar
  • PROBLEM: Not connected to mechanical-effect (damage handling)

INTEGRATION NEEDED:
  • Turn order should come from spotlight-scheduler
  • Damage should be a mechanical-effect
  • Party status should query world-system

ADAPTER APPROACH:
  Create: src/adapters/party-system-adapter.js
  • Wraps PartySystem
  • Hooks into spotlight-scheduler for turn order
  • Translates damage() calls to mechanical-effect emissions
  • Delegates party status to world-system

VALUE: ⭐⭐⭐⭐ HIGH
  Initiative rolling, party management are core to combat
  But functionality partly duplicates pillar-8-spotlight-scheduler

INTEGRATION PRIORITY: #2 (AFTER dm-memory)

═════════════════════════════════════════════════════════════════════════════

FILE: spotlight-pacing-scheduler.js
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ scheduler.calculateInitiative(characters)
  ✗ scheduler.getTurnOrder()
  ✗ scheduler.advanceTurn()
  ✗ scheduler.recordTurn(actor, action, result)

DEPENDENCY ANALYSIS:
  • STANDALONE
  • Likely duplicates src/legacy/systems/pillar-8-spotlight-scheduler.js
  • PROBLEM: Two implementations of same system

INTEGRATION NEEDED:
  • Verify which version is more complete
  • Merge best parts into one canonical version
  • Or keep root version and delete pillar version

ADAPTER APPROACH:
  Maybe NOT needed - might just delete & use pillar version
  OR: Create simple wrapper in src/adapters/

VALUE: ⭐⭐⭐ MEDIUM
  Core functionality but duplicated in pillar-8

INTEGRATION PRIORITY: #3 (DEDUPLICATE FIRST)

═════════════════════════════════════════════════════════════════════════════

FILE: skills/combat-tracker.js
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ tracker.startCombat(participants)
  ✗ tracker.damage(name, amount)
  ✗ tracker.nextTurn()
  ✗ tracker.addCondition(name, condition)

DEPENDENCY ANALYSIS:
  • STANDALONE
  • Duplicate of party-system (but simpler)
  • PROBLEM: Uses module.exports (CommonJS, not ES6)

INTEGRATION NEEDED:
  • Convert to ES6 modules
  • Delete after party-system fully integrated
  • Don't create adapter - consolidate with party-system

VALUE: ⭐⭐ LOW
  Simpler than party-system, but redundant

INTEGRATION PRIORITY: DELETE (AFTER party-system integrated)

═════════════════════════════════════════════════════════════════════════════

FILE: game-engine.js (root level)
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ engine.startGame()
  ✗ engine.runTurn(actor, action)
  ✗ engine.endGame()
  ✗ engine.saveState()

DEPENDENCY ANALYSIS:
  • OLD - predates src/ restructuring
  • Probably imports old functions that no longer exist
  • PROBLEM: Main game loop is now in turn-pipeline

INTEGRATION NEEDED:
  • Don't integrate - this is obsolete
  • Delete or archive

VALUE: ⭐ NONE
  Replaced by turn-pipeline

INTEGRATION PRIORITY: ARCHIVE (don't touch)

═════════════════════════════════════════════════════════════════════════════

FILE: session-runner.js (root level)
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ runner.loadSession(campaignName, sessionNum)
  ✗ runner.runSession()
  ✗ runner.saveSession()

DEPENDENCY ANALYSIS:
  • OLD - main game loop
  • PROBLEM: Logic now in turn-pipeline + dm-memory-adapter

INTEGRATION NEEDED:
  • Don't integrate - logic is distributed
  • Delete or archive

VALUE: ⭐ NONE
  Replaced by turn-pipeline

INTEGRATION PRIORITY: ARCHIVE (don't touch)

═════════════════════════════════════════════════════════════════════════════

FILE: skills/encounter-generator.js
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ generator.generate(partyLevel, difficulty)
  → returns: { monsters, tactics, treasure }

DEPENDENCY ANALYSIS:
  • Might be standalone procedural generation
  • Probably doesn't import old engines
  • PROBLEM: Unknown - need to read to determine

INTEGRATION NEEDED:
  • Likely needs to register with quest-system or world-system
  • Or create new encounter-system

VALUE: ⭐⭐⭐ MEDIUM
  Useful for combat prep, but not critical path

INTEGRATION PRIORITY: #4 (LATER - after core 3)

═════════════════════════════════════════════════════════════════════════════

FILE: skills/npc-manager/ (directory)
─────────────────────────────────────────────────────────────────────────

CURRENT API (OLD):
  ✗ ? (unknown - need to inspect)

DEPENDENCY ANALYSIS:
  • Unknown - need to read directory contents

INTEGRATION NEEDED:
  • TBD after inspection

VALUE: ⭐⭐⭐⭐ HIGH
  NPCs are critical to roleplay

INTEGRATION PRIORITY: #5 (AFTER inspection)

═════════════════════════════════════════════════════════════════════════════
SUMMARY: WHICH FILES TO INTEGRATE & IN WHAT ORDER
═════════════════════════════════════════════════════════════════════════════

INTEGRATION PHASE 1 (Next):
  ✅ dm-memory-system.js
     Create: src/adapters/dm-memory-adapter.js
     Hook: listens to eventBus, populates registries, provides query API
     Effort: 4-6 hours

INTEGRATION PHASE 2 (After Phase 1 tests pass):
  ✅ party-system.js
     Create: src/adapters/party-system-adapter.js
     Hook: integrates with spotlight-scheduler, mechanical-effect
     Effort: 6-8 hours

INTEGRATION PHASE 3 (Deduplication):
  ✅ spotlight-pacing-scheduler.js
     Action: Compare with pillar-8, merge or delete
     Effort: 2-3 hours

INTEGRATION PHASE 4 (DELETE):
  ❌ skills/combat-tracker.js
     Action: Delete after party-system done
     Reason: Duplicate, simpler version
     Effort: <1 hour

INTEGRATION PHASE 5+ (Nice-to-have):
  ⏳ skills/encounter-generator.js
  ⏳ skills/npc-manager/ (after inspection)

ARCHIVE (don't touch):
  ❌ game-engine.js
  ❌ session-runner.js
  ❌ game-master-orchestrator*.js
  ❌ All other old engines
     Reason: Functionality distributed into turn-pipeline
     Effort: Just move to archive/

═════════════════════════════════════════════════════════════════════════════
NEXT STEP
═════════════════════════════════════════════════════════════════════════════

→ READ: dm-memory-system.js completely (it's the first integration target)

→ CREATE: PHASE-1-DM-MEMORY-ADAPTER.md with:
  • Before: How dm-memory currently works (isolated)
  • Adapter: Code for src/adapters/dm-memory-adapter.js
  • Wiring: How to hook it into turn-pipeline + registries
  • Testing: Test strategy for validation

═════════════════════════════════════════════════════════════════════════════
