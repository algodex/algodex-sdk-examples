const initWallet = require('./initWallet');
const initAPI = require('./initAPI');
const algosdk = require('algosdk');
const AlgodexAPI = require('@algodex/algodex-sdk');

  const algodexApiMock = {
    setWallet: jest.fn(input =>  new Promise(resolve => resolve(input)))
  }
  // remove: jest.fn(doc => new Promise(resolve => resolve('done'))),

test('can initialize wallet', async () => {
  process.env.ALGOD_SERVER = 'http://algod-server';
  process.env.ALGOD_PORT = 8080;
  process.env.ALGOD_TOKEN = 'asdasdasda';

  process.env.INDEXER_SERVER = 'http://indexer-server';
  process.env.INDEXER_PORT = 8080;
  process.env.INDEXER_TOKEN = 'bbbadasda';

  let account = algosdk.generateAccount();
  let passphrase = algosdk.secretKeyToMnemonic(account.sk);

  // const api = initAPI('testnet');
  process.env.WALLET_MNEMONIC = passphrase;
  const wallet = await initWallet(algodexApiMock, account);
  const firstCall = algodexApiMock.setWallet.mock.calls[0][0];
  expect(firstCall.type).toEqual('sdk');
  expect(firstCall.address).toEqual(account);
  expect(firstCall.mnemonic).toEqual(passphrase);
  console.log(wallet);
  // const al
  // const algodexApiMock = {
  //   setWallet: jest.fn(input => 
  // }
});