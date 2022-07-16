const getPlannedOrderChanges = require('./getPlannedOrderChanges');

jest.mock('./getEscrowsToCancelAndMake', () => jest.fn(() => {
  return {createEscrowPrices: [44.1, 44.2, 44.3],
    cancelEscrowAddrs: ['algorand addr1']};
}));
jest.mock('./getIdealPrices', () => jest.fn(() => {
  return [44.1, 44.2, 44.3, 44.4];
}));
const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const getIdealPrices = require('./getIdealPrices');

test('Can get planned order changes', () => {
  const config = {
    minSpreadPerc: 0.0035,
    nearestNeighborKeep: 0.0025,
    ladderTiers: 4,
  };
  const currentEscrows = {rows: [
    'escrow_addr_1',
    'escrow_addr_2',
  ]};
  const latestPrice = 44.25;

  const {createEscrowPrices, cancelSet} =
      getPlannedOrderChanges({config, currentEscrows, latestPrice});
  expect(Array.from(cancelSet)).toEqual(['algorand addr1']);
  expect(createEscrowPrices).toEqual([44.1, 44.2, 44.3]);
  const getIdealPricesMock = getIdealPrices.mock;
  const getEscrowsToCancelAndMakeMock = getEscrowsToCancelAndMake.mock;
  expect(getIdealPricesMock.calls).toEqual([[4, 44.25, 0.0035]]);
  expect(getEscrowsToCancelAndMakeMock.calls).toEqual(
      [[{'escrows': ['escrow_addr_1', 'escrow_addr_2'], 'latestPrice': 44.25,
        'minSpreadPerc': 0.0035, 'nearestNeighborKeep': 0.0025,
        'idealPrices': [44.1, 44.2, 44.3, 44.4]}]],
  );
});
