import MemoryStore from './Memory';
import RedisStore from './Redis';

const storeBackend = process.env.STORE_BACKEND || 'redis';
const storeHost = process.env.STORE_HOST || process.env.REDIS_URL;

let store;
switch (storeBackend) {
  case 'memory':
    store = new MemoryStore();
    break;
  case 'redis':
  default:
    store = new RedisStore(storeHost);
    break;
}

const getStore = () => store;

export default getStore;
