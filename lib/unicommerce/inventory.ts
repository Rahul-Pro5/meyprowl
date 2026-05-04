import { getUnicommerceClient } from "./client"
import { wsseHeader } from "./auth"
import type { UCInventoryItem } from "./types"

function credentials() {
  return {
    username: process.env.UNICOMMERCE_USERNAME!,
    password: process.env.UNICOMMERCE_PASSWORD!,
  }
}

export async function getInventorySnapshot(skuList?: string[]): Promise<UCInventoryItem[]> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const params: Record<string, unknown> = { inventoryType: "GOOD" }
  if (skuList?.length) params.itemTypeSKUs = { string: skuList }

  const [result] = await (client as any).getInventorySnapshotAsync(params)
  const items = result?.inventorySnapshotList?.inventorySnapshot ?? []
  return Array.isArray(items) ? items : [items]
}

export async function adjustInventory(
  skuCode: string,
  shelfCode: string,
  quantity: number,
  type: "GOOD" | "BAD" = "GOOD"
): Promise<boolean> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const [result] = await (client as any).inventoryAdjustmentAsync({
    inventoryAdjustments: {
      inventoryAdjustment: {
        itemSKU: skuCode,
        shelfCode,
        inventoryType: type,
        quantity,
        adjustmentType: "SET",
      },
    },
  })

  return result?.successful === true || result?.successful === "true"
}
