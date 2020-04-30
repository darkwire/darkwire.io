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
      return '';
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
  }

  async del(key, field) {
    if (this.store[key] === undefined || this.store[key][field] === undefined) {
      return;
    }
    delete this.store[key][field];
  }

  async inc(key, field, inc = 1) {
    this.store[key][field] += inc;
  }

}

export default MemoryStore