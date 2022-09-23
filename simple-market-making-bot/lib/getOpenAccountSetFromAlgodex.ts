
const axios = require('axios');

const getOpenAccountSetFromAlgodex =
async (environment, walletAddr, assetId) => {
  const url = environment == 'testnet' ?
    'https://testnet.algodex.com/algodex-backend/orders.php?ownerAddr='+walletAddr :
    'https://app.algodex.com/algodex-backend/orders.php?ownerAddr='+walletAddr;
  const orders = await axios({
    method: 'get',
    url: url,
    responseType: 'json',
    timeout: 10000,
  });
  const allOrders =
  [...orders.data.buyASAOrdersInEscrow, ...orders.data.sellASAOrdersInEscrow];
  const arr = allOrders
      .filter(order => order.assetId === assetId)
      .map(order => order.escrowAddress);
  const set = new Set(arr);
  return set;
};

export default getOpenAccountSetFromAlgodex;
