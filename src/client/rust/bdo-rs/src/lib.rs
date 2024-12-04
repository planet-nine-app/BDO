mod structs;

#[cfg(test)]
mod tests;

use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use sessionless::hex::IntoHex;
use sessionless::{Sessionless, Signature};
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;
use std::option::Option;
use crate::structs::{BDOUser, SuccessResult};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Spellbook {
    pub spellbookName: String,
    #[serde(flatten)]
    spells: serde_json::Value
}

pub struct BDO {
    base_url: String,
    client: Client,
    pub sessionless: Sessionless,
}

impl BDO {
    pub fn new(base_url: Option<String>, sessionless: Option<Sessionless>) -> Self {
        BDO {
            base_url: base_url.unwrap_or("https://dev.bdo.allyabase.com/".to_string()),
            client: Client::new(),
            sessionless: sessionless.unwrap_or(Sessionless::new()),
        }
    }

    async fn get(&self, url: &str) -> Result<Response, reqwest::Error> {
        self.client.get(url).send().await
    }

    async fn post(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .post(url)
            .json(&payload)
            .send()
            .await
    }

    async fn put(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .put(url)
            .json(&payload)
            .send()
            .await
    }

    async fn delete(&self, url: &str, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .delete(url)
            .json(&payload)
            .send()
            .await
    }

    fn get_timestamp() -> String {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
            .to_string()
    }

    pub async fn create_user(&self, hash: &str, bdo: &Value) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let pub_key = self.sessionless.public_key().to_hex();
        let signature = self.sessionless.sign(&format!("{}{}{}", timestamp, pub_key, hash)).to_hex();
        
        let payload = json!({
            "timestamp": timestamp,
            "pubKey": pub_key,
            "hash": hash,
            "bdo": bdo,
            "signature": signature
        }).as_object().unwrap().clone();

dbg!("{}", payload.clone());

        let url = format!("{}user/create", self.base_url);
dbg!("{}", &url);
        let res = self.put(&url, serde_json::Value::Object(payload)).await?;
dbg!("{}", &res);
        let user: BDOUser = res.json().await?;

        Ok(user)
    }

    pub async fn update_bdo(&self, uuid: &str, hash: &str, bdo: &Value, is_public: &bool) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "hash": hash,
            "pub": is_public,
            "pubKey": self.sessionless.public_key().to_hex(),
            "bdo": bdo,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/bdo", self.base_url, uuid);
        let res = self.put(&url, serde_json::Value::Object(payload)).await?;
        let user: BDOUser = res.json().await?;

        Ok(user)
    }

    pub async fn get_bdo(&self, uuid: &str, hash: &str) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let url = format!("{}user/{}/bdo?timestamp={}&hash={}&signature={}", self.base_url, uuid, timestamp, hash, signature);
        let res = self.get(&url).await?;
        let user: BDOUser = res.json().await?;
 
        Ok(user)
    }

    pub async fn get_public_bdo(&self, uuid: &str, hash: &str, pub_key: &str) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let url = format!("{}user/{}/bdo?timestamp={}&hash={}&signature={}&pubKey={}", self.base_url, uuid, timestamp, hash, signature, pub_key);
dbg!("{}", &url);
dbg!("{}", &self.sessionless.public_key().to_hex());
        let res = self.get(&url).await?;
        let user: BDOUser = res.json().await?;
 
        Ok(user)
    }



    pub async fn get_spellbooks(&self, uuid: &str, hash: &str) -> Result<Vec<Spellbook>, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message);

        let url = format!("{}user/{}spellbooks?timestamp={}&hash={}&signature={}", self.base_url, uuid, timestamp, hash, signature);
        let res = self.get(&url).await?;
        let spellbooks: Vec<Spellbook> = res.json().await?;
 
        Ok(spellbooks)
    }

    pub async fn put_spellbook(&self, uuid: &str, hash: &str, spellbook: &Spellbook) -> Result<Vec<Spellbook>, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "hash": hash,
            "spellbook": spellbook,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/spellbooks", self.base_url, uuid);
        let res = self.put(&url, serde_json::Value::Object(payload)).await?;
        let spellbooks: Vec<Spellbook> = res.json().await?;

        Ok(spellbooks)
    }

    pub async fn delete_user(&self, uuid: &str, hash: &str) -> Result<SuccessResult, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}", timestamp, uuid);
        let signature = self.sessionless.sign(&message).to_hex();

        let payload = json!({
          "timestamp": timestamp,
          "uuid": uuid,
          "hash": hash,
          "signature": signature
        }).as_object().unwrap().clone();

        let url = format!("{}user/{}/delete", self.base_url, uuid);
        let res = self.delete(&url, serde_json::Value::Object(payload)).await?;
        let success: SuccessResult = res.json().await?;

        Ok(success)
    }
}
