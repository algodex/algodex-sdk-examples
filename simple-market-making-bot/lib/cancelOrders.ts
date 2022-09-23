import { BotDB } from "../types/database";
import { AllDocsResult } from "../types/order";

interface CancelResult {
    escrowAddr:string;
}


export const convertCancelResultsToDBPromises = (escrowDB:BotDB, results:CancelResult[][],
    orders:AllDocsResult) => {
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

export const cancelOrders = async (escrowDB:BotDB, orders:AllDocsResult, cancelPromises:any) => {
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

