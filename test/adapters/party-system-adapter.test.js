/**
 * PARTY-SYSTEM ADAPTER TESTS
 */

import { PartySystemAdapter } from '../../src/adapters/party-system-adapter.js';
import { EventBus } from '../../src/core/event-bus.js';

const mockRegistries = {
  ruleRegistry: {
    register: (name, data) => {
      console.log(`  Registered: ${name}`);
    }
  }
};

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   PHASE 2: PARTY-SYSTEM ADAPTER TESTS    ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('Test 1: Initialize PartySystemAdapter');
try {
  const eventBus = new EventBus();
  const adapter = new PartySystemAdapter('The Adventurers', eventBus, mockRegistries);
  
  if (adapter.party && adapter.party.partyName === 'The Adventurers') {
    console.log('  ✅ Adapter initialized successfully');
    console.log(`  ✅ Party: ${adapter.party.partyName}`);
  } else {
    console.log('  ❌ Adapter initialization failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\nTest 2: Add party members');
try {
  const eventBus = new EventBus();
  const adapter = new PartySystemAdapter('The Adventurers', eventBus, mockRegistries);
  
  adapter.addMember({
    name: 'Grond',
    class: 'Fighter',
    hitPoints: 69,
    ac: 0,
    abilityScores: { DEX: 12 }
  });
  
  adapter.addMember({
    name: 'Malice',
    class: 'Cleric/Mage',
    hitPoints: 42,
    ac: 5,
    abilityScores: { DEX: 15 }
  });
  
  if (adapter.party.members.length === 2) {
    console.log('  ✅ Members added successfully');
    console.log(`  ✅ Party size: ${adapter.party.members.length}`);
    console.log(`  ✅ Members: ${adapter.party.members.map(m => m.name).join(', ')}`);
  } else {
    console.log('  ❌ Member addition failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\nTest 3: Roll initiative');
try {
  const eventBus = new EventBus();
  const adapter = new PartySystemAdapter('The Adventurers', eventBus, mockRegistries);
  
  adapter.addMember({
    name: 'Grond',
    class: 'Fighter',
    hitPoints: 69,
    ac: 0,
    abilityScores: { DEX: 12 }
  });
  
  adapter.addMember({
    name: 'Malice',
    class: 'Cleric/Mage',
    hitPoints: 42,
    ac: 5,
    abilityScores: { DEX: 15 }
  });
  
  const order = adapter.rollInitiative();
  
  if (order && order.length === 2) {
    console.log('  ✅ Initiative rolled successfully');
    console.log(`  ✅ Order: ${order.map(i => `${i.name}(${i.initiative})`).join(', ')}`);
  } else {
    console.log('  ❌ Initiative roll failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\nTest 4: Combat start and turn management');
try {
  const eventBus = new EventBus();
  const adapter = new PartySystemAdapter('The Adventurers', eventBus, mockRegistries);
  
  const members = [
    {
      name: 'Grond',
      class: 'Fighter',
      hitPoints: 69,
      ac: 0,
      abilityScores: { DEX: 12 }
    },
    {
      name: 'Malice',
      class: 'Cleric/Mage',
      hitPoints: 42,
      ac: 5,
      abilityScores: { DEX: 15 }
    }
  ];
  
  adapter.startCombat(members);
  
  if (adapter.isInCombat()) {
    console.log('  ✅ Combat started successfully');
    console.log(`  ✅ Combat active: ${adapter.isInCombat()}`);
    console.log(`  ✅ Round: ${adapter.getRound()}`);
  } else {
    console.log('  ❌ Combat start failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\nTest 5: Damage handling');
try {
  const eventBus = new EventBus();
  const adapter = new PartySystemAdapter('The Adventurers', eventBus, mockRegistries);
  
  adapter.addMember({
    name: 'Grond',
    class: 'Fighter',
    hitPoints: 69,
    ac: 0,
    abilityScores: { DEX: 12 }
  });
  
  const result = adapter.damagePartyMember('Grond', 15);
  
  if (result.success && result.currentHP === 54) {
    console.log('  ✅ Damage applied successfully');
    console.log(`  ✅ Grond HP: ${result.currentHP}/${result.maxHP}`);
    console.log(`  ✅ Status: ${result.status}`);
  } else {
    console.log('  ❌ Damage application failed');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error.message}`);
}

console.log('\n╔════════════════════════════════════════════╗');
console.log('║            TESTS COMPLETE                 ║');
console.log('╚════════════════════════════════════════════╝\n');
