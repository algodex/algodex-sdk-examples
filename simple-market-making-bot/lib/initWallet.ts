const initWallet = async (algodexApi:any, walletAddr:string):Promise<any> => {
  await algodexApi.setWallet({
    'type': 'sdk',
    'address': walletAddr,
    'connector': require('@algodex/algodex-sdk/lib/wallet/connectors/AlgoSDK'),
    // eslint-disable-next-line max-len
    'mnemonic': process.env.WALLET_MNEMONIC,
  });
};

export default initWallet;
