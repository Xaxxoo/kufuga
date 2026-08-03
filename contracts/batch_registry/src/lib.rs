#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, String,
};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Batch {
    pub farm: String,
    pub device: String,
    pub period_start: u64,
    pub period_end: u64,
    pub reading_count: u32,
    pub hash: BytesN<32>,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Anchor,
    Batch(String, u64),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyRegistered = 1,
}

#[contract]
pub struct BatchRegistry;

#[contractimpl]
impl BatchRegistry {
    pub fn init(env: Env, anchor: Address) {
        if env.storage().instance().has(&DataKey::Anchor) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Anchor, &anchor);
    }

    pub fn register_batch(
        env: Env,
        farm: String,
        device: String,
        period_start: u64,
        period_end: u64,
        reading_count: u32,
        hash: BytesN<32>,
    ) -> Result<(), Error> {
        let anchor: Address = env
            .storage()
            .instance()
            .get(&DataKey::Anchor)
            .expect("not initialized");
        anchor.require_auth();
        let key = DataKey::Batch(device.clone(), period_start);
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyRegistered);
        }
        env.storage().persistent().set(
            &key,
            &Batch {
                farm,
                device,
                period_start,
                period_end,
                reading_count,
                hash,
            },
        );
        Ok(())
    }

    pub fn get_batch(env: Env, device: String, period_start: u64) -> Option<Batch> {
        env.storage()
            .persistent()
            .get(&DataKey::Batch(device, period_start))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    fn hash(env: &Env, value: u8) -> BytesN<32> {
        BytesN::from_array(env, &[value; 32])
    }

    #[test]
    fn authorized_registration_and_lookup() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = env.register_contract(None, BatchRegistry);
        let client = BatchRegistryClient::new(&env, &contract);
        let anchor = Address::generate(&env);
        client.init(&anchor);
        let device = String::from_str(&env, "device-1");
        client.register_batch(
            &String::from_str(&env, "farm-1"),
            &device,
            &100,
            &200,
            &6,
            &hash(&env, 7),
        );
        assert_eq!(client.get_batch(&device, &100).unwrap().reading_count, 6);
    }

    #[test]
    #[should_panic]
    fn unauthorized_registration_is_rejected() {
        let env = Env::default();
        let contract = env.register_contract(None, BatchRegistry);
        let client = BatchRegistryClient::new(&env, &contract);
        client.init(&Address::generate(&env));
        client.register_batch(
            &String::from_str(&env, "farm"),
            &String::from_str(&env, "device"),
            &1,
            &2,
            &1,
            &hash(&env, 1),
        );
    }

    #[test]
    fn duplicate_registration_is_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let contract = env.register_contract(None, BatchRegistry);
        let client = BatchRegistryClient::new(&env, &contract);
        let anchor = Address::generate(&env);
        client.init(&anchor);
        let farm = String::from_str(&env, "farm");
        let device = String::from_str(&env, "device");
        client.register_batch(&farm, &device, &1, &2, &1, &hash(&env, 1));
        assert_eq!(
            client
                .try_register_batch(&farm, &device, &1, &2, &1, &hash(&env, 1))
                .unwrap_err()
                .unwrap(),
            Error::AlreadyRegistered
        );
    }
}
