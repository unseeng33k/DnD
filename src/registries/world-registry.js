import { Registry } from '../core/registry.js';

const worldRegistry = new Registry('World');

worldRegistry.registerBulk({
  'thornhearth': {
    name: 'Thornhearth',
    type: 'town',
    facilities: ['bank', 'guild', 'church', 'tavern', 'marketplace']
  },
  'shrine-of-serpent': {
    name: 'Shrine of the Golden Serpent',
    type: 'location',
    region: 'Olman Jungle',
    difficulty: 'high'
  }
});

export { worldRegistry };
