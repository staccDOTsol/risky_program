#![allow(dead_code)]

pub mod flash_loan_proxy;
pub mod flash_loan_receiver;
pub mod genesis;

use assert_matches::*;
use solana_program::{program_option::COption, program_pack::Pack, pubkey::Pubkey};
use solana_program_test::*;
use solana_sdk::{
    account::Account,
    signature::{read_keypair_file, Keypair, Signer},
    system_instruction::create_account,
    transaction::{Transaction, TransactionError},
};
use solend_program::{
    instruction::{
         deposit_reserve_liquidity,
         init_lending_market, 
        init_reserve,   refresh_reserve,
        
    },
    math::{Decimal, Rate, TryAdd, TryMul},
    processor::switchboard_v2_mainnet,
    pyth,
    state::{
        InitLendingMarketParams,  InitReserveParams, LendingMarket,
        NewReserveCollateralParams, NewReserveLiquidityParams, 
         Reserve, ReserveCollateral, ReserveConfig, ReserveFees,
        ReserveLiquidity, INITIAL_COLLATERAL_RATIO, PROGRAM_VERSION,
    },
};
use spl_token::{
    instruction::approve,
    state::{Account as Token, AccountState, Mint},
};
use std::{convert::TryInto, str::FromStr};
use switchboard_v2::AggregatorAccountData;

pub const QUOTE_CURRENCY: [u8; 32] =
    *b"USD\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0";

pub const LAMPORTS_TO_SOL: u64 = 1_000_000_000;
pub const FRACTIONAL_TO_USDC: u64 = 1_000_000;

pub fn test_reserve_config() -> ReserveConfig {
    ReserveConfig {
        optimal_utilization_rate: 80,
        loan_to_value_ratio: 50,
        liquidation_bonus: 5,
        liquidation_threshold: 55,
        min_borrow_rate: 0,
        optimal_borrow_rate: 4,
        max_borrow_rate: 30,
        fees: ReserveFees {
            borrow_fee_wad: 100_000_000_000,
            flash_loan_fee_wad: 3_000_000_000_000_000,
            host_fee_percentage: 20,
        },
        deposit_limit: 100_000_000_000,
        borrow_limit: u64::MAX,
        fee_receiver: Keypair::new().pubkey(),
        protocol_liquidation_fee: 30,
        protocol_take_rate: 10,
    }
}

pub const NULL_PUBKEY: &str = "nu11111111111111111111111111111111111111111";

pub const SOL_PYTH_PRODUCT: &str = "3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E";
pub const SOL_PYTH_PRICE: &str = "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix";
pub const SOL_SWITCHBOARD_FEED: &str = "AdtRGGhmqvom3Jemp5YNrxd9q9unX36BZk1pujkkXijL";
pub const SOL_SWITCHBOARDV2_FEED: &str = "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR";

pub const SRM_PYTH_PRODUCT: &str = "6MEwdxe4g1NeAF9u6KDG14anJpFsVEa2cvr5H6iriFZ8";
pub const SRM_PYTH_PRICE: &str = "992moaMQKs32GKZ9dxi8keyM2bUmbrwBZpK4p2K6X5Vs";
pub const SRM_SWITCHBOARD_FEED: &str = "BAoygKcKN7wk8yKzLD6sxzUQUqLvhBV1rjMA4UJqfZuH";
pub const SRM_SWITCHBOARDV2_FEED: &str = "CUgoqwiQ4wCt6Tthkrgx5saAEpLBjPCdHshVa4Pbfcx2";

pub const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

trait AddPacked {
    fn add_packable_account<T: Pack>(
        &mut self,
        pubkey: Pubkey,
        amount: u64,
        data: &T,
        owner: &Pubkey,
    );
}

impl AddPacked for ProgramTest {
    fn add_packable_account<T: Pack>(
        &mut self,
        pubkey: Pubkey,
        amount: u64,
        data: &T,
        owner: &Pubkey,
    ) {
        let mut account = Account::new(amount, T::get_packed_len(), owner);
        data.pack_into_slice(&mut account.data);
        self.add_account(pubkey, account);
    }
}

pub fn add_lending_market(test: &mut ProgramTest) -> TestLendingMarket {
    let lending_market_pubkey = Pubkey::new_unique();
    let (lending_market_authority, bump_seed) =
        Pubkey::find_program_address(&[lending_market_pubkey.as_ref()], &solend_program::id());

    let lending_market_owner =
        read_keypair_file("tests/fixtures/lending_market_owner.json").unwrap();
    let oracle_program_id = read_keypair_file("tests/fixtures/oracle_program_id.json")
        .unwrap()
        .pubkey();

    test.add_packable_account(
        lending_market_pubkey,
        u32::MAX as u64,
        &LendingMarket::new(InitLendingMarketParams {
            bump_seed,
            owner: lending_market_owner.pubkey(),
            quote_currency: QUOTE_CURRENCY,
            token_program_id: spl_token::id(),
            oracle_program_id,
            switchboard_oracle_program_id: oracle_program_id,
        }),
        &solend_program::id(),
    );

    TestLendingMarket {
        pubkey: lending_market_pubkey,
        owner: lending_market_owner,
        authority: lending_market_authority,
        quote_currency: QUOTE_CURRENCY,
        oracle_program_id,
        switchboard_oracle_program_id: oracle_program_id,
    }
}


#[derive(Default)]
pub struct AddReserveArgs {
    pub name: String,
    pub config: ReserveConfig,
    pub liquidity_amount: u64,
    pub liquidity_mint_pubkey: Pubkey,
    pub liquidity_mint_decimals: u8,
    pub user_liquidity_amount: u64,
    pub borrow_amount: u64,
    pub initial_borrow_rate: u8,
    pub collateral_amount: u64,
    pub mark_fresh: bool,
    pub slots_elapsed: u64,
}

pub fn add_reserve(
    test: &mut ProgramTest,
    lending_market: &TestLendingMarket,
    oracle: &TestOracle,
    user_accounts_owner: &Keypair,
    dev_pubkey: &Pubkey,
    args: AddReserveArgs,
) -> TestReserve {
    let AddReserveArgs {
        name,
        config,
        liquidity_amount,
        liquidity_mint_pubkey,
        liquidity_mint_decimals,
        user_liquidity_amount,
        borrow_amount,
        initial_borrow_rate,
        collateral_amount,
        mark_fresh,
        slots_elapsed,
    } = args;

    let is_native = if liquidity_mint_pubkey == spl_token::native_mint::id() {
        COption::Some(2039280u64)
    } else {
        COption::None
    };

    let current_slot = slots_elapsed + 1;

    let collateral_mint_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        collateral_mint_pubkey,
        u32::MAX as u64,
        &Mint {
            is_initialized: true,
            decimals: liquidity_mint_decimals,
            mint_authority: COption::Some(lending_market.authority),
            supply: collateral_amount,
            ..Mint::default()
        },
        &spl_token::id(),
    );

    let collateral_supply_pubkey = Pubkey::new_unique();
    
    test.add_packable_account(
        collateral_supply_pubkey,
        u32::MAX as u64,
        &Token {
            mint: collateral_mint_pubkey,
            owner: lending_market.authority,
            amount: collateral_amount,
            state: AccountState::Initialized,
            ..Token::default()
        },
        &spl_token::id(),
    );

    let amount = if let COption::Some(rent_reserve) = is_native {
        liquidity_amount + rent_reserve
    } else {
        u32::MAX as u64
    };

    let liquidity_supply_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        liquidity_supply_pubkey,
        amount,
        &Token {
            mint: liquidity_mint_pubkey,
            owner: lending_market.authority,
            amount: liquidity_amount,
            state: AccountState::Initialized,
            is_native,
            ..Token::default()
        },
        &spl_token::id(),
    );

    let amount = if let COption::Some(rent_reserve) = is_native {
        rent_reserve
    } else {
        u32::MAX as u64
    };

    test.add_packable_account(
        config.fee_receiver,
        amount,
        &Token {
            mint: liquidity_mint_pubkey,
            owner: lending_market.owner.pubkey(),
            amount: 0,
            is_native,
            state: AccountState::Initialized,
            ..Token::default()
        },
        &spl_token::id(),
    );

    let liquidity_host_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        liquidity_host_pubkey,
        u32::MAX as u64,
        &Token {
            mint: liquidity_mint_pubkey,
            owner: *dev_pubkey,
            amount: 0,
            state: AccountState::Initialized,
            ..Token::default()
        },
        &spl_token::id(),
    );

    let liquidity_host_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        liquidity_host_pubkey,
        u32::MAX as u64,
        &Token {
            mint: liquidity_mint_pubkey,
            owner: user_accounts_owner.pubkey(),
            amount: 0,
            state: AccountState::Initialized,
            ..Token::default()
        },
        &spl_token::id(),
    );

    let reserve_keypair = Keypair::new();
    let reserve_pubkey = reserve_keypair.pubkey();
    let mut reserve = Reserve::new(InitReserveParams {
        current_slot,
        lending_market: lending_market.pubkey,
        liquidity: ReserveLiquidity::new(NewReserveLiquidityParams {
            mint_pubkey: liquidity_mint_pubkey,
            mint_decimals: liquidity_mint_decimals,
            supply_pubkey: liquidity_supply_pubkey,
            pyth_oracle_pubkey: oracle.pyth_price_pubkey,
            switchboard_oracle_pubkey: oracle.switchboard_feed_pubkey,
            market_price: oracle.price,
        }),
        collateral: ReserveCollateral::new(NewReserveCollateralParams {
            mint_pubkey: collateral_mint_pubkey,
            supply_pubkey: collateral_supply_pubkey,
        }),
        config,
    });
    reserve.deposit_liquidity(liquidity_amount).unwrap();
    reserve.liquidity.borrow(borrow_amount.into()).unwrap();
    let borrow_rate_multiplier = Rate::one()
        .try_add(Rate::from_percent(initial_borrow_rate))
        .unwrap();
    reserve.liquidity.cumulative_borrow_rate_wads =
        Decimal::one().try_mul(borrow_rate_multiplier).unwrap();

    if mark_fresh {
        reserve.last_update.update_slot(current_slot);
    }

    test.add_packable_account(
        reserve_pubkey,
        u32::MAX as u64,
        &reserve,
        &solend_program::id(),
    );

    let amount = if let COption::Some(rent_reserve) = is_native {
        user_liquidity_amount + rent_reserve
    } else {
        u32::MAX as u64
    };

    let user_liquidity_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        user_liquidity_pubkey,
        amount,
        &Token {
            mint: liquidity_mint_pubkey,
            owner: user_accounts_owner.pubkey(),
            amount: user_liquidity_amount,
            state: AccountState::Initialized,
            is_native,
            ..Token::default()
        },
        &spl_token::id(),
    );
    let user_collateral_pubkey = Pubkey::new_unique();
    test.add_packable_account(
        user_collateral_pubkey,
        u32::MAX as u64,
        &Token {
            mint: collateral_mint_pubkey,
            owner: user_accounts_owner.pubkey(),
            amount: liquidity_amount * INITIAL_COLLATERAL_RATIO,
            state: AccountState::Initialized,
            ..Token::default()
        },
        &spl_token::id(),
    );

    TestReserve {
        name,
        pubkey: reserve_pubkey,
        lending_market_pubkey: lending_market.pubkey,
        config,
        liquidity_mint_pubkey,
        liquidity_mint_decimals,
        liquidity_supply_pubkey,
        liquidity_host_pubkey,
        liquidity_pyth_oracle_pubkey: oracle.pyth_price_pubkey,
        liquidity_switchboard_oracle_pubkey: oracle.switchboard_feed_pubkey,
        collateral_mint_pubkey,
        collateral_supply_pubkey,
        user_liquidity_pubkey,
        user_collateral_pubkey,
        market_price: oracle.price,
    }
}

pub fn add_account_for_program(
    test: &mut ProgramTest,
    program_derived_account: &Pubkey,
    amount: u64,
    mint_pubkey: &Pubkey,
) -> Pubkey {
    let program_owned_token_account = Keypair::new();
    test.add_packable_account(
        program_owned_token_account.pubkey(),
        u32::MAX as u64,
        &Token {
            mint: *mint_pubkey,
            owner: *program_derived_account,
            amount,
            state: AccountState::Initialized,
            is_native: COption::None,
            ..Token::default()
        },
        &spl_token::id(),
    );
    program_owned_token_account.pubkey()
}

pub struct TestLendingMarket {
    pub pubkey: Pubkey,
    pub owner: Keypair,
    pub authority: Pubkey,
    pub quote_currency: [u8; 32],
    pub oracle_program_id: Pubkey,
    pub switchboard_oracle_program_id: Pubkey,
}


impl TestLendingMarket {
    pub async fn init(banks_client: &mut BanksClient, payer: &Keypair) -> Self {
        let lending_market_owner =
            read_keypair_file("tests/fixtures/lending_market_owner.json").unwrap();
        let oracle_program_id = read_keypair_file("tests/fixtures/oracle_program_id.json")
            .unwrap()
            .pubkey();

        let lending_market_keypair = Keypair::new();
        let lending_market_pubkey = lending_market_keypair.pubkey();
        let (lending_market_authority, _bump_seed) = Pubkey::find_program_address(
            &[&lending_market_pubkey.to_bytes()[..32]],
            &solend_program::id(),
        );

        let rent = banks_client.get_rent().await.unwrap();
        let mut transaction = Transaction::new_with_payer(
            &[
                create_account(
                    &payer.pubkey(),
                    &lending_market_pubkey,
                    rent.minimum_balance(LendingMarket::LEN),
                    LendingMarket::LEN as u64,
                    &solend_program::id(),
                ),
                init_lending_market(
                    solend_program::id(),
                    lending_market_owner.pubkey(),
                    QUOTE_CURRENCY,
                    lending_market_pubkey,
                    oracle_program_id,
                    oracle_program_id,
                ),
            ],
            Some(&payer.pubkey()),
        );

        let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
        transaction.sign(&[payer, &lending_market_keypair], recent_blockhash);
        assert_matches!(banks_client.process_transaction(transaction).await, Ok(()));

        TestLendingMarket {
            owner: lending_market_owner,
            pubkey: lending_market_pubkey,
            authority: lending_market_authority,
            quote_currency: QUOTE_CURRENCY,
            oracle_program_id,
            switchboard_oracle_program_id: oracle_program_id,
        }
    }

    pub async fn refresh_reserve(
        &self,
        banks_client: &mut BanksClient,
        payer: &Keypair,
        reserve: &TestReserve,
    ) {
        let mut transaction = Transaction::new_with_payer(
            &[refresh_reserve(
                solend_program::id(),
                reserve.pubkey,
                reserve.liquidity_pyth_oracle_pubkey,
                reserve.liquidity_switchboard_oracle_pubkey,
            )],
            Some(&payer.pubkey()),
        );

        let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
        transaction.sign(&[payer], recent_blockhash);

        assert_matches!(banks_client.process_transaction(transaction).await, Ok(()));
    }

    pub async fn deposit(
        &self,
        banks_client: &mut BanksClient,
        user_accounts_owner: &Keypair,
        payer: &Keypair,
        reserve: &TestReserve,
        liquidity_amount: u64,
    ) {
        let user_transfer_authority = Keypair::new();
        let mut transaction = Transaction::new_with_payer(
            &[
                approve(
                    &spl_token::id(),
                    &reserve.user_liquidity_pubkey,
                    &user_transfer_authority.pubkey(),
                    &user_accounts_owner.pubkey(),
                    &[],
                    liquidity_amount,
                )
                .unwrap(),
                deposit_reserve_liquidity(
                    solend_program::id(),
                    liquidity_amount,
                    reserve.user_liquidity_pubkey,
                    reserve.user_collateral_pubkey,
                    reserve.pubkey,
                    reserve.liquidity_supply_pubkey,
                    reserve.collateral_mint_pubkey,
                    self.pubkey,
                    user_transfer_authority.pubkey(),
                ),
            ],
            Some(&payer.pubkey()),
        );

        let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
        transaction.sign(
            &[payer, user_accounts_owner, &user_transfer_authority],
            recent_blockhash,
        );

        assert_matches!(banks_client.process_transaction(transaction).await, Ok(()));
    }

    pub async fn get_state(&self, banks_client: &mut BanksClient) -> LendingMarket {
        let lending_market_account: Account = banks_client
            .get_account(self.pubkey)
            .await
            .unwrap()
            .unwrap();
        LendingMarket::unpack(&lending_market_account.data[..]).unwrap()
    }

    pub async fn validate_state(&self, banks_client: &mut BanksClient) {
        let lending_market = self.get_state(banks_client).await;
        assert_eq!(lending_market.version, PROGRAM_VERSION);
        assert_eq!(lending_market.owner, self.owner.pubkey());
        assert_eq!(lending_market.quote_currency, self.quote_currency);
    }
}

#[derive(Debug)]
pub struct TestReserve {
    pub name: String,
    pub pubkey: Pubkey,
    pub lending_market_pubkey: Pubkey,
    pub config: ReserveConfig,
    pub liquidity_mint_pubkey: Pubkey,
    pub liquidity_mint_decimals: u8,
    pub liquidity_supply_pubkey: Pubkey,
    pub liquidity_host_pubkey: Pubkey,
    pub liquidity_pyth_oracle_pubkey: Pubkey,
    pub liquidity_switchboard_oracle_pubkey: Pubkey,
    pub collateral_mint_pubkey: Pubkey,
    pub collateral_supply_pubkey: Pubkey,
    pub user_liquidity_pubkey: Pubkey,
    pub user_collateral_pubkey: Pubkey,
    pub market_price: Decimal,
}

impl TestReserve {
    #[allow(clippy::too_many_arguments)]
    pub async fn init(
        name: String,
        banks_client: &mut BanksClient,
        lending_market: &TestLendingMarket,
        oracle: &TestOracle,
        liquidity_amount: u64,
        config: ReserveConfig,
        liquidity_mint_pubkey: Pubkey,
        user_liquidity_pubkey: Pubkey,
        liquidity_fee_receiver_keypair: &Keypair,
        payer: &Keypair,
        user_accounts_owner: &Keypair,
    ) -> Result<Self, TransactionError> {
        let reserve_keypair = Keypair::new();
        let reserve_pubkey = reserve_keypair.pubkey();
        let collateral_mint_keypair = Keypair::new();
        let collateral_supply_keypair = Keypair::new();
        let liquidity_supply_keypair = Keypair::new();
        let liquidity_host_keypair = Keypair::new();
        let user_collateral_token_keypair = Keypair::new();
        let user_transfer_authority_keypair = Keypair::new();

        let liquidity_mint_account = banks_client
            .get_account(liquidity_mint_pubkey)
            .await
            .unwrap()
            .unwrap();
        let liquidity_mint = Mint::unpack(&liquidity_mint_account.data[..]).unwrap();

        let rent = banks_client.get_rent().await.unwrap();
        let mut transaction = Transaction::new_with_payer(
            &[
                approve(
                    &spl_token::id(),
                    &user_liquidity_pubkey,
                    &user_transfer_authority_keypair.pubkey(),
                    &user_accounts_owner.pubkey(),
                    &[],
                    liquidity_amount,
                )
                .unwrap(),
                create_account(
                    &payer.pubkey(),
                    &collateral_mint_keypair.pubkey(),
                    rent.minimum_balance(Mint::LEN),
                    Mint::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &collateral_supply_keypair.pubkey(),
                    rent.minimum_balance(Token::LEN),
                    Token::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &liquidity_supply_keypair.pubkey(),
                    rent.minimum_balance(Token::LEN),
                    Token::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &liquidity_fee_receiver_keypair.pubkey(),
                    rent.minimum_balance(Token::LEN),
                    Token::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &liquidity_host_keypair.pubkey(),
                    rent.minimum_balance(Token::LEN),
                    Token::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &user_collateral_token_keypair.pubkey(),
                    rent.minimum_balance(Token::LEN),
                    Token::LEN as u64,
                    &spl_token::id(),
                ),
                create_account(
                    &payer.pubkey(),
                    &reserve_pubkey,
                    rent.minimum_balance(Reserve::LEN),
                    Reserve::LEN as u64,
                    &solend_program::id(),
                ),
                init_reserve(
                    solend_program::id(),
                    liquidity_amount,
                    config,
                    user_liquidity_pubkey,
                    user_collateral_token_keypair.pubkey(),
                    reserve_pubkey,
                    liquidity_mint_pubkey,
                    liquidity_supply_keypair.pubkey(),
                    collateral_mint_keypair.pubkey(),
                    collateral_supply_keypair.pubkey(),
                    oracle.pyth_product_pubkey,
                    oracle.pyth_price_pubkey,
                    oracle.switchboard_feed_pubkey,
                    lending_market.pubkey,
                    lending_market.owner.pubkey(),
                    user_transfer_authority_keypair.pubkey(),
                ),
            ],
            Some(&payer.pubkey()),
        );
        let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
        transaction.sign(
            &vec![
                payer,
                user_accounts_owner,
                &reserve_keypair,
                &lending_market.owner,
                &collateral_mint_keypair,
                &collateral_supply_keypair,
                &liquidity_supply_keypair,
                liquidity_fee_receiver_keypair,
                &liquidity_host_keypair,
                &user_collateral_token_keypair,
                &user_transfer_authority_keypair,
            ],
            recent_blockhash,
        );
        banks_client
            .process_transaction(transaction)
            .await
            .map(|_| Self {
                name,
                pubkey: reserve_pubkey,
                lending_market_pubkey: lending_market.pubkey,
                config,
                liquidity_mint_pubkey,
                liquidity_mint_decimals: liquidity_mint.decimals,
                liquidity_supply_pubkey: liquidity_supply_keypair.pubkey(),
                liquidity_host_pubkey: liquidity_host_keypair.pubkey(),
                liquidity_pyth_oracle_pubkey: oracle.pyth_price_pubkey,
                liquidity_switchboard_oracle_pubkey: oracle.switchboard_feed_pubkey,
                collateral_mint_pubkey: collateral_mint_keypair.pubkey(),
                collateral_supply_pubkey: collateral_supply_keypair.pubkey(),
                user_liquidity_pubkey,
                user_collateral_pubkey: user_collateral_token_keypair.pubkey(),
                market_price: oracle.price,
            })
            .map_err(|e| e.unwrap())
    }

    pub async fn get_state(&self, banks_client: &mut BanksClient) -> Reserve {
        let reserve_account: Account = banks_client
            .get_account(self.pubkey)
            .await
            .unwrap()
            .unwrap();
        Reserve::unpack(&reserve_account.data[..]).unwrap()
    }

    pub async fn validate_state(&self, banks_client: &mut BanksClient) {
        let reserve = self.get_state(banks_client).await;
        assert!(reserve.last_update.slot > 0);
        assert_eq!(PROGRAM_VERSION, reserve.version);
        assert_eq!(self.lending_market_pubkey, reserve.lending_market);
        assert_eq!(self.liquidity_mint_pubkey, reserve.liquidity.mint_pubkey);
        assert_eq!(
            self.liquidity_supply_pubkey,
            reserve.liquidity.supply_pubkey
        );
        assert_eq!(self.collateral_mint_pubkey, reserve.collateral.mint_pubkey);
        assert_eq!(
            self.collateral_supply_pubkey,
            reserve.collateral.supply_pubkey
        );
        assert_eq!(self.config, reserve.config);

        assert_eq!(
            self.liquidity_pyth_oracle_pubkey,
            reserve.liquidity.pyth_oracle_pubkey
        );
        assert_eq!(
            self.liquidity_switchboard_oracle_pubkey,
            reserve.liquidity.switchboard_oracle_pubkey
        );
        assert_eq!(
            reserve.liquidity.cumulative_borrow_rate_wads,
            Decimal::one()
        );
        assert_eq!(reserve.liquidity.borrowed_amount_wads, Decimal::zero());
        assert!(reserve.liquidity.available_amount > 0);
        assert!(reserve.collateral.mint_total_supply > 0);
    }
}


pub struct TestMint {
    pub pubkey: Pubkey,
    pub authority: Keypair,
    pub decimals: u8,
}

pub fn add_usdc_mint(test: &mut ProgramTest) -> TestMint {
    let authority = Keypair::new();
    let pubkey = Pubkey::from_str(USDC_MINT).unwrap();
    let decimals = 6;
    test.add_packable_account(
        pubkey,
        u32::MAX as u64,
        &Mint {
            is_initialized: true,
            mint_authority: COption::Some(authority.pubkey()),
            decimals,
            ..Mint::default()
        },
        &spl_token::id(),
    );
    TestMint {
        pubkey,
        authority,
        decimals,
    }
}

pub struct TestOracle {
    pub pyth_product_pubkey: Pubkey,
    pub pyth_price_pubkey: Pubkey,
    pub switchboard_feed_pubkey: Pubkey,
    pub price: Decimal,
}

pub fn add_sol_oracle(test: &mut ProgramTest) -> TestOracle {
    add_oracle(
        test,
        Pubkey::from_str(SOL_PYTH_PRODUCT).unwrap(),
        Pubkey::from_str(SOL_PYTH_PRICE).unwrap(),
        Pubkey::from_str(SOL_SWITCHBOARD_FEED).unwrap(),
        // Set SOL price to $20
        Decimal::from(20u64),
        0,
    )
}

pub fn add_sol_oracle_switchboardv2(test: &mut ProgramTest) -> TestOracle {
    add_oracle(
        test,
        Pubkey::from_str(NULL_PUBKEY).unwrap(),
        Pubkey::from_str(NULL_PUBKEY).unwrap(),
        Pubkey::from_str(SOL_SWITCHBOARDV2_FEED).unwrap(),
        // Set SOL price to $20
        Decimal::from(20u64),
        0,
    )
}

pub fn add_usdc_oracle(test: &mut ProgramTest) -> TestOracle {
    add_oracle(
        test,
        // Mock with SRM since Pyth doesn't have USDC yet
        Pubkey::from_str(SRM_PYTH_PRODUCT).unwrap(),
        Pubkey::from_str(SRM_PYTH_PRICE).unwrap(),
        Pubkey::from_str(SRM_SWITCHBOARD_FEED).unwrap(),
        // Set USDC price to $1
        Decimal::from(1u64),
        0,
    )
}

pub fn add_usdc_oracle_switchboardv2(test: &mut ProgramTest) -> TestOracle {
    add_oracle(
        test,
        // Mock with SRM since Pyth doesn't have USDC yet
        Pubkey::from_str(NULL_PUBKEY).unwrap(),
        Pubkey::from_str(NULL_PUBKEY).unwrap(),
        Pubkey::from_str(SRM_SWITCHBOARDV2_FEED).unwrap(),
        // Set USDC price to $1
        Decimal::from(1u64),
        0,
    )
}

pub fn add_oracle(
    test: &mut ProgramTest,
    pyth_product_pubkey: Pubkey,
    pyth_price_pubkey: Pubkey,
    switchboard_feed_pubkey: Pubkey,
    price: Decimal,
    valid_slot: u64,
) -> TestOracle {
    let oracle_program_id = read_keypair_file("tests/fixtures/oracle_program_id.json").unwrap();

    if pyth_price_pubkey.to_string() != NULL_PUBKEY {
        // Add Pyth product account
        test.add_account_with_file_data(
            pyth_product_pubkey,
            u32::MAX as u64,
            oracle_program_id.pubkey(),
            &format!("{}.bin", pyth_product_pubkey),
        );
    }
    if pyth_price_pubkey.to_string() != NULL_PUBKEY {
        // Add Pyth price account after setting the price
        let filename = &format!("{}.bin", pyth_price_pubkey);
        let mut pyth_price_data = read_file(find_file(filename).unwrap_or_else(|| {
            panic!("Unable to locate {}", filename);
        }));

        let mut pyth_price = pyth::load_mut::<pyth::Price>(pyth_price_data.as_mut_slice()).unwrap();

        let decimals = 10u64
            .checked_pow(pyth_price.expo.checked_abs().unwrap().try_into().unwrap())
            .unwrap();

        pyth_price.valid_slot = valid_slot;
        pyth_price.agg.price = price
            .try_round_u64()
            .unwrap()
            .checked_mul(decimals)
            .unwrap()
            .try_into()
            .unwrap();

        test.add_account(
            pyth_price_pubkey,
            Account {
                lamports: u32::MAX as u64,
                data: pyth_price_data,
                owner: oracle_program_id.pubkey(),
                executable: false,
                rent_epoch: 0,
            },
        );
    }

    // Add Switchboard price feed account after setting the price
    let filename2 = &format!("{}.bin", switchboard_feed_pubkey);
    // mut and set data here later
    let mut switchboard_feed_data = read_file(find_file(filename2).unwrap_or_else(|| {
        panic!("Unable tod locate {}", filename2);
    }));

    let is_v2 = switchboard_feed_pubkey.to_string() == SOL_SWITCHBOARDV2_FEED
        || switchboard_feed_pubkey.to_string() == SRM_SWITCHBOARDV2_FEED;
    if is_v2 {
        // let mut_switchboard_feed_data = &mut switchboard_feed_data[8..];
        let agg_state =
            bytemuck::from_bytes_mut::<AggregatorAccountData>(&mut switchboard_feed_data[8..]);
        agg_state.latest_confirmed_round.round_open_slot = 0;
        test.add_account(
            switchboard_feed_pubkey,
            Account {
                lamports: u32::MAX as u64,
                data: switchboard_feed_data,
                owner: switchboard_v2_mainnet::id(),
                executable: false,
                rent_epoch: 0,
            },
        );
    } else {
        test.add_account(
            switchboard_feed_pubkey,
            Account {
                lamports: u32::MAX as u64,
                data: switchboard_feed_data,
                owner: oracle_program_id.pubkey(),
                executable: false,
                rent_epoch: 0,
            },
        );
    }

    TestOracle {
        pyth_product_pubkey,
        pyth_price_pubkey,
        switchboard_feed_pubkey,
        price,
    }
}

pub async fn create_and_mint_to_token_account(
    banks_client: &mut BanksClient,
    mint_pubkey: Pubkey,
    mint_authority: Option<&Keypair>,
    payer: &Keypair,
    authority: Pubkey,
    amount: u64,
) -> Pubkey {
    if let Some(mint_authority) = mint_authority {
        let account_pubkey =
            create_token_account(banks_client, mint_pubkey, payer, Some(authority), None).await;

        mint_to(
            banks_client,
            mint_pubkey,
            payer,
            account_pubkey,
            mint_authority,
            amount,
        )
        .await;

        account_pubkey
    } else {
        create_token_account(
            banks_client,
            mint_pubkey,
            payer,
            Some(authority),
            Some(amount),
        )
        .await
    }
}

pub async fn create_token_account(
    banks_client: &mut BanksClient,
    mint_pubkey: Pubkey,
    payer: &Keypair,
    authority: Option<Pubkey>,
    native_amount: Option<u64>,
) -> Pubkey {
    let token_keypair = Keypair::new();
    let token_pubkey = token_keypair.pubkey();
    let authority_pubkey = authority.unwrap_or_else(|| payer.pubkey());

    let rent = banks_client.get_rent().await.unwrap();
    let lamports = rent.minimum_balance(Token::LEN) + native_amount.unwrap_or_default();
    let mut transaction = Transaction::new_with_payer(
        &[
            create_account(
                &payer.pubkey(),
                &token_pubkey,
                lamports,
                Token::LEN as u64,
                &spl_token::id(),
            ),
            spl_token::instruction::initialize_account(
                &spl_token::id(),
                &token_pubkey,
                &mint_pubkey,
                &authority_pubkey,
            )
            .unwrap(),
        ],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[payer, &token_keypair], recent_blockhash);

    assert_matches!(banks_client.process_transaction(transaction).await, Ok(()));

    token_pubkey
}

pub async fn mint_to(
    banks_client: &mut BanksClient,
    mint_pubkey: Pubkey,
    payer: &Keypair,
    account_pubkey: Pubkey,
    authority: &Keypair,
    amount: u64,
) {
    let mut transaction = Transaction::new_with_payer(
        &[spl_token::instruction::mint_to(
            &spl_token::id(),
            &mint_pubkey,
            &account_pubkey,
            &authority.pubkey(),
            &[],
            amount,
        )
        .unwrap()],
        Some(&payer.pubkey()),
    );

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();
    transaction.sign(&[payer, authority], recent_blockhash);

    assert_matches!(banks_client.process_transaction(transaction).await, Ok(()));
}

pub async fn get_token_balance(banks_client: &mut BanksClient, pubkey: Pubkey) -> u64 {
    let token: Account = banks_client.get_account(pubkey).await.unwrap().unwrap();

    spl_token::state::Account::unpack(&token.data[..])
        .unwrap()
        .amount
}
