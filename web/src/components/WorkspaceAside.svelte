<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowRight, Boxes, FileText, Gauge, Target } from 'lucide-svelte';
  import { api, formatNumber } from '../lib/api';
  import type { Overview, Store } from '../lib/types';

  export let side: 'left' | 'right';

  let stores: Store[] = [];
  let selectedId = 0;
  let overview: Overview | null = null;
  let loading = true;

  function selectedStore() {
    return stores.find((store) => store.id === selectedId) || null;
  }

  async function loadOverview() {
    if (!selectedId) {
      overview = null;
      return;
    }
    overview = await api<Overview>(`/api/overview?storeId=${selectedId}`);
  }

  async function loadStores() {
    loading = true;
    try {
      const data = await api<{ items: Store[] }>('/api/stores');
      stores = data.items || [];
      const savedId = Number(localStorage.getItem('crosspilot-store'));
      selectedId = stores.some((store) => store.id === savedId) ? savedId : stores[0]?.id || 0;
      await loadOverview();
    } finally {
      loading = false;
    }
  }

  function handleStoreChange(event: Event) {
    const store = (event as CustomEvent<Store>).detail;
    if (!store || store.id === selectedId) return;
    selectedId = store.id;
    loadOverview().catch(() => (overview = null));
  }

  onMount(() => {
    window.addEventListener('crosspilot:store-change', handleStoreChange);
    loadStores();
    return () => window.removeEventListener('crosspilot:store-change', handleStoreChange);
  });

  $: store = selectedStore();
  $: healthWarnings = (store?.health_metrics || []).filter((item) => item.status === 'warning').length;
  $: nextAction = overview?.actionsPreview?.[0] || null;
</script>

{#if side === 'left'}
  <aside class="shell-aside shell-aside-left" aria-label="店铺基础信息">
    <section class="aside-section aside-project">
      <div class="aside-section-head"><span>当前店铺</span><small>{store?.code || 'CROSSPILOT'}</small></div>
      <h2>{store?.name || '正在读取店铺'}</h2>
      <p>{store ? `${store.platform} · ${store.market} · ${store.currency}` : '正在同步店铺资料'}</p>
      <dl class="aside-facts">
        <div><dt>目标 ACOS</dt><dd>{store?.target_acos ?? '—'}%</dd></div>
        <div><dt>目标净利率</dt><dd>{store?.target_margin ?? '—'}%</dd></div>
        <div><dt>采购交期</dt><dd>{store?.lead_time_days ?? '—'} 天</dd></div>
      </dl>
    </section>

    <section class="aside-section">
      <div class="aside-section-head"><span>账号健康</span><strong>{healthWarnings ? `${healthWarnings} 项预警` : store ? '正常' : '同步中'}</strong></div>
      <div class="aside-progress"><i style={`width:${healthWarnings ? 42 : store ? 100 : 18}%`}></i></div>
      <div class="aside-progress-meta"><span>评分 {store?.health_rating ?? '—'}</span><span>ODR {store?.order_defect_rate ?? '—'}%</span></div>
    </section>
  </aside>
{:else}
  <aside class="shell-aside shell-aside-right" aria-label="运营状态与快捷入口">
    <section class="aside-section">
      <div class="aside-section-head"><span>运营状态</span><small>{loading ? '同步中' : '实时'}</small></div>
      <div class="aside-status-list">
        <div><span><i class="aside-status-dot"></i>规则引擎</span><strong>{loading ? '—' : '正常'}</strong></div>
        <div><span>待执行动作</span><strong>{loading ? '—' : formatNumber(overview?.actionsPreview?.length || 0)}</strong></div>
        <div><span>库存风险</span><strong>{loading ? '—' : formatNumber(overview?.kpis.inventoryRiskCount || 0)}</strong></div>
        <div><span>待处理售后</span><strong>{loading ? '—' : formatNumber(overview?.kpis.pendingAfterSales || 0)}</strong></div>
      </div>
    </section>

    <section class="aside-section">
      <div class="aside-section-head"><span>快捷入口</span></div>
      <div class="aside-links">
        <a href="/imports"><FileText size={15} /><span>导入报表</span></a>
        <a href="/ads"><Target size={15} /><span>广告决策</span></a>
        <a href="/inventory"><Boxes size={15} /><span>库存补货</span></a>
        <a href="/reviews"><Gauge size={15} /><span>运营复盘</span></a>
      </div>
    </section>

    <section class="aside-section aside-focus">
      <div class="aside-section-head"><span>下一项动作</span></div>
      <strong>{nextAction?.title || '等待规则引擎刷新'}</strong>
      <p>{nextAction?.description || '当前没有未关闭的运营异常。'}</p>
      {#if nextAction}
        <a class="focus-link" href="/overview">处理动作 <ArrowRight size={13} /></a>
      {/if}
    </section>
  </aside>
{/if}

<style>
  .aside-links a,
  .focus-link {
    align-items: center;
    border-radius: 7px;
    color: #a9bdcc;
    display: flex;
    font-size: 11px;
    gap: 9px;
    min-height: 37px;
    padding: 0 8px;
    text-decoration: none;
    transition: background 150ms ease, color 150ms ease, transform 150ms ease;
  }

  .aside-links a:hover,
  .focus-link:hover {
    background: rgba(114, 221, 247, 0.07);
    color: #e8f7ff;
    transform: translateX(2px);
  }

  .aside-links {
    display: grid;
    gap: 2px;
    margin-top: 7px;
  }

  .focus-link {
    color: var(--accent, #72ddf7);
    font-weight: 750;
    margin: 1px -8px -7px;
    min-height: 34px;
  }

  :global(html[data-theme="light"]) .aside-links a,
  :global(html[data-theme="light"]) .focus-link {
    color: #4b687b;
  }

  :global(html[data-theme="light"]) .focus-link {
    color: #167d9d;
  }
</style>
