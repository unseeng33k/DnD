import { Registry } from '../core/registry.js';

const intentRegistry = new Registry('Intent');

intentRegistry.registerBulk({
  'attack': {
    name: 'Attack',
    description: 'Attack a target with a weapon',
    requiredInputs: ['actor', 'target', 'weapon'],
    effects: ['apply-damage'],
    ambianceType: 'combat',
    priority: 10
  },
  'cast': {
    name: 'Cast Spell',
    description: 'Cast a spell',
    requiredInputs: ['actor', 'spell'],
    effects: ['apply-spell-effect'],
    ambianceType: 'magic',
    priority: 12
  },
  'move': {
    name: 'Move',
    description: 'Move to a location',
    requiredInputs: ['actor', 'location'],
    effects: ['update-position'],
    ambianceType: 'exploration',
    priority: 5
  },
  'take': {
    name: 'Take Item',
    description: 'Take an item',
    requiredInputs: ['actor', 'item'],
    effects: ['add-to-inventory'],
    ambianceType: 'interaction',
    priority: 7
  },
  'drop': {
    name: 'Drop Item',
    description: 'Drop an item',
    requiredInputs: ['actor', 'item'],
    effects: ['remove-from-inventory'],
    ambianceType: 'interaction',
    priority: 6
  }
});

export { intentRegistry };
