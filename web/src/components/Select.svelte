<script lang="ts">
  import { onMount } from 'svelte';
  import { Check, ChevronDown } from 'lucide-svelte';

  type Option = { value: string; label: string; description?: string };

  export let value = '';
  export let options: Option[] = [];
  export let label = '选择';
  export let onchange: (value: string) => void = () => {};

  let root: HTMLDivElement;
  let open = false;
  let activeIndex = -1;

  $: selected = options.find((option) => option.value === value) || options[0] || null;

  function openMenu() {
    open = true;
    activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  }

  function choose(option: Option) {
    value = option.value;
    onchange(option.value);
    open = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === 'Escape') {
      open = false;
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(options.length - 1, activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (options[activeIndex]) choose(options[activeIndex]);
    }
  }

  function handleDocumentClick(event: MouseEvent) {
    if (root && !root.contains(event.target as Node)) open = false;
  }

  onMount(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  });
</script>

<div class="select" bind:this={root} onkeydown={handleKeydown}>
  <button
    type="button"
    class="select-trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={label}
    onclick={() => (open ? (open = false) : openMenu())}
  >
    <span>{selected?.label || '请选择'}</span>
    <ChevronDown class={`select-caret ${open ? 'open' : ''}`} size={14} aria-hidden="true" />
  </button>
  {#if open}
    <div class="select-menu cp-scroll" role="listbox" aria-label={label}>
      {#each options as option, index (option.value)}
        <button
          type="button"
          role="option"
          aria-selected={option.value === value}
          class:active={index === activeIndex}
          onmouseenter={() => (activeIndex = index)}
          onclick={() => choose(option)}
        >
          <span><strong>{option.label}</strong>{#if option.description}<small>{option.description}</small>{/if}</span>
          {#if option.value === value}<Check size={13} aria-hidden="true" />{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .select {
    position: relative;
    width: 100%;
  }

  .select-trigger {
    align-items: center;
    background: color-mix(in srgb, var(--cp-surface-strong) 88%, transparent);
    border: 1px solid var(--cp-line);
    border-radius: 7px;
    color: var(--cp-text);
    cursor: pointer;
    display: flex;
    font-size: 10px;
    justify-content: space-between;
    min-height: 38px;
    padding: 8px 11px;
    text-align: left;
    width: 100%;
  }

  .select-caret {
    flex: 0 0 auto;
    transform: rotate(0);
    transition: transform 160ms ease;
  }

  .select-trigger:hover .select-caret,
  .select-caret.open {
    transform: rotate(180deg);
  }

  .select-menu {
    background: var(--cp-surface-strong);
    border: 1px solid var(--cp-line-strong);
    border-radius: 8px;
    box-shadow: var(--cp-shadow);
    display: grid;
    gap: 3px;
    left: 0;
    margin-top: 6px;
    max-height: 260px;
    min-width: 100%;
    overflow: auto;
    padding: 5px;
    position: absolute;
    top: 100%;
    z-index: 90;
  }

  .select-menu button {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: var(--cp-text);
    cursor: pointer;
    display: flex;
    gap: 8px;
    justify-content: space-between;
    min-height: 36px;
    padding: 7px 9px;
    text-align: left;
  }

  .select-menu button.active,
  .select-menu button[aria-selected="true"] {
    background: var(--cp-accent-soft);
    border-color: color-mix(in srgb, var(--cp-accent) 22%, transparent);
  }

  .select-menu button span {
    display: grid;
    gap: 1px;
  }

  .select-menu strong {
    font-size: 10px;
    font-weight: 720;
  }

  .select-menu small {
    color: var(--cp-text-muted);
    font-size: 8px;
  }
</style>
