<script lang="ts">
  import { onMount } from 'svelte';
  import { Check, ChevronDown } from 'lucide-svelte';
  import { api } from '../lib/api';
  import type { Store as StoreItem } from '../lib/types';

  let stores: StoreItem[] = [];
  let selectedId = 0;
  let open = false;
  let root: HTMLDivElement;
  let loading = true;

  function selectStore(store: StoreItem) {
    selectedId = store.id;
    localStorage.setItem('crosspilot-store', String(store.id));
    document.documentElement.dataset.activeStore = String(store.id);
    window.dispatchEvent(new CustomEvent('crosspilot:store-change', { detail: store }));
    open = false;
  }

  function handleDocumentClick(event: MouseEvent) {
    if (root && !root.contains(event.target as Node)) open = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
      root?.querySelector<HTMLButtonElement>('.cp-store-picker-trigger')?.focus();
    }
  }

  onMount(async () => {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    try {
      const data = await api<{ items: StoreItem[] }>('/api/stores');
      stores = data.items || [];
      const saved = Number(localStorage.getItem('crosspilot-store'));
      selectedId = stores.some((store) => store.id === saved) ? saved : stores[0]?.id || 0;
      const selected = stores.find((store) => store.id === selectedId);
      if (selected) {
        document.documentElement.dataset.activeStore = String(selected.id);
        window.dispatchEvent(new CustomEvent('crosspilot:store-change', { detail: selected }));
      }
    } finally {
      loading = false;
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  $: selected = stores.find((store) => store.id === selectedId) || null;
</script>

<div class:open class="project-switcher cp-store-picker" bind:this={root}>
  <span class="cp-store-picker-label">当前店铺</span>
  <button
    class="cp-store-picker-trigger"
    type="button"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls="global-store-menu"
    onclick={() => (open = !open)}
  >
    <span class="cp-store-picker-value">
      {#if loading}
        加载中
      {:else if selected}
        {selected.name}<small>{selected.platform} · {selected.market}</small>
      {:else}
        未选择店铺
      {/if}
    </span>
    <ChevronDown class="nav-tools-caret" size={15} aria-hidden="true" />
  </button>
  <div class="cp-store-picker-menu" id="global-store-menu" role="listbox" aria-label="切换当前店铺" hidden={!open}>
    {#each stores as store (store.id)}
      <button
        type="button"
        role="option"
        aria-selected={store.id === selectedId}
        onclick={() => selectStore(store)}
      >
        <span>
          <strong>{store.name}</strong>
          <small>{store.platform} · {store.market} · {store.currency}</small>
        </span>
        {#if store.id === selectedId}<Check size={14} aria-hidden="true" />{/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .cp-store-picker-label {
    align-self: center;
    flex: 0 0 auto;
  }

  .cp-store-picker-value {
    display: grid;
    gap: 1px;
  }

  .cp-store-picker-value small {
    color: rgba(219, 234, 244, 0.62);
    font-size: 9px;
    font-weight: 650;
  }

  :global(html[data-theme="light"]) .cp-store-picker-value small {
    color: rgba(29, 60, 80, 0.6);
  }
</style>
