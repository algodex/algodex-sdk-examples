export interface DBQueryResult {
  rows: Array<DBOrder>
}

export interface AllDocsResult {
  rows: Array<OrderDoc>
}

export interface OrderDoc {
  doc: DBOrder
}
export interface DBOrder {
  _id: string
  _rev: string
  order: Order
}

export interface Order {
  escrowAddr?:string
  unixTime: number
  address: string
  version: number
  price: number
  amount: number
  total: number
  asset: Asset
  assetId: number
  type: string
  appId: number
  contract: Contract
}

export interface Asset {
  id: number
  decimals: number
}

export interface Contract {
  creator: string
  data: Data
  escrow: string
}

export interface Data {
  type: string
  data: number[]
}