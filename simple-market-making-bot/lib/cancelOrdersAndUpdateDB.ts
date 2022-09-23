import getCancelPromises from './getCancelPromises';
import {cancelOrders} from './cancelOrders';

const cancelOrdersAndUpdateDB =
  async ({config, cancelSet, latestPrice, currentEscrows}) => {
    const {escrowDB, api} = config;

    const cancelPromises =
      await getCancelPromises({escrows: currentEscrows, cancelSet,
        api, latestPrice});
    await cancelOrders(escrowDB, currentEscrows, cancelPromises);
  };

export default cancelOrdersAndUpdateDB;
