const NodeCache = require('node-cache');

class CacheManager {
  constructor() {
    this.cache = new NodeCache();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    return this.cache.set(key, value);
  }

  keys() {
    return this.cache.keys();
  }

  delete(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  mget(key) {
    return this.cache.mget(key);
  }
}

// Create a single instance of CacheManager and export it throughout to avoid duplicate instances
const cacheManagerInstance = new CacheManager();

module.exports = cacheManagerInstance;
