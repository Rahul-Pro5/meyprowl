import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  CREATED:     "outline",
  PROCESSING:  "warning",
  DISPATCHED:  "success",
  COMPLETE:    "success",
  CANCELLED:   "destructive",
}

const CHANNEL_LABELS: Record<string, string> = {
  nykaa:        "Nykaa",
  amazon:       "Amazon",
  myntra:       "Myntra",
  alaya:        "Alaya",
  alaya_select: "Select",
}

interface Order {
  id: string
  channel_id: string
  status: string
  total_amount: number
  order_date: string
  item_count: number
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>{CHANNEL_LABELS[order.channel_id] ?? order.channel_id}</TableCell>
                <TableCell>{order.item_count}</TableCell>
                <TableCell>₹{order.total_amount?.toLocaleString() ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(order.order_date).toLocaleDateString("en-IN")}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders yet. Run a sync to pull data from Unicommerce.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
