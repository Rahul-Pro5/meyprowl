"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ChannelFilter } from "@/components/sales/ChannelFilter"
import { ExportButton } from "@/components/reports/ExportButton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

const REPORT_TEMPLATES = [
  {
    id: "daily_sales",
    title: "Daily Sales Report",
    description: "Order count and revenue per day for the selected period.",
  },
  {
    id: "channel_sales",
    title: "Channel-wise Sales",
    description: "Revenue and orders broken down by sales channel.",
  },
  {
    id: "inventory_status",
    title: "Inventory Status",
    description: "Current stock levels for all SKUs.",
  },
  {
    id: "order_details",
    title: "Order Details",
    description: "Full order list with line items for the selected period.",
  },
]

function defaultFrom() {
  return new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [channel, setChannel] = useState("all")

  function makeDataFetcher(reportId: string) {
    return async () => {
      const params = new URLSearchParams({ from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z` })
      if (channel !== "all") params.set("channel", channel)

      if (reportId === "daily_sales") {
        params.set("group", "day")
        const res = await fetch(`/api/sales?${params}`, { headers: { Authorization: `Bearer ${API_KEY}` } })
        const json = await res.json()
        return (json.data ?? []).map((d: any) => ({
          Date: d.date,
          Revenue: d.revenue,
          Orders: d.orders,
        }))
      }

      if (reportId === "channel_sales") {
        const res = await fetch(`/api/sales?${params}&group=day`, { headers: { Authorization: `Bearer ${API_KEY}` } })
        const json = await res.json()
        const channelTotals: Record<string, { revenue: number; orders: number }> = {}
        for (const row of json.data ?? []) {
          for (const [ch, rev] of Object.entries(row.channel_breakdown ?? {})) {
            if (!channelTotals[ch]) channelTotals[ch] = { revenue: 0, orders: 0 }
            channelTotals[ch].revenue += rev as number
            channelTotals[ch].orders += 1
          }
        }
        return Object.entries(channelTotals).map(([channel, stats]) => ({
          Channel: channel,
          Revenue: stats.revenue,
          Orders: stats.orders,
        }))
      }

      if (reportId === "inventory_status") {
        const res = await fetch(`/api/inventory`, { headers: { Authorization: `Bearer ${API_KEY}` } })
        const json = await res.json()
        return (json.data ?? []).map((d: any) => ({
          SKU: d.sku,
          Shelf: d.shelf_id,
          Available: d.available_qty,
          Total: d.total_qty,
          LastSynced: d.snapshot_at,
        }))
      }

      if (reportId === "order_details") {
        const res = await fetch(`/api/orders?${params}&pageSize=200`, { headers: { Authorization: `Bearer ${API_KEY}` } })
        const json = await res.json()
        return (json.data ?? []).flatMap((o: any) =>
          (o.sale_order_items ?? [{ sku: "—" }]).map((item: any) => ({
            OrderID: o.id,
            Channel: o.channel_id,
            Status: o.status,
            OrderDate: o.order_date,
            SKU: item.sku,
            Qty: item.quantity ?? "",
            SellingPrice: item.selling_price ?? "",
            TotalAmount: o.total_amount,
          }))
        )
      }

      return []
    }
  }

  return (
    <div>
      <Header title="Reports" />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <ChannelFilter selected={channel} onChange={setChannel} />
          <div className="flex items-center gap-2 ml-auto">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_TEMPLATES.map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader>
                <CardTitle className="text-base">{tpl.title}</CardTitle>
                <CardDescription>{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ExportButton
                  getData={makeDataFetcher(tpl.id)}
                  filename={`alaya-${tpl.id}-${from}-${to}`}
                  label={tpl.title}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
