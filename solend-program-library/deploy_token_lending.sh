#!/bin/bash
echo "Running deploy script...";
SOLANA_CONFIG=$1;
PROGRAM_ID=$2;
# Get OWNER from keypair_path key of the solana config file
OWNER=`grep 'keypair_path:' $SOLANA_CONFIG | awk '{print $2}'`;
MARKET_OWNER=`solana --config $SOLANA_CONFIG address`;


set -e;
echo "Using Solana config filepath: $SOLANA_CONFIG";
echo "Program ID: $PROGRAM_ID";
echo "Owner: $OWNER";
echo "Market Owner $MARKET_OWNER";

#spl-token --config $SOLANA_CONFIG unwrap;


SOURCE=`spl-token --config $SOLANA_CONFIG wrap 0.33 2>&1 | head -n1 | awk '{print $NF}'`;

#solana program --config $SOLANA_CONFIG deploy \
#  --program $PROGRAM_ID \
#  target/deploy/solend_program.so;

echo "Creating Lending Market";
#CREATE_MARKET_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa create-market \
#  --fee-payer    $OWNER \
#  --market-owner $MARKET_OWNER \
#  --verbose`;

echo "$CREATE_MARKET_OUTPUT";
MARKET_ADDR=`echo F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1`
#echo $CREATE_MARKET_OUTPUT | head -n1 | awk '{print $4}'`;
AUTHORITY_ADDR=`echo HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV`
#$CREATE_MARKET_OUTPUT | grep "Authority Address" | awk '{print $NF}'`;



# USDC Reserve
echo "Creating USDC Reserve";
USDC_TOKEN_MINT=`echo EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`;
echo "USDC MINT: $USDC_TOKEN_MINT"
USDC_TOKEN_ACCOUNT=`echo 2wpYeJQmQAPaQFpB8jZPPbPuJPXgVLNPir2ohwGBCFD1`;

USDC_RESERVE_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa add-reserve \
  --fee-payer         $OWNER \
  --market-owner      $OWNER \
  --source-owner      $OWNER \
  --market            $MARKET_ADDR \
  --source            $USDC_TOKEN_ACCOUNT \
  --amount            1  \
  --pyth-product      8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb \
  --pyth-price        Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD \
  --switchboard-feed  nu11111111111111111111111111111111111111111 \
  --optimal-utilization-rate 80 --protocol-liquidation-fee 1 --protocol-take-rate 2  \
  --loan-to-value-ratio 89      \
  --liquidation-bonus 5 \
  --liquidation-threshold 94 \
  --min-borrow-rate 0   \
  --optimal-borrow-rate  16 \
  --max-borrow-rate 250 \
  --host-fee-percentage 80 \
  --deposit-limit 30000000 \
  --verbose`;
echo "$USDC_RESERVE_OUTPUT";

# ETH Reserve
echo "Creating ETH Reserve"
ETH_TOKEN_MINT=`echo 7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs`;
echo "ETH MINT: $ETH_TOKEN_MINT"
ETH_TOKEN_ACCOUNT=`echo ptsz1ntpDgMdYypb5G6XK2zqPbPqVQa4Xo4Hs5W5zwe`

ETH_RESERVE_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa add-reserve \
  --fee-payer         $OWNER \
  --market-owner      $OWNER \
  --source-owner      $OWNER \
  --market            $MARKET_ADDR \
  --source            $ETH_TOKEN_ACCOUNT \
  --amount            0.00006 \
  --pyth-product      EMkxjGC1CQ7JLiutDbfYb7UKb3zm9SJcUmr1YicBsdpZ \
  --pyth-price        JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB  \
  --switchboard-feed  nu11111111111111111111111111111111111111111 \
  --optimal-utilization-rate 80 --protocol-liquidation-fee 1 --protocol-take-rate 2  \
  --loan-to-value-ratio 89      \
  --liquidation-bonus 5 \
  --liquidation-threshold 94 \
  --min-borrow-rate 0   \
  --optimal-borrow-rate  16 \
  --max-borrow-rate 250 \
  --host-fee-percentage 80 \
  --deposit-limit 30000000 \
  --verbose`;
echo "$ETH_RESERVE_OUTPUT";


echo "Creating COPE Reserve"
COPE_TOKEN_MINT=`echo 8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh`;
echo "COPE MINT: $COPE_TOKEN_MINT"
COPE_TOKEN_ACCOUNT=`echo Gwbcbzqgy9BsLqc33wjJo5Gy3xCv763KRgKdCUCuNUoT`;

COPE_RESERVE_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa add-reserve \
  --fee-payer         $OWNER \
  --market-owner      $OWNER \
  --source-owner      $OWNER \
  --market            $MARKET_ADDR \
  --source            $COPE_TOKEN_ACCOUNT \
  --amount            5  \
  --pyth-product      2nBBaJ2WozeqyDGaVXAqm3d5YqCjeDhoqpfTjyLNykxe\
  --pyth-price        9xYBiDWYsh2fHzpsz3aaCnNHCKWBNtfEDLtU6kS4aFD9 \
  --switchboard-feed  nu11111111111111111111111111111111111111111 \
  --optimal-utilization-rate 80 --protocol-liquidation-fee 1 --protocol-take-rate 2  \
  --loan-to-value-ratio 89      \
  --liquidation-bonus 5 \
  --liquidation-threshold 94 \
  --min-borrow-rate 0   \
  --optimal-borrow-rate  16 \
  --max-borrow-rate 250 \
  --host-fee-percentage 80 \
  --deposit-limit 30000000 \
  --verbose`;
echo "$COPE_RESERVE_OUTPUT";

# Export variables for new config.ts file
CONFIG_TEMPLATE_FILE="https://raw.githubusercontent.com/solendprotocol/common/master/src/devnet_template.json"
# Token Mints
export USDC_MINT_ADDRESS="$USDC_TOKEN_MINT";
export ETH_MINT_ADDRESS="$ETH_TOKEN_MINT";
export COPE_MINT_ADDRESS="$COPE_TOKEN_MINT";

# Main Market
export MAIN_MARKET_ADDRESS="$MARKET_ADDR";
export MAIN_MARKET_AUTHORITY_ADDRESS="$AUTHORITY_ADDR";

export USDC_RESERVE_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export USDC_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export USDC_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export USDC_RESERVE_LIQUIDITY_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export USDC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$USDC_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

export ETH_RESERVE_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export ETH_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export ETH_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export ETH_RESERVE_LIQUIDITY_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export ETH_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$ETH_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

export COPE_RESERVE_ADDRESS=`echo "$COPE_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export COPE_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$COPE_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export COPE_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$COPE_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export COPE_RESERVE_LIQUIDITY_ADDRESS=`echo "$COPE_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export COPE_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$COPE_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;
# Reserves
export SOL_RESERVE_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding reserve" | awk '{print $NF}'`;
export SOL_RESERVE_COLLATERAL_MINT_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral mint" | awk '{print $NF}'`;
export SOL_RESERVE_COLLATERAL_SUPPLY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding collateral supply" | awk '{print $NF}'`;
export SOL_RESERVE_LIQUIDITY_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity supply" | awk '{print $NF}'`;
export SOL_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDRESS=`echo "$SOL_RESERVE_OUTPUT" | grep "Adding liquidity fee receiver" | awk '{print $NF}'`;

# Run templating command 
curl $CONFIG_TEMPLATE_FILE | envsubst 