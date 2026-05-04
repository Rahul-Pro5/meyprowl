"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"

const CHANNEL_COLORS: Record<string, string> = {
  nykaa:        "#e91e8c",
  amazon:       "#ff9900",
  myntra:       "#ff3f6c",
  alaya:        "#6366f1",
  alaya_select: "#14b8a6",
}

interface RevenueChartProps {
  data: { date: string; revenue: number; channel_breakdown: Record<string, number> }[]
  stacked?: boolean
}

const CHANNELS = ["nykaa", "amazon", "myntra", "alaya", "alaya_select"]
const CHANNEL_LABELS: Record<string, string> = {
  nykaa: "Nykaa", amazon: "Amazon", myntra: "Myntra",
  alaya: "Alaya", alaya_select: "Alaya Select",
}

export function SalesRevenueChart({ data, stacked = false }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Revenue by Date</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(parseISO(v), "dd MMM")}
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v, name) => [`₹${Number(v).toLocaleString()}`, CHANNEL_LABELS[String(name)] ?? name]}
              labelFormatter={(l) => format(parseISO(String(l)), "dd MMM yyyy")}
            />
            <Legend formatter={(name) => CHANNEL_LABELS[name] ?? name} />
            {stacked
              ? CHANNELS.map((ch) => (
                  <Bar key={ch} dataKey={`channel_breakdown.${ch}`} name={ch} stackId="a" fill={CHANNEL_COLORS[ch]} />
                ))
              : <Bar dataKey="revenue" name="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            }
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
