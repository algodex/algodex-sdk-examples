const initAPI = require('./initAPI').default;

// const algodexApiMock = {
//   setWallet: jest.fn(input =>  new Promise(resolve => resolve(input)))
// }
// remove: jest.fn(doc => new Promise(resolve => resolve('done'))),

test('can initialize api', () => {
  process.env.ALGOD_SERVER = 'http://algod-server';
  process.env.ALGOD_PORT = 8080;
  process.env.ALGOD_TOKEN = 'asdasdasda';

  process.env.INDEXER_SERVER = 'http://indexer-server';
  process.env.INDEXER_PORT = 8080;
  process.env.INDEXER_TOKEN = 'bbbadasda';

  const api = initAPI('testnet');
  expect(api.config).toEqual({
    'algod': {
      'uri': 'http://algod-server',
      'token': 'asdasdasda',
      'port': 8080,
    },
    'indexer': {
      'uri': 'http://indexer-server',
      'token': 'bbbadasda',
      'port': 8080,
    },
    'explorer': {
      'uri': 'https://indexer.algoexplorerapi.io',
    },
    'dexd': {
      'uri': 'https://testnet.algodex.com/algodex-backend',
      'token': '',
    },
  });
});

test('can initialize with null ports and tokens', () => {
  process.env.ALGOD_SERVER = 'http://algod-server';
  delete process.env.ALGOD_PORT;
  delete process.env.ALGOD_TOKEN;

  process.env.INDEXER_SERVER = 'http://indexer-server';
  delete process.env.INDEXER_PORT;
  delete process.env.INDEXER_TOKEN;

  const api = initAPI('testnet');
  expect(api.config).toEqual({
    'algod': {
      'uri': 'http://algod-server',
      'token': '',
    },
    'indexer': {
      'uri': 'http://indexer-server',
      'token': '',
    },
    'explorer': {
      'uri': 'https://indexer.algoexplorerapi.io',
    },
    'dexd': {
      'uri': 'https://testnet.algodex.com/algodex-backend',
      'token': '',
    },
  });
});

test('can initialize with empty ports and tokens', () => {
  process.env.ALGOD_SERVER = 'http://algod-server';
  process.env.ALGOD_PORT = '';
  process.env.ALGOD_TOKEN = '';

  process.env.INDEXER_SERVER = 'http://indexer-server';
  process.env.INDEXER_PORT = '';
  process.env.INDEXER_TOKEN = '';

  const api = initAPI('testnet');
  expect(api.config).toEqual({
    'algod': {
      'uri': 'http://algod-server',
      'token': '',
    },
    'indexer': {
      'uri': 'http://indexer-server',
      'token': '',
    },
    'explorer': {
      'uri': 'https://indexer.algoexplorerapi.io',
    },
    'dexd': {
      'uri': 'https://testnet.algodex.com/algodex-backend',
      'token': '',
    },
  });
});
