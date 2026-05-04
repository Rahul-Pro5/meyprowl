import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("current_inventory")
    .select("*")
    .order("sku")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
