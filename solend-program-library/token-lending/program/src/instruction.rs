//! Instruction types

use crate::{
    error::LendingError,
    state::{ReserveConfig, ReserveFees},
};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    msg,
    program_error::ProgramError,
    pubkey::{Pubkey, PUBKEY_BYTES},
    sysvar,
};
use std::{convert::TryInto, mem::size_of};

/// Instructions supported by the lending program.
#[derive(Clone, Debug, PartialEq)]
pub enum LendingInstruction {
    InitLendingMarket {
        /// Owner authority which can add new reserves
        owner: Pubkey,
        /// Currency market prices are quoted in
        /// e.g. "USD" null padded (`*b"USD\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"`) or SPL token mint pubkey
        quote_currency: [u8; 32],
    },

    SetLendingMarketOwner {
        /// The new owner
        new_owner: Pubkey,
    },

    InitReserve {
        /// Initial amount of liquidity to deposit into the new reserve
        liquidity_amount: u64,
        /// Reserve configuration values
        config: ReserveConfig,
    },

    RefreshReserve,
    DepositReserveLiquidity {
        /// Amount of liquidity to deposit in exchange for collateral tokens
        liquidity_amount: u64,
    },

    RedeemReserveCollateral {
        /// Amount of collateral tokens to redeem in exchange for liquidity
        collateral_amount: u64,
    },
    FlashLoan {
        /// The amount that is to be borrowed - u64::MAX for up to 100% of available liquidity
        amount: u64,
    },
    UpdateReserveConfig {
        /// Reserve config to update to
        config: ReserveConfig,
    },
    RedeemFees,

    FlashBorrowReserveLiquidity {
        /// Amount of liquidity to flash borrow
        liquidity_amount: u64,
    },
    FlashRepayReserveLiquidity {
        /// Amount of liquidity to flash repay
        liquidity_amount: u64,
        /// Index of FlashBorrowReserveLiquidity instruction
        borrow_instruction_index: u8,
    },
}

impl LendingInstruction {
    /// Unpacks a byte buffer into a [LendingInstruction](enum.LendingInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input
            .split_first()
            .ok_or(LendingError::InstructionUnpackError)?;
        Ok(match tag {
            0 => {
                let (owner, rest) = Self::unpack_pubkey(rest)?;
                let (quote_currency, _rest) = Self::unpack_bytes32(rest)?;
                Self::InitLendingMarket {
                    owner,
                    quote_currency: *quote_currency,
                }
            }
            1 => {
                let (new_owner, _rest) = Self::unpack_pubkey(rest)?;
                Self::SetLendingMarketOwner { new_owner }
            }
            2 => {
                let (liquidity_amount, rest) = Self::unpack_u64(rest)?;
                let (optimal_utilization_rate, rest) = Self::unpack_u8(rest)?;
                let (loan_to_value_ratio, rest) = Self::unpack_u8(rest)?;
                let (liquidation_bonus, rest) = Self::unpack_u8(rest)?;
                let (liquidation_threshold, rest) = Self::unpack_u8(rest)?;
                let (min_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (optimal_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (max_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (borrow_fee_wad, rest) = Self::unpack_u64(rest)?;
                let (flash_loan_fee_wad, rest) = Self::unpack_u64(rest)?;
                let (host_fee_percentage, rest) = Self::unpack_u8(rest)?;
                let (deposit_limit, rest) = Self::unpack_u64(rest)?;
                let (borrow_limit, rest) = Self::unpack_u64(rest)?;
                let (fee_receiver, rest) = Self::unpack_pubkey(rest)?;
                let (protocol_liquidation_fee, rest) = Self::unpack_u8(rest)?;
                let (protocol_take_rate, _rest) = Self::unpack_u8(rest)?;
                Self::InitReserve {
                    liquidity_amount,
                    config: ReserveConfig {
                        optimal_utilization_rate,
                        loan_to_value_ratio,
                        liquidation_bonus,
                        liquidation_threshold,
                        min_borrow_rate,
                        optimal_borrow_rate,
                        max_borrow_rate,
                        fees: ReserveFees {
                            borrow_fee_wad,
                            flash_loan_fee_wad,
                            host_fee_percentage,
                        },
                        deposit_limit,
                        borrow_limit,
                        fee_receiver,
                        protocol_liquidation_fee,
                        protocol_take_rate,
                    },
                }
            }
            3 => Self::RefreshReserve,
            4 => {
                let (liquidity_amount, _rest) = Self::unpack_u64(rest)?;
                Self::DepositReserveLiquidity { liquidity_amount }
            }
            5 => {
                let (collateral_amount, _rest) = Self::unpack_u64(rest)?;
                Self::RedeemReserveCollateral { collateral_amount }
            }
            13 => {
                let (amount, _rest) = Self::unpack_u64(rest)?;
                Self::FlashLoan { amount }
            }
            16 => {
                let (optimal_utilization_rate, rest) = Self::unpack_u8(rest)?;
                let (loan_to_value_ratio, rest) = Self::unpack_u8(rest)?;
                let (liquidation_bonus, rest) = Self::unpack_u8(rest)?;
                let (liquidation_threshold, rest) = Self::unpack_u8(rest)?;
                let (min_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (optimal_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (max_borrow_rate, rest) = Self::unpack_u8(rest)?;
                let (borrow_fee_wad, rest) = Self::unpack_u64(rest)?;
                let (flash_loan_fee_wad, rest) = Self::unpack_u64(rest)?;
                let (host_fee_percentage, rest) = Self::unpack_u8(rest)?;
                let (deposit_limit, rest) = Self::unpack_u64(rest)?;
                let (borrow_limit, rest) = Self::unpack_u64(rest)?;
                let (fee_receiver, rest) = Self::unpack_pubkey(rest)?;
                let (protocol_liquidation_fee, rest) = Self::unpack_u8(rest)?;
                let (protocol_take_rate, _rest) = Self::unpack_u8(rest)?;
                Self::UpdateReserveConfig {
                    config: ReserveConfig {
                        optimal_utilization_rate,
                        loan_to_value_ratio,
                        liquidation_bonus,
                        liquidation_threshold,
                        min_borrow_rate,
                        optimal_borrow_rate,
                        max_borrow_rate,
                        fees: ReserveFees {
                            borrow_fee_wad,
                            flash_loan_fee_wad,
                            host_fee_percentage,
                        },
                        deposit_limit,
                        borrow_limit,
                        fee_receiver,
                        protocol_liquidation_fee,
                        protocol_take_rate,
                    },
                }
            }
            18 => Self::RedeemFees,
            19 => {
                let (liquidity_amount, _rest) = Self::unpack_u64(rest)?;
                Self::FlashBorrowReserveLiquidity { liquidity_amount }
            }
            20 => {
                let (liquidity_amount, rest) = Self::unpack_u64(rest)?;
                let (borrow_instruction_index, _rest) = Self::unpack_u8(rest)?;
                Self::FlashRepayReserveLiquidity {
                    liquidity_amount,
                    borrow_instruction_index,
                }
            }
            _ => {
                msg!("Instruction cannot be unpacked");
                return Err(LendingError::InstructionUnpackError.into());
            }
        })
    }

    fn unpack_u64(input: &[u8]) -> Result<(u64, &[u8]), ProgramError> {
        if input.len() < 8 {
            msg!("u64 cannot be unpacked");
            return Err(LendingError::InstructionUnpackError.into());
        }
        let (bytes, rest) = input.split_at(8);
        let value = bytes
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(LendingError::InstructionUnpackError)?;
        Ok((value, rest))
    }

    fn unpack_u8(input: &[u8]) -> Result<(u8, &[u8]), ProgramError> {
        if input.is_empty() {
            msg!("u8 cannot be unpacked");
            return Err(LendingError::InstructionUnpackError.into());
        }
        let (bytes, rest) = input.split_at(1);
        let value = bytes
            .get(..1)
            .and_then(|slice| slice.try_into().ok())
            .map(u8::from_le_bytes)
            .ok_or(LendingError::InstructionUnpackError)?;
        Ok((value, rest))
    }

    fn unpack_bytes32(input: &[u8]) -> Result<(&[u8; 32], &[u8]), ProgramError> {
        if input.len() < 32 {
            msg!("32 bytes cannot be unpacked");
            return Err(LendingError::InstructionUnpackError.into());
        }
        let (bytes, rest) = input.split_at(32);
        Ok((
            bytes
                .try_into()
                .map_err(|_| LendingError::InstructionUnpackError)?,
            rest,
        ))
    }

    fn unpack_pubkey(input: &[u8]) -> Result<(Pubkey, &[u8]), ProgramError> {
        if input.len() < PUBKEY_BYTES {
            msg!("Pubkey cannot be unpacked");
            return Err(LendingError::InstructionUnpackError.into());
        }
        let (key, rest) = input.split_at(PUBKEY_BYTES);
        let pk = Pubkey::new(key);
        Ok((pk, rest))
    }

    /// Packs a [LendingInstruction](enum.LendingInstruction.html) into a byte buffer.
    pub fn pack(&self) -> Vec<u8> {
        let mut buf = Vec::with_capacity(size_of::<Self>());
        match *self {
            Self::InitLendingMarket {
                owner,
                quote_currency,
            } => {
                buf.push(0);
                buf.extend_from_slice(owner.as_ref());
                buf.extend_from_slice(quote_currency.as_ref());
            }
            Self::SetLendingMarketOwner { new_owner } => {
                buf.push(1);
                buf.extend_from_slice(new_owner.as_ref());
            }
            Self::InitReserve {
                liquidity_amount,
                config:
                    ReserveConfig {
                        optimal_utilization_rate,
                        loan_to_value_ratio,
                        liquidation_bonus,
                        liquidation_threshold,
                        min_borrow_rate,
                        optimal_borrow_rate,
                        max_borrow_rate,
                        fees:
                            ReserveFees {
                                borrow_fee_wad,
                                flash_loan_fee_wad,
                                host_fee_percentage,
                            },
                        deposit_limit,
                        borrow_limit,
                        fee_receiver,
                        protocol_liquidation_fee,
                        protocol_take_rate,
                    },
            } => {
                buf.push(2);
                buf.extend_from_slice(&liquidity_amount.to_le_bytes());
                buf.extend_from_slice(&optimal_utilization_rate.to_le_bytes());
                buf.extend_from_slice(&loan_to_value_ratio.to_le_bytes());
                buf.extend_from_slice(&liquidation_bonus.to_le_bytes());
                buf.extend_from_slice(&liquidation_threshold.to_le_bytes());
                buf.extend_from_slice(&min_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&optimal_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&max_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&borrow_fee_wad.to_le_bytes());
                buf.extend_from_slice(&flash_loan_fee_wad.to_le_bytes());
                buf.extend_from_slice(&host_fee_percentage.to_le_bytes());
                buf.extend_from_slice(&deposit_limit.to_le_bytes());
                buf.extend_from_slice(&borrow_limit.to_le_bytes());
                buf.extend_from_slice(&fee_receiver.to_bytes());
                buf.extend_from_slice(&protocol_liquidation_fee.to_le_bytes());
                buf.extend_from_slice(&protocol_take_rate.to_le_bytes());
            }
            Self::RefreshReserve => {
                buf.push(3);
            }
            Self::DepositReserveLiquidity { liquidity_amount } => {
                buf.push(4);
                buf.extend_from_slice(&liquidity_amount.to_le_bytes());
            }
            Self::RedeemReserveCollateral { collateral_amount } => {
                buf.push(5);
                buf.extend_from_slice(&collateral_amount.to_le_bytes());
            }
            Self::FlashLoan { amount } => {
                buf.push(13);
                buf.extend_from_slice(&amount.to_le_bytes());
            }
            Self::UpdateReserveConfig { config } => {
                buf.push(16);
                buf.extend_from_slice(&config.optimal_utilization_rate.to_le_bytes());
                buf.extend_from_slice(&config.loan_to_value_ratio.to_le_bytes());
                buf.extend_from_slice(&config.liquidation_bonus.to_le_bytes());
                buf.extend_from_slice(&config.liquidation_threshold.to_le_bytes());
                buf.extend_from_slice(&config.min_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&config.optimal_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&config.max_borrow_rate.to_le_bytes());
                buf.extend_from_slice(&config.fees.borrow_fee_wad.to_le_bytes());
                buf.extend_from_slice(&config.fees.flash_loan_fee_wad.to_le_bytes());
                buf.extend_from_slice(&config.fees.host_fee_percentage.to_le_bytes());
                buf.extend_from_slice(&config.deposit_limit.to_le_bytes());
                buf.extend_from_slice(&config.borrow_limit.to_le_bytes());
                buf.extend_from_slice(&config.fee_receiver.to_bytes());
                buf.extend_from_slice(&config.protocol_liquidation_fee.to_le_bytes());
                buf.extend_from_slice(&config.protocol_take_rate.to_le_bytes());
            }
            Self::RedeemFees {} => {
                buf.push(18);
            }
            Self::FlashBorrowReserveLiquidity { liquidity_amount } => {
                buf.push(19);
                buf.extend_from_slice(&liquidity_amount.to_le_bytes());
            }
            Self::FlashRepayReserveLiquidity {
                liquidity_amount,
                borrow_instruction_index,
            } => {
                buf.push(20);
                buf.extend_from_slice(&liquidity_amount.to_le_bytes());
                buf.extend_from_slice(&borrow_instruction_index.to_le_bytes());
            }
        }
        buf
    }
}

/// Creates an 'InitLendingMarket' instruction.
pub fn init_lending_market(
    program_id: Pubkey,
    owner: Pubkey,
    quote_currency: [u8; 32],
    lending_market_pubkey: Pubkey,
    oracle_program_id: Pubkey,
    switchboard_oracle_program_id: Pubkey,
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(lending_market_pubkey, false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
            AccountMeta::new_readonly(spl_token::id(), false),
            AccountMeta::new_readonly(oracle_program_id, false),
            AccountMeta::new_readonly(switchboard_oracle_program_id, false),
        ],
        data: LendingInstruction::InitLendingMarket {
            owner,
            quote_currency,
        }
        .pack(),
    }
}

/// Creates a 'SetLendingMarketOwner' instruction.
pub fn set_lending_market_owner(
    program_id: Pubkey,
    lending_market_pubkey: Pubkey,
    lending_market_owner: Pubkey,
    new_owner: Pubkey,
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(lending_market_pubkey, false),
            AccountMeta::new_readonly(lending_market_owner, true),
        ],
        data: LendingInstruction::SetLendingMarketOwner { new_owner }.pack(),
    }
}

/// Creates an 'InitReserve' instruction.
#[allow(clippy::too_many_arguments)]
pub fn init_reserve(
    program_id: Pubkey,
    liquidity_amount: u64,
    config: ReserveConfig,
    source_liquidity_pubkey: Pubkey,
    destination_collateral_pubkey: Pubkey,
    reserve_pubkey: Pubkey,
    reserve_liquidity_mint_pubkey: Pubkey,
    reserve_liquidity_supply_pubkey: Pubkey,
    reserve_collateral_mint_pubkey: Pubkey,
    reserve_collateral_supply_pubkey: Pubkey,
    pyth_product_pubkey: Pubkey,
    pyth_price_pubkey: Pubkey,
    switchboard_feed_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
    lending_market_owner_pubkey: Pubkey,
    user_transfer_authority_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );
    let accounts = vec![
        AccountMeta::new(source_liquidity_pubkey, false),
        AccountMeta::new(destination_collateral_pubkey, false),
        AccountMeta::new(reserve_pubkey, false),
        AccountMeta::new_readonly(reserve_liquidity_mint_pubkey, false),
        AccountMeta::new(reserve_liquidity_supply_pubkey, false),
        AccountMeta::new(config.fee_receiver, false),
        AccountMeta::new(reserve_collateral_mint_pubkey, false),
        AccountMeta::new(reserve_collateral_supply_pubkey, false),
        AccountMeta::new_readonly(pyth_product_pubkey, false),
        AccountMeta::new_readonly(pyth_price_pubkey, false),
        AccountMeta::new_readonly(switchboard_feed_pubkey, false),
        AccountMeta::new_readonly(lending_market_pubkey, false),
        AccountMeta::new_readonly(lending_market_authority_pubkey, false),
        AccountMeta::new_readonly(lending_market_owner_pubkey, true),
        AccountMeta::new_readonly(user_transfer_authority_pubkey, true),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
        AccountMeta::new_readonly(spl_token::id(), false),
    ];
    Instruction {
        program_id,
        accounts,
        data: LendingInstruction::InitReserve {
            liquidity_amount,
            config,
        }
        .pack(),
    }
}

/// Creates a `RefreshReserve` instruction
pub fn refresh_reserve(
    program_id: Pubkey,
    reserve_pubkey: Pubkey,
    reserve_liquidity_pyth_oracle_pubkey: Pubkey,
    reserve_liquidity_switchboard_oracle_pubkey: Pubkey,
) -> Instruction {
    let accounts = vec![
        AccountMeta::new(reserve_pubkey, false),
        AccountMeta::new_readonly(reserve_liquidity_pyth_oracle_pubkey, false),
        AccountMeta::new_readonly(reserve_liquidity_switchboard_oracle_pubkey, false),
    ];
    Instruction {
        program_id,
        accounts,
        data: LendingInstruction::RefreshReserve.pack(),
    }
}

/// Creates a 'DepositReserveLiquidity' instruction.
#[allow(clippy::too_many_arguments)]
pub fn deposit_reserve_liquidity(
    program_id: Pubkey,
    liquidity_amount: u64,
    source_liquidity_pubkey: Pubkey,
    destination_collateral_pubkey: Pubkey,
    reserve_pubkey: Pubkey,
    reserve_liquidity_supply_pubkey: Pubkey,
    reserve_collateral_mint_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
    user_transfer_authority_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(source_liquidity_pubkey, false),
            AccountMeta::new(destination_collateral_pubkey, false),
            AccountMeta::new(reserve_pubkey, false),
            AccountMeta::new(reserve_liquidity_supply_pubkey, false),
            AccountMeta::new(reserve_collateral_mint_pubkey, false),
            AccountMeta::new_readonly(lending_market_pubkey, false),
            AccountMeta::new_readonly(lending_market_authority_pubkey, false),
            AccountMeta::new_readonly(user_transfer_authority_pubkey, true),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: LendingInstruction::DepositReserveLiquidity { liquidity_amount }.pack(),
    }
}

/// Creates a 'RedeemReserveCollateral' instruction.
#[allow(clippy::too_many_arguments)]
pub fn redeem_reserve_collateral(
    program_id: Pubkey,
    collateral_amount: u64,
    source_collateral_pubkey: Pubkey,
    destination_liquidity_pubkey: Pubkey,
    reserve_pubkey: Pubkey,
    reserve_collateral_mint_pubkey: Pubkey,
    reserve_liquidity_supply_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
    user_transfer_authority_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(source_collateral_pubkey, false),
            AccountMeta::new(destination_liquidity_pubkey, false),
            AccountMeta::new(reserve_pubkey, false),
            AccountMeta::new(reserve_collateral_mint_pubkey, false),
            AccountMeta::new(reserve_liquidity_supply_pubkey, false),
            AccountMeta::new_readonly(lending_market_pubkey, false),
            AccountMeta::new_readonly(lending_market_authority_pubkey, false),
            AccountMeta::new_readonly(user_transfer_authority_pubkey, true),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: LendingInstruction::RedeemReserveCollateral { collateral_amount }.pack(),
    }
}


/// Creates an 'UpdateReserveConfig' instruction.
#[allow(clippy::too_many_arguments)]
pub fn update_reserve_config(
    program_id: Pubkey,
    config: ReserveConfig,
    reserve_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
    lending_market_owner_pubkey: Pubkey,
    pyth_product_pubkey: Pubkey,
    pyth_price_pubkey: Pubkey,
    switchboard_feed_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );
    let accounts = vec![
        AccountMeta::new(reserve_pubkey, false),
        AccountMeta::new_readonly(lending_market_pubkey, false),
        AccountMeta::new_readonly(lending_market_authority_pubkey, false),
        AccountMeta::new_readonly(lending_market_owner_pubkey, true),
        AccountMeta::new_readonly(pyth_product_pubkey, false),
        AccountMeta::new_readonly(pyth_price_pubkey, false),
        AccountMeta::new_readonly(switchboard_feed_pubkey, false),
    ];
    Instruction {
        program_id,
        accounts,
        data: LendingInstruction::UpdateReserveConfig { config }.pack(),
    }
}


/// Creates a `RedeemFees` instruction
pub fn redeem_fees(
    program_id: Pubkey,
    reserve_pubkey: Pubkey,
    reserve_liquidity_fee_receiver_pubkey: Pubkey,
    reserve_supply_liquidity_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );
    let accounts = vec![
        AccountMeta::new(reserve_pubkey, false),
        AccountMeta::new(reserve_liquidity_fee_receiver_pubkey, false),
        AccountMeta::new(reserve_supply_liquidity_pubkey, false),
        AccountMeta::new_readonly(lending_market_pubkey, false),
        AccountMeta::new_readonly(lending_market_authority_pubkey, false),
        AccountMeta::new_readonly(spl_token::id(), false),
    ];
    Instruction {
        program_id,
        accounts,
        data: LendingInstruction::RedeemFees.pack(),
    }
}

/// Creates a 'FlashBorrowReserveLiquidity' instruction.
#[allow(clippy::too_many_arguments)]
pub fn flash_borrow_reserve_liquidity(
    program_id: Pubkey,
    liquidity_amount: u64,
    source_liquidity_pubkey: Pubkey,
    destination_liquidity_pubkey: Pubkey,
    reserve_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
) -> Instruction {
    let (lending_market_authority_pubkey, _bump_seed) = Pubkey::find_program_address(
        &[&lending_market_pubkey.to_bytes()[..PUBKEY_BYTES]],
        &program_id,
    );

    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(source_liquidity_pubkey, false),
            AccountMeta::new(destination_liquidity_pubkey, false),
            AccountMeta::new(reserve_pubkey, false),
            AccountMeta::new_readonly(lending_market_pubkey, false),
            AccountMeta::new_readonly(lending_market_authority_pubkey, false),
            AccountMeta::new_readonly(sysvar::instructions::id(), false),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: LendingInstruction::FlashBorrowReserveLiquidity { liquidity_amount }.pack(),
    }
}

/// Creates a 'FlashRepayReserveLiquidity' instruction.
#[allow(clippy::too_many_arguments)]
pub fn flash_repay_reserve_liquidity(
    program_id: Pubkey,
    liquidity_amount: u64,
    borrow_instruction_index: u8,
    source_liquidity_pubkey: Pubkey,
    destination_liquidity_pubkey: Pubkey,
    reserve_liquidity_fee_receiver_pubkey: Pubkey,
    host_fee_receiver_pubkey: Pubkey,
    reserve_pubkey: Pubkey,
    lending_market_pubkey: Pubkey,
    user_transfer_authority_pubkey: Pubkey,
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
            AccountMeta::new(source_liquidity_pubkey, false),
            AccountMeta::new(destination_liquidity_pubkey, false),
            AccountMeta::new(reserve_liquidity_fee_receiver_pubkey, false),
            AccountMeta::new(host_fee_receiver_pubkey, false),
            AccountMeta::new(reserve_pubkey, false),
            AccountMeta::new_readonly(lending_market_pubkey, false),
            AccountMeta::new_readonly(user_transfer_authority_pubkey, true),
            AccountMeta::new_readonly(sysvar::instructions::id(), false),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: LendingInstruction::FlashRepayReserveLiquidity {
            liquidity_amount,
            borrow_instruction_index,
        }
        .pack(),
    }
}
