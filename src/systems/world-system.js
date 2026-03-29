class WorldSystem {
  constructor(eventBus, worldRegistry) {
    this.eventBus = eventBus;
    this.worldRegistry = worldRegistry;
    this.worldState = new Map();

    this.setupListeners();
  }

  setupListeners() {
    this.eventBus.on('turn:world-updated', (event) => {
      this.updateWorldState(event.data.updates);
    });
  }

  updateWorldState(updates) {
    for (const [key, value] of Object.entries(updates)) {
      this.worldState.set(key, value);
    }

    if (Object.keys(updates).length > 0) {
      console.log(`🌍 World state updated`);
    }
  }

  getWorldState(key) {
    return this.worldState.get(key);
  }
}

export { WorldSystem };
