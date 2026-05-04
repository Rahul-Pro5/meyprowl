import { getUnicommerceClient } from "./client"
import { wsseHeader } from "./auth"
import type { UCOrderSearchResult, UCSaleOrder } from "./types"

function credentials() {
  return {
    username: process.env.UNICOMMERCE_USERNAME!,
    password: process.env.UNICOMMERCE_PASSWORD!,
  }
}

export async function getSaleOrders(
  from: Date,
  to: Date,
  channel?: string,
  status?: string
): Promise<UCOrderSearchResult[]> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const searchRequest: Record<string, unknown> = {
    fromDate: from.toISOString(),
    toDate: to.toISOString(),
    statusTypes: { string: status ? [status] : ["CREATED", "PROCESSING", "DISPATCHED", "COMPLETE", "CANCELLED"] },
  }
  if (channel) searchRequest.channel = channel

  const [result] = await (client as any).getSaleOrdersAsync({ searchRequest })
  const orders = result?.saleOrderList?.saleOrder ?? []
  return Array.isArray(orders) ? orders : [orders]
}

export async function getSaleOrderDetails(code: string): Promise<UCSaleOrder | null> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const [result] = await (client as any).getSaleOrderAsync({ code })
  return result?.saleOrder ?? null
}
