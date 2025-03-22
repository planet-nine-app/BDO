'use strict';

var sessionless = require('sessionless-node');
var fetch = require('node-fetch');

const get = async (url) => {
  return await fetch(url);
};

const put = async (url, payload) => {
  return await fetch(url, {
    method: 'put',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const _delete = async (url, payload) => {
  return await fetch(url, {
    method: 'delete',
    body: JSON.stringify(payload),
    headers: {'Content-Type': 'application/json'}
  });
};

const bdo = {
  baseURL: 'https://dev.bdo.allyabase.com/',

  createUser: async (hash, newBDO, saveKeys, getKeys) => {
    const keys = (await getKeys()) || (await sessionless.generateKeys(saveKeys, getKeys));
    sessionless.getKeys = getKeys;

    const payload = {
      timestamp: new Date().getTime() + '',
      pubKey: keys.pubKey,
      hash,
      bdo: newBDO
    };

    payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + payload.hash);

    const res = await put(`${bdo.baseURL}user/create`, payload);
    const user = await res.json();
console.log(user);
    const uuid = user.uuid;

    return uuid;
  },

  updateBDO: async (uuid, hash, newBDO, pub) => {
    const timestamp = new Date().getTime() + '';
    const keys = await sessionless.getKeys();

    const signature = await sessionless.sign(timestamp + uuid + hash);
    const payload = {
      timestamp, 
      uuid, 
      hash, 
      bdo: newBDO, 
      public: pub,
      pubKey: keys.pubKey,
      signature
    };

    const res = await put(`${bdo.baseURL}user/${uuid}/bdo`, payload);
    const user = res.json();
        
    return user;
  },

  getBDO: async (uuid, hash, pubKey) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    let getURL = `${bdo.baseURL}user/${uuid}/bdo?timestamp=${timestamp}&hash=${hash}&signature=${signature}`;
    if(pubKey) {
      await sessionless.getKeys();
      getURL = `${getURL}&pubKey=${pubKey}`;
    }

    const res = await get(getURL);
    const user = await res.json();
   
    return user;
  },

  getBases: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    let getURL = `${bdo.baseURL}user/${uuid}/bases?timestamp=${timestamp}&hash=${hash}&signature=${signature}`;

    const res = await get(getURL);
    const bases = await res.json();
    return bases.bases;
  },

  saveBases: async (uuid, hash, bases) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    const payload = {
      timestamp,
      uuid,
      hash,
      signature,
      bases
    };

    const putURL = `${bdo.baseURL}user/${uuid}/bases`;
    
    const res = await put(putURL, payload);
    const receivedBases = await res.json();
    return receivedBases.bases;
  },

  getSpellbooks: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    let getURL = `${bdo.baseURL}user/${uuid}/spellbooks?timestamp=${timestamp}&hash=${hash}&signature=${signature}`;

    const res = await get(getURL);
    const spellbooks = await res.json();
    return spellbooks.spellbooks;
  },

  putSpellbook: async (uuid, hash, spellbook) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);

    const payload = {
      timestamp,
      uuid,
      hash,
      signature,
      spellbook
    };

    const putURL = `${bdo.baseURL}user/${uuid}/spellbooks`;
    
    const res = await put(putURL, payload);
    const spellbooks = await res.json();
    return spellbooks.spellbooks;
  },

  deleteUser: async (uuid, hash) => {
    const timestamp = new Date().getTime() + '';

    const signature = await sessionless.sign(timestamp + uuid + hash);
    const payload = {timestamp, uuid, hash, signature};


    const res = await _delete(`${bdo.baseURL}user/delete`, payload);
    return res.status === 200;
  }

};

module.exports = bdo;
