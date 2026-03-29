import { Effect } from '../core/effect-runtime.js';

class MechanicalEffect extends Effect {
  constructor(config) {
    super(config);
    this.type = 'mechanical';
  }

  async validate(context) {
    if (this.data.requiresTarget && !this.target) {
      return { valid: false, error: 'Target required but not provided' };
    }
    return { valid: true };
  }
}

export { MechanicalEffect };
