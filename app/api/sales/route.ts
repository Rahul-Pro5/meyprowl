import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const channel = searchParams.get("channel")
  const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString()
  const to = searchParams.get("to") ?? new Date().toISOString()
  const group = searchParams.get("group") ?? "day"

  const supabase = createServerClient()
  let query = supabase
    .from("sale_orders")
    .select("channel_id, total_amount, order_date, status")
    .gte("order_date", from)
    .lte("order_date", to)
    .neq("status", "CANCELLED")

  if (channel) query = query.eq("channel_id", channel)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by date bucket
  const buckets: Record<string, { date: string; revenue: number; orders: number; channel_breakdown: Record<string, number> }> = {}

  for (const row of data ?? []) {
    const date = new Date(row.order_date)
    let key: string
    if (group === "month") key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    else if (group === "week") {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().slice(0, 10)
    } else {
      key = date.toISOString().slice(0, 10)
    }

    if (!buckets[key]) buckets[key] = { date: key, revenue: 0, orders: 0, channel_breakdown: {} }
    buckets[key].revenue += row.total_amount ?? 0
    buckets[key].orders += 1
    buckets[key].channel_breakdown[row.channel_id] = (buckets[key].channel_breakdown[row.channel_id] ?? 0) + (row.total_amount ?? 0)
  }

  const aggregated = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json({ data: aggregated })
}
