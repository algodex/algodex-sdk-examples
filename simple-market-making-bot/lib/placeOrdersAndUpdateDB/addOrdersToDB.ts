import convertToDBObject from '../convertToDBObject';

interface ValidResult {
  contract: {
      amount: number
  }
}

const addOrdersToDB = async (escrowDB:any, validResults: ValidResult[]) => {
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

export default addOrdersToDB;
