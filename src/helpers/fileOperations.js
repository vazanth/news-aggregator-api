const fsPromises = require('fs/promises');
const path = require('path');
const cacheManager = require('./cacheManager');

const filepath = path.join(__dirname, '..', 'data', 'users.json');

const readFile = async (path = filepath, isHtmlFile = false) => {
  const cachedData = cacheManager.get(path);
  if (cachedData) {
    return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
  }

  const result = await fsPromises.readFile(path, {
    encoding: 'utf-8',
    flag: 'r',
  });

  const data = isHtmlFile ? result : JSON.parse(result);

  cacheManager.set(path, data);

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
