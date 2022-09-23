const axios = require('axios');
const getTinymanPrice = async (assetId, environment) => {
    const tinymanPriceURL = environment === 'mainnet' ?
        'https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/' :
        'https://testnet.analytics.tinyman.org/api/v1/current-asset-prices/';
    const assetData = await axios({
        method: 'get',
        url: tinymanPriceURL,
        responseType: 'json',
        timeout: 10000,
    });
    const algoPrice = assetData.data[0].price;
    const latestPrice = assetData.data[assetId].price / algoPrice;
    return latestPrice;
};
module.exports = getTinymanPrice;
