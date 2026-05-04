import { Header } from "@/components/layout/Header"
import { KPICard } from "@/components/dashboard/KPICard"
import { ChannelBreakdown } from "@/components/dashboard/ChannelBreakdown"
import { RecentOrders } from "@/components/dashboard/RecentOrders"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { createServerClient } from "@/lib/supabase/server"
import { ShoppingCart, IndianRupee, Clock, AlertTriangle } from "lucide-react"

async function getDashboardData() {
  const supabase = createServerClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const [ordersToday, recentOrders, salesData, lowStock] = await Promise.all([
    supabase
      .from("sale_orders")
      .select("id, total_amount, status", { count: "exact" })
      .gte("order_date", today.toISOString()),
    supabase
      .from("sale_orders")
      .select("id, channel_id, status, total_amount, order_date, item_count")
      .order("order_date", { ascending: false })
      .limit(20),
    supabase
      .from("sale_orders")
      .select("channel_id, total_amount, order_date")
      .gte("order_date", thirtyDaysAgo.toISOString())
      .neq("status", "CANCELLED"),
    supabase
      .from("current_inventory")
      .select("sku", { count: "exact" })
      .lt("available_qty", 5),
  ])

  const todayOrders = ordersToday.count ?? 0
  const todayRevenue = (ordersToday.data ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const pendingDispatch = (ordersToday.data ?? []).filter((o) => o.status === "PROCESSING").length

  // Revenue per day for last 30 days
  const revByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    revByDay[d] = 0
  }
  for (const row of salesData.data ?? []) {
    const day = new Date(row.order_date).toISOString().slice(0, 10)
    if (day in revByDay) revByDay[day] += row.total_amount ?? 0
  }
  const revenueTimeline = Object.entries(revByDay).map(([date, revenue]) => ({ date, revenue }))

  // Channel breakdown
  const channelTotals: Record<string, number> = {}
  for (const row of salesData.data ?? []) {
    channelTotals[row.channel_id] = (channelTotals[row.channel_id] ?? 0) + (row.total_amount ?? 0)
  }
  const channelData = Object.entries(channelTotals).map(([channel_id, revenue]) => ({ channel_id, revenue }))

  return {
    todayOrders,
    todayRevenue,
    pendingDispatch,
    lowStockCount: lowStock.count ?? 0,
    recentOrders: recentOrders.data ?? [],
    revenueTimeline,
    channelData,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Today's Orders"
            value={data.todayOrders}
            icon={ShoppingCart}
            subtitle="across all channels"
          />
          <KPICard
            title="Today's Revenue"
            value={`₹${data.todayRevenue.toLocaleString()}`}
            icon={IndianRupee}
            subtitle="net of cancellations"
          />
          <KPICard
            title="Pending Dispatch"
            value={data.pendingDispatch}
            icon={Clock}
            subtitle="orders in processing"
          />
          <KPICard
            title="Low Stock SKUs"
            value={data.lowStockCount}
            icon={AlertTriangle}
            subtitle="< 5 units available"
            className={data.lowStockCount > 0 ? "border-yellow-400" : ""}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChart data={data.revenueTimeline} />
          </div>
          <ChannelBreakdown data={data.channelData} />
        </div>

        <RecentOrders orders={data.recentOrders} />
      </div>
    </div>
  )
}
