import config from '../../config/local.js';
import { createClient } from 'redis';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getBDO: async (uuid, hash) => {
console.log(uuid, hash);
    const bdo = await client.get(`bdo:${uuid}_${hash}`);
    const parsedBDO = JSON.parse(bdo);
console.log(`parsedBDO: ${JSON.stringify(parsedBDO)}`);
console.log(uuid);
    return parsedBDO;
  },

  putBDO: async (uuid, bdo, hash) => {
console.log(uuid, bdo, hash);
    await client.set(`bdo:${uuid}_${hash}`, JSON.stringify(bdo));
    return bdo;
  },

  deleteBDO: async (uuid, hash) => {
    const resp = await client.sendCommand(['DEL', `bdo:${uuid}_${hash}`]);

    return true;
  },
};

export default db;
