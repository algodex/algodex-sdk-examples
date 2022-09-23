const getCancelPromises = require('./getCancelPromises').default;
// const {LogicSigAccount} = require('algosdk');


jest.mock('algosdk', () => {
  const originalModule = jest.requireActual('algosdk');
  return {
    ...originalModule,
    LogicSigAccount: jest.fn(data => 'some data').mockName('LogicSigAccount'),
  };
});


const orders = {
  rows: [
    {
      doc: {
        order: {
          escrowAddr: 'algorand_address_here',
          contract: {data: {data: [0, 3, 5, 7]}},
        },
      },
    },
  ]};

const api = {
  algod: 'algodObjHere',
  wallet: 'my_algorand_wallet_here',
  closeOrder: jest.fn(order => 'good result'),
};

test('Can get cancel promises', async () => {
  const input = {
    escrows: orders,
    cancelSet: new Set(['algorand_address_here']),
    api,
    latestPrice: 155,
  };
  const promises = await getCancelPromises(input);
  const goodResultObj = {
    'escrowAddr': 'algorand_address_here',
    'contract': {
      'data': {
        'data': [0, 3, 5, 7],
      },
      'lsig': {

      },
    },
    'client': 'algodObjHere',
    'wallet': 'my_algorand_wallet_here'};

  expect(promises).toEqual(['good result']);
  expect(api.closeOrder.mock.calls[0][0]).toEqual(goodResultObj);
});
