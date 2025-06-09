pub mod structs;

#[cfg(test)]
mod tests;

use url::Url;
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sessionless::hex::IntoHex;
use sessionless::{Sessionless};
use std::time::{SystemTime, UNIX_EPOCH};
use std::option::Option;
use crate::structs::{BDOUser, SuccessResult};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Spellbook {
    pub spellbook_name: String,
    #[serde(flatten)]
    spells: serde_json::Value
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Bases {
    pub bases: serde_json::Value
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all="camelCase")]
pub struct Spellbooks {
    pub spellbooks: Vec<Spellbook>
}

pub struct BDO {
    base_url: Url,
    client: Client,
    pub sessionless: Sessionless,
}

impl BDO {
    pub fn new(sessionless: Option<Sessionless>) -> Self {
        BDO {
            base_url: Url::parse("https://dev.bdo.allyabase.com/").unwrap(),  // Will never panic
            client: Client::new(),
            sessionless: sessionless.unwrap_or(Sessionless::new()),
        }
    }

    pub fn set_url(&mut self, url: impl AsRef<str>) -> Result<(), url::ParseError> {
        self.base_url = Url::parse(url.as_ref())?;
        Ok(())
    }

    async fn get(&self, url: Url) -> Result<Response, reqwest::Error> {
        self.client
            .get(url)
            .send()
            .await
    }

    #[allow(unused)]
    async fn post(&self, url: Url, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .post(url)
            .json(&payload)
            .send()
            .await
    }

    async fn put(&self, url: Url, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .put(url)
            .json(&payload)
            .send()
            .await
    }

    async fn delete(&self, url: Url, payload: serde_json::Value) -> Result<Response, reqwest::Error> {
        self.client
            .delete(url)
            .json(&payload)
            .send()
            .await
    }

    /// Returns the current timestamp since unix epoch as milliseconds.
    /// Panics when system time is set before that point. (should never happen)
    fn get_timestamp() -> String {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_millis()
            .to_string()
    }

    pub async fn create_user(&self, hash: &str, bdo: &serde_json::Value) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let pub_key = self.sessionless.public_key().to_hex();
        let signature = self.sessionless.sign(
            format!("{}{}{}", timestamp, pub_key, hash)
        ).to_hex();
        
        let payload = json!({
            "timestamp": timestamp,
            "pubKey": pub_key,
            "hash": hash,
            "bdo": bdo,
            "signature": signature
        }).as_object().unwrap().clone();

        let res = self.put(
            self.base_url.join("user/create")?,
            serde_json::Value::Object(payload)
        ).await?;

        let user: BDOUser = res.json().await?;
        Ok(user)
    }

    pub async fn update_bdo(&self, uuid: &str, hash: &str, bdo: &serde_json::Value, is_public: &bool) -> Result<BDOUser, Box<dyn std::error::Error>> {
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

        let url = self
            .base_url
            .join(&*format!("user/{uuid}/bdo"))?;

        let res = self.put(url, serde_json::Value::Object(payload)).await?;

        let user: BDOUser = res.json().await?;
        Ok(user)
    }

    pub async fn get_bdo(&self, uuid: &str, hash: &str, pub_key: Option<&str>) -> Result<BDOUser, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let mut url = self
            .base_url
            .join(&*format!("user/{uuid}/bdo"))?;

        url.set_query(Some(
            &*if let Some(pub_key) = pub_key {
                format!("timestamp={timestamp}&hash={hash}&signature={signature}&pubKey={pub_key}")
            } else {
                format!("timestamp={timestamp}&hash={hash}&signature={signature}")
            }
        ));

        let res = self.get(url).await?;

        let user: BDOUser = res.json().await?;
        Ok(user)
    }

    pub async fn get_bases(&self, uuid: &str, hash: &str) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let mut url = self
            .base_url
            .join(&*format!("user/{uuid}/bases"))?;

        url.set_query(Some(
            &*format!("timestamp={timestamp}&hash={hash}&signature={signature}")
        ));

        let res = self.get(url).await?;

        let bases: Bases = res.json().await?;
        Ok(bases.bases)
    }

    pub async fn save_bases(&self, uuid: &str, hash: &str, bases: &Bases) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let payload = json!({
            "timestamp": timestamp,
            "uuid": uuid,
            "hash": hash,
            "bases": bases,
            "signature": signature
        }).as_object().unwrap().clone();

        let url = self
            .base_url
            .join(&*format!("user/{uuid}/bases"))?;

        let res = self.put(url, serde_json::Value::Object(payload)).await?;

        let bases: Bases = res.json().await?;
        Ok(bases.bases)
    }



    pub async fn get_spellbooks(&self, uuid: &str, hash: &str) -> Result<Vec<Spellbook>, Box<dyn std::error::Error>> {
        let timestamp = Self::get_timestamp();
        let message = format!("{}{}{}", timestamp, uuid, hash);
        let signature = self.sessionless.sign(message).to_hex();

        let mut url = self
            .base_url
            .join(&*format!("user/{uuid}/spellbooks"))?;

        url.set_query(Some(
            &*format!("timestamp={timestamp}&hash={hash}&signature={signature}")
        ));

        let res = self.get(url).await?;

        let spellbooks: Spellbooks = res.json().await?;
        Ok(spellbooks.spellbooks)
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

        let url = self
            .base_url
            .join(&*format!("user/{uuid}/spellbooks"))?;

        let res = self.put(url, serde_json::Value::Object(payload)).await?;

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

        let url = self
            .base_url
            .join(&*format!("user/{uuid}/delete"))?;

        let res = self.delete(url, serde_json::Value::Object(payload)).await?;

        let success: SuccessResult = res.json().await?;
        Ok(success)
    }
}
