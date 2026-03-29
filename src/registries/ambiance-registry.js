import { Registry } from '../core/registry.js';

const ambianceRegistry = new Registry('Ambiance');

ambianceRegistry.registerBulk({
  'boss-encounter': {
    sceneType: 'boss-encounter',
    music: 'https://www.youtube.com/watch?v=epicMusic',
    imagePrompt: 'Epic fantasy boss encounter',
    sensory: { see: 'Eyes blazing', hear: 'Roar', smell: 'Ancient magic' },
    priority: 100
  },
  'exploration': {
    sceneType: 'exploration',
    music: 'https://www.youtube.com/watch?v=ambientMusic',
    imagePrompt: 'Dark stone dungeon',
    sensory: { see: 'Shadows', hear: 'Dripping', smell: 'Dampness' },
    priority: 50
  },
  'combat': {
    sceneType: 'combat',
    music: 'https://www.youtube.com/watch?v=combatMusic',
    imagePrompt: 'Intense battle',
    sensory: { see: 'Flash of steel', hear: 'Clang', smell: 'Blood' },
    priority: 90
  }
});

export { ambianceRegistry };
