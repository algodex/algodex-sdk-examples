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
const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB');

const getPlannedOrderChanges = ({config, currentEscrows, latestPrice}) => {
  const {minSpreadPerc, nearestNeighborKeep, ladderTiers} = config;

  const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
  const {createEscrowPrices, cancelEscrowAddrs} = getEscrowsToCancelAndMake(
      {escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices});
  const cancelSet = new Set(cancelEscrowAddrs);

  return {createEscrowPrices, cancelSet};
}

module.exports = getPlannedOrderChanges;
