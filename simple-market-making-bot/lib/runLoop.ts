import sleep from './sleep';
import placeOrdersAndUpdateDB from './placeOrdersAndUpdateDB';
import getCurrentState, { CurrentState } from './getCurrentState';
import getPlannedOrderChanges from './getPlannedOrderChanges';
import cancelOrdersAndUpdateDB from './cancelOrdersAndUpdateDB';
import { BotConfig } from '../types/config';

export interface RunLoopInput {
  assetInfo: any
  config: BotConfig
  lastBlock: number
  runState: CurrentState
}
const runLoop = async ({assetInfo, config, lastBlock, runState}) => {
  // const {assetId, walletAddr, minSpreadPerc, nearestNeighborKeep,
  //   escrowDB, ladderTiers, useTinyMan, api,
  // environment, orderAlgoDepth} = config;

  // Note - during jest testing, runState is a Proxy
  if (runState.isExiting) {
    console.log('Exiting!');
    return;
  }
  runState.inRunLoop = true;

  const currentState = await getCurrentState(config, assetInfo);
  const {latestPrice, currentEscrows, decimals} = currentState;
  if (!assetInfo) {
    assetInfo = currentState.assetInfo;
  }

  if (latestPrice === undefined || latestPrice === 0) {
    runState.inRunLoop = false;
    await sleep(1000);
    runLoop({assetInfo, config, lastBlock, runState});
    return;
  }

  const {createEscrowPrices, cancelSet} =
      getPlannedOrderChanges({config, currentEscrows, latestPrice});

  await cancelOrdersAndUpdateDB({config,
    cancelSet, latestPrice, currentEscrows});

  await placeOrdersAndUpdateDB({config,
    createEscrowPrices, decimals, latestPrice});

  runState.inRunLoop = false;
  await sleep(1000);
  runLoop({assetInfo, config, lastBlock, runState});
};

export default runLoop;
