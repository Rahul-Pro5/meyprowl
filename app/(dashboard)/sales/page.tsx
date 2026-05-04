"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { ChannelFilter } from "@/components/sales/ChannelFilter"
import { SalesRevenueChart } from "@/components/sales/RevenueChart"
import { SKUBreakdownTable } from "@/components/sales/SKUBreakdownTable"
import { KPICard } from "@/components/dashboard/KPICard"
import { Input } from "@/components/ui/input"
import { IndianRupee, ShoppingCart, Package } from "lucide-react"

const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? ""

async function fetchSales(channel: string, from: string, to: string) {
  const params = new URLSearchParams({ from, to, group: "day" })
  if (channel !== "all") params.set("channel", channel)
  const res = await fetch(`/api/sales?${params}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  return res.ok ? res.json() : { data: [] }
}

async function fetchOrders(channel: string, from: string, to: string) {
  const params = new URLSearchParams({ from, to, pageSize: "200" })
  if (channel !== "all") params.set("channel", channel)
  const res = await fetch(`/api/orders?${params}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  return res.ok ? res.json() : { data: [] }
}

function defaultFrom() {
  return new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
}
function defaultTo() {
  return new Date().toISOString().slice(0, 10)
}

export default function SalesPage() {
  const [channel, setChannel] = useState("all")
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [salesData, setSalesData] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchSales(channel, from, to), fetchOrders(channel, from, to)]).then(
      ([sales, ord]) => {
        setSalesData(sales.data ?? [])
        setOrders(ord.data ?? [])
        setLoading(false)
      }
    )
  }, [channel, from, to])

  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = orders.length

  // Aggregate SKU data from order items
  const skuMap: Record<string, { sku: string; units_sold: number; revenue: number; orders: number }> = {}
  for (const order of orders) {
    for (const item of order.sale_order_items ?? []) {
      if (!skuMap[item.sku]) skuMap[item.sku] = { sku: item.sku, units_sold: 0, revenue: 0, orders: 0 }
      skuMap[item.sku].units_sold += item.quantity ?? 0
      skuMap[item.sku].revenue += (item.selling_price ?? 0) * (item.quantity ?? 1)
      skuMap[item.sku].orders += 1
    }
  }
  const skuData = Object.values(skuMap)

  return (
    <div>
      <Header title="Sales Analysis" />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <ChannelFilter selected={channel} onChange={setChannel} />
          <div className="flex items-center gap-2 ml-auto">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} subtitle="selected period" />
          <KPICard title="Total Orders" value={totalOrders} icon={ShoppingCart} subtitle="selected period" />
          <KPICard title="Unique SKUs" value={skuData.length} icon={Package} subtitle="with sales" />
        </div>

        <SalesRevenueChart data={salesData} />
        <SKUBreakdownTable data={skuData} />
      </div>
    </div>
  )
}
