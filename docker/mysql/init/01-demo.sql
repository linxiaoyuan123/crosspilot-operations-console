CREATE TABLE IF NOT EXISTS stores (
  store_code VARCHAR(32) PRIMARY KEY,
  store_name VARCHAR(120) NOT NULL,
  region_code VARCHAR(32),
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS orders (
  order_no VARCHAR(40) PRIMARY KEY,
  store_code VARCHAR(32) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  order_status VARCHAR(30) NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  store_code VARCHAR(32) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (store_code, sku)
);

CREATE TABLE IF NOT EXISTS sync_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_code VARCHAR(32) NOT NULL,
  sync_type VARCHAR(40) NOT NULL,
  status VARCHAR(30) NOT NULL,
  synced_at DATETIME NOT NULL
);

INSERT INTO stores (store_code, store_name, region_code, status) VALUES
  ('GZ001', '天河旗舰店', 'GZ', 'active'),
  ('GZ002', '番禺万博店', NULL, 'active'),
  ('SZ001', '南山科技园店', 'SZ', 'active'),
  ('FS001', '祖庙商圈店', 'FS', 'active')
ON DUPLICATE KEY UPDATE
  store_name = VALUES(store_name),
  region_code = VALUES(region_code),
  status = VALUES(status);

INSERT INTO orders (order_no, store_code, total_amount, order_status, created_at) VALUES
  ('SO20260912001', 'GZ001', 1288.00, 'paid', '2026-09-12 08:30:00'),
  ('SO20260912002', 'GZ002', 356.50, 'paid', '2026-09-12 09:05:00'),
  ('SO20260912003', 'SZ001', 899.00, 'refunded', '2026-09-12 09:40:00')
ON DUPLICATE KEY UPDATE
  total_amount = VALUES(total_amount),
  order_status = VALUES(order_status),
  created_at = VALUES(created_at);

INSERT INTO inventory (store_code, sku, quantity) VALUES
  ('GZ001', 'SKU-1001', 86),
  ('GZ001', 'SKU-1002', 42),
  ('GZ002', 'SKU-1001', 18),
  ('SZ001', 'SKU-2001', 65)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

INSERT INTO sync_log (id, store_code, sync_type, status, synced_at) VALUES
  (1, 'GZ001', 'sales', 'success', '2026-09-12 09:10:00'),
  (2, 'GZ002', 'inventory', 'warning', '2026-09-12 09:12:00'),
  (3, 'SZ001', 'member', 'success', '2026-09-12 09:15:00')
ON DUPLICATE KEY UPDATE
  sync_type = VALUES(sync_type),
  status = VALUES(status),
  synced_at = VALUES(synced_at);
