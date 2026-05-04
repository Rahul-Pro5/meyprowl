import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"
import { getSaleOrders, getSaleOrderDetails } from "@/lib/unicommerce/orders"
import { getInventorySnapshot } from "@/lib/unicommerce/inventory"
import { getItemDetails } from "@/lib/unicommerce/items"

const CHANNELS = ["nykaa", "amazon", "myntra", "alaya", "alaya_select"]

export async function POST(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const supabase = createServerClient()
  const stats = { orders: 0, items: 0, inventoryRows: 0, errors: [] as string[] }

  try {
    // Sync last 7 days of orders
    const to = new Date()
    const from = new Date(Date.now() - 7 * 86400000)

    for (const channel of CHANNELS) {
      try {
        const orders = await getSaleOrders(from, to, channel)
        for (const order of orders) {
          // Upsert item master
          const details = await getSaleOrderDetails(order.code)
          if (details?.saleOrderItems) {
            const lineItems = Array.isArray(details.saleOrderItems)
              ? details.saleOrderItems
              : [details.saleOrderItems]

            for (const li of lineItems) {
              const item = await getItemDetails(li.itemSku)
              if (item) {
                await supabase.from("items").upsert({
                  sku: item.skuCode,
                  name: item.name,
                  mrp: item.mrp,
                  last_synced: new Date().toISOString(),
                }, { onConflict: "sku" })
                stats.items++
              }
            }
          }

          // Upsert sale order
          await supabase.from("sale_orders").upsert({
            id: order.code,
            channel_id: channel,
            status: order.status,
            total_amount: order.totalSellingPrice,
            item_count: details?.saleOrderItems
              ? (Array.isArray(details.saleOrderItems) ? details.saleOrderItems.length : 1)
              : 0,
            order_date: order.created ?? new Date().toISOString(),
            synced_at: new Date().toISOString(),
          }, { onConflict: "id" })

          // Upsert line items
          if (details?.saleOrderItems) {
            const lineItems = Array.isArray(details.saleOrderItems)
              ? details.saleOrderItems
              : [details.saleOrderItems]
            await supabase.from("sale_order_items").upsert(
              lineItems.map((li) => ({
                order_id: order.code,
                sku: li.itemSku,
                quantity: li.quantity ?? 1,
                selling_price: li.sellingPrice,
                mrp: li.mrp,
              }))
            )
          }

          stats.orders++
        }
      } catch (e: any) {
        stats.errors.push(`Channel ${channel}: ${e.message}`)
      }
    }

    // Sync inventory snapshot
    try {
      const snapshot = await getInventorySnapshot()
      const rows = snapshot.map((s) => ({
        sku: s.itemSKU,
        shelf_id: s.shelfCode,
        available_qty: s.availableQuantity,
        total_qty: s.totalQuantity,
        snapshot_at: new Date().toISOString(),
      }))
      if (rows.length) {
        await supabase.from("inventory_snapshots").insert(rows)
        stats.inventoryRows = rows.length
      }
    } catch (e: any) {
      stats.errors.push(`Inventory: ${e.message}`)
    }

    return NextResponse.json({ success: true, stats })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
