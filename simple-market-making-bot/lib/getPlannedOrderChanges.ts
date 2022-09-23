import {getEscrowsToCancelAndMake, EscrowToCancel, EscrowToMake } from './getEscrowsToCancelAndMake';
import getIdealPrices from './getIdealPrices';
import { BotConfig } from "../types/config";
import { AllDocsResult } from "../types/order";

export interface PlannedOrderChangesInput {
  config:BotConfig
  currentEscrows: AllDocsResult
  latestPrice: number
}

export interface PlannedOrderChanges {
  createEscrowPrices:EscrowToMake[]
  cancelSet:Set<string>
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

export default getPlannedOrderChanges;
