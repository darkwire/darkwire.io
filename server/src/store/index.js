import MemoryStore from './Memory';
import RedisStore from './Redis';

let store;

const getStore = () => {
  // Load store on first demand
  if (store === undefined) {
    const storeBackend = process.env.STORE_BACKEND || 'redis';
    const storeHost = process.env.STORE_HOST || process.env.REDIS_URL;

    switch (storeBackend) {
      case 'memory':
        store = new MemoryStore();
        break;
      case 'redis':
      default:
        store = new RedisStore(storeHost);
        break;
    }
  }
  return store;
};

export default getStore;
