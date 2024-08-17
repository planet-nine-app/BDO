import db from '../persistence/db.js';

const prefs = {
  getBDO: async (uuid, hash) => {
    const bdo = await db.getBDO(uuid, hash);
    return bdo;
  },

  putBDO: async (uuid, newBDO, hash) => {
    const resp = await db.putBDO(uuid, newBDO, hash);

    return resp;
  },

  deleteBDO: async (uuid, hash) => {
    return (await db.deleteBDO(uuid, hash));
  }
};

export default prefs;
