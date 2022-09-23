const getAccountExistsFromIndexer =
  require('./getAccountExistsFromIndexer').default;

const accountInfo = {account: {amount: 4000}};

const mockIndexer = {
  lookupAccountByID: jest.fn(account => {
    return {'do': () => new Promise( (resolve, reject) => {
      if (account ===
        'OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q') {
        resolve(accountInfo);
      } else {
        reject(new Error('account does not exist'));
      }
    }),
    };
  }),
};


test('gets account that exists', async () => {
  // const accountInfo = await indexer.lookupAccountByID('asdsadas').do();
  const accountInfoFromIndexer =
    // eslint-disable-next-line max-len
    await getAccountExistsFromIndexer('OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q',
        mockIndexer);
  expect(accountInfoFromIndexer).toBe(true);
  expect(mockIndexer.lookupAccountByID.mock.calls[0][0])
      .toBe('OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q');
});

test('gets account that doesnt exist', async () => {
  // const accountInfo = await indexer.lookupAccountByID('asdsadas').do();
  const accountInfoFromIndexer =
      await getAccountExistsFromIndexer('wrongaccount', mockIndexer);
  expect(accountInfoFromIndexer).toBe(false);
  const lastCall = mockIndexer.lookupAccountByID.mock.calls.length - 1;
  expect(mockIndexer.lookupAccountByID.mock.calls[lastCall][0]).
      toBe('wrongaccount');
});
