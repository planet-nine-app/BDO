import config from './config/local.js';
import express from 'express';
import cors from 'cors';
import bdo from './src/bdo/bdo.js';
import fetch from 'node-fetch';
import sessionless from 'sessionless-node';

const sk = (keys) => {
  global.keys = keys;
};

const gk = () => {
  return keys;
};

const continuebeeURL = 'https://dev.continuebee.allyabase.com/';

sessionless.generateKeys(sk, gk);

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
console.log('got request');
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
    const hash = body.hash;
    const newBDO = body.bdo;
    
console.log(`${continuebeeURL}user/create`);
console.log(body);

    const resp = await fetch(`${continuebeeURL}user/create`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
console.log(resp.status);
    if(resp.status !== 201) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }
    const user = await resp.json();
    const uuid = user.userUUID;

    if(newBDO) {
      const response = await bdo.putBDO(uuid, bdo, hash);
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
    const signature = body.signature;
    
    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&hash=${hash}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const newBDO = await bdo.putBDO(uuid, body.bdo, hash);
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

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&signature=${signature}`);
console.log(resp.status);
    if(resp.status !== 200) {
      res.status = 403;
      return res.send({error: 'Auth error'});
    }

    const newBDO = await bdo.getBDO(uuid, hash);
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

app.delete('/user/delete', async (req, res) => {
  try {
    const body = req.body;
    const timestamp = body.timestamp;
    const uuid = body.uuid;
    const hash = body.hash;
    const signature = body.signature;

    const resp = await fetch(`${continuebeeURL}user/${uuid}?timestamp=${timestamp}&signature=${signature}`);
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