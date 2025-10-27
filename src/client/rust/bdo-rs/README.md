# BDO Rust Client

This is the Rust client SDK for the BDO (Blockchain Data Objects) miniservice.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
bdo-rs = { path = "path/to/bdo-rs" }
sessionless = "0.x"
tokio = { version = "1", features = ["full"] }
serde_json = "1"
```

## Usage

### Basic Example

```rust
use bdo_rs::BDO;
use sessionless::Sessionless;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize sessionless for key management
    let sessionless = Sessionless::new();

    // Create BDO client (uses dev environment by default)
    let bdo = BDO::new(None, Some(sessionless));

    let hash = "this hash describes the context for this bdo";

    let new_bdo = json!({
        "you": "can",
        "put": "whatever",
        "you": {
            "want": "here",
            "so": "long",
            "as": "it's"
        },
        "an": "object"
    });

    // Create a new user
    let user = bdo.create_user(hash, &new_bdo, &false).await?;
    println!("Created user with UUID: {}", user.uuid);

    // Update the BDO
    let updated_bdo = json!({
        "put": "something else"
    });
    let updated_user = bdo.update_bdo(&user.uuid, hash, &updated_bdo, &false).await?;

    // Get the BDO back
    let retrieved_user = bdo.get_bdo(&user.uuid, hash).await?;
    println!("Retrieved BDO: {:?}", retrieved_user.bdo);

    // Delete the user
    let result = bdo.delete_user(&user.uuid, hash).await?;
    println!("User deleted: {}", result.success);

    Ok(())
}
```

### Working with Emojicodes

Emojicodes are human-memorable identifiers for public BDOs. They consist of 8 emoji (3 base emoji + 5 unique emoji) and are automatically assigned when you create a public BDO.

```rust
use bdo_rs::BDO;
use sessionless::Sessionless;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sessionless = Sessionless::new();
    let bdo = BDO::new(None, Some(sessionless));

    let hash = "my_public_bdo";
    let pub_key = bdo.sessionless.public_key().to_hex();

    // Create a public BDO (automatically gets an emojicode)
    let public_bdo = json!({
        "name": "My Public Data",
        "description": "This is accessible via emojicode"
    });

    let user = bdo.create_user(hash, &public_bdo, &true).await?;

    // Retrieve BDO by emojicode (public BDOs only)
    let emojicode = "🌍🔑💎🌟💎🎨🐉📌"; // Example emojicode
    let response = bdo.get_bdo_by_emojicode(emojicode).await?;

    println!("Emojicode: {}", response.emojicode);
    println!("Public Key: {}", response.pub_key);
    println!("BDO: {:?}", response.bdo);
    println!("Created At: {}", response.created_at);

    Ok(())
}
```

### Getting Public BDOs

```rust
// Get a public BDO using the pubKey parameter
let pub_key = "02a1b2c3..."; // Public key of the BDO owner
let public_user = bdo.get_public_bdo(&user_uuid, hash, pub_key).await?;
```

### Working with Bases

Bases are Planet Nine base preferences:

```rust
use bdo_rs::Bases;
use serde_json::json;

// Get user's bases
let bases_value = bdo.get_bases(&user.uuid, hash).await?;

// Save bases
let new_bases = Bases {
    bases: json!({
        "base1": "data",
        "base2": "more_data"
    })
};
let saved_bases = bdo.save_bases(&user.uuid, hash, &new_bases).await?;
```

### Working with Spellbooks

Spellbooks are used for the MAGIC protocol:

```rust
use bdo_rs::Spellbook;
use serde_json::json;

// Get user's spellbooks
let spellbooks = bdo.get_spellbooks(&user.uuid, hash).await?;
for spellbook in spellbooks {
    println!("Spellbook: {}", spellbook.spellbookName);
}

// Save a new spellbook
let new_spellbook = Spellbook {
    spellbookName: "MySpellbook".to_string(),
    spells: json!({
        "spell1": {
            "incantation": "abracadabra"
        }
    })
};
let updated_spellbooks = bdo.put_spellbook(&user.uuid, hash, &new_spellbook).await?;
```

### Teleportation

The teleport feature validates teleportation tags with allyabase:// protocol support:

```rust
let teleport_url = "allyabase://some/resource";
let content = bdo.teleport(&user.uuid, hash, teleport_url).await?;
println!("Teleported content: {:?}", content);
```

## API Reference

### BDO Client

#### `BDO::new(base_url: Option<String>, sessionless: Option<Sessionless>) -> Self`

Creates a new BDO client instance.

- `base_url`: Optional custom base URL (defaults to `https://dev.bdo.allyabase.com/`)
- `sessionless`: Optional sessionless instance for key management (creates a new one if not provided)

#### `create_user(&self, hash: &str, bdo: &Value, is_public: &bool) -> Result<BDOUser, Error>`

Creates a new BDO user with an optional initial BDO.

#### `update_bdo(&self, uuid: &str, hash: &str, bdo: &Value, is_public: &bool) -> Result<BDOUser, Error>`

Updates or creates a BDO for an existing user.

#### `get_bdo(&self, uuid: &str, hash: &str) -> Result<BDOUser, Error>`

Retrieves a private BDO.

#### `get_public_bdo(&self, uuid: &str, hash: &str, pub_key: &str) -> Result<BDOUser, Error>`

Retrieves a public BDO using the pubKey parameter.

#### `get_bdo_by_emojicode(&self, emojicode: &str) -> Result<EmojicodeResponse, Error>`

Retrieves a public BDO by its emojicode. Returns the emojicode, public key, BDO data, and creation timestamp.

#### `get_bases(&self, uuid: &str, hash: &str) -> Result<Value, Error>`

Gets user's Planet Nine bases.

#### `save_bases(&self, uuid: &str, hash: &str, bases: &Bases) -> Result<Value, Error>`

Updates user's bases.

#### `get_spellbooks(&self, uuid: &str, hash: &str) -> Result<Vec<Spellbook>, Error>`

Gets user's spellbooks.

#### `put_spellbook(&self, uuid: &str, hash: &str, spellbook: &Spellbook) -> Result<Vec<Spellbook>, Error>`

Stores a user spellbook.

#### `delete_user(&self, uuid: &str, hash: &str) -> Result<SuccessResult, Error>`

Deletes a user account. Returns a SuccessResult indicating if the operation succeeded.

#### `teleport(&self, uuid: &str, hash: &str, url: &str) -> Result<Value, Error>`

Validates teleportation tags with allyabase:// protocol support.

## Data Structures

### `BDOUser`
```rust
pub struct BDOUser {
    pub uuid: String,
    pub bdo: Value
}
```

### `EmojicodeResponse`
```rust
pub struct EmojicodeResponse {
    pub emojicode: String,
    pub pub_key: String,
    pub bdo: Value,
    pub created_at: i64
}
```

### `Spellbook`
```rust
pub struct Spellbook {
    pub spellbookName: String,
    #[serde(flatten)]
    spells: serde_json::Value
}
```

### `Bases`
```rust
pub struct Bases {
    pub bases: serde_json::Value
}
```

### `SuccessResult`
```rust
pub struct SuccessResult {
    pub success: bool
}
```

## Environment

By default, the client connects to the development BDO server at `https://dev.bdo.allyabase.com/`. To use a different environment, pass a custom base URL when creating the client:

```rust
let bdo = BDO::new(Some("https://prod.bdo.allyabase.com/".to_string()), Some(sessionless));
```

## Testing

Run the test suite:

```bash
cargo test
```

## License

[Your License Here]
