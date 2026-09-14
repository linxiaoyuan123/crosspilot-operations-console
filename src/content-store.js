import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const nowIso = () => new Date().toISOString();

const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72);

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeComment = (row) => row && {
  ...row,
  parent_id: row.parent_id ? Number(row.parent_id) : null
};

const normalizeContentEntry = (row) => row && {
  ...row,
  metadata: parseJson(row.metadata_json, {}),
  featured: Boolean(row.featured)
};

export const CONTENT_TYPES = ['dynamic', 'project', 'gallery', 'resource', 'guestbook', 'about'];

export function migrateContent(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS article_category_links (
      article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
      PRIMARY KEY(article_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS article_tag_links (
      article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
      PRIMARY KEY(article_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS article_series_items (
      article_id INTEGER PRIMARY KEY REFERENCES knowledge_articles(id) ON DELETE CASCADE,
      series_id INTEGER NOT NULL REFERENCES content_series(id) ON DELETE CASCADE,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS article_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,
      nickname TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL UNIQUE,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      width INTEGER,
      height INTEGER,
      article_id INTEGER REFERENCES knowledge_articles(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      content_md TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('draft', 'published')),
      featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(type, slug)
    );

    CREATE INDEX IF NOT EXISTS idx_comments_article_status
      ON article_comments(article_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_parent
      ON article_comments(parent_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_content_entries_type_status
      ON content_entries(type, status, featured DESC, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_article
      ON media_library(article_id, created_at DESC);
  `);

  const hasFts = db.prepare(`
    SELECT 1 AS ok FROM sqlite_master
    WHERE type = 'table' AND name = 'knowledge_fts'
  `).get();
  if (!hasFts) {
    db.exec(`
      CREATE VIRTUAL TABLE knowledge_fts USING fts5(
        title,
        excerpt,
        content_md,
        tags,
        content = 'knowledge_articles',
        content_rowid = 'id',
        tokenize = 'unicode61'
      );
    `);
  }

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS knowledge_fts_insert
    AFTER INSERT ON knowledge_articles BEGIN
      INSERT INTO knowledge_fts(rowid, title, excerpt, content_md, tags)
      VALUES (new.id, new.title, new.excerpt, new.content_md, new.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS knowledge_fts_delete
    AFTER DELETE ON knowledge_articles BEGIN
      INSERT INTO knowledge_fts(knowledge_fts, rowid, title, excerpt, content_md, tags)
      VALUES ('delete', old.id, old.title, old.excerpt, old.content_md, old.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS knowledge_fts_update
    AFTER UPDATE ON knowledge_articles BEGIN
      INSERT INTO knowledge_fts(knowledge_fts, rowid, title, excerpt, content_md, tags)
      VALUES ('delete', old.id, old.title, old.excerpt, old.content_md, old.tags);
      INSERT INTO knowledge_fts(rowid, title, excerpt, content_md, tags)
      VALUES (new.id, new.title, new.excerpt, new.content_md, new.tags);
    END;
  `);

  const articles = db.prepare('SELECT id, category, tags FROM knowledge_articles').all();
  for (const article of articles) syncKnowledgeTaxonomy(db, article.id, {
    category: article.category,
    tags: article.tags
  });
  db.exec("INSERT INTO knowledge_fts(knowledge_fts) VALUES ('rebuild')");
  seedStructuredContent(db);
}

export function syncKnowledgeTaxonomy(db, articleId, input = {}) {
  const article = db.prepare('SELECT category, tags FROM knowledge_articles WHERE id = ?').get(Number(articleId));
  if (!article) return;
  const timestamp = nowIso();
  const category = String(input.category ?? article.category ?? '').trim() || '未分类';
  const tags = String(input.tags ?? article.tags ?? '')
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index);

  let categoryRow = db.prepare('SELECT * FROM content_categories WHERE name = ?').get(category);
  if (!categoryRow) {
    const base = slugify(category) || `category-${Date.now()}`;
    let slug = base;
    let suffix = 2;
    while (db.prepare('SELECT 1 FROM content_categories WHERE slug = ?').get(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }
    const result = db.prepare(`
      INSERT INTO content_categories (name, slug, description, created_at)
      VALUES (?, ?, '', ?)
    `).run(category, slug, timestamp);
    categoryRow = { id: Number(result.lastInsertRowid) };
  }

  db.prepare('DELETE FROM article_category_links WHERE article_id = ?').run(Number(articleId));
  db.prepare('INSERT INTO article_category_links (article_id, category_id) VALUES (?, ?)')
    .run(Number(articleId), categoryRow.id);
  db.prepare('DELETE FROM article_tag_links WHERE article_id = ?').run(Number(articleId));

  const insertTagLink = db.prepare('INSERT INTO article_tag_links (article_id, tag_id) VALUES (?, ?)');
  for (const tag of tags) {
    let tagRow = db.prepare('SELECT * FROM content_tags WHERE name = ?').get(tag);
    if (!tagRow) {
      const base = slugify(tag) || `tag-${Date.now()}`;
      let slug = base;
      let suffix = 2;
      while (db.prepare('SELECT 1 FROM content_tags WHERE slug = ?').get(slug)) {
        slug = `${base}-${suffix}`;
        suffix += 1;
      }
      const result = db.prepare(`
        INSERT INTO content_tags (name, slug, created_at)
        VALUES (?, ?, ?)
      `).run(tag, slug, timestamp);
      tagRow = { id: Number(result.lastInsertRowid) };
    }
    insertTagLink.run(Number(articleId), tagRow.id);
  }
}

export function listArticleComments(db, articleId, { status = 'approved' } = {}) {
  const clauses = ['article_id = ?'];
  const params = [Number(articleId)];
  if (status !== 'all') {
    clauses.push('status = ?');
    params.push(status === 'pending' || status === 'rejected' ? status : 'approved');
  }
  const rows = db.prepare(`
    SELECT * FROM article_comments
    WHERE ${clauses.join(' AND ')}
    ORDER BY created_at ASC, id ASC
  `).all(...params).map(normalizeComment);
  const byParent = new Map();
  rows.forEach((item) => {
    const key = item.parent_id || 0;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  });
  const attachReplies = (item) => ({ ...item, replies: (byParent.get(item.id) || []).map(attachReplies) });
  return (byParent.get(0) || []).map(attachReplies);
}

export function listAllComments(db, { status = 'all', limit = 100 } = {}) {
  const clauses = [];
  const params = [];
  if (status !== 'all') {
    clauses.push('c.status = ?');
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`
    SELECT c.*, a.title AS article_title, a.slug AS article_slug
    FROM article_comments c
    JOIN knowledge_articles a ON a.id = c.article_id
    ${where}
    ORDER BY CASE c.status WHEN 'pending' THEN 0 ELSE 1 END, c.created_at DESC
    LIMIT ?
  `).all(...params, Math.min(500, Math.max(1, Number(limit) || 100))).map(normalizeComment);
}

export function createArticleComment(db, articleId, input) {
  const parentId = input.parentId ? Number(input.parentId) : null;
  if (parentId) {
    const parent = db.prepare('SELECT id, article_id FROM article_comments WHERE id = ?').get(parentId);
    if (!parent || Number(parent.article_id) !== Number(articleId)) {
      const error = new Error('父级留言不属于当前文章');
      error.statusCode = 400;
      throw error;
    }
  }
  const timestamp = nowIso();
  const result = db.prepare(`
    INSERT INTO article_comments (
      article_id, parent_id, nickname, content, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    Number(articleId),
    parentId,
    input.nickname,
    input.content,
    input.status || 'pending',
    timestamp,
    timestamp
  );
  return normalizeComment(db.prepare('SELECT * FROM article_comments WHERE id = ?').get(Number(result.lastInsertRowid)));
}

export function updateArticleCommentStatus(db, commentId, status) {
  db.prepare('UPDATE article_comments SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, nowIso(), Number(commentId));
  return normalizeComment(db.prepare('SELECT * FROM article_comments WHERE id = ?').get(Number(commentId)));
}

export function deleteArticleComment(db, commentId) {
  return db.prepare('DELETE FROM article_comments WHERE id = ?').run(Number(commentId)).changes > 0;
}

export function registerMedia(db, input) {
  const timestamp = nowIso();
  const result = db.prepare(`
    INSERT INTO media_library (
      filename, url, mime_type, size, width, height, article_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.filename,
    input.url,
    input.mimeType,
    Number(input.size) || 0,
    input.width ? Number(input.width) : null,
    input.height ? Number(input.height) : null,
    input.articleId ? Number(input.articleId) : null,
    timestamp
  );
  return db.prepare('SELECT * FROM media_library WHERE id = ?').get(Number(result.lastInsertRowid));
}

export function listMedia(db, limit = 200) {
  return db.prepare('SELECT * FROM media_library ORDER BY created_at DESC, id DESC LIMIT ?')
    .all(Math.min(1000, Math.max(1, Number(limit) || 200)));
}

export function cleanupOrphanMedia(db, uploadsDirectory) {
  const unused = db.prepare(`
    SELECT * FROM media_library media
    WHERE media.article_id IS NULL
      AND media.url NOT IN (SELECT cover_image FROM knowledge_articles WHERE cover_image <> '')
      AND media.url NOT IN (SELECT cover_image FROM content_entries WHERE cover_image <> '')
      AND NOT EXISTS (
        SELECT 1 FROM knowledge_articles article WHERE instr(article.content_md, media.url) > 0
      )
      AND NOT EXISTS (
        SELECT 1 FROM content_entries entry WHERE instr(entry.content_md, media.url) > 0
      )
      AND media.created_at < datetime('now', '-1 day')
  `).all();
  let removed = 0;
  for (const media of unused) {
    const filename = resolve(uploadsDirectory, media.filename);
    if (existsSync(filename)) {
      try {
        unlinkSync(filename);
        removed += 1;
      } catch {
        continue;
      }
    }
    db.prepare('DELETE FROM media_library WHERE id = ?').run(media.id);
  }
  return removed;
}

export function listContentEntries(db, { type, status = 'published', query = '', limit = 50 } = {}) {
  const clauses = [];
  const params = [];
  if (type) {
    clauses.push('type = ?');
    params.push(type);
  }
  if (status !== 'all') {
    clauses.push('status = ?');
    params.push(status === 'draft' ? 'draft' : 'published');
  }
  if (query) {
    const like = `%${query}%`;
    clauses.push('(title LIKE ? OR summary LIKE ? OR content_md LIKE ?)');
    params.push(like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const safeLimit = Math.min(500, Math.max(1, Number(limit) || 50));
  return db.prepare(`
    SELECT * FROM content_entries
    ${where}
    ORDER BY featured DESC, published_at DESC, id DESC
    LIMIT ?
  `).all(...params, safeLimit).map(normalizeContentEntry);
}

export function getContentEntry(db, type, slugOrId) {
  const value = String(slugOrId ?? '').trim();
  const row = /^\d+$/.test(value)
    ? db.prepare('SELECT * FROM content_entries WHERE type = ? AND id = ?').get(type, Number(value))
    : db.prepare('SELECT * FROM content_entries WHERE type = ? AND slug = ?').get(type, value);
  return normalizeContentEntry(row);
}

export function createContentEntry(db, input) {
  const timestamp = nowIso();
  const base = slugify(input.slug) || slugify(input.title) || `${input.type}-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (db.prepare('SELECT 1 FROM content_entries WHERE type = ? AND slug = ?').get(input.type, slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  const result = db.prepare(`
    INSERT INTO content_entries (
      type, slug, title, summary, content_md, cover_image, metadata_json,
      status, featured, published_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.type,
    slug,
    input.title,
    input.summary || '',
    input.contentMd || '',
    input.coverImage || '',
    JSON.stringify(input.metadata || {}),
    input.status === 'draft' ? 'draft' : 'published',
    input.featured ? 1 : 0,
    input.publishedAt || timestamp,
    timestamp
  );
  return getContentEntry(db, input.type, Number(result.lastInsertRowid));
}

export function updateContentEntry(db, type, id, input) {
  const current = getContentEntry(db, type, id);
  if (!current) return null;
  const timestamp = nowIso();
  const slug = slugify(input.slug) || current.slug;
  db.prepare(`
    UPDATE content_entries SET
      slug = ?, title = ?, summary = ?, content_md = ?, cover_image = ?, metadata_json = ?,
      status = ?, featured = ?, published_at = ?, updated_at = ?
    WHERE type = ? AND id = ?
  `).run(
    slug,
    input.title ?? current.title,
    input.summary ?? current.summary,
    input.contentMd ?? current.content_md,
    input.coverImage ?? current.cover_image,
    JSON.stringify(input.metadata ?? current.metadata),
    input.status === 'draft' ? 'draft' : input.status === 'published' ? 'published' : current.status,
    input.featured === undefined ? (current.featured ? 1 : 0) : (input.featured ? 1 : 0),
    input.publishedAt ?? current.published_at,
    timestamp,
    type,
    Number(id)
  );
  return getContentEntry(db, type, Number(id));
}

export function deleteContentEntry(db, type, id) {
  return db.prepare('DELETE FROM content_entries WHERE type = ? AND id = ?').run(type, Number(id)).changes > 0;
}

export function getContentStats(db) {
  const articles = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
      COALESCE(SUM(views), 0) AS views,
      COALESCE(SUM(LENGTH(content_md)), 0) AS characters
    FROM knowledge_articles
  `).get();
  const categories = db.prepare(`
    SELECT c.name, c.slug, COUNT(l.article_id) AS count
    FROM content_categories c
    LEFT JOIN article_category_links l ON l.category_id = c.id
    GROUP BY c.id
    ORDER BY count DESC, c.name
  `).all();
  const tags = db.prepare(`
    SELECT t.name, t.slug, COUNT(l.article_id) AS count
    FROM content_tags t
    LEFT JOIN article_tag_links l ON l.tag_id = t.id
    GROUP BY t.id
    ORDER BY count DESC, t.name
  `).all();
  const series = db.prepare(`
    SELECT s.name, s.slug, s.description, COUNT(i.article_id) AS count
    FROM content_series s
    LEFT JOIN article_series_items i ON i.series_id = s.id
    GROUP BY s.id
    ORDER BY s.name
  `).all();
  const comments = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved
    FROM article_comments
  `).get();
  return {
    total: Number(articles.total || 0),
    published: Number(articles.published || 0),
    drafts: Number(articles.drafts || 0),
    views: Number(articles.views || 0),
    characters: Number(articles.characters || 0),
    categories,
    tags,
    series,
    comments: {
      total: Number(comments.total || 0),
      pending: Number(comments.pending || 0),
      approved: Number(comments.approved || 0)
    }
  };
}

export function listArchive(db) {
  return db.prepare(`
    SELECT substr(COALESCE(NULLIF(updated_at, ''), created_at), 1, 7) AS month,
      COUNT(*) AS count
    FROM knowledge_articles
    WHERE status = 'published'
    GROUP BY month
    ORDER BY month DESC
  `).all();
}

export function getArticleRelationships(db, articleId) {
  const id = Number(articleId);
  const seriesItem = db.prepare(`
    SELECT s.id, s.name, s.slug, s.description, i.order_index
    FROM article_series_items i
    JOIN content_series s ON s.id = i.series_id
    WHERE i.article_id = ?
  `).get(id);
  let prev = null;
  let next = null;
  if (seriesItem) {
    const siblings = db.prepare(`
      SELECT k.id, k.slug, k.title, i.order_index
      FROM article_series_items i
      JOIN knowledge_articles k ON k.id = i.article_id
      WHERE i.series_id = ? AND k.status = 'published'
      ORDER BY i.order_index, k.id
    `).all(seriesItem.id);
    const index = siblings.findIndex((item) => Number(item.id) === id);
    prev = index > 0 ? siblings[index - 1] : null;
    next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  }

  const related = db.prepare(`
    SELECT DISTINCT k.id, k.slug, k.title, k.excerpt, k.cover_image, k.updated_at
    FROM knowledge_articles k
    LEFT JOIN article_tag_links target_links
      ON target_links.article_id = ?
    JOIN article_tag_links candidate_links
      ON candidate_links.tag_id = target_links.tag_id
    WHERE k.id <> ?
      AND k.status = 'published'
      AND candidate_links.article_id = k.id
    ORDER BY k.updated_at DESC
    LIMIT 4
  `).all(id, id);

  const random = db.prepare(`
    SELECT id, slug, title, excerpt, cover_image, updated_at
    FROM knowledge_articles
    WHERE status = 'published' AND id <> ?
    ORDER BY RANDOM()
    LIMIT 3
  `).all(id);

  const adjacent = db.prepare(`
    SELECT id, slug, title, updated_at
    FROM knowledge_articles
    WHERE status = 'published'
    ORDER BY COALESCE(NULLIF(updated_at, ''), created_at) DESC, id DESC
  `).all();
  const adjacentIndex = adjacent.findIndex((item) => Number(item.id) === id);
  const previous = adjacentIndex > 0
    ? adjacent[adjacentIndex - 1]
    : null;
  const nextArticle = adjacentIndex >= 0 && adjacentIndex < adjacent.length - 1
    ? adjacent[adjacentIndex + 1]
    : null;

  return {
    series: seriesItem
      ? {
          id: seriesItem.id,
          name: seriesItem.name,
          slug: seriesItem.slug,
          description: seriesItem.description,
          order: seriesItem.order_index
        }
      : null,
    prev,
    next,
    previous,
    nextArticle,
    related,
    random
  };
}

export function toFtsQuery(query) {
  return String(query || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${term.replace(/"/g, '""')}"*`)
    .join(' ');
}

function seedStructuredContent(db) {
  const timestamp = nowIso();
  if (Number(db.prepare('SELECT COUNT(*) AS count FROM content_entries').get().count) === 0) {
    const entries = [
      ['dynamic', 'crosspilot-v3-launch', 'CrossPilot V3 内容与运营工作区上线', '主页、文章工作区和运营动作闭环现在共享同一套内容入口。', '## 本次更新\n\n- 新增真实内容路由与文章详情\n- 增加评论、系列与归档\n- 保留原有导入、规则引擎和报告能力\n\n后续运营记录会持续发布在这里。', '', { location: 'CrossPilot Workspace' }, 1],
      ['project', 'aurora-home-europe', 'AuroraHome 欧洲站利润修复', '从广告词、Listing 与退货原因三条线降低无效投入。', '## 项目背景\n\n欧洲站家居收纳店在旺季前出现广告依赖上升和部分 SKU 利润转负。\n\n## 处理路径\n\n1. 用搜索词报告收敛无转化流量。\n2. 重写尺寸与承重信息。\n3. 对高退货 SKU 做包装与页面复核。\n\n## 结果\n\n动作全部回写至运营报告，复盘周期从一周缩短到两天。', '/assets/hero-crosspilot.avif', { status: '已完成', tags: ['利润', '广告', 'Listing'] }, 1],
      ['project', 'tiktok-de-content-loop', 'TikTok Shop 德国店内容闭环', '把短视频素材、商品卖点和售后原因放进同一张内容日历。', '## 目标\n\n让内容团队看到素材上线后的转化、退货和评论反馈，而不是只看播放量。', '', { status: '进行中', tags: ['TikTok', '内容'] }, 0],
      ['gallery', 'operations-evidence-album', '运营证据相册', '保存 Listing 更新、广告后台和补货动作的脱敏证据。', '图片用于文章和工作复盘引用，不保存真实买家信息。', '/assets/hero-crosspilot-2.avif', { images: ['/assets/hero-crosspilot.avif', '/assets/hero-crosspilot-2.avif', '/assets/hero-crosspilot-3.avif'] }, 0],
      ['resource', 'marketplace-field-map', '多平台字段映射速查', 'Amazon、TikTok Shop、Shopee 常用报表字段的统一映射入口。', '先用统一字段导入，再根据报表类型检查必填列。字段说明可以直接查看 API 返回的映射表。', '', { links: [{ label: '字段映射 API', url: '/api/knowledge/field-map' }] }, 0],
      ['guestbook', 'feedback-guide', '反馈留言', '欢迎提交问题、改进建议和希望接入的平台报表。', '请尽量说明使用场景、当前结果和期望行为。评论默认进入审核，不会直接公开。', '', {}, 0],
      ['about', 'about-crosspilot', '关于 CrossPilot', '一个面向跨境运营岗位的本地决策、执行与复盘工作台。', 'CrossPilot 把报表导入、利润核算、广告诊断、库存补货、售后处理和内容复盘放在同一条链路里。所有规则结果都可以追溯到原始指标。\n\n项目默认使用脱敏模拟数据，不包含平台凭证和真实买家信息。', '/pig.png', { version: '3.0.0' }, 1]
    ];
    const insert = db.prepare(`
      INSERT INTO content_entries (
        type, slug, title, summary, content_md, cover_image, metadata_json,
        status, featured, published_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `);
    entries.forEach((entry, index) => {
      const publishedAt = new Date(Date.now() - index * 86400000).toISOString();
      insert.run(entry[0], entry[1], entry[2], entry[3], entry[4], entry[5], JSON.stringify(entry[6]), entry[7], publishedAt, publishedAt);
    });
  }

  const guide = db.prepare("SELECT id FROM knowledge_articles WHERE slug = 'crosspilot-usage-guide'").get();
  if (guide && Number(db.prepare('SELECT COUNT(*) AS count FROM article_comments').get().count) === 0) {
    const first = db.prepare(`
      INSERT INTO article_comments (article_id, nickname, content, status, created_at, updated_at)
      VALUES (?, ?, ?, 'approved', ?, ?)
    `).run(guide.id, '运营小林', '店铺切换和报表预览的路径很清楚，建议再补一个 TikTok 报表示例。', timestamp, timestamp);
    db.prepare(`
      INSERT INTO article_comments (
        article_id, parent_id, nickname, content, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'approved', ?, ?)
    `).run(guide.id, Number(first.lastInsertRowid), 'CrossPilot', '可以，下一版会补充 TikTok Shop 德国店的字段差异。', timestamp, timestamp);
    db.prepare(`
      INSERT INTO article_comments (article_id, nickname, content, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).run(guide.id, '待审核访客', '这条留言用于演示后台审核流程。', timestamp, timestamp);
  }

  if (guide && Number(db.prepare('SELECT COUNT(*) AS count FROM content_series').get().count) === 0) {
    const result = db.prepare(`
      INSERT INTO content_series (name, slug, description, created_at)
      VALUES ('运营工具入门', 'operations-starter', '从报表导入到文章复盘的连贯使用路径。', ?)
    `).run(timestamp);
    db.prepare(`
      INSERT INTO article_series_items (article_id, series_id, order_index)
      VALUES (?, ?, 1)
    `).run(guide.id, Number(result.lastInsertRowid));
  }
}
