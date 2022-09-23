import {LogicSigAccount} from'algosdk';
import { AllDocsResult } from '../types/order';

export interface GetCancelPromisesInput {
  escrows: AllDocsResult
  cancelSet: Set<string>
  api: any
  latestPrice: number
}

const getCancelPromises = async (input:GetCancelPromisesInput) => {
  const {escrows, cancelSet, api, latestPrice} = input;

  return escrows.rows.map(order => order.doc.order)
      .filter(order => cancelSet.has(order.escrowAddr))
      .filter(order => order.contract.data !== undefined)
      .map(dbOrder => {
        const cancelOrderObj:any = {...dbOrder};
        cancelOrderObj.contract.lsig =
          new LogicSigAccount(new Uint8Array(dbOrder.contract.data.data)); //FIXME
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
