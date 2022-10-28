import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import Input, { Label } from './Input'
import { ElementTitle } from './styles'
import useMangoStore from '../stores/useMangoStore'
import { floorToDecimal, tokenPrecision } from '../utils/index'
import Loading from './Loading'
import Button, { LinkButton } from './Button'
import Switch from './Switch'
import Tooltip from './Tooltip'
import { connectionSelector } from 'stores/selectors'

import {
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/solid'
import Select from './Select'
import { withdraw } from '../utils/mango'
import {
  ZERO_I80F48,
  I80F48,
  MangoAccount,
  nativeI80F48ToUi,
  MarketMode,
} from '@blockworks-foundation/mango-client'
import { notify } from '../utils/notifications'
import { useTranslation } from 'next-i18next'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import MangoAccountSelect from './MangoAccountSelect'
import InlineNotification from './InlineNotification'

import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { depositReserveLiquidityInstruction ,redeemReserveCollateralInstruction,refreshReserveInstruction} from "../../solend-sdk/dist";
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
    {  "symbols": ["SOL", "USDC", "COPE"],

      "name": "main",
      "address": "F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1",
      "authorityAddress": "HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV",
      "reserves": [
        {
          "asset": "SOL",
          "mintAddress": "So11111111111111111111111111111111111111112",
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
          "mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
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
          "mintAddress": "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh",
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
interface WithdrawModalProps {
  onClose: () => void
  isOpen: boolean
  title?: string
  tokenSymbol?: string
  borrow?: boolean
}

const WithdrawModal: FunctionComponent<WithdrawModalProps> = ({
  isOpen,
  onClose,
  tokenSymbol = '',
  borrow = false,
  title,
}) => {
  const { t } = useTranslation('common')
  const [withdrawTokenSymbol, setWithdrawTokenSymbol] = useState(
    tokenSymbol || 'USDC'
  )
    const connection = useMangoStore(connectionSelector)
    const [smwb, setSmwb]: any = useState({})

  const [maxWithoutBorrows, setMaxWithoutBorrows] = useState(I80F48.fromNumber(0))
  const [inputAmount, setInputAmount] = useState('')
  const [invalidAmountMessage, setInvalidAmountMessage] = useState('')
  const [maxAmount, setMaxAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [includeBorrow, setIncludeBorrow] = useState(borrow)
  const [simulation, setSimulation] = useState<any | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)
  const { wallet } = useWallet()
  const actions = useMangoStore((s) => s.actions)
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const mangoAccount = useMangoStore((s) => s.selectedMangoAccount.current)
  const mangoAccounts = useMangoStore((s) => s.mangoAccounts)
  const mangoCache = useMangoStore((s) => s.selectedMangoGroup.cache)
  const mangoGroupConfig = useMangoStore((s) => s.selectedMangoGroup.config)
  const walletTokens = useMangoStore((s) => s.wallet.tokens)

  const [withdrawMangoAccount, setWithdrawMangoAccount] =
    useState<MangoAccount | null>(mangoAccount)

  const tokens = useMemo(() => mangoGroupConfig.tokens, [mangoGroupConfig])
  const token = useMemo(
    () => tokens.find((t) => t.symbol === withdrawTokenSymbol),
    [withdrawTokenSymbol, tokens]
  )
  const tokenIndex =
    mangoGroup && token ? mangoGroup.getTokenIndex(token.mintKey) : 0
  const marketMode =
    mangoGroup && token
      ? mangoGroup.tokens[tokenIndex].spotMarketMode
      : MarketMode.Default
  const isCloseOnly =
    marketMode == MarketMode.CloseOnly ||
    marketMode == MarketMode.ForceCloseOnly

  const initHealthRatio = useMemo(() => {
    if (mangoAccount && mangoGroup && mangoCache) {
      return mangoAccount
        .getHealthRatio(mangoGroup, mangoCache, 'Init')
        .toNumber()
    }
    return -1
  }, [mangoAccount])
useEffect(() => {
  setTimeout(async function(){
    if (!wallet ) return
        let smwbt: any =  smwb
        for (var res of config.markets[0].reserves){
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
          const amt = (await connection.getTokenAccountBalance(
            userCollateralAccountAddress
          )).value;
          console.log(amt)
          smwbt[res.asset] =(parseFloat(amt.amount) / 10 ** 6 )
      }   setSmwb(smwbt)
   })
}, [withdrawTokenSymbol])
  useEffect(() => {
    if (
      !mangoGroup ||
      !withdrawMangoAccount ||
      !withdrawTokenSymbol ||
      !mangoCache
    )
      return
      setTimeout(async function(){
        if (!wallet ) return
        let smwbt: any =  smwb
        for (var res of config.markets[0].reserves){
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
          const amt = (await connection.getTokenAccountBalance(
            userCollateralAccountAddress
          )).value;
          console.log(amt)
          smwbt[res.asset] =(parseFloat(amt.amount) / 10 ** 6 )
      }   setSmwb(smwbt)
       })
    const mintDecimals = mangoGroup.tokens[tokenIndex].decimals
    const tokenDeposits = withdrawMangoAccount.getUiDeposit(
      mangoCache.rootBankCache[tokenIndex],
      mangoGroup,
      tokenIndex
    )
    const tokenBorrows = withdrawMangoAccount.getUiBorrow(
      mangoCache.rootBankCache[tokenIndex],
      mangoGroup,
      tokenIndex
    )
    console.log(tokenSymbol)

    const maxWithBorrows = withdrawMangoAccount
    .getMaxWithBorrowForToken(mangoGroup, mangoCache, tokenIndex)
    .add(maxWithoutBorrows)
    .mul(I80F48.fromString('0.995')) // handle rounding errors when borrowing
    if (isCloseOnly) {
      setIncludeBorrow(false)
    }
    // get max withdraw amount
    let maxWithdraw = maxWithoutBorrows
    if (includeBorrow) {
      maxWithdraw = maxWithoutBorrows.gt(maxWithBorrows)
        ? maxWithoutBorrows
        : maxWithBorrows
    }

   
      setMaxAmount(0)
  
    // simulate change to deposits & borrow based on input amount
    const parsedInputAmount = inputAmount
      ? I80F48.fromString(inputAmount)
      : ZERO_I80F48
    let newDeposit = tokenDeposits.sub(parsedInputAmount)
    newDeposit = newDeposit.gt(ZERO_I80F48) ? newDeposit : ZERO_I80F48

    let newBorrow = parsedInputAmount.sub(tokenDeposits)
    newBorrow = newBorrow.gt(ZERO_I80F48) ? newBorrow : ZERO_I80F48
    newBorrow = newBorrow.add(tokenBorrows)

    // clone MangoAccount and arrays to not modify selectedMangoAccount
    // FIXME: MangoAccount needs type updated to accept null for pubKey
    // @ts-ignore
    const simulation = new MangoAccount(null, withdrawMangoAccount)
    simulation.deposits = [...withdrawMangoAccount.deposits]
    simulation.borrows = [...withdrawMangoAccount.borrows]

    // update with simulated values
    simulation.deposits[tokenIndex] = newDeposit
      .mul(I80F48.fromNumber(Math.pow(10, mintDecimals)))
      .div(mangoCache.rootBankCache[tokenIndex].depositIndex)
    simulation.borrows[tokenIndex] = newBorrow
      .mul(I80F48.fromNumber(Math.pow(10, mintDecimals)))
      .div(mangoCache.rootBankCache[tokenIndex].borrowIndex)

    const liabsVal = simulation
      .getLiabsVal(mangoGroup, mangoCache, 'Init')
      .toNumber()
    const equity = simulation.computeValue(mangoGroup, mangoCache).toNumber()
    const initHealthRatio = simulation
      .getHealthRatio(mangoGroup, mangoCache, 'Init')
      .toNumber()

    const maintHealthRatio = simulation
      .getHealthRatio(mangoGroup, mangoCache, 'Maint')
      .toNumber()

    const leverage = simulation.getLeverage(mangoGroup, mangoCache).toNumber()

    setSimulation({
      equity,
      initHealthRatio,
      leverage,
      liabsVal,
      maintHealthRatio,
    })
  }, [
    includeBorrow,
    inputAmount,
    tokenIndex,
    withdrawMangoAccount,
    mangoGroup,
    mangoCache,
  ])

  const handleWithdraw =  async () => {
    console.log(1)
    if ( !wallet) {
      return
    }
    setSubmitting(true)
console.log(withdrawTokenSymbol)

let res = config.markets[0].reserves.find(
  (r) => r.asset === withdrawTokenSymbol
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
    let tokenAccount = walletTokens.find(
      (a) => a.config.symbol === tokenSymbol
    )
   let transaction = new Transaction().add(
      redeemReserveCollateralInstruction(
        Number(inputAmount) * 10 ** 6,//    Math.floor(oos[res]  * 1000) / 1000,
        userCollateralAccountAddress,
        tokenAccount,
        // @ts-ignore
        new PublicKey(res.address),
        // @ts-ignore
        new PublicKey(res.collateralMintAddress),
        // @ts-ignore
        new PublicKey(res.liquidityAddress),
    
        new PublicKey(config.markets[0].address),   new PublicKey(config.markets[0].authorityAddress),
    
        wallet.adapter.publicKey as PublicKey, // obligationOwner
        new PublicKey(
          "E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa"
        )    ))
    
    transaction.recentBlockhash = await (
      await connection.getLatestBlockhash()
    ).blockhash;
  await wallet.adapter.sendTransaction(transaction, connection)
      .then((txid: string) => {
        setSubmitting(false)
        actions.fetchAllMangoAccounts(wallet)
        actions.fetchWalletTokens(wallet)
        notify({
          title: t('withdraw-success'),
          type: 'success',
          txid,
        })
        onClose()
      })
      .catch((err) => {
        setSubmitting(false)
        console.error('Error withdrawing:', err)
        notify({
          title: t('withdraw-error'),
          description: err.message,
          txid: err.txid,
          type: 'error',
        })
        onClose()
      })
  }

  const handleSetSelectedAsset = (symbol) => {
    setInputAmount('')
    setWithdrawTokenSymbol(symbol)
  }
  

  const getDepositsForSelectedAsset = (): I80F48 => {


    return smwb[withdrawTokenSymbol]
  }

  const getBorrowAmount = () => {
    const tokenBalance = getDepositsForSelectedAsset()
    const borrowAmount = I80F48.fromString(inputAmount).sub(tokenBalance)
    return borrowAmount.gt(ZERO_I80F48) ? borrowAmount : 0
  }

  const getAccountStatusColor = (
    health: number,
    isRisk?: boolean,
    isStatus?: boolean
  ) => {
    if (health < 15) {
      return isRisk ? (
        <div className="text-th-red">{t('high')}</div>
      ) : isStatus ? (
        'bg-th-red'
      ) : (
        'ring-th-red text-th-red'
      )
    } else if (health >= 15 && health < 50) {
      return isRisk ? (
        <div className="text-th-orange">{t('moderate')}</div>
      ) : isStatus ? (
        'bg-th-orange'
      ) : (
        'ring-th-orange text-th-orange'
      )
    } else {
      return isRisk ? (
        <div className="text-th-green">{t('low')}</div>
      ) : isStatus ? (
        'bg-th-green'
      ) : (
        'ring-th-green text-th-green'
      )
    }
  }

  const handleIncludeBorrowSwitch = (checked) => {
    setIncludeBorrow(checked)
    setInputAmount('')
    setInvalidAmountMessage('')
  }

  const onChangeAmountInput = (amount: string) => {
    setInputAmount(amount)
    setInvalidAmountMessage('')
  }

  const validateAmountInput = (amount) => {
    const parsedAmount = Number(amount)
   
  }

  useEffect(() => {
    if (simulation && simulation.initHealthRatio < 0 && includeBorrow) {
      setInvalidAmountMessage(t('leverage-too-high'))
    }
  }, [simulation])

  const getTokenBalances = () => {
    const mangoCache = useMangoStore.getState().selectedMangoGroup.cache
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current

    if (mangoGroup && mangoCache) {
      return tokens.map((token) => {
        const tokenIndex = mangoGroup.getTokenIndex(token.mintKey)
        return {
          symbol: token.symbol,
          balance: withdrawMangoAccount
            ?.getUiDeposit(
              mangoCache.rootBankCache[tokenIndex],
              mangoGroup,
              tokenIndex
            )
            ?.toFixed(tokenPrecision[token.symbol]),
        }

      
      })
    }
  }

  if (!withdrawTokenSymbol) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        {!showSimulation && mangoCache && mangoGroup ? (
          <>
            <Modal.Header>
              <ElementTitle noMarginBottom>
                {title ? title : t('withdraw-funds')}
              </ElementTitle>
            </Modal.Header>
            {initHealthRatio < 0 ? (
              <div className="pb-2">
                <InlineNotification type="error" desc={t('no-new-positions')} />
              </div>
            ) : null}
            {mangoAccounts.length > 1 ? (
              <div className="mb-4">
                <Label>{t('from-account')}</Label>
                <MangoAccountSelect
                  onChange={(v) => setWithdrawMangoAccount(v)}
                  value={withdrawMangoAccount}
                />
              </div>
            ) : null}
            <Label>{t('asset')}</Label>
            <Select
              value={
                withdrawTokenSymbol && withdrawMangoAccount ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <img
                        alt=""
                        width="20"
                        height="20"
                        src={`/assets/icons/${withdrawTokenSymbol.toLowerCase()}.svg`}
                        className={`mr-2.5`}
                      />
                      {withdrawTokenSymbol}
                    </div>
                    {Object.keys(smwb).length > 0 ? smwb[withdrawTokenSymbol]: 0}
                  </div>
                ) : (
                  <span className="text-th-fgd-4">{t('select-asset')}</span>
                )
              }
              onChange={(asset) => handleSetSelectedAsset(asset)}
            >
              {getTokenBalances()?.filter((bals) => config.markets[0].symbols.includes(bals.symbol)).map (({ symbol, balance }) => (
                <Select.Option key={symbol} value={symbol}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        alt=""
                        width="16"
                        height="16"
                        src={`/assets/icons/${symbol.toLowerCase()}.svg`}
                        className={`mr-2`}
                      />
                      <span>{symbol}</span>
                    </div>
                    {balance}
                  </div>
                </Select.Option>
              ))}
            </Select>
            {false ? (
              <div className="jusitfy-between mt-4 flex items-center rounded-md bg-th-bkg-3 p-2 text-th-fgd-1">
                <div className="text-fgd-1 flex items-center pr-4">
                  <span>{t('borrow-funds')}</span>
                  <Tooltip content={t('tooltip-interest-charged')}>
                    <InformationCircleIcon
                      className={`ml-2 h-5 w-5 cursor-help text-th-fgd-4`}
                    />
                  </Tooltip>
                </div>
                <Switch
                  checked={includeBorrow}
                  className="ml-auto"
                  onChange={(checked) => handleIncludeBorrowSwitch(checked)}
                />
              </div>
            ) : null}
            <div className="flex justify-between pt-4">
              <Label>{t('amount')}</Label>
              <LinkButton
                className="mb-1.5"
                onClick={() => setInputAmount(maxAmount.toString())}
              >
                {includeBorrow && false
                  ? t('max-with-borrow')
                  : t('max')}
              </LinkButton>
            </div>
            <div className="flex">
              <Input
                disabled={!withdrawTokenSymbol}
                type="number"
                min="0"
                error={!!invalidAmountMessage}
                placeholder="0.00"
                value={inputAmount}
                onChange={(e) => onChangeAmountInput(e.target.value)}
                suffix={withdrawTokenSymbol}
              />
            </div>
            {false ? (
              <div className="mt-4 space-y-2 bg-th-bkg-2 p-4">
                <div className="flex justify-between">
                  <p className="mb-0">{t('tooltip-projected-health')}</p>
                  <p
                    className={`mb-0 font-bold text-th-fgd-1 ${getAccountStatusColor(
                      simulation.maintHealthRatio
                    )}`}
                  >
                    {simulation.maintHealthRatio > 100
                      ? '>100'
                      : simulation.maintHealthRatio.toFixed(2)}
                    %
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="mb-0">{t('tooltip-projected-leverage')}</p>
                  <p
                    className={`mb-0 font-bold text-th-fgd-1 ${getAccountStatusColor(
                      simulation.maintHealthRatio
                    )}`}
                  >
                    {simulation.leverage.toFixed(2)}x
                  </p>
                </div>
              </div>
            ) : null}
            {invalidAmountMessage ? (
              <div className="flex items-center pt-1.5 text-th-red">
                <ExclamationCircleIcon className="mr-1.5 h-4 w-4" />
                {invalidAmountMessage}
              </div>
            ) : null}
            <div className={`flex justify-center pt-6`}>
              <Button
                onClick={() => setShowSimulation(true)}
                disabled={
                  !inputAmount ||
                  Number(inputAmount) <= 0 ||
                  !!invalidAmountMessage ||
                  initHealthRatio < 0
                }
                className="w-full"
              >
                {t('next')}
              </Button>
            </div>
          </>
        ) : null}
        {showSimulation && simulation ? (
          <>
            <Modal.Header>
              <ElementTitle noMarginBottom>
                {t('confirm-withdraw')}
              </ElementTitle>
            </Modal.Header>
            {simulation.initHealthRatio < 0 ? (
              <div className="pb-2">
                <InlineNotification type="error" desc={t('prices-changed')} />
              </div>
            ) : null}
            <div className="rounded-lg bg-th-bkg-1 p-4 text-center text-th-fgd-1">
              <div className="pb-1 text-th-fgd-3">{t('about-to-withdraw')}</div>
              <div className="flex items-center justify-center">
                <div className="relative text-xl font-semibold">
                  {Number(inputAmount).toLocaleString(undefined, {
                    maximumFractionDigits: token?.decimals,
                  })}
                  <span className="absolute bottom-0.5 ml-1.5 text-xs font-normal text-th-fgd-4">
                   c{withdrawTokenSymbol}
                  </span>
                </div>
              </div>
              {false ? (
                <div className="pt-2 text-th-fgd-4">{`${t(
                  'includes-borrow'
                )} ~${smwb[withdrawTokenSymbol].toFixed(
                  mangoGroup?.tokens[tokenIndex].decimals
                )} ${withdrawTokenSymbol}`}</div>
              ) : null}
            </div>
            <div className={`mt-6 flex flex-col items-center`}>
              <Button
                onClick={handleWithdraw}
                disabled={
                  Number(inputAmount) <= 0 ||
                  simulation.initHealthRatio < 0 ||
                  submitting
                }
                className="w-full"
              >
                <div className={`flex items-center justify-center`}>
                  {submitting && <Loading className="-ml-1 mr-3" />}
                  {t('withdraw')}
                </div>
              </Button>
              <LinkButton
                className="mt-4"
                onClick={() => setShowSimulation(false)}
              >
                {t('cancel')}
              </LinkButton>
            </div>
          </>
        ) : null}
      </>
    </Modal>
  )
}

export default React.memo(WithdrawModal)
