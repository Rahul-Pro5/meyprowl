import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("sale_orders")
    .select("*, sale_order_items(sku, quantity, selling_price, mrp, items(name, category, collection))")
    .eq("id", params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 })
  return NextResponse.json({ data })
}
