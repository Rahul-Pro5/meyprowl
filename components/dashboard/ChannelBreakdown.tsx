"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CHANNEL_COLORS: Record<string, string> = {
  nykaa:        "#e91e8c",
  amazon:       "#ff9900",
  myntra:       "#ff3f6c",
  alaya:        "#6366f1",
  alaya_select: "#14b8a6",
}

const CHANNEL_LABELS: Record<string, string> = {
  nykaa:        "Nykaa",
  amazon:       "Amazon",
  myntra:       "Myntra",
  alaya:        "Alaya Shopify",
  alaya_select: "Alaya Select",
}

interface ChannelBreakdownProps {
  data: { channel_id: string; revenue: number }[]
}

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const chartData = data.map((d) => ({
    name: CHANNEL_LABELS[d.channel_id] ?? d.channel_id,
    value: Math.round(d.revenue),
    color: CHANNEL_COLORS[d.channel_id] ?? "#888",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Revenue by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
