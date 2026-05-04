export interface UCItem {
  skuCode: string
  name: string
  categoryCode?: string
  categoryName?: string
  sellerSkuCode?: string
  mrp?: number
  description?: string
  enabled?: boolean
}

export interface UCInventoryItem {
  itemSKU: string
  shelfCode: string
  inventoryType: string
  availableQuantity: number
  totalQuantity: number
  locationCode?: string
}

export interface UCSaleOrder {
  code: string
  channel?: string
  displayOrderCode?: string
  status: string
  totalSellingPrice?: number
  saleOrderItems?: UCSaleOrderItem[]
  created?: string
  updated?: string
  dispatchAfterDate?: string
}

export interface UCSaleOrderItem {
  code: string
  itemSku: string
  statusCode: string
  sellingPrice?: number
  mrp?: number
  quantity?: number
}

export interface UCOrderSearchResult {
  code: string
  channel?: string
  status: string
  totalSellingPrice?: number
  created?: string
  updated?: string
}
