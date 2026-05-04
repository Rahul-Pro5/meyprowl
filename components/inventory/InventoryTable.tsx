import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface InventoryItem {
  sku: string
  shelf_id: string
  available_qty: number
  total_qty: number
  snapshot_at: string
}

interface InventoryTableProps {
  items: InventoryItem[]
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Shelf</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Synced</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const ratio = item.total_qty > 0 ? item.available_qty / item.total_qty : 0
          const variant = ratio > 0.6 ? "success" : ratio > 0.3 ? "warning" : "destructive"
          return (
            <TableRow key={`${item.sku}-${item.shelf_id}`}>
              <TableCell className="font-mono text-xs">{item.sku}</TableCell>
              <TableCell>{item.shelf_id}</TableCell>
              <TableCell className="text-right font-medium">{item.available_qty}</TableCell>
              <TableCell className="text-right text-muted-foreground">{item.total_qty}</TableCell>
              <TableCell>
                <Badge variant={item.available_qty === 0 ? "destructive" : variant}>
                  {item.available_qty === 0 ? "Out of Stock" : item.available_qty < 5 ? "Low Stock" : "In Stock"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(item.snapshot_at).toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          )
        })}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No inventory data. Sync from Unicommerce to populate.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
