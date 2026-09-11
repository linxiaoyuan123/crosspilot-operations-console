import {
  getCheckRun,
  getProject,
  getSupportCase,
  listHandoverItems
} from './store.js';
import { csvFromRows } from './database.js';

const FORMATS = new Set(['html', 'md', 'csv']);

export function generateReport(db, type, id, format = 'html') {
  if (!FORMATS.has(format)) throw reportError('报告格式仅支持 html、md 或 csv');
  const data = loadReportData(db, type, Number(id));
  const generatedAt = new Date().toISOString();
  const title = reportTitle(type, data);
  const content = renderReport(type, data, format, { generatedAt, title });
  return {
    title,
    content,
    filename: `${safeFilename(title)}-${generatedAt.slice(0, 10)}.${format}`,
    contentType: {
      html: 'text/html; charset=utf-8',
      md: 'text/markdown; charset=utf-8',
      csv: 'text/csv; charset=utf-8'
    }[format]
  };
}

function loadReportData(db, type, id) {
  if (!Number.isInteger(id) || id <= 0) throw reportError('报告对象不存在');
  if (type === 'project' || type === 'handover') {
    const project = getProject(db, id);
    if (!project) throw reportError('实施项目不存在');
    if (type === 'handover') return { ...project, handover: listHandoverItems(db, id) };
    return project;
  }
  if (type === 'check') {
    const check = getCheckRun(db, id);
    if (!check) throw reportError('检查记录不存在');
    return check;
  }
  if (type === 'case') {
    const supportCase = getSupportCase(db, id);
    if (!supportCase) throw reportError('问题单不存在');
    return supportCase;
  }
  throw reportError('不支持的报告类型');
}

function renderReport(type, data, format, meta) {
  const safeData = scrubSensitive(data);
  if (format === 'csv') return renderCsvReport(type, safeData);
  if (format === 'md') return renderMarkdownReport(type, safeData, meta);
  return renderHtmlReport(type, safeData, meta);
}

function renderHtmlReport(type, data, { title, generatedAt }) {
  const body = htmlBody(type, data);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#667085; --line:#d9e0ea; --brand:#0f766e; --soft:#f4f7fa; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: #fff; font: 14px/1.65 "Microsoft YaHei", "PingFang SC", sans-serif; }
    main { max-width: 1000px; margin: 0 auto; padding: 40px 34px 64px; }
    header { padding-bottom: 20px; border-bottom: 3px solid var(--brand); }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin: 30px 0 14px; font-size: 18px; }
    p { margin: 6px 0; }
    .meta { color: var(--muted); }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 17px; }
    .summary-item { padding: 12px 14px; background: var(--soft); border: 1px solid var(--line); border-radius: 8px; }
    .summary-item span { display:block; color: var(--muted); font-size: 12px; }
    .summary-item strong { display:block; margin-top: 4px; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px 11px; border: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { background: var(--soft); font-size: 12px; }
    .status { display: inline-block; padding: 2px 8px; border-radius: 99px; background: #e8f7f3; color: #087c6f; font-size: 12px; font-weight: 700; }
    .status.warning { background: #fff4dc; color: #a35d00; }
    .status.failed { background: #ffe9e7; color: #b42318; }
    pre { white-space: pre-wrap; padding: 14px; background: var(--soft); border: 1px solid var(--line); border-radius: 8px; }
    footer { margin-top: 34px; padding-top: 16px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
    @media print { main { max-width: none; padding: 0; } .summary-grid { break-inside: avoid; } tr { break-inside: avoid; } }
  </style>
</head>
<body>
<main>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">DeployMate 实施交付工作台 · 生成时间 ${escapeHtml(formatDateTime(generatedAt))}</p>
  </header>
  ${body}
  <footer>本报告由 DeployMate 生成。数据库密码、连接密钥等敏感信息不会写入报告，请在交付前完成客户名称、联系方式和业务数据脱敏检查。</footer>
</main>
</body>
</html>`;
}

function renderMarkdownReport(type, data, { title, generatedAt }) {
  const lines = [`# ${title}`, '', `> DeployMate 生成时间：${formatDateTime(generatedAt)}`, ''];
  if (type === 'project' || type === 'handover') {
    lines.push(
      '## 项目概况',
      '',
      `- 项目编号：${text(data.code)}`,
      `- 客户：${text(data.customer)}`,
      `- 产品：${text(data.product_name)}`,
      `- 环境：${text(data.environment)}`,
      `- 负责人：${text(data.owner)}`,
      `- 上线日期：${text(data.go_live_date)}`,
      `- 备注：${text(data.notes)}`,
      '',
      '## 实施任务',
      '',
      '| 阶段 | 任务 | 状态 | 负责人 | 计划日期 | 证据 |',
      '| --- | --- | --- | --- | --- | --- |'
    );
    for (const task of data.tasks || []) {
      lines.push(`| ${md(task.stage)} | ${md(task.title)} | ${md(statusLabel(task.status))} | ${md(task.owner)} | ${md(task.due_date)} | ${md(task.evidence)} |`);
    }
    lines.push('', '## 培训与验收', '', '| 类别 | 事项 | 状态 | 负责人 | 证据 |', '| --- | --- | --- | --- | --- |');
    for (const item of data.handover || []) {
      lines.push(`| ${md(item.category)} | ${md(item.title)} | ${md(statusLabel(item.status))} | ${md(item.owner)} | ${md(item.evidence)} |`);
    }
  } else if (type === 'check') {
    lines.push(`## ${text(data.check_type)} 检查`, '', `- 目标：${text(data.target)}`, `- 结论：${statusLabel(data.status)}`, `- 摘要：${text(data.summary)}`, '', '| 检查项 | 期望值 | 实际值 | 结论 | 说明 |', '| --- | --- | --- | --- | --- |');
    for (const item of data.details || data.results || []) {
      lines.push(`| ${md(item.label)} | ${md(item.expected_value ?? item.expected)} | ${md(item.actual_value ?? item.actual)} | ${md(statusLabel(item.status))} | ${md(item.detail)} |`);
    }
  } else if (type === 'case') {
    lines.push(
      `## ${text(data.case_no)} · ${text(data.title)}`,
      '',
      `- 客户：${text(data.customer)}`,
      `- 优先级：${text(priorityLabel(data.priority))}`,
      `- 状态：${text(statusLabel(data.status))}`,
      `- 问题现象：${text(data.symptom)}`,
      `- 影响范围：${text(data.impact)}`,
      `- 根因：${text(data.root_cause)}`,
      `- 解决方案：${text(data.resolution)}`,
      `- 下一步：${text(data.next_action)}`,
      '',
      '## 处理时间线',
      '',
      '| 时间 | 类型 | 记录 |',
      '| --- | --- | --- |'
    );
    for (const event of data.events || []) {
      lines.push(`| ${md(formatDateTime(event.created_at))} | ${md(event.title)} | ${md(event.detail)} |`);
    }
  }
  return `${lines.join('\n')}\n`;
}

function renderCsvReport(type, data) {
  if (type === 'project' || type === 'handover') {
    return csvFromRows((data.handover?.length ? data.handover : data.tasks || []).map((item) => ({
      项目编号: data.code,
      客户: data.customer,
      类别: item.category || item.stage || '',
      事项: item.title,
      状态: statusLabel(item.status),
      负责人: item.owner || '',
      计划日期: item.due_date || '',
      证据: item.evidence || ''
    })));
  }
  if (type === 'check') {
    return csvFromRows((data.details || data.results || []).map((item) => ({
      检查类型: data.check_type,
      目标: data.target,
      检查项: item.label,
      期望值: item.expected_value ?? item.expected,
      实际值: item.actual_value ?? item.actual,
      结论: statusLabel(item.status),
      说明: item.detail
    })));
  }
  if (type === 'case') {
    return csvFromRows((data.events || []).map((event) => ({
      问题编号: data.case_no,
      问题标题: data.title,
      时间: event.created_at,
      记录类型: event.title,
      处理记录: event.detail,
      状态: statusLabel(data.status)
    })));
  }
  return csvFromRows([]);
}

function htmlBody(type, data) {
  if (type === 'project' || type === 'handover') {
    return `<section>
      <h2>项目概况</h2>
      <div class="summary-grid">
        ${summaryItem('项目编号', data.code)}
        ${summaryItem('客户', data.customer)}
        ${summaryItem('产品', data.product_name)}
        ${summaryItem('环境', data.environment)}
        ${summaryItem('负责人', data.owner)}
        ${summaryItem('计划上线', data.go_live_date)}
      </div>
      <p><strong>实施说明：</strong>${escapeHtml(data.notes || '-')}</p>
    </section>
    <section><h2>实施任务</h2>${htmlTable(
      ['阶段', '任务', '状态', '负责人', '计划日期', '证据'],
      (data.tasks || []).map((item) => [item.stage, item.title, statusBadge(item.status), item.owner, item.due_date, item.evidence])
    )}</section>
    <section><h2>培训与验收</h2>${htmlTable(
      ['类别', '事项', '状态', '负责人', '计划日期', '证据'],
      (data.handover || []).map((item) => [categoryLabel(item.category), item.title, statusBadge(item.status), item.owner, item.due_date, item.evidence])
    )}</section>`;
  }
  if (type === 'check') {
    return `<section>
      <h2>${escapeHtml(checkLabel(data.check_type))}检查结果</h2>
      <div class="summary-grid">
        ${summaryItem('检查目标', data.target)}
        ${summaryItem('总体结论', statusBadge(data.status))}
        ${summaryItem('检查时间', formatDateTime(data.created_at))}
      </div>
      <p>${escapeHtml(data.summary || '')}</p>
      ${htmlTable(
        ['检查项', '期望值', '实际值', '结论', '说明'],
        (data.details || data.results || []).map((item) => [
          item.label,
          item.expected_value ?? item.expected,
          item.actual_value ?? item.actual,
          statusBadge(item.status),
          item.detail
        ])
      )}
    </section>`;
  }
  if (type === 'case') {
    return `<section>
      <h2>${escapeHtml(data.case_no)} · ${escapeHtml(data.title)}</h2>
      <div class="summary-grid">
        ${summaryItem('客户', data.customer)}
        ${summaryItem('优先级', priorityLabel(data.priority))}
        ${summaryItem('当前状态', statusBadge(data.status))}
      </div>
      <h2>问题与处理记录</h2>
      <p><strong>问题现象：</strong>${escapeHtml(data.symptom || '-')}</p>
      <p><strong>影响范围：</strong>${escapeHtml(data.impact || '-')}</p>
      <p><strong>根本原因：</strong>${escapeHtml(data.root_cause || '-')}</p>
      <p><strong>解决方案：</strong>${escapeHtml(data.resolution || '-')}</p>
      <p><strong>后续跟进：</strong>${escapeHtml(data.next_action || '-')}</p>
      ${htmlTable(
        ['时间', '记录类型', '处理记录'],
        (data.events || []).map((event) => [formatDateTime(event.created_at), event.title, event.detail])
      )}
    </section>`;
  }
  return '';
}

function htmlTable(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${isSafeHtml(String(cell || '')) ? String(cell || '') : escapeHtml(cell ?? '-')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function summaryItem(label, value) {
  return `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
}

function statusBadge(status) {
  const classes = status === 'warning' ? 'status warning' : status === 'failed' ? 'status failed' : 'status';
  return `<span class="${classes}">${escapeHtml(statusLabel(status))}</span>`;
}

function isSafeHtml(value) {
  return /^<span class="status(?: warning| failed)?">.+<\/span>$/.test(value);
}

function reportTitle(type, data) {
  if (type === 'project') return `${data.project_name}实施交付报告`;
  if (type === 'handover') return `${data.project_name}培训验收报告`;
  if (type === 'check') return `${checkLabel(data.check_type)}检查报告`;
  if (type === 'case') return `${data.case_no}问题处理报告`;
  return '实施报告';
}

function checkLabel(type) {
  return {
    system: '环境预检',
    network: '网络连通性',
    database: '数据库连接',
    backup: '备份恢复方案',
    app: '应用健康'
  }[type] || type;
}

function statusLabel(status) {
  return {
    requirement: '需求确认',
    pending: '待处理',
    in_progress: '处理中',
    blocked: '已阻塞',
    done: '已完成',
    open: '待处理',
    waiting: '待客户',
    resolved: '已解决',
    closed: '已关闭',
    healthy: '通过',
    warning: '警告',
    failed: '失败',
    active: '进行中',
    completed: '已完成'
  }[status] || status || '-';
}

function priorityLabel(priority) {
  return {
    critical: 'P0 紧急',
    high: 'P1 高',
    medium: 'P2 中',
    low: 'P3 低'
  }[priority] || priority || '-';
}

function categoryLabel(category) {
  return {
    account: '账号角色',
    training: '用户培训',
    acceptance: '项目验收',
    document: '交付文档'
  }[category] || category || '-';
}

function scrubSensitive(input, depth = 0) {
  if (depth > 8 || input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map((item) => scrubSensitive(item, depth + 1));
  if (typeof input !== 'object') return input;
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    if (/password|secret|token|connectionstring|apikey/i.test(key)) continue;
    result[key] = scrubSensitive(value, depth + 1);
  }
  return result;
}

function safeFilename(value) {
  return String(value || 'report').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').slice(0, 90);
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN', { hour12: false });
}

function md(value) {
  return String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function text(value) {
  return String(value ?? '').trim() || '-';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reportError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  error.publicMessage = message;
  return error;
}
