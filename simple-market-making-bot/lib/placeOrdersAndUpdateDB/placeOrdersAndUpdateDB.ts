const waitForOrders = require('./waitForOrders').default;
const placeOrders = require('./placeOrders').default;
const addOrdersToDB = require('./addOrdersToDB').default;

const placeOrdersAndUpdateDB = async ({config, createEscrowPrices,
  decimals, latestPrice}) => {
  const ordersToPlace =
    placeOrders({config, createEscrowPrices, decimals, latestPrice});
  const {validResults} = await waitForOrders(ordersToPlace);

  await addOrdersToDB(config.escrowDB, validResults);
};

export default placeOrdersAndUpdateDB;
