/* Usage:
 *
 * cp .env.testnet.example .env
 * node examples/simple-market-making-bot.js --assetId=<assetId>
 *
 */

const args = require('minimist')(process.argv.slice(2));
require('dotenv').config()
const PouchDB = require('pouchdb');
const algosdk = require('algosdk');
const orderDepthAmounts = require('./order-depth-amounts');
const sleep = require('./lib/sleep');
const getLatestPrice = require('./lib/getLatestPrice');
const getCancelPromises = require('./lib/getCancelPromises');
const getCurrentOrders = require('./lib/getCurrentOrders');
const getOpenAccountSetFromAlgodex = require('./lib/getOpenAccountSetFromAlgodex');
const getEscrowsToCancelAndMake = require('./lib/getEscrowsToCancelAndMake');
const initWallet = require('./lib/initWallet');
const getIdealPrices = require('./lib/getIdealPrices');
const convertToDBObject = require('./lib/convertToDBObject');
const getAssetInfo = require('./lib/getAssetInfo');
const cancelOrders = require('./lib/cancelOrders');
const initAPI = require('./lib/initAPI');

// const withCloseAssetOrderTxns = require('../lib/order/txns/close/withCloseAssetTxns');
// const withCloseAlgoOrderTxns = require('../lib/order/txns/close/withCloseAlgoTxns');
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
const minSpreadPerc = parseFloat(process.env.SPREAD_PERCENTAGE) || 0.0065 // FIXME
const nearestNeighborKeep = parseFloat(process.env.NEAREST_NEIGHBOR_KEEP) || 0.0035 //FIXME
// const escrowDB = new PouchDB('escrows');
//const escrowDB = new PouchDB('http://admin:dex@127.0.0.1:5984/market_maker');
const assetId = parseInt(args.assetId);
const walletAddr = algosdk.mnemonicToSecretKey(process.env.WALLET_MNEMONIC).addr;
const pouchUrl = process.env.POUCHDB_URL ? process.env.POUCHDB_URL + '/' : '';
const fullPouchUrl = pouchUrl + 'market_maker_' + assetId + '_' + walletAddr.slice(0, 8).toLowerCase();
const escrowDB = new PouchDB(fullPouchUrl);
const ladderTiers = parseInt(process.env.LADDER_TIERS) || 3;
const useTinyMan = process.env.USE_TINYMAN &&
    process.env.USE_TINYMAN.toLowerCase() !== 'false' || false;
const environment = process.env.ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet';
const orderAlgoDepth = process.env.ORDER_ALGO_DEPTH;

const api = initAPI(environment);

if (!process.env.WALLET_MNEMONIC) {
  throw new Error('Mnemonic not set!');
}

let isExiting = false;
let inRunLoop = false;
let openAccountSet;

const run = async ({escrowDB, assetId, assetInfo, ladderTiers, lastBlock, openAccountSet} ) => {
  if (isExiting) {
    return;
  }
  inRunLoop = true;
  console.log('LOOPING...');
  openAccountSet = await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  if (!api.wallet) {
    await initWallet(api, walletAddr);
  }
  if (!assetInfo) {
    assetInfo = await getAssetInfo({indexerClient: api.indexer, assetId});
  }
  const decimals = assetInfo.asset.params.decimals;

  const currentEscrows = await getCurrentOrders(escrowDB, api.indexer, openAccountSet);
  let latestPrice;

  try {
    latestPrice = await getLatestPrice(assetId, environment, useTinyMan);
  } catch (e) {
    console.error(e);
    await sleep(100);
    run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock, openAccountSet});
    return;
  }
  if (latestPrice === undefined || latestPrice === 0) {
    await sleep(1000);
    run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock, openAccountSet});
    return;
  }

  const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
  const {createEscrowPrices, cancelEscrowAddrs} = getEscrowsToCancelAndMake(
      {escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices});
  const cancelSet = new Set(cancelEscrowAddrs);

  const cancelPromises = await getCancelPromises({escrows: currentEscrows, cancelSet,
        api, latestPrice});
  await cancelOrders(escrowDB, currentEscrows, cancelPromises);

  const ordersToPlace = createEscrowPrices.map(priceObj => {
    const orderDepth = orderDepthAmounts.hasOwnProperty(''+assetId) ? 
      orderDepthAmounts[''+assetId] : orderAlgoDepth;
    const orderToPlace = {
      'asset': {
        'id': assetId, // Asset Index
        'decimals': decimals, // Asset Decimals
      },
      'address': api.wallet.address,
      'price': priceObj.price, // Price in ALGOs
      'amount': orderDepth / latestPrice, // Amount to Buy or Sell
      'execution': 'maker', // Type of exeuction
      'type': priceObj.type, // Order Type
    };
    console.log('PLACING ORDER: ', JSON.stringify(orderToPlace), ` Latest Price: ${latestPrice}`);
    const orderPromise = api.placeOrder(orderToPlace);
    return orderPromise;
  });
  const results = await Promise.all(ordersToPlace.map(p => p.catch(e => e)));
  const validResults = results.filter(result => !(result instanceof Error));
  const invalidResults = results.filter(result => (result instanceof Error));
  if (invalidResults && invalidResults.length > 0) {
    console.error({invalidResults});
  }
  const ordersAddToDB = validResults
    .filter(order => order[0].contract.amount > 0)
    .map(order => {
      return escrowDB.put({
        '_id': order[0].contract.escrow,
        'order': convertToDBObject(order[0]),
      });
    });
  await Promise.all(ordersAddToDB).catch(e => {
    console.error(e);
  });
  inRunLoop = false;
  await sleep(1000);
  run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock: 0});
};

process.on('SIGINT', async () => {
  console.log("Caught interrupt signal");
  isExiting = true;
  while (inRunLoop) {
    console.log("waiting to exit");
    await sleep(500);
  }
  // await sleep(3000);
  console.log("Canceling all orders");
  const openAccountSet = await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  const escrows = await getCurrentOrders(escrowDB, api.indexer, openAccountSet);
  const cancelArr = escrows.rows.map(escrow => escrow.doc.order.escrowAddr);
  const cancelSet = new Set(cancelArr);
  const cancelPromises = await getCancelPromises({escrows, cancelSet,
    api, latestPrice: 0});
  await cancelOrders(escrowDB, escrows, cancelPromises);
  process.exit();
});

run({escrowDB, assetId, assetInfo: null, ladderTiers, lastBlock: 0, openAccountSet});
