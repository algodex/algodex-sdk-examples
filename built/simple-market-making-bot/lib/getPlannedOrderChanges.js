"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const getIdealPrices = require('./getIdealPrices');
const getPlannedOrderChanges = (plannedOrderChanges) => {
    const { config, currentEscrows, latestPrice } = plannedOrderChanges;
    const { minSpreadPerc, nearestNeighborKeep, ladderTiers } = config;
    const idealPrices = getIdealPrices(ladderTiers, latestPrice, minSpreadPerc);
    const { createEscrowPrices, cancelEscrowAddrs } = getEscrowsToCancelAndMake({ escrows: currentEscrows.rows,
        latestPrice, minSpreadPerc, nearestNeighborKeep, idealPrices });
    const cancelSet = new Set(cancelEscrowAddrs);
    return { createEscrowPrices, cancelSet };
};
// export default getPlannedOrderChanges;
module.exports = getPlannedOrderChanges;
