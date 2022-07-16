const getEscrowsToCancelAndMake = require('./getEscrowsToCancelAndMake');
const getIdealPrices = require('./getIdealPrices');

const escrows = [
  {doc: {order: {price: 12.3, type:'buy'},
        _id:'ESCROWADDR_BUY1' }},
  {doc: {order: {price: 12.1, type:'buy'},
        _id:'ESCROWADDR_BUY2' }},
  {doc: {order: {price: 11.9, type:'buy'},
        _id:'ESCROWADDR_BUY3' }},
  {doc: {order: {price: 12.5, type:'sell'},
        _id:'ESCROWADDR_SELL1' }},
  {doc: {order: {price: 12.7, type:'sell'},
        _id:'ESCROWADDR_SELL2' }},
  {doc: {order: {price: 12.9, type:'sell'},
        _id:'ESCROWADDR_SELL3' }},
];

test('all orders cancel', () => {
  const latestPrice = 13;
  const minSpreadPerc = 0.0035;
  const nearestNeighborKeep = 0.0025;
  const idealPrices = getIdealPrices(3, latestPrice, minSpreadPerc);
  const escrowChanges = 
    getEscrowsToCancelAndMake({escrows, latestPrice, minSpreadPerc,
        nearestNeighborKeep, idealPrices});
  
  const cancelSet = new Set(escrowChanges.cancelEscrowAddrs);
  const allAddrSet = new Set(escrows.map(escrow => escrow.doc._id));
  expect(cancelSet).toEqual(allAddrSet);
});