const AlgodexAPI = require('@algodex/algodex-sdk');

const initAPI = environment => {
  return new AlgodexAPI({config: {
    'algod': {
      'uri': process.env.ALGOD_SERVER,
      'token': process.env.ALGOD_TOKEN || '',
      'port': process.env.ALGOD_PORT ?
        parseInt(process.env.ALGOD_PORT) : undefined,
    },
    'indexer': {
      'uri': process.env.INDEXER_SERVER,
      'token': process.env.INDEXER_TOKEN || '',
      'port': process.env.INDEXER_PORT ?
        parseInt(process.env.INDEXER_PORT) : undefined,
    },
    'explorer': {
      'uri': environment === 'mainnet' ? 'https://indexer.testnet.algoexplorerapi.io' :
      'https://indexer.algoexplorerapi.io',
    },
    'dexd': {
      'uri': environment === 'mainnet' ? 'https://app.algodex.com/algodex-backend' :
        'https://testnet.algodex.com/algodex-backend',
      'token': '',
    },
  }});
};

export default initAPI;