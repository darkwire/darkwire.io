import Redis from 'redis';

export class RedisStore {
  constructor(redisUrl) {
    bluebird.promisifyAll(Redis.RedisClient.prototype);
    bluebird.promisifyAll(Redis.Multi.prototype);
    this.redis = Redis.createClient(redisUrl);
  }

  get(key, field) {
    return this.redis.hgetAsync(key, field);
  }

  getALl(key) {
    return this.redis.hgetAsync(key, field);
  }

  set(key, field, value) {
    return this.redis.hsetAsync(key, field);
  }
  del(key, field) {
    return this.hdelAsync(key, field);
  }
  inc(key, field, inc = 1) {
    return this.redis.incrbyAsync(key, field, inc);
  }
}

export class MemoryStore {
  constructor() {
    this.store = {};
  }

  async get(key, field) {
    return this.store[key][field];
  }

  async getALl(key) {
    return this.store[key];
  }

  async set(key, field, value) {
    if (this.store[key] === undefined) {
      this.store[key] = {};
    }
    this.store[key][field] = value;
  }

  async del(key, field) {
    delete this.store[key][field];
  }

  async inc(key, field, inc = 1) {
    this.store[key][field] += inc;
  }
}
