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
  const groupConfig = jconfig;//useMangoStore((s) => s.selectedMangoGroup.config)
  const tokenSymbols = useMemo(
    () => groupConfig?.markets[0].symbols.map((t) => t),
    [groupConfig]
  )
  console.log(accounts)
  const missingTokenSymbols = useMemo(() => {
    const symbolsForAccounts = accounts.map((a) => a.config.symbol)
    return tokenSymbols?.filter((sym) => !symbolsForAccounts.includes(sym))
  }, [accounts, tokenSymbols])

  const actions = useMangoStore((s) => s.actions)
  const [loading, setLoading] = useState(false)

  const handleChange = (value: string) => {
    const newAccount = accounts.find(
      (a) => a.config.mintKey.toBase58() === value
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
        value={selectedAccount?.config.mintKey.toBase58()}
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
                              selectedAccount?.config.mintKey
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
              {accounts.filter((sym) => sym.uiBalance > 0).filter((sym) => jconfig.markets[0].reserves.find((reserve) => reserve.liquidityToken.mint==sym.config.mintKey.toBase58()) ) .map((account) => {
                const symbolForAccount = account.config.symbol

                return (
                  <Listbox.Option
                    className="mb-0"
                    disabled={account.uiBalance === 0}
                    key={account?.config.mintKey.toBase58()}
                    value={account?.config.mintKey.toBase58()}
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
                                {abbreviateAddress(account.config.mintKey)}
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
