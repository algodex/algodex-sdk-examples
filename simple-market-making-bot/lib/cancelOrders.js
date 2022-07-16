const convertCancelResultsToDBPromises = (escrowDB, results, orders) => {
  const addrs = results.map(result => result[0].escrowAddr);
  const resultAddrs = new Set(addrs);
  const removeFromDBPromises = orders.rows
      .filter(order => resultAddrs.has(order.doc.order.escrowAddr))
      .map(order => escrowDB.remove(order.doc));
  if (results.length > 0) {
    console.log({results});
  }
  return removeFromDBPromises;
};

const cancelOrders = async (escrowDB, orders, cancelPromises) => {
  return await Promise.all(cancelPromises).then(async function(results) {
    const removeFromDBPromises =
      convertCancelResultsToDBPromises(escrowDB, results, orders);
    const result = await Promise.all(removeFromDBPromises).catch(function(e) {
      console.error(e);
    });
    return result;
  }).catch(function(e) {
    console.error(e);
  });
};

if (process.env.NODE_ENV === 'test') {
  module.exports = {cancelOrders, convertCancelResultsToDBPromises};
} else {
  module.exports = cancelOrders;
}
