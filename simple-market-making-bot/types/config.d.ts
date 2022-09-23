import { BotDB } from "./database";

type Environment = 'mainnet' | 'testnet';

export interface BotConfig {
  assetId:number,
  walletAddr:string,
  minSpreadPerc:number,
  nearestNeighborKeep:number,
  escrowDB:BotDB,
  ladderTiers:number,
  useTinyMan:boolean,
  environment:Environment,
  orderAlgoDepth:number,
  api:any
}