import { useMemo, useState } from 'react'
import { Listbox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { abbreviateAddress } from '../utils'
import useMangoStore, { WalletToken } from '../stores/useMangoStore'
import { RefreshClockwiseIcon } from './icons'
import { useTranslation } from 'next-i18next'
import { LinkButton } from './Button'
import { Label } from './Input'
import { useWallet } from '@solana/wallet-adapter-react'
import { config } from 'process'


let jconfig = 
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
type AccountSelectProps = {
  accounts: WalletToken[]
  selectedAccount: WalletToken
  onSelectAccount: (WalletToken) => any
  hideAddress?: boolean
}

const AccountSelect = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  hideAddress = false,
}: AccountSelectProps) => {
  const { wallet } = useWallet()
  const { t } = useTranslation('common')
  const groupConfig = useMangoStore((s) => s.selectedMangoGroup.config)
  const tokenSymbols = useMemo(
    () => groupConfig?.tokens.map((t) => t.symbol),
    [groupConfig]
  )
  const missingTokenSymbols = useMemo(() => {
    const symbolsForAccounts = accounts.map((a) => a.config.symbol)
    return tokenSymbols?.filter((sym) => !symbolsForAccounts.includes(sym))
  }, [accounts, tokenSymbols])

  const actions = useMangoStore((s) => s.actions)
  const [loading, setLoading] = useState(false)

  const handleChange = (value: string) => {
    const newAccount = accounts.find(
      (a) => a.account.publicKey.toBase58() === value
    )
    onSelectAccount(newAccount)
  }

  const handleRefreshBalances = async () => {
    if (!wallet) return
    setLoading(true)
    await actions.fetchWalletTokens(wallet)
    setLoading(false)
  }

  return (
    <div className={`relative inline-block w-full`}>
      <div className="flex justify-between">
        <Label>{t('asset')}</Label>
        {missingTokenSymbols && missingTokenSymbols.length > 0 ? (
          <LinkButton className="mb-1.5 ml-2" onClick={handleRefreshBalances}>
            <div className="flex items-center">
              <RefreshClockwiseIcon
                className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {t('refresh')}
            </div>
          </LinkButton>
        ) : null}
      </div>
      <Listbox
        value={selectedAccount?.account.publicKey.toBase58()}
        onChange={handleChange}
      >
        {({ open }) => (
          <div className="relative">
            <div className="flex items-center">
              <Listbox.Button
                className={`default-transition w-full rounded-md border border-th-bkg-4 bg-th-bkg-1 p-2 font-normal hover:border-th-fgd-4 focus:border-th-fgd-4 focus:outline-none`}
              >
                <div
                  className={`flex items-center justify-between text-th-fgd-1`}
                >
                  {selectedAccount ? (
                    <div className={`flex flex-grow items-center`}>
                      <img
                        alt=""
                        width="20"
                        height="20"
                        src={`/assets/icons/${selectedAccount.config.symbol.toLowerCase()}.svg`}
                        className={`mr-2`}
                      />
                      <div className="text-left">
                        {selectedAccount.config.symbol}
                        {!hideAddress ? (
                          <div className="text-xs text-th-fgd-4">
                            {abbreviateAddress(
                              selectedAccount.account.publicKey
                            )}
                          </div>
                        ) : null}
                      </div>
                      <div className={`ml-4 flex-grow text-right`}>
                        {selectedAccount.uiBalance}
                      </div>
                    </div>
                  ) : (
                    t('select-asset')
                  )}
                  <ChevronDownIcon
                    className={`default-transition ml-2 h-5 w-5 text-th-fgd-1 ${
                      open ? 'rotate-180 transform' : 'rotate-360 transform'
                    }`}
                  />
                </div>
              </Listbox.Button>
            </div>
            <Listbox.Options
              className={`thin-scroll absolute right-0 top-14 z-20 max-h-60 w-full overflow-auto rounded-md bg-th-bkg-2 p-1`}
            >
              {accounts.filter((sym) => sym.uiBalance > 0).filter((sym) => jconfig.markets[0].reserves.find((reserve) => reserve.asset==sym.config.symbol) ) .map((account) => {
                const symbolForAccount = account.config.symbol

                return (
                  <Listbox.Option
                    className="mb-0"
                    disabled={account.uiBalance === 0}
                    key={account?.account.publicKey.toBase58()}
                    value={account?.account.publicKey.toBase58()}
                  >
                    {({ disabled, selected }) => (
                      <div
                        className={`default-transition rounded p-2 text-th-fgd-1 ${
                          selected && `text-th-primary`
                        } ${
                          disabled
                            ? 'text-th-fgd-1 opacity-50 hover:cursor-not-allowed hover:text-th-fgd-1'
                            : 'hover:cursor-pointer hover:bg-th-bkg-3 hover:text-th-primary'
                        }`}
                      >
                        <div className={`flex items-center`}>
                          <img
                            alt=""
                            width="16"
                            height="16"
                            src={`/assets/icons/${symbolForAccount.toLowerCase()}.svg`}
                            className="mr-2"
                          />
                          <div className={`flex-grow text-left`}>
                            {symbolForAccount}
                            {!hideAddress ? (
                              <div className="text-xs text-th-fgd-4">
                                {abbreviateAddress(account.account.publicKey)}
                              </div>
                            ) : null}
                          </div>
                          {!hideAddress ? (
                            <div className={`text-sm`}>
                              {account.uiBalance} {symbolForAccount}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </Listbox.Option>
                )
              })}
             
            </Listbox.Options>
          </div>
        )}
      </Listbox>
    </div>
  )
}

export default AccountSelect
