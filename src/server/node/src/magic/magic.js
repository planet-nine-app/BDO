import sessionless from 'sessionless-node';
import db from '../persistence/db.js';

sessionless.getKeys = async () => {
  return await db.getKeys();
};
    
const fountURL = 'http://localhost:3006/';

const MAGIC = {
  joinup: async (spell) => {
    const gateway = await MAGIC.gatewayForSpell(spell.spell);
    spell.gateways.push(gateway);
    const spellName = spell.spell;

console.log('about to get bdo');
    const bdo = await db.getBDO('bdo', 'bdo');
    const spellbooks = await db.getSpellbooks();
    const spellbook = spellbooks.filter(spellbook => spellbook[spellName]).pop();
    if(!spellbook) {
      throw new Error('spellbook not found');
    }

console.log('about to get spell entry');
    const spellEntry = spellbook[spell.spell];
    const currentIndex = spellEntry.destinations.indexOf(spellEntry.destinations.find(($) => $.stopName === 'bdo'));
    const nextDestination = spellEntry.destinations[currentIndex + 1].stopURL + spellName;

    const res = await MAGIC.forwardSpell(spell, nextDestination);
    const body = await res.json();

    if(!body.success) {
      return body;
    }

    if(!body.uuids) {
      body.uuids = [];
    }
    body.uuids.push({
      service: 'bdo',
      uuid: 'continuebee'
    });

    return body;
  },

  linkup: async (spell) => {
    const gateway = await MAGIC.gatewayForSpell(spell.spellName);
    spell.gateways.push(gateway);

    const res = await MAGIC.forwardSpell(spell, fountURL);
    const body = await res.json();
    return body;
  },

  gatewayForSpell: async (spellName) => {
    const bdo = await db.getBDO('bdo', 'bdo');
    const gateway = {
      timestamp: new Date().getTime() + '',
      uuid: bdo.fountUUID, 
      minimumCost: 20,
      ordinal: bdo.ordinal
    };      

    const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

    gateway.signature = await sessionless.sign(message);

    return gateway;
  },

  forwardSpell: async (spell, destination) => {
    return await fetch(destination, {
      method: 'post',
      body: JSON.stringify(spell),
      headers: {'Content-Type': 'application/json'}
    });
  },

  // 🪄 MAGIC-ROUTED ENDPOINTS (No auth needed - resolver authorizes)

  bdoUserCreate: async (spell) => {
    try {
      const { hash, bdo: newBDO, pub, pubKey } = spell.components;

      if (!hash) {
        return {
          success: false,
          error: 'Missing required field: hash'
        };
      }

      // Import BDO module
      const bdoModule = await import('../bdo/bdo.js');
      const bdo = bdoModule.default;

      const uuid = spell.casterUUID;
      let emojiShortcode = null;

      if (newBDO) {
        const response = await bdo.putBDO(uuid, newBDO, hash, pub ? pubKey : null);
        if (!response) {
          return {
            success: false,
            error: 'Failed to save BDO'
          };
        }
        emojiShortcode = response.emojiShortcode;
      }

      return {
        success: true,
        uuid,
        bdo: newBDO,
        emojiShortcode
      };
    } catch (err) {
      console.error('bdoUserCreate error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  bdoUserBdo: async (spell) => {
    try {
      const { uuid, hash, pub, pubKey, bdo: bdoData } = spell.components;

      if (!uuid || !hash) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash'
        };
      }

      // Import BDO module
      const bdoModule = await import('../bdo/bdo.js');
      const bdo = bdoModule.default;

      // Check if trying to overwrite a public BDO with different pubKey
      if (pub) {
        const existingBDO = await bdo.getBDO(uuid, hash);
        if (existingBDO && existingBDO.pub && existingBDO.pubKey !== pubKey) {
          return {
            success: false,
            error: 'Cannot overwrite public BDO with different pubKey'
          };
        }
      }

      const response = await bdo.putBDO(uuid, bdoData, hash, pubKey);

      return {
        success: true,
        uuid,
        bdo: response.bdo,
        emojiShortcode: response.emojiShortcode
      };
    } catch (err) {
      console.error('bdoUserBdo error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  bdoUserBases: async (spell) => {
    try {
      const { uuid, hash, bases } = spell.components;

      if (!uuid || !hash || !bases) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash, bases'
        };
      }

      // Import BDO module
      const bdoModule = await import('../bdo/bdo.js');
      const bdo = bdoModule.default;

      const updatedBases = await bdo.putBases(bases);

      return {
        success: true,
        bases: updatedBases
      };
    } catch (err) {
      console.error('bdoUserBases error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  },

  bdoUserSpellbooks: async (spell) => {
    try {
      const { uuid, hash, spellbook } = spell.components;

      if (!uuid || !hash || !spellbook) {
        return {
          success: false,
          error: 'Missing required fields: uuid, hash, spellbook'
        };
      }

      // Import BDO module
      const bdoModule = await import('../bdo/bdo.js');
      const bdo = bdoModule.default;

      const spellbooks = await bdo.putSpellbook(spellbook);

      return {
        success: true,
        spellbooks
      };
    } catch (err) {
      console.error('bdoUserSpellbooks error:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }
};

export default MAGIC;
