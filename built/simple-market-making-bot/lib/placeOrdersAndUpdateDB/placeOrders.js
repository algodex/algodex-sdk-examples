const orderDepthAmounts = require('../../order-depth-amounts');
const placeOrders = ({ config, createEscrowPrices, decimals, latestPrice }) => {
    const { assetId, orderAlgoDepth, api } = config;
    const placedOrders = createEscrowPrices.map(priceObj => {
        const orderDepth = orderDepthAmounts.hasOwnProperty('' + assetId) ?
            orderDepthAmounts['' + assetId] : orderAlgoDepth;
        const orderToPlace = {
            'asset': {
                'id': assetId,
                'decimals': decimals, // Asset Decimals
            },
            'address': api.wallet.address,
            'price': priceObj.price,
            'amount': orderDepth / latestPrice,
            'execution': 'maker',
            'type': priceObj.type, // Order Type
        };
        console.log('PLACING ORDER: ', JSON.stringify(orderToPlace), ` Latest Price: ${latestPrice}`);
        const orderPromise = api.placeOrder(orderToPlace);
        return orderPromise;
    });
    return placedOrders;
};
module.exports = placeOrders;
