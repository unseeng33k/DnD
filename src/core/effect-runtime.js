class Effect {
  constructor(config) {
    this.id = config.id || Math.random().toString(36);
    this.type = config.type;
    this.source = config.source || 'system';
    this.target = config.target || null;
    this.data = config.data || {};
    this.priority = config.priority || 0;
    this.createdAt = new Date();
  }

  async execute(context) {
    return { success: true, result: null };
  }

  async validate(context) {
    return { valid: true };
  }
}

class EffectRuntime {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.effectRegistry = new Map();
    this.executionQueue = [];
    this.executionHistory = [];
  }

  registerEffect(effectType, effectClass) {
    this.effectRegistry.set(effectType, effectClass);
  }

  queue(effect) {
    this.executionQueue.push(effect);
    this.executionQueue.sort((a, b) => b.priority - a.priority);
  }

  queueBulk(effects) {
    for (const effect of effects) {
      this.queue(effect);
    }
  }

  async executeAll(context = {}) {
    const results = [];

    while (this.executionQueue.length > 0) {
      const effect = this.executionQueue.shift();

      try {
        this.eventBus.emit('effect:before', {
          effectId: effect.id,
          effectType: effect.type,
          target: effect.target
        });

        const validation = await effect.validate(context);
        if (!validation.valid) {
          console.warn(`⚠️  Effect validation failed: ${effect.type}`);
          continue;
        }

        const result = await effect.execute(context);
        this.executionHistory.push({
          effectId: effect.id,
          effectType: effect.type,
          source: effect.source,
          target: effect.target,
          result,
          executedAt: new Date()
        });

        results.push(result);

        this.eventBus.emit(`effect:${effect.type}`, {
          effectId: effect.id,
          effectType: effect.type,
          target: effect.target,
          result
        });

      } catch (error) {
        console.error(`❌ Error executing effect '${effect.type}':`, error);
      }
    }

    this.eventBus.emit('effects:complete', { executedCount: results.length, results });
    return results;
  }

  createAndQueue(effectType, config = {}) {
    const effectClass = this.effectRegistry.get(effectType);
    if (!effectClass) {
      throw new Error(`Unknown effect type: ${effectType}`);
    }
    const effect = new effectClass({ type: effectType, ...config });
    this.queue(effect);
    return effect;
  }

  getHistory(limit = 50) {
    return this.executionHistory.slice(-limit);
  }

  clearQueue() {
    this.executionQueue = [];
  }
}

export { Effect, EffectRuntime };
