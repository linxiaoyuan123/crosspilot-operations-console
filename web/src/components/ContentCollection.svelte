<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft, ArrowRight, ExternalLink, Image as ImageIcon, MapPin } from 'lucide-svelte';
  import { api, formatDate } from '../lib/api';
  import type { ContentEntry } from '../lib/types';

  export let type: string;
  export let mode: 'index' | 'detail' = 'index';

  let items: ContentEntry[] = [];
  let item: ContentEntry | null = null;
  let loading = true;
  let error = '';

  const labels: Record<string, { kicker: string; title: string; description: string }> = {
    dynamic: { kicker: 'operations feed', title: '运营动态', description: '记录版本变化、店铺动作与可追溯的运营事件。' },
    project: { kicker: 'case projects', title: '案例项目', description: '把真实问题的判断、执行和结果整理成可复用案例。' },
    gallery: { kicker: 'evidence gallery', title: '证据相册', description: '集中管理脱敏后的截图、Listing 更新和补货证据。' },
    resource: { kicker: 'resource navigator', title: '资源导航', description: '常用字段映射、平台入口和工作模板。' },
    guestbook: { kicker: 'feedback', title: '反馈留言', description: '提交问题、建议和希望接入的平台能力。' },
    about: { kicker: 'about', title: '关于 CrossPilot', description: '了解项目边界、架构与使用范围。' }
  };

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts.at(-1) || '');
  }

  async function load() {
    loading = true;
    error = '';
    try {
      if (mode === 'detail') {
        const slug = slugFromPath();
        item = await api<ContentEntry>(`/api/content/${type}/${encodeURIComponent(slug)}`);
        document.title = `${item.title} · CrossPilot`;
      } else {
        const data = await api<{ items: ContentEntry[] }>(`/api/content?type=${type}&limit=100`);
        items = data.items || [];
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '内容加载失败';
    } finally {
      loading = false;
    }
  }

  function metadataImages(entry: ContentEntry): string[] {
    const images = entry.metadata?.images;
    return Array.isArray(images) ? images.map(String) : [];
  }

  function metadataLinks(entry: ContentEntry): Array<{ label: string; url: string }> {
    const links = entry.metadata?.links;
    return Array.isArray(links)
      ? links.filter((link): link is { label: string; url: string } => Boolean(link && typeof link === 'object' && 'label' in link && 'url' in link))
      : [];
  }

  onMount(load);
</script>

{#if loading}
  <div class="cp-loading">正在读取内容</div>
{:else if error}
  <div class="cp-empty">{error}</div>
{:else if mode === 'detail' && item}
  <div class="detail-actions"><a class="cp-button secondary" href={`/${type === 'project' ? 'projects' : type === 'resource' ? 'resources' : type === 'gallery' ? 'gallery' : type}`}><ArrowLeft size={13} />返回</a></div>
  <article class="detail cp-card">
    {#if item.cover_image}<img class="hero-image" src={item.cover_image} alt="" />{/if}
    <header>
      <span class="cp-kicker">{labels[type]?.kicker || type}</span>
      <h1 class="cp-title">{item.title}</h1>
      <p class="cp-subtitle">{item.summary}</p>
      <div class="meta"><span>{formatDate(item.published_at)}</span>{#if item.metadata?.location}<span><MapPin size={12} />{String(item.metadata.location)}</span>{/if}</div>
    </header>
    <div class="markdown-body cp-reading">{@html item.html || ''}</div>
    {#if metadataImages(item).length}
      <div class="gallery-grid">
        {#each metadataImages(item) as image}<a href={image} target="_blank" rel="noreferrer"><img src={image} alt="" /></a>{/each}
      </div>
    {/if}
  </article>
{:else}
  <header class="page-head cp-card">
    <div>
      <span class="cp-kicker">{labels[type]?.kicker || type}</span>
      <h1 class="cp-title">{labels[type]?.title || type}</h1>
      <p class="cp-subtitle">{labels[type]?.description || '结构化内容模块'}</p>
    </div>
    <span class="cp-badge">{items.length} 条内容</span>
  </header>

  {#if items.length}
    <div class:gallery={type === 'gallery'} class="content-grid">
      {#each items as entry (entry.id)}
        <article class="content-card cp-card">
          {#if entry.cover_image}
            <a class="cover" href={`/${type === 'project' ? 'projects' : type === 'resource' ? 'resources' : type}/${encodeURIComponent(entry.slug)}`}>
              <img src={entry.cover_image} alt="" loading="lazy" />
            </a>
          {:else}
            <span class="cover icon"><ImageIcon size={24} /></span>
          {/if}
          <div class="copy">
            <div class="meta-top"><span class="cp-kicker">{type}</span>{#if entry.featured}<span class="cp-badge accent">精选</span>{/if}</div>
            <h2><a href={`/${type === 'project' ? 'projects' : type === 'resource' ? 'resources' : type}/${encodeURIComponent(entry.slug)}`}>{entry.title}</a></h2>
            <p>{entry.summary}</p>
            <div class="foot">
              <span>{formatDate(entry.published_at)}</span>
              <a href={`/${type === 'project' ? 'projects' : type === 'resource' ? 'resources' : type}/${encodeURIComponent(entry.slug)}`}>查看详情<ArrowRight size={12} /></a>
            </div>
            {#if metadataLinks(entry).length}
              <div class="links">
                {#each metadataLinks(entry) as link}
                  <a href={link.url} target="_blank" rel="noreferrer"><ExternalLink size={12} />{link.label}</a>
                {/each}
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="cp-empty">该模块还没有内容。</div>
  {/if}
{/if}

<style>
  .detail-actions {
    display: flex;
    justify-content: flex-end;
    margin: 24px 0 12px;
  }

  .page-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 28px 0 14px;
    padding: clamp(21px, 3vw, 34px);
  }

  .content-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .content-grid.gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .content-card {
    display: grid;
    grid-template-rows: 172px minmax(0, 1fr);
    min-height: 320px;
    overflow: hidden;
  }

  .cover {
    align-items: center;
    background: linear-gradient(140deg, var(--cp-accent-soft), var(--cp-surface-muted));
    color: var(--cp-accent);
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .cover img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .copy {
    display: grid;
    gap: 8px;
    padding: 15px;
  }

  .meta-top,
  .foot,
  .meta {
    align-items: center;
    display: flex;
    gap: 9px;
    justify-content: space-between;
  }

  h2 {
    font-size: 15px;
    line-height: 1.45;
    margin: 0;
  }

  h2 a {
    text-decoration: none;
  }

  .copy > p {
    color: var(--cp-text-soft);
    display: -webkit-box;
    font-size: 11px;
    line-height: 1.65;
    margin: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .foot {
    color: var(--cp-text-muted);
    font-size: 8px;
    margin-top: auto;
  }

  .foot a {
    align-items: center;
    color: var(--cp-accent);
    display: inline-flex;
    gap: 4px;
    text-decoration: none;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .links a {
    align-items: center;
    background: var(--cp-accent-soft);
    border-radius: 999px;
    color: var(--cp-text-soft);
    display: inline-flex;
    font-size: 8px;
    gap: 4px;
    padding: 4px 7px;
    text-decoration: none;
  }

  .detail {
    overflow: hidden;
  }

  .detail .hero-image {
    height: clamp(240px, 38vw, 490px);
    object-fit: cover;
    width: 100%;
  }

  .detail > header {
    margin: 0 auto;
    max-width: 860px;
    padding: clamp(28px, 5vw, 58px) clamp(20px, 5vw, 54px) 22px;
    text-align: center;
  }

  .meta {
    color: var(--cp-text-muted);
    font-size: 9px;
    justify-content: center;
    margin-top: 14px;
  }

  .meta span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }

  .cp-reading {
    margin: 0 auto;
    max-width: 860px;
    padding: 8px clamp(20px, 5vw, 54px) 48px;
  }

  .gallery-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 0 clamp(20px, 5vw, 54px) 42px;
  }

  .gallery-grid img {
    aspect-ratio: 4 / 3;
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  @media (max-width: 980px) {
    .content-grid,
    .content-grid.gallery {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .page-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .content-grid,
    .content-grid.gallery,
    .gallery-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
