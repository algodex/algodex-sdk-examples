/* eslint-disable camelcase */


jest.mock('./sleep', () => jest.fn(() => {
  return new Promise(resolve => resolve('did sleep'));
}));
jest.mock('./placeOrdersAndUpdateDB', () => ({
  default: jest.fn(() => {
    return new Promise(resolve => resolve('did placeOrdersAndUpdateDB'));
  }),
}));
jest.mock('./getCurrentState', () => ({default: jest.fn(() => {
  return new Promise(resolve => resolve(globalThis.currentState));
})}));
jest.mock('./getPlannedOrderChanges', () => jest.fn(() => {
  return new Promise(resolve => resolve(globalThis.plannedOrderChanges));
}));
jest.mock('./cancelOrdersAndUpdateDB', () => ({
  default: jest.fn(() => {
    return new Promise(resolve => resolve('did cancelOrdersAndUpdateDB'));
  }),
}));

const runLoop = require('./runLoop').default;

const sleep = require('./sleep');
const placeOrdersAndUpdateDB = require('./placeOrdersAndUpdateDB').default;
const getCurrentState = require('./getCurrentState').default;
const getPlannedOrderChanges = require('./getPlannedOrderChanges');
const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB').default;
globalThis.currentState = {
  latestPrice: 5,
  currentEscrows: ['escrowobj1', 'escrowobj2'],
  decimals: 6,
};
globalThis.plannedOrderChanges = {
  createEscrowPrices: [4, 4.5, 5, 5.5],
  cancelSet: new Set(['escrowAddr1']),
};

describe('runLoop tests', () => {
  afterEach(() => {
    globalThis.currentState = {};
    globalThis.plannedOrderChanges = {};
    jest.clearAllMocks();
  });
  test('did run loop', async () => {
    const assetInfo = null;
    const config = 'configObj';
    const lastBlock = null;

    // Spy on run loop and stop it after first iteration
    const validator = {
      set: (target, key, value) => {
        if (target.inRunLoop === true &&
          key === 'inRunLoop' && value === false) {
          target.isExiting = true;
        }
        target[key] = value;
        return true;
      },
    };
    const runState = new Proxy({inRunLoop: false, isExiting: false}
        , validator);
    await runLoop({assetInfo, config, lastBlock, runState});
    const sleep_mock = sleep.mock;
    const placeOrdersAndUpdateDB_mock = placeOrdersAndUpdateDB.mock;
    const getCurrentState_mock = getCurrentState.mock;
    const getPlannedOrderChanges_mock = getPlannedOrderChanges.mock;
    const cancelOrdersAndUpdateDB_mock = cancelOrdersAndUpdateDB.mock;

    expect(sleep_mock.calls).toEqual([[1000]]);
    expect(placeOrdersAndUpdateDB_mock.calls)
        .toEqual([[{'config': 'configObj', 'decimals': 6, 'latestPrice': 5}]]);
    expect(getCurrentState_mock.calls).toEqual([['configObj', null]]);
    expect(getPlannedOrderChanges_mock.calls)
        .toEqual([[{'config': 'configObj', 'currentEscrows':
        ['escrowobj1', 'escrowobj2'], 'latestPrice': 5}]]);
    expect(cancelOrdersAndUpdateDB_mock.calls)
        .toEqual([[{'config': 'configObj', 'latestPrice': 5, 'currentEscrows':
        ['escrowobj1', 'escrowobj2']}]]);
    return;
  });

  test('exits early when cant get state', async () => {
    const assetInfo = null;
    const config = 'configObj';
    const lastBlock = null;

    // Spy on run loop and stop it after first iteration
    const validator = {
      set: (target, key, value) => {
        if (target.inRunLoop === true &&
          key === 'inRunLoop' && value === false) {
          target.isExiting = true;
        }
        target[key] = value;
        return true;
      },
    };
    const runState = new Proxy({inRunLoop: false, isExiting: false}
        , validator);
    await runLoop({assetInfo, config, lastBlock, runState});
    const sleep_mock = sleep.mock;
    const placeOrdersAndUpdateDB_mock = placeOrdersAndUpdateDB.mock;
    const getCurrentState_mock = getCurrentState.mock;
    const getPlannedOrderChanges_mock = getPlannedOrderChanges.mock;
    const cancelOrdersAndUpdateDB_mock = cancelOrdersAndUpdateDB.mock;

    expect(sleep_mock.calls).toEqual([[1000]]);
    expect(placeOrdersAndUpdateDB_mock.calls)
        .toEqual([]);
    expect(getCurrentState_mock.calls).toEqual([['configObj', null]]);
    expect(getPlannedOrderChanges_mock.calls)
        .toEqual([]);
    expect(cancelOrdersAndUpdateDB_mock.calls)
        .toEqual([]);
    return;
  });
});
