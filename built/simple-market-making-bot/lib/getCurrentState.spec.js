const getCurrentState = require('./getCurrentState');
const assetInfo = { asset: { params: { decimals: 6 } } };
jest.mock('./getLatestPrice', () => jest.fn(() => new Promise(resolve => resolve('latestPriceResult'))));
jest.mock('./initWallet', () => jest.fn(() => new Promise(resolve => resolve('completed'))));
jest.mock('./getAssetInfo', () => jest.fn(() => new Promise(resolve => resolve(assetInfo))));
jest.mock('./getCurrentOrders', () => jest.fn(() => new Promise(resolve => resolve('currentEscrowsResult'))));
jest.mock('./getOpenAccountSetFromAlgodex', () => jest.fn(() => new Promise(resolve => resolve('openAccountSet'))));
const getLatestPrice = require('./getLatestPrice');
const initWallet = require('./initWallet');
const getAssetInfo = require('./getAssetInfo');
const getCurrentOrders = require('./getCurrentOrders');
const getOpenAccountSetFromAlgodex = require('./getOpenAccountSetFromAlgodex');
test('Calls all state initialization functions', async () => {
    const config = {
        assetId: 5555,
        walletAddr: 'my wallet address',
        escrowDB: 'escrow DB object',
        useTinyMan: true,
        api: { indexer: 'algorand indexer obj' },
        environment: 'testnet',
    };
    const state = await getCurrentState(config, null);
    const getLatestPriceMock = getLatestPrice.mock;
    const initWalletMock = initWallet.mock;
    const getAssetInfoMock = getAssetInfo.mock;
    const getCurrentOrdersMock = getCurrentOrders.mock;
    const getOpenAccountSetFromAlgodexMock = getOpenAccountSetFromAlgodex.mock;
    expect(getLatestPriceMock.calls).toEqual([[5555, 'testnet', true]]);
    expect(initWalletMock.calls).toEqual([[{ 'indexer': 'algorand indexer obj' }, 'my wallet address']]);
    expect(getAssetInfoMock.calls).toEqual([[{ 'indexerClient': 'algorand indexer obj', 'assetId': 5555 }]]);
    expect(getCurrentOrdersMock.calls).toEqual([['escrow DB object',
            'algorand indexer obj', 'openAccountSet']]);
    expect(getOpenAccountSetFromAlgodexMock.calls).toEqual([['testnet',
            'my wallet address', 5555]]);
    expect(state).toEqual({
        'latestPrice': 'latestPriceResult', 'currentEscrows': 'currentEscrowsResult',
        'decimals': 6, 'assetInfo': { 'asset': { 'params': { 'decimals': 6 } } },
        'openAccountSet': 'openAccountSet',
    });
    return;
});
