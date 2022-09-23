const { cancelOrders, convertCancelResultsToDBPromises } = require('./cancelOrders');
const escrowDB = {
    remove: jest.fn(doc => new Promise(resolve => resolve('done'))),
};
const orders = {
    rows: [
        {
            doc: {
                order: {
                    escrowAddr: 'algorandaddr1',
                },
            },
        },
    ]
};
test('converts cancel results', () => {
    const results = [[{ 'escrowAddr': 'algorandaddr1' }]];
    convertCancelResultsToDBPromises(escrowDB, results, orders);
    expect(escrowDB.remove.mock.calls.length).toBe(1);
    const mockResults = escrowDB.remove.mock.calls[0][0];
    expect(JSON.stringify(mockResults))
        .toBe(JSON.stringify({ 'order': results[0][0] }));
});
test('executes promises', async () => {
    const promiseResults = [[{ 'escrowAddr': 'algorandaddr1' }]];
    const results = await cancelOrders(escrowDB, orders, [new Promise(resolve => resolve(promiseResults[0]))]);
    expect(results[0]).toBe('done');
});
