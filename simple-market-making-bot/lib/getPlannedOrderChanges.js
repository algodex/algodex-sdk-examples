const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const getIdealPrices = require('./getIdealPrices');

const getPlannedOrderChanges = ({config, currentEscrows, latestPrice}) => {
  const {minSpreadPerc, nearestNeighborKeep, ladderTiers} = config;

  const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
  const {createEscrowPrices, cancelEscrowAddrs} = getEscrowsToCancelAndMake(
      {escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices});
  const cancelSet = new Set(cancelEscrowAddrs);

  return {createEscrowPrices, cancelSet};
};

module.exports = getPlannedOrderChanges;
