import { Header } from "@/components/layout/Header"
import { SyncButton } from "@/components/inventory/SyncButton"
import { WarehouseMap } from "@/components/inventory/WarehouseMap"
import { InventoryTable } from "@/components/inventory/InventoryTable"
import { createServerClient } from "@/lib/supabase/server"

async function getInventory() {
  const supabase = createServerClient()
  const { data } = await supabase.from("current_inventory").select("*").order("sku")
  return data ?? []
}

export default async function InventoryPage() {
  const inventory = await getInventory()

  return (
    <div>
      <Header
        title="Inventory"
        actions={<SyncButton />}
      />
      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Warehouse Floor Plan</h2>
          <WarehouseMap inventory={inventory} />
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            All SKUs ({inventory.length})
          </h2>
          <InventoryTable items={inventory} />
        </section>
      </div>
    </div>
  )
}
