import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const PUBLIC_API_PATHS = ["/api/unicommerce/sync"] // allow internal sync without key during setup

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/api/")) return NextResponse.next()

  // Skip auth for non-API routes and during development if desired
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawKey = authHeader.slice(7)
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex")

  // Forward the hash to the route handler via a custom header
  // (avoids importing Supabase in middleware which can't use Node.js runtime)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-api-key-hash", keyHash)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/api/:path*"],
}
