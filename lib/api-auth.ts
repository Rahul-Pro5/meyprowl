import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "./supabase/server"

export async function verifyApiKey(request: NextRequest): Promise<NextResponse | null> {
  const keyHash = request.headers.get("x-api-key-hash")
  if (!keyHash) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select("id")
    .eq("key_hash", keyHash)
    .single()

  if (error || !data) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Update last_used asynchronously (fire and forget)
  supabase.from("api_keys").update({ last_used: new Date().toISOString() }).eq("id", data.id)

  return null // null = authorized, proceed
}
