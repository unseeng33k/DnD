import { Registry } from '../core/registry.js';

const ruleRegistry = new Registry('Rule');

ruleRegistry.registerBulk({
  'attack-damage': {
    name: 'Attack Damage',
    description: 'Calculate damage from an attack',
    calculation: 'weaponDamage + strengthModifier'
  },
  'spell-damage': {
    name: 'Spell Damage',
    description: 'Calculate damage from a spell',
    calculation: 'spellBaseDamage + (intelligenceModifier * 0.5)'
  },
  'saving-throw': {
    name: 'Saving Throw',
    description: 'DC + d20 vs target AC',
    baseDC: 10
  }
});

export { ruleRegistry };
