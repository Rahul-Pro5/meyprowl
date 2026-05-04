import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createServerClient } from "@/lib/supabase/server"

// This endpoint is called from the Settings UI — it requires service role key
// so it must only be reachable from the server-side (Settings page is server-rendered
// and calls this route, or the user can be authenticated via session).
// For simplicity, protect with a master ADMIN_KEY env variable.

function isAdmin(request: NextRequest): boolean {
  const token = request.headers.get("authorization")?.slice(7)
  return token === process.env.ADMIN_KEY
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createServerClient()
  const { data, error } = await supabase.from("api_keys").select("id, label, created_at, last_used")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { label } = await request.json()
  const rawKey = `alaya_${crypto.randomBytes(24).toString("hex")}`
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

  const supabase = createServerClient()
  const { data, error } = await supabase.from("api_keys").insert({ key_hash: keyHash, label }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return the raw key once — it won't be recoverable after this
  return NextResponse.json({ key: rawKey, id: data.id, label: data.label })
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await request.json()
  const supabase = createServerClient()
  const { error } = await supabase.from("api_keys").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
