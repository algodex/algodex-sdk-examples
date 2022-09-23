import { AllDocsResult, DBOrder } from "./order";

interface BotDB {
  allDocs({include_docs:boolean}?): Promise<AllDocsResult>
  remove(order:DBOrder):any
  put(any):any
}