<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowRight, BookOpen, FileText, Search } from 'lucide-svelte';
  import { api, formatDate, formatNumber, splitTags } from '../lib/api';
  import type { Article } from '../lib/types';

  let articles: Article[] = [];
  let query = '';
  let loading = true;
  let error = '';

  function visibleArticles() {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return articles;
    return articles.filter((article) => {
      const haystack = `${article.title} ${article.excerpt} ${article.category} ${article.tags}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }

  async function loadArticles() {
    loading = true;
    error = '';
    try {
      const data = await api<{ items: Article[] }>('/api/articles?status=published&limit=12');
      articles = data.items || [];
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '文章加载失败';
    } finally {
      loading = false;
    }
  }

  onMount(loadArticles);
</script>

<section class="home-intro cp-card" aria-labelledby="home-title">
  <div class="home-intro-copy">
    <span class="cp-kicker">CrossPilot journal</span>
    <h1 id="home-title">把跨境运营经验，整理成可以复用的方法</h1>
    <p>这里只保留文章与写作入口，经营指标、店铺状态和待办动作继续放在运营总览与工具模块。</p>
  </div>
  <div class="home-intro-actions">
    <a class="cp-button secondary" href="/articles"><BookOpen size={15} />全部文章</a>
    <a class="cp-button" href="/studio"><FileText size={15} />写新文章</a>
  </div>
</section>

<section class="home-library cp-card" aria-labelledby="home-library-title">
  <header class="home-library-head">
    <div>
      <span class="cp-kicker">latest notes</span>
      <h2 id="home-library-title">最新文章</h2>
      <p>按更新时间浏览运营方法、项目复盘和实战记录。</p>
    </div>
    <label class="home-search">
      <Search size={15} aria-hidden="true" />
      <input bind:value={query} type="search" placeholder="筛选文章" aria-label="筛选文章" />
    </label>
  </header>

  {#if loading}
    <div class="cp-loading">正在整理文章</div>
  {:else if error}
    <div class="cp-empty">{error}</div>
  {:else if visibleArticles().length === 0}
    <div class="cp-empty">没有匹配文章，调整筛选词后再试。</div>
  {:else}
    <div class="home-feed">
      {#each visibleArticles() as article, index (article.id)}
        <a class:featured={index === 0} class="home-story" href={`/articles/${encodeURIComponent(article.slug)}`}>
          <div class="home-story-copy">
            <div class="home-story-meta">
              <span>{article.category || '未分类'}</span>
              {#if article.featured}<strong>置顶</strong>{/if}
              <time>{formatDate(article.updated_at)}</time>
            </div>
            <h3>{article.title}</h3>
            {#if index === 0}
              <p>{article.excerpt}</p>
            {/if}
            <div class="home-story-tags">
              {#each splitTags(article.tags).slice(0, index === 0 ? 4 : 2) as tag}
                <span>#{tag}</span>
              {/each}
            </div>
            <div class="home-story-foot">
              <span>{article.reading_minutes || 1} 分钟阅读</span>
              <span>{formatNumber(article.views)} 次查看</span>
              <em>继续阅读 <ArrowRight size={13} /></em>
            </div>
          </div>
          <div class="home-story-cover" aria-hidden="true">
            {#if article.cover_image}
              <img src={article.cover_image} alt="" loading={index > 1 ? 'lazy' : 'eager'} />
            {:else}
              <BookOpen size={28} />
            {/if}
          </div>
        </a>
      {/each}
    </div>
  {/if}
</section>

<style>
  .home-intro {
    align-items: end;
    display: grid;
    gap: 26px;
    grid-template-columns: minmax(0, 1fr) auto;
    margin-bottom: 16px;
    padding: clamp(24px, 4vw, 42px);
  }

  .home-intro-copy {
    max-width: 790px;
  }

  .home-intro h1 {
    font-size: clamp(28px, 4vw, 48px);
    line-height: 1.18;
    margin: 8px 0 12px;
  }

  .home-intro p {
    color: var(--cp-text-soft);
    font-size: 13px;
    line-height: 1.8;
    margin: 0;
  }

  .home-intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .home-library {
    padding: clamp(18px, 3vw, 28px);
  }

  .home-library-head {
    align-items: end;
    border-bottom: 1px solid var(--cp-line);
    display: flex;
    gap: 22px;
    justify-content: space-between;
    padding-bottom: 18px;
  }

  .home-library-head h2 {
    font-size: clamp(22px, 2.5vw, 32px);
    margin: 5px 0 5px;
  }

  .home-library-head p {
    color: var(--cp-text-muted);
    font-size: 12px;
    margin: 0;
  }

  .home-search {
    align-items: center;
    background: rgba(255, 255, 255, 0.045);
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    color: var(--cp-text-muted);
    display: flex;
    flex: 0 0 min(300px, 34vw);
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
  }

  .home-search:focus-within {
    border-color: color-mix(in srgb, var(--cp-accent) 52%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--cp-accent) 9%, transparent);
  }

  .home-search input {
    background: transparent;
    border: 0;
    color: var(--cp-text);
    min-width: 0;
    outline: 0;
    width: 100%;
  }

  .home-feed {
    display: grid;
  }

  .home-story {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    color: inherit;
    display: grid;
    gap: clamp(20px, 3vw, 36px);
    grid-template-columns: minmax(0, 1fr) 220px;
    min-height: 158px;
    padding: 18px 4px;
    text-decoration: none;
  }

  .home-story:last-child {
    border-bottom: 0;
    padding-bottom: 4px;
  }

  .home-story.featured {
    grid-template-columns: minmax(0, 1fr) 300px;
    min-height: 220px;
    padding-block: 24px;
  }

  .home-story-copy {
    display: grid;
    gap: 8px;
    min-width: 0;
  }

  .home-story-meta,
  .home-story-foot {
    align-items: center;
    color: var(--cp-text-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 10px;
    gap: 9px;
  }

  .home-story-meta > span {
    color: var(--cp-accent);
    font-weight: 780;
  }

  .home-story-meta strong {
    background: var(--cp-accent-soft);
    border: 1px solid color-mix(in srgb, var(--cp-accent) 28%, transparent);
    border-radius: 999px;
    color: var(--cp-accent);
    font-size: 9px;
    padding: 2px 7px;
  }

  .home-story-meta time {
    margin-left: auto;
  }

  .home-story h3 {
    font-size: clamp(17px, 2vw, 23px);
    line-height: 1.42;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .home-story.featured h3 {
    font-size: clamp(24px, 3vw, 36px);
    line-height: 1.28;
  }

  .home-story p {
    color: var(--cp-text-soft);
    display: -webkit-box;
    font-size: 13px;
    line-height: 1.75;
    margin: 0;
    max-width: 760px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .home-story-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .home-story-tags span {
    color: var(--cp-text-muted);
    font-size: 9px;
  }

  .home-story-foot {
    margin-top: 2px;
  }

  .home-story-foot em {
    align-items: center;
    color: var(--cp-accent);
    display: inline-flex;
    font-style: normal;
    font-weight: 780;
    gap: 5px;
    margin-left: auto;
  }

  .home-story-cover {
    align-items: center;
    aspect-ratio: 16 / 10;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.015));
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    color: var(--cp-accent);
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .home-story.featured .home-story-cover {
    aspect-ratio: 16 / 9;
  }

  .home-story-cover img {
    height: 100%;
    object-fit: cover;
    transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
    width: 100%;
  }

  .home-story:hover .home-story-cover img {
    transform: scale(1.035);
  }

  .home-story:hover h3,
  .home-story:hover .home-story-foot em {
    color: var(--cp-accent);
  }

  @media (max-width: 860px) {
    .home-intro,
    .home-library-head {
      align-items: flex-start;
      grid-template-columns: 1fr;
    }

    .home-intro {
      display: grid;
    }

    .home-library-head {
      flex-direction: column;
    }

    .home-search {
      flex-basis: auto;
      width: 100%;
    }

    .home-story,
    .home-story.featured {
      grid-template-columns: minmax(0, 1fr) 150px;
    }
  }

  @media (max-width: 560px) {
    .home-intro {
      padding: 22px 18px;
    }

    .home-intro-actions {
      justify-content: flex-start;
    }

    .home-library {
      padding: 14px;
    }

    .home-story,
    .home-story.featured {
      gap: 12px;
      grid-template-columns: minmax(0, 1fr) 92px;
      min-height: 124px;
      padding-block: 14px;
    }

    .home-story h3,
    .home-story.featured h3 {
      font-size: 16px;
    }

    .home-story.featured p,
    .home-story-tags {
      display: none;
    }

    .home-story-foot span:nth-child(2),
    .home-story-meta time {
      display: none;
    }
  }
</style>
