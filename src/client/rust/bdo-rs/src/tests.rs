use crate::{Bases, BDOUser, BDO, Spellbook, SuccessResult};
use sessionless::hex::IntoHex;
use sessionless::hex::FromHex;
use sessionless::{Sessionless, PrivateKey};
use std::collections::HashMap;
use serde_json::json;
use serde_json::Value;

#[actix_rt::test]
async fn test_bdo() {

    let mut saved_user: BDOUser;
    let mut saved_user2: BDOUser; 
    let bdo = BDO::new(Some("http://localhost:3003/".to_string()), None);
    let bdo2 = BDO::new(Some("http://localhost:3003/".to_string()), None);
    let bdo3 = BDO::new(Some("http://localhost:3003/".to_string()), Some(Sessionless::from_private_key(PrivateKey::from_hex("a29435a4fb1a27a284a60b3409efeebbe6a64db606ff38aeead579ccf2262dc4").expect("private key"))));
    let hash = "hereisanexampleofahash";
    let hash2 = "hereisasecondhash";

    async fn create_user(bdo: &BDO, hash: &str) -> Option<BDOUser> {
    println!("creating user");
        let publicBDO = json!({
            "foo": "foo",
            "pub": bdo.sessionless.public_key().to_hex()
         });
	let result = bdo.create_user(&hash, &publicBDO, false).await;
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

    async fn create_user2_with_private_bdo(bdo: &BDO, hash: &str) -> Option<BDOUser> {
    println!("creating user2");
        let privateBDO = json!({
            "bar": "bar"
         });
	let result = bdo.create_user(&hash, &privateBDO, false).await;
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

    async fn update_bdo(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<BDOUser> {
        let update = json!({
            "foo": "bop",
            "pub": bdo.sessionless.public_key().to_hex()
         });
        let result = bdo.update_bdo(&saved_user.uuid, &hash, &update, &true).await;
        
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
                eprintln!("Error occurred update_bdo: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_bdo(bdo: &BDO, bdo2: &BDO, saved_user: &BDOUser, hash: &str) -> Option<BDOUser> {
        let result = bdo2.get_public_bdo(&saved_user.uuid, &hash, &bdo.sessionless.public_key().to_hex()).await;
 
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
                eprintln!("Error occurred get_bdo: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_bases(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<Value> {
        let result = bdo.get_bases(&saved_user.uuid, &hash).await;
    
        match result {
            Ok(bases) => {
                println!("Successfully got bases: {}", bases);
                assert_eq!(
                    true,
                    true
                );
                Some(bases)
            },
            Err(error) => {
                eprintln!("Error occurred get_bases: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn put_bases(bdo: &BDO, saved_user: &BDOUser, hash: &str, bases: &Bases) -> Option<Value> {
        let result = bdo.save_bases(&saved_user.uuid, &hash, &bases).await;

        match result {
            Ok(bases) => {
                println!("Successfully got bases: {}", bases);
                assert_eq!(
                    true,
                    true
                );
                Some(bases)
            },
            Err(error) => {
                eprintln!("Error occurred put_spellbook: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

    async fn get_spellbooks(bdo: &BDO, saved_user: &BDOUser, hash: &str) -> Option<Vec<Spellbook>> {
        let result = bdo.get_spellbooks(&saved_user.uuid, &hash).await;
    
        match result {
            Ok(spellbooks) => {
                println!("Successfully got spellbook: {}", spellbooks[0].spellbookName);
                assert_eq!(
                    spellbooks[0].spellbookName,
                    "allyabase"
                );
                Some(spellbooks)
            },
            Err(error) => {
                eprintln!("Error occurred get_spellbook: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }

/*    async fn put_spellbook(bdo: &BDO, saved_user: &BDOUser, hash: &str, spellbook: &Spellbook) -> Option<Vec<Spellbook>> {
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
                eprintln!("Error occurred put_spellbook: {}", error);
                println!("Error details: {:?}", error);
                None
            }
        }
    }
*/

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
        
    saved_user = create_user(&bdo, &hash).await.expect("user");
    saved_user2 = create_user2_with_private_bdo(&bdo2, &hash2).await.expect("user2");

    Some(get_bdo(&bdo, &bdo2, &saved_user2, &hash2).await.expect("get_bdo"));
    Some(get_spellbooks(&bdo, &saved_user, &hash).await);

/*    if let Some(ref user) = saved_user {
	Some(update_bdo(&bdo, user, &hash).await.expect("update_bdo"));
    } else {
	panic!("Failed to get prompt");
    }

    if let (Some(ref user), Some(ref user2)) = (saved_user, saved_user2) {
        Some(get_bdo(&bdo, user, &hash2).await.expect("get_bdo"));
    } else { 
        panic!("Failed to sign prompt");
    } 

    if let Some(ref user) = saved_user {
        Some(get_spellbooks(&bdo, user, &hash).await);
        
        if let Some(ref user) = saved_user {
            delete_user(&bdo, &user, &hash).await;
        } else {
	    panic!("Failed to delete user");
	} 

    } else {
        panic!("Failed on associate");
    }*/

}
