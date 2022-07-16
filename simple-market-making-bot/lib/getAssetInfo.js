
const getAssetInfo = async ({indexerClient, assetId}) => {
  const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
  return assetInfo;
};

module.exports = getAssetInfo;
