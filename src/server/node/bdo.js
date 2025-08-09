import config from './config/local.js';
import express from 'express';
import cors from 'cors';
import bdo from './src/bdo/bdo.js';
import fetch from 'node-fetch';
import fount from 'fount-js';
import sessionless from 'sessionless-node';
import MAGIC from './src/magic/magic.js';
import db from './src/persistence/db.js';

const sk = (keys) => {
  global.keys = keys;
};

const gk = () => {
  return keys;
};

const SUBDOMAIN = process.env.SUBDOMAIN || 'dev';
fount.baseURL = process.env.LOCALHOST ? 'http://localhost:3006/' : `https://${SUBDOMAIN}.fount.allyabase.com/`;

console.log('fount\'s baseURL is ', fount.baseURL);

const continuebeeURL = process.env.LOCALHOST ? 'http://localhost:2999/' : `https://${SUBDOMAIN}.continuebee.allyabase.com/`;

const repeat = (func) => {
  setTimeout(func, 2000);
};

const bootstrap = async () => {
  try {
    const fountUser = await fount.createUser(db.saveKeys, db.getKeys);
//console.log('Why is this an object???', fountUUID);
//    const fountUser = await fount.getUserByUUID(fountUUID);
console.log('fountUser here looks like: ', fountUser);
    const bdo = {
      uuid: 'bdo',
      fountUUID: fountUser.uuid,
      fountPubKey: fountUser.pubKey,
      ordinal: 0
    };

    if(!bdo.fountUUID) {
      throw new Error('BDO bootstrap failed because of no fountUUID');
    }

    await db.putBDO('bdo', bdo, 'bdo');
  } catch(err) {
console.warn(err);
    repeat(bootstrap);
  }
};

repeat(bootstrap);

sessionless.generateKeys(sk, gk);

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > config.allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.put('/user/create', async (req, res) => {
  try {
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    const newBDO = body.bdo;
    const pub = body.public;
    const pubKey = body.pubKey;

    const authBody = {
      timestamp,
      hash,
      pubKey,
      signature: body.signature
    };
    
    const resp = await fetch(`${continuebeeURL}user/create`, {
      method: 'post',
      body: JSON.stringify(authBody),
      headers: {'Content-Type': 'application/json'}
    });
    
    if(resp.status !== 200) {
console.log('resp.status is', resp.status);
      res.status = 403;
      return res.send({error: 'Auth error'});
    }
    const user = await resp.json();
    const uuid = user.userUUID;

    if(newBDO) {
      const response = await bdo.putBDO(uuid, newBDO, hash, pub ? pubKey : null);
      if(!response) {
        res.status = 404;
        return res.send({error: 'not found'});
      }
    }
    
    return res.send({
      uuid,
      bdo: newBDO
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/bdo', async (req, res) => {
console.log('putting bdo');
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    const pub = body.pub;
    const pubKey = body.pubKey;
    const signature = body.signature;
    
    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }
  
    if(pub) {
      const existingBDO = await bdo.getBDO(uuid, hash);
      if(existingBDO && existingBDO.pubKey !== pubKey) {
console.log('this is failing');
console.log(existingBDO.pubKey);
console.log(pubKey);
        res.status = 403;
        return res.send({error: 'Auth error'});
      }
    }

    const newBDO = await bdo.putBDO(uuid, body.bdo, hash, pubKey);
    return res.send({
      uuid,
      bdo: newBDO
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/bdo', async (req, res) => {
console.log('get bdo');
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const hash = req.query.hash;
    const pubKey = req.query.pubKey;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const newBDO = await bdo.getBDO(uuid, hash, pubKey);
    return res.send({
      uuid, 
      bdo: newBDO
    });
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/bases', async (req, res) => {
console.log('get bases');
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const hash = req.query.hash;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

console.log('about to get bases');
    const bases = await bdo.getBases();
    return res.send({bases});
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/bases', async (req, res) => {
console.log('putting bases');
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const signature = body.signature;
    const hash = body.hash;
    const bases = body.bases;

console.log('should save bases', bases);

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

console.log('about to put bases');
    const updatedBases = await bdo.putBases(bases);
    return res.send({bases: updatedBases});
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.get('/user/:uuid/spellbooks', async (req, res) => {
console.log('get spellbooks');
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const hash = req.query.hash;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

console.log('about to get spellbooks');
    const spellbooks = await bdo.getSpellbooks();
console.log('spellbooks looks like: ', spellbooks);
    return res.send({spellbooks});
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.put('/user/:uuid/spellbooks', async (req, res) => {
console.log('putting spellbook');
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const signature = body.signature;
    const hash = body.hash;
    const spellbook = body.spellbook;

console.log('should save spellbook', spellbook.spellbookName);

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

console.log('about to get spellbooks');
    const spellbooks = await bdo.putSpellbook(spellbook);
    return res.send({spellbooks});
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});


app.post('/magic/spell/:spellName', async (req, res) => {
  try {
    const spellName = req.params.spellName;
    const spell = req.body;
    
    if(!MAGIC[spellName]) {
console.log('sending this back');
      res.status(404); 
      res.send({error: 'spell not found'});
    }
    
    let spellResp = {};
    spellResp = await MAGIC[spellName](spell);
console.log('spellResp', spellResp);
    res.status(spellResp.success ? 200 : 900);
    return res.send(spellResp);
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({error: 'not found'});
  }
});

import safeTeleportationParser from 'teleportation-js';
import fs from 'fs';

// Helper function to translate URLs for Docker container networking
function translateUrlForContainer(url) {
  // Check if we're running inside a Docker container
  const isInContainer = fs.existsSync('/.dockerenv') || 
                        process.env.HOSTNAME?.startsWith('allyabase') ||
                        (process.env.HOSTNAME?.length === 12);
  
  if (!isInContainer) {
    return url;
  }

  // Translate localhost URLs to container names for Docker networking
  const translated = url
    // Base 1 translations (5121 -> allyabase-base1:7243, 5114 -> allyabase-base1:3003)
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5121\//g, "http://allyabase-base1:7243/")
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5114\//g, "http://allyabase-base1:3003/")
    // Base 2 translations (5221 -> allyabase-base2:7243, 5214 -> allyabase-base2:3003)  
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5221\//g, "http://allyabase-base2:7243/")
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5214\//g, "http://allyabase-base2:3003/")
    // Base 3 translations (5321 -> allyabase-base3:7243, 5314 -> allyabase-base3:3003)
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5321\//g, "http://allyabase-base3:7243/")
    .replace(/http:\/\/(127\.0\.0\.1|localhost):5314\//g, "http://allyabase-base3:3003/");

  if (translated !== url) {
    console.log('🐳 Docker container detected - translating URL:');
    console.log('   From:', url);
    console.log('   To:  ', translated);
  }

  return translated;
}

app.get('/user/:uuid/teleport', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const timestamp = req.query.timestamp;
    const hash = req.query.hash;
    const signature = req.query.signature;
    const url = req.query.url;
 
    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    // Translate URL for container networking if needed
    const containerUrl = translateUrlForContainer(url);
    const teleportTag = await safeTeleportationParser.getTeleportTag(containerUrl);
    const isValid = await safeTeleportationParser.isValidTag(teleportTag);

    if(isValid) {
      return res.send({valid: true, ...teleportTag});
    }

    res.send({valid: false});
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.delete('/user/delete', async (req, res) => {
  try {
    const body = req.body;
    const timestamp = body.timestamp;
    const uuid = body.uuid;
    const hash = body.hash;
    const signature = body.signature;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    res.status = 202;
    return res.send();
  } catch(err) {
console.warn(err);
    res.status(404);
    return res.send({error: 'not found'});
  }
});

app.listen(3003);
console.log('give me your bdo');
