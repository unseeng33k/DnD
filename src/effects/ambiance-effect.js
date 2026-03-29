import { Effect } from '../core/effect-runtime.js';

class AmbianceEffect extends Effect {
  constructor(config) {
    super(config);
    this.type = 'ambiance';
  }

  async validate(context) {
    if (!this.data.sceneType) {
      return { valid: false, error: 'Scene type required' };
    }
    return { valid: true };
  }

  async execute(context) {
    return {
      success: true,
      music: this.data.music,
      imagePrompt: this.data.imagePrompt,
      sensory: this.data.sensory
    };
  }
}

export { AmbianceEffect };
