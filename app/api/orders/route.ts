import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const channel = searchParams.get("channel")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const status = searchParams.get("status")
  const page = parseInt(searchParams.get("page") ?? "1")
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "50"), 200)

  const supabase = createServerClient()
  let query = supabase
    .from("sale_orders")
    .select("*, sale_order_items(sku, quantity, selling_price)", { count: "exact" })
    .order("order_date", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (channel) query = query.eq("channel_id", channel)
  if (from) query = query.gte("order_date", from)
  if (to) query = query.lte("order_date", to)
  if (status) query = query.eq("status", status)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, pageSize })
}
