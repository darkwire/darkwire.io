import Redis from 'redis';
import bluebird from 'bluebird';
import socketRedis from 'socket.io-redis';

/**
 * Redis store.
 */
export class RedisStore {
  constructor(redisUrl) {
    bluebird.promisifyAll(Redis.RedisClient.prototype);
    bluebird.promisifyAll(Redis.Multi.prototype);
    this.redisUrl = redisUrl;
    this.redis = Redis.createClient(redisUrl);
    this.hasSocketAdapter = true;
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
    return this.redis.hdelAsync(key, field);
  }

  inc(key, field, inc = 1) {
    return this.redis.incrbyAsync(key, field, inc);
  }

  getSocketAdapter() {
    return socketRedis(this.redisUrl);
  }
}

export default RedisStore;
