import { should } from 'chai';
should();
import sessionless from 'sessionless-node';
import fount from 'fount-js';
import { createHash } from 'crypto';

const baseURL = process.env.SUB_DOMAIN ? `https://${process.env.SUB_DOMAIN}.fount.allyabase.com/` : 'http://127.0.0.1:3006/';
fount.baseURL = baseURL;

// Helper to create password hash
const createPasswordHash = (email, password) => {
  const hash = createHash('sha256');
  hash.update(`${email}:${password}`);
  return hash.digest('hex');
};

let keys = {};
let fountUser = {};
let testHash = '';

describe('BDO MAGIC Spell Tests', () => {

  before(async () => {
    // Generate keys for testing
    keys = await sessionless.generateKeys(() => { return keys; }, () => { return keys; });

    // Create fount user for spell casting
    fountUser = await fount.createUser(() => keys, () => keys);
    console.log('Created fount user:', fountUser.uuid);

    // Create test password hash
    testHash = createPasswordHash('magic-test@bdo.com', 'PASSWORD123');
  });

  it('should create user with BDO via bdoUserCreate spell', async () => {
    const timestamp = Date.now().toString();

    const testBDO = {
      name: 'Test BDO',
      description: 'A test Big Dumb Object',
      data: { foo: 'bar', baz: 123 }
    };

    const spell = {
      spell: 'bdoUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 0,
      components: {
        hash: testHash,
        bdo: testBDO,
        pub: false
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserCreate', spell);

    console.log('bdoUserCreate result:', result);

    result.should.have.property('success', true);
    result.should.have.property('uuid', fountUser.uuid);
    result.should.have.property('bdo');
    result.bdo.should.have.property('name', 'Test BDO');
  });

  it('should create public BDO with emojicode via bdoUserCreate spell', async () => {
    const timestamp = Date.now().toString();

    const publicBDO = {
      name: 'Public BDO',
      description: 'A public Big Dumb Object',
      public: true
    };

    const spell = {
      spell: 'bdoUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 1,
      components: {
        hash: testHash,
        bdo: publicBDO,
        pub: true,
        pubKey: keys.pubKey
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserCreate', spell);

    console.log('bdoUserCreate (public) result:', result);

    result.should.have.property('success', true);
    result.should.have.property('emojiShortcode');
    console.log('Generated emojicode:', result.emojiShortcode);
  });

  it('should update BDO via bdoUserBdo spell', async () => {
    const timestamp = Date.now().toString();

    const updatedBDO = {
      name: 'Updated BDO',
      description: 'An updated Big Dumb Object',
      data: { updated: true }
    };

    const spell = {
      spell: 'bdoUserBdo',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 2,
      components: {
        uuid: fountUser.uuid,
        hash: testHash,
        bdo: updatedBDO,
        pub: false
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserBdo', spell);

    console.log('bdoUserBdo result:', result);

    result.should.have.property('success', true);
    result.should.have.property('uuid', fountUser.uuid);
    result.should.have.property('bdo');
  });

  it('should update bases via bdoUserBases spell', async () => {
    const timestamp = Date.now().toString();

    const testBases = {
      'allyabase': {
        name: 'Allyabase',
        url: 'https://allyabase.com'
      },
      'testbase': {
        name: 'Test Base',
        url: 'https://testbase.com'
      }
    };

    const spell = {
      spell: 'bdoUserBases',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 3,
      components: {
        uuid: fountUser.uuid,
        hash: testHash,
        bases: testBases
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserBases', spell);

    console.log('bdoUserBases result:', result);

    result.should.have.property('success', true);
    result.should.have.property('bases');
  });

  it('should update spellbooks via bdoUserSpellbooks spell', async () => {
    const timestamp = Date.now().toString();

    const testSpellbook = {
      spellbookName: 'testSpellbook',
      testSpell: {
        cost: 100,
        destinations: [
          { stopName: 'test', stopURL: 'http://localhost:9999/' }
        ],
        resolver: 'fount'
      }
    };

    const spell = {
      spell: 'bdoUserSpellbooks',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 4,
      components: {
        uuid: fountUser.uuid,
        hash: testHash,
        spellbook: testSpellbook
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserSpellbooks', spell);

    console.log('bdoUserSpellbooks result:', result);

    result.should.have.property('success', true);
    result.should.have.property('spellbooks');
  });

  it('should fail to create BDO with missing hash', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'bdoUserCreate',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 5,
      components: {
        // Missing hash
        bdo: { name: 'Test' }
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserCreate', spell);

    console.log('bdoUserCreate (missing hash) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to update BDO with missing uuid', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'bdoUserBdo',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 6,
      components: {
        // Missing uuid
        hash: testHash,
        bdo: { name: 'Test' }
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserBdo', spell);

    console.log('bdoUserBdo (missing uuid) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to update bases with missing fields', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'bdoUserBases',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 7,
      components: {
        // Missing uuid, hash, and bases
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserBases', spell);

    console.log('bdoUserBases (missing fields) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to update spellbooks with missing spellbook', async () => {
    const timestamp = Date.now().toString();

    const spell = {
      spell: 'bdoUserSpellbooks',
      casterUUID: fountUser.uuid,
      timestamp,
      totalCost: 50,
      mp: true,
      ordinal: 8,
      components: {
        uuid: fountUser.uuid,
        hash: testHash
        // Missing spellbook
      }
    };

    // Sign the spell
    const message = timestamp + spell.spell + spell.casterUUID + spell.totalCost + spell.mp + spell.ordinal;
    spell.casterSignature = await sessionless.sign(message);

    // Cast the spell
    const result = await fount.castSpell('bdoUserSpellbooks', spell);

    console.log('bdoUserSpellbooks (missing spellbook) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
  });

  it('should fail to overwrite public BDO with different pubKey', async () => {
    // First create a public BDO
    const timestamp1 = Date.now().toString();

    const publicBDO = {
      name: 'Locked Public BDO',
      description: 'This BDO is locked to a pubKey'
    };

    const createSpell = {
      spell: 'bdoUserCreate',
      casterUUID: fountUser.uuid,
      timestamp: timestamp1,
      totalCost: 50,
      mp: true,
      ordinal: 9,
      components: {
        hash: testHash,
        bdo: publicBDO,
        pub: true,
        pubKey: keys.pubKey
      }
    };

    const createMessage = timestamp1 + createSpell.spell + createSpell.casterUUID + createSpell.totalCost + createSpell.mp + createSpell.ordinal;
    createSpell.casterSignature = await sessionless.sign(createMessage);

    await fount.castSpell('bdoUserCreate', createSpell);

    // Try to overwrite with different pubKey
    const timestamp2 = Date.now().toString();
    const differentPubKey = '02' + 'a'.repeat(64); // Fake different pubKey

    const updateSpell = {
      spell: 'bdoUserBdo',
      casterUUID: fountUser.uuid,
      timestamp: timestamp2,
      totalCost: 50,
      mp: true,
      ordinal: 10,
      components: {
        uuid: fountUser.uuid,
        hash: testHash,
        bdo: { name: 'Hacked BDO' },
        pub: true,
        pubKey: differentPubKey
      }
    };

    const updateMessage = timestamp2 + updateSpell.spell + updateSpell.casterUUID + updateSpell.totalCost + updateSpell.mp + updateSpell.ordinal;
    updateSpell.casterSignature = await sessionless.sign(updateMessage);

    const result = await fount.castSpell('bdoUserBdo', updateSpell);

    console.log('bdoUserBdo (wrong pubKey) result:', result);

    result.should.have.property('success', false);
    result.should.have.property('error');
    result.error.should.include('pubKey');
  });

});
