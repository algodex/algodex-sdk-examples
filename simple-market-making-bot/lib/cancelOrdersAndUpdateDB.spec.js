const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB').default;

globalThis.cancelled = 0;

jest.mock('./getCancelPromises', () => jest.fn(input => {
  return input.escrows.filter(escrow => input.cancelSet.has(escrow))
      .map(escrow => new Promise( resolve => {
        resolve('cancelled order');
        globalThis.cancelled++;
      }));
}));
jest.mock('./cancelOrders', () => ({
  cancelOrders: jest.fn((escrowDB,
      currentEscrows, cancelPromises) => {
    return Promise.all(cancelPromises);
  }),
}));

const {cancelOrders} = require('./cancelOrders');
const getCancelPromises = require('./getCancelPromises');

// eslint-disable-next-line require-jsdoc
function isPromise(p) {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }

  return false;
}

test('can cancel orders and update DB', async () => {
  const config = {
    escrowDB: 'escrowDB_obj',
    api: 'algodexAPI_obj',
  };
  const cancelSet = new Set(['algorand_address_1']);
  const currentEscrows = ['algorand_address_1', 'algorand_address_2'];
  await cancelOrdersAndUpdateDB({config,
    latestPrice: 12.0, currentEscrows, cancelSet});
  const getCancelPromisesMock = getCancelPromises.mock;
  const cancelOrdersMock = cancelOrders.mock;
  expect(getCancelPromisesMock.calls[0][0]).
      toEqual({'escrows': ['algorand_address_1',
        'algorand_address_2'], 'cancelSet': new Set(['algorand_address_1']),
      'api': 'algodexAPI_obj', 'latestPrice': 12});
  expect(cancelOrdersMock.calls[0][0]).toEqual('escrowDB_obj');
  expect(cancelOrdersMock.calls[0][1])
      .toEqual(['algorand_address_1', 'algorand_address_2']);
  expect(isPromise(cancelOrdersMock.calls[0][2][0])).toBe(true);
  expect(cancelOrdersMock.calls.length).toBe(1);
  expect(globalThis.cancelled).toBe(1);
  return;
});
