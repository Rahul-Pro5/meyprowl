-- Alaya WMS initial schema

CREATE TABLE channels (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

INSERT INTO channels VALUES
  ('nykaa',        'Nykaa',               true),
  ('amazon',       'Amazon',              true),
  ('myntra',       'Myntra',              true),
  ('alaya',        'Alaya Shopify',       true),
  ('alaya_select', 'Alaya Select Shopify',true);

CREATE TABLE items (
  sku         TEXT PRIMARY KEY,
  name        TEXT,
  category    TEXT,
  collection  TEXT,
  mrp         NUMERIC,
  last_synced TIMESTAMPTZ
);

CREATE TABLE sale_orders (
  id            TEXT PRIMARY KEY,
  channel_id    TEXT REFERENCES channels(id),
  status        TEXT,
  total_amount  NUMERIC,
  item_count    INTEGER,
  order_date    TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  synced_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_order_items (
  id            SERIAL PRIMARY KEY,
  order_id      TEXT REFERENCES sale_orders(id) ON DELETE CASCADE,
  sku           TEXT REFERENCES items(sku),
  quantity      INTEGER,
  selling_price NUMERIC,
  mrp           NUMERIC
);

CREATE TABLE inventory_snapshots (
  id            SERIAL PRIMARY KEY,
  sku           TEXT REFERENCES items(sku),
  shelf_id      TEXT,
  available_qty INTEGER,
  total_qty     INTEGER,
  snapshot_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE VIEW current_inventory AS
SELECT DISTINCT ON (sku) sku, shelf_id, available_qty, total_qty, snapshot_at
FROM inventory_snapshots
ORDER BY sku, snapshot_at DESC;

CREATE TABLE api_keys (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash   TEXT UNIQUE NOT NULL,
  label      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used  TIMESTAMPTZ
);
