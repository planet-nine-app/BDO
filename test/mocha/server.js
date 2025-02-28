import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import superAgent from 'superagent';

const baseURL = process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.bdo.allyabase.com/` : 'http://127.0.0.1:3003/';

const get = async function(path) {
  console.info("Getting " + path);
  return await superAgent.get(path).set('Content-Type', 'application/json');
};

const put = async function(path, body) {
  console.info("Putting " + path);
  return await superAgent.put(path).send(body).set('Content-Type', 'application/json');
};

const post = async function(path, body) {
  console.info("Posting " + path);
console.log(body);
  return await superAgent.post(path).send(body).set('Content-Type', 'application/json');
};

const _delete = async function(path, body) {
  //console.info("deleting " + path);
  return await superAgent.delete(path).send(body).set('Content-Type', 'application/json');
};

const hash = "hereisanexampleofahash";
const anotherHash = "hereisasecondhash";
let savedUser = {};
let savedUser2 = {};
let keys = {};
let keys2 = {};
let keysToReturn = {};

it('should register a user', async () => {
  keys = await sessionless.generateKeys((k) => { keysToReturn = k; }, () => {return keysToReturn;});
/*  keys = {
    privateKey: 'd6bfebeafa60e27114a40059a4fe82b3e7a1ddb3806cd5102691c3985d7fa591',
    pubKey: '03f60b3bf11552f5a0c7d6b52fcc415973d30b52ab1d74845f1b34ae8568a47b5f'
  };*/
  const payload = {
    timestamp: new Date().getTime() + '',
    pubKey: keys.pubKey,
    hash,
    bdo: {
      pubKey: keys.pubKey,
      foo: "bar",
      baz: "bop"
    }
  };

  payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + hash);

  const res = await put(`${baseURL}user/create`, payload);
console.log(res.body);
  savedUser = res.body;
  res.body.uuid.length.should.equal(36);
});

it('should register another user with a public bdo', async () => {
  keys2 = await sessionless.generateKeys((k) => { keysToReturn = k; }, () => {return keysToReturn;});
/*  keys = {
    privateKey: 'd6bfebeafa60e27114a40059a4fe82b3e7a1ddb3806cd5102691c3985d7fa591',
    pubKey: '03f60b3bf11552f5a0c7d6b52fcc415973d30b52ab1d74845f1b34ae8568a47b5f'
  };*/
  const payload = {
    timestamp: new Date().getTime() + '',
    pubKey: keys2.pubKey,
    hash: anotherHash,
    public: true,
    bdo: {
      pubKey: keys2.pubKey,
      foo: "bar",
      baz: "bop",
      public: "pub"
    }
  };

  payload.signature = await sessionless.sign(payload.timestamp + payload.pubKey + anotherHash);

  const res = await put(`${baseURL}user/create`, payload);
console.log(res.body);
  savedUser2 = res.body;
  res.body.uuid.length.should.equal(36);
  
  keysToReturn = keys;
});


it('should update bdo', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const newBDO = {
    pubKey: keys.pubKey,
    foo: "bar",
    baz: "updated"
  };

  const signature = await sessionless.sign(timestamp + uuid + hash);
  const payload = {
    timestamp, 
    uuid, 
    hash, 
    bdo: newBDO, 
    signature
  };

  const res = await put(`${baseURL}user/${savedUser.uuid}/bdo`, payload);
console.log(res.body);
  res.body.bdo.baz.should.equal("updated");
});

it('should get bdo', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bdo?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);
console.log(res.body);
  res.body.bdo.baz.should.equal("updated");   
});

it('should update a public bdo', async () => {
  keysToReturn = keys2;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser2.uuid;

  const newBDO = {
    pubKey: keys2.pubKey,
    foo: "bar",
    baz: "public"
  };

  const signature = await sessionless.sign(timestamp + uuid + anotherHash);
  const payload = {
    timestamp, 
    uuid, 
    hash: anotherHash, 
    bdo: newBDO,
    public: true,
    pubKey: keys2.pubKey, 
    signature
  };

  const res = await put(`${baseURL}user/${savedUser2.uuid}/bdo`, payload);
console.log(res.body);
  res.body.bdo.baz.should.equal("public");
  keysToReturn = keys;
});

it('should get a public bdo', async () => {
  keysToReturn = keys;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bdo?timestamp=${timestamp}&signature=${signature}&hash=${hash}&pubKey=${keys2.pubKey}`);
console.log(res.body);
  res.body.bdo.baz.should.equal("public");   
});

it('should put bases', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;
  const baseId = sessionless.generateUUID();
  const baseId2 = sessionless.generateUUID();

  const bases = {};
  bases[baseId] = {
    name: 'ent',
    description: 'A development server located in Germany',
    location: {
      latitude: 51.0,
      longitude: 9.0,
      postalCode: '16'
    },
    soma: {
      lexary: [
        'art',
        'film'
      ],
      photary: [
        'dogs'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://ent.dolores.allyabase.com'
    },
    joined: false
  };

  bases[baseId2] = {
    name: 'ind',
    description: 'A development server located in India',
    location: {
      latitude: 21.77,
      longitude: 78.87,
      postalCode: '804419'
    },
    soma: {
      lexary: [
        'music',
        'food'
      ],
      photary: [
        'birds'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://ind.dolores.allyabase.com'
    },
    joined: false
  };

  const payload = {
    timestamp,
    uuid,
    hash,
    bases
  };

  payload.signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await put(`${baseURL}user/${uuid}/bases`, payload);

console.log('bases are', res.body);
  Object.keys(res.body.bases).length.should.not.equal(0);
});

it('should get bases', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/bases?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);

console.log('res.body for getting bases', res.body);
  Object.keys(res.body.bases).length.should.not.equal(0);
});

it('should get spellbooks', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);

  const res = await get(`${baseURL}user/${uuid}/spellbooks?timestamp=${timestamp}&signature=${signature}&hash=${hash}`);

  res.body.spellbooks.length.should.not.equal(0);
});

it('should delete a user', async () => {
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser.uuid;

  const signature = await sessionless.sign(timestamp + uuid + hash);
  const payload = {timestamp, uuid, hash, signature};


  const res = await _delete(`${baseURL}user/delete`, payload);
console.log(res.body);
  res.status.should.equal(200);
});

it('should delete another user', async () => {
  keysToReturn = keys2;
  const timestamp = new Date().getTime() + '';
  const uuid = savedUser2.uuid;

  const signature = await sessionless.sign(timestamp + uuid + anotherHash);
  const payload = {timestamp, uuid, hash: anotherHash, signature};


  const res = await _delete(`${baseURL}user/delete`, payload);
console.log(res.body);
  res.status.should.equal(200);
});
