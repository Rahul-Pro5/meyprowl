"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface InventoryItem {
  sku: string
  shelf_id: string
  available_qty: number
  total_qty: number
  snapshot_at: string
}

interface WarehouseMapProps {
  inventory: InventoryItem[]
  rows?: string[]        // e.g. ["A","B","C","D","E"]
  cols?: number          // e.g. 20
}

const DEFAULT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"]
const DEFAULT_COLS = 16

function heatColor(availableQty: number, totalQty: number): string {
  if (totalQty === 0) return "hsl(var(--muted))"
  const ratio = availableQty / totalQty
  if (ratio > 0.6) return "#22c55e"   // green
  if (ratio > 0.3) return "#eab308"   // yellow
  if (ratio > 0)   return "#f97316"   // orange
  return "#ef4444"                     // red (empty)
}

interface ShelfCell {
  shelfId: string
  item?: InventoryItem
}

interface TooltipState {
  x: number
  y: number
  shelf: ShelfCell
}

export function WarehouseMap({ inventory, rows = DEFAULT_ROWS, cols = DEFAULT_COLS }: WarehouseMapProps) {
  const [search, setSearch] = useState("")
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const inventoryByShelf = useMemo(() => {
    const map: Record<string, InventoryItem> = {}
    for (const item of inventory) map[item.shelf_id] = item
    return map
  }, [inventory])

  const grid: ShelfCell[][] = useMemo(() => {
    return rows.map((row) =>
      Array.from({ length: cols }, (_, i) => {
        const shelfId = `${row}${String(i + 1).padStart(2, "0")}`
        return { shelfId, item: inventoryByShelf[shelfId] }
      })
    )
  }, [rows, cols, inventoryByShelf])

  const searchLower = search.toLowerCase()
  const isHighlighted = (cell: ShelfCell) => {
    if (!searchLower) return false
    return (
      cell.shelfId.toLowerCase().includes(searchLower) ||
      (cell.item?.sku.toLowerCase().includes(searchLower) ?? false)
    )
  }

  const CELL_W = 38
  const CELL_H = 38
  const GAP = 4
  const LABEL_W = 28
  const LABEL_H = 22
  const svgW = LABEL_W + cols * (CELL_W + GAP)
  const svgH = LABEL_H + rows.length * (CELL_H + GAP)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search shelf (A01) or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
          {[
            { color: "#22c55e", label: ">60%" },
            { color: "#eab308", label: "30-60%" },
            { color: "#f97316", label: "1-30%" },
            { color: "#ef4444", label: "Empty" },
            { color: "hsl(var(--muted))", label: "No data" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-auto border rounded-lg p-4 bg-muted/20 relative">
        <svg
          width={svgW}
          height={svgH}
          className="block"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Column labels */}
          {Array.from({ length: cols }, (_, i) => (
            <text
              key={i}
              x={LABEL_W + i * (CELL_W + GAP) + CELL_W / 2}
              y={LABEL_H - 4}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.5}
            >
              {i + 1}
            </text>
          ))}

          {grid.map((row, ri) =>
            row.map((cell, ci) => {
              const x = LABEL_W + ci * (CELL_W + GAP)
              const y = LABEL_H + ri * (CELL_H + GAP)
              const highlighted = isHighlighted(cell)
              const fillColor = cell.item
                ? heatColor(cell.item.available_qty, cell.item.total_qty)
                : "hsl(var(--muted))"

              return (
                <g key={cell.shelfId}>
                  {/* Row label (first cell only) */}
                  {ci === 0 && (
                    <text
                      x={LABEL_W - 6}
                      y={y + CELL_H / 2 + 4}
                      textAnchor="end"
                      fontSize={11}
                      fill="currentColor"
                      opacity={0.6}
                    >
                      {rows[ri]}
                    </text>
                  )}
                  <rect
                    x={x}
                    y={y}
                    width={CELL_W}
                    height={CELL_H}
                    rx={4}
                    fill={fillColor}
                    stroke={highlighted ? "#6366f1" : "transparent"}
                    strokeWidth={highlighted ? 2 : 0}
                    opacity={search && !highlighted ? 0.25 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGRectElement).getBoundingClientRect()
                      setTooltip({ x: rect.left, y: rect.top, shelf: cell })
                    }}
                  />
                  <text
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2 + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="white"
                    className="pointer-events-none select-none"
                    opacity={0.9}
                  >
                    {cell.shelfId}
                  </text>
                </g>
              )
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg p-3 text-xs pointer-events-none min-w-[160px]"
            style={{ left: tooltip.x + 10, top: tooltip.y - 80 }}
          >
            <p className="font-semibold mb-1">{tooltip.shelf.shelfId}</p>
            {tooltip.shelf.item ? (
              <>
                <p className="text-muted-foreground">SKU: {tooltip.shelf.item.sku}</p>
                <p>Available: <span className="font-medium">{tooltip.shelf.item.available_qty}</span></p>
                <p>Total: {tooltip.shelf.item.total_qty}</p>
                <p className="text-muted-foreground mt-1">
                  Last synced: {new Date(tooltip.shelf.item.snapshot_at).toLocaleString("en-IN")}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No inventory data</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {inventory.length} shelves with data · Click a shelf for details
      </p>
    </div>
  )
}
