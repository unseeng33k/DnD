/**
 * DICE ADAPTER TESTS - PHASE 4
 * 
 * Verify dice rolling integration works correctly
 */

import { DiceAdapter } from '../../src/adapters/dice-adapter.js';
import { EventBus } from '../../src/core/event-bus.js';

// Mock registries
const mockRegistries = {
  diceRegistry: {
    register: (name, data) => {
      console.log(`  Registered dice: ${name}`);
    }
  }
};

console.log('\n╔════════════════════════════════════════════╗');
console.log('║      PHASE 4: DICE ADAPTER TESTS          ║');
console.log('╚════════════════════════════════════════════╝\n');

// Test 1: Initialization
console.log('Test 1: Initialize DiceAdapter');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  if (adapter && adapter.rollHistory !== undefined) {
    console.log('  ✅ Adapter initialized successfully');
    console.log(`  ✅ Roll history initialized: ${adapter.rollHistory.length === 0 ? 'empty' : 'has entries'}`);
  } else {
    console.log('  ❌ Adapter initialization failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 2: Basic d20 roll
console.log('\nTest 2: Basic d20 roll');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollD20();
  if (result && result.total >= 1 && result.total <= 20) {
    console.log('  ✅ d20 roll works');
    console.log(`  ✅ Roll result: ${result.total}`);
    console.log(`  ✅ Type: ${result.type}`);
  } else {
    console.log('  ❌ d20 roll invalid');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 3: d20 roll with modifier
console.log('\nTest 3: d20 roll with modifier');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollD20(5);
  if (result && result.modifier === 5 && result.total >= 6 && result.total <= 25) {
    console.log('  ✅ d20 with modifier works');
    console.log(`  ✅ Roll: ${result.rolls[0]} + ${result.modifier} = ${result.total}`);
  } else {
    console.log('  ❌ d20 with modifier failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 4: Multi-die roll (2d6)
console.log('\nTest 4: Multi-die roll (2d6)');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollDice(6, 2, 0);
  if (result && result.rolls.length === 2 && result.total >= 2 && result.total <= 12) {
    console.log('  ✅ 2d6 roll works');
    console.log(`  ✅ Rolls: [${result.rolls[0]}, ${result.rolls[1]}] = ${result.total}`);
  } else {
    console.log('  ❌ 2d6 roll failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 5: Advantage roll (higher of two d20s)
console.log('\nTest 5: Advantage roll');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollWithAdvantage(1, 0);
  if (result && result.type === 'advantage' && result.kept === Math.max(result.rolls[0], result.rolls[1])) {
    console.log('  ✅ Advantage roll works');
    console.log(`  ✅ Rolls: [${result.rolls[0]}, ${result.rolls[1]}] → kept ${result.kept}`);
  } else {
    console.log('  ❌ Advantage roll failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 6: Disadvantage roll (lower of two d20s)
console.log('\nTest 6: Disadvantage roll');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollWithDisadvantage(1, 0);
  if (result && result.type === 'disadvantage' && result.kept === Math.min(result.rolls[0], result.rolls[1])) {
    console.log('  ✅ Disadvantage roll works');
    console.log(`  ✅ Rolls: [${result.rolls[0]}, ${result.rolls[1]}] → kept ${result.kept}`);
  } else {
    console.log('  ❌ Disadvantage roll failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 7: Character ability stat (4d6 drop lowest)
console.log('\nTest 7: Character ability stat (4d6 drop lowest)');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  const result = adapter.rollCharacterAbilityStat();
  if (result && result.type === '4d6-drop-lowest' && result.kept.length === 3 && result.total >= 3 && result.total <= 18) {
    console.log('  ✅ 4d6 drop lowest works');
    console.log(`  ✅ Rolls: [${result.rolls.join(', ')}] → drop ${result.dropped} → ${result.total}`);
  } else {
    console.log('  ❌ 4d6 drop lowest failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 8: Roll history tracking
console.log('\nTest 8: Roll history tracking');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  adapter.rollD20();
  adapter.rollDice(6, 2);
  adapter.rollWithAdvantage(1, 3);
  
  const history = adapter.getRollHistory();
  if (history && history.length === 3) {
    console.log('  ✅ Roll history tracking works');
    console.log(`  ✅ History entries: ${history.length}`);
    console.log(`  ✅ First roll: ${history[0].type}`);
    console.log(`  ✅ Second roll: ${history[1].type}`);
    console.log(`  ✅ Third roll: ${history[2].type}`);
  } else {
    console.log('  ❌ Roll history tracking failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 9: Critical hit detection (natural 20)
console.log('\nTest 9: Critical hit detection (natural 20)');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  // Keep rolling until we get a 20
  let criticalFound = false;
  for (let i = 0; i < 1000; i++) {
    const result = adapter.rollD20();
    if (result.isCritical) {
      criticalFound = true;
      console.log('  ✅ Critical hit detected');
      console.log(`  ✅ Rolled: ${result.rolls[0]} (critical hit marker: ${result.isCritical})`);
      break;
    }
  }
  
  if (!criticalFound) {
    console.log('  ⚠️  Warning: No critical hit found in 1000 rolls (expected but improbable)');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

// Test 10: Critical fail detection (natural 1)
console.log('\nTest 10: Critical fail detection (natural 1)');
try {
  const eventBus = new EventBus();
  const adapter = new DiceAdapter(eventBus, mockRegistries);
  
  // Keep rolling until we get a 1
  let criticalFailFound = false;
  for (let i = 0; i < 1000; i++) {
    const result = adapter.rollD20();
    if (result.isFail) {
      criticalFailFound = true;
      console.log('  ✅ Critical fail detected');
      console.log(`  ✅ Rolled: ${result.rolls[0]} (critical fail marker: ${result.isFail})`);
      break;
    }
  }
  
  if (!criticalFailFound) {
    console.log('  ⚠️  Warning: No critical fail found in 1000 rolls (expected but improbable)');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\n╔════════════════════════════════════════════╗');
console.log('║            TESTS COMPLETE                 ║');
console.log('╚════════════════════════════════════════════╝\n');
