# BDO

This is the JavaScript client SDK for the BDO miniservice. 

### Usage

```javascript
import bdo from 'bdo-js';

const saveKeys = (keys) => { /* handle persisting keys here */ };
const getKeys = () => { /* return keys here. Can be async */ };

const hash = 'this hash describes the context for this bdo';

const newBDO = {
  youc: 'an',
  put: 'whatever',
  you: {
    want: 'here',
    so: 'long',
    as: 'it\'s,
  },
  an: 'object'
};

const uuid = await bdo.createUser(hash, newBDO, saveKeys, getKeys);

newBDO.put = 'something else';

const user = await bdo.updateBDO(uuid, hash, newBDO); 

const userAgain = await bdo.getBDO(uuid, hash); 

const deleted = await bdo.deleteUser(uuid, hash); // returns true on success
```
