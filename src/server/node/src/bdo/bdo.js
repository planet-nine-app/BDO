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

  getBases: async () => {
    const resp = await db.getBases();
    
    return resp;
  },

  putBases: async (bases) => {
    const resp = await db.putBases(bases);

    return resp;
  },
  
  getSpellbooks: async () => {
    const resp = await db.getSpellbooks();
    
    return resp;
  },

  putSpellbook: async (spellbook) => {
    const resp = await db.putSpellbook(spellbook);

    return resp;
  },

  deleteBDO: async (uuid, hash) => {
    return (await db.deleteBDO(uuid, hash));
  }
};

export default bdo;
