/* Usage:
 *
 * cp .env.testnet.example .env
 * node examples/simple-market-making-bot.js --assetId=<assetId>
 *
 * Note 7/13/2022 - this requires a couple other fixes in algodex-sdk (will be merging soon)
 */

const args = require('minimist')(process.argv.slice(2));
require('dotenv').config()
const PouchDB = require('pouchdb');
const algosdk = require('algosdk');
const axios = require('axios');
const AlgodexAPI = require('@algodex/algodex-sdk');
// const withCloseAssetOrderTxns = require('../lib/order/txns/close/withCloseAssetTxns');
// const withCloseAlgoOrderTxns = require('../lib/order/txns/close/withCloseAlgoTxns');
const { LogicSigAccount } = require('algosdk');
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
const nearestNeighborKeep = parseFloat(process.env.NEAREST_NEIGHBOR_KEEP) || 0.005 //FIXME
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



// const token = process.env.ALGOD_TOKEN;
// const server = process.env.ALGOD_SERVER;
// const port = process.env.ALGOD_PORT;
// const client = new algosdk.Algodv2(token, server, port);

// (async () => {
//   console.log(await client.status().do());
// })().catch((e) => {
//   console.log(e);
// });


const api = new AlgodexAPI({config: {
  'algod': {
    'uri': process.env.ALGOD_SERVER,
    'token': process.env.ALGOD_TOKEN || '',
    'port': process.env.ALGOD_PORT ? parseInt(process.env.ALGOD_PORT) : undefined,
  },
  'indexer': {
    'uri': process.env.INDEXER_SERVER,
    'token': process.env.INDEXER_TOKEN || '',
    'port': process.env.INDEXER_PORT ? parseInt(process.env.INDEXER_PORT) : undefined,
  },
  'explorer': {
    'uri': environment === 'mainnet' ? 'https://indexer.testnet.algoexplorerapi.io' :
    'https://indexer.algoexplorerapi.io',
  },
  'dexd': {
    'uri': environment === 'mainnet' ? 'https://app.algodex.com/algodex-backend' :
      'https://testnet.algodex.com/algodex-backend',
    'token': '',
  },
}});

// (async () => {

//   const token  = process.env.INDEXER_TOKEN || '';
// const server = process.env.INDEXER_SERVER;
// const port   = process.env.INDEXER_PORT ? parseInt(process.env.INDEXER_PORT) : '';
// const indexerClient = new algosdk.Indexer(token, server, port);

//   const res = 
//   await api.indexer.lookupAccountByID('XPUFT2FVG3M5LYRBYJKK2YJ5BR5NOTHH3J5NRIO3VHY5J3DJZMMBKA27HQ').do();
//     // await indexerClient.lookupAccountByID('XPUFT2FVG3M5LYRBYJKK2YJ5BR5NOTHH3J5NRIO3VHY5J3DJZMMBKA27HQ').do();
//   console.log({res});
// })();

// id:
// 15322902
// isTraded:
// true
// price:
// 955
// price24Change:
// -3.0456852791878175
// priceBefore:
// 985
// unix_time:
// 1657622395

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getTinymanPrice = async(environment) => {
  const tinymanPriceURL = environment === 'mainnet' ? 
    'https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/' :
    'https://testnet.analytics.tinyman.org/api/v1/current-asset-prices/';
  
    const assetData = await axios({
      method: 'get',
      url: tinymanPriceURL,
      responseType: 'json',
      timeout: 3000,
    });
    const algoPrice = assetData.data[0].price;
    const latestPrice = assetData.data[assetId].price / algoPrice;
    return latestPrice;
};

const getLatestPrice = async (environment, useTinyMan = false) => {
  if (useTinyMan) {
    return await getTinymanPrice(environment);
  }
  const ordersURL = environment === 'testnet' ?
  'https://testnet.algodex.com/algodex-backend/assets.php' :
  'https://app.algodex.com/algodex-backend/assets.php';

  const assetData = await axios({
    method: 'get',
    url: ordersURL,
    responseType: 'json',
    timeout: 3000,
  });
  const assets = assetData.data.data;
  const latestPrice = assets.find(asset => asset.id === assetId).price;
  return latestPrice;
};

if (!process.env.WALLET_MNEMONIC) {
  throw new Error('Mnemonic not set!');
}
const initWallet = async algodexApi => {
  await algodexApi.setWallet({
    'type': 'sdk',
    'address': walletAddr,
    'connector': require('@algodex/algodex-sdk/lib/wallet/connectors/AlgoSDK'),
    // eslint-disable-next-line max-len
    'mnemonic': process.env.WALLET_MNEMONIC,
  });
};

const getEscrowsToCancelAndMake = ({escrows, latestPrice, minSpreadPerc, nearestNeighborKeep,
  idealPrices}) => {
  const bidCancelPoint = latestPrice * (1 - minSpreadPerc);
  const askCancelPoint = latestPrice * (1 + minSpreadPerc);
  const escrowsTemp = escrows.map(escrow => {
    return {
      price: escrow.doc.order.price,
      type: escrow.doc.order.type,
      address: escrow.doc._id,
    };
  });
  const cancelEscrowAddrs = escrowsTemp.filter(escrow => {
    if (escrow.price > (bidCancelPoint * (1+0.000501)) && escrow.type === 'buy') {
      return true;
    } else if (escrow.price < (askCancelPoint * (1-0.000501)) && escrow.type === 'sell') {
      return true;
    }
    if (idealPrices.find(idealPrice => Math.abs((idealPrice - escrow.price)/escrow.price)
        < nearestNeighborKeep)) {
      return false;
    }
    return true;
  }).map(escrow => escrow.address);
  const cancelAddrSet = new Set(cancelEscrowAddrs);
  const remainingEscrows = escrowsTemp.filter(escrow => !cancelAddrSet.has(escrow.address));

  const createEscrowPrices = idealPrices.filter(idealPrice => {
    if (remainingEscrows.find(escrow => Math.abs((idealPrice - escrow.price)/escrow.price)
      < nearestNeighborKeep)) {
      return false;
    }
    return true;
  }).map(price => {
    return {
      price,
      'type': price < latestPrice ? 'buy' : 'sell',
    };
  });

  return {createEscrowPrices, cancelEscrowAddrs};
};

const getIdealPrices = (ladderTiers, latestPrice, minSpreadPerc) => {
  const prices = [];
  for (let i = 1; i <= ladderTiers; i++) {
    const randomOffset = (1+Math.random()*0.001-0.0005);
    const sellPrice = Math.max(0.000001, latestPrice * ((1 + minSpreadPerc) ** i) * randomOffset);
    const bidPrice = Math.max(0.000001, latestPrice * ((1 - minSpreadPerc) ** i) * randomOffset);
    prices.push(sellPrice);
    prices.push(bidPrice);
  }
  prices.sort();
  return prices;
};

const convertToDBObject = dbOrder => {
  const obj = {
    address: dbOrder.address,
    version: dbOrder.version,
    price: dbOrder.price,
    amount: dbOrder.amount,
    total: dbOrder.price * dbOrder.amount,
    asset: {id: assetId, decimals: 6},
    assetId: dbOrder.assetId,
    type: dbOrder.type,
    appId: dbOrder.type === 'buy' ? parseInt(process.env.ALGODEX_ALGO_ESCROW_APP) 
      : parseInt(process.env.ALGODEX_ASA_ESCROW_APP),
    contract: {
      creator: dbOrder.contract.creator,
      data: dbOrder.contract.lsig.lsig.logic.toJSON(),
      escrow: dbOrder.contract.escrow,
    },
  };
  return obj;
};

const getAccountExists = async (account, indexer) => {
  try {
    const accountInfo =
      await indexer.lookupAccountByID(account).do();
    // console.log('Information for Account: ' + JSON.stringify(accountInfo, undefined, 2));
    if (accountInfo?.account?.amount && accountInfo?.account?.amount > 0) {
      return true;
    } else {
      console.log(`account ${account} not found!`);
    }
  } catch (e) {
    console.log(`account ${account} not found!`);
    console.error(e);
  }
};

const getCurrentOrders = async (escrowDB, indexer) => {
  const currentEscrows = await escrowDB.allDocs({include_docs: true});
  currentEscrows.rows.forEach(escrow => {
    escrow.doc.order.escrowAddr = escrow.doc._id;
  });
  const escrowsWithBalances = [];
  for (let i = 0; i < currentEscrows.rows.length; i++) {
    const escrow = currentEscrows.rows[i];
    const escrowAddr = escrow.doc.order.escrowAddr;
    if (await getAccountExists(escrowAddr, indexer)) {
      escrowsWithBalances.push(escrow);
    }
  }
  const hasBalanceSet = new Set(escrowsWithBalances.map(escrow => escrow.doc.order.escrowAddr));
  const removeFromDBPromises = [];
  currentEscrows.rows.forEach(async escrow => {
    const addr = escrow.doc.order.escrowAddr;
    if (!hasBalanceSet.has(addr)) {
      removeFromDBPromises.push(escrowDB.remove(escrow.doc));
    }
  });
  await Promise.all(removeFromDBPromises).catch(function(e) {
    console.error(e);
  });
  return {rows: escrowsWithBalances};
};

const getAssetInfo = async({indexerClient, assetId}) => {
  const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
  return assetInfo;
}
const run = async ({escrowDB, assetId, assetInfo, ladderTiers, lastBlock} ) => {
  console.log('LOOPING...');
  if (!api.wallet) {
    await initWallet(api);
  }
  if (!assetInfo) {
    assetInfo = await getAssetInfo({indexerClient: api.indexer, assetId});
  }
  const decimals = assetInfo.asset.params.decimals;

  const currentEscrows = await getCurrentOrders(escrowDB, api.indexer);
  let latestPrice;
  try {
    latestPrice = await getLatestPrice(environment, useTinyMan);
  } catch (e) {
    console.error(e);
    await sleep(100);
    run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock});
    return;
  }
  if (latestPrice === undefined) {
    await sleep(1000);
    run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock});
    return;
  }

  const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
  const {createEscrowPrices, cancelEscrowAddrs} = getEscrowsToCancelAndMake(
      {escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices});
  const cancelSet = new Set(cancelEscrowAddrs);
  const cancelPromises = currentEscrows.rows.map(order => order.doc.order)
      .filter(order => cancelSet.has(order.escrowAddr))
      .filter(order => order.contract.data !== undefined)
      .map(dbOrder => {
        const cancelOrderObj = {...dbOrder};
        cancelOrderObj.contract.lsig = new LogicSigAccount(dbOrder.contract.data.data);
        cancelOrderObj.client = api.algod;
        cancelOrderObj.wallet = api.wallet;
        const tempOrder = {...cancelOrderObj};
        delete tempOrder.wallet;
        delete tempOrder.contract;
        delete tempOrder.client;
        console.log('CANCELLING ORDER: ', JSON.stringify(tempOrder), ` Latest Price: ${latestPrice}`);
        return api.closeOrder(cancelOrderObj);
      });

  await Promise.all(cancelPromises).then(async function(results) {
    const addrs = results.map(result => result[0].escrowAddr);
    const resultAddrs = new Set(addrs);
    const removeFromDBPromises = currentEscrows.rows
        .filter(order => resultAddrs.has(order.doc.order.escrowAddr))
        .map(order => escrowDB.remove(order.doc));
    if (results.length > 0) {
      console.log({results});
    }
    await Promise.all(removeFromDBPromises).catch(function(e) {
      console.error(e);
    });
  }).catch(function(e) {
    console.error(e);
  });

  // const remainingEscrows = await escrowDB.allDocs({include_docs: true});
  const ordersToPlace = createEscrowPrices.map(priceObj => {
    const orderToPlace = {
      'asset': {
        'id': assetId, // Asset Index
        'decimals': decimals, // Asset Decimals
      },
      'address': api.wallet.address,
      'price': priceObj.price, // Price in ALGOs
      'amount': priceObj.type === 'buy' ? 
          orderAlgoDepth : (orderAlgoDepth / latestPrice), // Amount to Buy or Sell
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
  console.error({invalidResults});
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

  await sleep(1000);
  run({escrowDB, assetId, assetInfo, ladderTiers, lastBlock: 0});
};

run({escrowDB, assetId, assetInfo: null, ladderTiers, lastBlock: 0});


