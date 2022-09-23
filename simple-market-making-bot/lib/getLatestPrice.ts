const getTinymanPrice = require('./getTinymanPrice').default;
const axios = require('axios');

const getLatestPrice = async (assetId, environment, useTinyMan = false) => {
  if (useTinyMan) {
    return await getTinymanPrice(assetId, environment);
  }
  const ordersURL = environment === 'testnet' ?
  'https://testnet.algodex.com/algodex-backend/assets.php' :
  'https://app.algodex.com/algodex-backend/assets.php';

  const assetData = await axios({
    method: 'get',
    url: ordersURL,
    responseType: 'json',
    timeout: 10000,
  });
  const assets = assetData.data.data;
  const latestPrice = assets.find(asset => asset.id === assetId).price;
  return latestPrice;
};

export default getLatestPrice;
