
const cancelOrders = async (escrowDB, orders, cancelPromises) => {
  await Promise.all(cancelPromises).then(async function(results) {
    const addrs = results.map(result => result[0].escrowAddr);
    const resultAddrs = new Set(addrs);
    const removeFromDBPromises = orders.rows
        .filter(order => resultAddrs.has(order.doc.order.escrowAddr))
        .map(order => escrowDB.remove(order.doc));
    if (results.length > 0) {
      console.log({results});
    }
    await Promise.all(removeFromDBPromises).catch(function(e) {
      console.error(e);
    });
  }).catch(function(e) {
    console.error(e);
  });
};

module.exports = cancelOrders;