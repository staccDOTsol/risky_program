use super::*;
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};
use solana_program::{
    msg,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::{Pubkey, PUBKEY_BYTES},
};

use crate::error::LendingError;

/// Last update state
#[derive(Clone, Debug, Default)]
pub struct EtherealToken {
    /// Last slot when updated
    pub supply: u64,
    pub authority: Pubkey
}
impl Sealed for EtherealToken {}

impl EtherealToken {
    /// Create new last update
    pub fn new(authority: Pubkey) -> Self {
        Self { supply: 0, authority }
    }


    /// Set last update slot
    pub fn update_slot(&mut self, supply: u64) {
        self.supply = supply;
    }

}

const LENDING_MARKET_LEN: usize = 40; // 33
impl Pack for EtherealToken {
    const LEN: usize = LENDING_MARKET_LEN;

    fn pack_into_slice(&self, output: &mut [u8]) {
        let output = array_mut_ref![output, 0, LENDING_MARKET_LEN];
        #[allow(clippy::ptr_offset_with_cast)]
        let (
            supply,
            authority
        ) = mut_array_refs![
            output,
            8,
            32
        ];

        *supply = self.supply.to_le_bytes();
        authority.copy_from_slice(self.authority.as_ref());
    }

    /// Unpacks a byte buffer into a [LendingMarketInfo](struct.LendingMarketInfo.html)
    fn unpack_from_slice(input: &[u8]) -> Result<Self, ProgramError> {
        let input = array_ref![input, 0, LENDING_MARKET_LEN];
        #[allow(clippy::ptr_offset_with_cast)]
        let (
            supply,
            authority
        ) = array_refs![
            input,
            8,
            32
        ];
       
        Ok(Self {
            supply: u64::from_le_bytes(*supply),
            authority: Pubkey::new_from_array(*authority),
        })
    }
}
