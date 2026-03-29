import { Registry } from '../core/registry.js';

const effectRegistry = new Registry('Effect');

effectRegistry.registerBulk({
  'apply-damage': {
    name: 'Apply Damage',
    description: 'Deal damage to a target',
    type: 'mechanical',
    targetRequired: true
  },
  'apply-healing': {
    name: 'Apply Healing',
    description: 'Heal a target',
    type: 'mechanical',
    targetRequired: true
  },
  'apply-spell-effect': {
    name: 'Apply Spell Effect',
    description: 'Apply magical effect',
    type: 'magical',
    targetRequired: true
  },
  'add-to-inventory': {
    name: 'Add to Inventory',
    description: 'Add item to inventory',
    type: 'mechanical',
    targetRequired: false
  },
  'update-position': {
    name: 'Update Position',
    description: 'Update actor position',
    type: 'world',
    targetRequired: false
  }
});

export { effectRegistry };
