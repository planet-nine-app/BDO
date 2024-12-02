use crate::{BDOUser, BDO, Gateway, Nineum, Spell, SpellResult, SuccessResult};
use sessionless::hex::IntoHex;
use sessionless::hex::FromHex;
use sessionless::{Sessionless, PrivateKey};
use std::collections::HashMap;
use serde_json::json;
use serde_json::Value;

#[actix_rt::test]
async fn test_bdo() {

    let mut saved_user: Option<BDOUser>;
    let mut saved_user2: Option<BDOUser>; 
    let bdo = BDO::new(Some("http://localhost:3003/".to_string()), None);
    let bdo2 = BDO::new(Some("http://localhost:3003/".to_string()), None);
    let bdo3 = BDO::new(Some("http://localhost:3003/".to_string()), Some(Sessionless::from_private_key(PrivateKey::from_hex("a29435a4fb1a27a284a60b3409efeebbe6a64db606ff38aeead579ccf2262dc4").expect("private key"))));
    let hash = "hereisanexampleofahash";
    let hash2 = "hereisasecondhash";

    async fn create_user(bdo: &BDO) -> Option<BDOUser> {
    println!("creating user");
        let publicBDO = json!({
            "foo": "foo",
            "pub": bdo.public_key().to_hex()
         });
	let result = bdo.create_user(&hash, &publicBDO).await;
    println!("got to here");

	match result {
	    Ok(user) => {
		println!("Successfully got BDOUser: {}", user.uuid);
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    },
	    Err(error) => {
		eprintln!("Error occurred create_user: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }

    async fn create_user2_with_public_bdo(bdo: &BDO, saved_user2: &BDOUser) -> Option<BDOUser> {
    println!("creating user2");
        let privateBDO = json!({
            "bar": "bar"
         });
	let result = bdo.create_user(&hash2, &privateBDO).await;
    println!("got to here");

	match result {
	    Ok(user) => {
		println!("Successfully got BDOUser: {}", user.uuid);
		assert_eq!(
		    user.uuid.len(),
		    36
		);
                Some(user)
	    },
	    Err(error) => {
		eprintln!("Error occurred create_user2: {}", error);
		println!("Error details: {:?}", error);
                None
	    }
	}
    }

    async fn update_bdo(bdo: &BDO, saved_user: &BDOUser, hash: &str, update: &Value, is_public: &bool) -> Option<BDOUser> {
        let result = bdo.update_bdo(&saved_user.uuid, &hash, &update, &is_public).await;
        
        match result {
            Ok(user) => {
                println!("Successfully got BDOUser: {}", user.uuid);
                assert_eq!(
                    user.uuid.len(),
                    36
                );
                Some(user)
            },
            Err(error) => {
                eprintln!("Error occurred create_user2: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_bdo(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<BDOUser> {
        let result = bdo.get_bdo(&saved_user.uuid, &hash).await;
 
        match result {
            Ok(user) => {
                println!("Successfully got BDOUser: {}", user.uuid);
                assert_eq!(
                    user.uuid.len(),
                    36
                );
                Some(user)
            },
            Err(error) => { 
                eprintln!("Error occurred create_user2: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_spellbook(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<Vec<Spellbook>> {
        let result = bdo.get_spellbooks(&saved_user.uuid, &hash).await;
    
        match result {
            Ok(user) => {
                println!("Successfully got BDOUser: {}", user.uuid);
                assert_eq!(
                    user.uuid.len(),
                    36
                );
                Some(user)
            },
            Err(error) => {
                eprintln!("Error occurred create_user2: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn put_spellbook(bdo: &BDO, saved_user: &BDOUser, hash: &str, spellbook: &Spellbook) -> Option<Vec<Spellbook>> {
        let result = bdo.update_bdo(&saved_user.uuid, &hash, &update, &is_public).await;

        match result {
            Ok(user) => {
                println!("Successfully got BDOUser: {}", user.uuid);
                assert_eq!(
                    user.uuid.len(),
                    36
                );
                Some(user)
            },
            Err(error) => {
                eprintln!("Error occurred create_user2: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn delete_user(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<SuccessResult> {
        let result = bdo.delete_user(&saved_user.uuid, &hash).await;

        match result {
            Ok(success) => {
                assert_eq!(
                    success.success,
                    true
                );
                Some(success)
            }
            Err(error) => {
                eprintln!("Error occurred delete: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    saved_user = Some(create_user(&bdo).await.expect("user"));
    saved_user2 = Some(create_user(&bdo2).await.expect("user2"));

/*    if let Some(ref user) = saved_user {
        saved_user = Some(create_user(&bdo, user).await.expect("user"));
    } else {    
        panic!("Failed to create user to begin with"); 
    }           
            
    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(create_user2(&bdo2, user).await.expect("user2"));
    } else {
        panic!("Failed to create user2");
    }
*/

    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(get_user_by_uuid(&bdo2, user).await.expect("get user2 1"));
    } else {
        panic!("Failed to get user");
    }

    if let Some(ref user) = saved_user2 {
        saved_user2 = Some(get_user_by_public_key(&bdo2).await.expect("get user2 by pubKey"));
    } else {
        panic!("Failed to get user");
    }

    if let Some(ref user) = saved_user {
	Some(resolve(&bdo, user).await.expect("resolve"));
        saved_user = Some(get_user_by_uuid(&bdo, user).await.expect("get user after resolving spell"));
    } else {
	panic!("Failed to get prompt");
    }

    if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
        Some(grant(&bdo, user, user2).await);
        saved_user = Some(get_user_by_uuid(&bdo, user).await.expect("get user after grant"));
        saved_user2 = Some(get_user_by_uuid(&bdo2, user2).await.expect("get user2"));
    } else { 
        panic!("Failed to sign prompt");
    } 

    if let Some(ref user) = saved_user {
        Some(get_nineum(&bdo, user).await);
        saved_user = Some(get_user_by_uuid(&bdo, user).await.expect("associate"));

        if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
            saved_user = Some(transfer_nineum(&bdo, user, user2).await.expect("transferring"));
            saved_user2 = Some(get_user_by_uuid(&bdo2, &user2).await.expect("getting user 2"));
        } else {
	    panic!("Failed to post message");
	} 
        
        if let Some(ref user) = saved_user {
            delete_user(&bdo, &user).await;
        } else {
	    panic!("Failed to delete user");
	} 

    } else {
        panic!("Failed on associate");
    }

}
