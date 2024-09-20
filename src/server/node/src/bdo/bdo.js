import db from '../persistence/db.js';

const bdo = {
  getBDO: async (uuid, hash, pubKey) => {
    const foundBDO = await db.getBDO(uuid, hash, pubKey);
    return foundBDO;
  },

  putBDO: async (uuid, newBDO, hash, pubKey) => {
    const resp = await db.putBDO(uuid, newBDO, hash, pubKey);

    return resp;
  },
  
  getSpellbooks: async () => {
    const resp = await db.getSpellbooks();
    
    return resp;
  },

  deleteBDO: async (uuid, hash) => {
    return (await db.deleteBDO(uuid, hash));
  }
};

export default bdo;
