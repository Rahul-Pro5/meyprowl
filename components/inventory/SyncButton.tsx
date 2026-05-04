"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function SyncButton({ apiKey }: { apiKey?: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/unicommerce/sync", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey ?? ""}`,
          "Content-Type": "application/json",
        },
      })
      const json = await res.json()
      if (json.success) {
        setResult(`Synced: ${json.stats.orders} orders, ${json.stats.inventoryRows} inventory rows`)
      } else {
        setResult(`Error: ${json.error ?? "Unknown error"}`)
      }
    } catch (e) {
      setResult("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Syncing…" : "Sync from Unicommerce"}
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
    </div>
  )
}
