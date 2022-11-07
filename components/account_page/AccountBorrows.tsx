import { useCallback, useEffect, useState } from 'react'
import {
  getTokenBySymbol,
  ZERO_I80F48,
  I80F48,
  PublicKey,
} from '@blockworks-foundation/mango-client'
import { SolendMarket } from '../../solend-sdk/dist/classes/market'
import useMangoStore from '../../stores/useMangoStore'
import {
  formatUsdValue,
  i80f48ToPercent,
  tokenPrecision,
} from '../../utils/index'
import WithdrawModal from '../WithdrawModal'
import Button from '../Button'
import DepositModal from '../DepositModal'
import { useViewport } from '../../hooks/useViewport'
import { breakpoints } from '../TradePageGrid'
import { Table, Td, Th, TrBody, TrHead } from '../TableElements'
import { ExpandableRow } from '../TableElements'
import MobileTableHeader from '../mobile/MobileTableHeader'
import { useTranslation } from 'next-i18next'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'


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
    },
    {
      "name": "DAI",
      "symbol": "DAI",
      "decimals": 8,
      "mintAddress": "GkwFTuAEqDG1seWeSy1htLpkaSjMdqhuMSEvwWjDB4xX"
    },
    {
      "name": "USDH",
      "symbol": "USDH",
      "decimals": 6,
      "mintAddress": "USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"
    },
    {
      "name": "PAI",
      "symbol": "PAI",
      "decimals": 6,
      "mintAddress": "Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"
    },
    {
      "name": "USDT",
      "symbol": "USDT",
      "decimals": 6,
      "mintAddress": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
    },
    {
      "name": "UXD",
      "symbol": "UXD",
      "decimals": 6,
      "mintAddress": "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"
    },
    {
      "name": "xUSD",
      "symbol": "xUSD",
      "decimals": 6,
      "mintAddress": "83LGLCm7QKpYZbX8q4W2kYWbtt8NJBwbVwEepzkVnJ9y"
    },
    {
      "name": "USH",
      "symbol": "USH",
      "decimals": 9,
      "mintAddress": "9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6"
    },

    {
      "symbol": "mSOL",
      "liquidityToken":{
      "decimals": 9,
      "assetPriceUSD": 30,
      "mint":"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"},
      "decimals": 9,
      "assetPriceUSD": 30,
      "mint":"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "mintAddress":"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
      "address": "EK2sfhsJHxiocDFiQjjs3PEeYEfWnKz9aecUNUU5RToK",
      "collateralMintAddress": "kNTu9qaduuVRoMtFjW4WMxUheXdn8CtbuKHSBjH6c1R",
      "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
      "collateralSupplyAddress": "2YRjoZpJ2wJPiBWJTvhuVsMhKEwK4QAdPHiJ4a4JGxgt",
      "liquidityAddress": "J1bWjHAakCBHmJDANw43fvDh54DZij8WAoN2U1uMpZpU",
      "liquidityFeeReceiverAddress": "J1bWjHAakCBHmJDANw43fvDh54DZij8WAoN2U1uMpZpU",
      "userSupplyCap": 2500,
      "reserveSupplyCap": 300000
    },
    {
      "symbol": "stSOL",
      "liquidityToken":{
      "decimals": 9,
      "assetPriceUSD": 30,
      "mint":"7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
      },"address": "GHWkPz95iZKuEnPKd65jkoYqS1XuFNcYsUiDFckmtsb6",
      "decimals": 9,
      "assetPriceUSD": 30,
      "mint":"7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      "mintAddress":"7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
      "collateralMintAddress": "Fw7VM48KVqBQPd3nhHNAzyugJe4NCvGYjtes27rHaEMm",
      "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
      "collateralSupplyAddress": "HEo8ZsRmUk8Pvp1EmrFaDfhQgoS5PM9gRwUwqzPka5GC",
      "liquidityAddress": "BJoj4X68dEZQsovwGZAeWSj2bWwPaviTHPF3vbqjkbdt",
      "liquidityFeeReceiverAddress": "BJoj4X68dEZQsovwGZAeWSj2bWwPaviTHPF3vbqjkbdt",
      "userSupplyCap": 2500,
      "reserveSupplyCap": 300000
    }, {
      "symbol": "UST",              "liquidityToken":{
        "decimals": 6,
        "assetPriceUSD": 30,
        "mint":"9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"
        },
        "decimals": 6,
        "assetPriceUSD": 30,
        "mint":"9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
        "mintAddress":"9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
      "address": "B4hF3TrvHrQ1yzy8gaCEnB3ijsZAe2dJbNtqbeFHpdpb",
      "collateralMintAddress": "rwu4w4BmRoh9hhpWfEBYh77vSLsAKYdc1PRCaUGAFXw",
      "collateralSupplyAddress": "ZFVnCyRTxoYMraRkfWM32ww5vbgZTZ8JWcGgCrurN2k",
      "liquidityAddress": "DwgeopDtQqsWHSbTXkMgYGDHFcP3QnAVrceqWrcgmkf8",
      "liquidityFeeReceiverAddress": "4oJvRUhGcMRphYgAVtmJho3ZJsK8TB2tncZgyZ1MwcpE",
      "userSupplyCap": 10000,
      "reserveSupplyCap": 1000000
    },
    {
      "symbol": "MNGO",              "liquidityToken":{
        "decimals": 6,
        "assetPriceUSD": 0.005,
        "mint":"MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"
        },
        "decimals": 6,
        "assetPriceUSD": 0.005,
        "mint":"MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
        "mintAddress":"MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
      "address": "3XLkmrdFQKAt9AXKvfTzc5mdgqTELoEEwEMC4eBFMG4t",
      "collateralMintAddress": "H7mqRRMvCMawBwMqYG2LJQr61BfNvp1z8aRmU712d9s8",
      "collateralSupplyAddress": "4tFeBTUmJ8B8ocQkTMRQ1VTrrgfMHUDzCyf9VWhh8xMP",
      "liquidityAddress": "Byj26aH5SFa8zUsSaKVaR78z6guQx6becBKSihxubN4u",
      "liquidityFeeReceiverAddress": "3C2c4ZkwPgJtgEzavDnxFrSuZ9mVuUMLFQfFMaBG5dnu",
      "userSupplyCap": 2500,
      "reserveSupplyCap": 300000
    }
  ],
  "markets": [
    {  "symbols": ["SOL", "USDC", "COPE", "DAI","USDH","PAI","USDT","UXD","xUSD","USH", "MSOL", "STSOL", "UST", "MNGO"],

      "name": "main",
      "address": "F8dCQofhBuspm1sVsrfr8NReJvGn1JfiR9xARnUBQgo1",
      "authorityAddress": "HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV",
      "reserves": [
        {
          "asset": "SOL",
          "liquidityToken":{
          "mint": "So11111111111111111111111111111111111111112",
          "decimals": 9,
          "assetPriceUSD": 30},
          "mint": "So11111111111111111111111111111111111111112",
          "decimals": 9,
          "assetPriceUSD": 30,
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
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
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
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 0.05,
          "mint":"8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh"},
          "decimals": 6,
          "assetPriceUSD": 0.05,
          "mint":"8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh",
          "address": "CoQgPXDKkBo84K14uFbGqkNmXHjKLYXt6d4BvLY6LWpu",
          "collateralMintAddress": "EHSug7WuXkoPDaeF2Cog4mcZ6SKZ5iJ1rkXFoczrXWqL",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "4RjkXaYqrKX8pd5t9RvPt4UmhyzuXjKT25ysXWQD2V56",
          "liquidityAddress": "6q7eZ2XBkgrwRpWnaVct6aRTKV9zmiGgXYuCQs4BQsjh",
          "liquidityFeeReceiverAddress": "47AV9KQgT8MxFrBnQC5uGK56NLQRMZPgze4G4i4sgGzJ",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "DAI",
          "liquidityToken":{
          "decimals": 8,
          "assetPriceUSD": 1,
          "mint":"EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o"},
          "decimals": 8,
          "assetPriceUSD": 1,
          "mint":"EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o",
          "address": "GkwFTuAEqDG1seWeSy1htLpkaSjMdqhuMSEvwWjDB4xX",
          "collateralMintAddress": "J4vUxcsHkoWudqWhooDxzx9aoHrXtZ73qj9DtQSqqwwS",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "4dKHbXHDc13XpstSPo9chs3vvXQxjbtYb97ueppgA4JG",
          "liquidityAddress": "5rpiCSbB2eNb9v2JZj8dxKSgE3gQWguB3uigtG6W8cCq",
          "liquidityFeeReceiverAddress": "5rpiCSbB2eNb9v2JZj8dxKSgE3gQWguB3uigtG6W8cCq",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "USDH",
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
          "address": "78w9qRtdCQ6zWNUGnZxk6p36sdzuutHCtMQCJM4bKyAW",
          "collateralMintAddress": "EESxsxPQzzPLw33FcKq5saQAt1y65FDSsKfJA6R4JDyk",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "4CTXun1cgPYmb2WigPZB5YBtFGzCnaC4L3CSqqmYD8L8",
          "liquidityAddress": "5D3wK5tHv6j93ptawdYuGYhpxgjtagbLnhBWqrV57DRw",
          "liquidityFeeReceiverAddress": "EbEa9dr2seUxpgYuCCmWdopnkhboMHJ1ubPEen6H23ez",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "PAI",
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
          "address": "DHP6TaqV9kafmg3ooqbvWPwzeMvtwphTzFShnjBNzRsp",
          "collateralMintAddress": "EUiemqKoJEUxTr4wtBZdqkBCWwk8qutKpprUDVSDFbbr",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "6uWfWV8kZUPDjLVAxDoAomVXrasykgwgRXZRJhWZBdBH",
          "liquidityAddress": "6X3mfHU9FiimfF1VinUS2g1mX9LBvgywi5fRtLqnno85",
          "liquidityFeeReceiverAddress": "6X3mfHU9FiimfF1VinUS2g1mX9LBvgywi5fRtLqnno85",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "USDT",
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
          "address": "5EmzXiKYz3skJS3PSzj9BScdbxQ8huH3CfV6f68LUZGk",
          "collateralMintAddress": "4kKNXxKRx2EdDnRU4beS9JBnuD5cMTL1BQ8WK2iZVoeu",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "9UfnnuvLd13yw7vvCR5r3EW7Pbgkam1eR87fDkfSQ383",
          "liquidityAddress": "8PckZa5Yz2tR4zK7vyzqBC6pehHzfUipdGPP9ggwQasP",
          "liquidityFeeReceiverAddress": "8PckZa5Yz2tR4zK7vyzqBC6pehHzfUipdGPP9ggwQasP",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "UXD",
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT",
          "address": "9kB2wr3bKEb5ahMKZNLXPPod5zw3TKYj6BxMPC7SPWpR",
          "collateralMintAddress": "DhjKo3rteKS8W2BxbdwiofRZpaSQynTt7k5zu4jYv8Fo",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "2Ent5MByfvbGCKpksQwvXG1ugwJripceDMTAuUWkqmhp",
          "liquidityAddress": "6v4MfzUcNE7U4jWdZigXAyAMpf8kjfLPhpzRAQJHEkFN",
          "liquidityFeeReceiverAddress": "6v4MfzUcNE7U4jWdZigXAyAMpf8kjfLPhpzRAQJHEkFN",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "xUSD",
          "liquidityToken":{
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"83LGLCm7QKpYZbX8q4W2kYWbtt8NJBwbVwEepzkVnJ9y"},
          "decimals": 6,
          "assetPriceUSD": 1,
          "mint":"83LGLCm7QKpYZbX8q4W2kYWbtt8NJBwbVwEepzkVnJ9y",
          "address": "BaTPg1VNoxK86wDZCWfMMdohQH1tdMx326sS2eswZNhb",
          "collateralMintAddress": "5UtPVrTGZN2qc5vLeMPXthVxQuEjqkvW15NHSqtPhPX5",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "GsChWtokr1uVAESEMozAhMWwG2oMuv1HrfXSS1kTy8YN",
          "liquidityAddress": "53goDCNsdDcKADfy2EQRfiY3C9jewoMz5te3tw2TgfXV",
          "liquidityFeeReceiverAddress": "53goDCNsdDcKADfy2EQRfiY3C9jewoMz5te3tw2TgfXV",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "USH",
          "liquidityToken":{
          "decimals": 9,
          "assetPriceUSD": 1,
          "mint":"9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6"
          },"address": "5MRaCd2mVqgT67sTBzRTUZChgCESot51zdApWCpAeb7h",
          "decimals": 9,
          "assetPriceUSD": 1,
          "mint":"9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6",
          "collateralMintAddress": "HYdzX8u6GUE2JrnBxpLocquPRmkZbr5UDAmax2orU65c",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "2FFQZiYsqDxHHEZJxu2b7tQa3mgrnftUVaPj97RFpgeq",
          "liquidityAddress": "Ck92WGWDJWWSUZRMxEpvMinF3UG7FfKDDroeSAYkeFfi",
          "liquidityFeeReceiverAddress": "Ck92WGWDJWWSUZRMxEpvMinF3UG7FfKDDroeSAYkeFfi",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
  
        {
          "asset": "mSOL",
          "liquidityToken":{
          "decimals": 9,
          "assetPriceUSD": 30,
          "mint":"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"},
          "decimals": 9,
          "assetPriceUSD": 30,
          "mint":"mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
          "address": "EK2sfhsJHxiocDFiQjjs3PEeYEfWnKz9aecUNUU5RToK",
          "collateralMintAddress": "kNTu9qaduuVRoMtFjW4WMxUheXdn8CtbuKHSBjH6c1R",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "2YRjoZpJ2wJPiBWJTvhuVsMhKEwK4QAdPHiJ4a4JGxgt",
          "liquidityAddress": "J1bWjHAakCBHmJDANw43fvDh54DZij8WAoN2U1uMpZpU",
          "liquidityFeeReceiverAddress": "J1bWjHAakCBHmJDANw43fvDh54DZij8WAoN2U1uMpZpU",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        },
        {
          "asset": "stSOL",
          "liquidityToken":{
          "decimals": 9,
          "assetPriceUSD": 30,
          "mint":"7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
          },"address": "GHWkPz95iZKuEnPKd65jkoYqS1XuFNcYsUiDFckmtsb6",
          "decimals": 9,
          "assetPriceUSD": 30,
          "mint":"7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj",
          "collateralMintAddress": "Fw7VM48KVqBQPd3nhHNAzyugJe4NCvGYjtes27rHaEMm",
          "jareMint": "kALzvjmLZSWMJMQj1bgdKT9hb3VLCKbnZ8uiPyjU4FJ",
          "collateralSupplyAddress": "HEo8ZsRmUk8Pvp1EmrFaDfhQgoS5PM9gRwUwqzPka5GC",
          "liquidityAddress": "BJoj4X68dEZQsovwGZAeWSj2bWwPaviTHPF3vbqjkbdt",
          "liquidityFeeReceiverAddress": "BJoj4X68dEZQsovwGZAeWSj2bWwPaviTHPF3vbqjkbdt",
          "userSupplyCap": 2500,
          "reserveSupplyCap": 300000
        }, {
          "asset": "UST",              "liquidityToken":{
            "decimals": 6,
            "assetPriceUSD": 30,
            "mint":"9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i"
            },
            "decimals": 6,
            "assetPriceUSD": 30,
            "mint":"9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
          "address": "B4hF3TrvHrQ1yzy8gaCEnB3ijsZAe2dJbNtqbeFHpdpb",
          "collateralMintAddress": "rwu4w4BmRoh9hhpWfEBYh77vSLsAKYdc1PRCaUGAFXw",
          "collateralSupplyAddress": "ZFVnCyRTxoYMraRkfWM32ww5vbgZTZ8JWcGgCrurN2k",
          "liquidityAddress": "DwgeopDtQqsWHSbTXkMgYGDHFcP3QnAVrceqWrcgmkf8",
          "liquidityFeeReceiverAddress": "4oJvRUhGcMRphYgAVtmJho3ZJsK8TB2tncZgyZ1MwcpE",
          "userSupplyCap": 10000,
          "reserveSupplyCap": 1000000
        },
        {
          "asset": "MNGO",              "liquidityToken":{
            "decimals": 6,
            "assetPriceUSD": 0.005,
            "mint":"MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac"
            },
            "decimals": 6,
            "assetPriceUSD": 0.005,
            "mint":"MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac",
          "address": "3XLkmrdFQKAt9AXKvfTzc5mdgqTELoEEwEMC4eBFMG4t",
          "collateralMintAddress": "H7mqRRMvCMawBwMqYG2LJQr61BfNvp1z8aRmU712d9s8",
          "collateralSupplyAddress": "4tFeBTUmJ8B8ocQkTMRQ1VTrrgfMHUDzCyf9VWhh8xMP",
          "liquidityAddress": "Byj26aH5SFa8zUsSaKVaR78z6guQx6becBKSihxubN4u",
          "liquidityFeeReceiverAddress": "3C2c4ZkwPgJtgEzavDnxFrSuZ9mVuUMLFQfFMaBG5dnu",
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
export default function AccountBorrows() {
  const { t } = useTranslation('common')
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const mangoCache = useMangoStore((s) => s.selectedMangoGroup.cache)
  const mangoConfig = config;//useMangoStore((s) => s.selectedMangoGroup.config)
  const mangoAccount = useMangoStore((s) => s.selectedMangoAccount.current)
  const { publicKey, connected } = useWallet()
  const loadingMangoAccount = useMangoStore(
    (s) => s.selectedMangoAccount.initialLoad
  )
  const spotBalances = useMangoStore((s) => s.selectedMangoAccount.spotBalances)
const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/1_5YWfzLWXOo_Y_Dm0s89VTlD5T_RKHn")
  const [borrowSymbol, setBorrowSymbol] = useState('')
  const [smwb, setSmwb]: any = useState({})

  const [depositToSettle, setDepositToSettle] = useState({symbol: 'USDC', amount: 0})
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const { width } = useViewport()
  const isMobile = width ? width < breakpoints.sm : false
  const canWithdraw = true//publicKey && mangoAccount?.owner.equals(publicKey)
const [ someDeposits, setSomeDeposits ] : any  = useState({})
const [ aprs, setAprs ] : any  = useState({})

const [first, setFirst]  = useState(true)

setTimeout(async function(){
if (first){
  setFirst(false)
  const market = await SolendMarket.initialize(
    connection,
    "production", // optional environment argument
    mangoConfig.markets[0].address// optional market address (TURBO SOL). Defaults to 'Main' market
  );
      

 await market.loadReserves()
 let now = new Date().getTime() / 1000 / 60 / 60 / 24
 let then = 19272.125//19270.125// 19266.125
let taprs = aprs
let count = -1
for (var reserve of market.reserves){
  count++ 
  if (count > 2){
    then = 19270.125
  }
  if (count > 9){
    then = 19272.125
  }
  console.log((reserve.stats?.cTokenExchangeRate  as number - 1 ) * 100 )
  taprs[reserve.config.liquidityToken.mint] =((reserve.stats?.cTokenExchangeRate  as number - 1 ) * 100 * (365/(now - then))) 
}  
setAprs(taprs)
  mangoConfig.markets[0].reserves.map(async (token, i) => {
    try {
      let addy  = token.liquidityToken.mint as string
  
       console.log(addy)

  const pubkey =  ( await connection.getParsedTokenAccountsByOwner(new PublicKey("HECVhRpddhzhkn6n1vdiqhQe1Y65yjXuwb45jKspD1VV"), 
  {mint: new PublicKey((addy))})).value
  let amount = 0 
  for (var pk of pubkey){
    if (parseFloat(pk.account.data.parsed.info.tokenAmount.uiAmount ) > amount){
      amount = pk.account.data.parsed.info.tokenAmount.uiAmount 
    }
  }
  console.log(amount)
  let tsd = someDeposits 
  tsd[token.liquidityToken.mint] = amount
  setSomeDeposits(tsd)  

    } catch (err){
console.log(err)
     // setSomeDeposits([...someDeposits, 0])  

    }

  console.log(someDeposits)
  })
}
}, 0)

useEffect(() => {
  let smwbt: any =  smwb
        setTimeout(async function(){
for (var res of config.markets[0].reserves){ 
  console.log(res.collateralMintAddress)
  try {
           const userCollateralAccountAddress = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            new PublicKey(
              
            res.collateralMintAddress ),
            
            publicKey as PublicKey
          );
          console.log(userCollateralAccountAddress.toBase58())
          const amt = (await connection.getTokenAccountBalance(
            userCollateralAccountAddress
          )).value;
          console.log(amt)          // @ts-ignore

          smwbt[res.asset] =(parseFloat(amt.uiAmount)  )
          } catch (err){
           // console.log(err)
          }
         setSmwb(smwbt)
 console.log(smwbt)
          }
        })
}, [publicKey])
  const handleCloseWithdraw = useCallback(() => {
    setShowBorrowModal(false)
  }, [])

  const handleCloseDeposit = useCallback(() => {
    setShowDepositModal(false)
    setDepositToSettle({symbol: 'USDC', amount: 0})
  }, [])

  const handleShowBorrow = (symbol) => {
    setBorrowSymbol(symbol)
    setShowBorrowModal(true)
  }

  const handleShowDeposit = (symbol, amount) => {
    setDepositToSettle({ symbol: symbol, amount: amount })
    setShowDepositModal(true)
  }
setTimeout(async function(){})
  return (
    <>
      {mangoGroup && false ? (
        <>
          <h2 className="mb-0">{t('your-borrows')}</h2>
          {/* TODO: calculate LiabsVal without perp markets
        <div className="border border-th-red flex items-center justify-between p-2 rounded">
          <div className="pr-4 text-xs text-th-fgd-3">{t('total-borrow-value')}:</div>
          <span>
            {formatUsdValue(+mangoAccount?.getLiabsVal(mangoGroup, mangoCache))}
          </span>
        </div> */}
          <div className="flex flex-col pb-8 pt-4">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
                {spotBalances.find((b) => b?.borrows?.gt(ZERO_I80F48)) ? (
                  !isMobile ? (
                    <Table>
                      <thead>
                        <TrHead>
                          <Th>{t('asset')}</Th>
                          <Th>{t('balance')}</Th>
                          <Th>{t('value')}</Th>
                          <Th>{t('borrow-rate')} (APR)</Th>
                        </TrHead>
                      </thead>
                      <tbody>
                        {spotBalances
                          //.filter((assets) => assets?.borrows?.gt(ZERO_I80F48))
                          .map((asset, i) => {
                            const token = getTokenBySymbol(
                              // @ts-ignore
                              config,
                              asset.symbol
                            )
                            const tokenIndex = i
                            return (
                              <TrBody key={tokenIndex}>
                                <Td>
                                  <div className="flex items-center">
                                    <img
                                      alt=""
                                      width="20"
                                      height="20"
                                      src={`/assets/icons/${asset.symbol.toLowerCase()}.svg`}
                                      className={`mr-2.5`}
                                    />
                                    <div>{asset.symbol}</div>
                                  </div>
                                </Td>
                                <Td>{asset?.borrows?.toFixed()}</Td>
                                <Td>
                                  {asset?.borrows && mangoCache && mangoGroup
                                    ? formatUsdValue(
                                        asset?.borrows
                                          ?.mul(
                                            mangoGroup.getPrice(
                                              tokenIndex,
                                              mangoCache
                                            )
                                          )
                                          ?.toNumber()
                                      )
                                    : null}
                                </Td>
                                <Td>
                                  <span className={`text-th-red`}>
                                    {(
                                      // @ts-ignore
                                      mangoGroup 
                                        .getBorrowRate(tokenIndex)
                                        .toNumber() * 100
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </Td>
                                <Td>
                                  <div className={`flex justify-end`}>
                                    <Button
                                      onClick={() =>
                                        handleShowDeposit(
                                          asset.symbol,
                                          asset?.borrows?.toFixed()
                                        )
                                      }
                                      className="ml-3 h-8 pt-0 pb-0 pl-3 pr-3 text-xs"
                                      disabled={
                                        !connected 
                                      }
                                    >
                                      {t('repay')}
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleShowBorrow(asset.symbol)
                                      }
                                      className="ml-3 h-8 pt-0 pb-0 pl-3 pr-3 text-xs"
                                      disabled={
                                        !connected ||
                                        loadingMangoAccount ||
                                        !canWithdraw
                                      }
                                    >
                                      {t('borrow')}
                                    </Button>

                                  </div>
                                </Td>
                              </TrBody>
                            )
                          })}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="border-b border-th-bkg-3">
                      <MobileTableHeader
                        colOneHeader={t('asset')}
                        colTwoHeader={t('balance')}
                      />
                      {spotBalances
                        .filter((assets) => assets?.borrows?.gt(ZERO_I80F48))
                        .map((asset, i) => {
                          const token = getTokenBySymbol(
                            // @ts-ignore
                            mangoConfig,
                            asset.symbol
                          )
                          const tokenIndex = config.assets.find((res)=>res.mintAddress == token.mintKey.toBase58())
                          return (
                            <ExpandableRow
                              buttonTemplate={
                                <div className="text-fgd-1 flex w-full items-center justify-between">
                                  <div className="text-fgd-1 flex items-center">
                                    <img
                                      alt=""
                                      width="20"
                                      height="20"
                                      src={`/assets/icons/${asset.symbol.toLowerCase()}.svg`}
                                      className={`mr-2.5`}
                                    />

                                    {asset.symbol}
                                  </div>
                                  <div className="text-fgd-1 text-right">
                                    {asset?.borrows?.toFixed(
                                      tokenPrecision[asset.symbol]
                                    )}
                                  </div>
                                </div>
                              }
                              key={`${asset.symbol}${i}`}
                              panelTemplate={
                                <>
                                  <div className="grid grid-flow-row grid-cols-2 gap-4 pb-4">
                                    {asset?.borrows && mangoCache ? (
                                      <div className="text-left">
                                        <div className="pb-0.5 text-xs text-th-fgd-3">
                                          {t('value')}
                                        </div>
                                        {formatUsdValue(
                                          asset.borrows
                                            .mul(
                                              // @ts-ignore
                                              mangoGroup.getPrice(
                                                i,
                                                mangoCache
                                              )
                                            )
                                            .toNumber()
                                        )}
                                      </div>
                                    ) : null}
                                    <div className="text-left">
                                      <div className="pb-0.5 text-xs text-th-fgd-3">
                                        {t('borrow-rate')} (APR)
                                      </div>
                                      <span className={`text-th-red`}>
                                        {(
                                      // @ts-ignore
                                          mangoGroup
                                            .getBorrowRate(i)
                                            .toNumber() * 100
                                        ).toFixed(2)}
                                        %
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex space-x-4">
                                    <Button
                                      onClick={() =>
                                        handleShowDeposit(
                                          asset.symbol,
                                          asset?.borrows?.toFixed()
                                        )
                                      }
                                      className="h-8 w-full pt-0 pb-0 text-xs"
                                      disabled={
                                        !connected 
                                      }
                                    >
                                      {t('repay')}
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleShowBorrow(asset.symbol)
                                      }
                                      className="h-8 w-full pt-0 pb-0 text-xs"
                                      disabled={
                                        !connected ||
                                        loadingMangoAccount ||
                                        !canWithdraw
                                      }
                                    >
                                      {t('borrow') }- do not deposit sol yet doesn&apos;t work ;) https://streamable.com/504wez
                                    </Button>
                                  </div>
                                </>
                              }
                            />
                          )
                        })}
                    </div>
                  )
                ) : (
                  <div
                    className={`w-full rounded-md border border-th-bkg-3 py-6 text-center text-th-fgd-3`}
                  >
                    {t('no-borrows')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
      <h2 className="mb-0">{t('all-assets')}</h2>
      <div className="flex flex-col pb-2 pt-4">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full align-middle sm:px-6 lg:px-8">
            {!isMobile ? (
              <Table>
                <thead>
                  <TrHead>
                    <Th>{t('asset')}</Th>
                  
                    <Th>{t('deposit')} APR</Th>
                    {true ? <Th>{t('max-borrow')}</Th> : null}
                    <Th>{t('liquidity')}</Th>
                  </TrHead>
                </thead>
                <tbody>
                  {true &&
                    mangoConfig.assets.map((token, i) => {
                    
                      const tokenIndex = i
                                            return (
                        <TrBody key={`${token.symbol}${i}`}>
                          <Td>
                            <div className="flex items-center">
                              <img
                                alt=""
                                width="20"
                                height="20"
                                src={`/assets/icons/${token.symbol.toLowerCase()}.svg`}
                                className={`mr-2.5`}
                              />
                              <div>{token.symbol}</div>
                            </div>
                          </Td>
                          <Td>
                            {mangoGroup ? (
                              <span className={`text-th-green`}>
                               {aprs[token.mintAddress]? 
                               (aprs[token.mintAddress]).toFixed(2) : 0}%
                              </span>
                            ) : null}
                          </Td>
                          {true ? (
                            <Td>
                              {someDeposits[token.mintAddress]}
                            </Td>
                          ) : null}
                         
                       
                          {true ? (
                            <Td>
                              {smwb[token.symbol]}
                            </Td>
                          ) : null}
                         
                       
                          <Td>
                                  <div className={`flex justify-end`}>
                                    <Button
                                      onClick={() =>
                                        handleShowDeposit(
                                          token.symbol,
                                          0
                                        )
                                      }
                                      className="ml-3 h-8 pt-0 pb-0 pl-3 pr-3 text-xs"
                                      disabled={
                                        !connected 
                                      }
                                    >
                                      {t('deposit')}
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleShowBorrow(token.symbol)
                                      }
                                      className="ml-3 h-8 pt-0 pb-0 pl-3 pr-3 text-xs"
                                      disabled={
                                        !connected ||
                                        !canWithdraw
                                      }
                                    >
                                      {t('withdraw')}
                                    </Button>

                                  </div>
                                </Td>
                        </TrBody>
                      )
                    })}
                </tbody>
              </Table>
            ) : (
              <div className="border-b border-th-bkg-3">
                <MobileTableHeader
                  colOneHeader={t('asset')}
                  colTwoHeader={`${t('deposit')}/${t('borrow-rate')}`}
                />
                {mangoGroup &&
                  mangoCache &&
                  mangoConfig.assets.map((token, i) => {
                    const tokenIndex = i
                    return (
                      <ExpandableRow
                        buttonTemplate={
                          <div className="text-fgd-1 flex w-full items-center justify-between">
                            <div className="flex items-center">
                              <img
                                alt=""
                                width="20"
                                height="20"
                                src={`/assets/icons/${token.symbol.toLowerCase()}.svg`}
                                className={`mr-2.5`}
                              />

                              {token.symbol}
                            </div>
                            <div className="flex">
                              <span className="text-th-green">
                                {i80f48ToPercent(
                                  mangoGroup.getDepositRate(0)
                                ).toFixed(2)}
                                %
                              </span>
                              <span className="px-0.5 text-th-fgd-4">/</span>
                              <span className="text-th-red">
                              138
                                %
                              </span>
                            </div>
                          </div>
                        }
                        key={`${token.symbol}${i}`}
                        panelTemplate={
                          <div className="grid grid-flow-row grid-cols-2 gap-4">
                            <div className="text-left">
                              <div className="pb-0.5 text-xs text-th-fgd-3">
                                {t('price')}
                              </div>
                              {formatUsdValue(
                                mangoGroup
                                  .getPrice(tokenIndex, mangoCache)
                                  .toNumber()
                              )}
                            </div>
                            {true ? (
                              <div className="text-left">
                                <div className="pb-0.5 text-xs text-th-fgd-3">
                                  {t('max-borrow')}
                                </div>
                                {mangoAccount
                                  ? 99999999
                                      .toLocaleString(undefined, {
                                        minimumFractionDigits:
                                          tokenPrecision[token.symbol],
                                        maximumFractionDigits:
                                          tokenPrecision[token.symbol],
                                      })
                                  : null}
                              </div>
                            ) : null}
                            <div className="text-left">
                              <div className="pb-0.5 text-xs text-th-fgd-3">
                                {t('liquidity')}
                              </div>
                              {mangoGroup
                                .getUiTotalDeposit(0)
                                .sub(mangoGroup.getUiTotalBorrow(0))
                                .toNumber()
                                .toLocaleString(undefined, {
                                  minimumFractionDigits:
                                    tokenPrecision[token.symbol],
                                  maximumFractionDigits:
                                    tokenPrecision[token.symbol],
                                })}
                            </div>
                            <Button
                              onClick={() => handleShowBorrow(token.symbol)}
                              className="col-span-2 h-8 pt-0 pb-0 text-xs"
                              disabled={
                                !connected ||
                                loadingMangoAccount ||
                                !canWithdraw
                              }
                            >
                              {t('borrow')}
                            </Button>
                          </div>
                        }
                      />
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
      {showBorrowModal ? (
        <WithdrawModal
          isOpen={showBorrowModal}
          onClose={handleCloseWithdraw}
          tokenSymbol={borrowSymbol}
          smwb={smwb}
          title={t('borrow-withdraw')}
          borrow
        />
      ) : null}
      {showDepositModal ? (
       
        <DepositModal
          isOpen={showDepositModal}
          onClose={handleCloseDeposit}
          repayAmount={depositToSettle.amount.toString()}
          tokenSymbol={depositToSettle.symbol}
        />
      ) : null}
    </>
  )
}
