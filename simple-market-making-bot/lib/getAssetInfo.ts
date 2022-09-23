
export interface GetAssetInfoInput {
  indexerClient: any
  assetId: number

}
const getAssetInfo = async ({indexerClient, assetId}:GetAssetInfoInput):Promise<any> => {
  const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
  return assetInfo;
};

export default getAssetInfo;