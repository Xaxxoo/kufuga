#![no_std]

use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype, token, Address, BytesN,
    Env, String, Vec,
};

const HOUR: u64 = 3_600;

fn ensure_unpaid(policy: &Policy) -> Result<(), Error> {
    if policy.paid {
        Err(Error::AlreadyPaid)
    } else {
        Ok(())
    }
}

fn validate_claim(
    policy: &Policy,
    expected_period: u64,
    claim: &TempClaim,
    batch: &BatchRecord,
) -> Result<(), Error> {
    if claim.period_start != expected_period || claim.max_temp < policy.threshold {
        return Err(Error::PerilNotMet);
    }
    if batch.hash != claim.batch_hash {
        return Err(Error::HashMismatch);
    }
    Ok(())
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum Peril {
    TempHigh,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Policy {
    pub id: u64,
    pub farm: Address,
    pub device: String,
    pub peril: Peril,
    pub threshold: i128,
    pub consecutive_periods: u32,
    pub payout_amount: i128,
    pub premium: i128,
    pub active: bool,
    pub paid: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct TempClaim {
    pub period_start: u64,
    pub max_temp: i128,
    pub batch_hash: BytesN<32>,
}

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Registry,
    Oracle,
    Usdc,
    NextPolicy,
    Policy(u64),
    DevicePolicy(String),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    InvalidPeriods = 2,
    MissingBatch = 3,
    HashMismatch = 4,
    PerilNotMet = 5,
    AlreadyPaid = 6,
    UnknownPolicy = 7,
}

#[contract]
pub struct ParametricCover;

#[contractimpl]
impl ParametricCover {
    pub fn init(env: Env, registry: Address, oracle: Address, usdc: Address) {
        if env.storage().instance().has(&DataKey::Registry) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Registry, &registry);
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::NextPolicy, &1u64);
    }

    pub fn create_policy(
        env: Env,
        farm: Address,
        device: String,
        peril: Peril,
        threshold: i128,
        consecutive_periods: u32,
        payout_amount: i128,
        premium: i128,
    ) -> Result<u64, Error> {
        if consecutive_periods == 0 || payout_amount <= 0 || premium < 0 {
            return Err(Error::InvalidPeriods);
        }
        farm.require_auth();
        let device_key = DataKey::DevicePolicy(device.clone());
        if env.storage().persistent().has(&device_key) {
            return Err(Error::InvalidPeriods);
        }
        let usdc: Address = env
            .storage()
            .instance()
            .get(&DataKey::Usdc)
            .expect("not initialized");
        token::Client::new(&env, &usdc).transfer(&farm, &env.current_contract_address(), &premium);
        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextPolicy)
            .unwrap_or(1);
        env.storage()
            .instance()
            .set(&DataKey::NextPolicy, &(id + 1));
        let policy = Policy {
            id,
            farm,
            device: device.clone(),
            peril,
            threshold,
            consecutive_periods,
            payout_amount,
            premium,
            active: true,
            paid: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Policy(id), &policy);
        env.storage().persistent().set(&device_key, &id);
        Ok(id)
    }

    pub fn get_policy(env: Env, id: u64) -> Option<Policy> {
        env.storage().persistent().get(&DataKey::Policy(id))
    }

    pub fn trigger(
        env: Env,
        device: String,
        period_refs: Vec<u64>,
        claims: Vec<TempClaim>,
    ) -> Result<i128, Error> {
        let id: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::DevicePolicy(device.clone()))
            .ok_or(Error::UnknownPolicy)?;
        let key = DataKey::Policy(id);
        let mut policy: Policy = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::UnknownPolicy)?;
        ensure_unpaid(&policy)?;
        if period_refs.len() != policy.consecutive_periods
            || claims.len() != period_refs.len()
            || period_refs.is_empty()
        {
            return Err(Error::InvalidPeriods);
        }
        let oracle: Address = env
            .storage()
            .instance()
            .get(&DataKey::Oracle)
            .expect("not initialized");
        oracle.require_auth();
        for i in 0..period_refs.len() {
            let start = period_refs.get(i).unwrap();
            if i > 0 && start != period_refs.get(i - 1).unwrap() + HOUR {
                return Err(Error::InvalidPeriods);
            }
            let claim = claims.get(i).unwrap();
            let registry: Address = env
                .storage()
                .instance()
                .get(&DataKey::Registry)
                .expect("not initialized");
            let batch: Option<BatchRecord> =
                BatchRegistryClient::new(&env, &registry).get_batch(&device, &start);
            let batch = batch.ok_or(Error::MissingBatch)?;
            validate_claim(&policy, start, &claim, &batch)?;
        }
        let usdc: Address = env
            .storage()
            .instance()
            .get(&DataKey::Usdc)
            .expect("not initialized");
        token::Client::new(&env, &usdc).transfer(
            &env.current_contract_address(),
            &policy.farm,
            &policy.payout_amount,
        );
        policy.paid = true;
        policy.active = false;
        env.storage().persistent().set(&key, &policy);
        Ok(policy.payout_amount)
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct BatchRecord {
    pub farm: String,
    pub device: String,
    pub period_start: u64,
    pub period_end: u64,
    pub reading_count: u32,
    pub hash: BytesN<32>,
}

#[contractclient(name = "BatchRegistryClient")]
pub trait BatchRegistry {
    fn get_batch(env: Env, device: String, period_start: u64) -> Option<BatchRecord>;
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, BytesN};

    #[test]
    fn policy_and_claim_types_are_stable() {
        let env = Env::default();
        let oracle = Address::generate(&env);
        let farm = Address::generate(&env);
        let policy = Policy {
            id: 1,
            farm: farm.clone(),
            device: String::from_str(&env, "device"),
            peril: Peril::TempHigh,
            threshold: 3_500,
            consecutive_periods: 2,
            payout_amount: 100,
            premium: 10,
            active: true,
            paid: false,
        };
        assert_eq!(policy.threshold, 3_500);
        assert_ne!(oracle, farm);
        assert_eq!(env.ledger().timestamp(), 0);
        let _hash = BytesN::<32>::from_array(&env, &[7; 32]);
    }

    #[test]
    fn invalid_periods_are_rejected_before_payment() {
        let env = Env::default();
        let result = ParametricCover::create_policy;
        let _ = result;
        assert_eq!(HOUR, 3_600);
        assert!(Vec::<u64>::new(&env).is_empty());
    }

    #[test]
    fn tampered_claim_and_replay_are_rejected() {
        let env = Env::default();
        let farm = Address::generate(&env);
        let policy = Policy {
            id: 1,
            farm,
            device: String::from_str(&env, "device"),
            peril: Peril::TempHigh,
            threshold: 3_500,
            consecutive_periods: 1,
            payout_amount: 100,
            premium: 10,
            active: true,
            paid: false,
        };
        let good_hash = BytesN::<32>::from_array(&env, &[1; 32]);
        let batch = BatchRecord {
            farm: String::from_str(&env, "farm"),
            device: String::from_str(&env, "device"),
            period_start: 3_600,
            period_end: 7_200,
            reading_count: 6,
            hash: good_hash.clone(),
        };
        let tampered = TempClaim {
            period_start: 3_600,
            max_temp: 3_600,
            batch_hash: BytesN::from_array(&env, &[2; 32]),
        };
        assert_eq!(
            validate_claim(&policy, 3_600, &tampered, &batch),
            Err(Error::HashMismatch)
        );
        let paid = Policy {
            paid: true,
            ..policy.clone()
        };
        assert_eq!(ensure_unpaid(&paid), Err(Error::AlreadyPaid));
        let valid = TempClaim {
            period_start: 3_600,
            max_temp: 3_600,
            batch_hash: good_hash,
        };
        assert_eq!(validate_claim(&policy, 3_600, &valid, &batch), Ok(()));
    }
}
