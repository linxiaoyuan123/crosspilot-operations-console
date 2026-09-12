const STORAGE_KEYS = {
  colorMode: 'crosspilot-color-mode',
  hue: 'crosspilot-theme-hue',
  density: 'crosspilot-density',
  cardBorder: 'crosspilot-card-border',
  followTheme: 'crosspilot-follow-theme',
  wallpaper: 'crosspilot-wallpaper-mode',
  fullscreenLayout: 'crosspilot-fullscreen-layout',
  overlayBlur: 'crosspilot-overlay-blur',
  cardOpacity: 'crosspilot-card-opacity',
  bannerTitle: 'crosspilot-banner-title',
  carousel: 'crosspilot-carousel',
  waves: 'crosspilot-waves',
  gradient: 'crosspilot-gradient',
  sakura: 'crosspilot-sakura',
  typewriter: 'crosspilot-typewriter',
  visualVersion: 'crosspilot-visual-settings-version',
  musicVolume: 'crosspilot-music-volume'
};

const DEFAULT_SETTINGS = {
  density: 'comfortable',
  cardBorder: false,
  followTheme: true,
  wallpaper: 'fullscreen',
  fullscreenLayout: 'classic',
  overlayBlur: 10,
  cardOpacity: 60,
  bannerTitle: true,
  carousel: true,
  waves: true,
  gradient: true,
  sakura: true,
  typewriter: true
};

const VIEW_SEARCH_INDEX = [
  { title: '运营总览', description: '利润、广告、库存、退货和待执行动作', view: 'overview', type: '模块', keywords: 'dashboard 总览 经营 利润 kpi' },
  { title: '数据导入', description: 'CSV、XLSX、字段映射、错误行和 PII 跳过', view: 'imports', type: '模块', keywords: 'excel 报表 上传 导入 csv xlsx 字段映射' },
  { title: 'Listing 与商品', description: 'Listing 六维评分、文案骨架和图片需求', view: 'listings', type: '模块', keywords: 'listing 商品 sku 标题 五点 图片 关键词' },
  { title: '广告与流量', description: 'ACOS、TACOS、ROAS、搜索词和投放建议', view: 'ads', type: '模块', keywords: '广告 流量 acos tacos roas 搜索词 否词' },
  { title: '库存与履约', description: '可售天数、补货量、缺货和滞销风险', view: 'inventory', type: '模块', keywords: '库存 fba 补货 缺货 滞销 履约 周转' },
  { title: '售后与账号', description: '退货、差评、买家消息、ODR 和账号健康', view: 'aftersales', type: '模块', keywords: '售后 账号 退货 差评 消息 索赔 odr 迟发' },
  { title: '运营复盘', description: '日报、周报、月报和多格式报告导出', view: 'reviews', type: '模块', keywords: '复盘 报告 导出 html markdown csv xlsx 知识库' }
];
const settings = { ...DEFAULT_SETTINGS };
const VISUAL_SETTINGS_VERSION = '2';
let searchIndex = [];
let searchIndexStoreId = null;
let activeSearchIndex = -1;
let activePanel = null;
const panelTimers = new WeakMap();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => Array.from(document.querySelectorAll(selector));

initEnhancements();

function initEnhancements() {
  applyStoredSettings();
  initSearch();
  initMusicPlayer();
  initHeroVideo();
  initThemeCustomizer();
  initColorMode();
  initPopoverDismissal();
  initWallpaperMotion();
}

function readBoolean(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : stored === 'true';
  } catch {
    return fallback;
  }
}

function writeSetting(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

function readSetting(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function applyStoredSettings() {
  settings.density = readSetting(STORAGE_KEYS.density, DEFAULT_SETTINGS.density) === 'compact' ? 'compact' : 'comfortable';
  settings.cardBorder = readBoolean(STORAGE_KEYS.cardBorder, DEFAULT_SETTINGS.cardBorder);
  settings.followTheme = readBoolean(STORAGE_KEYS.followTheme, DEFAULT_SETTINGS.followTheme);
  settings.wallpaper = readSetting(STORAGE_KEYS.wallpaper, DEFAULT_SETTINGS.wallpaper);
  const legacyWallpaper = { immersive: 'fullscreen', compact: 'banner', solid: 'none' }[settings.wallpaper];
  if (legacyWallpaper) settings.wallpaper = legacyWallpaper;
  settings.fullscreenLayout = readSetting(STORAGE_KEYS.fullscreenLayout, DEFAULT_SETTINGS.fullscreenLayout);
  settings.overlayBlur = Number(readSetting(STORAGE_KEYS.overlayBlur, DEFAULT_SETTINGS.overlayBlur));
  settings.cardOpacity = Number(readSetting(STORAGE_KEYS.cardOpacity, DEFAULT_SETTINGS.cardOpacity));
  settings.bannerTitle = readBoolean(STORAGE_KEYS.bannerTitle, DEFAULT_SETTINGS.bannerTitle);
  settings.carousel = readBoolean(STORAGE_KEYS.carousel, DEFAULT_SETTINGS.carousel);
  settings.waves = readBoolean(STORAGE_KEYS.waves, DEFAULT_SETTINGS.waves);
  settings.gradient = readBoolean(STORAGE_KEYS.gradient, DEFAULT_SETTINGS.gradient);
  settings.sakura = readBoolean(STORAGE_KEYS.sakura, DEFAULT_SETTINGS.sakura);
  settings.typewriter = readBoolean(STORAGE_KEYS.typewriter, DEFAULT_SETTINGS.typewriter);
  if (!['banner', 'fullscreen', 'overlay', 'none'].includes(settings.wallpaper)) settings.wallpaper = DEFAULT_SETTINGS.wallpaper;
  if (!['classic', 'hero'].includes(settings.fullscreenLayout)) settings.fullscreenLayout = DEFAULT_SETTINGS.fullscreenLayout;
  settings.overlayBlur = Number.isFinite(settings.overlayBlur) ? Math.min(20, Math.max(0, settings.overlayBlur)) : DEFAULT_SETTINGS.overlayBlur;
  settings.cardOpacity = Number.isFinite(settings.cardOpacity) ? Math.min(100, Math.max(20, settings.cardOpacity)) : DEFAULT_SETTINGS.cardOpacity;
  migrateLegacyVisualDefaults();
  applyVisualSettings();
  syncSettingControls();
}

function migrateLegacyVisualDefaults() {
  if (readSetting(STORAGE_KEYS.visualVersion, '1') === VISUAL_SETTINGS_VERSION) return;
  const storedBlur = readSetting(STORAGE_KEYS.overlayBlur, null);
  const storedCardOpacity = readSetting(STORAGE_KEYS.cardOpacity, null);
  if (storedBlur !== null && Number(storedBlur) === 0) {
    settings.overlayBlur = DEFAULT_SETTINGS.overlayBlur;
    writeSetting(STORAGE_KEYS.overlayBlur, settings.overlayBlur);
  }
  if (storedCardOpacity !== null && Number(storedCardOpacity) === 100) {
    settings.cardOpacity = DEFAULT_SETTINGS.cardOpacity;
    writeSetting(STORAGE_KEYS.cardOpacity, settings.cardOpacity);
  }
  writeSetting(STORAGE_KEYS.visualVersion, VISUAL_SETTINGS_VERSION);
}

function applyVisualSettings() {
  const root = document.documentElement;
  root.classList.toggle('cp-density-compact', settings.density === 'compact');
  root.classList.toggle('cp-card-border', settings.cardBorder);
  root.classList.toggle('cp-follow-theme', settings.followTheme);
  root.classList.toggle('cp-banner-title-off', !settings.bannerTitle);
  root.classList.toggle('cp-carousel-off', !settings.carousel);
  root.classList.toggle('cp-waves-off', !settings.waves);
  root.classList.toggle('cp-gradient-off', !settings.gradient);
  root.classList.toggle('cp-sakura-off', !settings.sakura);
  root.classList.toggle('cp-typewriter-off', !settings.typewriter);
  root.dataset.wallpaperMode = settings.wallpaper;
  root.dataset.fullscreenLayout = settings.fullscreenLayout;
  root.style.setProperty('--cp-overlay-blur', `${settings.overlayBlur}px`);
  root.style.setProperty('--cp-card-opacity', String(settings.cardOpacity / 100));
  root.classList.toggle('cp-card-opacity-custom', settings.cardOpacity < 100);
  root.classList.toggle('cp-wallpaper-overlay', settings.wallpaper === 'overlay');
  root.classList.toggle('cp-wallpaper-none', settings.wallpaper === 'none');
  root.classList.toggle('cp-fullscreen-hero', settings.wallpaper === 'fullscreen' && settings.fullscreenLayout === 'hero');
  syncHeaderClearance();
  updateWallpaperMotion();
  syncVideoAvailability();
}

function initWallpaperMotion() {
  let scheduled = false;
  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      syncHeaderClearance();
      updateWallpaperMotion();
    });
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  const header = getElement('.app-header');
  if (header && 'ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(header);
  requestUpdate();
}

function syncHeaderClearance() {
  const header = getElement('.app-header');
  if (!header) return;
  const gap = window.matchMedia('(max-width: 760px)').matches ? 18 : 24;
  const clearance = Math.max(92, Math.ceil(header.getBoundingClientRect().height) + gap);
  document.documentElement.style.setProperty('--cp-header-clearance', `${clearance}px`);
}

function updateWallpaperMotion() {
  const root = document.documentElement;
  const isHero = settings.wallpaper === 'fullscreen' && settings.fullscreenLayout === 'hero';
  if (!isHero) {
    root.style.setProperty('--cp-fullscreen-blur', '0px');
    root.style.setProperty('--cp-hero-copy-shift', '0px');
    root.style.setProperty('--cp-hero-copy-opacity', '1');
    return;
  }

  const scrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop || 0);
  const blurProgress = Math.min(1, scrollY / 300);
  const blur = Math.floor((blurProgress * settings.overlayBlur) / 2) * 2;
  const fadeDistance = Math.max(1, window.innerHeight * 0.5);
  const fadeProgress = Math.min(1, scrollY / fadeDistance);
  root.style.setProperty('--cp-fullscreen-blur', `${blur}px`);
  root.style.setProperty('--cp-hero-copy-shift', `${-scrollY}px`);
  root.style.setProperty('--cp-hero-copy-opacity', String(1 - fadeProgress));
}

function syncSettingControls() {
  getElements('[data-cp-setting]').forEach((button) => {
    const key = button.dataset.cpSetting;
    const value = Boolean(settings[key]);
    button.setAttribute('aria-pressed', String(value));
  });
  getElements('[data-cp-wallpaper]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.cpWallpaper === settings.wallpaper));
  });
  getElements('[data-cp-density]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.cpDensity === settings.density));
  });
  getElements('[data-cp-layout]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.cpLayout === settings.fullscreenLayout));
  });
  const overlayBlur = getElement('#cp-overlay-blur');
  const overlayBlurValue = getElement('#cp-overlay-blur-value');
  const cardOpacity = getElement('#cp-card-opacity');
  const cardOpacityValue = getElement('#cp-card-opacity-value');
  if (overlayBlur) overlayBlur.value = String(settings.overlayBlur);
  if (overlayBlurValue) overlayBlurValue.textContent = `${settings.overlayBlur.toFixed(1)}px`;
  if (cardOpacity) cardOpacity.value = String(settings.cardOpacity);
  if (cardOpacityValue) cardOpacityValue.textContent = `${Math.round(settings.cardOpacity)}%`;
  const showLayout = settings.wallpaper === 'fullscreen';
  getElement('[data-cp-layout-heading]')?.toggleAttribute('hidden', !showLayout);
  getElement('[data-cp-layout-group]')?.toggleAttribute('hidden', !showLayout);
  const showTransparency = settings.wallpaper === 'overlay' || (settings.wallpaper === 'fullscreen' && settings.fullscreenLayout === 'hero');
  getElement('[data-cp-transparency-heading]')?.toggleAttribute('hidden', !showTransparency);
  getElement('[data-cp-transparency-group]')?.toggleAttribute('hidden', !showTransparency);
  const showBannerSettings = settings.wallpaper === 'banner' || settings.wallpaper === 'fullscreen';
  getElement('[data-cp-banner-heading]')?.toggleAttribute('hidden', !showBannerSettings);
  const bannerSettingKeys = new Set(['bannerTitle', 'carousel', 'waves', 'gradient']);
  getElements('[data-cp-setting]').forEach((button) => {
    if (bannerSettingKeys.has(button.dataset.cpSetting)) button.hidden = !showBannerSettings;
  });
}

function initSearch() {
  const wrap = getElement('.cp-global-search');
  const input = getElement('#cp-global-search-input');
  const clear = getElement('#cp-global-search-clear');
  const panel = getElement('#cp-search-panel');
  if (!wrap || !input || !panel) return;

  const openPanel = () => {
    clearTimeout(panelTimers.get(panel));
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    input.setAttribute('aria-expanded', 'true');
    closeActivePanel();
  };
  const closePanel = () => {
    panel.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    activeSearchIndex = -1;
    clearTimeout(panelTimers.get(panel));
    panelTimers.set(panel, window.setTimeout(() => {
      if (!panel.classList.contains('is-open')) panel.hidden = true;
    }, reduceMotion ? 0 : 180));
  };

  const render = (query) => {
    const normalized = query.trim().toLowerCase();
    clear.hidden = !normalized;
    if (!normalized) {
      panel.innerHTML = '<div class="cp-panel-empty"><strong>快速定位</strong><span>输入模块、SKU、动作或运营知识。</span></div>';
      openPanel();
      return;
    }
    const matches = searchIndex
      .map((item) => ({ ...item, score: searchScore(item, normalized) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    activeSearchIndex = matches.length ? 0 : -1;
    panel.innerHTML = matches.length
      ? matches.map((item, index) => `
          <button class="cp-search-result${index === activeSearchIndex ? ' is-active' : ''}" type="button" role="option" data-search-view="${item.view}" data-search-index="${index}"${item.productId ? ` data-search-product-id="${item.productId}"` : ''}${item.actionId ? ` data-search-action-id="${item.actionId}"` : ''}${item.knowledgeId ? ` data-search-knowledge-id="${item.knowledgeId}"` : ''} aria-selected="${index === activeSearchIndex}">
            <span class="cp-search-type">${escapeHtml(item.type)}</span>
            <span class="cp-search-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description || '')}</small></span>
            <span class="cp-search-arrow" aria-hidden="true">→</span>
          </button>`).join('')
      : '<div class="cp-panel-empty"><strong>没有找到匹配结果</strong><span>可以尝试搜索“广告”“库存”“SKU”或“复盘”。</span></div>';
    openPanel();
  };

  const selectResult = (button) => {
    if (!button) return;
    const view = button.dataset.searchView;
    const productId = button.dataset.searchProductId || null;
    const actionId = button.dataset.searchActionId || null;
    const knowledgeId = button.dataset.searchKnowledgeId || null;
    closePanel();
    input.value = '';
    clear.hidden = true;
    window.dispatchEvent(new CustomEvent('crosspilot:search-navigate', { detail: { view, productId, actionId, knowledgeId } }));
  };

  input.addEventListener('focus', async () => {
    await ensureSearchIndex();
    render(input.value);
  });
  input.addEventListener('input', async () => {
    await ensureSearchIndex();
    render(input.value);
  });
  input.addEventListener('keydown', (event) => {
    const items = getElements('#cp-search-panel .cp-search-result');
    if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();
      activeSearchIndex = (activeSearchIndex + 1) % items.length;
      syncSearchActive(items);
    }
    if (event.key === 'ArrowUp' && items.length) {
      event.preventDefault();
      activeSearchIndex = (activeSearchIndex - 1 + items.length) % items.length;
      syncSearchActive(items);
    }
    if (event.key === 'Enter' && activeSearchIndex >= 0) {
      event.preventDefault();
      selectResult(items[activeSearchIndex]);
    }
    if (event.key === 'Escape') closePanel();
  });
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('.cp-search-result');
    if (button) selectResult(button);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    render('');
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });
  document.addEventListener('click', (event) => {
    if (!wrap.contains(event.target)) closePanel();
  });
}

function syncSearchActive(items) {
  items.forEach((item, index) => {
    const active = index === activeSearchIndex;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
  });
}

async function ensureSearchIndex() {
  const storeId = Number(getElement('#global-store')?.value || 0) || null;
  if (searchIndex.length && searchIndexStoreId === storeId) return;
  searchIndex = [...VIEW_SEARCH_INDEX];
  searchIndexStoreId = storeId;
  if (!storeId) return;
  try {
    const [products, actions, knowledge] = await Promise.all([
      fetch(`/api/products?storeId=${storeId}`).then((response) => response.json()),
      fetch(`/api/actions?storeId=${storeId}&status=all`).then((response) => response.json()),
      fetch('/api/knowledge').then((response) => response.json())
    ]);
    (products.items || []).forEach((item) => {
      searchIndex.push({
        title: `${item.sku} · ${item.title}`,
        description: `Listing ${item.listing_score} 分 · 净利率 ${item.margin_percent}%`,
        view: 'listings',
        productId: item.id,
        type: 'SKU',
        keywords: `${item.sku} ${item.title} ${item.category || ''} ${item.asin || ''}`
      });
    });
    (actions.items || []).forEach((item) => {
      searchIndex.push({
        title: item.title || '未命名运营动作',
        description: `${item.category || '运营'} · ${statusLabel(item.status)} · ${item.owner || '未分配'}`,
        view: actionView(item.category),
        actionId: item.id,
        type: '动作',
        keywords: `${item.title || ''} ${item.description || ''} ${item.category || ''} ${item.owner || ''}`
      });
    });
    (knowledge.items || []).forEach((item) => {
      searchIndex.push({
        title: item.title,
        description: item.summary || item.category || '运营知识',
        view: 'reviews',
        knowledgeId: item.id,
        type: '知识',
        keywords: `${item.title || ''} ${item.summary || ''} ${item.category || ''} ${item.tags || ''}`
      });
    });
  } catch {}
}

function searchScore(item, query) {
  const haystack = `${item.title} ${item.description || ''} ${item.keywords || ''}`.toLowerCase();
  if (haystack.includes(query)) return query.length + (item.title.toLowerCase().includes(query) ? 8 : 0);
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.length && tokens.every((token) => haystack.includes(token)) ? tokens.length : 0;
}

function actionView(category) {
  return {
    '广告': 'ads',
    '库存': 'inventory',
    'Listing': 'listings',
    '售后': 'aftersales',
    '数据': 'imports'
  }[category] || 'overview';
}

function statusLabel(status) {
  return {
    open: '待处理',
    in_progress: '处理中',
    deferred: '已延期',
    done: '已完成',
    closed: '已关闭',
    ignored: '已忽略'
  }[status] || status || '待确认';
}

function initMusicPlayer() {
  const button = getElement('#cp-music-toggle');
  const panel = getElement('#cp-music-panel');
  const audio = getElement('#cp-audio');
  const playButton = getElement('#cp-music-play');
  const replayButton = getElement('#cp-music-replay');
  const progress = getElement('#cp-music-progress');
  const volume = getElement('#cp-music-volume');
  if (!button || !panel || !audio || !playButton) return;

  const storedVolume = Number(readSetting(STORAGE_KEYS.musicVolume, '0.7'));
  audio.volume = Number.isFinite(storedVolume) ? Math.min(1, Math.max(0, storedVolume)) : 0.7;
  volume.value = String(audio.volume);

  const sync = () => {
    const playing = !audio.paused && !audio.ended;
    button.classList.toggle('is-playing', playing);
    panel.classList.toggle('is-playing', playing);
    getElement('#cp-music-play [data-icon="play"]')?.toggleAttribute('hidden', playing);
    getElement('[data-cp-music-pause-icon]')?.toggleAttribute('hidden', !playing);
    playButton.setAttribute('aria-label', playing ? '暂停音乐' : '播放音乐');
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      progress.value = String((audio.currentTime / audio.duration) * 100);
      getElement('#cp-music-duration').textContent = formatTime(audio.duration);
    }
    getElement('#cp-music-current').textContent = formatTime(audio.currentTime);
  };

  const toggle = async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        showEnhancementToast('浏览器阻止了音乐播放，请再次点击播放键。', 'error');
      }
    } else {
      audio.pause();
    }
    sync();
  };

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePanel(button, panel);
  });
  playButton.addEventListener('click', toggle);
  replayButton.addEventListener('click', () => {
    audio.currentTime = 0;
    sync();
  });
  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
      sync();
    }
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    writeSetting(STORAGE_KEYS.musicVolume, audio.volume);
  });
  audio.addEventListener('loadedmetadata', sync);
  audio.addEventListener('timeupdate', sync);
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  audio.addEventListener('error', () => showEnhancementToast('示例音乐加载失败。', 'error'));
  sync();
}

function initHeroVideo() {
  const button = getElement('#cp-video-toggle');
  const video = getElement('#cp-hero-video');
  if (!button || !video) return;

  const sync = syncHeroVideoState;

  button.addEventListener('click', async () => {
    if (settings.wallpaper === 'none') {
      showEnhancementToast('纯色背景模式下没有播放视频的空间。', 'error');
      return;
    }
    if (!video.src) {
      video.src = video.dataset.src;
      video.load();
    }
    if (video.paused) {
      video.muted = false;
      try {
        await video.play();
      } catch {
        video.muted = true;
        try {
          await video.play();
        } catch {
          showEnhancementToast('背景视频加载失败，请检查网络连接。', 'error');
        }
      }
    } else {
      video.pause();
    }
    sync(!video.paused);
  });
  video.addEventListener('play', () => sync(true));
  video.addEventListener('pause', () => sync(false));
  video.addEventListener('error', () => {
    sync(false);
    showEnhancementToast('背景视频加载失败，请稍后重试。', 'error');
  });
}

function syncHeroVideoState(playing) {
  const button = getElement('#cp-video-toggle');
  if (!button) return;
  document.documentElement.classList.toggle('cp-video-playing', playing);
  button.classList.toggle('is-playing', playing);
  button.setAttribute('aria-pressed', String(playing));
  button.setAttribute('aria-label', playing ? '暂停主页背景视频' : '播放主页背景视频');
  button.title = playing ? '暂停主页背景视频' : '播放主页背景视频';
  button.querySelector('.cp-icon-play')?.toggleAttribute('hidden', playing);
  button.querySelector('.cp-icon-pause')?.toggleAttribute('hidden', !playing);
}

function initThemeCustomizer() {
  const button = getElement('#cp-theme-toggle');
  const panel = getElement('#cp-theme-panel');
  if (!button || !panel) return;

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePanel(button, panel);
  });

  getElements('[data-cp-theme-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const next = tab.dataset.cpThemeTab;
      getElements('[data-cp-theme-tab]').forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.classList.toggle('is-active', active);
      });
      getElements('[data-cp-theme-panel]').forEach((item) => {
        item.hidden = item.dataset.cpThemePanel !== next;
      });
    });
  });

  const hueSlider = getElement('#cp-hue-slider');
  const hueValue = getElement('#cp-hue-value');
  const applyHue = (value, persist = true) => {
    const hue = Math.min(360, Math.max(0, Number(value) || 0));
    setThemeHue(hue);
    hueSlider.value = String(hue);
    hueValue.textContent = String(Math.round(hue));
    hueSlider.style.setProperty('--cp-range-progress', `${(hue / 360) * 100}%`);
    if (persist) writeSetting(STORAGE_KEYS.hue, hue);
  };
  hueSlider.addEventListener('input', () => applyHue(hueSlider.value));
  getElement('#cp-hue-reset').addEventListener('click', () => applyHue(191));

  getElements('[data-cp-density]').forEach((control) => {
    control.addEventListener('click', () => {
      settings.density = control.dataset.cpDensity === 'compact' ? 'compact' : 'comfortable';
      writeSetting(STORAGE_KEYS.density, settings.density);
      applyVisualSettings();
      syncSettingControls();
    });
  });
  getElements('[data-cp-wallpaper]').forEach((control) => {
    control.addEventListener('click', () => {
      settings.wallpaper = control.dataset.cpWallpaper;
      writeSetting(STORAGE_KEYS.wallpaper, settings.wallpaper);
      applyVisualSettings();
      syncSettingControls();
    });
  });
  getElements('[data-cp-layout]').forEach((control) => {
    control.addEventListener('click', () => {
      settings.fullscreenLayout = control.dataset.cpLayout === 'hero' ? 'hero' : 'classic';
      writeSetting(STORAGE_KEYS.fullscreenLayout, settings.fullscreenLayout);
      applyVisualSettings();
      syncSettingControls();
    });
  });
  const overlayBlur = getElement('#cp-overlay-blur');
  overlayBlur?.addEventListener('input', () => {
    settings.overlayBlur = Math.min(20, Math.max(0, Number(overlayBlur.value) || 0));
    writeSetting(STORAGE_KEYS.overlayBlur, settings.overlayBlur);
    applyVisualSettings();
    syncSettingControls();
  });
  const cardOpacity = getElement('#cp-card-opacity');
  cardOpacity?.addEventListener('input', () => {
    settings.cardOpacity = Math.min(100, Math.max(20, Number(cardOpacity.value) || 100));
    writeSetting(STORAGE_KEYS.cardOpacity, settings.cardOpacity);
    applyVisualSettings();
    syncSettingControls();
  });
  getElements('[data-cp-setting]').forEach((control) => {
    control.addEventListener('click', () => {
      const key = control.dataset.cpSetting;
      settings[key] = !settings[key];
      writeSetting(STORAGE_KEYS[key], settings[key]);
      applyVisualSettings();
      syncSettingControls();
    });
  });

  const storedHue = Number(readSetting(STORAGE_KEYS.hue, '191'));
  applyHue(Number.isFinite(storedHue) ? storedHue : 191, false);
  syncSettingControls();
}

function setThemeHue(hue) {
  const root = document.documentElement;
  const light = root.dataset.theme === 'light';
  const accentLightness = light ? 46 : 67;
  const strongLightness = light ? 37 : 56;
  root.style.setProperty('--theme-hue', String(hue));
  root.style.setProperty('--accent', `hsl(${hue} 88% ${accentLightness}%)`);
  root.style.setProperty('--accent-strong', `hsl(${hue} 90% ${strongLightness}%)`);
  root.style.setProperty('--accent-soft', `hsl(${hue} 88% ${light ? 42 : 67}% / 0.12)`);
  root.style.setProperty('--cp-theme-glow', `hsl(${hue} 88% ${light ? 50 : 67}% / 0.42)`);
}

function initColorMode() {
  const button = getElement('#cp-color-mode-toggle');
  const panel = getElement('#cp-color-mode-panel');
  if (!button || !panel) return;
  const initialMode = readSetting(STORAGE_KEYS.colorMode, 'dark');
  applyColorMode(['light', 'dark', 'system'].includes(initialMode) ? initialMode : 'dark', false);
  bindSystemThemeListener();

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    togglePanel(button, panel);
  });
  getElements('[data-cp-color-mode]').forEach((control) => {
    control.addEventListener('click', (event) => {
      const mode = control.dataset.cpColorMode;
      applyColorMode(mode, true, event.currentTarget);
      closePanel(button, panel);
    });
  });
}

function applyColorMode(mode, animate = true, originElement = null) {
  const update = () => {
    const resolved = resolveColorMode(mode);
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#07111f' : '#eef4f8');
    setThemeHue(Number(readSetting(STORAGE_KEYS.hue, '191')));
    updateColorModeControls(mode, resolved);
    window.dispatchEvent(new CustomEvent('crosspilot:theme-change', { detail: { mode, resolved } }));
  };

  writeSetting(STORAGE_KEYS.colorMode, mode);
  if (!animate || reduceMotion || !document.startViewTransition) {
    update();
    return;
  }
  if (originElement) {
    const rect = originElement.getBoundingClientRect();
    document.documentElement.style.setProperty('--cp-theme-origin-x', `${rect.left + rect.width / 2}px`);
    document.documentElement.style.setProperty('--cp-theme-origin-y', `${rect.top + rect.height / 2}px`);
  }
  document.startViewTransition(update);
}

function resolveColorMode(mode) {
  if (mode === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return mode === 'light' ? 'light' : 'dark';
}

function bindSystemThemeListener() {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', () => {
    if (document.documentElement.dataset.themeMode === 'system') applyColorMode('system', true);
  });
}

function updateColorModeControls(mode, resolved) {
  getElements('[data-cp-color-mode]').forEach((control) => {
    control.setAttribute('aria-checked', String(control.dataset.cpColorMode === mode));
  });
  getElement('.cp-mode-dark')?.toggleAttribute('hidden', resolved !== 'dark');
  getElement('.cp-mode-light')?.toggleAttribute('hidden', resolved !== 'light');
  getElement('#cp-color-mode-toggle')?.setAttribute('aria-label', resolved === 'dark' ? '切换到亮色主题' : '切换到暗色主题');
}

function initPopoverDismissal() {
  document.addEventListener('click', (event) => {
    if (activePanel && !activePanel.panel.contains(event.target) && !activePanel.button.contains(event.target)) {
      closePanel(activePanel.button, activePanel.panel);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) closePanel(activePanel.button, activePanel.panel);
  });
}

function togglePanel(button, panel) {
  if (!button || !panel) return;
  const isOpen = panel.classList.contains('is-open');
  if (isOpen) {
    closePanel(button, panel);
    return;
  }
  closePanel(activePanel?.button, activePanel?.panel);
  clearTimeout(panelTimers.get(panel));
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  button.setAttribute('aria-expanded', 'true');
  activePanel = { button, panel };
}

function closePanel(button, panel) {
  if (!button || !panel) return;
  panel.classList.remove('is-open');
  button.setAttribute('aria-expanded', 'false');
  if (activePanel?.panel === panel) activePanel = null;
  clearTimeout(panelTimers.get(panel));
  panelTimers.set(panel, window.setTimeout(() => {
    if (!panel.classList.contains('is-open')) panel.hidden = true;
  }, reduceMotion ? 0 : 180));
}

function closeActivePanel() {
  if (activePanel) closePanel(activePanel.button, activePanel.panel);
}

function syncVideoAvailability() {
  const button = getElement('#cp-video-toggle');
  if (!button) return;
  const disabled = settings.wallpaper === 'none';
  button.disabled = disabled;
  button.title = disabled ? '纯色背景模式下不可播放视频' : '播放主页背景视频';
  if (disabled) {
    getElement('#cp-hero-video')?.pause();
    syncHeroVideoState(false);
  }
}

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showEnhancementToast(message, type = 'success') {
  const stack = getElement('#toast-root');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3600);
}
