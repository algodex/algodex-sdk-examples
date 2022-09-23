const getCurrentOrders = require('./getCurrentOrders').default;

const dbOrders = {rows: [{doc:
  {
    '_id': '7P5TBOLTNFHNQE5NP7EQP4CMYJEQM555OVC75SZ7EWV4SGWZXDG7AJJQ7A',
    '_rev': '1-a3c558a6cc1863789e71b3c1cc3cb0e4',
    'order': {
      'address': 'WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI',
      'version': 6,
      'price': 248.45996402801228,
      'amount': 0.012195121951219513,
      'total': 3.029999561317223,
      'asset': {
        'id': 15322902,
        'decimals': 6,
      },
      'type': 'sell',
      'appId': 22045522,
      'contract': {
        'creator': 'WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI',
        'data': {
          'type': 'Buffer',
          'data': ['buffer numbers here'],
        },
        'escrow': '7P5TBOLTNFHNQE5NP7EQP4CMYJEQM555OVC75SZ7EWV4SGWZXDG7AJJQ7A',
      },
    },
  }},
{doc: {
  '_id': 'OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q',
  '_rev': '1-a0626c40e8409f80e245888ff287b3a7',
  'order': {
    'address': 'WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI',
    'version': 6,
    'price': 250.94457738876264,
    'amount': 0.012195121951219513,
    'total': 3.060299724253203,
    'asset': {
      'id': 15322902,
      'decimals': 6,
    },
    'type': 'sell',
    'appId': 22045522,
    'contract': {
      'creator': 'WYWRYK42XADLY3O62N52BOLT27DMPRA3WNBT2OBRT65N6OEZQWD4OSH6PI',
      'data': {
        'type': 'Buffer',
        'data': ['buffer numbers here'],
      },
      'escrow': 'OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q',
    },
  },
}},
]};

const escrowDB = {
  remove: jest.fn(doc => new Promise(resolve => resolve('done'))),
  allDocs: jest.fn(doc => new Promise(resolve => resolve(dbOrders))),
};


test('Only one order is still open', async () => {
  const indexer = null;
  const openAccountSet =
    new Set(['7P5TBOLTNFHNQE5NP7EQP4CMYJEQM555OVC75SZ7EWV4SGWZXDG7AJJQ7A']);
  const currentOrders =
    await getCurrentOrders(escrowDB, indexer, openAccountSet);

  // Only expect first order to be open
  expect(currentOrders).toEqual({rows: [dbOrders.rows[0]]});
});

test('Both orders are still open', async () => {
  const indexer = null;
  const openAccountSet =
    new Set(['7P5TBOLTNFHNQE5NP7EQP4CMYJEQM555OVC75SZ7EWV4SGWZXDG7AJJQ7A',
      'OB2NWBH76FWNQ4IXSMESOK3MIELNJR7U7IUZNUOHKRYSDSMFI4WUDDAQ6Q']);
  const currentOrders =
    await getCurrentOrders(escrowDB, indexer, openAccountSet);

  // Only expect first order to be open
  expect(currentOrders).toEqual({rows: dbOrders.rows});
});

test('No orders are still open', async () => {
  const indexer = null;
  const openAccountSet = new Set();
  const currentOrders =
    await getCurrentOrders(escrowDB, indexer, openAccountSet);

  // Only expect first order to be open
  expect(currentOrders).toEqual({rows: []});
});
