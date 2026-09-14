<script lang="ts">
  import { onMount } from 'svelte';
  import { Monitor, Moon, Sun } from 'lucide-svelte';

  type Mode = 'light' | 'dark' | 'system';
  let mode: Mode = 'dark';
  let open = false;
  let root: HTMLDivElement;

  function applyMode(next: Mode) {
    mode = next;
    localStorage.setItem('crosspilot-color-mode', mode);
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    open = false;
  }

  function handleClick(event: MouseEvent) {
    if (root && !root.contains(event.target as Node)) open = false;
  }

  onMount(() => {
    const saved = (localStorage.getItem('crosspilot-color-mode') || 'dark') as Mode;
    applyMode(['light', 'dark', 'system'].includes(saved) ? saved : 'dark');
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });
</script>

<div class="mode-control" bind:this={root}>
  <button class="icon-button" type="button" aria-label="切换日夜主题" aria-expanded={open} onclick={() => (open = !open)}>
    {#if mode === 'light'}<Sun size={16} />{:else if mode === 'system'}<Monitor size={16} />{:else}<Moon size={16} />{/if}
  </button>
  {#if open}
    <div class="mode-menu" role="menu">
      <button type="button" role="menuitemradio" aria-checked={mode === 'light'} onclick={() => applyMode('light')}><Sun size={14} />亮色</button>
      <button type="button" role="menuitemradio" aria-checked={mode === 'dark'} onclick={() => applyMode('dark')}><Moon size={14} />暗色</button>
      <button type="button" role="menuitemradio" aria-checked={mode === 'system'} onclick={() => applyMode('system')}><Monitor size={14} />跟随系统</button>
    </div>
  {/if}
</div>

<style>
  .mode-control {
    position: relative;
  }

  .icon-button {
    align-items: center;
    background: var(--cp-surface-muted);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    color: var(--cp-text);
    cursor: pointer;
    display: inline-flex;
    height: 40px;
    justify-content: center;
    width: 40px;
  }

  .mode-menu {
    background: var(--cp-surface-strong);
    border: 1px solid var(--cp-line-strong);
    border-radius: 8px;
    box-shadow: var(--cp-shadow);
    display: grid;
    gap: 4px;
    min-width: 138px;
    padding: 6px;
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 90;
  }

  .mode-menu button {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: var(--cp-text);
    cursor: pointer;
    display: flex;
    font-size: 10px;
    gap: 8px;
    min-height: 34px;
    padding: 7px 9px;
    text-align: left;
  }

  .mode-menu button:hover,
  .mode-menu button[aria-checked="true"] {
    background: var(--cp-accent-soft);
    color: var(--cp-accent);
  }
</style>
