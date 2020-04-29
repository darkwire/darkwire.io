import Redis from 'redis';
import bluebird from 'bluebird';

/**
 * Redis store.
 */
export class RedisStore {
  constructor(redisUrl) {
    bluebird.promisifyAll(Redis.RedisClient.prototype);
    bluebird.promisifyAll(Redis.Multi.prototype);
    this.redis = Redis.createClient(redisUrl);
  }

  get(key, field) {
    return this.redis.hgetAsync(key, field);
  }

  getAll(key) {
    return this.redis.hgetallAsync(key);
  }

  set(key, field, value) {
    return this.redis.hsetAsync(key, field, value);
  }

  del(key, field) {
    return this.hdelAsync(key, field);
  }

  inc(key, field, inc = 1) {
    return this.redis.incrbyAsync(key, field, inc);
  }
}

/**
 * Memory store more for testing purpose than production use.
 */
export class MemoryStore {
  constructor() {
    this.store = {};
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
