import getLatestPrice from './getLatestPrice';
import initWallet from './initWallet';
import getAssetInfo from './getAssetInfo';
import getCurrentOrders from './getCurrentOrders';
import getOpenAccountSetFromAlgodex from './getOpenAccountSetFromAlgodex';
import { BotConfig } from '../types/config';
import { AllDocsResult } from '../types/order';

export interface CurrentState {
  latestPrice: number
  currentEscrows: AllDocsResult
  decimals: number
  assetInfo: any
  openAccountSet: Set<string>
}

const getCurrentState = async (config:BotConfig, assetInfo:any):Promise<CurrentState> => {
  const {assetId, walletAddr,
    escrowDB, useTinyMan, api, environment} = config;

  const openAccountSet =
    await getOpenAccountSetFromAlgodex(environment, walletAddr, assetId);
  if (!api.wallet) {
    await initWallet(api, walletAddr);
  }
  if (!assetInfo) {
    assetInfo = await getAssetInfo({indexerClient: api.indexer, assetId});
  }
  const decimals = assetInfo.asset.params.decimals;

  const currentEscrows =
    await getCurrentOrders(escrowDB, api.indexer, openAccountSet);

  const latestPrice = await getLatestPrice(assetId, environment, useTinyMan);
  return {latestPrice, currentEscrows, decimals, assetInfo, openAccountSet};
};

export default getCurrentState;
