const {LogicSigAccount} = require('algosdk');

const getCancelPromises = async ({escrows, cancelSet, api, latestPrice}) => {
  return escrows.rows.map(order => order.doc.order)
      .filter(order => cancelSet.has(order.escrowAddr))
      .filter(order => order.contract.data !== undefined)
      .map(dbOrder => {
        const cancelOrderObj = {...dbOrder};
        cancelOrderObj.contract.lsig =
          new LogicSigAccount(dbOrder.contract.data.data);
        cancelOrderObj.client = api.algod;
        cancelOrderObj.wallet = api.wallet;
        const tempOrder = {...cancelOrderObj};
        delete tempOrder.wallet;
        delete tempOrder.contract;
        delete tempOrder.client;
        console.log('CANCELLING ORDER: ',
            JSON.stringify(tempOrder), ` Latest Price: ${latestPrice}`);
        return api.closeOrder(cancelOrderObj);
      });
};

export default getCancelPromises;
