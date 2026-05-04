"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? ""

interface ApiKey {
  id: string
  label: string
  created_at: string
  last_used: string | null
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loadKeys() {
    const res = await fetch("/api/keys", { headers: { Authorization: `Bearer ${ADMIN_KEY}` } })
    if (res.ok) {
      const json = await res.json()
      setKeys(json.data ?? [])
    }
  }

  useEffect(() => { loadKeys() }, [])

  async function createKey() {
    if (!newLabel.trim()) return
    setLoading(true)
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { Authorization: `Bearer ${ADMIN_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    })
    if (res.ok) {
      const json = await res.json()
      setNewKey(json.key)
      setNewLabel("")
      await loadKeys()
    }
    setLoading(false)
  }

  async function deleteKey(id: string) {
    if (!confirm("Delete this API key? This cannot be undone.")) return
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${ADMIN_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    await loadKeys()
  }

  function copyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Keys grant access to the REST API. Store them securely — they are shown only once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {newKey && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <code className="flex-1 text-xs font-mono text-green-800 break-all">{newKey}</code>
                <Button variant="ghost" size="icon" onClick={copyKey} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Key label (e.g. 'Dashboard App')"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createKey()}
              />
              <Button onClick={createKey} disabled={loading || !newLabel.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {key.last_used ? new Date(key.last_used).toLocaleDateString("en-IN") : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No API keys yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unicommerce Sync</CardTitle>
            <CardDescription>Connection status and environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span className="font-medium">
                {process.env.NEXT_PUBLIC_UC_ENV === "prod" ? "Production" : "Staging"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Channels</span>
              <span>Nykaa · Amazon · Myntra · Alaya · Alaya Select</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
