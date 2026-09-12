const LISTING_WEIGHTS = {
  titleScore: 20,
  bulletScore: 20,
  imageScore: 20,
  attributeScore: 15,
  keywordScore: 15,
  complianceScore: 10
};

export function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const factor = 10 ** digits;
  return Math.round((number + Number.EPSILON) * factor) / factor;
}

export function percent(numerator, denominator, digits = 2) {
  const bottom = Number(denominator);
  if (!Number.isFinite(bottom) || bottom === 0) return 0;
  return round((Number(numerator) / bottom) * 100, digits);
}

export function listingScore(product) {
  let weighted = 0;
  for (const [key, weight] of Object.entries(LISTING_WEIGHTS)) {
    const snakeKey = key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);
    weighted += clamp(Number(product[key] ?? product[snakeKey]) || 0, 0, 100) * (weight / 100);
  }
  return round(weighted, 0);
}

export function deriveProduct(product, store = {}) {
  const price = Number(product.price) || 0;
  const units = Number(product.units_30d) || 0;
  const sales = Number(product.sales_30d) || 0;
  const refundAmount = Number(product.refund_amount_30d) || 0;
  const referralRate = Number(product.referral_fee_rate ?? store.fee_rate ?? 15);
  const unitCost = Number(product.unit_cost) || 0;
  const fulfillmentFee = Number(product.fulfillment_fee ?? store.fulfillment_fee ?? 0) || 0;
  const adSpend = Number(product.ad_spend_30d) || 0;
  const adSales = Number(product.ad_sales_30d) || 0;
  const sessions = Number(product.sessions_30d) || 0;
  const pageViews = Number(product.page_views_30d) || 0;
  const returns = Number(product.returns_30d) || 0;
  const netSales = Math.max(0, sales - refundAmount);
  const cogs = units * unitCost;
  const referralFee = netSales * (referralRate / 100);
  const fulfillment = units * fulfillmentFee;
  const grossProfit = netSales - cogs - referralFee - fulfillment;
  const netProfit = grossProfit - adSpend;
  const margin = percent(netProfit, netSales);
  const acos = percent(adSpend, adSales);
  const tacos = percent(adSpend, sales);
  const breakEvenPrice = unitCost + fulfillmentFee + (unitCost + fulfillmentFee) * (referralRate / 100);
  const targetMargin = Number(store.target_margin || 20) / 100;
  const suggestedPrice = targetMargin >= 1
    ? breakEvenPrice
    : (unitCost + fulfillmentFee) / (1 - referralRate / 100 - targetMargin);

  return {
    ...product,
    net_sales_30d: round(netSales),
    cogs_30d: round(cogs),
    referral_fee_30d: round(referralFee),
    fulfillment_fee_30d: round(fulfillment),
    gross_profit_30d: round(grossProfit),
    net_profit_30d: round(netProfit),
    margin_percent: margin,
    acos_percent: acos,
    tacos_percent: tacos,
    roas: adSpend ? round(adSales / adSpend, 2) : 0,
    cvr_percent: percent(units, sessions),
    page_cvr_percent: percent(units, pageViews),
    return_rate_percent: percent(returns, units),
    titleScore: Number(product.title_score) || 0,
    bulletScore: Number(product.bullet_score) || 0,
    imageScore: Number(product.image_score) || 0,
    attributeScore: Number(product.attribute_score) || 0,
    keywordScore: Number(product.keyword_score) || 0,
    complianceScore: Number(product.compliance_score) || 0,
    listing_score: listingScore(product),
    break_even_price: round(breakEvenPrice),
    suggested_price: round(suggestedPrice),
    profit_per_unit: units ? round(netProfit / units) : 0,
    price: round(price),
    unit_cost: round(unitCost),
    fulfillment_fee: round(fulfillmentFee)
  };
}

export function deriveAdTerm(term, store = {}) {
  const clicks = Number(term.clicks) || 0;
  const spend = Number(term.spend) || 0;
  const adSales = Number(term.ad_sales) || 0;
  const adOrders = Number(term.ad_orders) || 0;
  const targetAcos = Number(store.target_acos || 28);
  const acos = percent(spend, adSales);
  let recommendation = 'keep';
  let actionLabel = '保持观察';
  let severity = 'healthy';

  if (clicks >= 15 && adOrders === 0) {
    recommendation = 'negative_exact';
    actionLabel = '精确否词候选';
    severity = 'failed';
  } else if (spend >= 50 && acos > targetAcos * 1.5) {
    recommendation = adOrders > 0 ? 'reduce' : 'pause';
    actionLabel = adOrders > 0 ? '降价或降低预算' : '暂停投放';
    severity = 'warning';
  } else if (adOrders > 0 && acos <= targetAcos) {
    recommendation = 'scale';
    actionLabel = '增加预算候选';
    severity = 'healthy';
  }

  return {
    ...term,
    acos_percent: acos,
    cvr_percent: percent(adOrders, clicks),
    cpc: clicks ? round(spend / clicks) : 0,
    target_acos_percent: targetAcos,
    recommendation,
    action_label: actionLabel,
    severity
  };
}

export function deriveInventory(item, store = {}) {
  const available = Number(item.available) || 0;
  const inbound = Number(item.inbound) || 0;
  const avgDailySales = Number(item.avg_daily_sales) || 0;
  const leadTime = Number(store.lead_time_days || 18);
  const safetyDays = Number(store.safety_days || 14);
  const coverageDays = avgDailySales > 0 ? round((available + inbound) / avgDailySales, 1) : 999;
  const availableDays = avgDailySales > 0 ? round(available / avgDailySales, 1) : 999;
  const targetUnits = Math.ceil((leadTime + safetyDays) * avgDailySales);
  const reorderUnits = Math.max(0, targetUnits - available - inbound);
  let risk = 'healthy';
  let riskLabel = '健康';

  if (coverageDays < leadTime + safetyDays) {
    risk = 'stockout';
    riskLabel = '缺货风险';
  } else if (coverageDays > 90) {
    risk = 'overstock';
    riskLabel = '滞销风险';
  }

  return {
    ...item,
    sku: item.sku || item.product_sku,
    product_name: item.product_name || item.product_title,
    coverage_days: coverageDays,
    available_days: availableDays,
    reorder_units: reorderUnits,
    recommended_order_date: risk === 'stockout' ? '本周内' : risk === 'overstock' ? '暂停补货' : '按计划',
    risk,
    risk_label: riskLabel
  };
}

export function deriveAfterSale(item) {
  const now = Date.now();
  const dueAt = item.due_date ? new Date(`${item.due_date}T23:59:59`).getTime() : 0;
  let sla = 'normal';
  let slaLabel = '在时效内';
  if (!['resolved', 'closed'].includes(item.status) && dueAt && dueAt < now) {
    sla = 'overdue';
    slaLabel = '已超时';
  } else if (!['resolved', 'closed'].includes(item.status) && dueAt && dueAt - now < 86400000) {
    sla = 'due_today';
    slaLabel = '今日到期';
  }
  return { ...item, sla, sla_label: slaLabel };
}

export function deriveStoreHealth(store) {
  const metrics = [
    { key: 'rating', label: '店铺评分', value: Number(store.health_rating) || 0, threshold: 4, comparator: 'below' },
    { key: 'odr', label: '订单缺陷率', value: Number(store.order_defect_rate) || 0, threshold: 1, comparator: 'above' },
    { key: 'late', label: '迟发率', value: Number(store.late_shipment_rate) || 0, threshold: 4, comparator: 'above' },
    { key: 'cancel', label: '取消率', value: Number(store.cancellation_rate) || 0, threshold: 2.5, comparator: 'above' }
  ].map((item) => {
    const warning = item.comparator === 'below' ? item.value < item.threshold : item.value > item.threshold;
    return { ...item, status: warning ? 'warning' : 'healthy' };
  });
  return {
    ...store,
    health_metrics: metrics,
    health_status: metrics.some((item) => item.status === 'warning') ? 'warning' : 'healthy'
  };
}

export function actionsForStore(db, storeId) {
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(storeId);
  if (!store) return [];
  const products = db.prepare('SELECT * FROM products WHERE store_id = ?').all(storeId).map((item) => deriveProduct(item, store));
  const ads = db.prepare('SELECT * FROM ad_search_terms WHERE store_id = ?').all(storeId).map((item) => deriveAdTerm(item, store));
  const inventory = db.prepare(`
    SELECT i.*, p.sku AS product_sku, p.title AS product_title
    FROM inventory_snapshots i
    JOIN products p ON p.id = i.product_id
    WHERE i.store_id = ?
  `).all(storeId).map((item) => deriveInventory(item, store));
  const afterSales = db.prepare(`
    SELECT a.*, p.sku, p.title AS product_title
    FROM after_sales a
    LEFT JOIN products p ON p.id = a.product_id
    WHERE a.store_id = ?
  `).all(storeId).map(deriveAfterSale);
  const actions = [];

  for (const product of products) {
    if (product.net_profit_30d < 0) {
      actions.push({
        source_type: 'product',
        source_id: product.id,
        product_id: product.id,
        category: '利润',
        title: `止损：${product.sku} 近 30 天净亏损 €${Math.abs(product.net_profit_30d).toFixed(2)}`,
        description: `净利率 ${product.margin_percent}%，广告 ACOS ${product.acos_percent}%。建议核算售价、采购成本和广告词，必要时降低无效投放。`,
        priority: product.margin_percent < -10 ? 'critical' : 'high',
        recommendation: 'review_profit'
      });
    }
    if (product.listing_score < 75) {
      actions.push({
        source_type: 'listing',
        source_id: product.id,
        product_id: product.id,
        category: 'Listing',
        title: `补齐 ${product.sku} 的 Listing 信息`,
        description: `当前得分 ${product.listing_score}/100，重点检查标题、五点、图片和属性。`,
        priority: product.listing_score < 65 ? 'high' : 'medium',
        recommendation: 'improve_listing'
      });
    }
    if (product.return_rate_percent > 8) {
      actions.push({
        source_type: 'returns',
        source_id: product.id,
        product_id: product.id,
        category: '售后',
        title: `复盘 ${product.sku} 高退货原因`,
        description: `退货率 ${product.return_rate_percent}%，超过默认 8% 预警线。`,
        priority: product.return_rate_percent > 15 ? 'high' : 'medium',
        recommendation: 'reduce_returns'
      });
    }
  }

  for (const term of ads) {
    if (term.recommendation === 'keep') continue;
    actions.push({
      source_type: 'ad_term',
      source_id: term.id,
      product_id: term.product_id,
      category: '广告',
      title: `${term.action_label}：${term.search_term}`,
      description: `${term.campaign} · ${term.clicks} 次点击 · €${term.spend.toFixed(2)} 花费 · ACOS ${term.acos_percent}%。`,
      priority: term.recommendation === 'negative_exact' || term.recommendation === 'pause' ? 'high' : 'medium',
      recommendation: term.recommendation
    });
  }

  for (const item of inventory) {
    if (item.risk === 'healthy') continue;
    actions.push({
      source_type: 'inventory',
      source_id: item.id,
      product_id: item.product_id,
      category: '库存',
      title: `${item.risk_label}：${item.sku}`,
      description: item.risk === 'stockout'
        ? `可售 ${item.available} 件，覆盖 ${item.coverage_days} 天；建议补货 ${item.reorder_units} 件。`
        : `覆盖 ${item.coverage_days} 天，建议暂停补货并清理在途库存。`,
      priority: item.risk === 'stockout' && item.available_days < Number(store.lead_time_days) ? 'critical' : 'high',
      recommendation: item.risk
    });
  }

  for (const item of afterSales) {
    if (!['overdue', 'due_today'].includes(item.sla)) continue;
    actions.push({
      source_type: 'after_sale',
      source_id: item.id,
      product_id: item.product_id,
      category: '售后',
      title: `${item.sla_label}：${item.subject}`,
      description: `${item.reason || item.type} · ${item.detail}`,
      priority: item.sla === 'overdue' ? 'critical' : 'high',
      recommendation: 'handle_case'
    });
  }

  return actions;
}

export function buildOverview(store, products, ads, inventory, afterSales, actions, dailyMetrics) {
  const sales = products.reduce((sum, item) => sum + Number(item.sales_30d || 0), 0);
  const netSales = products.reduce((sum, item) => sum + Number(item.net_sales_30d || 0), 0);
  const profit = products.reduce((sum, item) => sum + Number(item.net_profit_30d || 0), 0);
  const adSpend = products.reduce((sum, item) => sum + Number(item.ad_spend_30d || 0), 0);
  const adSales = products.reduce((sum, item) => sum + Number(item.ad_sales_30d || 0), 0);
  const units = products.reduce((sum, item) => sum + Number(item.units_30d || 0), 0);
  const returns = products.reduce((sum, item) => sum + Number(item.returns_30d || 0), 0);
  const weightedRating = products.reduce((sum, item) => sum + (Number(item.rating) || 0) * (Number(item.review_count) || 1), 0);
  const reviews = products.reduce((sum, item) => sum + Number(item.review_count || 0), 0);
  const inventoryRiskCount = inventory.filter((item) => item.risk !== 'healthy').length;
  const openActions = actions.filter((item) => !['done', 'deferred'].includes(item.status)).length;
  const pendingAfterSales = afterSales.filter((item) => !['resolved', 'closed'].includes(item.status)).length;
  const lowMarginProducts = products.filter((item) => item.margin_percent < 10).length;

  return {
    store,
    kpis: {
      sales: round(sales),
      netSales: round(netSales),
      profit: round(profit),
      margin: percent(profit, netSales),
      adSpend: round(adSpend),
      adSales: round(adSales),
      tacos: percent(adSpend, sales),
      acos: percent(adSpend, adSales),
      roas: adSpend ? round(adSales / adSpend, 2) : 0,
      units,
      unitsPerDay: round(units / 30, 1),
      returnRate: percent(returns, units),
      rating: reviews ? round(weightedRating / reviews, 2) : 0,
      reviewCount: reviews,
      inventoryRiskCount,
      openActions,
      pendingAfterSales,
      lowMarginProducts
    },
    trend: dailyMetrics.map((item) => ({
      ...item,
      profit: round(Number(item.sales || 0) - Number(item.ad_spend || 0) - Number(item.cogs_est || 0))
    })),
    topProducts: products.slice().sort((a, b) => b.sales_30d - a.sales_30d).slice(0, 5),
    riskProducts: products.slice().sort((a, b) => a.net_profit_30d - b.net_profit_30d).slice(0, 5),
    lowMarginProducts: products.filter((item) => item.margin_percent < 15).sort((a, b) => a.margin_percent - b.margin_percent).slice(0, 5)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export { LISTING_WEIGHTS };
