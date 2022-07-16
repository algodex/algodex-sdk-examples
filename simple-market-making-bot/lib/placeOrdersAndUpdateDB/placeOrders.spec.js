const placeOrders = require('./placeOrders');

// Mock algodex SDK api
const api = {
  algod: 'algodObjHere',
  wallet: 'my_algorand_wallet_here',
  placeOrder: jest.fn(order => 'placed order'),
};

const createEscrowPrices = [
  {price: 11.9, type: 'buy'},
  {price: 12.0, type: 'buy'},
  {price: 12.2, type: 'sell'},
  {price: 12.3, type: 'sell'},
];

const latestPrice = 0.323;
const decimals = 6;

test('Can place orders', async () => {
  const config = {
    assetId: 661231,
    orderAlgoDepth: 10,
    api,
  };
  const orders =
    await placeOrders({config, createEscrowPrices, decimals, latestPrice});
  expect(orders).toEqual([
    'placed order',
    'placed order',
    'placed order',
    'placed order',
  ]);
  const expectedOrderInput = [
    [
      {
        'asset': {
          'id': 661231,
          'decimals': 6,
        },
        'price': 11.9,
        'amount': 30.959752321981423,
        'execution': 'maker',
        'type': 'buy',
      },
    ],
    [
      {
        'asset': {
          'id': 661231,
          'decimals': 6,
        },
        'price': 12,
        'amount': 30.959752321981423,
        'execution': 'maker',
        'type': 'buy',
      },
    ],
    [
      {
        'asset': {
          'id': 661231,
          'decimals': 6,
        },
        'price': 12.2,
        'amount': 30.959752321981423,
        'execution': 'maker',
        'type': 'sell',
      },
    ],
    [
      {
        'asset': {
          'id': 661231,
          'decimals': 6,
        },
        'price': 12.3,
        'amount': 30.959752321981423,
        'execution': 'maker',
        'type': 'sell',
      },
    ],
  ];

  expect(api.placeOrder.mock.calls).toEqual(expectedOrderInput);
  return;
});
