export type OrderType = 'buy' | 'sell';

export interface EscrowToMake {
  price:number,
  type:OrderType
}

export interface EscrowToCancel {
  price:number,
  type:OrderType,
  address:string
}

export interface EscrowsToCancelAndMake {
  createEscrowPrices:Array<EscrowToMake>,
  cancelEscrowAddrs:Array<string>
}

export const getEscrowsToCancelAndMake = ({escrows,
  latestPrice, minSpreadPerc, nearestNeighborKeep,
  idealPrices}):EscrowsToCancelAndMake => {
  const bidCancelPoint = latestPrice * (1 - minSpreadPerc);
  const askCancelPoint = latestPrice * (1 + minSpreadPerc);
  const escrowsTemp = escrows.map(escrow => {
    return {
      price: escrow.doc.order.price,
      type: escrow.doc.order.type,
      address: escrow.doc._id,
    };
  });
  const cancelEscrowAddrs:Array<string> = escrowsTemp.filter(escrow => {
    if (escrow.price >
      (bidCancelPoint * (1+0.000501)) && escrow.type === 'buy') {
      return true;
    } else if (escrow.price <
      (askCancelPoint * (1-0.000501)) && escrow.type === 'sell') {
      return true;
    }
    if (idealPrices.find(idealPrice =>
      Math.abs((idealPrice - escrow.price)/escrow.price) <
        nearestNeighborKeep)) {
      return false;
    }
    return true;
  }).map(escrow => escrow.address);
  const cancelAddrSet = new Set(cancelEscrowAddrs);
  const remainingEscrows =
      escrowsTemp.filter(escrow => !cancelAddrSet.has(escrow.address));

  const createEscrowPrices:Array<EscrowToMake> = idealPrices.filter(idealPrice => {
    if (remainingEscrows.find(escrow =>
      Math.abs((idealPrice - escrow.price)/escrow.price) <
      nearestNeighborKeep)) {
      return false;
    }
    return true;
  }).map(price => {
    return {
      price,
      'type': price < latestPrice ? 'buy' : 'sell',
    };
  });

  return {createEscrowPrices, cancelEscrowAddrs};
};
