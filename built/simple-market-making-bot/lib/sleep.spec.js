const sleep = require('./sleep');
// eslint-disable-next-line no-unused-vars
const callback = ms => {
    globalThis.didSleep = ms;
};
// eslint-disable-next-line no-unused-vars
const setTimeout = (callback, ms) => {
    callback(ms);
};
test('did sleep', async () => {
    await sleep(40);
    expect(globalThis.didSleep === 40);
});
