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

const cancelOrdersAndUpdateDB = async ({config, cancelSet, latestPrice, currentEscrows}) => {
  const {escrowDB, api} = config;

  const cancelPromises = await getCancelPromises({escrows: currentEscrows, cancelSet,
    api, latestPrice});
  await cancelOrders(escrowDB, currentEscrows, cancelPromises);
};

module.exports = cancelOrdersAndUpdateDB;
