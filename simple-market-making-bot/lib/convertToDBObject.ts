import { Order } from "../types/order";

const convertToDBObject = (dbOrder:Order):Order => {
  const obj = {
    unixTime: Math.round(Date.now()/1000),
    address: dbOrder.address,
    escrowAddr: dbOrder.address,
    version: dbOrder.version,
    price: dbOrder.price,
    amount: dbOrder.amount,
    total: dbOrder.price * dbOrder.amount,
    asset: {id: dbOrder.asset.id, decimals: 6},
    assetId: dbOrder.asset.id,
    type: dbOrder.type,
    appId: dbOrder.type === 'buy' ?
      parseInt(process.env.ALGODEX_ALGO_ESCROW_APP!) :
      parseInt(process.env.ALGODEX_ASA_ESCROW_APP!),
    contract: {
      creator: dbOrder.contract.creator,
      data: dbOrder.contract.lsig!.lsig.logic.toJSON(),
      escrow: dbOrder.contract.escrow,
    },
  };
  return obj;
};

export default convertToDBObject;
