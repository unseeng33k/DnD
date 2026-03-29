import { Effect } from '../core/effect-runtime.js';

class NarrativeEffect extends Effect {
  constructor(config) {
    super(config);
    this.type = 'narrative';
  }

  async execute(context) {
    return {
      success: true,
      narrative: this.data.narrative,
      sensory: this.data.sensory
    };
  }
}

export { NarrativeEffect };
