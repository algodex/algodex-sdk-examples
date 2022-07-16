const getIdealPrices = require('./getIdealPrices');

test('verify ideal prices are fine', () => {
  const latestPrice = 12.5;
  const prices = getIdealPrices(5, latestPrice, 0.0035);
  expect(prices.length === 10);
  const pricesLessThanLatest = prices.filter(price => price < latestPrice);
  const pricesGreaterThanLatest = prices.filter(price => price > latestPrice);
  expect(pricesLessThanLatest.length === 5);
  expect(pricesGreaterThanLatest.length === 5);
  const lowestAsk = prices.filter(price => price > latestPrice)
      .reduce( (lowest, price) => Math.min(lowest, price), 99999);
  const highestBid = prices.filter(price => price < latestPrice)
      .reduce( (highest, price) => Math.max(highest, price), 0);

  expect(highestBid).toBeLessThanOrEqual(latestPrice*(1-0.0035)*(1.0005));
  expect(highestBid).toBeGreaterThanOrEqual(latestPrice*(1-0.0035)*(0.9995));
  expect(lowestAsk).toBeGreaterThanOrEqual(latestPrice*(1+0.0035)*(0.9995));
  expect(lowestAsk).toBeLessThanOrEqual(latestPrice*(1+0.0035)*(1.0005));
});
