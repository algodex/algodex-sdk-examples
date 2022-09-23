const getLatestPrice = require('./getLatestPrice').default;
const initWallet = require('./initWallet').default;
const getAssetInfo = require('./getAssetInfo').default;
const getCurrentOrders = require('./getCurrentOrders');
const getOpenAccountSetFromAlgodex =
  require('./getOpenAccountSetFromAlgodex').default;

const getCurrentState = async (config, assetInfo) => {
  const {assetId, walletAddr,
    escrowDB, useTinyMan, api, environment} = config;

  const openAccountSet =
    await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  if (!api.wallet) {
    await initWallet(api, walletAddr);
  }
  if (!assetInfo) {
    assetInfo = await getAssetInfo({indexerClient: api.indexer, assetId});
  }
  const decimals = assetInfo.asset.params.decimals;

  const currentEscrows =
    await getCurrentOrders(escrowDB, api.indexer, openAccountSet);

  const latestPrice = await getLatestPrice(assetId, environment, useTinyMan);
  return {latestPrice, currentEscrows, decimals, assetInfo, openAccountSet};
};

export default getCurrentState;