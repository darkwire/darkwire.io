import MemoryStore from './Memory';
import RedisStore from './Redis';

const storeBackend = process.env.STORE_BACKEND || 'redis';

let store;
switch (storeBackend) {
  case 'memory':
    store = new MemoryStore();
    break;
  case 'redis':
  default:
    store = new RedisStore(process.env.STORE_HOST);
    break;
}

const getStore = () => store;

export default getStore;
