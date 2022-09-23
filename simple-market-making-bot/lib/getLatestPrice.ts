import { Environment } from '../types/config';
import getTinymanPrice from './getTinymanPrice';
const axios = require('axios');

const getLatestPrice = async (assetId:number, 
    environment:Environment, useTinyMan:boolean = false):Promise<number> => {
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
