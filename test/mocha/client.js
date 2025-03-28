import bdo from '../../src/client/javascript/bdo.js';
import { should } from 'chai';
import sessionless from 'sessionless-node';
should();

console.log(bdo);

const savedUser = {};
const savedUser2 = {};
let keys;
let keys2 = {};
let keysToReturn;
const hash = 'firstHash';
const anotherHash = 'secondHash';
let baseId;

bdo.baseURL = `http://localhost:3003/`;

it('should register a user', async () => {
  const newBDO = {
    foo: 'bar',
    baz: 'new'
  };
  const uuid = await bdo.createUser(hash, newBDO, (k) => { keys = k; keysToReturn = k; }, () => { return keys; });
console.log(uuid);
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should register another user', async () => {
  const newBDO = {
    foo: 'bar',
    baz: 'another'
  };
  const uuid = await bdo.createUser(anotherHash, newBDO, (k) => { keys2 = k; keysToReturn = k;}, () => { return keysToReturn; });
console.log(uuid);
  savedUser2.uuid = uuid;
  savedUser2.uuid.length.should.equal(36);
});

it('should save bdo', async () => {
  keysToReturn = keys;
  const newBDO = {
    foo: 'bar',
    baz: 'updated'
  };
  const res = await bdo.updateBDO(savedUser.uuid, hash, newBDO);
  res.bdo.baz.should.equal('updated');
});

it('should get bdo', async () => {
  const res = await bdo.getBDO(savedUser.uuid, hash);
  res.bdo.baz.should.equal('updated');
});

it('should save a public bdo', async () => {
  keysToReturn = keys2;
  const pubBDO = {
    foo: 'bar',
    baz: 'public'
  };
  const res = await bdo.updateBDO(savedUser2.uuid, anotherHash, pubBDO, true);
  res.bdo.baz.should.equal('public');
  keysToReturn = keys;
});

it('should get a public bdo', async () => {
  const res = await bdo.getBDO(savedUser.uuid, hash, keys2.pubKey);
  res.bdo.baz.should.equal('public');
});

it('should save a base', async () => {
  keysToReturn = keys2;
  
  baseId = sessionless.generateUUID();

  const bases = {};
  bases[baseId] = {
    name: 'FOO',
    description: 'here is the first description',
    location: {
      latitude: 10.50900,
      longitude: 133.90483,
      postalCode: '12345'
    },
    soma: {
      lexary: [
        'parties'
      ],
      photary: [
        'music'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://dev.dolores.allyabase.com'
    },
    joined: true
  };

  const res = await bdo.saveBases(savedUser2.uuid, anotherHash, bases);
  res[baseId].name.should.equal('FOO');
  keysToReturn = keys;
});

it('should get bases', async () => {
  const res = await bdo.getBases(savedUser.uuid, hash);
  res[baseId].name.should.equal('FOO');
});

it('should delete a user', async () => {
  const res = await bdo.deleteUser(savedUser.uuid, hash);
  res.should.equal(true);
});

it('should delete another user', async () => {
  keysToReturn = keys2;
  const res = await bdo.deleteUser(savedUser2.uuid, anotherHash);
});
