import bdo from '../../src/client/javascript/bdo.js';
import { should } from 'chai';
should();

console.log(bdo);

const savedUser = {};
let keys = {};
const hash = 'firstHash';

it('should register a user', async () => {
  const newBDO = {
    foo: 'bar',
    baz: 'new'
  };
  const uuid = await bdo.createUser(hash, newBDO, (k) => { keys = k; }, () => { return keys; });
console.log(uuid);
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should save bdo', async () => {
  const newBDO = {
    foo: 'bar',
    baz: 'updated'
  };
  const res = await bdo.updateBDO(savedUser.uuid, hash, bdo);
  res.bdo.baz.should.equal('updated');
});

it('should get bdo', async () => {
  const res = await bdo.getBDO(savedUser.uuid, hash);
  res.bdo.baz.should.equal('updated');
});

it('should delete a user', async () => {
  const res = await bdo.deleteUser(savedUser.uuid, hash);
  res.should.equal(true);
});
