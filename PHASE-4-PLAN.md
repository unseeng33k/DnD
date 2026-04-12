╔═══════════════════════════════════════════════════════════════════════════╗
║                  PHASE 4: DICE ROLLING SYSTEM INTEGRATION                 ║
║                                                                           ║
║  Wrapping dice.js with an adapter and integrating into clean architecture║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
PHASE 4 OVERVIEW
═════════════════════════════════════════════════════════════════════════════

This phase integrates the legacy dice.js system into the clean architecture
using the adapter pattern established in Phases 1-2.

Target: dice.js (legacy system at root)
Destination: src/adapters/dice-adapter.js
Pattern: Same as DMMemoryAdapter and PartySystemAdapter

═════════════════════════════════════════════════════════════════════════════
STEP 1: AUDIT dice.js
═════════════════════════════════════════════════════════════════════════════

File: dice.js (at root)
Size: 4.30 KB
Status: Legacy code - currently unused in clean architecture

Key Functions to Identify:
  • Dice rolling mechanics
  • Probability calculations
  • Result formatting
  • Multi-die handling (d20, d12, d6, etc.)

═════════════════════════════════════════════════════════════════════════════
STEP 2: DESIGN THE ADAPTER
═════════════════════════════════════════════════════════════════════════════

File: src/adapters/dice-adapter.js

Pattern (from Phase 1-2):
  1. Wrap the legacy dice.js system (don't modify it)
  2. Listen to eventBus for dice-related events
  3. Expose a public API that follows new architecture patterns
  4. Emit standardized events when rolls happen

Key Responsibilities:
  • Roll dice (d20, d12, d10, d8, d6, d4)
  • Apply modifiers (advantage, disadvantage, bonuses)
  • Log rolls to eventBus
  • Provide roll history
  • Calculate probabilities

API Design:
  ✓ rollD20()
  ✓ rollDice(diceType, count, modifier)
  ✓ rollWithAdvantage(count, modifier)
  ✓ rollWithDisadvantage(count, modifier)
  ✓ getRollHistory()
  ✓ getAverageResult(diceType, count)

═════════════════════════════════════════════════════════════════════════════
STEP 3: ADAPTER STRUCTURE
═════════════════════════════════════════════════════════════════════════════

src/adapters/dice-adapter.js (NEW)
  ├─ Constructor(eventBus, registries)
  ├─ setupEventListeners()
  ├─ rollD20(modifier)
  ├─ rollDice(sides, count, modifier)
  ├─ rollWithAdvantage(count, modifier)
  ├─ rollWithDisadvantage(count, modifier)
  ├─ getRollHistory(limit)
  └─ getAverageResult(sides, count)

Events to Emit:
  • dice:roll-requested
  • dice:roll-completed
  • dice:advantage-applied
  • dice:disadvantage-applied
  • dice:critical-result (nat 20 or nat 1)

═════════════════════════════════════════════════════════════════════════════
STEP 4: CREATE TESTS
═════════════════════════════════════════════════════════════════════════════

File: test/adapters/dice-adapter.test.js (NEW)

Test Cases:
  ✓ Basic d20 roll returns valid result (1-20)
  ✓ Multi-die rolls work correctly
  ✓ Modifiers are applied properly
  ✓ Advantage rolls use higher of two d20s
  ✓ Disadvantage rolls use lower of two d20s
  ✓ Events are emitted on rolls
  ✓ Roll history is tracked
  ✓ Critical results (1, 20) are detected

═════════════════════════════════════════════════════════════════════════════
STEP 5: UPDATE EXPORTS
═════════════════════════════════════════════════════════════════════════════

File: src/index.js

Add after PartySystemAdapter export:
  export { DiceAdapter } from './adapters/dice-adapter.js';

This makes the adapter available to the entire system.

═════════════════════════════════════════════════════════════════════════════
STEP 6: INTEGRATION POINTS
═════════════════════════════════════════════════════════════════════════════

TurnPipeline Integration:
  • Add diceAdapter to constructor (optional param, like dmMemoryAdapter)
  • Use diceAdapter.rollD20() for attack rolls
  • Use diceAdapter.rollDice() for damage rolls
  • Log all rolls to history via diceAdapter

Systems Integration:
  • MechanicSystem uses diceAdapter for roll resolution
  • WorldSystem uses diceAdapter for encounter checks
  • UiSystem displays roll results via dice:roll-completed events

Character Sheet Integration:
  • Malice's attack rolls use DiceAdapter.rollD20(+modifiers)
  • Grond's damage rolls use DiceAdapter.rollDice('d8', 2, +5)

═════════════════════════════════════════════════════════════════════════════
STEP 7: VERIFICATION
═════════════════════════════════════════════════════════════════════════════

Checklist Before Merge:
  ✓ DiceAdapter wraps dice.js without modifying it
  ✓ All tests pass
  ✓ Events are properly emitted
  ✓ Export added to src/index.js
  ✓ No circular imports
  ✓ Roll history tracks correctly
  ✓ Advantage/disadvantage logic verified
  ✓ Critical hits/fails detected

═════════════════════════════════════════════════════════════════════════════
STEP 8: DOCUMENTATION
═════════════════════════════════════════════════════════════════════════════

Create: docs/PHASE-4-DICE-ADAPTER.md

Document:
  • Why the adapter is needed
  • How to use DiceAdapter in your code
  • API reference for all methods
  • Example rolls (attack, damage, advantage, disadvantage)
  • Integration with TurnPipeline
  • Event patterns

═════════════════════════════════════════════════════════════════════════════
STEP 9: MOVE TO LEGACY-CODE
═════════════════════════════════════════════════════════════════════════════

After Phase 4 is complete:
  mv dice.js legacy-code/integrated/dice.js

The original stays untouched; the adapter is the new interface.

═════════════════════════════════════════════════════════════════════════════
EXPECTED OUTCOME
═════════════════════════════════════════════════════════════════════════════

After Phase 4 Completion:
  ✅ DiceAdapter wraps dice.js in clean architecture
  ✅ TurnPipeline can request rolls via eventBus
  ✅ All systems use standardized dice rolling
  ✅ Roll history tracked globally
  ✅ Advantage/disadvantage fully supported
  ✅ Critical results detected and celebrated
  ✅ No duplicate dice logic anywhere in codebase

═════════════════════════════════════════════════════════════════════════════
READY FOR IMPLEMENTATION
═════════════════════════════════════════════════════════════════════════════

This follows the exact pattern from Phases 1-2 and AI_REFACTOR_GUIDE.md rules:
  ✓ Never deletes code (moves to legacy-code)
  ✓ Uses adapter pattern for clean integration
  ✓ No behavioral changes to original dice.js
  ✓ Emits events for system coordination
  ✓ Testable and verifiable

Ready to execute? Say "GO" to start Phase 4!
