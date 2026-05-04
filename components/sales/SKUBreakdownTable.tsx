import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SKURow {
  sku: string
  units_sold: number
  revenue: number
  orders: number
}

interface SKUBreakdownTableProps {
  data: SKURow[]
}

export function SKUBreakdownTable({ data }: SKUBreakdownTableProps) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 50)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top SKUs by Revenue</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Units Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, i) => (
              <TableRow key={row.sku}>
                <TableCell className="text-muted-foreground w-8">{i + 1}</TableCell>
                <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                <TableCell className="text-right">{row.units_sold}</TableCell>
                <TableCell className="text-right font-medium">₹{row.revenue.toLocaleString()}</TableCell>
                <TableCell className="text-right">{row.orders}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No data for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
