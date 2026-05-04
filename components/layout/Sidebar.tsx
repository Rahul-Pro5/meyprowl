"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Warehouse, TrendingUp, FileText, Settings, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/sales", label: "Sales Analysis", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-14 border-b">
        <Warehouse className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Alaya WMS</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings" && "bg-primary text-primary-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
