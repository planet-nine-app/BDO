# BDO MAGIC-Routed Endpoints

## Overview

BDO (Big Dumb Object) now supports MAGIC-routed versions of all PUT operations. These spells route through Fount (the resolver) for centralized authentication, eliminating the need for continuebee verification in BDO.

## Converted Routes

### 1. Create User with BDO
**Direct Route**: `PUT /user/create`
**MAGIC Spell**: `bdoUserCreate`
**Cost**: 50 MP

**Components**:
```javascript
{
  hash: "password-hash",
  bdo: {
    name: "My BDO",
    description: "A Big Dumb Object",
    data: { /* any JSON data */ }
  },
  pub: false,        // Optional: make BDO public
  pubKey: "pub-key"  // Required if pub=true
}
```

**Returns**:
```javascript
{
  success: true,
  uuid: "user-uuid",
  bdo: {
    name: "My BDO",
    description: "A Big Dumb Object",
    data: { /* any JSON data */ }
  },
  emojiShortcode: "🌍🔑💎🌟💎🎨🐉📌"  // Only if pub=true
}
```

**Validation**:
- Requires hash
- BDO is optional (can create user without initial BDO)
- If pub=true, pubKey is required
- Public BDOs automatically get emojicode and shortcode

---

### 2. Update User BDO
**Direct Route**: `PUT /user/:uuid/bdo`
**MAGIC Spell**: `bdoUserBdo`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash",
  bdo: {
    /* updated BDO data */
  },
  pub: false,        // Optional: make BDO public
  pubKey: "pub-key"  // Required if pub=true
}
```

**Returns**:
```javascript
{
  success: true,
  uuid: "user-uuid",
  bdo: {
    /* updated BDO data */
  },
  emojiShortcode: "🌍🔑💎🌟💎🎨🐉📌"  // Only if pub=true
}
```

**Validation**:
- Requires uuid and hash
- Cannot overwrite public BDO with different pubKey
- Public BDO pubKey is locked on first public save

---

### 3. Update User Bases
**Direct Route**: `PUT /user/:uuid/bases`
**MAGIC Spell**: `bdoUserBases`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash",
  bases: {
    "allyabase": {
      name: "Allyabase",
      url: "https://allyabase.com"
    },
    "mybase": {
      name: "My Custom Base",
      url: "https://mybase.com"
    }
  }
}
```

**Returns**:
```javascript
{
  success: true,
  bases: {
    "allyabase": {
      name: "Allyabase",
      url: "https://allyabase.com"
    },
    "mybase": {
      name: "My Custom Base",
      url: "https://mybase.com"
    }
  }
}
```

**Validation**:
- Requires uuid, hash, and bases
- Bases is a key-value object of base configurations

---

### 4. Update User Spellbooks
**Direct Route**: `PUT /user/:uuid/spellbooks`
**MAGIC Spell**: `bdoUserSpellbooks`
**Cost**: 50 MP

**Components**:
```javascript
{
  uuid: "user-uuid",
  hash: "password-hash",
  spellbook: {
    spellbookName: "mySpellbook",
    mySpell: {
      cost: 100,
      destinations: [
        { stopName: "service1", stopURL: "http://localhost:3000/" }
      ],
      resolver: "fount",
      mp: true
    }
  }
}
```

**Returns**:
```javascript
{
  success: true,
  spellbooks: [
    {
      spellbookName: "mySpellbook",
      mySpell: { /* spell definition */ }
    }
  ]
}
```

**Validation**:
- Requires uuid, hash, and spellbook
- Spellbook must have spellbookName property
- Spellbook contains spell definitions

---

## Implementation Details

### File Changes

1. **`/src/server/node/src/magic/magic.js`** - Added four new spell handlers:
   - `bdoUserCreate(spell)`
   - `bdoUserBdo(spell)`
   - `bdoUserBases(spell)`
   - `bdoUserSpellbooks(spell)`

2. **`/fount/src/server/node/spellbooks/spellbook.js`** - Added spell definitions with destinations and costs

3. **`/test/mocha/magic-spells.js`** - New test file with comprehensive spell tests

4. **`/test/mocha/package.json`** - Added `fount-js` dependency

### Authentication Flow

```
Client → Fount (resolver) → BDO MAGIC handler → Business logic
           ↓
    Verifies signature
    Deducts MP
    Grants experience
    Grants nineum
```

**Before (Direct REST)**:
- Client signs request
- BDO calls continuebee for auth
- BDO executes business logic

**After (MAGIC Spell)**:
- Client signs spell
- Fount verifies signature & deducts MP
- Fount grants experience & nineum to caster
- Fount forwards to BDO
- BDO executes business logic (no auth needed)

### Naming Convention

Route path → Spell name transformation:
```
/user/create           → bdoUserCreate
/user/:uuid/bdo        → bdoUserBdo
/user/:uuid/bases      → bdoUserBases
/user/:uuid/spellbooks → bdoUserSpellbooks
```

Pattern: `[service][PathWithoutSlashesAndParams]`

### Public BDO System

Public BDOs are special BDOs that can be accessed without authentication:

**Emojicode System**:
- 8-emoji codes for human-memorable identifiers
- Format: 3 base emoji + 5 unique emoji
- Example: `🌍🔑💎🌟💎🎨🐉📌`
- Automatically assigned on first public save
- Accessible via GET `/emoji/:emojicode` endpoint

**Short Code System**:
- 9-character hex codes for URL-friendly access
- Example: `000000042`
- Incremental counter-based generation
- Accessible via GET `/short/:shortCode` endpoint

**Public BDO Protection**:
- First pubKey to make BDO public locks it
- Cannot overwrite with different pubKey
- Prevents public BDO hijacking

### Error Handling

All spell handlers return consistent error format:
```javascript
{
  success: false,
  error: "Error description"
}
```

**Common Errors**:
- Missing required fields (hash, uuid, bdo, bases, spellbook)
- Cannot overwrite public BDO with different pubKey
- Failed to save BDO

## Testing

Run MAGIC spell tests:
```bash
cd bdo/test/mocha
npm install
npm test magic-spells.js
```

Test coverage:
- ✅ User creation with BDO via spell
- ✅ Public BDO creation with emojicode
- ✅ BDO update via spell
- ✅ Bases update via spell
- ✅ Spellbooks update via spell
- ✅ Missing hash validation
- ✅ Missing uuid validation
- ✅ Missing fields validation
- ✅ Public BDO protection (different pubKey rejection)

## Benefits

1. **No Continuebee Dependency**: BDO handlers don't need to call continuebee for auth
2. **Centralized Auth**: All signature verification in one place (Fount)
3. **Automatic Rewards**: Every spell grants experience + nineum
4. **Gateway Rewards**: Gateway participants get 10% of rewards
5. **Reduced Code**: BDO handlers simplified without auth logic
6. **Consistent Pattern**: Same flow across all services

## BDO Data Structure

### What is a BDO?
A "Big Dumb Object" is a flexible, schema-less JSON storage system that allows users to store arbitrary data structures.

**Characteristics**:
- No schema validation
- Stores any valid JSON
- Can be private (hash-authenticated) or public (pubKey-locked)
- Supports large objects (10mb limit)
- Automatic emojicode/shortcode generation for public BDOs

**Example BDO**:
```javascript
{
  name: "My Project",
  description: "A cool project",
  metadata: {
    created: "2025-01-14",
    version: "1.0"
  },
  data: {
    // Any arbitrary JSON structure
    users: [...],
    settings: {...},
    content: [...]
  }
}
```

### Bases System
Bases are configuration objects for Planet Nine bases (deployments):

```javascript
{
  "allyabase": {
    name: "Allyabase",
    url: "https://allyabase.com",
    services: ["fount", "bdo", "joan", "pref", ...]
  },
  "mybase": {
    name: "My Custom Base",
    url: "https://mybase.example.com",
    services: ["fount", "bdo"]
  }
}
```

### Spellbooks System
Spellbooks are collections of MAGIC spell definitions:

```javascript
{
  spellbookName: "myCustomSpells",
  mySpell1: {
    cost: 100,
    destinations: [
      { stopName: "service1", stopURL: "http://..." },
      { stopName: "fount", stopURL: "http://..." }
    ],
    resolver: "fount",
    mp: true
  },
  mySpell2: {
    // Another spell definition
  }
}
```

## Use Cases

### 1. Flexible Data Storage
Store any JSON data without defining schemas:
- User profiles
- Application settings
- Document storage
- Configuration management

### 2. Public Data Sharing
Create public BDOs with memorable emojicodes:
- Share data with easy-to-remember emoji strings
- URL-friendly short codes for links
- Locked to original pubKey for security

### 3. Base Configuration
Manage Planet Nine base deployments:
- Define available services
- Configure URLs and endpoints
- Support multi-base deployments

### 4. Custom Spellbooks
Create custom MAGIC spells:
- Define spell costs
- Configure routing
- Set up MP requirements
- Build custom workflows

## Next Steps

Progress on MAGIC route conversion:
- ✅ Joan (3 routes complete)
- ✅ Pref (4 routes complete)
- ✅ Aretha (4 routes complete)
- ✅ Continuebee (3 routes complete)
- ✅ BDO (4 routes complete)
- ⏳ Julia
- ⏳ Dolores
- ⏳ Sanora
- ⏳ Addie
- ⏳ Covenant
- ⏳ Prof
- ⏳ Fount (internal routes)
- ⏳ Minnie (SMTP only, no HTTP routes)

## Last Updated
January 14, 2025
