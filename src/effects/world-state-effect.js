import { Effect } from '../core/effect-runtime.js';

class WorldStateEffect extends Effect {
  constructor(config) {
    super(config);
    this.type = 'world-state';
  }

  async execute(context) {
    return {
      success: true,
      worldStateChange: this.data.worldStateChange || {}
    };
  }
}

export { WorldStateEffect };
