const args = require('minimist')(process.argv.slice(2));
require('dotenv').config()
const PouchDB = require('pouchdb');
const algosdk = require('algosdk');
const axios = require('axios');
const AlgodexAPI = require('@algodex/algodex-sdk');
const {
  withOrderbookEntry,
  withLogicSigAccount,
} = require('@algodex/algodex-sdk/lib/order/compile');

const constants = require('@algodex/algodex-sdk/lib/constants');
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

const environment = process.env.ENVIRONMENT === 'mainnet' ? 'mainnet' : 'testnet'; 
const walletAddr = algosdk.mnemonicToSecretKey(process.env.WALLET_MNEMONIC).addr;

const config = {
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
};

const api = new AlgodexAPI({config});

const withOrderType = (order, type) => {
  order.type = type;
  return order;
}
const getOpenOrders = async (config, environment, walletAddr) => {
  const url = config.dexd.uri + '/orders.php?ownerAddr='+walletAddr;
  const orders = await axios({
    method: 'get',
    url: url,
    responseType: 'json',
    timeout: 3000,
  });
  const allOrders = [...orders.data.buyASAOrdersInEscrow.map(order => withOrderType(order, 'buy'))
      , ...orders.data.sellASAOrdersInEscrow.map(order => withOrderType(order, 'sell'))];
  return allOrders;
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

module.exports = {
  ESCROW_CONTRACT_VERSION: 6,
  MIN_ESCROW_BALANCE: 500000,
  MIN_ASA_ESCROW_BALANCE: 500000,
  ALGO_ORDERBOOK_APPID: 354073718,
  ASA_ORDERBOOK_APPID: 354073834,
  TEST_ALGO_ORDERBOOK_APPID: 22045503,
  TEST_ASA_ORDERBOOK_APPID: 22045522,
};

function isInt(value) {
  if (isNaN(value)) {
    return false;
  }

  const x = parseFloat(value);
  return (x | 0) === x;
}

const checkAndGetInput = (
  escrowAddress,
  orderEntry, version, ownerAddress, appId, isAlgoBuyEscrow) => {

  const orderSplit = orderEntry.split('-');
  // rec contains the original order creators address
  const assetLimitPriceN = parseInt(orderSplit[0]);
  const assetLimitPriceD = parseInt(orderSplit[1]);
  // const minimumExecutionSizeInAlgo = orderSplit[2];
  const assetId = parseInt(orderSplit[3]);

  version = parseInt(version);

  if (typeof escrowAddress !== 'string') {
    throw new TypeError('escrowAddress is not string!`');
  }
  if (!isInt(assetId) || assetId < 0) {
    throw new TypeError('invalid assetId!');
  }
  if (typeof isAlgoBuyEscrow !== 'boolean') {
    throw new TypeError('invalid isAlgoBuyEscrow!');
  }
  if (typeof ownerAddress !== 'string' || ownerAddress.length == 0) {
    throw new TypeError('invalid ownerAddress!');
  }
  if (!isInt(appId) || appId < 0) {
    throw new TypeError('invalid appId!');
  }

  const input = {
    'asset': {
      'id': assetId,
    },
    'type': isAlgoBuyEscrow ? 'buy' : 'sell',
    'address': ownerAddress,
    'appId': appId,
    'version': version,
    'N': assetLimitPriceN,
    'D': assetLimitPriceD,
    'id': assetId,
    'contract': {
      'N': assetLimitPriceN,
      'D': assetLimitPriceD,
    },
  };

  return input;
};


const getCancelOrderPromise = async (api, order, environment) => {
  const orderbookEntry = `${order.assetLimitPriceN}-${order.assetLimitPriceD}-0-${order.assetId}`;

  const buyOrderApp = environment === 'mainnet' ? constants.ALGO_ORDERBOOK_APPID :
    TEST_ALGO_ORDERBOOK_APPID;
  const sellOrderApp = environment === 'mainnet' ? constants.ASA_ORDERBOOK_APPID :
    TEST_ASA_ORDERBOOK_APPID;

  const appId = order.type === 'buy' ? buyOrderApp : sellOrderApp;

  const orderInput = checkAndGetInput(order.escrowAddress, orderbookEntry, order.version, 
    order.ownerAddress, appId, order.type === 'buy');
  orderInput.client = api.algod;
  const compiledOrder = await withLogicSigAccount(withOrderbookEntry(orderInput));

  const cancelOrderPromise = api.closeOrder({
    address: order.ownerAddress,
    version: order.version,
    price: Number(order.formattedPrice),
    amount: Number(order.formattedASAAmount),
    total: Number(order.formattedPrice) * Number(order.formattedASAAmount),
    asset: { id: order.assetId, decimals: order.decimals },
    assetId: order.assetId,
    type: order.type,
    appId,
    contract: {...compiledOrder.contract, creator: order.ownerAddress},
    /*{
      creator: order.ownerAddress,
      escrow: order.escrowAddress,
      N: order.assetLimitPriceN,
      D: order.assetLimitPriceD,
      entry: orderbookEntry
      lsig: co
    },*/
    wallet: api.wallet,
    client: api.algod,
  })
  return cancelOrderPromise;
}
const run = async(api, config, environment, walletAddr) => {
  await initWallet(api);
  const orders = await getOpenOrders(config, environment, walletAddr);
  const promises = [];
  for (let i = 0; i < orders.length; i++) {
    const promise = await getCancelOrderPromise(api, orders[i], environment);
    promises.push(promise);
  }
  
  // await Promise.all(promises.map(p => p.catch(e => e)));
  await Promise.all(promises);
}

run(api, config, environment, walletAddr);


