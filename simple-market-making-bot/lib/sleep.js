
// eslint-disable-next-line require-jsdoc
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = sleep;
