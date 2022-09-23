import waitForOrders from './waitForOrders';
import placeOrders from './placeOrders';
import addOrdersToDB from './addOrdersToDB';

const placeOrdersAndUpdateDB = async ({config, createEscrowPrices,
  decimals, latestPrice}) => {
  const ordersToPlace =
    placeOrders({config, createEscrowPrices, decimals, latestPrice});
  const {validResults} = await waitForOrders(ordersToPlace);

  await addOrdersToDB(config.escrowDB, validResults);
};

export default placeOrdersAndUpdateDB;
