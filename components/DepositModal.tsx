import React, { FunctionComponent } from 'react'
import  {  useEffect, useState } from 'react'
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
import { useAnchorWallet, useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react'
import MangoAccountSelect from './MangoAccountSelect'
import { MangoAccount } from '@blockworks-foundation/mango-client'
import { connectionSelector } from 'stores/selectors'
import { INVESTIN_PROGRAM_ID } from 'utils/tokens'

import { depositReserveLiquidityInstruction } from "@solendprotocol/solend-sdk";
import { PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { send } from 'process'


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
  const { wallet }  = useWallet()
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
    const  connection  =  useMangoStore(connectionSelector)
  const [isInvestinDelegate, setIsInvestinDelegate] = useState(false)

  useEffect(() => {
    const checkForInvestinDelegate = async () => {
      if (mangoAccount && mangoAccount?.owner) {
        const ai = await connection.getAccountInfo(mangoAccount?.owner)
        if (ai?.owner.toBase58() === INVESTIN_PROGRAM_ID.toBase58()) {
          setIsInvestinDelegate(true)
        }
      }
    }
    checkForInvestinDelegate()
  }, [mangoAccount])

  useEffect(() => {
    if (tokenSymbol && wallet?.adapter.publicKey) {
            const symbolAccount = walletTokens.find(
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
     wallet?.adapter.publicKey as PublicKey
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
         
     wallet?.adapter.publicKey as PublicKey,
         
     wallet?.adapter.publicKey as PublicKey
       );
   
   transaction.add(createUserCollateralAccountIx)
   
   transaction.recentBlockhash = await (
     await connection.getLatestBlockhash()
   ).blockhash;
console.log(selectedAccount.account)
console.log(1)
console.log(...transaction.instructions)
   var hm2 = wallet.adapter.sendTransaction(transaction, connection)
   console.log(hm2)
   }
   console.log(selectedAccount)

  var  transaction = new Transaction() 
transaction.add(
 depositReserveLiquidityInstruction(
   parseFloat(inputAmount )* 10 **  selectedAccount.config.decimals,
   selectedAccount.account.pubkey,
   userCollateralAccountAddress,
   // @ts-ignore
   new PublicKey(res.address),
   // @ts-ignore
   new PublicKey(res.liquidityAddress),

         // @ts-ignore
   new PublicKey(res.collateralMintAddress),
   new PublicKey(config.markets[0].address),   new PublicKey(config.markets[0].authorityAddress),

   wallet?.adapter.publicKey as PublicKey, // obligationOwner
   new PublicKey(
     "E4AifNCQZzPjE1pTjAWS8ii4ovLNruSGsdWRMBSq2wBa"
   )    ))

transaction.recentBlockhash = await (
 await connection.getLatestBlockhash()
).blockhash;
console.log(1)
console.log(...transaction.instructions)
 await wallet.adapter.sendTransaction(transaction, connection)
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
  const repayMessage = 'you will receive more of your tokens when you redeem than you put in :) invariably, barring unforeseen :)'

  const inputDisabled =
    selectedAccount &&
    selectedAccount.config.symbol === 'SOL' &&
    selectedAccount.uiBalance.toString() === inputAmount

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <ElementTitle noMarginBottom>{t('deposit-funds')}</ElementTitle>
      </Modal.Header>
      {!mangoAccount ? (
        <div className="mb-4 mt-2 text-center text-xs text-th-fgd-3">
          {t('first-deposit-desc')}
        </div>
      ) : null}
      {tokenSymbol && !selectedAccount ? (
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
      {mangoAccounts.length > 1 ? (
        <div className="mb-4">
          <Label>{t('to-account')}</Label>
          <MangoAccountSelect
            onChange={(v) => setDepositMangoAccount(v)}
            value={depositMangoAccount}
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