const waitForOrders = require('./waitForOrders');
const sleep = require('../sleep');

test('Can wait for orders', async() => {
  const ordersToPlace = [
    new Promise( (resolve, reject) => {
      resolve('order placed');
    }),
    new Promise( (resolve, reject) => {
      resolve('order placed');
    }),
    new Promise( (resolve, reject) => {
      reject(new Error('could not place order'));
    }),  
  ];
  const {validResults, invalidResults} = await waitForOrders(ordersToPlace);
  expect(validResults).toEqual(["order placed","order placed"]);
  expect(invalidResults.length).toBe(1);
  // expect(invalidResults).toEqual(
  return;
});
