const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const getIdealPrices = require('./getIdealPrices');
import { Config } from "../types/config";
import { AllDocsResult } from "../types/order";

export interface PlannedOrderChangesInput {
  config:Config,
  currentEscrows: AllDocsResult,
  latestPrice: number
}

export interface PlannedOrderChanges {
  
}

const getPlannedOrderChanges = (plannedOrderChanges:PlannedOrderChangesInput):PlannedOrderChanges => {
  const {config, currentEscrows, latestPrice} = plannedOrderChanges;
  const {minSpreadPerc, nearestNeighborKeep, ladderTiers} = config;

  const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
  const {createEscrowPrices, cancelEscrowAddrs} = getEscrowsToCancelAndMake(
      {escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices});
  const cancelSet = new Set(cancelEscrowAddrs);

  return {createEscrowPrices, cancelSet};
};

// export default getPlannedOrderChanges;
module.exports = getPlannedOrderChanges;
export {};