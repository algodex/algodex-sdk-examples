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

test('some orders cancel A', () => {
  const latestPrice = 12.2;
  const minSpreadPerc = 0.0035;
  const nearestNeighborKeep = 0.0025;
  const idealPrices = [12.06832088196718, 12.109117906194292, 12.15944477122892,
      12.244859837358977, 12.279838509778708, 12.324436467730703];
  const escrowChanges = 
    getEscrowsToCancelAndMake({escrows, latestPrice, minSpreadPerc,
        nearestNeighborKeep, idealPrices});
  
  const cancelSet = new Set(escrowChanges.cancelEscrowAddrs);
  const shouldCancelSet = new Set(['ESCROWADDR_BUY1', 'ESCROWADDR_BUY3', 
    'ESCROWADDR_SELL1', 'ESCROWADDR_SELL2', 'ESCROWADDR_SELL3']);
  expect(cancelSet).toEqual(shouldCancelSet);

  const createEscrowPrices = [
    {
      "price": 12.06832088196718,
      "type": "buy"
    },
    {
      "price": 12.15944477122892,
      "type": "buy"
    },
    {
      "price": 12.244859837358977,
      "type": "sell"
    },
    {
      "price": 12.279838509778708,
      "type": "sell"
    },
    {
      "price": 12.324436467730703,
      "type": "sell"
    }
  ];
  expect(createEscrowPrices).toEqual(escrowChanges.createEscrowPrices);
});

test('some orders cancel B', () => {
  const latestPrice = 12.2;
  const minSpreadPerc = 0.006;
  const nearestNeighborKeep = 0.004;
  const idealPrices = [
    11.909662227031992,
    11.977319665085368,
    12.054716226914762,
    12.126196078424046,
    12.272588787620313,
    12.347532672313463,
    12.416363820085335,
    12.495275320860225
  ];
  const escrowChanges = getEscrowsToCancelAndMake({escrows, latestPrice, minSpreadPerc,
        nearestNeighborKeep, idealPrices});
  
  const cancelSet = new Set(escrowChanges.cancelEscrowAddrs);
  const shouldCancelSet = new Set([
    "ESCROWADDR_BUY1",
    "ESCROWADDR_SELL2",
    "ESCROWADDR_SELL3"
  ]);
  expect(cancelSet).toEqual(shouldCancelSet);

  const createEscrowPrices = [
    {
      "price": 11.977319665085368,
      "type": "buy"
    },
    {
      "price": 12.272588787620313,
      "type": "sell"
    },
    {
      "price": 12.347532672313463,
      "type": "sell"
    },
    {
      "price": 12.416363820085335,
      "type": "sell"
    }
  ];
  expect(createEscrowPrices).toEqual(escrowChanges.createEscrowPrices);
});


test('none cancel', () => {
  const latestPrice = 12.4;
  const minSpreadPerc = 0.006;
  const nearestNeighborKeep = 0.004;
  const idealPrices = escrows.map(escrow => escrow.doc.order.price);
  const escrowChanges = getEscrowsToCancelAndMake({escrows, latestPrice, minSpreadPerc,
        nearestNeighborKeep, idealPrices});
  
  const cancelSet = new Set(escrowChanges.cancelEscrowAddrs);
  const shouldCancelSet = new Set([]);
  expect(cancelSet).toEqual(shouldCancelSet);

  const createEscrowPrices = [];
  expect(createEscrowPrices).toEqual(escrowChanges.createEscrowPrices);
});