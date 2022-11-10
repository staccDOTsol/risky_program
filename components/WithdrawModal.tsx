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

import { depositReserveLiquidityInstruction ,redeemReserveCollateralInstruction,refreshReserveInstruction} from "@solendprotocol/solend-sdk/dist";
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
    },
    {
      "name": "DAI",
      "symbol": "DAI",
      "decimals": 8,
      "mintAddress": "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o"
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
interface WithdrawModalProps {
  onClose: () => void
  isOpen: boolean
  title?: string
  smwb?: {}
  tokenSymbol?: string
  borrow?: boolean
}

const WithdrawModal: FunctionComponent<WithdrawModalProps> = ({
  isOpen,
  onClose,
  tokenSymbol = '',
  borrow = false,
  smwb = {},
  title,
}) => {
  const { t } = useTranslation('common')
  const [withdrawTokenSymbol, setWithdrawTokenSymbol] = useState(
    tokenSymbol || 'USDC'
  )
    const connection  = useMangoStore(connectionSelector)

  const [maxWithoutBorrows, setMaxWithoutBorrows] = useState(I80F48.fromNumber(0))
  const [inputAmount, setInputAmount] = useState('')
  const [invalidAmountMessage, setInvalidAmountMessage] = useState('')
  const [maxAmount, setMaxAmount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [includeBorrow, setIncludeBorrow] = useState(borrow)
  const [showSimulation, setShowSimulation] = useState(false)
  const { wallet } = useWallet()
  const actions = useMangoStore((s) => s.actions)
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current)
  const mangoAccount = useMangoStore((s) => s.selectedMangoAccount.current)
  const mangoAccounts = useMangoStore((s) => s.mangoAccounts)
  const mangoCache = useMangoStore((s) => s.selectedMangoGroup.cache)
  const mangoGroupConfig = useMangoStore((s) => s.selectedMangoGroup.config)
  const walletTokens = useMangoStore((s) => s.wallet.tokens)

  const [withdrawMangoAccount, setwithdrawMangoAccount] =
    useState<MangoAccount | null>(mangoAccount)

  const tokens = useMemo(() => mangoGroupConfig.tokens, [mangoGroupConfig])
  const token = useMemo(
    () => tokens.find((t) => t.symbol === withdrawTokenSymbol),
    [withdrawTokenSymbol, tokens]
  )
  const initHealthRatio = 99999999

  const tokenIndex =
    mangoGroup && token ? mangoGroup.getTokenIndex(token.mintKey) : 0
   useEffect(()=> {
    
    setMaxAmount((smwb[tokenSymbol]))
   }
   , [token])
  

    // clone MangoAccount and arrays to not modify selectedMangoAccount
    // FIXME: MangoAccount needs type updated to accept null for pubKey
    // @ts-ignore
    const simulation = new MangoAccount(null, withdrawMangoAccount)
    //.getHealthRatio(mangoGroup, mangoCache, 'Maint')
   // .toNumber()

    const maintHealthRatio = 88888888// simulation
      //.getHealthRatio(mangoGroup, mangoCache, 'Maint')
     // .toNumber()

    const leverage = 0//simulation.getLeverage(mangoGroup, mangoCache).toNumber()

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
        tokenAccount.account.pubkey,        // @ts-ignore
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
    console.log(
      Number(inputAmount) * 10 ** 6,//    Math.floor(oos[res]  * 1000) / 1000,
      userCollateralAccountAddress,
      tokenAccount.account.pubkey,
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
      )    )
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


  const getTokenBalances = () => {
    const mangoCache = useMangoStore.getState().selectedMangoGroup.cache
    const mangoGroup = useMangoStore.getState().selectedMangoGroup.current

    if (mangoGroup && mangoCache) {
      return tokens.map((token) => {
        return {
          symbol: token.symbol,
          balance: smwb[token.symbol],
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
                  onChange={(v) => setwithdrawMangoAccount(v)}
                  value={withdrawMangoAccount}
                />
              </div>
            ) : null}
            <Label>{t('asset')}</Label>
            <Select
              value={
                withdrawTokenSymbol && true ? (
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
                      maintHealthRatio
                    )}`}
                  >
                    {maintHealthRatio > 100
                      ? '>100'
                      : maintHealthRatio.toFixed(2)}
                    %
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="mb-0">{t('tooltip-projected-leverage')}</p>
                  <p
                    className={`mb-0 font-bold text-th-fgd-1 ${getAccountStatusColor(
                      maintHealthRatio
                    )}`}
                  >
                    {leverage.toFixed(2)}x
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
            {initHealthRatio < 0 ? (
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
                  initHealthRatio < 0 ||
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
