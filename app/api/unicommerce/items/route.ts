import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/api-auth"
import { searchItems } from "@/lib/unicommerce/items"

export async function GET(request: NextRequest) {
  const authError = await verifyApiKey(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""

  const items = await searchItems(q)
  return NextResponse.json({ data: items })
}
