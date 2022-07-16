const convertToDBObject = require('../convertToDBObject');
const orderDepthAmounts = require('../../order-depth-amounts');

const placeOrdersAndUpdateDB = async ({config, createEscrowPrices,
  decimals, latestPrice}) => {
const {assetId, escrowDB, api, orderAlgoDepth} = config;

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
}

module.exports = placeOrdersAndUpdateDB;