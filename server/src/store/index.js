import MemoryStore from './Memory.js';

let store;

const getStore = () => {
  // Load store on first demand
  if (store === undefined) {
    const storeBackend = process.env.STORE_BACKEND || 'memory';

    switch (storeBackend) {
      case 'memory':
      default:
        store = new MemoryStore();
        break;
    }
  }
  return store;
};

export default getStore;
