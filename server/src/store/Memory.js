/**
 * Memory store more for testing purpose than production use.
 */
export class MemoryStore {
  constructor() {
    this.store = {};
    this.hasSocketAdapter = false;
  }

  async get(key, field) {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return null;
    }
    return this.store[key][field];
  }

  async getAll(key) {
    if (this.store[key] === undefined) {
      return [];
    }

    return this.store[key];
  }

  async set(key, field, value) {
    if (this.store[key] === undefined) {
      this.store[key] = {};
    }
    this.store[key][field] = value;
    return 1;
  }

  async del(key, field) {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return 0;
    }
    delete this.store[key][field];
    return 1;
  }

  async inc(key, field, inc = 1) {
    this.store[key][field] += inc;
    return this.store[key][field];
  }
}

export default MemoryStore;
