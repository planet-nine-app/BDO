# BDO (Blockchain Data Objects) Service

## Overview

The BDO service is a core Planet Nine microservice that provides persistent storage and retrieval of Blockchain Data Objects. It handles user data management, authentication, and now includes short code functionality for easy BDO sharing.

## Key Features

### ✅ **Core BDO Operations**
- **User Creation**: Create and manage BDO users with authentication
- **BDO Storage**: Store and retrieve BDOs with hash-based indexing
- **Public/Private BDOs**: Support for both authenticated and public BDO access
- **Authentication**: Integration with continuebee for user verification

### ✅ **Collections Management**
- **Bases Storage**: Manage user's Planet Nine base preferences
- **Spellbooks**: Store and retrieve user spellbooks for MAGIC protocol
- **CarrierBag Integration**: Support for Fount carrierBag BDO storage

### ✅ **Short Code System** (January 2025)
- **36-bit Hex Codes**: Generate unique 9-character hex strings for public BDOs
- **Incremental Generation**: Simple counter-based short code assignment
- **Bidirectional Mapping**: Fast lookup in both directions (pubKey ↔ shortCode)
- **Redis Persistence**: All mappings stored in Redis for performance
- **Automatic Assignment**: Short codes assigned automatically on first public BDO save
- **URL-Friendly Access**: GET `/short/:shortCode` endpoint for easy sharing

### ✅ **Emojicode System** (October 2025)
- **8-Emoji Codes**: Human-memorable identifiers (3 base emoji + 5 unique emoji)
- **Base Emoji**: Configurable per environment (env var `BDO_BASE_EMOJI`)
- **Collision Detection**: Automatic retry with uniqueness verification
- **Bidirectional Mapping**: Fast lookup in both directions (pubKey ↔ emojicode)
- **Creation Timestamps**: Track when emojicodes were created for pruning
- **Dual Endpoints**: GET `/emoji/:emojicode` and GET `/pubkey/:pubKey/emojicode`
- **Automatic Assignment**: Emojicodes assigned automatically on first public BDO save

## Technical Architecture

### Core Components
- **Express Server**: RESTful API on port 3003
- **Redis Client**: Persistent storage through `src/persistence/db.js`
- **Authentication Middleware**: Time-based request validation
- **MAGIC Gateway**: Integration for spell casting functionality

### Short Code Implementation
```javascript
// Redis Keys
shortcode:counter         // Incremental counter for generation
shortcode:code:{pubKey}   // pubKey -> shortCode mapping
shortcode:pubkey:{shortCode} // shortCode -> pubKey mapping

// Generation Algorithm
counter = parseInt(currentCounter) + 1
shortCode = counter.toString(16).padStart(9, '0')
// Examples: 000000001, 000000002, 00000000a, etc.
```

### Emojicode Implementation
```javascript
// Redis Keys
emojicode:pubkey:{emojicode}   // emojicode -> pubKey mapping
emojicode:code:{pubKey}         // pubKey -> emojicode mapping
emojicode:created:{emojicode}   // emojicode -> timestamp mapping

// Generation Algorithm
baseEmoji = process.env.BDO_BASE_EMOJI || '🌍🔑💎'  // 3 emoji
uniqueEmoji = randomSample(EMOJI_PALETTE, 5)         // 5 emoji
emojicode = baseEmoji + uniqueEmoji
// Example: 🌍🔑💎🌟💎🎨🐉📌

// Collision Detection
while (await checkEmojicodeExists(emojicode)) {
  uniqueEmoji = randomSample(EMOJI_PALETTE, 5)
  emojicode = baseEmoji + uniqueEmoji
}
```

### Emoji Palette
100 diverse, easily distinguishable emoji organized by category:
- **Celestial**: 🌟🌙🌍🌊🔥💎
- **Arts**: 🎨🎭🎪🎯🎲🎸
- **Nature**: 🐉🐙🐚🐝🐞🐢
- **Objects**: 👑💡📌🔑🔒🔔
- **Time**: 🕐🕑🕒🕓🕔🕕
- And more categories for uniqueness...

## API Endpoints

### BDO Operations
- `PUT /user/create` - Create new user with optional BDO
- `PUT /user/:uuid/bdo` - Store/update user BDO
- `GET /user/:uuid/bdo` - Retrieve user BDO (supports `?emojicode=...` query param)
- `DELETE /user/delete` - Delete user account

### Collections
- `GET /user/:uuid/bases` - Get user's Planet Nine bases
- `PUT /user/:uuid/bases` - Update user's bases
- `GET /user/:uuid/spellbooks` - Get user's spellbooks
- `PUT /user/:uuid/spellbooks` - Store user spellbook

### Short Codes & Emojicodes
- `GET /short/:shortCode` - Retrieve BDO by short code
- `GET /emoji/:emojicode` - Retrieve BDO by emojicode (returns BDO, pubKey, createdAt)
- `GET /pubkey/:pubKey/emojicode` - Get emojicode for a pubKey (reverse lookup)

### MAGIC Protocol
- `POST /magic/spell/:spellName` - Execute spell via MAGIC gateway

### Teleportation
- `GET /user/:uuid/teleport` - Validate teleportation tags with allyabase:// protocol support

## File Structure

```
bdo/
├── src/server/node/
│   ├── bdo.js                    # Main Express server
│   ├── config/local.js           # Configuration (includes base emoji)
│   └── src/
│       ├── bdo/bdo.js           # BDO business logic
│       ├── magic/magic.js       # MAGIC protocol handlers
│       ├── persistence/db.js     # Redis client and data operations
│       └── utils/
│           └── emojicoding.js   # Emojicode generation utility
└── CLAUDE.md                    # Main documentation
```

## Recent Changes

### Emojicode Feature (October 2025)
- Added automatic emojicode generation for public BDOs
- Implemented 8-emoji codes (3 base + 5 unique) for human-memorable identifiers
- Created collision detection with automatic retry mechanism
- Bidirectional Redis mapping with creation timestamps for pruning
- Two endpoints: `/emoji/:emojicode` and `/pubkey/:pubKey/emojicode`
- Base emoji configurable via `BDO_BASE_EMOJI` environment variable
- 100-emoji diverse palette for uniqueness

### Short Code Feature (January 2025)
- Added automatic short code generation for public BDOs
- Implemented bidirectional Redis mapping system
- Created `/short/:shortCode` endpoint for URL-friendly access
- All persistence handled through existing db.js Redis client
- Counter-based generation ensures uniqueness per node

### Implementation Details
- **Automatic Assignment**: Both short codes and emojicodes assigned in `putBDO()` when pubKey provided
- **Persistence Strategy**: All operations use Redis client, no direct file system access
- **Uniqueness**:
  - Short codes: Node-specific incremental counter
  - Emojicodes: Random selection with collision detection
- **Format**:
  - Short codes: 36-bit hex (9 characters) for URL compatibility
  - Emojicodes: 8 emoji (3 base + 5 unique) for human memorability

## Usage Examples

### Create Public BDO (Auto-assigns Short Code & Emojicode)
```javascript
await db.putBDO(userUuid, bdoData, hash, pubKey);
// Automatically assigns:
// - Short code: "000000042"
// - Emojicode: "🌍🔑💎🌟💎🎨🐉📌"
```

### Retrieve by Short Code
```bash
curl http://localhost:3003/short/000000042
# Returns: { shortCode, pubKey, bdo: {...} }
```

### Retrieve by Emojicode
```bash
curl "http://localhost:3003/emoji/🌍🔑💎🌟💎🎨🐉📌"
# Returns: { emojicode, pubKey, bdo: {...}, createdAt: 1697040000000 }
```

### Get Emojicode for PubKey (Reverse Lookup)
```bash
curl http://localhost:3003/pubkey/02a1b2c3.../emojicode
# Returns: { pubKey, emojicode: "🌍🔑💎🌟💎🎨🐉📌", createdAt: 1697040000000 }
```

### Retrieve BDO Using Emojicode Query Parameter
```bash
# Standard BDO retrieval with authenticated request
curl "http://localhost:3003/user/user-uuid-123/bdo?timestamp=1697040000000&hash=myHash&signature=sig123&emojicode=🌍🔑💎🌟💎🎨🐉📌"
# Returns: { uuid: "user-uuid-123", bdo: {...} }

# The emojicode parameter automatically resolves to pubKey
# Equivalent to: ?pubKey=02a1b2c3...
```

### JavaScript API
```javascript
// Get short code
const shortCode = await db.getShortCodeForPubKey(pubKey);

// Get emojicode
const emojicode = await db.getEmojicodeForPubKey(pubKey);

// Reverse lookup
const pubKey = await db.getPubKeyForEmojicode(emojicode);

// Check creation time (for pruning)
const timestamp = await db.getEmojicodeCreationTime(emojicode);
```

### Configure Base Emoji
```bash
# Set custom base emoji for your Planet Nine base
export BDO_BASE_EMOJI="🏰👑✨"
```

The BDO service provides the foundational data layer for the entire Planet Nine ecosystem, with enhancements for easy BDO sharing through both machine-friendly short codes and human-memorable emojicodes.

## MAGIC Route Conversion (October 2025)

All BDO REST endpoints have been converted to MAGIC protocol spells:

### Converted Spells (6 total)
1. **bdoUserCreate** - Create BDO user with optional initial BDO
2. **bdoUserBDO** - Store/update user BDO
3. **bdoUserBDOPublic** - Save public BDO with short code and emojicode
4. **bdoUserSpellbooks** - Store user spellbooks
5. **bdoUserBases** - Update user's Planet Nine bases
6. **bdoUserDelete** - Delete BDO user

**Testing**: Comprehensive MAGIC spell tests available in `/test/mocha/magic-spells.js` (10 tests covering success and error cases)

**Documentation**: See `/MAGIC-ROUTES.md` for complete spell specifications and migration guide

**Special Features**:
- Public BDO spell automatically generates short codes and emojicodes
- All spells maintain backward compatibility with existing BDO features
- Emojicode creation timestamps tracked for future pruning

## Last Updated
October 14, 2025 - Completed full MAGIC protocol conversion. All 6 routes now accessible via MAGIC spells with centralized Fount authentication.