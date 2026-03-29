#!/usr/bin/env node

class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listener = {
      id: Math.random().toString(36),
      callback,
      createdAt: new Date()
    };

    this.listeners.get(eventType).push(listener);

    return () => {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.findIndex(l => l.id === listener.id);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  once(eventType, callback) {
    const unsubscribe = this.on(eventType, (event) => {
      callback(event);
      unsubscribe();
    });
    return unsubscribe;
  }

  emit(eventType, eventData = {}) {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: new Date(),
      id: Math.random().toString(36)
    };

    this.recordHistory(event);

    const listeners = this.listeners.get(eventType) || [];

    for (const listener of listeners) {
      try {
        listener.callback(event);
      } catch (error) {
        console.error(`Error in event listener for '${eventType}':`, error);
      }
    }

    return event;
  }

  async emitAsync(eventType, eventData = {}) {
    const event = this.emit(eventType, eventData);
    const listeners = this.listeners.get(eventType) || [];

    const results = await Promise.all(
      listeners.map(listener =>
        Promise.resolve(listener.callback(event))
      )
    );

    return { event, results };
  }

  clear(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(eventType) {
    if (eventType) {
      return (this.listeners.get(eventType) || []).length;
    }

    let total = 0;
    for (const listeners of this.listeners.values()) {
      total += listeners.length;
    }
    return total;
  }

  recordHistory(event) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  getHistory(eventType = null, limit = 50) {
    let history = this.eventHistory;
    if (eventType) {
      history = history.filter(e => e.type === eventType);
    }
    return history.slice(-limit);
  }

  displayStats() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('EVENT BUS STATISTICS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Total listeners: ${this.listenerCount()}`);
    console.log(`Event types subscribed: ${this.listeners.size}`);
    console.log(`History size: ${this.eventHistory.length}\n`);

    console.log('Listeners by type:');
    for (const [eventType, listeners] of this.listeners) {
      console.log(`  ${eventType}: ${listeners.length} listener(s)`);
    }
  }
}

const eventBus = new EventBus();

export { eventBus, EventBus };
