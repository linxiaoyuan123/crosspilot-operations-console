import { isAbsolute, resolve } from 'node:path';
import DatabaseSync from 'better-sqlite3';
import mysql from 'mysql2/promise';
import mssql from 'mssql';

const READ_ONLY_PREFIXES = new Set(['SELECT', 'WITH', 'EXPLAIN']);
const WRITE_PREFIXES = new Set(['INSERT', 'UPDATE', 'DELETE', 'REPLACE', 'MERGE']);
const DANGEROUS_KEYWORDS = new Set([
  'ALTER', 'ATTACH', 'CREATE', 'DETACH', 'DROP', 'GRANT', 'REVOKE',
  'TRUNCATE', 'VACUUM'
]);
const DANGEROUS_CONFIRMATION = 'CONFIRM DANGEROUS SQL';
const MAX_QUERY_ROWS = 200;

export function assertSqlSafety(sqlText, { allowWrite = false, confirmPhrase = '' } = {}) {
  const sql = String(sqlText || '').trim();
  if (!sql) throw databaseError('SQL 不能为空');
  const inspected = inspectSql(sql);
  if (inspected.multipleStatements) throw databaseError('一次只能执行一条 SQL');

  const prefix = inspected.keywords[0] || '';
  const writeKeyword = inspected.keywords.find((keyword) => WRITE_PREFIXES.has(keyword));
  const dangerousKeyword = inspected.keywords.find((keyword) => DANGEROUS_KEYWORDS.has(keyword));

  if (!allowWrite) {
    if (!READ_ONLY_PREFIXES.has(prefix) || writeKeyword || dangerousKeyword) {
      throw databaseError('当前为只读模式，仅允许 SELECT、WITH 或 EXPLAIN 查询');
    }
    return { mode: 'read', inspected };
  }

  if (dangerousKeyword && confirmPhrase !== DANGEROUS_CONFIRMATION) {
    throw databaseError(`高风险 SQL 需要输入确认短语：${DANGEROUS_CONFIRMATION}`);
  }

  if (!WRITE_PREFIXES.has(prefix) && !READ_ONLY_PREFIXES.has(prefix) && !['PRAGMA', 'SET'].includes(prefix)) {
    if (!DANGEROUS_KEYWORDS.has(prefix)) throw databaseError('不支持的 SQL 类型');
  }

  return { mode: dangerousKeyword ? 'dangerous' : 'write', inspected };
}

export function inspectSql(sqlText) {
  const sql = String(sqlText || '').trim();
  const cleaned = [];
  const keywords = [];
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  let statements = 0;
  let lastWasSeparator = true;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (char === '\n' || char === '\r') {
        lineComment = false;
        cleaned.push(' ');
      }
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (char === quote) {
        if (next === quote) {
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (char === '-' && next === '-') {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      cleaned.push(' ');
      continue;
    }

    if (char === ';') {
      statements += 1;
      lastWasSeparator = true;
      cleaned.push(' ');
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let word = char;
      let cursor = index + 1;
      while (cursor < sql.length && /[A-Za-z0-9_$]/.test(sql[cursor])) {
        word += sql[cursor];
        cursor += 1;
      }
      const upperWord = word.toUpperCase();
      if (!lastWasSeparator || keywords.length === 0) keywords.push(upperWord);
      if (!lastWasSeparator) keywords.push(upperWord);
      cleaned.push(` ${upperWord} `);
      index = cursor - 1;
      lastWasSeparator = false;
      continue;
    }

    cleaned.push(char);
    if (!/\s/.test(char)) lastWasSeparator = false;
  }

  const compact = cleaned.join('').replace(/\s+/g, ' ').trim();
  const normalizedKeywords = [...new Set(keywords)];
  const trailingOnly = sql.endsWith(';')
    ? sql.slice(0, -1).trim()
    : sql;
  const multipleStatements = statements > 0
    && (statements > 1 || (trailingOnly.includes(';') && !/;\s*$/.test(sql)));

  return {
    cleaned: compact,
    keywords: normalizedKeywords,
    multipleStatements
  };
}

export function createSqliteAdapter({ filePath, dataDirectory, readOnly = true }) {
  const resolvedPath = resolveSqlitePath(filePath, dataDirectory);
  let db;
  try {
    db = new DatabaseSync(resolvedPath);
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    if (readOnly) db.pragma('query_only = ON');
  } catch (error) {
    throw databaseError(`SQLite 打开失败：${error.message}`);
  }

  return {
    kind: 'sqlite',
    label: `SQLite · ${resolvedPath}`,
    async test() {
      const row = db.prepare('SELECT sqlite_version() AS version, 1 AS ok').get();
      return {
        ok: Boolean(row?.ok),
        version: row?.version || '',
        detail: `SQLite ${row?.version || ''} 连接成功`
      };
    },
    async schema() {
      const tables = db.prepare(`
        SELECT name, type
        FROM sqlite_master
        WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
        ORDER BY type, name
      `).all();
      return tables.map((table) => {
        const columns = db.prepare(`PRAGMA table_info(${quoteSqlite(table.name)})`).all();
        let rowCount = null;
        try {
          rowCount = Number(db.prepare(`SELECT COUNT(*) AS count FROM ${quoteSqlite(table.name)}`).get().count);
        } catch {
          rowCount = null;
        }
        return {
          name: table.name,
          type: table.type,
          rowCount,
          columns: columns.map((column) => ({
            name: column.name,
            type: column.type || '',
            nullable: !column.notnull,
            primaryKey: Boolean(column.pk)
          }))
        };
      });
    },
    async query(sqlText, { limit = MAX_QUERY_ROWS } = {}) {
      const rows = db.prepare(sqlText).all().slice(0, limit);
      return normalizeRows(rows);
    },
    async execute(sqlText) {
      const result = db.prepare(sqlText).run();
      return {
        affectedRows: Number(result.changes || 0),
        lastInsertId: Number(result.lastInsertRowid || 0)
      };
    },
    async close() {
      db.close();
    },
    path: resolvedPath
  };
}

export async function createMysqlAdapter({ host, port, databaseName, username, password, readOnly = true }) {
  const connection = await mysql.createConnection({
    host: host || '127.0.0.1',
    port: Number(port || 3306),
    user: username || 'root',
    password: password || '',
    database: databaseName || undefined,
    connectTimeout: 8000,
    decimalNumbers: true,
    multipleStatements: false
  });

  return {
    kind: 'mysql',
    label: `MySQL · ${host || '127.0.0.1'}:${port || 3306}`,
    async test() {
      const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS database_name');
      return {
        ok: true,
        version: rows[0]?.version || '',
        databaseName: rows[0]?.database_name || '',
        detail: `MySQL ${rows[0]?.version || ''} 连接成功`
      };
    },
    async schema() {
      const [tables] = await connection.query(`
        SELECT TABLE_NAME AS name, TABLE_TYPE AS type
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_TYPE, TABLE_NAME
      `);
      const result = [];
      for (const table of tables) {
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME AS name, COLUMN_TYPE AS data_type, IS_NULLABLE AS nullable, COLUMN_KEY AS column_key
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `, [table.name]);
        let rowCount = null;
        try {
          const [countRows] = await connection.query(`SELECT COUNT(*) AS count FROM ${quoteMysql(table.name)}`);
          rowCount = Number(countRows[0]?.count || 0);
        } catch {
          rowCount = null;
        }
        result.push({
          name: table.name,
          type: String(table.type).includes('VIEW') ? 'view' : 'table',
          rowCount,
          columns: columns.map((column) => ({
            name: column.name,
            type: column.data_type || '',
            nullable: column.nullable === 'YES',
            primaryKey: column.column_key === 'PRI'
          }))
        });
      }
      return result;
    },
    async query(sqlText, { limit = MAX_QUERY_ROWS } = {}) {
      const [rows] = await connection.query({ sql: sqlText, rowsAsArray: false });
      if (!Array.isArray(rows)) return [];
      return normalizeRows(rows.slice(0, limit));
    },
    async execute(sqlText) {
      const [result] = await connection.query(sqlText);
      return {
        affectedRows: Number(result?.affectedRows || 0),
        lastInsertId: Number(result?.insertId || 0)
      };
    },
    async close() {
      await connection.end();
    },
    readOnly
  };
}

export async function createSqlServerAdapter({ host, port, databaseName, username, password, readOnly = true }) {
  const pool = new mssql.ConnectionPool({
    server: host || '127.0.0.1',
    port: Number(port || 1433),
    user: username || 'sa',
    password: password || '',
    database: databaseName || undefined,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    },
    connectionTimeout: 10000,
    requestTimeout: 15000
  });
  await pool.connect();

  return {
    kind: 'sqlserver',
    label: `SQL Server · ${host || '127.0.0.1'}:${port || 1433}`,
    async test() {
      const result = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS database_name');
      const row = result.recordset?.[0] || {};
      return {
        ok: true,
        version: String(row.version || '').split(/\r?\n/)[0],
        databaseName: row.database_name || '',
        detail: `${String(row.version || 'SQL Server').split(/\r?\n/)[0]} 连接成功`
      };
    },
    async schema() {
      const result = await pool.request().query(`
        SELECT s.name AS schema_name, t.name AS name, 'table' AS type,
          (SELECT SUM(p.rows) FROM sys.partitions p WHERE p.object_id = t.object_id AND p.index_id IN (0,1)) AS row_count
        FROM sys.tables t
        JOIN sys.schemas s ON s.schema_id = t.schema_id
        UNION ALL
        SELECT s.name AS schema_name, v.name AS name, 'view' AS type, NULL AS row_count
        FROM sys.views v
        JOIN sys.schemas s ON s.schema_id = v.schema_id
        ORDER BY type, schema_name, name
      `);
      const tables = [];
      for (const table of result.recordset || []) {
        const columnResult = await pool.request()
          .input('schemaName', mssql.NVarChar(128), table.schema_name)
          .input('tableName', mssql.NVarChar(128), table.name)
          .query(`
            SELECT c.name, ty.name AS data_type, c.is_nullable,
              CASE WHEN pk.column_id IS NULL THEN 0 ELSE 1 END AS is_primary_key
            FROM sys.columns c
            JOIN sys.types ty ON ty.user_type_id = c.user_type_id
            LEFT JOIN (
              SELECT ic.object_id, ic.column_id
              FROM sys.index_columns ic
              JOIN sys.indexes i ON i.object_id = ic.object_id AND i.index_id = ic.index_id
              WHERE i.is_primary_key = 1
            ) pk ON pk.object_id = c.object_id AND pk.column_id = c.column_id
            WHERE c.object_id = OBJECT_ID(@schemaName + '.' + @tableName)
            ORDER BY c.column_id
          `);
        tables.push({
          name: `${table.schema_name}.${table.name}`,
          type: table.type,
          rowCount: table.row_count === null ? null : Number(table.row_count),
          columns: (columnResult.recordset || []).map((column) => ({
            name: column.name,
            type: column.data_type || '',
            nullable: Boolean(column.is_nullable),
            primaryKey: Boolean(column.is_primary_key)
          }))
        });
      }
      return tables;
    },
    async query(sqlText, { limit = MAX_QUERY_ROWS } = {}) {
      const result = await pool.request().query(sqlText);
      const rows = Array.isArray(result.recordset) ? result.recordset : [];
      return normalizeRows(rows.slice(0, limit));
    },
    async execute(sqlText) {
      const result = await pool.request().query(sqlText);
      return {
        affectedRows: Number(result.rowsAffected?.[0] || 0),
        lastInsertId: 0
      };
    },
    async close() {
      await pool.close();
    },
    readOnly
  };
}

export async function openDatabaseAdapter(profile, options = {}) {
  const kind = String(profile.kind || '').toLowerCase();
  if (kind === 'sqlite') {
    return createSqliteAdapter({
      filePath: profile.filePath,
      dataDirectory: options.dataDirectory,
      readOnly: options.readOnly !== false
    });
  }
  if (kind === 'mysql') {
    return createMysqlAdapter({ ...profile, readOnly: options.readOnly !== false });
  }
  if (kind === 'sqlserver' || kind === 'mssql') {
    return createSqlServerAdapter({ ...profile, readOnly: options.readOnly !== false });
  }
  throw databaseError('暂不支持该数据库类型');
}

export async function withDatabaseAdapter(profile, options, callback) {
  const adapter = await openDatabaseAdapter(profile, options);
  try {
    return await callback(adapter);
  } finally {
    await adapter.close().catch(() => {});
  }
}

export async function executeDatabaseQuery(profile, options, input) {
  const safety = assertSqlSafety(input.sqlText, input);
  return withDatabaseAdapter(profile, { ...options, readOnly: safety.mode === 'read' }, async (adapter) => {
    const rows = safety.mode === 'read'
      ? await adapter.query(input.sqlText, { limit: input.limit || MAX_QUERY_ROWS })
      : [await adapter.execute(input.sqlText)];
    return {
      mode: safety.mode,
      rows,
      rowCount: rows.length,
      limited: rows.length >= Number(input.limit || MAX_QUERY_ROWS)
    };
  });
}

export function resolveSqlitePath(filePath, dataDirectory = process.cwd()) {
  const text = String(filePath || '').trim();
  if (!text) throw databaseError('SQLite 文件路径不能为空');
  return isAbsolute(text) ? resolve(text) : resolve(dataDirectory, text);
}

export function csvFromRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return '\uFEFF';
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row || {})))];
  const lines = [columns.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(row?.[column])).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}`;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function quoteSqlite(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function quoteMysql(identifier) {
  return `\`${String(identifier).replaceAll('`', '``')}\``;
}

function normalizeRows(rows) {
  return rows.map((row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])
  ));
}

function normalizeValue(value) {
  if (typeof value === 'bigint') {
    return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('base64');
  return value;
}

function databaseError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

export { DANGEROUS_CONFIRMATION, MAX_QUERY_ROWS };
