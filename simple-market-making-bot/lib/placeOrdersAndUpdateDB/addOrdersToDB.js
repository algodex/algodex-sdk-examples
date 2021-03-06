const convertToDBObject = require('../convertToDBObject');

const addOrdersToDB = async (escrowDB, validResults) => {
  const ordersAddToDB = validResults
      .filter(order => order[0].contract.amount > 0)
      .map(order => {
        return escrowDB.put({
          '_id': order[0].contract.escrow,
          'order': convertToDBObject(order[0]),
        });
      });
  return await Promise.all(ordersAddToDB).catch(e => {
    console.error(e);
  });
};

module.exports = addOrdersToDB;
