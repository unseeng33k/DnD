/**
 * PHASE 1 IMPORT PATH UPDATES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RULE: Update import paths for moved files ONLY.
 * DO NOT change function bodies, logic, or signatures.
 * 
 * IMPORT PATH PATTERNS
 * ────────────────────────────────────────────────────────────────────────────
 * 
 * When a file moves from ROOT to src/legacy/utilities/, update paths:
 * 
 *   BEFORE (file in root):
 *   import { dice } from './dice.js'
 *   import logger from './logger.js'
 * 
 *   AFTER (file in src/legacy/utilities/):
 *   import { dice } from './dice.js'  ← Still same directory
 *   import logger from './logger.js'  ← Still same directory
 * 
 * BUT if utilities/file.js imports from ROOT:
 * 
 *   BEFORE (in root):
 *   import { Party } from './party-system.js'
 * 
 *   AFTER (in src/legacy/utilities/):
 *   import { Party } from '../systems/party-system.js'  ← Up 1 level, then to systems/
 * 
 * DEPTH RULES (from src/legacy/utilities/):
 *   '../' = up to src/legacy/
 *   '../../' = up to src/
 *   '../../../' = up to root (should be avoided)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * FILES REQUIRING IMPORT UPDATES
 * 
 * 1. game-engine.js → src/legacy/engines/game-engine.js
 * 2. session-runner.js → src/legacy/engines/session-runner.js
 * 3. unified-dnd-engine.js → src/legacy/engines/unified-dnd-engine.js
 * 4. integrated-dnd-system.js → src/legacy/engines/integrated-dnd-system.js
 * 5. game-master-orchestrator.js → src/legacy/engines/game-master-orchestrator.js
 * 6. character-creator.js → src/legacy/utilities/character-creator.js
 * 7. dm-memory-system.js → src/legacy/utilities/dm-memory-system.js
 * 8. image-handler.js → src/legacy/utilities/image-handler.js
 * 9. And several others...
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
