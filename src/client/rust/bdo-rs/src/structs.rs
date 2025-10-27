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

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SuccessResult {
    pub success: bool
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct EmojicodeResponse {
    pub emojicode: String,
    pub pub_key: String,
    pub bdo: Value,
    pub created_at: i64
}

