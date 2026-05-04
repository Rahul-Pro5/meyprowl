"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CHANNELS = [
  { id: "all",          label: "All" },
  { id: "nykaa",        label: "Nykaa" },
  { id: "amazon",       label: "Amazon" },
  { id: "myntra",       label: "Myntra" },
  { id: "alaya",        label: "Alaya Shopify" },
  { id: "alaya_select", label: "Alaya Select" },
]

interface ChannelFilterProps {
  selected: string
  onChange: (channel: string) => void
}

export function ChannelFilter({ selected, onChange }: ChannelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHANNELS.map((ch) => (
        <button
          key={ch.id}
          onClick={() => onChange(ch.id)}
          className={cn(
            "px-3 py-1 rounded-full text-sm font-medium border transition-colors",
            selected === ch.id
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {ch.label}
        </button>
      ))}
    </div>
  )
}
