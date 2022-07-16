const orderDepthAmounts = require('../order-depth-amounts');
const sleep = require('./sleep');
const getLatestPrice = require('./getLatestPrice');
const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const initWallet = require('./initWallet');
const getIdealPrices = require('./getIdealPrices');
const convertToDBObject = require('./convertToDBObject');
const getAssetInfo = require('./getAssetInfo');

const getCancelPromises = require('./getCancelPromises');
const getCurrentOrders = require('./getCurrentOrders');
const getOpenAccountSetFromAlgodex = require('./getOpenAccountSetFromAlgodex');

const cancelOrders = require('./cancelOrders');

const runLoop = async ({assetInfo, config, lastBlock, runState}) => {
  const {assetId, walletAddr, minSpreadPerc, nearestNeighborKeep, 
    escrowDB, ladderTiers, useTinyMan, api, environment, orderAlgoDepth} = config;

  if (runState.isExiting) {
    return;
  }
  runState.inRunLoop = true;
  console.log('LOOPING...');
  const openAccountSet = await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
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
    runLoop({assetInfo, config, lastBlock, runState});
    return;
  }
  if (latestPrice === undefined || latestPrice === 0) {
    await sleep(1000);
    runLoop({assetInfo, config, lastBlock, runState});
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
  runState.inRunLoop = false;
  await sleep(1000);
  runLoop({assetInfo, config, lastBlock, runState});
};

module.exports = runLoop;