import orderDepthAmounts from '../../order-depth-amounts';
import { BotConfig } from '../../types/config';
import { EscrowToMake } from '../getEscrowsToCancelAndMake';

export interface PlaceOrderInput {
  config: BotConfig
  createEscrowPrices: EscrowToMake[]
  decimals: number
  latestPrice: number
}

const placeOrders = ({config, createEscrowPrices, decimals, latestPrice}:PlaceOrderInput) => {
  const {assetId, orderAlgoDepth, api} = config;

  const placedOrders = createEscrowPrices.map(priceObj => {
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
    console.log('PLACING ORDER: ',
        JSON.stringify(orderToPlace), ` Latest Price: ${latestPrice}`);
    const orderPromise = api.placeOrder(orderToPlace);
    return orderPromise;
  });
  return placedOrders;
};

export default placeOrders;