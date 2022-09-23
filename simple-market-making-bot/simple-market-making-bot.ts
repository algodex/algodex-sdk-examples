/* Usage:
 *
 * cp .env.testnet.example .env
 * node simple-market-making-bot/simple-market-making-bot.js --assetId=<assetId>
 *
 */

import { Config } from "./types/config";

const args = require('minimist')(process.argv.slice(2));
require('dotenv').config();
const PouchDB = require('pouchdb');
const algosdk = require('algosdk');
const sleep = require('./lib/sleep');
const getCancelPromises = require('./lib/getCancelPromises');
const getCurrentOrders = require('./lib/getCurrentOrders');
const getOpenAccountSetFromAlgodex =
  require('./lib/getOpenAccountSetFromAlgodex');

const {cancelOrders} = require('./lib/cancelOrders');
const initAPI = require('./lib/initAPI');
const runLoop = require('./lib/runLoop');

// app.set('host', '127.0.0.1');
if (args.assetId !== undefined &&
    args.assetId.length === 0) {
  throw new Error('assetId is not set!');
}
if (process.env.environment !== undefined &&
  process.env.environment.length === 0) {
  throw new Error('environment is not set!');
}
if (!process.env.ALGOD_SERVER) {
  throw new Error('ALGOD_SERVER not set!');
}
// if (!process.env.ALGOD_TOKEN) {
//   throw new Error('ALGOD_TOKEN not set!');
// }
// if (!process.env.ALGOD_PORT) {
//   throw new Error('ALGOD_PORT not set!');
// }
if (!process.env.INDEXER_SERVER) {
  throw new Error('INDEXER_SERVER not set!');
}
if (!process.env.ALGODEX_ALGO_ESCROW_APP) {
  throw new Error('ALGODEX_ALGO_ESCROW_APP not set!');
}
if (!process.env.ALGODEX_ASA_ESCROW_APP) {
  throw new Error('ALGODEX_ASA_ESCROW_APP not set!');
}
// if (!process.env.INDEXER_TOKEN) {
//   throw new Error('INDEXER_TOKEN not set!');
// }
// if (!process.env.INDEXER_PORT) {
//   throw new Error('INDEXER_PORT not set!');
// }
if (!process.env.ORDER_ALGO_DEPTH) {
  throw new Error('ORDER_ALGO_DEPTH not set!');
}
const minSpreadPerc =
  parseFloat(process.env.SPREAD_PERCENTAGE!) || 0.0065; // FIXME
const nearestNeighborKeep =
  parseFloat(process.env.NEAREST_NEIGHBOR_KEEP!) || 0.0035; // FIXME
// const escrowDB = new PouchDB('escrows');
// const escrowDB = new PouchDB('http://admin:dex@127.0.0.1:5984/market_maker');
const assetId = parseInt(args.assetId);
const walletAddr =
  algosdk.mnemonicToSecretKey(process.env.WALLET_MNEMONIC).addr;
const pouchUrl = process.env.POUCHDB_URL ? process.env.POUCHDB_URL + '/' : '';
const fullPouchUrl = pouchUrl + 'market_maker_' +
    assetId + '_' + walletAddr.slice(0, 8).toLowerCase();
const escrowDB = new PouchDB(fullPouchUrl);
const ladderTiers = parseInt(process.env.LADDER_TIERS!) || 3;
const useTinyMan = process.env.USE_TINYMAN &&
    process.env.USE_TINYMAN.toLowerCase() !== 'false' || false;
const environment = process.env.ENVIRONMENT ===
    'mainnet' ? 'mainnet' : 'testnet';
const orderAlgoDepth = parseInt(process.env.ORDER_ALGO_DEPTH!);

const api = initAPI(environment);

const config:Config = {assetId, walletAddr, minSpreadPerc, nearestNeighborKeep,
  escrowDB, ladderTiers, useTinyMan, environment, orderAlgoDepth, api};
Object.freeze(config);

if (!process.env.WALLET_MNEMONIC) {
  throw new Error('Mnemonic not set!');
}

const runState = {
  isExiting: false,
  inRunLoop: false,
};

process.on('SIGINT', async () => {
  console.log('Caught interrupt signal');
  runState.isExiting = true;
  while (runState.inRunLoop) {
    console.log('waiting to exit');
    await sleep(500);
  }
  // await sleep(3000);
  console.log('Canceling all orders');
  const openAccountSet =
    await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  const escrows = await getCurrentOrders(escrowDB, api.indexer, openAccountSet);
  const cancelArr = escrows.rows.map(escrow => escrow.doc.order.escrowAddr);
  const cancelSet = new Set(cancelArr);
  const cancelPromises = await getCancelPromises({escrows, cancelSet,
    api, latestPrice: 0});
  await cancelOrders(escrowDB, escrows, cancelPromises);
  process.exit();
});

runLoop({config, assetInfo: null,
  lastBlock: 0, runState});
