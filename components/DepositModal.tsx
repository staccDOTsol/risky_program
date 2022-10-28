 import React, { FunctionComponent, useEffect, useState } from 'react'
 import { ExclamationCircleIcon } from '@heroicons/react/solid'
 import Modal from './Modal'
 import Input, { Label } from './Input'
 import AccountSelect from './AccountSelect'
 import { ElementTitle } from './styles'
 import useMangoStore from '../stores/useMangoStore'
 import Loading from './Loading'
 import Button from './Button'
 import InlineNotification from './InlineNotification'
 import { deposit } from '../utils/mango'
 import { notify } from '../utils/notifications'
 import { sleep, trimDecimals } from '../utils'
 import { useTranslation } from 'next-i18next'
 import ButtonGroup from './ButtonGroup'
 import { useConnection, useWallet } from '@solana/wallet-adapter-react'
 import MangoAccountSelect from './MangoAccountSelect'
 import { MangoAccount } from '@blockworks-foundation/mango-client'
 import { connectionSelector } from 'stores/selectors'
 import { INVESTIN_PROGRAM_ID } from 'utils/tokens'
 import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

 import { depositReserveLiquidityInstruction ,redeemReserveCollateralInstruction,refreshReserveInstruction} from "../solend-sdk/dist";
import { PublicKey, Transaction } from '@solana/web3.js'


 let config = 
 {
   "programID": "DLendnZuSiCK4kBRtX126ogq1uRnb1TGGsjW6Tnw1vMJ",
   "assets": [
     {
       "name": "Solana",
       "symbol": "SOL",
       "decimals": 9,
       "mintAddress": "So11111111111111111111111111111111111111112"
     },
     {
       "name": "USDC",
       "symbol": "USDC",
       "decimals": 6,
       "mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
     },
     {
       "name": "Cope",
       "symbol": "COPE",
       "decimals": 6,
       "mintAddress": "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh"
     }
   ],
   "markets": [
     {
       "name": "main",
       "address": "F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1",
       "authorityAddress": "HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV",
       "reserves": [
         {
           "asset": "SOL",
           "address": "fuSA8HSSku7BwRsVFWotGcVpwH3QrGtnhqWRS4orhXG",
           "collateralMintAddress": "44PeAshzRSmhzQ3Da9z22YXYRN18PfsTHVXZpcQ7p7TH",
           "jareMint": "7yN93TFSCZqseppJyxXjnAnps7wH1wRtvgemFXksc25t",
           "collateralSupplyAddress": "A8aUS1MBosuSLXwfP16iYL3VgJvPKhLGwGzvpuieRTvJ",
           "liquidityAddress": "CBH6VFEhBatZ265jrfKDMey5NQgMZhedk7piu5BCDYfW",
           "liquidityFeeReceiverAddress": "wwQZH2vvWqiqwudoQYQ5RydW2CkgD5FApgD6f92KqHb",
           "userSupplyCap": 4,
           "reserveSupplyCap": 40000
         },
         {
           "asset": "USDC",
           "address": "5guv5xt2we2FpPXkSPN8oaz6C876NjiV62Np5RxghDnb",
           "collateralMintAddress": "CnwtgyFcTyuQMKDSU1KCXVS4jPksjJUVQaMkgZ2WU3ny",
           "jareMint": "2DvSLHu3HDTDEdWnYETdTtuywTvenmVQpsvn5ybEbKpA",
           "collateralSupplyAddress": "HxL7nx79BLBwjGKAmnSYPhxdbPCpzHqj7UVb1ni3iUFC",
           "liquidityAddress": "Ho9gUv6Y5KKZzxat5pbnf2skppcVpniss6zrabhWwi1n",
           "liquidityFeeReceiverAddress": "8c5tAQAobrRyHgtLZJyaprLjv4yyL5YPEqS2S4wqD9UR",
           "userSupplyCap": 10000,
           "reserveSupplyCap": 1000000
         },
         {
           "asset": "COPE",
           "address": "CoQgPXDKkBo84K14uFbGqkNmXHjKLYXt6d4BvLY6LWpu",
           "collateralMintAddress": "EHSug7WuXkoPDaeF2Cog4mcZ6SKZ5iJ1rkXFoczrXWqL",
           "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
           "collateralSupplyAddress": "4RjkXaYqrKX8pd5t9RvPt4UmhyzuXjKT25ysXWQD2V56",
           "liquidityAddress": "6q7eZ2XBkgrwRpWnaVct6aRTKV9zmiGgXYuCQs4BQsjh",
           "liquidityFeeReceiverAddress": "47AV9KQgT8MxFrBnQC5uGK56NLQRMZPgze4G4i4sgGzJ",
           "userSupplyCap": 2500,
           "reserveSupplyCap": 300000
         }
       ]
     }
   ],
   "oracles": {
     "pythProgramID": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
     "switchboardProgramID": "7azgmy1pFXHikv36q1zZASvFq5vFa39TT9NweVugKKTU",
     "assets": [
       {
         "asset": "SOL",
         "oracleAddress": "8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb",
         "priceAddress": "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
         "switchboardFeedAddress": "AdtRGGhmqvom3Jemp5YNrxd9q9unX36BZk1pujkkXijL"
       },
       {
         "asset": "USDC",
         "oracleAddress": "EMkxjGC1CQ7JLiutDbfYb7UKb3zm9SJcUmr1YicBsdpZ",
         "priceAddress": "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB",
         "switchboardFeedAddress": "CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb"
       },
       {
         "asset": "SRM",
         "oracleAddress": "2nBBaJ2WozeqyDGaVXAqm3d5YqCjeDhoqpfTjyLNykxe",
         "priceAddress": "9xYBiDWYsh2fHzpsz3aaCnNHCKWBNtfEDLtU6kS4aFD9",
         "switchboardFeedAddress": "BAoygKcKN7wk8yKzLD6sxzUQUqLvhBV1rjMA4UJqfZuH"
       }
     ]
   }
 }
interface DepositModalProps {
  onClose: () => void
  isOpen: boolean
  repayAmount?: string
  tokenSymbol?: string
}
 const DepositModal: FunctionComponent<DepositModalProps> = ({
   isOpen,
   onClose,
   repayAmount,
   tokenSymbol = '',
 }) => {
   const { t } = useTranslation('common')
   const { wallet } = useWallet()
   const [inputAmount, setInputAmount] = useState<string>(repayAmount || '')
   const [submitting, setSubmitting] = useState(false)
   const [invalidAmountMessage, setInvalidAmountMessage] = useState('')
   const [depositPercentage, setDepositPercentage] = useState('')
   const walletTokens = useMangoStore((s) => s.wallet.tokens)
   const actions = useMangoStore((s) => s.actions)
   const [selectedAccount, setSelectedAccount] = useState(walletTokens[0])
   const mangoAccount = useMangoStore((s) => s.selectedMangoAccount.current)
   const mangoAccounts = useMangoStore((s) => s.mangoAccounts)
   const [depositMangoAccount, setDepositMangoAccount] =
     useState<MangoAccount | null>(mangoAccount)
     const connection = useMangoStore(connectionSelector)

   const [isInvestinDelegate, setIsInvestinDelegate] = useState(false)
   useEffect(() => {
     const checkForInvestinDelegate = async () => {
       if (mangoAccount && mangoAccount.owner) {
         const ai = await connection.getAccountInfo(mangoAccount.owner)
         if (ai?.owner.toBase58() === INVESTIN_PROGRAM_ID.toBase58()) {
           setIsInvestinDelegate(true)
         }
       }
     }
     checkForInvestinDelegate()
   }, [mangoAccount])

   useEffect(() => {
     if (tokenSymbol) {
       let symbolAccount = walletTokens.find(
         (a) => a.config.symbol === tokenSymbol
       )
       
       if (symbolAccount) {
         setSelectedAccount(symbolAccount)
       } else {
         setSelectedAccount(null)
       }
     }
   }, [tokenSymbol, walletTokens])

   const handleAccountSelect = (account) => {
     setInputAmount('')
     setDepositPercentage('')
     setInvalidAmountMessage('')
     setSelectedAccount(account)
   }

   const handleDeposit = async() => {
     if (!wallet ) return
     console.log(tokenSymbol)
if (!tokenSymbol) tokenSymbol = 'USDC'
     setSubmitting(true)
     let res = config.markets[0].reserves.find(
      (r) => r.asset === tokenSymbol
    )
     const userCollateralAccountAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      // @ts-ignore
      new PublicKey(
        
      // @ts-ignore
      res.collateralMintAddress ),
      wallet.adapter.publicKey as PublicKey
    );
    console.log(userCollateralAccountAddress.toBase58())
    const userCollateralAccountInfo = await connection.getAccountInfo(
      userCollateralAccountAddress
    );
    if (!userCollateralAccountInfo) {
      var transaction = new Transaction()

      const createUserCollateralAccountIx =
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          // @ts-ignore
          new PublicKey(res.collateralMintAddress),
          userCollateralAccountAddress,
          
      wallet.adapter.publicKey as PublicKey,
          
      wallet.adapter.publicKey as PublicKey
        );
    
    transaction.add(createUserCollateralAccountIx)
    
    transaction.recentBlockhash = await (
      await connection.getLatestBlockhash()
    ).blockhash;
console.log(selectedAccount.account)
    var hm2 = await wallet.adapter.sendTransaction(transaction,connection)
    console.log(hm2)
    }
    console.log(selectedAccount)

   var  transaction = new Transaction() 
transaction.add(
  depositReserveLiquidityInstruction(
    parseFloat(inputAmount )* 10 **  selectedAccount.config.decimals,
    selectedAccount.account.publicKey,
    userCollateralAccountAddress,
    // @ts-ignore
    new PublicKey(res.address),
    // @ts-ignore
    new PublicKey(res.liquidityAddress),

          // @ts-ignore
    new PublicKey(res.collateralMintAddress),
    new PublicKey(config.markets[0].address),   new PublicKey(config.markets[0].authorityAddress),

    wallet.adapter.publicKey as PublicKey, // obligationOwner
    new PublicKey(
      "E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa"
    )    ))

transaction.recentBlockhash = await (
  await connection.getLatestBlockhash()
).blockhash;
await wallet.adapter.sendTransaction(transaction,connection)
       .then((response) => {
         notify({
           title: t('deposit-successful'),
           type: 'success',
           txid:  response,
         })
         setSubmitting(false)
         onClose()
         sleep(500).then(() => {
           mangoAccount
             ? actions.reloadMangoAccount()
             : actions.fetchAllMangoAccounts(wallet)
           actions.fetchWalletTokens(wallet)
         })
       })
       .catch((err) => {
         notify({
           title: t('deposit-failed'),
           description: err.message,
           txid: err?.txid,
           type: 'error',
         })
         onClose()
       })
   }

   const validateAmountInput = (amount) => {
     if (Number(amount) <= 0) {
       setInvalidAmountMessage(t('enter-amount'))
     }
     if (selectedAccount && Number(amount) > selectedAccount.uiBalance) {
       setInvalidAmountMessage(t('insufficient-balance-deposit'))
     }
   }

   const onChangeAmountInput = (amount) => {
     setInputAmount(amount)

     if (!selectedAccount) {
       setInvalidAmountMessage(t('supported-assets'))
       return
     }

     setDepositPercentage('')
     setInvalidAmountMessage('')
   }

   const onChangeAmountButtons = async (percentage) => {
     setDepositPercentage(percentage)

     if (!selectedAccount) {
       setInvalidAmountMessage(t('supported-assets'))
       return
     }

     const max = selectedAccount.uiBalance
     const amount = ((parseInt(percentage) / 100) * max).toString()
     if (percentage === '100') {
       setInputAmount(amount)
     } else {
       setInputAmount(trimDecimals(amount, 6).toString())
     }
     setInvalidAmountMessage('')
     validateAmountInput(amount)
   }

    const percentage = repayAmount
      ? (parseFloat(inputAmount) / parseFloat(repayAmount)) * 100
      : null
    const net = repayAmount
      ? parseFloat(inputAmount) - parseFloat(repayAmount)
      : null
    const repayMessage =
      percentage === 100
        ? t('repay-full')
        : typeof percentage === 'number' && percentage > 100
        ? t('repay-and-deposit', {
            amount: trimDecimals(net, 6).toString(),
            symbol: selectedAccount.config.symbol,
          })
        : typeof percentage === 'number'
        ? t('repay-partial', {
            percentage: percentage.toFixed(2),
          })
        : ''

    const inputDisabled =
      selectedAccount &&
      selectedAccount.config.symbol === 'SOL' &&
      selectedAccount.uiBalance.toString() === inputAmount


    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.Header>
          <ElementTitle noMarginBottom>{t('deposit-funds')}</ElementTitle>
        </Modal.Header>
        {!true ? (
          <div className="mb-4 mt-2 text-center text-xs text-th-fgd-3">
            {t('first-deposit-desc')}
          </div>
        ) : null}
        {tokenSymbol && false ? (
          <div className="mb-4">
            <InlineNotification
              desc={t('deposit-help', { tokenSymbol: tokenSymbol })}
              title={t('no-address', { tokenSymbol: tokenSymbol })}
              type="error"
            />
          </div>
        ) : null}
        {repayAmount && selectedAccount?.uiBalance < parseFloat(repayAmount) ? (
          <div className="mb-4">
            <InlineNotification
              desc={t('deposit-before', {
                tokenSymbol: tokenSymbol,
              })}
              title={t('not-enough-balance')}
              type="warning"
            />
          </div>
        ) : null}
       

        {isInvestinDelegate ? (
          <div className="mb-4">
            <InlineNotification
              title={t('deposit-investin-delegate')}
              type="error"
            />
          </div>
        ) : null}
        <AccountSelect
          accounts={walletTokens}
          selectedAccount={selectedAccount}
          onSelectAccount={handleAccountSelect}
        />
        <Label className={`mt-4`}>{t('amount')}</Label>
        <Input
          type="number"
          min="0"
          placeholder="0.00"
          error={!!invalidAmountMessage}
          onBlur={(e) => validateAmountInput(e.target.value)}
          value={inputAmount || ''}
          onChange={(e) => onChangeAmountInput(e.target.value)}
          suffix={selectedAccount?.config.symbol}
        />
        {invalidAmountMessage ? (
          <div className="flex items-center pt-1.5 text-th-red">
            <ExclamationCircleIcon className="mr-1.5 h-4 w-4" />
            {invalidAmountMessage}
          </div>
        ) : null}
        <div className="pt-1">
          <ButtonGroup
            activeValue={depositPercentage}
            onChange={(v) => onChangeAmountButtons(v)}
            unit="%"
            values={['25', '50', '75', '100']}
          />
        </div>
        {selectedAccount?.config.symbol === 'SOL' &&
        parseFloat(inputAmount) > selectedAccount?.uiBalance - 0.01 ? (
          <div className="-mb-4 mt-1 text-center text-xs text-th-red">
            {t('you-must-leave-enough-sol')}
          </div>
        ) : null}
        {repayAmount ? (
          <div className="pt-3">
            <InlineNotification desc={repayMessage} type="info" />
          </div>
        ) : null}
        <div className={`flex justify-center pt-6`}>
          <Button
            onClick={handleDeposit}
            className="w-full"
            disabled={submitting || inputDisabled || isInvestinDelegate}
          >
            <div className={`flex items-center justify-center`}>
              {submitting ? <Loading className="-ml-1 mr-3" /> : null}
              {t('deposit')}
            </div>
          </Button>
        </div>
        {!repayAmount ? (
          <div className="pt-3">
            <InlineNotification desc={t('interest-info')} type="info" />
          </div>
        ) : null}
      </Modal>
    )
 }

export default React.memo(DepositModal)
