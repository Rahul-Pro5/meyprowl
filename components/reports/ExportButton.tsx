"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"

interface ExportButtonProps {
  getData: () => Promise<Record<string, unknown>[]>
  filename: string
  label?: string
}

export function ExportButton({ getData, filename, label = "Export" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport(format: "csv" | "xlsx") {
    setLoading(true)
    try {
      const data = await getData()
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Data")

      if (format === "csv") {
        XLSX.writeFile(wb, `${filename}.csv`, { bookType: "csv" })
      } else {
        XLSX.writeFile(wb, `${filename}.xlsx`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={loading}>
        <Download className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")} disabled={loading}>
        <Download className="h-4 w-4 mr-2" />
        Excel
      </Button>
    </div>
  )
}
