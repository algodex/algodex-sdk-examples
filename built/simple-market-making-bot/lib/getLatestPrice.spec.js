const getLatestPrice = require('./getLatestPrice');
jest.mock('axios', req => jest.fn(req => {
    if (req.url === 'https://testnet.algodex.com/algodex-backend/assets.php') {
        return { data: { 'ok': true, 'rows': 237, 'data': [{ 'id': 442424, 'unix_time': 1657428189,
                        'price': 0.068907007455, 'priceBefore': 0.068907007455, 'price24Change': 0, 'isTraded': true },
                    { 'id': 3333332, 'unix_time': 1657962386,
                        'price': 3.061931833692, 'priceBefore': 3.08962015105,
                        'price24Change': -0.89617221549356, 'isTraded': true }] },
        };
    }
    else if (req.url === 'https://app.algodex.com/algodex-backend/assets.php') {
        // Mainnet
        return { data: { 'ok': true, 'rows': 237, 'data': [{ 'id': 333, 'unix_time': 1657428189,
                        'price': 0.05555, 'priceBefore': 0.068907007455, 'price24Change': 0, 'isTraded': true },
                    { 'id': 444, 'unix_time': 1657962386,
                        'price': 3.222, 'priceBefore': 3.08962015105,
                        'price24Change': -0.89617221549356, 'isTraded': true }] },
        };
    }
    else if (req.url === 'https://mainnet.analytics.tinyman.org/api/v1/current-asset-prices/') {
        // asset 0 is price of algo
        return { data: { '0': { 'price': 2 }, '542132831': { 'price': 2.1e-05 }, '793124631': { 'price': 0.330026 },
                '378382099': { 'price': 0.190918 } } };
    }
    else if (req.url === 'https://testnet.analytics.tinyman.org/api/v1/current-asset-prices/') {
        return { data: { '0': { 'price': 2 }, '111': { 'price': 555 }, '233': { 'price': 0.777 }, '444': { 'price': 0.999 } } };
    }
}).mockName('axios'));
test('get latest price from algodex', async () => {
    const price = await getLatestPrice(3333332, 'testnet', false);
    expect(price).toEqual(3.061931833692);
    const price2 = await getLatestPrice(333, 'mainnet', false);
    expect(price2).toEqual(0.05555);
});
test('get latest price from tinyman', async () => {
    const price = await getLatestPrice(233, 'testnet', true);
    expect(price).toEqual(0.777 / 2);
    const price2 = await getLatestPrice(542132831, 'mainnet', true);
    expect(price2).toEqual(2.1e-05 / 2);
});
