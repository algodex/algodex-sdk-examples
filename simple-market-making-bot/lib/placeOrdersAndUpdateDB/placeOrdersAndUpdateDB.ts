import waitForOrders from './waitForOrders';
import placeOrders from './placeOrders';
import addOrdersToDB from './addOrdersToDB';
import { BotConfig } from '../../types/config';
import { EscrowToMake } from '../getEscrowsToCancelAndMake';

export interface PlaceOrdersAndUpdateDBInput {
  config : BotConfig
  createEscrowPrices: EscrowToMake[]
  decimals: number
  latestPrice: number
}
const placeOrdersAndUpdateDB = async ({config, createEscrowPrices,
  decimals, latestPrice}:PlaceOrdersAndUpdateDBInput) => {
  const ordersToPlace =
    placeOrders({config, createEscrowPrices, decimals, latestPrice});
  const {validResults} = await waitForOrders(ordersToPlace);

  await addOrdersToDB(config.escrowDB, validResults);
};

export default placeOrdersAndUpdateDB;
