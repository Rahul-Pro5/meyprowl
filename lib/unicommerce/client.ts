import soap from "node-soap"

const PROD_WSDL = `https://alaya.unicommerce.com/services/soap/uniware16.wsdl?facility=${process.env.UNICOMMERCE_FACILITY ?? "01"}`
const STAGING_WSDL = `https://staging.unicommerce.com/services/soap/uniware16.wsdl?facility=${process.env.UNICOMMERCE_FACILITY ?? "01"}`

let _client: soap.Client | null = null

export async function getUnicommerceClient(): Promise<soap.Client> {
  if (_client) return _client
  const wsdl = process.env.UNICOMMERCE_USE_PROD === "true" ? PROD_WSDL : STAGING_WSDL
  _client = await soap.createClientAsync(wsdl)
  return _client
}
