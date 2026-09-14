import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import DatabaseSync from 'better-sqlite3';
import { actionsForStore } from './metrics.js';
import { STARTER_ARTICLES } from './starter-articles.js';
import {
  cleanupOrphanMedia,
  createArticleComment,
  createContentEntry,
  deleteArticleComment,
  deleteContentEntry,
  getArticleRelationships,
  getContentEntry,
  getContentStats,
  listArchive,
  listArticleComments,
  listAllComments,
  listContentEntries,
  listMedia,
  migrateContent,
  registerMedia,
  syncKnowledgeTaxonomy,
  toFtsQuery,
  updateArticleCommentStatus,
  updateContentEntry
} from './content-store.js';

export const DEFAULT_DB_PATH = resolve(process.env.DB_PATH || 'data/crosspilot.db');
const SCHEMA_VERSION = 2;
const nowIso = () => new Date().toISOString();
const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72);

const compactText = (value, maxLength = 180) => String(value || '')
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/[#>*_`~\[\]()!-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maxLength);

const contentFromLegacy = (row = {}) => {
  const symptom = String(row.symptom || '').trim();
  const solution = String(row.solution || '').trim();
  if (!symptom && !solution) return '';
  return [symptom ? `## 问题现象\n\n${symptom}` : '', solution ? `## 解决方案\n\n${solution}` : '']
    .filter(Boolean)
    .join('\n\n');
};

const normalizeKnowledgeRow = (row) => {
  if (!row) return row;
  const contentMd = String(row.content_md || '').trim() || contentFromLegacy(row);
  const excerpt = String(row.excerpt || '').trim() || compactText(contentMd || row.symptom);
  return {
    ...row,
    slug: row.slug || `article-${row.id}`,
    excerpt,
    content_md: contentMd,
    status: row.status || 'published',
    featured: Boolean(row.featured),
    publish_at: row.publish_at || '',
    updated_at: row.updated_at || row.created_at,
    reading_minutes: Math.max(1, Math.ceil(contentMd.length / 500))
  };
};

const uniqueSlug = (db, title, requested = '', currentId = null) => {
  const base = slugify(requested) || slugify(title) || `article-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  const find = db.prepare('SELECT id FROM knowledge_articles WHERE slug = ?');
  while (true) {
    const existing = find.get(candidate);
    if (!existing || Number(existing.id) === Number(currentId)) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
};

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((item) => item.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
const dateOffset = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export function createDatabase(dbPath = DEFAULT_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  backupBeforeMigration(db, dbPath);
  migrate(db);
  seed(db);
  seedContent(db);
  migrateContent(db);
  refreshStarterKnowledge(db);
  db.pragma(`user_version = ${SCHEMA_VERSION}`);
  return db;
}

function backupBeforeMigration(db, dbPath) {
  if (!existsSync(dbPath) || statSync(dbPath).size === 0) return;
  const currentVersion = Number(db.pragma('user_version', { simple: true })) || 0;
  if (currentVersion >= SCHEMA_VERSION) return;
  const hasSchema = db.prepare(`
    SELECT 1 AS ok FROM sqlite_master
    WHERE type = 'table' AND name IN ('stores', 'knowledge_articles')
    LIMIT 1
  `).get();
  if (!hasSchema) return;
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    const backupDirectory = join(dirname(dbPath), 'backups');
    mkdirSync(backupDirectory, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    copyFileSync(dbPath, join(backupDirectory, `crosspilot-before-v${SCHEMA_VERSION}-${stamp}.db`));
  } catch (error) {
    console.warn(`[CrossPilot] Database backup skipped: ${error.message}`);
  }
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      market TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
      fee_rate REAL NOT NULL DEFAULT 15,
      fulfillment_fee REAL NOT NULL DEFAULT 0,
      target_acos REAL NOT NULL DEFAULT 28,
      target_margin REAL NOT NULL DEFAULT 20,
      lead_time_days INTEGER NOT NULL DEFAULT 18,
      safety_days INTEGER NOT NULL DEFAULT 14,
      health_rating REAL NOT NULL DEFAULT 4.5,
      order_defect_rate REAL NOT NULL DEFAULT 0,
      late_shipment_rate REAL NOT NULL DEFAULT 0,
      cancellation_rate REAL NOT NULL DEFAULT 0,
      data_mode TEXT NOT NULL DEFAULT 'simulated',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      asin TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '家居收纳',
      price REAL NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      referral_fee_rate REAL,
      fulfillment_fee REAL,
      units_30d INTEGER NOT NULL DEFAULT 0,
      sales_30d REAL NOT NULL DEFAULT 0,
      refund_amount_30d REAL NOT NULL DEFAULT 0,
      ad_spend_30d REAL NOT NULL DEFAULT 0,
      ad_sales_30d REAL NOT NULL DEFAULT 0,
      sessions_30d INTEGER NOT NULL DEFAULT 0,
      page_views_30d INTEGER NOT NULL DEFAULT 0,
      returns_30d INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      title_score REAL NOT NULL DEFAULT 0,
      bullet_score REAL NOT NULL DEFAULT 0,
      image_score REAL NOT NULL DEFAULT 0,
      attribute_score REAL NOT NULL DEFAULT 0,
      keyword_score REAL NOT NULL DEFAULT 0,
      compliance_score REAL NOT NULL DEFAULT 0,
      issue_summary TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      UNIQUE(store_id, sku)
    );

    CREATE TABLE IF NOT EXISTS daily_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      metric_date TEXT NOT NULL,
      sales REAL NOT NULL DEFAULT 0,
      orders INTEGER NOT NULL DEFAULT 0,
      ad_spend REAL NOT NULL DEFAULT 0,
      cogs_est REAL NOT NULL DEFAULT 0,
      sessions INTEGER NOT NULL DEFAULT 0,
      returns INTEGER NOT NULL DEFAULT 0,
      UNIQUE(store_id, metric_date)
    );

    CREATE TABLE IF NOT EXISTS ad_search_terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      campaign TEXT NOT NULL,
      ad_group TEXT NOT NULL DEFAULT '',
      search_term TEXT NOT NULL,
      match_type TEXT NOT NULL DEFAULT 'broad',
      clicks INTEGER NOT NULL DEFAULT 0,
      impressions INTEGER NOT NULL DEFAULT 0,
      spend REAL NOT NULL DEFAULT 0,
      ad_sales REAL NOT NULL DEFAULT 0,
      ad_orders INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      snapshot_date TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 0,
      inbound INTEGER NOT NULL DEFAULT 0,
      reserved INTEGER NOT NULL DEFAULT 0,
      defective INTEGER NOT NULL DEFAULT 0,
      avg_daily_sales REAL NOT NULL DEFAULT 0,
      last_restock_date TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      UNIQUE(product_id)
    );

    CREATE TABLE IF NOT EXISTS after_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      case_no TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      detail TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      owner TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      source_type TEXT NOT NULL,
      source_id INTEGER NOT NULL DEFAULT 0,
      source_key TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium',
      recommendation TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open',
      owner TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      evidence TEXT NOT NULL DEFAULT '',
      result TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      closed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS action_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      report_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'preview',
      total_rows INTEGER NOT NULL DEFAULT 0,
      valid_rows INTEGER NOT NULL DEFAULT 0,
      error_rows INTEGER NOT NULL DEFAULT 0,
      pii_columns_json TEXT NOT NULL DEFAULT '[]',
      mapping_json TEXT NOT NULL DEFAULT '{}',
      preview_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS import_rows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
      row_index INTEGER NOT NULL,
      raw_json TEXT NOT NULL DEFAULT '{}',
      normalized_json TEXT NOT NULL DEFAULT '{}',
      errors_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'valid'
    );

    CREATE TABLE IF NOT EXISTS knowledge_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      symptom TEXT NOT NULL DEFAULT '',
      solution TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '',
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
      ,slug TEXT NOT NULL DEFAULT ''
      ,excerpt TEXT NOT NULL DEFAULT ''
      ,content_md TEXT NOT NULL DEFAULT ''
      ,cover_image TEXT NOT NULL DEFAULT ''
      ,status TEXT NOT NULL DEFAULT 'published'
      ,featured INTEGER NOT NULL DEFAULT 0
      ,publish_at TEXT NOT NULL DEFAULT ''
      ,updated_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      detail TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id, id);
    CREATE INDEX IF NOT EXISTS idx_daily_store_date ON daily_metrics(store_id, metric_date);
    CREATE INDEX IF NOT EXISTS idx_ads_store ON ad_search_terms(store_id, id);
    CREATE INDEX IF NOT EXISTS idx_inventory_store ON inventory_snapshots(store_id, product_id);
    CREATE INDEX IF NOT EXISTS idx_after_sales_store ON after_sales(store_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_actions_store ON actions(store_id, status, priority);
    CREATE INDEX IF NOT EXISTS idx_action_events_action ON action_events(action_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_imports_store ON import_batches(store_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_import_rows_batch ON import_rows(batch_id, row_index);
  `);

  ensureColumn(db, 'knowledge_articles', 'slug', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'knowledge_articles', 'excerpt', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'knowledge_articles', 'content_md', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'knowledge_articles', 'cover_image', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'knowledge_articles', 'status', "TEXT NOT NULL DEFAULT 'published'");
  ensureColumn(db, 'knowledge_articles', 'featured', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn(db, 'knowledge_articles', 'publish_at', "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, 'knowledge_articles', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    UPDATE knowledge_articles SET slug = 'article-' || id WHERE slug = '';
    UPDATE knowledge_articles SET status = 'published' WHERE status = '';
    UPDATE knowledge_articles SET updated_at = created_at WHERE updated_at = '';
    UPDATE knowledge_articles
      SET content_md = trim(
        CASE WHEN trim(symptom) = '' THEN '' ELSE '## 问题现象' || char(10) || char(10) || trim(symptom) END ||
        CASE WHEN trim(solution) = '' THEN '' ELSE char(10) || char(10) || '## 解决方案' || char(10) || char(10) || trim(solution) END
      )
      WHERE content_md = '';
    CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_slug ON knowledge_articles(slug);
    CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_articles(status, featured, updated_at DESC);
  `);
}

function seed(db) {
  if (Number(db.prepare('SELECT COUNT(*) AS count FROM stores').get().count) > 0) return;
  const timestamp = nowIso();
  const insertStore = db.prepare(`
    INSERT INTO stores (
      code, name, platform, market, currency, timezone, fee_rate, fulfillment_fee,
      target_acos, target_margin, lead_time_days, safety_days, health_rating,
      order_defect_rate, late_shipment_rate, cancellation_rate, data_mode, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStore.run('EU-HOME-01', 'AuroraHome Europe 旗舰店', 'Amazon', '欧洲站', 'EUR', 'Europe/Berlin', 15, 3.2, 28, 18, 18, 14, 4.18, 0.42, 4.6, 1.2, 'simulated', timestamp);
  insertStore.run('TTS-DE-01', 'AuroraHome 德国店', 'TikTok Shop', '德国', 'EUR', 'Europe/Berlin', 8, 2.4, 32, 16, 16, 12, 4.62, 0.35, 2.1, 0.8, 'simulated', timestamp);
  insertStore.run('SP-SG-01', 'AuroraHome 新加坡店', 'Shopee', '新加坡', 'SGD', 'Asia/Singapore', 10, 1.8, 30, 15, 14, 10, 4.71, 0.2, 1.4, 0.5, 'simulated', timestamp);

  const products = [
    ['EU-HOME-01', 'AH-BAM-002', 'B0CPBAM204', 'Bamboo Drawer Organiser Set, Expandable 4-Piece Storage Dividers for Kitchen and Office', '竹制抽屉收纳', 29.99, 8.6, 412, 12355.88, 620.4, 1542, 6890, 12600, 16800, 47, 4.4, 826, 92, 90, 88, 86, 84, 96, '图片缺少场景尺寸对比'],
    ['EU-HOME-01', 'AH-VAC-001', 'B0CPVAC101', 'Vacuum Storage Bags with Electric Pump, Reusable Space Saver Bags for Duvets and Clothes', '真空压缩袋', 22.99, 6.1, 368, 8460, 780, 1780, 4890, 11840, 15320, 39, 4.18, 642, 86, 78, 82, 76, 88, 94, 'ACOS 超目标，主图信息密度偏低'],
    ['EU-HOME-01', 'AH-SHOE-003', 'B0CPSHO303', '4-Tier Shoe Rack for Entryway, Narrow Metal Storage Organiser Holds 12 Pairs', '窄型鞋架', 35.99, 13.8, 224, 8061.76, 640, 1420, 3120, 7840, 10320, 28, 4.31, 384, 88, 84, 80, 82, 79, 92, '广告转化偏弱，五点差异点不清晰'],
    ['EU-HOME-01', 'AH-HOOK-004', 'B0CPHOO404', 'Adhesive Wall Hooks 12 Pack, No Drill Heavy Duty Hooks for Bathroom and Kitchen', '免打孔挂钩', 12.99, 2.75, 590, 7664.1, 210, 620, 3150, 14600, 19120, 31, 4.53, 1138, 91, 89, 86, 84, 90, 98, '保持低成本流量结构'],
    ['EU-HOME-01', 'AH-SPICE-005', 'B0CPSPI505', 'Spice Rack Organiser for Cabinet, 3-Tier Expandable Shelf with Non-Slip Mats', '调料架', 26.49, 9.9, 182, 4821.18, 360, 980, 1940, 6420, 8390, 21, 4.09, 267, 74, 68, 65, 72, 70, 88, '属性缺失较多，主关键词覆盖不足'],
    ['EU-HOME-01', 'AH-LAUN-006', 'B0CPLAU606', 'Laundry Sorter with 3 Removable Bags, Rolling Hamper Cart for Bathroom and Bedroom', '三袋脏衣篮', 31.99, 15.4, 156, 4990.44, 540, 870, 1680, 5220, 7080, 17, 3.92, 194, 79, 72, 74, 68, 76, 90, '净利为负，高退货与广告成本叠加'],
    ['EU-HOME-01', 'AH-BED-007', 'B0CPBED707', 'Under Bed Storage Bags 2 Pack, Large Foldable Containers with Reinforced Handles', '床底收纳袋', 25.99, 7.8, 334, 8680.66, 410, 690, 3760, 10280, 13240, 24, 4.47, 711, 89, 86, 85, 88, 87, 97, '保持广告和库存节奏'],
    ['EU-HOME-01', 'AH-CART-008', 'B0CPCAR808', 'Slim Rolling Storage Cart, 3-Tier Mobile Organiser for Laundry and Kitchen', '窄缝收纳车', 42.99, 19.8, 96, 4127.04, 290, 760, 980, 2940, 4020, 12, 4.06, 138, 85, 82, 84, 80, 83, 91, '高客单转化不足，利润空间过薄'],
    ['TTS-DE-01', 'TT-CLIP-001', 'TT-CLIP-001', 'Küchen-Organizer Set mit 6 Clips', '厨房夹收纳套装', 18.9, 5.2, 286, 5405.4, 180, 460, 2180, 12300, 15900, 19, 4.62, 329, 88, 86, 84, 81, 85, 96, '短视频素材可继续放量'],
    ['TTS-DE-01', 'TT-BOX-002', 'TT-BOX-002', 'Faltbare Aufbewahrungsbox 2er Set', '折叠收纳箱', 24.9, 9.1, 142, 3535.8, 210, 510, 1020, 7210, 9620, 17, 4.38, 187, 82, 80, 81, 78, 82, 95, '退货原因需按颜色归类'],
    ['SP-SG-01', 'SP-HOOK-001', 'SP-HOOK-001', 'Multipurpose Adhesive Hook 10pcs', '多用途免钉挂钩', 9.9, 2.9, 342, 3385.8, 90, 280, 980, 11200, 14300, 14, 4.71, 512, 90, 88, 86, 84, 88, 97, '保持平台活动报名']
  ];
  const insertProduct = db.prepare(`
    INSERT INTO products (
      store_id, sku, asin, title, category, price, unit_cost, units_30d, sales_30d,
      refund_amount_30d, ad_spend_30d, ad_sales_30d, sessions_30d, page_views_30d,
      returns_30d, rating, review_count, title_score, bullet_score, image_score,
      attribute_score, keyword_score, compliance_score, issue_summary, updated_at
    )
    SELECT id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    FROM stores WHERE code = ?
  `);
  for (const product of products) {
    const [storeCode, sku, asin, title, category, price, unitCost, units, sales, refunds, adSpend, adSales, sessions, pageViews, returns, rating, reviews, titleScore, bulletScore, imageScore, attributeScore, keywordScore, complianceScore, issue] = product;
    insertProduct.run(sku, asin, title, category, price, unitCost, units, sales, refunds, adSpend, adSales, sessions, pageViews, returns, rating, reviews, titleScore, bulletScore, imageScore, attributeScore, keywordScore, complianceScore, issue, timestamp, storeCode);
  }

  const dailyBase = [
    [1540, 22, 215, 382, 1540, 3], [1690, 24, 238, 411, 1692, 4],
    [1762, 25, 252, 438, 1770, 4], [1810, 26, 266, 451, 1815, 3],
    [1935, 28, 292, 486, 1940, 5], [1848, 27, 281, 462, 1860, 4],
    [2054, 30, 318, 521, 2061, 6], [2148, 31, 336, 548, 2150, 4],
    [2081, 30, 324, 529, 2090, 5], [2260, 33, 350, 574, 2265, 4],
    [2328, 34, 361, 591, 2330, 5], [2196, 32, 348, 556, 2200, 4],
    [2442, 36, 382, 622, 2446, 6], [2515, 37, 397, 641, 2520, 5]
  ];
  const insertDaily = db.prepare(`
    INSERT INTO daily_metrics (store_id, metric_date, sales, orders, ad_spend, cogs_est, sessions, returns)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `);
  dailyBase.forEach((row, index) => insertDaily.run(dateOffset(index - 13), ...row));

  const ads = [
    ['AH-BAM-002', 'SP - Drawer Organiser', 'Core', 'bamboo drawer organizer', 'exact', 82, 8900, 226.4, 840, 25],
    ['AH-BAM-002', 'SP - Drawer Organiser', 'Research', 'under bed storage', 'broad', 38, 4200, 104.8, 0, 0],
    ['AH-LAUN-006', 'SP - Laundry', 'Core', 'laundry hamper large', 'phrase', 44, 3800, 90.1, 130, 2],
    ['AH-SHOE-003', 'SP - Shoe Rack', 'Research', 'shoe rack 4 tier', 'broad', 22, 2600, 68.4, 0, 0],
    ['AH-BAM-002', 'SP - Drawer Organiser', 'Scale', 'bamboo drawer organizer set', 'phrase', 116, 10200, 160.2, 720, 23],
    ['AH-HOOK-004', 'SP - Hooks', 'Research', 'closet hooks no drill', 'broad', 16, 2100, 41.6, 0, 0],
    ['AH-SPICE-005', 'SP - Spice Rack', 'Core', 'spice rack organizer', 'phrase', 63, 6100, 132.7, 210, 7],
    ['AH-CART-008', 'SP - Rolling Cart', 'Core', 'rolling cart slim', 'broad', 31, 2400, 106.2, 98, 1],
    ['AH-VAC-001', 'SP - Vacuum Bags', 'Core', 'vacuum storage bags electric pump', 'phrase', 94, 9900, 242.1, 740, 20],
    ['AH-BED-007', 'SP - Under Bed', 'Scale', 'under bed storage bags', 'exact', 108, 12400, 218.7, 1060, 31],
    ['AH-SPICE-005', 'SP - Spice Rack', 'Research', 'cabinet spice organizer', 'broad', 18, 1700, 48.3, 0, 0],
    ['AH-HOOK-004', 'SP - Hooks', 'Scale', 'adhesive wall hooks heavy duty', 'exact', 129, 15400, 276.5, 1420, 42],
    ['TT-CLIP-001', 'GMV Max', 'Kitchen', 'küchen organizer clips', 'auto', 62, 16800, 188.2, 920, 29],
    ['TT-BOX-002', 'GMV Max', 'Storage', 'faltbare aufbewahrungsbox', 'auto', 45, 11200, 154.8, 610, 18],
    ['SP-HOOK-001', 'Search Ads', 'Hooks', 'adhesive hook', 'auto', 74, 14200, 96.4, 530, 25]
  ];
  const insertAd = db.prepare(`
    INSERT INTO ad_search_terms (
      store_id, product_id, campaign, ad_group, search_term, match_type,
      clicks, impressions, spend, ad_sales, ad_orders, updated_at
    )
    SELECT p.store_id, p.id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    FROM products p WHERE p.sku = ?
  `);
  for (const item of ads) {
    const [sku, campaign, group, term, matchType, clicks, impressions, spend, sales, orders] = item;
    insertAd.run(campaign, group, term, matchType, clicks, impressions, spend, sales, orders, timestamp, sku);
  }

  const inventory = [
    ['AH-BAM-002', 620, 200, 34, 18, 13.7, -12, '主仓库存稳定'],
    ['AH-VAC-001', 290, 0, 18, 6, 12.3, -25, '采购交期 18 天'],
    ['AH-SHOE-003', 1240, 0, 42, 19, 7.5, -60, '活动后库存偏高'],
    ['AH-HOOK-004', 760, 100, 25, 11, 19.7, -10, '畅销款正常补货'],
    ['AH-SPICE-005', 320, 180, 16, 8, 6.1, -19, '新品组合补货'],
    ['AH-LAUN-006', 980, 0, 31, 22, 5.2, -70, '退货率高，先清理库存'],
    ['AH-BED-007', 480, 160, 21, 7, 11.1, -14, '旺季前备货'],
    ['AH-CART-008', 155, 0, 9, 3, 3.2, -32, '高客单动销偏慢'],
    ['TT-CLIP-001', 840, 260, 29, 11, 9.5, -9, '直播库存可售'],
    ['TT-BOX-002', 510, 0, 17, 7, 4.7, -22, '颜色退货待分类'],
    ['SP-HOOK-001', 690, 150, 23, 8, 11.4, -8, '活动库存充足']
  ];
  const insertInventory = db.prepare(`
    INSERT INTO inventory_snapshots (
      store_id, product_id, snapshot_date, available, inbound, reserved, defective,
      avg_daily_sales, last_restock_date, note
    )
    SELECT p.store_id, p.id, ?, ?, ?, ?, ?, ?, ?, ?
    FROM products p WHERE p.sku = ?
  `);
  for (const item of inventory) {
    const [sku, available, inbound, reserved, defective, avgDaily, lastRestockOffset, note] = item;
    insertInventory.run(dateOffset(0), available, inbound, reserved, defective, avgDaily, dateOffset(lastRestockOffset), note, sku);
  }

  const afterSales = [
    ['AH-LAUN-006', 'AS-2401', '退货', '买家反馈袋体容量与预期不符', '商品尺寸描述不够直观', '退货原因集中在容量和滚轮安装，需回看主图及五点。', 'in_progress', 'high', '运营-林', 1],
    ['AH-SPICE-005', 'AS-2402', '差评', '层板间距无法放下常用调料瓶', '尺寸信息不完整', '差评已联系买家补充信息，同时准备更新尺寸图和 A+。', 'open', 'high', '运营-周', -1],
    ['AH-VAC-001', 'AS-2403', '买家消息', '询问是否适配 220V 电源', '售前产品属性缺失', '需把电压、插头类型和适用地区加入 Listing 属性。', 'open', 'medium', '客服-Amy', 0],
    ['AH-SHOE-003', 'AS-2404', '索赔', '运输破损要求部分退款', '外箱边角缺少加强保护', '索赔已提交承运商，包装团队评估增加护角。', 'waiting', 'high', '供应链-陈', 2],
    ['AH-CART-008', 'AS-2405', '订单缺陷', '轮子缺失导致 A-to-Z 风险', '配件漏发', '已安排补发轮组，订单缺陷率需连续两周观察。', 'in_progress', 'critical', '客服-Amy', -2],
    ['AH-BAM-002', 'AS-2406', '评论', '希望提供更多安装示意', '内容优化建议', '计划增加 15 秒安装短视频和步骤图。', 'resolved', 'low', '内容-Alice', 8],
    ['AH-BED-007', 'AS-2407', '退货', '买家重复购买后取消一单', '重复下单', '已退款并记录，不影响产品质量。', 'closed', 'low', '客服-Leo', -5],
    ['TT-BOX-002', 'AS-2408', '退货', '颜色与页面显示存在差异', '色差', '待补充自然光色卡图并统一直播间灯光。', 'open', 'medium', 'TikTok运营-Mia', 1]
  ];
  const insertAfterSale = db.prepare(`
    INSERT INTO after_sales (
      store_id, product_id, case_no, type, subject, reason, detail, status,
      priority, owner, due_date, evidence, created_at, updated_at
    )
    SELECT p.store_id, p.id, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?
    FROM products p WHERE p.sku = ?
  `);
  afterSales.forEach((item, index) => {
    const [sku, caseNo, type, subject, reason, detail, status, priority, owner, dueOffset] = item;
    insertAfterSale.run(caseNo, type, subject, reason, detail, status, priority, owner, dateOffset(dueOffset), new Date(Date.now() - (index + 2) * 86400000).toISOString(), timestamp, sku);
  });

  const knowledge = STARTER_ARTICLES;

  const insertKnowledge = db.prepare(`
    INSERT INTO knowledge_articles (
      title, category, symptom, solution, tags, views, created_at, slug, excerpt,
      content_md, cover_image, status, featured, updated_at
      ,publish_at
    ) VALUES (?, ?, '', '', ?, ?, ?, ?, ?, ?, ?, 'published', 0, ?, '')
  `);
  knowledge.forEach((article, index) => {
    const createdAt = new Date(Date.now() - (index + 1) * 86400000).toISOString();
    insertKnowledge.run(
      article.title,
      article.category,
      article.tags,
      article.views,
      createdAt,
      article.seedSlug || `seed-${index + 1}`,
      article.excerpt,
      article.contentMd,
      article.coverImage || '',
      createdAt
    );
  });

  const activities = [
    ['import', 'import', 0, '完成 Amazon 商品表现、搜索词和库存 3 份模拟报表校验'],
    ['action', 'action', 0, '规则引擎发现 11 项待处理运营异常'],
    ['after_sale', 'after_sale', 0, 'AS-2405 A-to-Z 风险已升级为紧急事项'],
    ['report', 'report', 0, '生成 8 月第 2 周运营复盘']
  ];
  const insertActivity = db.prepare(`
    INSERT INTO activities (store_id, action, entity_type, entity_id, detail, created_at)
    VALUES (1, ?, ?, ?, ?, ?)
  `);
  activities.forEach((item, index) => insertActivity.run(item[0], item[1], item[2], item[3], new Date(Date.now() - (index + 1) * 3600000).toISOString()));

  refreshOperationalActions(db, 1);
  refreshOperationalActions(db, 2);
  refreshOperationalActions(db, 3);
}

function refreshStarterKnowledge(db) {
  const findArticle = db.prepare(`
    SELECT id, content_md, cover_image
    FROM knowledge_articles
    WHERE title = ? OR title = ? OR slug = ?
    ORDER BY id
    LIMIT 1
  `);
  const updateArticle = db.prepare(`
    UPDATE knowledge_articles
    SET title = ?, category = ?, symptom = '', solution = '', tags = ?, excerpt = ?,
        content_md = ?, cover_image = ?, status = 'published', updated_at = ?
    WHERE id = ?
  `);
  for (const [index, article] of STARTER_ARTICLES.entries()) {
    const timestamp = new Date(Date.now() - index * 60000).toISOString();
    const row = findArticle.get(article.title, article.legacyTitle, article.legacySlug);
    if (!row) continue;
    const isStarterDraft = String(row.content_md || '').length < 1200 || !String(row.cover_image || '').trim();
    if (!isStarterDraft) continue;
    updateArticle.run(
      article.title,
      article.category,
      article.tags,
      article.excerpt,
      article.contentMd,
      article.coverImage || '',
      timestamp,
      row.id
    );
    syncKnowledgeTaxonomy(db, row.id, { category: article.category, tags: article.tags });
  }
}

function seedContent(db) {
  const slug = 'crosspilot-usage-guide';
  const existing = db.prepare('SELECT id FROM knowledge_articles WHERE slug = ?').get(slug);
  if (existing) return;
  const contentMd = `# CrossPilot 运营工具使用指南

CrossPilot 把报表导入、利润诊断、动作执行和复盘写作放在同一套工作流里。第一次使用时，建议从当前店铺开始，先导入数据，再处理动作，最后把有效方法沉淀成文章。

![CrossPilot 首页](/assets/articles/crosspilot-home.png)

## 1. 确认当前店铺

顶部“当前店铺”会自动同步到运营总览、商品、广告、库存和售后模块。切换店铺后，页面数据、规则动作与报告都会一起切换。

## 2. 导入平台报表

进入“运营工具 → 数据导入”，拖入 CSV 或 XLSX 文件。系统会识别商品表现、搜索词、库存和退货/评论报表，并在入库前跳过买家姓名、邮箱、电话和地址等隐私字段。

1. 上传文件并检查识别类型。
2. 在字段映射中确认 SKU、日期、销售额、广告费和库存等字段。
3. 检查错误行与 PII 跳过项。
4. 点击“确认入库”，规则引擎会重新计算运营动作。

![数据导入与运营导航](/assets/articles/operations-navigation.png)

## 3. 从指标进入动作

运营总览只保留需要关注的利润、ACOS、库存、退货和待处理事项。点击指标卡、SKU 异常榜或动作中心，可以继续进入对应模块。

- 商品：检查 Listing 六维评分、售价和利润空间。
- 广告：按搜索词判断否词、降价、暂停或放量。
- 库存：按采购交期和安全库存计算补货量。
- 售后：关联退货原因、店铺健康阈值和超时事项。

## 4. 维护文章与复盘

进入“文章 → 内容后台”，可以新建、编辑、保存草稿或发布文章。编辑器支持标题、粗体、列表、引用、链接、代码块和 Markdown 表格，也可以直接上传正文截图或封面。

文章保存后会自动提取摘要与阅读时长；旧知识库内容会继续保留，并转换为统一正文格式。

![全屏壁纸内容区](/assets/articles/content-transition.png)

## 5. 常用 Markdown 语法

\`\`\`markdown
## 二级标题
**重点内容**
- 列表项
> 引用说明
![图片说明](/uploads/example.png)
\`\`\`

完成后点击“预览”检查排版，再保存为草稿或直接发布。
`;
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO knowledge_articles (
      title, category, symptom, solution, tags, views, created_at, slug, excerpt,
      content_md, cover_image, status, featured, publish_at, updated_at
    ) VALUES (?, ?, '', ?, ?, 0, ?, ?, ?, ?, ?, 'published', 1, '', ?)
  `).run(
    'CrossPilot 运营工具使用指南',
    '使用指南',
    '从报表导入、动作处理到文章沉淀，完整走一遍 CrossPilot 的日常使用流程。',
    'CrossPilot,使用指南,运营流程,Markdown,内容后台',
    timestamp,
    slug,
    '从报表导入、动作处理到文章沉淀，完整走一遍 CrossPilot 的日常使用流程。',
    contentMd,
    '/assets/articles/crosspilot-home.png',
    timestamp
  );
}

export function listStores(db) {
  return db.prepare('SELECT * FROM stores ORDER BY id').all();
}

export function getStore(db, storeId) {
  return db.prepare('SELECT * FROM stores WHERE id = ?').get(Number(storeId));
}

export function listProducts(db, storeId) {
  return db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY id').all(Number(storeId));
}

export function getProduct(db, productId, storeId) {
  if (storeId) return db.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?').get(Number(productId), Number(storeId));
  return db.prepare('SELECT * FROM products WHERE id = ?').get(Number(productId));
}

export function listDailyMetrics(db, storeId, limit = 30) {
  return db.prepare('SELECT * FROM daily_metrics WHERE store_id = ? ORDER BY metric_date DESC LIMIT ?').all(Number(storeId), Number(limit)).reverse();
}

export function listAdTerms(db, storeId) {
  return db.prepare(`
    SELECT a.*, p.sku, p.title AS product_title
    FROM ad_search_terms a
    LEFT JOIN products p ON p.id = a.product_id
    WHERE a.store_id = ?
    ORDER BY a.spend DESC, a.id
  `).all(Number(storeId));
}

export function listInventory(db, storeId) {
  return db.prepare(`
    SELECT i.*, p.sku, p.title AS product_title
    FROM inventory_snapshots i
    JOIN products p ON p.id = i.product_id
    WHERE i.store_id = ?
    ORDER BY i.id
  `).all(Number(storeId));
}

export function listAfterSales(db, storeId) {
  return db.prepare(`
    SELECT a.*, p.sku, p.title AS product_title
    FROM after_sales a
    LEFT JOIN products p ON p.id = a.product_id
    WHERE a.store_id = ?
    ORDER BY CASE a.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, a.due_date, a.id
  `).all(Number(storeId));
}

export function listActions(db, storeId, status) {
  const params = [Number(storeId)];
  let sql = `
    SELECT a.*, p.sku, p.title AS product_title,
      (SELECT COUNT(*) FROM action_events e WHERE e.action_id = a.id) AS event_count
    FROM actions a
    LEFT JOIN products p ON p.id = a.product_id
    WHERE a.store_id = ?
  `;
  if (status && status !== 'all') {
    if (status === 'open') sql += " AND a.status NOT IN ('done', 'closed', 'ignored')";
    else sql += ' AND a.status = ?';
    params.push(status);
  }
  sql += " ORDER BY CASE a.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'deferred' THEN 2 WHEN 'done' THEN 3 ELSE 4 END, CASE a.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, a.due_date, a.id";
  return db.prepare(sql).all(...params);
}

export function getAction(db, actionId) {
  const action = db.prepare(`
    SELECT a.*, p.sku, p.title AS product_title
    FROM actions a LEFT JOIN products p ON p.id = a.product_id
    WHERE a.id = ?
  `).get(Number(actionId));
  if (!action) return null;
  return {
    ...action,
    events: db.prepare('SELECT * FROM action_events WHERE action_id = ? ORDER BY created_at DESC, id DESC').all(action.id)
  };
}

export function createAction(db, storeId, input) {
  const createdAt = nowIso();
  const sourceKey = input.sourceKey || `manual:${storeId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const result = db.prepare(`
    INSERT INTO actions (
      store_id, product_id, source_type, source_id, source_key, category, title,
      description, priority, recommendation, status, owner, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(storeId), input.productId ? Number(input.productId) : null,
    input.sourceType || 'manual', Number(input.sourceId) || 0, sourceKey,
    input.category || '运营', input.title, input.description || '',
    input.priority || 'medium', input.recommendation || 'manual',
    input.status || 'open', input.owner || '', input.dueDate || '', createdAt, createdAt
  );
  const id = Number(result.lastInsertRowid);
  addActionEvent(db, id, 'created', '创建动作', input.description || input.title, createdAt);
  addActivity(db, storeId, 'create', 'action', id, `创建运营动作：${input.title}`, createdAt);
  return getAction(db, id);
}

export function updateAction(db, actionId, patch) {
  const current = db.prepare('SELECT * FROM actions WHERE id = ?').get(Number(actionId));
  if (!current) return null;
  const next = {
    status: patch.status ?? current.status,
    owner: patch.owner ?? current.owner,
    due_date: patch.dueDate ?? current.due_date,
    evidence: patch.evidence ?? current.evidence,
    result: patch.result ?? current.result,
    priority: patch.priority ?? current.priority,
    description: patch.description ?? current.description
  };
  const updatedAt = nowIso();
  const closedAt = ['done', 'closed'].includes(next.status) ? (current.closed_at || updatedAt) : null;
  db.prepare(`
    UPDATE actions SET status = ?, owner = ?, due_date = ?, evidence = ?, result = ?,
      priority = ?, description = ?, updated_at = ?, closed_at = ?
    WHERE id = ?
  `).run(next.status, next.owner, next.due_date, next.evidence, next.result, next.priority, next.description, updatedAt, closedAt, Number(actionId));
  const eventTitle = patch.eventTitle || statusLabel(next.status);
  addActionEvent(db, Number(actionId), 'updated', eventTitle, patch.eventDetail || next.result || next.evidence || next.description, updatedAt);
  addActivity(db, current.store_id, 'update', 'action', Number(actionId), `${eventTitle}：${current.title}`, updatedAt);
  return getAction(db, actionId);
}

export function refreshOperationalActions(db, storeId) {
  const store = getStore(db, storeId);
  if (!store) return [];
  const candidates = actionsForStore(db, Number(storeId));
  const insert = db.prepare(`
    INSERT INTO actions (
      store_id, product_id, source_type, source_id, source_key, category, title,
      description, priority, recommendation, status, owner, due_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', '', ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE actions SET product_id = ?, category = ?, title = ?, description = ?,
      priority = ?, updated_at = ?
    WHERE source_key = ? AND status NOT IN ('done', 'closed', 'ignored')
  `);
  const timestamp = nowIso();
  const transaction = db.transaction(() => {
    for (const item of candidates) {
      const key = `${item.source_type}:${item.source_id}:${item.recommendation}`;
      const existing = db.prepare('SELECT id FROM actions WHERE source_key = ?').get(key);
      const dueDate = item.priority === 'critical' ? dateOffset(0) : item.priority === 'high' ? dateOffset(1) : dateOffset(3);
      if (existing) update.run(item.product_id || null, item.category, item.title, item.description, item.priority, timestamp, key);
      else insert.run(Number(storeId), item.product_id || null, item.source_type, Number(item.source_id), key, item.category, item.title, item.description, item.priority, item.recommendation, dueDate, timestamp, timestamp);
    }
  });
  transaction();
  return listActions(db, storeId);
}

export function listImports(db, storeId, limit = 30) {
  return db.prepare('SELECT * FROM import_batches WHERE store_id = ? ORDER BY id DESC LIMIT ?').all(Number(storeId), Number(limit)).map(parseImportBatch);
}

export function getImport(db, batchId) {
  const row = db.prepare('SELECT * FROM import_batches WHERE id = ?').get(Number(batchId));
  if (!row) return null;
  const batch = parseImportBatch(row);
  batch.rows = db.prepare('SELECT * FROM import_rows WHERE batch_id = ? ORDER BY row_index').all(batch.id).map(parseImportRow);
  return batch;
}

export function createImportBatch(db, storeId, input) {
  const timestamp = nowIso();
  const result = db.prepare(`
    INSERT INTO import_batches (
      store_id, filename, report_type, status, total_rows, valid_rows, error_rows,
      pii_columns_json, mapping_json, preview_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(storeId), input.filename, input.reportType, input.status || 'preview',
    input.totalRows || 0, input.validRows || 0, input.errorRows || 0,
    JSON.stringify(input.piiColumns || []), JSON.stringify(input.mapping || {}),
    JSON.stringify((input.preview || []).slice(0, 20)), timestamp, timestamp
  );
  const batchId = Number(result.lastInsertRowid);
  const insertRow = db.prepare(`
    INSERT INTO import_rows (batch_id, row_index, raw_json, normalized_json, errors_json, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const rows = input.rows || [];
  const transaction = db.transaction(() => {
    for (const item of rows) {
      insertRow.run(batchId, item.rowIndex, JSON.stringify(item.raw || {}), JSON.stringify(item.normalized || {}), JSON.stringify(item.errors || []), item.errors?.length ? 'error' : 'valid');
    }
  });
  transaction();
  addActivity(db, storeId, 'import_preview', 'import', batchId, `导入预览：${input.filename} · ${input.validRows || 0} 行可入库`, timestamp);
  return getImport(db, batchId);
}

export function updateImportMapping(db, batchId, mapping) {
  const batch = getImport(db, batchId);
  if (!batch) return null;
  db.prepare('UPDATE import_batches SET mapping_json = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(mapping), nowIso(), Number(batchId));
  return getImport(db, batchId);
}

export function replaceImportRows(db, batchId, result) {
  const batch = getImport(db, batchId);
  if (!batch) return null;
  const insertRow = db.prepare(`
    INSERT INTO import_rows (batch_id, row_index, raw_json, normalized_json, errors_json, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM import_rows WHERE batch_id = ?').run(Number(batchId));
    for (const item of result.rows || []) {
      insertRow.run(Number(batchId), item.rowIndex, JSON.stringify(item.raw || {}), JSON.stringify(item.normalized || {}), JSON.stringify(item.errors || []), item.errors?.length ? 'error' : 'valid');
    }
    db.prepare(`
      UPDATE import_batches SET mapping_json = ?, preview_json = ?, valid_rows = ?,
        error_rows = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(result.mapping || {}), JSON.stringify((result.preview || []).slice(0, 20)), result.validRows || 0, result.errorRows || 0, nowIso(), Number(batchId));
  });
  transaction();
  return getImport(db, batchId);
}

export function updateImportStatus(db, batchId, status, summary = {}) {
  const batch = getImport(db, batchId);
  if (!batch) return null;
  db.prepare(`
    UPDATE import_batches SET status = ?, valid_rows = ?, error_rows = ?, updated_at = ?
    WHERE id = ?
  `).run(status, summary.validRows ?? batch.valid_rows, summary.errorRows ?? batch.error_rows, nowIso(), Number(batchId));
  addActivity(db, batch.store_id, status === 'committed' ? 'import_commit' : 'import_cancel', 'import', Number(batchId), `${status === 'committed' ? '确认入库' : '取消导入'}：${batch.filename}`, nowIso());
  return getImport(db, batchId);
}

export function commitImportBatch(db, batchId) {
  const batch = getImport(db, batchId);
  if (!batch) throw new Error('导入批次不存在');
  if (batch.status === 'committed') return batch;
  if (batch.status === 'cancelled') throw new Error('已取消的导入批次不能再次提交');
  const validRows = batch.rows.filter((row) => row.status === 'valid');
  const transaction = db.transaction(() => {
    for (const row of validRows) applyImportRow(db, batch, row.normalized);
  });
  transaction();
  return updateImportStatus(db, batchId, 'committed', { validRows: validRows.length, errorRows: batch.error_rows });
}

function applyImportRow(db, batch, row) {
  const timestamp = nowIso();
  if (batch.report_type === 'products') {
    const sku = text(row.sku);
    if (!sku) return;
    const product = db.prepare('SELECT id FROM products WHERE store_id = ? AND sku = ?').get(batch.store_id, sku);
    if (product) {
      db.prepare(`
        UPDATE products SET title = COALESCE(NULLIF(?, ''), title), price = COALESCE(?, price),
          unit_cost = COALESCE(?, unit_cost), units_30d = COALESCE(?, units_30d),
          sales_30d = COALESCE(?, sales_30d), ad_spend_30d = COALESCE(?, ad_spend_30d),
          ad_sales_30d = COALESCE(?, ad_sales_30d), returns_30d = COALESCE(?, returns_30d),
          rating = COALESCE(?, rating), review_count = COALESCE(?, review_count), updated_at = ?
        WHERE id = ?
      `).run(row.title || '', numberOrNull(row.price), numberOrNull(row.unit_cost), numberOrNull(row.units_30d), numberOrNull(row.sales_30d), numberOrNull(row.ad_spend_30d), numberOrNull(row.ad_sales_30d), numberOrNull(row.returns_30d), numberOrNull(row.rating), numberOrNull(row.review_count), timestamp, product.id);
    } else {
      db.prepare(`
        INSERT INTO products (
          store_id, sku, asin, title, category, price, unit_cost, units_30d, sales_30d,
          refund_amount_30d, ad_spend_30d, ad_sales_30d, sessions_30d, page_views_30d,
          returns_30d, rating, review_count, title_score, bullet_score, image_score,
          attribute_score, keyword_score, compliance_score, issue_summary, updated_at
        ) VALUES (?, ?, '', ?, '导入商品', ?, ?, ?, ?, 0, ?, ?, 0, 0, ?, ?, ?, 0, 0, 0, 0, 0, 0, '等待 Listing 评估', ?)
      `).run(batch.store_id, sku, row.title || sku, bid(row.price), bid(row.unit_cost), int(row.units_30d), bid(row.sales_30d), bid(row.ad_spend_30d), bid(row.ad_sales_30d), int(row.returns_30d), bid(row.rating), int(row.review_count), timestamp);
    }
    return;
  }
  if (batch.report_type === 'ads') {
    const product = db.prepare('SELECT id FROM products WHERE store_id = ? AND sku = ?').get(batch.store_id, text(row.sku));
    db.prepare(`
      INSERT INTO ad_search_terms (
        store_id, product_id, campaign, ad_group, search_term, match_type,
        clicks, impressions, spend, ad_sales, ad_orders, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(batch.store_id, product?.id || null, text(row.campaign), text(row.ad_group), text(row.search_term), text(row.match_type) || 'broad', int(row.clicks), int(row.impressions), bid(row.spend), bid(row.ad_sales), int(row.ad_orders), timestamp);
    return;
  }
  if (batch.report_type === 'inventory') {
    const product = db.prepare('SELECT id FROM products WHERE store_id = ? AND sku = ?').get(batch.store_id, text(row.sku));
    if (!product) return;
    db.prepare(`
      INSERT INTO inventory_snapshots (
        store_id, product_id, snapshot_date, available, inbound, reserved, defective,
        avg_daily_sales, last_restock_date, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET snapshot_date = excluded.snapshot_date,
        available = excluded.available, inbound = excluded.inbound, reserved = excluded.reserved,
        defective = excluded.defective, avg_daily_sales = excluded.avg_daily_sales,
        last_restock_date = excluded.last_restock_date, note = excluded.note
    `).run(batch.store_id, product.id, text(row.snapshot_date) || dateOffset(0), int(row.available), int(row.inbound), int(row.reserved), int(row.defective), bid(row.avg_daily_sales), text(row.last_restock_date), text(row.note));
    return;
  }
  if (batch.report_type === 'after_sales') {
    const product = db.prepare('SELECT id FROM products WHERE store_id = ? AND sku = ?').get(batch.store_id, text(row.sku));
    const caseNo = text(row.case_no) || `IMP-${batch.id}-${Date.now()}`;
    db.prepare(`
      INSERT INTO after_sales (
        store_id, product_id, case_no, type, subject, reason, detail, status,
        priority, owner, due_date, evidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(case_no) DO UPDATE SET subject = excluded.subject, reason = excluded.reason,
        detail = excluded.detail, status = excluded.status, priority = excluded.priority,
        owner = excluded.owner, due_date = excluded.due_date, updated_at = excluded.updated_at
    `).run(batch.store_id, product?.id || null, caseNo, text(row.type) || '客服', text(row.subject) || '导入售后问题', text(row.reason), text(row.detail), text(row.status) || 'open', text(row.priority) || 'medium', text(row.owner), text(row.due_date), text(row.evidence), timestamp, timestamp);
  }
}

export function listKnowledge(db, options = {}) {
  const normalized = typeof options === 'string' ? { query: options } : (options || {});
  const clauses = [];
  const params = [];
  const query = String(normalized.query || '').trim();
  const category = String(normalized.category || '').trim();
  const tag = String(normalized.tag || '').trim();
  const series = String(normalized.series || '').trim();
  const month = String(normalized.month || '').trim();
  const status = String(normalized.status || 'published').trim();
  if (query) {
    clauses.push('k.id IN (SELECT rowid FROM knowledge_fts WHERE knowledge_fts MATCH ?)');
    params.push(toFtsQuery(query) || query);
  }
  if (category) {
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM article_category_links cl
        JOIN content_categories c ON c.id = cl.category_id
        WHERE cl.article_id = k.id AND c.name = ?
      )
    `);
    params.push(category);
  }
  if (tag) {
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM article_tag_links tl
        JOIN content_tags t ON t.id = tl.tag_id
        WHERE tl.article_id = k.id AND t.name = ?
      )
    `);
    params.push(tag);
  }
  if (series) {
    clauses.push(`
      EXISTS (
        SELECT 1
        FROM article_series_items si
        JOIN content_series s ON s.id = si.series_id
        WHERE si.article_id = k.id AND s.slug = ?
      )
    `);
    params.push(series);
  }
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    clauses.push("substr(COALESCE(NULLIF(k.updated_at, ''), k.created_at), 1, 7) = ?");
    params.push(month);
  }
  if (status !== 'all') {
    clauses.push('k.status = ?');
    params.push(status || 'published');
    if (status === 'published') {
      clauses.push("(k.publish_at = '' OR k.publish_at <= ?)");
      params.push(nowIso());
    }
  }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const limit = Math.min(500, Math.max(1, Number(normalized.limit) || 50));
  const offset = Math.max(0, Number(normalized.offset) || 0);
  const order = status === 'all'
    ? 'k.updated_at DESC, k.id DESC'
    : 'k.featured DESC, k.updated_at DESC, k.id DESC';
  return db.prepare(`
    SELECT k.* FROM knowledge_articles k
    ${where}
    ORDER BY ${order}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset).map(normalizeKnowledgeRow);
}

export function getKnowledge(db, articleIdOrSlug) {
  const value = String(articleIdOrSlug ?? '').trim();
  const row = /^\d+$/.test(value)
    ? db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(Number(value))
    : db.prepare('SELECT * FROM knowledge_articles WHERE slug = ?').get(value);
  return normalizeKnowledgeRow(row);
}

export function createKnowledge(db, input) {
  const timestamp = nowIso();
  const contentMd = String(input.contentMd || '').trim();
  const fallbackContent = contentFromLegacy(input);
  const body = contentMd || fallbackContent;
  const slug = uniqueSlug(db, input.title, input.slug);
  const status = input.status === 'draft' ? 'draft' : 'published';
  const result = db.prepare(`
    INSERT INTO knowledge_articles (
      title, category, symptom, solution, tags, views, created_at, slug, excerpt,
      content_md, cover_image, status, featured, publish_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.title,
    input.category || '运营复盘',
    input.symptom || '',
    input.solution || body || input.title,
    input.tags || '',
    timestamp,
    slug,
    input.excerpt || compactText(body || input.symptom),
    body,
    input.coverImage || '',
    status,
    input.featured ? 1 : 0,
    input.publishAt || '',
    timestamp
  );
  syncKnowledgeTaxonomy(db, Number(result.lastInsertRowid), input);
  return getKnowledge(db, Number(result.lastInsertRowid));
}

export function updateKnowledge(db, articleId, input) {
  const current = getKnowledge(db, articleId);
  if (!current) return null;
  const title = input.title ?? current.title;
  const contentMd = input.contentMd ?? current.content_md;
  const status = input.status === 'draft' ? 'draft' : input.status === 'published' ? 'published' : current.status;
  const slug = uniqueSlug(db, title, input.slug || current.slug, current.id);
  db.prepare(`
    UPDATE knowledge_articles SET
      title = ?, category = ?, slug = ?, excerpt = ?, content_md = ?, cover_image = ?,
      tags = ?, status = ?, featured = ?, publish_at = ?, updated_at = ?
    WHERE id = ?
  `).run(
    title,
    input.category ?? current.category,
    slug,
    input.excerpt ?? current.excerpt,
    contentMd,
    input.coverImage ?? current.cover_image,
    input.tags ?? current.tags,
    status,
    input.featured === undefined ? (current.featured ? 1 : 0) : (input.featured ? 1 : 0),
    input.publishAt ?? current.publish_at,
    nowIso(),
    current.id
  );
  syncKnowledgeTaxonomy(db, current.id, {
    category: input.category ?? current.category,
    tags: input.tags ?? current.tags
  });
  return getKnowledge(db, current.id);
}

export function deleteKnowledge(db, articleId) {
  return db.prepare('DELETE FROM knowledge_articles WHERE id = ?').run(Number(articleId)).changes > 0;
}

export function incrementKnowledgeViews(db, articleId) {
  db.prepare('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?').run(Number(articleId));
}

export function getKnowledgeStats(db) {
  return getContentStats(db);
}

export {
  cleanupOrphanMedia,
  createArticleComment,
  createContentEntry,
  deleteArticleComment,
  deleteContentEntry,
  getArticleRelationships,
  getContentEntry,
  listArchive,
  listArticleComments,
  listAllComments,
  listContentEntries,
  listMedia,
  registerMedia,
  updateArticleCommentStatus,
  updateContentEntry
};

export function listActivities(db, storeId, limit = 20) {
  return db.prepare('SELECT * FROM activities WHERE store_id = ? ORDER BY created_at DESC, id DESC LIMIT ?').all(Number(storeId), Number(limit));
}

export function addActivity(db, storeId, action, entityType, entityId, detail, createdAt = nowIso()) {
  db.prepare(`
    INSERT INTO activities (store_id, action, entity_type, entity_id, detail, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(Number(storeId), action, entityType, entityId || null, detail, createdAt);
}

function addActionEvent(db, actionId, eventType, title, detail, createdAt = nowIso()) {
  db.prepare(`
    INSERT INTO action_events (action_id, event_type, title, detail, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(Number(actionId), eventType, title, detail || '', createdAt);
}

function parseImportBatch(row) {
  return {
    ...row,
    pii_columns: parseJson(row.pii_columns_json, []),
    mapping: parseJson(row.mapping_json, {}),
    preview: parseJson(row.preview_json, [])
  };
}

function parseImportRow(row) {
  return {
    ...row,
    raw: parseJson(row.raw_json, {}),
    normalized: parseJson(row.normalized_json, {}),
    errors: parseJson(row.errors_json, [])
  };
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bid(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function int(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
}

function text(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function statusLabel(status) {
  return {
    open: '重新打开',
    in_progress: '开始执行',
    deferred: '延期处理',
    done: '完成动作',
    closed: '关闭动作',
    ignored: '忽略动作'
  }[status] || '更新动作';
}
