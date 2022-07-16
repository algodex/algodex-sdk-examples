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
const placeOrdersAndUpdateDB = require('./placeOrdersAndUpdateDB');
const cancelOrders = require('./cancelOrders');
const getCurrentState = require('./getCurrentState');
const getPlannedOrderChanges = require('./getPlannedOrderChanges');
const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB');

const runLoop = async ({assetInfo, config, lastBlock, runState}) => {
  const {assetId, walletAddr, minSpreadPerc, nearestNeighborKeep, 
    escrowDB, ladderTiers, useTinyMan, api, environment, orderAlgoDepth} = config;

  if (runState.isExiting) {
    return;
  }
  runState.inRunLoop = true;
  console.log('LOOPING...');
  
  const currentState = await getCurrentState(config, assetInfo);
  const {latestPrice, currentEscrows, decimals} = currentState;
  if (!assetInfo) {
    assetInfo = currentState.assetInfo;
  }
  
  if (latestPrice === undefined || latestPrice === 0) {
    await sleep(1000);
    runLoop({assetInfo, config, lastBlock, runState});
    return;
  }

  const {createEscrowPrices, cancelSet} =
      getPlannedOrderChanges({config, currentEscrows, latestPrice});

  await cancelOrdersAndUpdateDB({config, cancelSet, latestPrice, currentEscrows});

  await placeOrdersAndUpdateDB({config, createEscrowPrices, decimals, latestPrice});
  
  runState.inRunLoop = false;
  await sleep(1000);
  runLoop({assetInfo, config, lastBlock, runState});
};

module.exports = runLoop;