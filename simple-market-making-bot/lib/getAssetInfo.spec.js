const getAssetInfo = require('./getAssetInfo');

const assetInfo = {assetInfo: 'someInfo'};

const mockIndexer = {
  lookupAssetByID: jest.fn(account => {
    return {'do': () => new Promise(resolve => resolve(assetInfo))}
  })
};


test('gets assetInfo', async () => {
  //const accountInfo = await indexer.lookupAccountByID('asdsadas').do();
  const assetInfoFromIndexer =
    await getAssetInfo({assetId: 111, indexerClient: mockIndexer});
  expect(assetInfoFromIndexer.assetInfo).toBe('someInfo');
  expect(mockIndexer.lookupAssetByID.mock.calls[0][0]).toBe(111);
});