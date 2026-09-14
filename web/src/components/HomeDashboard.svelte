<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Activity,
    ArrowRight,
    BarChart3,
    BookOpen,
    Boxes,
    CircleDollarSign,
    FileText,
    Search,
    Target
  } from 'lucide-svelte';
  import { api, formatDate, formatNumber } from '../lib/api';
  import type { Article, ArticleStats, Overview, Store } from '../lib/types';

  let overview: Overview | null = null;
  let articles: Article[] = [];
  let stats: ArticleStats | null = null;
  let query = '';
  let loading = true;
  let error = '';
  let currentStore: Store | null = null;

  function visibleArticles() {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return articles;
    return articles.filter((article) => {
      const haystack = `${article.title} ${article.excerpt} ${article.category} ${article.tags}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }

  function money(value: number, currency = 'EUR') {
    return `${currency} ${formatNumber(value, 2)}`;
  }

  async function load(storeId?: number) {
    loading = true;
    error = '';
    try {
      const [articleData, storeData] = await Promise.all([
        api<{ items: Article[]; stats: ArticleStats }>('/api/articles?status=published&limit=10'),
        api<{ items: Store[] }>('/api/stores')
      ]);
      articles = articleData.items || [];
      stats = articleData.stats || null;
      const savedId = Number(localStorage.getItem('crosspilot-store'));
      currentStore = storeData.items.find((store) => store.id === storeId)
        || storeData.items.find((store) => store.id === savedId)
        || storeData.items[0]
        || null;
      overview = currentStore
        ? await api<Overview>(`/api/overview?storeId=${currentStore.id}`)
        : null;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '内容加载失败';
    } finally {
      loading = false;
    }
  }

  function handleStoreChange(event: Event) {
    const store = (event as CustomEvent<Store>).detail;
    if (!store) return;
    currentStore = store;
    load(store.id);
  }

  $: featuredArticle = articles.find((article) => Boolean(article.featured)) || articles[0] || null;
  $: latestArticles = articles.filter((article) => article.id !== featuredArticle?.id).slice(0, 3);
  $: openActionCount = overview?.actionsPreview?.filter((action) => !['done', 'closed', 'ignored'].includes(action.status)).length || 0;

  onMount(() => {
    window.addEventListener('crosspilot:store-change', handleStoreChange);
    load();
    return () => window.removeEventListener('crosspilot:store-change', handleStoreChange);
  });
</script>

<section class="panel view-head cp-view-head-card">
  <div>
    <span class="project-kicker">CrossPilot operations</span>
    <h2>从经营状态到方法沉淀</h2>
    <p>主页汇集当前店铺、待办动作、关键指标和最新文章，日常从这里进入各模块。</p>
  </div>
  <div class="head-actions">
    <a class="button secondary" href="/articles"><BookOpen size={14} />浏览文章</a>
    <a class="button primary" href="/studio"><FileText size={14} />写新文章</a>
  </div>
</section>

{#if error}
  <div class="error-state">{error}</div>
{:else}
  <section class="cp-home-lead-grid">
    {#if featuredArticle}
      <a class="panel cp-featured-article" href={`/articles/${encodeURIComponent(featuredArticle.slug)}`}>
        <div class="cp-featured-media">
          {#if featuredArticle.cover_image}
            <img src={featuredArticle.cover_image} alt="" />
          {:else}
            <BookOpen size={36} />
          {/if}
        </div>
        <div class="cp-featured-copy">
          <span class="project-kicker">{featuredArticle.category} · featured</span>
          <h2>{featuredArticle.title}</h2>
          <p>{featuredArticle.excerpt}</p>
          <div class="cp-article-meta">
            <span>{formatDate(featuredArticle.updated_at)}</span>
            <span>{featuredArticle.reading_minutes || 1} 分钟阅读</span>
            <span>{formatNumber(featuredArticle.views)} 次查看</span>
          </div>
          <span class="text-button">继续阅读 <ArrowRight size={13} /></span>
        </div>
      </a>
    {:else}
      <section class="panel cp-featured-article empty-feature">
        <div class="cp-featured-copy">
          <span class="project-kicker">content library</span>
          <h2>还没有已发布文章</h2>
          <p>进入内容后台写下第一篇运营方法或复盘记录。</p>
          <a class="button primary" href="/studio">进入内容后台</a>
        </div>
      </section>
    {/if}

    <aside class="panel cp-home-profile">
      <div class="cp-home-profile-head">
        <span class="cp-home-avatar"><Target size={24} /></span>
        <div>
          <span class="panel-kicker">active workspace</span>
          <h3>{currentStore?.name || 'CrossPilot'}</h3>
          <p>{currentStore ? `${currentStore.platform} · ${currentStore.market}` : '跨境运营工作区'}</p>
        </div>
      </div>
      <div class="cp-home-profile-stats">
        <div><span>待办动作</span><strong>{openActionCount}</strong></div>
        <div><span>已发布文章</span><strong>{stats?.published || 0}</strong></div>
        <div><span>库存风险</span><strong>{overview?.kpis.inventoryRiskCount || 0}</strong></div>
        <div><span>售后事项</span><strong>{overview?.kpis.pendingAfterSales || 0}</strong></div>
      </div>
      <div class="cp-home-profile-note"><Activity size={15} /><p>规则引擎会持续复核利润、广告、库存和售后异常。</p></div>
      <div class="cp-home-profile-actions">
        <a class="button secondary" href="/overview">进入总览</a>
        <a class="button secondary" href="/studio">维护内容</a>
      </div>
    </aside>
  </section>

  <section class="cp-home-section">
    <header class="cp-home-section-head">
      <div><span class="panel-kicker">latest notes</span><h3>最新文章</h3></div>
      <a class="text-button" href="/articles">查看全部 <ArrowRight size={13} /></a>
    </header>
    <div class="home-search">
      <Search size={14} />
      <input bind:value={query} type="search" placeholder="筛选最新文章" aria-label="筛选最新文章" />
    </div>
    {#if loading}
      <div class="loading-state">正在整理文章与运营数据</div>
    {:else if visibleArticles().length}
      <div class="cp-article-grid compact">
        {#each visibleArticles().slice(0, 3) as article (article.id)}
          <article class="panel cp-article-card">
            <a class="cp-article-cover" href={`/articles/${encodeURIComponent(article.slug)}`} aria-label={`阅读 ${article.title}`}>
              {#if article.cover_image}
                <img src={article.cover_image} alt="" loading="lazy" />
              {:else}
                <BookOpen size={30} />
              {/if}
            </a>
            <div class="cp-article-card-body">
              <div class="cp-article-card-top"><span class="project-kicker">{article.category}</span><time>{formatDate(article.updated_at)}</time></div>
              <h3><a href={`/articles/${encodeURIComponent(article.slug)}`}>{article.title}</a></h3>
              <p>{article.excerpt}</p>
              <div class="cp-article-meta"><span>{article.reading_minutes || 1} 分钟</span><span>{formatNumber(article.views)} 次查看</span></div>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <div class="empty-state">没有匹配文章，调整筛选词后再试。</div>
    {/if}
  </section>

  <section class="cp-home-section">
    <header class="cp-home-section-head">
      <div><span class="panel-kicker">operations pulse</span><h3>运营脉冲</h3></div>
      <span class="muted">近 30 天</span>
    </header>
    <div class="metric-grid cp-metric-grid">
      <a class="metric-card" href="/overview" style="--metric-color:#72ddf7;--metric-soft:rgba(114,221,247,.12)">
        <span class="metric-icon"><BarChart3 size={17} /></span>
        <div><span>净销售额</span><strong>{overview ? money(overview.kpis.netSales, currentStore?.currency) : '—'}</strong><small>净利润 {overview ? money(overview.kpis.profit, currentStore?.currency) : '—'}</small></div>
      </a>
      <a class="metric-card" href="/ads" style="--metric-color:#78e6c4;--metric-soft:rgba(120,230,196,.12)">
        <span class="metric-icon"><CircleDollarSign size={17} /></span>
        <div><span>ACOS</span><strong>{overview ? `${overview.kpis.acos}%` : '—'}</strong><small>目标 {currentStore?.target_acos ?? '—'}%</small></div>
      </a>
      <a class="metric-card" href="/inventory" style="--metric-color:#f5c66d;--metric-soft:rgba(245,198,109,.12)">
        <span class="metric-icon"><Boxes size={17} /></span>
        <div><span>库存风险</span><strong>{overview?.kpis.inventoryRiskCount ?? 0} 个 SKU</strong><small>缺货与滞销</small></div>
      </a>
      <a class="metric-card" href="/overview" style="--metric-color:#c8bdff;--metric-soft:rgba(200,189,255,.12)">
        <span class="metric-icon"><Activity size={17} /></span>
        <div><span>待执行动作</span><strong>{openActionCount} 项</strong><small>按优先级进入总览处理</small></div>
      </a>
    </div>
  </section>
{/if}

<style>
  .cp-home-lead-grid,
  .cp-home-section {
    margin-top: 0;
  }

  .cp-view-head-card {
    margin-bottom: 16px;
  }

  .cp-featured-article {
    color: inherit;
    text-decoration: none;
  }

  .empty-feature {
    align-items: center;
    display: flex;
    min-height: 260px;
  }

  .home-search {
    align-items: center;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--muted);
    display: flex;
    gap: 8px;
    margin: -4px 0 12px;
    min-height: 36px;
    padding: 0 10px;
  }

  .home-search input {
    background: transparent;
    border: 0;
    color: var(--ink);
    min-width: 0;
    outline: 0;
    width: 100%;
  }

  .cp-article-card h3 a {
    text-decoration: none;
  }

  @media (max-width: 980px) {
    .cp-home-lead-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
