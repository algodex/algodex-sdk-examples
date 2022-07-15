const getAccountExistsFromIndexer = require('./getAccountExistsFromIndexer');

const accountInfo = {account: {amount: 4000}};

const mockIndexer = {
  lookupAccountByID: jest.fn(account => {
    return {'do': () => new Promise(resolve => resolve(accountInfo))}
  })
};


test('gets account', async () => {
  //const accountInfo = await indexer.lookupAccountByID('asdsadas').do();
  const accountInfoFromIndexer =
    await getAccountExistsFromIndexer('algorandaddress', mockIndexer);
  expect(accountInfoFromIndexer).toBe(true);
  expect(mockIndexer.lookupAccountByID.mock.calls[0][0]).toBe('algorandaddress');
});