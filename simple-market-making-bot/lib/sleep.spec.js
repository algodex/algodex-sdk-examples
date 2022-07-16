const sleep = require('./sleep');

const callback = (ms) => {
  globalThis.didSleep = ms;
};

var setTimeout = (callback, ms) => { callback(ms) };

test('did sleep', async () => {
  await sleep(40);
  expect(globalThis.didSleep === 40);
});