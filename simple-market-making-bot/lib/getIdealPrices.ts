const getIdealPrices = (ladderTiers:number, latestPrice:number,
    minSpreadPerc:number):Array<number> => {
  const prices:Array<number> = [];
  for (let i = 1; i <= ladderTiers; i++) {
    const randomOffset = (1+Math.random()*0.001-0.0005);
    const sellPrice = Math.max(0.000001,
        latestPrice * ((1 + minSpreadPerc) ** i) * randomOffset);
    const bidPrice = Math.max(0.000001,
        latestPrice * ((1 - minSpreadPerc) ** i) * randomOffset);
    prices.push(sellPrice);
    prices.push(bidPrice);
  }
  prices.sort();
  return prices;
};

export default getIdealPrices;