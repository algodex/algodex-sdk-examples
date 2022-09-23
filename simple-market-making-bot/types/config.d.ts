type Environment = 'mainnet' | 'testnet';

export interface Config {
  assetId:number,
  walletAddr:string,
  minSpreadPerc:number,
  nearestNeighborKeep:number,
  escrowDB:any,
  ladderTiers:number,
  useTinyMan:boolean,
  environment:Environment,
  orderAlgoDepth:number,
  api:any
}