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


#SOURCE=`spl-token --config $SOLANA_CONFIG wrap 0.33 2>&1 | head -n1 | awk '{print $NF}'`;

#solana program --config $SOLANA_CONFIG deploy \
#  --program $PROGRAM_ID \
#  target/deploy/solend_program.so;

#echo "Creating Lending Market";
#CREATE_MARKET_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa create-market \
#  --fee-payer    $OWNER \
#  --market-owner $MARKET_OWNER \
#  --verbose`;

#echo "$CREATE_MARKET_OUTPUT";
MARKET_ADDR=`echo F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1`
#echo $CREATE_MARKET_OUTPUT | head -n1 | awk '{print $4}'`;
AUTHORITY_ADDR=`echo HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV`
#$CREATE_MARKET_OUTPUT | grep "Authority Address" | awk '{print $NF}'`;



# USDC Reserve
echo "Creating USDC Reserve";
USDC_TOKEN_MINT=`echo 83LGLCm7QKpYZbX8q4W2kYWbtt8NJBwbVwEepzkVnJ9y`;
echo "USDC MINT: $USDC_TOKEN_MINT"
USDC_TOKEN_ACCOUNT=`echo 7tHgvC6ZLRpt5FREfhuskXbNvtYD1p5AnRMThtAKR7rR`;

USDC_RESERVE_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa add-reserve \
  --fee-payer         $OWNER \
  --market-owner      $OWNER \
  --source-owner      $OWNER \
  --market            $MARKET_ADDR \
  --source            $USDC_TOKEN_ACCOUNT \
  --amount            0.00006  \
  --pyth-product      8x8E2jtWjh7ux8pp971Ha3UNYJ8LPNrnPEfF7v5FGdA1 \
  --pyth-price        CtJ8EkqLmeYyGB8s4jevpeNsvmD4dxVR2krfsDLcvV8Y \
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
ETH_TOKEN_MINT=`echo 9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6`;
echo "ETH MINT: $ETH_TOKEN_MINT"
ETH_TOKEN_ACCOUNT=`echo Fu5GhUeEiFGq9ANy26FrXX43HvXMps98S658QywazmSm`

ETH_RESERVE_OUTPUT=`target/debug/solend-program  --program E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa add-reserve \
  --fee-payer         $OWNER \
  --market-owner      $OWNER \
  --source-owner      $OWNER \
  --market            $MARKET_ADDR \
  --source            $ETH_TOKEN_ACCOUNT \
  --amount            0.00006 \
  --pyth-product      8x8E2jtWjh7ux8pp971Ha3UNYJ8LPNrnPEfF7v5FGdA1 \
  --pyth-price        CtJ8EkqLmeYyGB8s4jevpeNsvmD4dxVR2krfsDLcvV8Y \
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

# Export variables for new config.ts file
CONFIG_TEMPLATE_FILE="https://raw.githubusercontent.com/solendprotocol/common/master/src/devnet_template.json"
# Token Mints
export USDC_MINT_ADDRESS="$USDC_TOKEN_MINT";
export ETH_MINT_ADDRESS="$ETH_TOKEN_MINT";

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

# Run templating command 
curl $CONFIG_TEMPLATE_FILE | envsubst 