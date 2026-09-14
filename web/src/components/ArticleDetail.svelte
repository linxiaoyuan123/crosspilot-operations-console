<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    Check,
    Clock3,
    Eye,
    Focus,
    ListTree,
    MessageSquare,
    Send,
    Share2,
    ShieldCheck,
    X
  } from 'lucide-svelte';
  import { api, formatDate, formatNumber, splitTags } from '../lib/api';
  import type { Article, CommentItem } from '../lib/types';

  let article: Article | null = null;
  let comments: CommentItem[] = [];
  let loading = true;
  let error = '';
  let progress = 0;
  let immersive = false;
  let previewImage = '';
  let copied = false;
  let commentForm = { nickname: '', content: '' };
  let commentStatus = '';
  let submitting = false;
  let articleBody: HTMLElement;

  function slugFromPath() {
    const parts = location.pathname.split('/').filter(Boolean);
    return decodeURIComponent(parts.at(-1) || '');
  }

  async function load() {
    loading = true;
    error = '';
    try {
      const slug = slugFromPath();
      if (!slug || slug === 'detail') throw new Error('文章地址无效');
      article = await api<Article>(`/api/articles/${encodeURIComponent(slug)}`);
      if (article.id) {
        const commentData = await api<{ items: CommentItem[] }>(`/api/articles/${article.id}/comments`);
        comments = commentData.items || [];
      }
      document.title = `${article.title} · CrossPilot`;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '文章加载失败';
    } finally {
      loading = false;
      await tick();
      enhanceMarkdown();
    }
  }

  function initReadingProgress() {
    const update = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      progress = max > 0 ? Math.min(100, Math.max(0, (root.scrollTop / max) * 100)) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }

  function renderPlantUml(source: string) {
    const bytes = new TextEncoder().encode(source.trim());
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `https://www.plantuml.com/plantuml/svg/~h${hex}`;
  }

  function mathNodeFor(source: string, displayMode: boolean, katex: typeof import('katex').default) {
    const span = document.createElement(displayMode ? 'div' : 'span');
    span.className = displayMode ? 'math-display' : 'math-inline';
    span.innerHTML = katex.renderToString(source, { throwOnError: false, displayMode });
    return span;
  }

  function renderMathInText(root: HTMLElement, katex: typeof import('katex').default) {
    const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]/g;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('pre, code, script, style, .katex')) return NodeFilter.FILTER_REJECT;
        return (node.textContent || '').match(pattern) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      const text = node.textContent || '';
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const index = match.index || 0;
        if (index > cursor) fragment.append(document.createTextNode(text.slice(cursor, index)));
        const source = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
        fragment.append(mathNodeFor(source, Boolean(match[1] || match[4]), katex));
        cursor = index + match[0].length;
      }
      if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
      node.replaceWith(fragment);
    }
  }

  async function enhanceMarkdown() {
    if (!articleBody) return;
    articleBody.querySelectorAll('img').forEach((image) => {
      image.addEventListener('click', () => (previewImage = (image as HTMLImageElement).src));
    });

    try {
      const plantUmlBlocks = [...articleBody.querySelectorAll('pre code.language-plantuml')] as HTMLElement[];
      for (const block of plantUmlBlocks) {
        const figure = document.createElement('figure');
        figure.className = 'plantuml-figure';
        const image = document.createElement('img');
        image.loading = 'lazy';
        image.alt = 'PlantUML 图表';
        image.src = renderPlantUml(block.textContent || '');
        image.addEventListener('click', () => (previewImage = image.src));
        figure.append(image);
        block.parentElement?.replaceWith(figure);
      }

      const codeBlocks = [...articleBody.querySelectorAll('pre code')] as HTMLElement[];
      if (codeBlocks.length) {
        const hljs = (await import('highlight.js')).default;
        for (const block of codeBlocks) {
          if (block.classList.contains('language-mermaid')) continue;
          const language = [...block.classList].find((name) => name.startsWith('language-'))?.slice(9);
          const result = language && hljs.getLanguage(language)
            ? hljs.highlight(block.textContent || '', { language })
            : hljs.highlightAuto(block.textContent || '');
          block.innerHTML = result.value;
          block.classList.add('hljs');
        }
      }

      const mermaidBlocks = [...articleBody.querySelectorAll('pre code.language-mermaid')] as HTMLElement[];
      if (mermaidBlocks.length) {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: document.documentElement.dataset.theme === 'light' ? 'neutral' : 'dark' });
        for (const block of mermaidBlocks) {
          const container = document.createElement('div');
          container.className = 'mermaid';
          container.textContent = block.textContent || '';
          block.parentElement?.replaceWith(container);
        }
        await mermaid.run({ nodes: articleBody.querySelectorAll('.mermaid') });
      }

      try {
        const katex = (await import('katex')).default;
        renderMathInText(articleBody, katex);
      } catch {}
    } catch (cause) {
      console.warn('Markdown enhancement failed', cause);
    }

    articleBody.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.code-copy')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.textContent = '复制';
      button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || pre.textContent || '');
        button.textContent = '已复制';
        setTimeout(() => (button.textContent = '复制'), 1400);
      });
      pre.append(button);
    });
  }

  async function submitComment(event: SubmitEvent) {
    event.preventDefault();
    if (!article || !commentForm.content.trim()) return;
    submitting = true;
    commentStatus = '';
    try {
      await api(`/api/articles/${article.id}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentForm)
      });
      commentStatus = '留言已进入审核，通过后会显示在文章下方。';
      commentForm = { nickname: '', content: '' };
    } catch (cause) {
      commentStatus = cause instanceof Error ? cause.message : '留言提交失败';
    } finally {
      submitting = false;
    }
  }

  async function share() {
    const payload = { title: article?.title || document.title, url: location.href };
    if (navigator.share) {
      await navigator.share(payload).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(location.href);
    copied = true;
    setTimeout(() => (copied = false), 1400);
  }

  function tocFromHtml(html = '') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('h2, h3')].map((heading, index) => ({
      id: heading.id || `heading-${index}`,
      text: heading.textContent || '',
      level: heading.tagName === 'H2' ? 2 : 3
    }));
  }

  onMount(() => {
    load();
    return initReadingProgress();
  });
</script>

<svelte:head>
  <meta name="description" content={article?.excerpt || 'CrossPilot 文章详情'} />
</svelte:head>

{#if loading}
  <div class="cp-loading">正在打开文章</div>
{:else if error}
  <div class="cp-empty">{error}</div>
{:else if article}
  <div class="reading-progress" style={`--progress:${progress}%`}></div>
  <div class="detail-actions">
    <a class="cp-button secondary" href="/articles"><ArrowLeft size={13} />返回文章</a>
    <a class="cp-button secondary" href={`/studio?edit=${article.id}`}>编辑本文</a>
    <button class="cp-button secondary" type="button" onclick={() => (immersive = !immersive)} class:active={immersive}><Focus size={13} />沉浸阅读</button>
    <button class="cp-button secondary" type="button" onclick={share}>
      {#if copied}<Check size={13} />链接已复制{:else}<Share2 size={13} />分享{/if}
    </button>
  </div>

  <div class:immersive class="article-layout">
    <article class="reading-shell cp-card">
      {#if article.cover_image}
        <button class="reading-cover" type="button" onclick={() => (previewImage = article?.cover_image || '')}>
          <img src={article.cover_image} alt="" />
        </button>
      {/if}

      <header class="reading-head">
        <div class="meta-top">
          <a class="cp-kicker" href={`/categories?category=${encodeURIComponent(article.category)}`}>{article.category}</a>
          {#if article.featured}<span class="cp-badge accent">置顶文章</span>{/if}
        </div>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
        <div class="meta">
          <span><CalendarDays size={13} />{formatDate(article.updated_at)}</span>
          <span><Clock3 size={13} />{article.reading_minutes || 1} 分钟阅读</span>
          <span><Eye size={13} />{formatNumber(article.views)} 次查看</span>
          <span><MessageSquare size={13} />{article.comment_count || 0} 条评论</span>
        </div>
      </header>

      <div class="reading-grid">
        <aside class="toc">
          <strong><ListTree size={14} />目录</strong>
          {#each tocFromHtml(article.html) as item}
            <a class:sub={item.level === 3} href={`#${item.id}`}>{item.text}</a>
          {/each}
        </aside>
        <div class="markdown-body" bind:this={articleBody}>{@html article.html || ''}</div>
      </div>

      <footer class="reading-foot">
        <div class="tags">
          {#each splitTags(article.tags) as tag}<a href={`/tags?tag=${encodeURIComponent(tag)}`}>#{tag}</a>{/each}
        </div>
        <div class="license"><ShieldCheck size={14} /><span>本文采用 MIT 许可，请在转载时保留来源链接。</span></div>
      </footer>
    </article>

    {#if article.relationships}
      <aside class="reading-aside">
        {#if article.relationships.series}
          <section class="cp-card aside-card">
            <span class="cp-kicker">series</span>
            <h2>{article.relationships.series.name}</h2>
            <p>{article.relationships.series.description}</p>
            <div class="series-nav">
              {#if article.relationships.prev}
                <a href={`/articles/${encodeURIComponent(article.relationships.prev.slug)}`}><ArrowLeft size={12} />{article.relationships.prev.title}</a>
              {/if}
              {#if article.relationships.next}
                <a href={`/articles/${encodeURIComponent(article.relationships.next.slug)}`}>{article.relationships.next.title}<ArrowRight size={12} /></a>
              {/if}
            </div>
          </section>
        {/if}
        {#if article.relationships.related?.length}
          <section class="cp-card aside-card">
            <span class="cp-kicker">related</span>
            <h2>相关文章</h2>
            {#each article.relationships.related as related}
              <a class="aside-link" href={`/articles/${encodeURIComponent(related.slug)}`}><BookOpen size={13} /><span>{related.title}</span></a>
            {/each}
          </section>
        {/if}
        {#if article.relationships.previous || article.relationships.nextArticle}
          <section class="cp-card aside-card">
            <span class="cp-kicker">reading path</span>
            <h2>上一篇 / 下一篇</h2>
            <div class="series-nav">
              {#if article.relationships.previous}
                <a href={`/articles/${encodeURIComponent(article.relationships.previous.slug)}`}><ArrowLeft size={12} />{article.relationships.previous.title}</a>
              {/if}
              {#if article.relationships.nextArticle}
                <a href={`/articles/${encodeURIComponent(article.relationships.nextArticle.slug)}`}>{article.relationships.nextArticle.title}<ArrowRight size={12} /></a>
              {/if}
            </div>
          </section>
        {/if}
        {#if article.relationships.random?.length}
          <section class="cp-card aside-card">
            <span class="cp-kicker">random</span>
            <h2>随机推荐</h2>
            {#each article.relationships.random as item}
              <a class="aside-link" href={`/articles/${encodeURIComponent(item.slug)}`}><BookOpen size={13} /><span>{item.title}</span></a>
            {/each}
          </section>
        {/if}
      </aside>
    {/if}
  </div>

  <section class="comments cp-card" id="comments">
    <div class="comments-head">
      <div><span class="cp-kicker">discussion</span><h2>评论区</h2></div>
      <a class="cp-button secondary" href="#comment-form">写下留言</a>
    </div>
    {#if comments.length}
      <div class="comment-list">
        {#each comments as comment (comment.id)}
          <article class="comment">
            <header><strong>{comment.nickname}</strong><time>{formatDate(comment.created_at)}</time></header>
            <p>{comment.content}</p>
            {#if comment.replies?.length}
              <div class="replies">
                {#each comment.replies as reply (reply.id)}
                  <article>
                    <header><strong>{reply.nickname}</strong><time>{formatDate(reply.created_at)}</time></header>
                    <p>{reply.content}</p>
                  </article>
                {/each}
              </div>
            {/if}
          </article>
        {/each}
      </div>
    {:else}
      <div class="cp-empty">还没有已公开的留言。</div>
    {/if}

    <form class="comment-form" id="comment-form" onsubmit={submitComment}>
      <label class="cp-label">昵称<input class="cp-field" bind:value={commentForm.nickname} maxlength="40" placeholder="匿名访客" /></label>
      <label class="cp-label">留言<textarea class="cp-field cp-scroll" bind:value={commentForm.content} maxlength="2000" rows="5" required placeholder="说明问题、建议或补充信息"></textarea></label>
      <div class="comment-actions">
        <span>{commentStatus}</span>
        <button class="cp-button" type="submit" disabled={submitting}><Send size={13} />{submitting ? '提交中' : '提交留言'}</button>
      </div>
    </form>
  </section>
{/if}

{#if previewImage}
  <div class="image-preview" role="dialog" aria-modal="true" aria-label="图片预览" onclick={() => (previewImage = '')}>
    <button type="button" onclick={() => (previewImage = '')} aria-label="关闭预览"><X size={20} /></button>
    <img src={previewImage} alt="" />
  </div>
{/if}

<style>
  .reading-progress {
    background: var(--cp-accent);
    height: 2px;
    left: 0;
    position: fixed;
    top: 63px;
    transform: scaleX(calc(var(--progress) / 100));
    transform-origin: left;
    width: 100%;
    z-index: 70;
  }

  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: flex-end;
    margin: 24px 0 12px;
  }

  .detail-actions .active {
    background: var(--cp-accent-soft);
    color: var(--cp-accent);
  }

  .article-layout {
    align-items: start;
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  .article-layout.immersive {
    grid-template-columns: 1fr;
  }

  .article-layout.immersive .reading-aside {
    display: none;
  }

  .reading-shell {
    overflow: hidden;
  }

  .reading-cover {
    background: transparent;
    border: 0;
    cursor: zoom-in;
    display: block;
    height: clamp(250px, 37vw, 510px);
    overflow: hidden;
    padding: 0;
    width: 100%;
  }

  .reading-cover img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .reading-head {
    margin: 0 auto;
    max-width: 860px;
    padding: clamp(30px, 5vw, 62px) clamp(22px, 5vw, 58px) 24px;
    text-align: center;
  }

  .meta-top {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .reading-head h1 {
    font-size: clamp(31px, 4.8vw, 56px);
    line-height: 1.15;
    margin: 12px 0 14px;
  }

  .reading-head > p {
    color: var(--cp-text-soft);
    font-size: 14px;
    line-height: 1.75;
    margin: 0 auto 17px;
    max-width: 700px;
  }

  .meta {
    color: var(--cp-text-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 9px;
    gap: 12px;
    justify-content: center;
  }

  .meta span {
    align-items: center;
    display: inline-flex;
    gap: 5px;
  }

  .reading-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: 180px minmax(0, 820px);
    justify-content: center;
    margin: 0 auto;
    padding: 8px clamp(20px, 5vw, 56px) 46px;
  }

  .toc {
    align-self: start;
    display: grid;
    gap: 6px;
    position: sticky;
    top: 92px;
  }

  .toc strong {
    align-items: center;
    color: var(--cp-text);
    display: flex;
    font-size: 10px;
    gap: 6px;
    margin-bottom: 4px;
  }

  .toc a {
    border-left: 1px solid var(--cp-line);
    color: var(--cp-text-muted);
    font-size: 9px;
    line-height: 1.45;
    padding: 3px 0 3px 9px;
    text-decoration: none;
  }

  .toc a:hover {
    border-left-color: var(--cp-accent);
    color: var(--cp-accent);
  }

  .toc a.sub {
    padding-left: 17px;
  }

  .reading-foot {
    align-items: center;
    border-top: 1px solid var(--cp-line);
    display: flex;
    gap: 16px;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 920px;
    padding: 20px clamp(20px, 5vw, 56px) 28px;
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
    font-size: 9px;
    padding: 4px 8px;
    text-decoration: none;
  }

  .license {
    align-items: center;
    color: var(--cp-text-muted);
    display: flex;
    font-size: 8px;
    gap: 6px;
  }

  .reading-aside {
    display: grid;
    gap: 12px;
    position: sticky;
    top: 88px;
  }

  .aside-card {
    display: grid;
    gap: 8px;
    padding: 15px;
  }

  .aside-card h2 {
    font-size: 14px;
    margin: 0;
  }

  .aside-card p {
    color: var(--cp-text-soft);
    font-size: 9px;
    line-height: 1.55;
    margin: 0;
  }

  .series-nav {
    display: grid;
    gap: 5px;
  }

  .series-nav a,
  .aside-link {
    align-items: center;
    color: var(--cp-text-soft);
    display: flex;
    font-size: 9px;
    gap: 6px;
    text-decoration: none;
  }

  .series-nav a:hover,
  .aside-link:hover {
    color: var(--cp-accent);
  }

  .aside-link span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.markdown-body .code-copy) {
    background: var(--cp-surface-strong);
    border: 1px solid var(--cp-line);
    border-radius: 5px;
    color: var(--cp-text-soft);
    cursor: pointer;
    font-size: 8px;
    padding: 4px 7px;
    position: absolute;
    right: 8px;
    top: 8px;
  }

  :global(.markdown-body table) {
    scrollbar-color: color-mix(in srgb, var(--cp-accent) 38%, transparent) transparent;
    scrollbar-width: thin;
  }

  :global(.markdown-body pre) {
    scrollbar-color: color-mix(in srgb, var(--cp-accent) 38%, transparent) transparent;
    scrollbar-width: thin;
  }

  :global(.markdown-body .mermaid) {
    background: color-mix(in srgb, var(--cp-bg) 82%, #000);
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    margin: 1.6em 0;
    max-width: 100%;
    overflow-x: auto;
    padding: 16px;
  }

  :global(.markdown-body .plantuml-figure) {
    margin: 1.6em 0;
  }

  :global(.markdown-body .plantuml-figure img) {
    background: white;
    padding: 12px;
  }

  :global(.markdown-body .math-display) {
    margin: 1.4em 0;
    max-width: 100%;
    overflow-x: auto;
    padding: 4px 0;
  }

  :global(.markdown-body .math-inline .katex) {
    color: var(--cp-text);
    font-size: 1em;
  }

  .comments {
    margin-top: 22px;
    padding: clamp(18px, 3vw, 30px);
  }

  .comments-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .comments-head h2 {
    font-size: 20px;
    margin: 3px 0 0;
  }

  .comment-list {
    display: grid;
    gap: 10px;
  }

  .comment {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    padding: 13px;
  }

  .comment header {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  .comment header strong {
    font-size: 10px;
  }

  .comment time {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .comment p {
    color: var(--cp-text-soft);
    font-size: 11px;
    line-height: 1.7;
    margin: 7px 0 0;
  }

  .replies {
    border-left: 2px solid var(--cp-line-strong);
    display: grid;
    gap: 8px;
    margin: 11px 0 0 14px;
    padding-left: 11px;
  }

  .comment-form {
    border-top: 1px solid var(--cp-line);
    display: grid;
    gap: 10px;
    margin-top: 20px;
    padding-top: 18px;
  }

  .comment-actions {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  .comment-actions span {
    color: var(--cp-text-soft);
    font-size: 9px;
  }

  .image-preview {
    align-items: center;
    background: rgba(0, 0, 0, 0.88);
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 28px;
    position: fixed;
    z-index: 200;
  }

  .image-preview img {
    max-height: 92vh;
    max-width: 94vw;
    object-fit: contain;
  }

  .image-preview button {
    align-items: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 7px;
    color: white;
    cursor: pointer;
    display: flex;
    height: 38px;
    justify-content: center;
    position: absolute;
    right: 20px;
    top: 20px;
    width: 38px;
  }

  @media (max-width: 1100px) {
    .article-layout {
      grid-template-columns: 1fr;
    }

    .reading-aside {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      position: static;
    }
  }

  @media (max-width: 760px) {
    .reading-grid {
      grid-template-columns: 1fr;
    }

    .toc {
      display: none;
    }

    .reading-foot,
    .comment-actions {
      align-items: flex-start;
      flex-direction: column;
    }

    .reading-aside {
      grid-template-columns: 1fr;
    }
  }
</style>
