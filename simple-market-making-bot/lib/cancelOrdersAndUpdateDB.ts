const getCancelPromises = require('./getCancelPromises');
const {cancelOrders} = require('./cancelOrders');

const cancelOrdersAndUpdateDB =
  async ({config, cancelSet, latestPrice, currentEscrows}) => {
    const {escrowDB, api} = config;

    const cancelPromises =
      await getCancelPromises({escrows: currentEscrows, cancelSet,
        api, latestPrice});
    await cancelOrders(escrowDB, currentEscrows, cancelPromises);
  };

export default cancelOrdersAndUpdateDB;
