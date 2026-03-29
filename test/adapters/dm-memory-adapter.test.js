/**
 * DM-MEMORY ADAPTER TESTS
 * 
 * Verify Phase 1 integration works correctly
 */

import { DMMemoryAdapter } from '../../src/adapters/dm-memory-adapter.js';
import { EventBus } from '../../src/core/event-bus.js';

// Mock registries for testing
const mockRegistries = {
  ruleRegistry: {
    register: (name, data) => {
      console.log(`  Registered rule: ${name}`);
    }
  }
};

console.log('\n╔════════════════════════════════════════════╗');
console.log('║     PHASE 1: DM-MEMORY ADAPTER TESTS      ║');
console.log('╚════════════════════════════════════════════╝\n');

// Test 1: Initialization
console.log('Test 1: Initialize DMMemoryAdapter');
try {
  const eventBus = new EventBus();
  const adapter = new DMMemoryAdapter('Test Campaign', 1, eventBus, mockRegistries);
  
  if (adapter.memory && adapter.memory.campaign === 'Test Campaign') {
    console.log('  ✅ Adapter initialized successfully');
    console.log(`  ✅ Campaign: ${adapter.memory.campaign}`);
    console.log(`  ✅ Session: ${adapter.memory.session}`);
  } else {
    console.log('  ❌ Adapter initialization failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 2: Rule lookup
console.log('\nTest 2: Rule lookup via adapter');
try {
  const eventBus = new EventBus();
  const adapter = new DMMemoryAdapter('Test Campaign', 1, eventBus, mockRegistries);
  
  const rule = adapter.lookupRule('sneak_attack');
  if (rule && rule.class === 'Rogue') {
    console.log('  ✅ Rule lookup works');
    console.log(`  ✅ Rule: ${rule.class} ability`);
  } else {
    console.log('  ❌ Rule lookup failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 3: Event logging via eventBus
console.log('\nTest 3: Event logging through eventBus');
try {
  const eventBus = new EventBus();
  const adapter = new DMMemoryAdapter('Test Campaign', 1, eventBus, mockRegistries);
  
  // Emit a turn event
  eventBus.emit('turn:input-processed', {
    input: { action: 'attack' }
  });
  
  // Check if it was logged
  const timeline = adapter.getTimeline();
  if (timeline && timeline.length > 0) {
    console.log('  ✅ Events logged to timeline');
    console.log(`  ✅ Timeline entries: ${timeline.length}`);
    console.log(`  ✅ First event: ${timeline[0].description}`);
  } else {
    console.log('  ❌ Event logging failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 4: Session summary
console.log('\nTest 4: Session summary');
try {
  const eventBus = new EventBus();
  const adapter = new DMMemoryAdapter('Test Campaign', 1, eventBus, mockRegistries);
  
  const summary = adapter.getSessionSummary();
  if (summary && summary.campaign === 'Test Campaign') {
    console.log('  ✅ Session summary works');
    console.log(`  ✅ Campaign: ${summary.campaign}`);
    console.log(`  ✅ Session: ${summary.session}`);
  } else {
    console.log('  ❌ Session summary failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 5: Decision recording
console.log('\nTest 5: Decision recording');
try {
  const eventBus = new EventBus();
  const adapter = new DMMemoryAdapter('Test Campaign', 1, eventBus, mockRegistries);
  
  const decision = adapter.recordDecision(
    'Allow bonus action sneak attack',
    'Player has advantage',
    'PHB 96',
    { appliedTo: 'Grond' }
  );
  
  if (decision && decision.recorded) {
    console.log('  ✅ Decision recording works');
    console.log(`  ✅ Decision: ${decision.recorded.decision}`);
  } else {
    console.log('  ❌ Decision recording failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\n╔════════════════════════════════════════════╗');
console.log('║            TESTS COMPLETE                 ║');
console.log('╚════════════════════════════════════════════╝\n');
