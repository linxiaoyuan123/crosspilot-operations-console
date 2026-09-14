<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ArrowRight, BookOpen, Grid2X2, List, Search, Tags } from 'lucide-svelte';
  import { api, formatDate, formatNumber, splitTags } from '../lib/api';
  import type { Article, ArticleStats, TaxonomyItem } from '../lib/types';

  export let mode: 'all' | 'archive' | 'categories' | 'tags' | 'series' | 'search' = 'all';
  export let initialQuery = '';
  export let initialTag = '';
  export let initialCategory = '';
  export let initialSeries = '';
  export let initialMonth = '';

  let items: Article[] = [];
  let stats: ArticleStats | null = null;
  let archive: Array<{ month: string; count: number }> = [];
  let query = initialQuery;
  let activeTag = initialTag;
  let activeCategory = initialCategory;
  let activeSeries = initialSeries;
  let activeMonth = initialMonth;
  let loading = true;
  let error = '';
  let viewMode: 'grid' | 'list' = 'list';
  let offset = 0;
  const pageSize = 24;

  async function load(reset = true) {
    if (reset) offset = 0;
    loading = true;
    error = '';
    try {
      const params = new URLSearchParams({
        status: 'published',
        limit: String(pageSize),
        offset: String(offset)
      });
      if (query.trim()) params.set('q', query.trim());
      if (activeTag) params.set('tag', activeTag);
      if (activeCategory) params.set('category', activeCategory);
      if (activeSeries) params.set('series', activeSeries);
      if (activeMonth) params.set('month', activeMonth);
      const data = await api<{ items: Article[]; stats: ArticleStats }>(`/api/articles?${params}`);
      items = data.items || [];
      stats = data.stats;
      if (mode === 'archive' && !archive.length) {
        const archiveData = await api<{ items: Array<{ month: string; count: number }> }>('/api/articles/archive');
        archive = archiveData.items || [];
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '内容加载失败';
    } finally {
      loading = false;
    }
  }

  function syncUrl() {
    const url = new URL(location.href);
    for (const key of ['q', 'tag', 'category', 'series', 'month']) {
      url.searchParams.delete(key);
    }
    if (query.trim()) url.searchParams.set('q', query.trim());
    if (activeTag) url.searchParams.set('tag', activeTag);
    if (activeCategory) url.searchParams.set('category', activeCategory);
    if (activeSeries) url.searchParams.set('series', activeSeries);
    if (activeMonth) url.searchParams.set('month', activeMonth);
    history.replaceState({}, '', url);
  }

  function applyLocationFilters() {
    const params = new URLSearchParams(location.search);
    query = initialQuery || params.get('q') || '';
    activeTag = initialTag || params.get('tag') || '';
    activeCategory = initialCategory || params.get('category') || '';
    activeSeries = initialSeries || params.get('series') || '';
    activeMonth = initialMonth || params.get('month') || '';
  }

  function selectTaxonomy(item: TaxonomyItem) {
    if (mode === 'categories') {
      activeCategory = activeCategory === item.name ? '' : item.name;
      activeTag = '';
    } else {
      activeTag = activeTag === item.name ? '' : item.name;
      activeCategory = '';
    }
    syncUrl();
    load();
  }

  function toggleMonth(month: string) {
    activeMonth = activeMonth === month ? '' : month;
    syncUrl();
    load();
  }

  function submitSearch(event: SubmitEvent) {
    event.preventDefault();
    syncUrl();
    load();
  }

  const title = {
    all: '全部文章',
    archive: '文章归档',
    categories: '文章分类',
    tags: '标签索引',
    series: '内容系列',
    search: '全文搜索'
  }[mode];

  $: taxonomyItems = (mode === 'categories' ? stats?.categories : stats?.tags) || [];

  onMount(() => {
    applyLocationFilters();
    load();
  });
</script>

<header class="page-head cp-card">
  <div>
    <span class="cp-kicker">{mode === 'search' ? 'full text search' : 'content library'}</span>
    <h1>{title}</h1>
    <p>按文章本身阅读，不把店铺资料和经营指标混进内容区。</p>
  </div>
</header>

{#if mode === 'search' || mode === 'all'}
  <form class="search-bar cp-card" onsubmit={submitSearch}>
    <Search size={16} aria-hidden="true" />
    <input class="cp-field" bind:value={query} type="search" placeholder="搜索标题、正文、标签" aria-label="搜索文章" />
    <button class="cp-button" type="submit">搜索</button>
  </form>
{/if}

{#if mode === 'categories' || mode === 'tags'}
  <div class="taxonomy cp-card">
    <div class="taxonomy-head"><Tags size={15} /><strong>{mode === 'categories' ? '按分类筛选' : '按标签筛选'}</strong></div>
    <div class="taxonomy-list">
      {#each taxonomyItems as item}
        <button
          type="button"
          class:active={(mode === 'categories' ? activeCategory : activeTag) === item.name}
          onclick={() => selectTaxonomy(item)}
        >
          {item.name}<span>{item.count}</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if mode === 'series' && stats?.series?.length}
  <div class="series-grid">
    {#each stats.series as series}
      <a class="series-card cp-card" href={`/articles?series=${encodeURIComponent(series.slug)}`}>
        <span class="cp-kicker">series</span>
        <h2>{series.name}</h2>
        <p>{series.description || '按顺序阅读这一主题下的文章。'}</p>
        <strong>{series.count} 篇</strong>
      </a>
    {/each}
  </div>
{/if}

{#if mode === 'archive' && archive.length}
  <div class="archive-strip cp-card cp-scroll">
    {#each archive as item}
      <button type="button" class:active={activeMonth === item.month} onclick={() => toggleMonth(item.month)}><strong>{item.month}</strong><span>{item.count} 篇</span></button>
    {/each}
  </div>
{/if}

<div class="toolbar">
  <span>{loading ? '正在加载' : `共显示 ${items.length} 篇`}</span>
  <div class="view-switch">
    <button type="button" class:active={viewMode === 'grid'} onclick={() => (viewMode = 'grid')} title="网格视图" aria-label="网格视图"><Grid2X2 size={14} /></button>
    <button type="button" class:active={viewMode === 'list'} onclick={() => (viewMode = 'list')} title="列表视图" aria-label="列表视图"><List size={14} /></button>
  </div>
</div>

{#if loading}
  <div class="cp-loading">正在读取文章</div>
{:else if error}
  <div class="cp-empty">{error}</div>
{:else if items.length === 0}
  <div class="cp-empty">没有匹配文章，调整搜索或筛选条件后再试。</div>
{:else}
  <div class:grid-view={viewMode === 'grid'} class:list-view={viewMode === 'list'} class="article-list">
    {#each items as article (article.id)}
      <article class="article cp-card">
        <a class="cover" href={`/articles/${encodeURIComponent(article.slug)}`} aria-label={`阅读 ${article.title}`}>
          {#if article.cover_image}<img src={article.cover_image} alt="" loading="lazy" />{:else}<BookOpen size={26} />{/if}
        </a>
        <div class="copy">
          <div class="meta-top"><span class="cp-kicker">{article.category || '未分类'}</span>{#if article.featured}<span class="cp-badge accent">置顶</span>{/if}</div>
          <h2><a href={`/articles/${encodeURIComponent(article.slug)}`}>{article.title}</a></h2>
          <p>{article.excerpt}</p>
          <div class="tags">
            {#each splitTags(article.tags).slice(0, 4) as tag}
              <a href={`/tags?tag=${encodeURIComponent(tag)}`}>#{tag}</a>
            {/each}
          </div>
          <div class="meta">
            <span>{formatDate(article.updated_at)}</span>
            <span>{article.reading_minutes || 1} 分钟</span>
            <span>{formatNumber(article.views)} 次查看</span>
          </div>
        </div>
      </article>
    {/each}
  </div>
{/if}

<div class="pagination">
  <button class="cp-button secondary" type="button" disabled={offset === 0} onclick={() => { offset = Math.max(0, offset - pageSize); load(false); }}><ArrowLeft size={13} />上一页</button>
  <button class="cp-button secondary" type="button" disabled={items.length < pageSize} onclick={() => { offset += pageSize; load(false); }}>下一页<ArrowRight size={13} /></button>
</div>

<style>
  .page-head {
    margin: 0 0 16px;
    padding: clamp(20px, 3vw, 30px);
  }

  .page-head h1 {
    font-size: clamp(28px, 3.6vw, 42px);
    line-height: 1.2;
    margin: 7px 0 9px;
  }

  .page-head p {
    color: var(--cp-text-soft);
    font-size: 13px;
    line-height: 1.7;
    margin: 0;
  }

  .search-bar {
    align-items: center;
    display: grid;
    gap: 9px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    margin-bottom: 14px;
    padding: 12px;
  }

  .taxonomy {
    display: grid;
    gap: 10px;
    margin-bottom: 14px;
    padding: 14px;
  }

  .taxonomy-head {
    align-items: center;
    display: flex;
    font-size: 11px;
    gap: 7px;
  }

  .taxonomy-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .taxonomy-list button {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 999px;
    color: var(--cp-text-soft);
    cursor: pointer;
    font-size: 9px;
    min-height: 30px;
    padding: 5px 10px;
  }

  .taxonomy-list button span {
    margin-left: 6px;
    opacity: 0.62;
  }

  .taxonomy-list button.active {
    background: var(--cp-accent-soft);
    border-color: color-mix(in srgb, var(--cp-accent) 30%, transparent);
    color: var(--cp-accent);
  }

  .series-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 14px;
  }

  .series-card {
    display: grid;
    gap: 8px;
    padding: 18px;
    text-decoration: none;
  }

  .series-card h2 {
    font-size: 17px;
    margin: 0;
  }

  .series-card p {
    color: var(--cp-text-soft);
    font-size: 11px;
    line-height: 1.65;
    margin: 0;
  }

  .series-card strong {
    color: var(--cp-accent);
    font-size: 11px;
  }

  .archive-strip {
    display: flex;
    gap: 7px;
    margin-bottom: 14px;
    overflow-x: auto;
    padding: 10px;
  }

  .archive-strip button {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    color: var(--cp-text);
    cursor: pointer;
    display: grid;
    gap: 2px;
    min-width: 104px;
    padding: 9px;
    text-align: left;
  }

  .archive-strip span {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .toolbar {
    align-items: center;
    color: var(--cp-text-muted);
    display: flex;
    font-size: 10px;
    justify-content: space-between;
    margin: 18px 2px 9px;
  }

  .view-switch {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    display: flex;
    padding: 3px;
  }

  .view-switch button {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 5px;
    color: var(--cp-text-muted);
    cursor: pointer;
    display: flex;
    height: 27px;
    justify-content: center;
    width: 30px;
  }

  .view-switch button.active {
    background: var(--cp-accent-soft);
    color: var(--cp-accent);
  }

  .article-list {
    display: grid;
    gap: 12px;
  }

  .article-list.grid-view {
    grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
  }

  .article-list.list-view {
    grid-template-columns: 1fr;
  }

  .article {
    min-height: 0;
    overflow: hidden;
  }

  .list-view .article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 226px;
    grid-template-rows: minmax(150px, auto);
  }

  .grid-view .article {
    display: grid;
    grid-template-rows: 150px minmax(0, 1fr);
  }

  .cover {
    align-items: center;
    background: linear-gradient(140deg, var(--cp-accent-soft), var(--cp-surface-muted));
    color: var(--cp-accent);
    display: flex;
    justify-content: center;
    overflow: hidden;
    text-decoration: none;
  }

  .list-view .cover {
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    grid-column: 2;
    grid-row: 1;
    margin: 15px 15px 15px 0;
    min-height: 126px;
  }

  .cover img {
    height: 100%;
    object-fit: cover;
    transition: transform 380ms cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
  }

  .article:hover .cover img {
    transform: scale(1.035);
  }

  .copy {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 17px 20px;
  }

  .list-view .copy {
    grid-column: 1;
    grid-row: 1;
    padding: 20px 22px;
  }

  .meta-top {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  h2 {
    font-size: 18px;
    line-height: 1.42;
    margin: 0;
    overflow-wrap: anywhere;
  }

  h2 a {
    text-decoration: none;
  }

  h2 a:hover {
    color: var(--cp-accent);
  }

  .copy > p {
    color: var(--cp-text-soft);
    display: -webkit-box;
    font-size: 12px;
    line-height: 1.7;
    margin: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .tags a {
    background: var(--cp-accent-soft);
    border-radius: 999px;
    color: var(--cp-text-soft);
    font-size: 8px;
    padding: 4px 7px;
    text-decoration: none;
  }

  .meta {
    color: var(--cp-text-muted);
    display: flex;
    font-size: 9px;
    gap: 12px;
    margin-top: auto;
  }

  .pagination {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 20px;
  }

  @media (max-width: 980px) {
    .article-list.grid-view,
    .series-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .search-bar {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .search-bar .cp-button {
      grid-column: 1 / -1;
    }

    .article-list.grid-view,
    .series-grid {
      grid-template-columns: 1fr;
    }

    .list-view .article {
      grid-template-columns: minmax(0, 1fr) 102px;
      grid-template-rows: minmax(112px, auto);
    }

    .list-view .cover {
      margin: 11px 11px 11px 0;
      min-height: 88px;
    }

    .list-view .copy {
      gap: 6px;
      padding: 14px 14px 14px 16px;
    }

    h2 {
      font-size: 15px;
    }

    .copy > p {
      -webkit-line-clamp: 2;
    }

    .tags,
    .meta span:nth-child(1) {
      display: none;
    }
  }
</style>
