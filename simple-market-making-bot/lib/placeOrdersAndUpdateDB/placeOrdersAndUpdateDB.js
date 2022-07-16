const waitForOrders = require('./waitForOrders');
const placeOrders = require('./placeOrders');
const addOrdersToDB = require('./addOrdersToDB');

const placeOrdersAndUpdateDB = async ({config, createEscrowPrices,
  decimals, latestPrice}) => {
  const ordersToPlace = placeOrders({config, createEscrowPrices, decimals, latestPrice});
  const {validResults} = await waitForOrders(ordersToPlace);

  await addOrdersToDB(config.escrowDB, validResults);
}

module.exports = placeOrdersAndUpdateDB;