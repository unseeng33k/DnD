class Registry {
  constructor(name) {
    this.name = name;
    this.items = new Map();
    this.schemas = new Map();
  }

  register(id, data, schema = null) {
    if (this.items.has(id)) {
      console.warn(`⚠️  Registry '${this.name}': Item '${id}' already exists`);
    }
    this.items.set(id, { id, data, registeredAt: new Date(), schema });
    if (schema) this.schemas.set(id, schema);
    return this;
  }

  get(id) {
    const item = this.items.get(id);
    return item ? item.data : null;
  }

  has(id) {
    return this.items.has(id);
  }

  delete(id) {
    this.items.delete(id);
    this.schemas.delete(id);
    return this;
  }

  keys() {
    return Array.from(this.items.keys());
  }

  values() {
    return Array.from(this.items.values()).map(item => item.data);
  }

  entries() {
    return Array.from(this.items.values());
  }

  find(predicate) {
    const results = [];
    for (const item of this.items.values()) {
      if (predicate(item.data)) {
        results.push(item.data);
      }
    }
    return results;
  }

  count() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
    this.schemas.clear();
    return this;
  }

  registerBulk(items) {
    for (const [id, data] of Object.entries(items)) {
      this.register(id, data);
    }
    return this;
  }
}

export { Registry };
