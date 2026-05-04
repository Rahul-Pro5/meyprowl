import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { adjustInventory } from "@/lib/unicommerce/inventory"

export async function POST(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const body = await request.json()
  const { sku, shelfCode, quantity } = body

  if (!sku || !shelfCode || quantity === undefined) {
    return NextResponse.json({ error: "sku, shelfCode and quantity are required" }, { status: 400 })
  }

  const success = await adjustInventory(sku, shelfCode, quantity)
  return NextResponse.json({ success })
}
