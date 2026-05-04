import { getUnicommerceClient } from "./client"
import { wsseHeader } from "./auth"
import type { UCItem } from "./types"

function credentials() {
  return {
    username: process.env.UNICOMMERCE_USERNAME!,
    password: process.env.UNICOMMERCE_PASSWORD!,
  }
}

export async function getItemDetails(skuCode: string): Promise<UCItem | null> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const [result] = await (client as any).getItemDetailsAsync({ skuCode })
  return result?.itemType ?? null
}

export async function searchItems(searchString?: string): Promise<UCItem[]> {
  const client = await getUnicommerceClient()
  const { username, password } = credentials()
  client.clearSoapHeaders()
  client.addSoapHeader(wsseHeader(username, password))

  const [result] = await (client as any).searchItemTypesAsync({
    searchRequest: { searchString: searchString ?? "" },
  })
  const items = result?.itemTypeList?.itemType ?? []
  return Array.isArray(items) ? items : [items]
}
