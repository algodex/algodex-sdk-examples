const addOrdersToDB = require('./addOrdersToDB');
jest.mock('../convertToDBObject', () => ({
  default: jest.fn(order => {
    return order;
  }),
}));
const convertToDBObject = require('../convertToDBObject').default;

const escrowDB = {
  put: jest.fn(doc => new Promise(resolve => resolve('addedToDB'))),
};

const validResults = [
  [{contract: {amount: 50}}],
  [{contract: {amount: 20}}],

];

test('correctly trying to add orders to DB', async () => {
  const results = await addOrdersToDB(escrowDB, validResults);
  expect(results[0] === 'addedToDB' && results[1] === 'addedToDB');
  const mocked = convertToDBObject.mock;
  const expectedCall0 = {'contract': {'amount': 50}};
  const expectedCall1 = {'contract': {'amount': 20}};
  expect(mocked.calls[0][0]).toEqual(expectedCall0);
  expect(mocked.calls[1][0]).toEqual(expectedCall1);

  console.log({convertToDBObject});
});
