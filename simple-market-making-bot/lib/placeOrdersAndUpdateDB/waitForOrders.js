
const waitForOrders = async ordersToPlace => {
  const results = await Promise.all(ordersToPlace.map(p => p.catch(e => e)));
  const validResults = results.filter(result => !(result instanceof Error));
  const invalidResults = results.filter(result => (result instanceof Error));
  if (invalidResults && invalidResults.length > 0) {
    console.error({invalidResults});
  }
  return {validResults, invalidResults};
};

module.exports = waitForOrders;
