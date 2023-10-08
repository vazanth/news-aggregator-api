const fsPromises = require('fs/promises');
const path = require('path');
const cacheManager = require('./cacheManager');

const filepath = path.join(__dirname, '..', 'data', 'users.json');

const readFile = async () => {
  const cachedData = cacheManager.get(filepath);
  if (cachedData) {
    return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
  }
  const data = JSON.parse(
    await fsPromises.readFile(filepath, {
      encoding: 'utf-8',
      flag: 'r',
    })
  );

  cacheManager.set(filepath, data);

  return data;
};

const writeFile = async (resource) => {
  await fsPromises.writeFile(filepath, resource, {
    encoding: 'utf-8',
    flag: 'w',
  });
  cacheManager.set(filepath, resource);
};

module.exports = {
  readFile,
  writeFile,
};
