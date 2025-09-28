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

## API Endpoints

### BDO Operations
- `PUT /user/create` - Create new user with optional BDO
- `PUT /user/:uuid/bdo` - Store/update user BDO
- `GET /user/:uuid/bdo` - Retrieve user BDO
- `DELETE /user/delete` - Delete user account

### Collections
- `GET /user/:uuid/bases` - Get user's Planet Nine bases
- `PUT /user/:uuid/bases` - Update user's bases
- `GET /user/:uuid/spellbooks` - Get user's spellbooks
- `PUT /user/:uuid/spellbooks` - Store user spellbook

### Short Codes
- `GET /short/:shortCode` - Retrieve BDO by short code

### MAGIC Protocol
- `POST /magic/spell/:spellName` - Execute spell via MAGIC gateway

### Teleportation
- `GET /user/:uuid/teleport` - Validate teleportation tags with allyabase:// protocol support

## File Structure

```
bdo/
├── src/server/node/
│   ├── bdo.js                    # Main Express server
│   ├── config/local.js           # Configuration
│   └── src/
│       ├── bdo/bdo.js           # BDO business logic
│       ├── magic/magic.js       # MAGIC protocol handlers
│       └── persistence/db.js     # Redis client and data operations
└── CLAUDE.md                    # This documentation
```

## Recent Changes (January 2025)

### Short Code Feature
- Added automatic short code generation for public BDOs
- Implemented bidirectional Redis mapping system
- Created `/short/:shortCode` endpoint for URL-friendly access
- All persistence handled through existing db.js Redis client
- Counter-based generation ensures uniqueness per node

### Implementation Details
- **Automatic Assignment**: Short codes assigned in `putBDO()` when pubKey provided
- **Persistence Strategy**: All operations use Redis client, no direct file system access
- **Uniqueness**: Node-specific uniqueness using incremental counter
- **Format**: 36-bit hex (9 characters) for URL compatibility

## Usage Examples

### Create Public BDO (Auto-assigns Short Code)
```javascript
await db.putBDO(userUuid, bdoData, hash, pubKey);
// Automatically assigns short code like "000000042"
```

### Retrieve by Short Code
```bash
curl http://localhost:3003/short/000000042
# Returns: { shortCode, pubKey, bdo: {...} }
```

### Get Short Code for PubKey
```javascript
const shortCode = await db.getShortCodeForPubKey(pubKey);
```

The BDO service provides the foundational data layer for the entire Planet Nine ecosystem, with recent enhancements for easy BDO sharing through short codes.