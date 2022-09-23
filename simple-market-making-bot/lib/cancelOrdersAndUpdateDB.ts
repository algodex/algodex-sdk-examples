import getCancelPromises from './getCancelPromises';
import {cancelOrders} from './cancelOrders';
import { BotConfig } from '../types/config';
import { AllDocsResult } from '../types/order';
import { EscrowToCancel } from './getEscrowsToCancelAndMake';

interface CancelOrdersAndUpdateDB {
  config:BotConfig
  cancelSet:Set<string>
  latestPrice:number
  currentEscrows:AllDocsResult
}
const cancelOrdersAndUpdateDB =
  async ({config, cancelSet, latestPrice, currentEscrows}:CancelOrdersAndUpdateDB) => {
    const {escrowDB, api} = config;

    const cancelPromises =
      await getCancelPromises({escrows: currentEscrows, cancelSet,
        api, latestPrice});
    await cancelOrders(escrowDB, currentEscrows, cancelPromises);
  };

export default cancelOrdersAndUpdateDB;
