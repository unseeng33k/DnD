╔═══════════════════════════════════════════════════════════════════════════╗
║            PHASE 3: SPOTLIGHT SCHEDULER DEDUPLICATION PLAN               ║
║                                                                           ║
║  Status: ANALYSIS COMPLETE - Ready to Execute                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════
FILES BEING COMPARED
═════════════════════════════════════════════════════════════════════════════

FILE 1 (ROOT LEVEL):
  /Users/mpruskowski/.openclaw/workspace/dnd/spotlight-pacing-scheduler.js
  
  Purpose: Allocates spotlight, narrative moments, mechanical wins
  Status: INCOMPLETE - only shows constructor comments, cut off
  Class: SpotlightPacingScheduler
  
FILE 2 (SRC/LEGACY):
  /Users/mpruskowski/.openclaw/workspace/dnd/src/legacy/systems/pillar-8-spotlight-scheduler.js
  
  Purpose: Turn order, initiative, round management
  Status: COMPLETE - fully implemented
  Class: SpotlightSchedulerPillar
  Size: ~250 lines

═════════════════════════════════════════════════════════════════════════════
COMPARISON ANALYSIS
═════════════════════════════════════════════════════════════════════════════

SCOPE DIFFERENCE:
  
  FILE 1 (Root): Broader pacing system
    • Spotlight balance across party
    • Mechanical wins tracking
    • Narrative wins tracking
    • Decision gates
    • Prevents pacing problems (fatigue, dragging, sludge)
    • INCOMPLETE - file cut off mid-implementation
  
  FILE 2 (Pillar-8): Combat-focused turn order
    • Initiative calculation
    • Turn order tracking
    • Round progression
    • Combat vs roleplay mode
    • Action counting
    • Spotlight per turn
    • COMPLETE - fully implemented

DECISION:
  ✅ KEEP: pillar-8-spotlight-scheduler.js (FILE 2)
     • Complete implementation
     • Integrated with nine-pillars architecture
     • Combat turn tracking is essential
     • In src/legacy/ as part of pillar system
  
  ❌ DELETE: spotlight-pacing-scheduler.js (FILE 1)
     • Incomplete (cut off)
     • Duplicate scope with pillar-8
     • At root level (should be in src/)
     • Never fully integrated with clean architecture

═════════════════════════════════════════════════════════════════════════════
WHAT PILLAR-8 PROVIDES (KEEP THIS)
═════════════════════════════════════════════════════════════════════════════

✅ calculateInitiative(characters) - AD&D 1E initiative rolling
✅ getTurnOrder() - ordered list of actors
✅ getNextActor() - current turn's actor
✅ nextTurn() - advance to next turn + round tracking
✅ recordTurn(actor, action, result) - action logging
✅ endCombat() - finish encounter
✅ getSpotlightThisRound() - who acted this round
✅ rebalanceTurns() - detect action imbalance
✅ Logging system - console output for debugging

═════════════════════════════════════════════════════════════════════════════
WHAT ROOT FILE WANTED TO ADD (INCOMPLETE)
═════════════════════════════════════════════════════════════════════════════

The root-level file was attempting to add:
  • spotlightBalance - track who got spotlight
  • mechanicalWins - count mechanical victories
  • narrativeWins - count narrative moments
  • decisionGates - track key decisions
  
These are enhancements to pacing, not essential for Phase 2 combat integration.

═════════════════════════════════════════════════════════════════════════════
PHASE 3 EXECUTION PLAN
═════════════════════════════════════════════════════════════════════════════

Step 1: VERIFY pillar-8-spotlight-scheduler.js is complete ✅
  Location: src/legacy/systems/pillar-8-spotlight-scheduler.js
  Status: VERIFIED - 250+ lines, fully functional

Step 2: DELETE the duplicate root-level file
  Location: /Users/mpruskowski/.openclaw/workspace/dnd/spotlight-pacing-scheduler.js
  Reason: Incomplete, duplicate scope, not integrated
  Action: DELETE (move to archive if you want to preserve it)

Step 3: UPDATE imports if anything references the deleted file
  Check: Which files import spotlight-pacing-scheduler.js?
  Action: Update imports to pillar-8-spotlight-scheduler.js if found

Step 4: VERIFY party-system-adapter works with pillar-8
  The PartySystemAdapter (Phase 2) should use pillar-8 for turn order
  Current design: PartySystemAdapter wraps PartySystem
  Optional: Could also accept SpotlightSchedulerPillar in constructor

═════════════════════════════════════════════════════════════════════════════
RECOMMENDATION FOR ENHANCEMENT (FUTURE)
═════════════════════════════════════════════════════════════════════════════

The pacing enhancements from the root file are valuable but incomplete.
Future option (Phase 4+): Create a pacing-enhancement system that wraps
pillar-8 to add:
  • Spotlight balance tracking
  • Mechanical/narrative win counting
  • Fatigue detection
  • Decision gate tracking

This would follow the adapter pattern (Phase 1 & 2) and not duplicate code.

═════════════════════════════════════════════════════════════════════════════
SUMMARY: PHASE 3
═════════════════════════════════════════════════════════════════════════════

✅ Analysis complete
✅ Decision made: Keep pillar-8, delete root-level duplicate
✅ No breaking changes (root file was incomplete anyway)
✅ Clean architecture maintained (pillar in src/legacy/)

Next: Execute deletion + verify imports
