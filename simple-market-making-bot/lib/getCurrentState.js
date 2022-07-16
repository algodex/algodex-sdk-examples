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
const getPlannedOrderChanges = require('./getPlannedOrderChanges');
const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB');

const getCurrentState = async (config, assetInfo) => {
  const {assetId, walletAddr, minSpreadPerc, nearestNeighborKeep, 
    escrowDB, ladderTiers, useTinyMan, api, environment, orderAlgoDepth} = config;
    
  const openAccountSet = await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  if (!api.wallet) {
    await initWallet(api, walletAddr);
  }
  if (!assetInfo) {
    assetInfo = await getAssetInfo({indexerClient: api.indexer, assetId});
  }
  const decimals = assetInfo.asset.params.decimals;

  const currentEscrows = await getCurrentOrders(escrowDB, api.indexer, openAccountSet);

  const latestPrice = await getLatestPrice(assetId, environment, useTinyMan);
  return {latestPrice, currentEscrows, decimals, assetInfo, openAccountSet};
}

module.exports = getCurrentState;