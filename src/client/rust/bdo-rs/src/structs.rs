use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct BDOUser {
    pub uuid: String,
    pub bdo: Value
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Spellbook {
    pub foo: String,
    pub bar: Value
}

