// unmocking the common mock has this is the core test file so calling the fn directly
jest.unmock('../../src/helpers/cacheManager');
jest.resetModules();

const cacheManagerInstance = require('../../src/helpers/cacheManager');

describe("Verify cacheManager's different methods", () => {
  beforeEach(() => {
    // Reset the state of cacheManagerInstance before each test case
    cacheManagerInstance.cache.flushAll(); // Assuming NodeCache supports a method like flushAll() to clear all cached items
  });

  it('should set and get values from the cache', () => {
    const key = 'testKey';
    const value = 'testValue';

    cacheManagerInstance.set(key, value);
    const retrievedValue = cacheManagerInstance.get(key);

    expect(retrievedValue).toBe(value);
  });

  it('should return an array of keys', () => {
    cacheManagerInstance.set('key1', 'value1');
    cacheManagerInstance.set('key2', 'value2');
    cacheManagerInstance.set('key3', 'value3');

    expect(cacheManagerInstance.keys()).toEqual(['key1', 'key2', 'key3']);
  });

  it('should delete a key from the cache', () => {
    const key = 'keyToDelete';
    cacheManagerInstance.set(key, 'valueToDelete');

    cacheManagerInstance.delete(key);

    expect(cacheManagerInstance.get(key)).toBeUndefined();
  });

  it('should flush all the keys', () => {
    cacheManagerInstance.set('key1', 'value1');
    cacheManagerInstance.set('key2', 'value2');
    cacheManagerInstance.set('key3', 'value3');

    cacheManagerInstance.flush();

    expect(cacheManagerInstance.get('key1')).toBeUndefined();
    expect(cacheManagerInstance.get('key2')).toBeUndefined();
    expect(cacheManagerInstance.get('key3')).toBeUndefined();
  });

  it('should retrieve multiple values from the cache', () => {
    const keys = ['key1', 'key2', 'key3'];
    const values = ['value1', 'value2', 'value3'];

    keys.forEach((key, index) => {
      cacheManagerInstance.set(key, values[index]);
    });

    const retrievedValues = cacheManagerInstance.mget(keys);

    expect(retrievedValues).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });

  it('should return undefined for non-existing keys', () => {
    const keys = ['nonExistingKey1', 'nonExistingKey2'];

    const retrievedValues = cacheManagerInstance.mget(keys);

    expect(retrievedValues).toEqual({});
  });
});
