const { calculateProfit, toDecimal, storeItInTempAsJSON } = require("../utils");
const cache = require("./cache");
const { getSwapResultFromSolscanParser } = require("../services/solscan");
const fs = require('fs')
const bs58 = require('bs58')
const { VersionedTransaction, Keypair, Connection, ComputeBudgetProgram, PublicKey, Transaction, TransactionMessage } = require("@solana/web3.js");
const { default: axios } = require("axios");
const {
	borrowObligationLiquidityInstruction,
	flashBorrowReserveLiquidityInstruction,
	flashRepayReserveLiquidityInstruction,
	parseObligation,
	refreshObligationInstruction,
	refreshReserveInstruction,
	SolendAction,
	SolendMarket,
	SolendReserve,
	SOLEND_PRODUCTION_PROGRAM_ID
  } = require( "@solendprotocol/solend-sdk" )
const payer = Keypair.fromSecretKey(
	bs58.decode(process.env.PK)
)
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
  let markets = []
  console.log(1)

 


const getTransaction = async(route) => {
	
	let body = {

		userPublicKey: payer.publicKey.toBase58(),
		route: route,
		// to make sure it doesnt close the sol account
		wrapUnwrapSOL: false,
	  }
	  const response = await axios.post(`https://quote-api.jup.ag/v3/swap`,JSON.stringify(body), {headers: {
		// Overwrite Axios's automatically set Content-Type
		'Content-Type': 'application/json'
	  }
	})
   
const data = await response.data.json();
return data 
  };
  let connection = new Connection(
 
	process.env.DEFAULT_RPC,
   { commitment: "recent" }
 );
const swap = async (jupiter, route) => {

	markets = [await SolendMarket.initialize(
		connection,
	  
		"production", // optional environment argument'
	   // market.address
	  )]
	  let market = markets[0]
	  var reserve =
	  market.reserves = market.reserves.find(res => res.config.liquidityToken.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		if (process.env.DEBUG) storeItInTempAsJSON("routeInfoBeforeSwap", route);
let goaccs = []
const params = {
	units: 301517 + 301517 + 301517 + 101517 + 101517,
	additionalFee: 1,
  };
  let inputToken = route.marketInfos[0].inputMint
  let outputToken = route.marketInfos[0].inputMint
  let arg = (
	await connection.getTokenAccountsByOwner(
	  payer.publicKey,
	  { mint: new PublicKey(inputToken) }
	)
  ).value[0]
  const ix =
	ComputeBudgetProgram.requestUnits(params);
  let instructions = [
	ix,
	flashBorrowReserveLiquidityInstruction(
	  parseFloat(route.marketInfos[0].inAmount),
	  new PublicKey(reserve.config.liquidityAddress),
	  arg.pubkey,
	  new PublicKey(reserve.config.address),
	  new PublicKey(market.config.address),
	  SOLEND_PRODUCTION_PROGRAM_ID
	),
  ];

  const execute =  await jupiter.exchange({
	routeInfo: route,
});
console.log( execute)
				var {
				
					swapTransaction,
				  } = execute.transactions
  
  
				  await Promise.all(
					  [
						swapTransaction,
					  ]
						.filter(Boolean)
						.map(
						  async (transaction) => {
							// get transaction object from serialized transaction
							
							instructions.push(...transaction.instructions)
						 //   console.log(transaction)
						   // goaccs.push(...transaction.message.addressTableLookups)
						  //  console.log(transaction)
						  ///  const messageV0 = TransactionMessage.decompile(transaction.message)
						  //  console.log(messageV0)
						  //  let hmmm = (transaction.message.compileToV0Message())
						
							 // goaccs.push(...transaction.message.addressTableLookups)
							//  console.log(transaction)
							///  const messageV0 = TransactionMessage.decompile(transaction.message)
							//  console.log(messageV0)
  
							//  let hmmm = (transaction.message.compileToV0Message())
							  
  
						  }
						)
				  )
				  instructions.push(
					flashRepayReserveLiquidityInstruction(
						parseFloat(route.marketInfos[0].inAmount),
						1,
					  arg.pubkey,
					  new PublicKey(
						reserve.config.liquidityAddress
					  ),
					  new PublicKey(
						reserve.config.liquidityFeeReceiverAddress
					  ),
					  arg.pubkey,
					  new PublicKey(reserve.config.address),
					  new PublicKey(market.config.address),
					  payer.publicKey,
					  SOLEND_PRODUCTION_PROGRAM_ID
					)
				  );

execute.transactions.swapTransaction.instructions = instructions
const result = await execute.execute(); // Force any to ignore TS misidentifying SwapResult type

if (process.env.DEBUG) storeItInTempAsJSON("result", result);

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [result, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};
exports.swap = swap;

const failedSwapHandler = (tradeEntry) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].fail++;

	// update trade history
	cache.config.storeFailedTxInHistory;

	// update trade history
	let tempHistory = cache.tradeHistory;
	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;
};
exports.failedSwapHandler = failedSwapHandler;

const successSwapHandler = async (tx, tradeEntry, tokenA, tokenB) => {
	if (process.env.DEBUG) storeItInTempAsJSON(`txResultFromSDK_${tx?.txid}`, tx);

	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].success++;

	if (cache.config.tradingStrategy === "pingpong") {
		// update balance
		if (cache.sideBuy) {
			cache.lastBalance.tokenA = cache.currentBalance.tokenA;
			cache.currentBalance.tokenA = 0;
			cache.currentBalance.tokenB = tx.outputAmount;
		} else {
			cache.lastBalance.tokenB = cache.currentBalance.tokenB;
			cache.currentBalance.tokenB = 0;
			cache.currentBalance.tokenA = tx.outputAmount;
		}

		// update profit
		if (cache.sideBuy) {
			cache.currentProfit.tokenA = 0;
			cache.currentProfit.tokenB = calculateProfit(
				cache.initialBalance.tokenB,
				cache.currentBalance.tokenB
			);
		} else {
			cache.currentProfit.tokenB = 0;
			cache.currentProfit.tokenA = calculateProfit(
				cache.initialBalance.tokenA,
				cache.currentBalance.tokenA
			);
		}

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(
			tx.inputAmount,
			cache.sideBuy ? tokenA.decimals : tokenB.decimals
		);
		tradeEntry.outAmount = toDecimal(
			tx.outputAmount,
			cache.sideBuy ? tokenB.decimals : tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"],
			tx.outputAmount
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;
	}
	if (cache.config.tradingStrategy === "arbitrage") {
		/** check real amounts on solscan because Jupiter SDK returns wrong amounts
		 *  when we trading TokenA <> TokenA (arbitrage)
		 */
		const [inAmountFromSolscanParser, outAmountFromSolscanParser] =
			await getSwapResultFromSolscanParser(tx?.txid);

		if (inAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan inputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);
		if (outAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan outputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);

		cache.lastBalance.tokenA = cache.currentBalance.tokenA;
		cache.currentBalance.tokenA = outAmountFromSolscanParser;

		cache.currentProfit.tokenA = calculateProfit(
			cache.initialBalance.tokenA,
			cache.currentBalance.tokenA
		);

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(inAmountFromSolscanParser, tokenA.decimals);
		tradeEntry.outAmount = toDecimal(
			outAmountFromSolscanParser,
			tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			cache.lastBalance["tokenA"],
			outAmountFromSolscanParser
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;
	}
};
exports.successSwapHandler = successSwapHandler;
