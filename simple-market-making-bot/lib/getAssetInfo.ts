
export interface GetAssetInfoInput {
  indexerClient: any
  assetId: number

}
const getAssetInfo = async (input:GetAssetInfoInput):Promise<any> => {
  const {indexerClient, assetId} = input;
  const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
  return assetInfo;
};

export default getAssetInfo;