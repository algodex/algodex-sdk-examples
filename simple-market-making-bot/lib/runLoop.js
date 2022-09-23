const sleep = require('./sleep');
const placeOrdersAndUpdateDB = require('./placeOrdersAndUpdateDB').default;
const getCurrentState = require('./getCurrentState').default;
const getPlannedOrderChanges = require('./getPlannedOrderChanges');
const cancelOrdersAndUpdateDB = require('./cancelOrdersAndUpdateDB').default;

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

module.exports = runLoop;
