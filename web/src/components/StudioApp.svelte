<script lang="ts">
  import { onMount, tick } from 'svelte';
  import {
    BookOpen,
    Check,
    Clock3,
    Edit3,
    FilePlus2,
    Image as ImageIcon,
    MessageSquare,
    Save,
    Send,
    Settings2,
    ShieldCheck,
    Trash2,
    X
  } from 'lucide-svelte';
  import { api, formatDate, formatNumber } from '../lib/api';
  import type { Article, ArticleStats, CommentItem, ContentEntry } from '../lib/types';
  import Select from './Select.svelte';
  import UploadButton from './UploadButton.svelte';
  import MarkdownEditor from './MarkdownEditor.svelte';

  type Tab = 'articles' | 'comments' | 'media' | 'structured';
  type MediaItem = {
    id: number;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    created_at: string;
  };
  const contentTypeOptions = [
    { value: 'dynamic', label: '运营动态' },
    { value: 'project', label: '案例项目' },
    { value: 'gallery', label: '证据相册' },
    { value: 'resource', label: '资源导航' },
    { value: 'guestbook', label: '反馈留言' },
    { value: 'about', label: '关于页面' }
  ];

  let tab: Tab = 'articles';
  let articles: Article[] = [];
  let stats: ArticleStats | null = null;
  let comments: CommentItem[] = [];
  let media: MediaItem[] = [];
  let structured: ContentEntry[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let notice = '';
  let preview = '';
  let editingId: number | null = null;
  let form = blankForm();
  let initialEdit: string | null = null;
  let editingContentId: number | null = null;
  let contentForm = blankContentForm();

  function blankForm() {
    return {
      title: '',
      slug: '',
      category: '运营复盘',
      tags: '',
      excerpt: '',
      contentMd: '## 背景\n\n写下问题发生的场景。\n\n## 处理过程\n\n1. 第一步\n2. 第二步\n\n## 结论\n\n记录判断标准和结果。',
      coverImage: '',
      status: 'draft' as 'draft' | 'published',
      featured: false,
      publishAt: ''
    };
  }

  function blankContentForm() {
    return {
      type: 'dynamic',
      slug: '',
      title: '',
      summary: '',
      contentMd: '',
      coverImage: '',
      metadataText: '{}',
      status: 'published' as 'draft' | 'published',
      featured: false,
      publishedAt: ''
    };
  }

  function toLocalDateTime(value = '') {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  async function load() {
    loading = true;
    error = '';
    try {
      const [articleData, mediaData, commentData, structuredData] = await Promise.all([
        api<{ items: Article[]; stats: ArticleStats }>('/api/articles?status=all&limit=500'),
        api<{ items: MediaItem[] }>('/api/media?limit=200'),
        api<{ items: CommentItem[] }>('/api/comments?status=all&limit=300'),
        api<{ items: ContentEntry[] }>('/api/content?status=all&limit=200')
      ]);
      articles = articleData.items || [];
      stats = articleData.stats;
      media = mediaData.items || [];
      comments = commentData.items || [];
      structured = structuredData.items || [];
      if (initialEdit) {
        const target = articles.find((item) => item.id === Number(initialEdit));
        if (target) selectArticle(target);
        initialEdit = null;
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '内容后台加载失败';
    } finally {
      loading = false;
    }
  }

  function selectArticle(article: Article) {
    editingId = article.id;
    form = {
      title: article.title,
      slug: article.slug,
      category: article.category,
      tags: article.tags,
      excerpt: article.excerpt,
      contentMd: article.content_md,
      coverImage: article.cover_image,
      status: article.status,
      featured: Boolean(article.featured),
      publishAt: toLocalDateTime((article as Article & { publish_at?: string }).publish_at)
    };
    preview = article.html || '';
    tab = 'articles';
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function newArticle() {
    editingId = null;
    form = blankForm();
    preview = '';
    tab = 'articles';
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectContent(item: ContentEntry) {
    editingContentId = item.id;
    contentForm = {
      type: item.type,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      contentMd: item.content_md,
      coverImage: item.cover_image,
      metadataText: JSON.stringify(item.metadata || {}, null, 2),
      status: item.status,
      featured: Boolean(item.featured),
      publishedAt: toLocalDateTime(item.published_at)
    };
    tab = 'structured';
  }

  function newContent(type = 'dynamic') {
    editingContentId = null;
    contentForm = { ...blankContentForm(), type };
    tab = 'structured';
  }

  async function refreshPreview() {
    const result = await api<{ html: string }>('/api/articles/preview', {
      method: 'POST',
      body: JSON.stringify({ markdown: form.contentMd })
    });
    preview = result.html;
  }

  async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile(file: File, target: 'cover' | 'body') {
    if (file.size > 5 * 1024 * 1024) throw new Error('图片不能超过 5 MB');
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
      throw new Error('仅支持 PNG、JPG、WebP、GIF 或 AVIF 图片');
    }
    notice = '正在上传图片';
    const contentBase64 = await fileToBase64(file);
    const uploaded = await api<{ url: string }>('/api/uploads', {
      method: 'POST',
      body: JSON.stringify({ contentBase64, mimeType: file.type, articleId: editingId })
    });
    if (target === 'cover') form.coverImage = uploaded.url;
    else form.contentMd = `${form.contentMd}\n\n![运营截图](${uploaded.url})\n`;
    const mediaData = await api<{ items: MediaItem[] }>('/api/media?limit=200');
    media = mediaData.items || [];
    notice = '图片已上传';
  }

  async function uploadContentCover(file: File) {
    if (file.size > 5 * 1024 * 1024) throw new Error('图片不能超过 5 MB');
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(file.type)) {
      throw new Error('仅支持 PNG、JPG、WebP、GIF 或 AVIF 图片');
    }
    notice = '正在上传封面';
    const contentBase64 = await fileToBase64(file);
    const uploaded = await api<{ url: string }>('/api/uploads', {
      method: 'POST',
      body: JSON.stringify({ contentBase64, mimeType: file.type, articleId: null })
    });
    contentForm.coverImage = uploaded.url;
    const mediaData = await api<{ items: MediaItem[] }>('/api/media?limit=200');
    media = mediaData.items || [];
    notice = '封面已上传';
  }

  async function saveArticle(event?: SubmitEvent) {
    event?.preventDefault();
    if (!form.title.trim() || !form.contentMd.trim()) {
      error = '标题和正文不能为空';
      return;
    }
    saving = true;
    error = '';
    notice = '';
    try {
      const payload = {
        ...form,
        publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : ''
      };
      const saved = await api<Article>(editingId ? `/api/articles/${editingId}` : '/api/articles', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });
      editingId = saved.id;
      notice = saved.status === 'published' ? '文章已发布' : '草稿已保存';
      await load();
      const target = articles.find((item) => item.id === saved.id);
      if (target) selectArticle(target);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '文章保存失败';
    } finally {
      saving = false;
    }
  }

  async function removeArticle(article: Article) {
    if (!confirm(`确定删除“${article.title}”吗？`)) return;
    await api(`/api/articles/${article.id}`, { method: 'DELETE' });
    if (editingId === article.id) newArticle();
    await load();
    notice = '文章已删除';
  }

  async function saveContent(event?: SubmitEvent) {
    event?.preventDefault();
    if (!contentForm.title.trim()) {
      error = '内容标题不能为空';
      return;
    }
    saving = true;
    error = '';
    notice = '';
    try {
      let metadata: Record<string, unknown>;
      try {
        metadata = JSON.parse(contentForm.metadataText || '{}');
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new Error();
      } catch {
        throw new Error('扩展数据必须是有效 JSON 对象');
      }
      const payload = {
        ...contentForm,
        metadata,
        publishedAt: contentForm.publishedAt ? new Date(contentForm.publishedAt).toISOString() : new Date().toISOString()
      };
      delete (payload as Record<string, unknown>).metadataText;
      const saved = await api<ContentEntry>(
        editingContentId
          ? `/api/content/${encodeURIComponent(contentForm.type)}/${editingContentId}`
          : '/api/content',
        {
          method: editingContentId ? 'PATCH' : 'POST',
          body: JSON.stringify(payload)
        }
      );
      editingContentId = saved.id;
      notice = saved.status === 'published' ? '内容已发布' : '内容草稿已保存';
      await load();
      const target = structured.find((item) => item.id === saved.id);
      if (target) selectContent(target);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : '内容保存失败';
    } finally {
      saving = false;
    }
  }

  async function removeContent(item: ContentEntry) {
    if (!confirm(`确定删除“${item.title}”吗？`)) return;
    await api(`/api/content/${encodeURIComponent(item.type)}/${item.id}`, { method: 'DELETE' });
    if (editingContentId === item.id) newContent(item.type);
    await load();
    notice = '内容已删除';
  }

  async function moderateComment(comment: CommentItem, status: 'approved' | 'rejected') {
    await api(`/api/comments/${comment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await load();
    notice = status === 'approved' ? '留言已通过' : '留言已拒绝';
  }

  async function removeComment(comment: CommentItem) {
    if (!confirm('确定删除这条留言吗？')) return;
    await api(`/api/comments/${comment.id}`, { method: 'DELETE' });
    await load();
    notice = '留言已删除';
  }

  onMount(async () => {
    initialEdit = new URLSearchParams(location.search).get('edit');
    await load();
    if (!editingId && articles.length) selectArticle(articles[0]);
    await tick();
  });
</script>

<header class="studio-head cp-card">
  <div>
    <span class="cp-kicker">content studio</span>
    <h1 class="cp-title">内容后台</h1>
    <p class="cp-subtitle">统一维护文章、分类、标签、系列、评论和媒体库；正文使用 CodeMirror Markdown 编辑器并支持拖拽、粘贴上传。</p>
  </div>
  <button class="cp-button" type="button" onclick={newArticle}><FilePlus2 size={14} />新建文章</button>
</header>

<div class="studio-stats">
  <div class="cp-card"><BookOpen size={17} /><span>全部内容</span><strong>{stats?.total || 0}</strong></div>
  <div class="cp-card"><Send size={17} /><span>已发布</span><strong>{stats?.published || 0}</strong></div>
  <div class="cp-card"><Edit3 size={17} /><span>草稿</span><strong>{stats?.drafts || 0}</strong></div>
  <div class="cp-card"><MessageSquare size={17} /><span>待审核</span><strong>{stats?.comments?.pending || 0}</strong></div>
</div>

<nav class="studio-tabs" aria-label="内容后台模块">
  <button type="button" class:active={tab === 'articles'} onclick={() => (tab = 'articles')}><BookOpen size={14} />文章</button>
  <button type="button" class:active={tab === 'comments'} onclick={() => (tab = 'comments')}><MessageSquare size={14} />评论审核</button>
  <button type="button" class:active={tab === 'media'} onclick={() => (tab = 'media')}><ImageIcon size={14} />媒体库</button>
  <button type="button" class:active={tab === 'structured'} onclick={() => (tab = 'structured')}><Settings2 size={14} />内容模块</button>
</nav>

{#if loading}
  <div class="cp-loading">正在加载内容后台</div>
{:else}
  {#if notice}<div class="notice"><Check size={13} />{notice}</div>{/if}
  {#if error}<div class="error"><X size={13} />{error}</div>{/if}

  {#if tab === 'articles'}
    <div class="studio-layout">
      <aside class="article-list cp-card cp-scroll">
        <header><strong>文章清单</strong><span>{articles.length}</span></header>
        {#each articles as article (article.id)}
          <article class:active={editingId === article.id}>
            <button type="button" class="article-select" onclick={() => selectArticle(article)}>
              <span class:published={article.status === 'published'} class="dot"></span>
              <span><strong>{article.title}</strong><small>{article.category} · {formatDate(article.updated_at)}</small></span>
            </button>
            <button class="delete" type="button" title="删除文章" aria-label={`删除 ${article.title}`} onclick={() => removeArticle(article)}><Trash2 size={13} /></button>
          </article>
        {/each}
      </aside>

      <form class="editor-panel cp-card" onsubmit={saveArticle}>
        <div class="editor-heading">
          <div><span class="cp-kicker">{editingId ? 'edit article' : 'new article'}</span><h2>{editingId ? '编辑文章' : '新建文章'}</h2></div>
          <div class="editor-actions">
            <button class="cp-button secondary" type="button" onclick={refreshPreview}>刷新预览</button>
            <button class="cp-button" type="submit" disabled={saving}><Save size={13} />{saving ? '保存中' : '保存文章'}</button>
          </div>
        </div>

        <div class="meta-form">
          <label class="cp-label span-2">文章标题<input class="cp-field" bind:value={form.title} maxlength="160" required /></label>
          <label class="cp-label">URL 标识<input class="cp-field" bind:value={form.slug} maxlength="80" placeholder="留空自动生成" /></label>
          <label class="cp-label">分类<input class="cp-field" bind:value={form.category} list="category-options" maxlength="50" /><datalist id="category-options">{#each stats?.categories || [] as item}<option value={item.name}></option>{/each}</datalist></label>
          <label class="cp-label">标签<input class="cp-field" bind:value={form.tags} placeholder="用逗号分隔" /></label>
          <div class="cp-label">发布状态<Select value={form.status} options={[{ value: 'draft', label: '草稿' }, { value: 'published', label: '已发布' }]} onchange={(next) => (form.status = next as 'draft' | 'published')} /></div>
          <label class="cp-label">定时发布<input class="cp-field" type="datetime-local" bind:value={form.publishAt} /></label>
          <label class="featured"><input type="checkbox" bind:checked={form.featured} /><span>设为主页置顶文章</span></label>
          <label class="cp-label span-2">摘要<textarea class="cp-field cp-scroll" bind:value={form.excerpt} rows="3" maxlength="320"></textarea></label>
        </div>

        <div class="cover-row">
          <div class="cover-preview">
            {#if form.coverImage}<img src={form.coverImage} alt="" />{:else}<ImageIcon size={24} /><span>文章封面</span>{/if}
          </div>
          <div>
            <strong>封面设置</strong>
            <p>支持 PNG、JPG、WebP、GIF、AVIF，最大 5 MB。</p>
            <UploadButton label="上传封面" onupload={(file) => uploadFile(file, 'cover')} />
            {#if form.coverImage}<button class="cp-button danger" type="button" onclick={() => (form.coverImage = '')}><Trash2 size={13} />清空封面</button>{/if}
          </div>
        </div>

        <MarkdownEditor
          value={form.contentMd}
          preview={preview}
          onchange={(next) => (form.contentMd = next)}
          onupload={(file) => uploadFile(file, 'body')}
          onpreview={refreshPreview}
        />
      </form>
    </div>
  {:else if tab === 'comments'}
    <section class="comments-panel cp-card">
      <header><div><span class="cp-kicker">moderation</span><h2>评论审核</h2></div><span class="cp-badge">{comments.filter((item) => item.status === 'pending').length} 待审核</span></header>
      {#if comments.length}
        <div class="comment-list">
          {#each comments as comment (comment.id)}
            <article>
              <div>
                <span class="cp-badge" class:warning={comment.status === 'pending'}>{comment.status === 'approved' ? '已通过' : comment.status === 'pending' ? '待审核' : '已拒绝'}</span>
                <strong>{comment.nickname}</strong>
                <small>{(comment as CommentItem & { article_title?: string }).article_title || '文章'} · {formatDate(comment.created_at)}</small>
                <p>{comment.content}</p>
              </div>
              <div class="comment-actions">
                {#if comment.status !== 'approved'}<button class="cp-button secondary" type="button" onclick={() => moderateComment(comment, 'approved')}><Check size={12} />通过</button>{/if}
                {#if comment.status !== 'rejected'}<button class="cp-button secondary" type="button" onclick={() => moderateComment(comment, 'rejected')}>拒绝</button>{/if}
                <button class="cp-button danger" type="button" onclick={() => removeComment(comment)}><Trash2 size={12} />删除</button>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="cp-empty">还没有评论。</div>
      {/if}
    </section>
  {:else if tab === 'media'}
    <section class="media-panel cp-card">
      <header><div><span class="cp-kicker">media library</span><h2>媒体库</h2></div><span class="cp-badge">{media.length} 个文件</span></header>
      <div class="media-grid">
        {#each media as item (item.id)}
          <article>
            <img src={item.url} alt="" loading="lazy" />
            <div><strong>{item.filename}</strong><small>{formatNumber(item.size / 1024, 1)} KB · {formatDate(item.created_at)}</small></div>
            <button class="cp-button secondary" type="button" onclick={() => navigator.clipboard.writeText(`${location.origin}${item.url}`)}>复制地址</button>
          </article>
        {/each}
      </div>
      {#if !media.length}<div class="cp-empty">还没有上传图片。</div>{/if}
    </section>
  {:else}
    <section class="structured-panel cp-card">
      <header>
        <div><span class="cp-kicker">structured content</span><h2>内容模块</h2></div>
        <div class="structured-head-actions">
          <span class="cp-badge">{structured.length} 条</span>
          <button class="cp-button" type="button" onclick={() => newContent()}><FilePlus2 size={13} />新建内容</button>
        </div>
      </header>
      <div class="structured-layout">
        <aside class="structured-list cp-scroll">
          {#each structured as item (item.id)}
            <article class:active={editingContentId === item.id}>
              <button type="button" class="structured-select" onclick={() => selectContent(item)}>
                <span class="cp-badge">{contentTypeOptions.find((option) => option.value === item.type)?.label || item.type}</span>
                <span><strong>{item.title}</strong><small>{item.summary || '暂无摘要'}</small></span>
              </button>
              <button class="delete" type="button" title="删除内容" aria-label={`删除 ${item.title}`} onclick={() => removeContent(item)}><Trash2 size={13} /></button>
            </article>
          {:else}
            <div class="cp-empty">还没有结构化内容。</div>
          {/each}
        </aside>

        <form class="structured-editor" onsubmit={saveContent}>
          <div class="editor-heading">
            <div><span class="cp-kicker">{editingContentId ? 'edit module' : 'new module'}</span><h3>{editingContentId ? '编辑内容' : '新建内容'}</h3></div>
            <button class="cp-button" type="submit" disabled={saving}><Save size={13} />{saving ? '保存中' : '保存内容'}</button>
          </div>
          <div class="structured-form">
            <div class="cp-label">内容类型
              {#if editingContentId}
                <input class="cp-field" value={contentTypeOptions.find((option) => option.value === contentForm.type)?.label || contentForm.type} readonly />
              {:else}
                <Select value={contentForm.type} options={contentTypeOptions} label="内容类型" onchange={(next) => (contentForm.type = next)} />
              {/if}
            </div>
            <div class="cp-label">发布状态
              <Select value={contentForm.status} options={[{ value: 'draft', label: '草稿' }, { value: 'published', label: '已发布' }]} label="发布状态" onchange={(next) => (contentForm.status = next as 'draft' | 'published')} />
            </div>
            <label class="cp-label">标题<input class="cp-field" bind:value={contentForm.title} maxlength="160" required /></label>
            <label class="cp-label">URL 标识<input class="cp-field" bind:value={contentForm.slug} maxlength="80" placeholder="留空自动生成" /></label>
            <label class="cp-label span-2">摘要<textarea class="cp-field cp-scroll" bind:value={contentForm.summary} maxlength="500" rows="3"></textarea></label>
            <label class="cp-label span-2">正文 Markdown<textarea class="cp-field cp-scroll structured-markdown" bind:value={contentForm.contentMd} rows="10"></textarea></label>
            <label class="cp-label span-2">封面图片<input class="cp-field" bind:value={contentForm.coverImage} placeholder="/uploads/... 或 https://..." /></label>
            <div class="structured-cover-actions span-2">
              {#if contentForm.coverImage}<img src={contentForm.coverImage} alt="" />{/if}
              <UploadButton label="上传封面" onupload={uploadContentCover} />
              <span>图片会在保存内容时写入封面字段。</span>
            </div>
            <label class="cp-label span-2">扩展数据（JSON）
              <textarea class="cp-field cp-scroll structured-metadata" bind:value={contentForm.metadataText} rows="6" spellcheck="false" placeholder={'{"location":"Europe","images":[],"links":[]}'}></textarea>
            </label>
            <label class="featured span-2"><input type="checkbox" bind:checked={contentForm.featured} /><span>设为精选内容</span></label>
          </div>
        </form>
      </div>
    </section>
  {/if}
{/if}

<style>
  .studio-head {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 28px 0 14px;
    padding: clamp(21px, 3vw, 34px);
  }

  .studio-stats {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 14px;
  }

  .studio-stats > div {
    align-items: center;
    color: var(--cp-accent);
    display: grid;
    gap: 3px 9px;
    grid-template-columns: auto 1fr;
    padding: 13px;
  }

  .studio-stats span {
    color: var(--cp-text-muted);
    font-size: 9px;
  }

  .studio-stats strong {
    color: var(--cp-text);
    font-size: 19px;
    grid-column: 2;
  }

  .studio-tabs {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    display: flex;
    gap: 3px;
    margin-bottom: 14px;
    padding: 4px;
  }

  .studio-tabs button {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: var(--cp-text-soft);
    cursor: pointer;
    display: inline-flex;
    font-size: 10px;
    font-weight: 760;
    gap: 6px;
    min-height: 34px;
    padding: 7px 11px;
  }

  .studio-tabs button.active {
    background: var(--cp-accent-soft);
    color: var(--cp-accent);
  }

  .notice,
  .error {
    align-items: center;
    border-radius: 7px;
    display: flex;
    font-size: 10px;
    gap: 7px;
    margin-bottom: 12px;
    padding: 10px 12px;
  }

  .notice {
    background: color-mix(in srgb, var(--cp-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--cp-success) 28%, transparent);
    color: var(--cp-success);
  }

  .error {
    background: color-mix(in srgb, var(--cp-danger) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--cp-danger) 28%, transparent);
    color: var(--cp-danger);
  }

  .studio-layout {
    align-items: start;
    display: grid;
    gap: 14px;
    grid-template-columns: 290px minmax(0, 1fr);
  }

  .article-list {
    max-height: calc(100vh - 210px);
    overflow: auto;
    position: sticky;
    top: 82px;
  }

  .article-list > header,
  .comments-panel > header,
  .media-panel > header,
  .structured-panel > header {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    display: flex;
    justify-content: space-between;
    padding: 13px 14px;
  }

  .article-list > header strong {
    font-size: 11px;
  }

  .article-list > header span {
    color: var(--cp-text-muted);
    font-size: 9px;
  }

  .article-list article {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .article-list article.active {
    background: var(--cp-accent-soft);
  }

  .article-select {
    align-items: start;
    background: transparent;
    border: 0;
    color: var(--cp-text);
    cursor: pointer;
    display: grid;
    gap: 8px;
    grid-template-columns: 8px minmax(0, 1fr);
    padding: 11px 8px 11px 12px;
    text-align: left;
  }

  .article-select > span:last-child {
    display: grid;
    gap: 3px;
    min-width: 0;
  }

  .article-select strong {
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .article-select small {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .dot {
    background: var(--cp-warning);
    border-radius: 50%;
    height: 7px;
    margin-top: 3px;
    width: 7px;
  }

  .dot.published {
    background: var(--cp-success);
  }

  .delete {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--cp-text-muted);
    cursor: pointer;
    display: flex;
    height: 32px;
    justify-content: center;
    margin-right: 5px;
    width: 30px;
  }

  .delete:hover {
    color: var(--cp-danger);
  }

  .editor-panel {
    display: grid;
    gap: 14px;
    min-width: 0;
    padding: 15px;
  }

  .editor-heading {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
  }

  .editor-heading h2,
  .comments-panel h2,
  .media-panel h2,
  .structured-panel h2 {
    font-size: 18px;
    margin: 3px 0 0;
  }

  .editor-actions {
    display: flex;
    gap: 7px;
  }

  .meta-form {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .span-2 {
    grid-column: span 2;
  }

  .featured {
    align-items: center;
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    color: var(--cp-text-soft);
    display: flex;
    font-size: 9px;
    gap: 7px;
    min-height: 38px;
    padding: 8px 10px;
  }

  .featured input {
    accent-color: var(--cp-accent);
  }

  .cover-row {
    align-items: center;
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: 150px minmax(0, 1fr);
    padding: 11px;
  }

  .cover-preview {
    align-items: center;
    background: var(--cp-bg-soft);
    border: 1px dashed var(--cp-line-strong);
    border-radius: 7px;
    color: var(--cp-text-muted);
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 88px;
    justify-content: center;
    overflow: hidden;
  }

  .cover-preview img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .cover-preview span {
    font-size: 8px;
  }

  .cover-row > div:last-child {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .cover-row strong {
    font-size: 11px;
  }

  .cover-row p {
    color: var(--cp-text-muted);
    flex-basis: 100%;
    font-size: 9px;
    margin: 0;
  }

  .cover-row label input {
    display: none;
  }

  .comments-panel,
  .media-panel,
  .structured-panel {
    overflow: hidden;
  }

  .comment-list {
    display: grid;
  }

  .comment-list > article {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    display: grid;
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 14px;
  }

  .comment-list > article > div:first-child {
    display: grid;
    gap: 5px;
  }

  .comment-list strong {
    font-size: 11px;
  }

  .comment-list small {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .comment-list p {
    color: var(--cp-text-soft);
    font-size: 10px;
    line-height: 1.65;
    margin: 0;
  }

  .comment-actions {
    display: flex;
    gap: 6px;
  }

  .media-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding: 14px;
  }

  .media-grid article {
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    display: grid;
    gap: 8px;
    overflow: hidden;
    padding: 8px;
  }

  .media-grid img {
    aspect-ratio: 4 / 3;
    border-radius: 5px;
    object-fit: cover;
    width: 100%;
  }

  .media-grid div {
    display: grid;
    gap: 3px;
  }

  .media-grid strong {
    font-size: 9px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .media-grid small {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .structured-list {
    display: grid;
  }

  .structured-list article {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    display: grid;
    gap: 10px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    padding: 13px 14px;
  }

  .structured-list article div {
    display: grid;
    gap: 3px;
  }

  .structured-list strong {
    font-size: 10px;
  }

  .structured-list small,
  .structured-list article > span:last-child {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  .structured-panel {
    overflow: visible;
  }

  .structured-head-actions,
  .structured-cover-actions {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .structured-layout {
    display: grid;
    gap: 0;
    grid-template-columns: 330px minmax(0, 1fr);
    min-width: 0;
  }

  .structured-list {
    border-right: 1px solid var(--cp-line);
    max-height: calc(100vh - 245px);
    overflow: auto;
  }

  .structured-list article {
    align-items: center;
    border-bottom: 1px solid var(--cp-line);
    display: grid;
    gap: 4px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 0;
  }

  .structured-list article.active {
    background: var(--cp-accent-soft);
  }

  .structured-select {
    background: transparent;
    border: 0;
    color: var(--cp-text);
    cursor: pointer;
    display: grid;
    gap: 6px;
    justify-items: start;
    min-width: 0;
    padding: 12px;
    text-align: left;
  }

  .structured-select > span:last-child {
    display: grid;
    gap: 3px;
    max-width: 100%;
    min-width: 0;
  }

  .structured-select strong,
  .structured-select small {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .structured-editor {
    display: grid;
    gap: 13px;
    min-width: 0;
    padding: 15px;
  }

  .structured-editor .editor-heading h3 {
    font-size: 18px;
    margin: 3px 0 0;
  }

  .structured-form {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .structured-markdown {
    font-family: "Cascadia Code", Consolas, monospace;
    line-height: 1.65;
    min-height: 210px;
    resize: vertical;
  }

  .structured-metadata {
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 10px;
    line-height: 1.55;
    resize: vertical;
  }

  .structured-cover-actions img {
    aspect-ratio: 4 / 3;
    border: 1px solid var(--cp-line);
    border-radius: 6px;
    height: 64px;
    object-fit: cover;
  }

  .structured-cover-actions > span {
    color: var(--cp-text-muted);
    font-size: 8px;
  }

  @media (max-width: 1050px) {
    .studio-layout {
      grid-template-columns: 1fr;
    }

    .article-list {
      max-height: 330px;
      position: static;
    }

    .media-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .structured-layout {
      grid-template-columns: 1fr;
    }

    .structured-list {
      border-bottom: 1px solid var(--cp-line);
      border-right: 0;
      max-height: 310px;
    }
  }

  @media (max-width: 760px) {
    .studio-head,
    .editor-heading,
    .comment-list > article {
      align-items: flex-start;
      flex-direction: column;
    }

      .studio-stats,
      .meta-form,
      .media-grid,
      .structured-form {
        grid-template-columns: 1fr 1fr;
      }

    .span-2 {
      grid-column: 1 / -1;
    }

    .comment-list > article {
      display: flex;
    }
  }

  @media (max-width: 520px) {
      .studio-stats,
      .meta-form,
      .media-grid,
      .cover-row,
      .structured-form {
        grid-template-columns: 1fr;
      }

    .editor-actions,
    .studio-tabs {
      flex-wrap: wrap;
    }
  }
</style>
