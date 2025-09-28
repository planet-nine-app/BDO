import { createClient } from './client.js';
import sessionless from 'sessionless-node';

const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const db = {
  getBDO: async (uuid, hash, pubKey) => {
console.log('getting: ', hash);
    const queryString = pubKey ? `bdo:${pubKey}` : `bdo:${uuid}_${hash}`;
console.log('should get bdo for: ', pubKey ? 'pubKey' : 'hash');
console.log(queryString);
    const bdo = await client.get(queryString);
console.log(bdo);
    const parsedBDO = JSON.parse(bdo);
    return parsedBDO;
  },

  putBDO: async (uuid, bdo, hash, pubKey) => {
console.log('putting', bdo, 'for', hash);
    const hashQueryString = `bdo:${uuid}_${hash}`;
    await client.set(hashQueryString, JSON.stringify(bdo));
    if(pubKey) {
console.log('saving pubKey bdo for: ', `bdo:${pubKey}`);
      await client.set(`bdo:${pubKey}`, JSON.stringify(bdo));

      // Generate and save short code for public BDOs
      let shortCode = await client.get(`shortcode:code:${pubKey}`);
      if (!shortCode) {
        const currentCounter = await client.get('shortcode:counter') || '0';
        const nextCounter = parseInt(currentCounter) + 1;
        await client.set('shortcode:counter', nextCounter.toString());
        shortCode = nextCounter.toString(16).padStart(9, '0');

        // Save bidirectional mapping
        await client.set(`shortcode:pubkey:${shortCode}`, pubKey);
        await client.set(`shortcode:code:${pubKey}`, shortCode);
console.log(`assigned short code ${shortCode} to pubKey ${pubKey}`);
      }
    }
    return bdo;
  },

  getBases: async () => {
    const basesString = (await client.get(`allyabases`)) || '{}';
    const bases = JSON.parse(basesString);

    return bases;
  },

  putBases: async (newBases) => {
    if(!newBases) {
      throw new Error('malformed bases');
    }
    const basesString = (await client.get('allyabases')) || '{}';
    const bases = JSON.parse(basesString);
    const updatedBases = {...bases, ...newBases};
    await client.set(`allyabases`, JSON.stringify(updatedBases));

    return updatedBases;
  },

  getSpellbooks: async () => {
    const spellbooksString = (await client.get(`spellbooks`)) || '[]';
    const spellbooks = JSON.parse(spellbooksString);

    return spellbooks;
  },

  putSpellbook: async (spellbook) => {
    if(!spellbook || !spellbook.spellbookName) {
      throw new Error('malformed spellbok');
    }
    const spellbooksString = (await client.get('spellbooks')) || '[]';
    const spellbooks = JSON.parse(spellbooksString);
    spellbooks.push(spellbook);
    await client.set(`spellbooks`, JSON.stringify(spellbooks));

    return spellbooks;
  },

  deleteBDO: async (uuid, hash) => {
    const resp = await client.del(`bdo:${uuid}_${hash}`);

    return true;
  },

  saveKeys: async (keys) => {
    await client.set(`keys`, JSON.stringify(keys));
  },

  getKeys: async () => {
    const keyString = await client.get('keys');
    return JSON.parse(keyString);
  },

  // Short code functionality for public BDOs
  getNextShortCode: async () => {
    const currentCounter = await client.get('shortcode:counter') || '0';
    const nextCounter = parseInt(currentCounter) + 1;
    await client.set('shortcode:counter', nextCounter.toString());

    // Convert to 36-bit hex (9 hex characters max for 36 bits)
    const shortCode = nextCounter.toString(16).padStart(9, '0');
    return shortCode;
  },

  saveShortCodeMapping: async (pubKey, shortCode) => {
    // Save bidirectional mapping
    await client.set(`shortcode:pubkey:${shortCode}`, pubKey);
    await client.set(`shortcode:code:${pubKey}`, shortCode);
  },

  getShortCodeForPubKey: async (pubKey) => {
    return await client.get(`shortcode:code:${pubKey}`);
  },

  getPubKeyForShortCode: async (shortCode) => {
    return await client.get(`shortcode:pubkey:${shortCode}`);
  }

};

export default db;
