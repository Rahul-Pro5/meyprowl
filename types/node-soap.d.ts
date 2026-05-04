declare module "node-soap" {
  export interface Client {
    addSoapHeader(header: Record<string, unknown>): void
    clearSoapHeaders(): void
    [method: string]: any
  }
  export function createClientAsync(url: string, options?: Record<string, unknown>): Promise<Client>
}
