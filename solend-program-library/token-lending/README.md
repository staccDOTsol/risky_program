# Solend Lending program

The Solend lending protocol is based on the token-lending program authored by [Solana labs](https://github.com/solana-labs/solana-program-library).

## Contributing/Building

The Solend protocol is open source with a focus on developer friendliness and integrations.

Solend is made for developers to build on top of. Check out our developer portal to understand more and get involved.

[
<img width="200" alt="Screen Shot 2022-01-09 at 5 54 30 PM" src="https://user-images.githubusercontent.com/89805726/148710356-a6cdb798-934a-459d-b795-d4a1099168db.png">](https://dev.solend.fi/).


### On-chain programs

Please note that only the lending program deployed to devnet is currently operational.

| Cluster | Program Address |
| --- | --- |
| Mainnet Beta | [`E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa`](https://explorer.solana.com/address/E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa) |
| Devnet | [`ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx`](https://explorer.solana.com/address/ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx?cluster=devnet) |

### Deploy a lending program (optional)

This is optional! You can skip these steps and use the [Token Lending CLI](./cli/README.md) with one of the on-chain programs listed above to create a lending market and add reserves to it.

1. [Install the Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)

1. Install the Token and Token Lending CLIs:
   ```shell
   cargo install spl-token-cli
   cargo install solend-program-cli
   ```
   
1. Clone the SPL repo:
   ```shell
   git clone https://github.com/solana-labs/solana-program-library.git
   ```

1. Go to the new directory:
   ```shell
   cd solana-program-library
   ```

1. Generate a keypair for yourself:
   ```shell
   solana-keygen new -o owner.json

   # Wrote new keypair to owner.json
   # ================================================================================
   # pubkey: JAgN4SZLNeCo9KTnr8EWt4FzEV1UDgHkcZwkVtWtfp6P
   # ================================================================================
   # Save this seed phrase and your BIP39 passphrase to recover your new keypair:
   # your seed words here never share them not even with your mom
   # ================================================================================
   ```
   This pubkey will be the owner of the lending market that can add reserves to it.

1. Generate a keypair for the program:
   ```shell
   solana-keygen new -o lending.json

   # Wrote new keypair to lending.json
   # ============================================================================
   # pubkey: 6TvznH3B2e3p2mbhufNBpgSrLx6UkgvxtVQvopEZ2kuH
   # ============================================================================
   # Save this seed phrase and your BIP39 passphrase to recover your new keypair:
   # your seed words here never share them not even with your mom
   # ============================================================================
   ```
   This pubkey will be your Program ID.

1. Open `./token-lending/program/src/lib.rs` in your editor. In the line
   ```rust
   solana_program::declare_id!("6TvznH3B2e3p2mbhufNBpgSrLx6UkgvxtVQvopEZ2kuH");
   ```
   replace the Program ID with yours.

1. Build the program binaries:
   ```shell
   cargo build
   cargo build-bpf
   ```

1. Prepare to deploy to devnet:
   ```shell
   solana config set --url https://solana-devnet.g.alchemy.com/v2/4Q5FSmnGz3snzIr01s-ZNwAtdFdnDB9L
   ```

1. Score yourself some sweet SOL:
   ```shell
   solana airdrop -k owner.json 10
   solana airdrop -k owner.json 10
   solana airdrop -k owner.json 10
   ```
   You'll use this for transaction fees, rent for your program accounts, and initial reserve liquidity.

1. Deploy the program:
   ```shell
   solana program deploy \
     -k owner.json \
     --program-id lending.json \
     target/deploy/solend_program.so

   # Program Id: 6TvznH3B2e3p2mbhufNBpgSrLx6UkgvxtVQvopEZ2kuH
   ```
   If the deployment doesn't succeed, follow [this guide](https://docs.solana.com/cli/deploy-a-program#resuming-a-failed-deploy) to resume it.

1. Wrap some of your SOL as an SPL Token:
   ```shell
   spl-token wrap \
      --fee-payer owner.json \
      10.0 \
      -- owner.json

   # Wrapping 10 SOL into AJ2sgpgj6ZeQazPPiDyTYqN9vbj58QMaZQykB9Sr6XY
   ```
   You'll use this for initial reserve liquidity. Note the SPL Token account pubkey (e.g. `AJ2sgpgj6ZeQazPPiDyTYqN9vbj58QMaZQykB9Sr6XY`).

1. Use the [Token Lending CLI](./cli/README.md) to create a lending market and add reserves to it.
